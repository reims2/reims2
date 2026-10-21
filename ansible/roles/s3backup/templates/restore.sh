#!/bin/bash
{{ ansible_managed | comment }}
# Restores an S3 backup (default: the newest) into a freshly deployed box:
# data into the {{ stack }} MariaDB, grafana.db into Grafana.
# Usage: restore.sh [backup key]
set -eo pipefail

work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT

s3() {
  docker run --rm -e AWS_ACCESS_KEY_ID={{ aws_key_id }} -e AWS_SECRET_ACCESS_KEY={{ aws_secret_key }} \
    -v "$work:/work" --entrypoint aws dokku/s3backup:{{ s3backup_version }} "$@"
}
db() {
  docker compose exec -T mariadb sh -c 'exec mariadb -uroot -p"$MARIADB_ROOT_PASSWORD" "$MARIADB_DATABASE" "$@"' sh "$@"
}

cd /srv/{{ stack }}
existing=$(db -N -e "select count(*) from glasses")
# the dump only inserts rows, so it needs an empty DB
if [ "$existing" -ne 0 ]; then
  echo "glasses already has $existing rows, run 'docker compose down -v' here and deploy again first" >&2
  exit 1
fi

key=${1:-$(s3 s3 ls "s3://{{ aws_bucket_name }}/" | awk '{print $4}' | grep '^reims2-backup-.*\.tgz$' | sort | tail -1)}
echo "Restoring $key"
s3 s3 cp --quiet "s3://{{ aws_bucket_name }}/$key" "/work/$key"
tar -xzf "$work/$key" -C "$work"

docker compose stop backend
# Flyway filled its history on first start, the dump brings the real rows
db -e "delete from flyway_schema_history"
db < "$work/backup/dump.sql"
docker compose up -d --wait backend

if [ -f "$work/backup/grafana.db" ]; then
  cd /srv/monitoring
  docker compose stop grafana
  install -m 640 -o 472 -g 0 "$work/backup/grafana.db" {{ s3backup_grafana_db }}
  docker compose up -d --wait grafana
fi
echo "Restored $key"
