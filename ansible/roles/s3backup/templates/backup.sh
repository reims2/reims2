#!/bin/bash
{{ ansible_managed | comment }}
set -e

healthcheck_url="{{ s3backup_healthcheck_url }}"
ping_healthcheck() {
  if [ -n "$healthcheck_url" ]; then
    curl -fsS -m 10 --retry 3 -o /dev/null "$healthcheck_url$1" || true
  fi
}
trap 'ping_healthcheck /fail' ERR

rm -rf {{ s3backup_data_location }} || true
mkdir -m 700 -p {{ s3backup_data_location }}

cd /srv/{{ stack }}

# a fresh box has no glasses yet, uploading that would make an empty backup the newest one
glasses=$(docker compose exec -T mariadb sh -c 'exec mariadb -uroot -p"$MARIADB_ROOT_PASSWORD" "$MARIADB_DATABASE" -N -e "select count(*) from glasses"')
if [ "$glasses" -eq 0 ]; then
  echo "glasses is empty, refusing to back up" >&2
  false
fi

docker compose exec -T mariadb sh -c 'exec mariadb-dump "$MARIADB_DATABASE" --ignore-table="$MARIADB_DATABASE.roles" --complete-insert --no-create-info -uroot -p"$MARIADB_ROOT_PASSWORD"' > {{ s3backup_data_location }}/dump.sql

if [ -f "{{ s3backup_grafana_db }}" ]; then
  sqlite3 "{{ s3backup_grafana_db }}" ".backup '{{ s3backup_data_location }}/grafana.db'"
fi

docker run -i \
      -e AWS_ACCESS_KEY_ID={{ aws_key_id }}\
      -e AWS_SECRET_ACCESS_KEY={{ aws_secret_key }}\
      -e BUCKET_NAME={{ aws_bucket_name }} \
      -e BACKUP_NAME=reims2-backup \
      -v {{ s3backup_data_location }}:/backup dokku/s3backup:{{ s3backup_version }}

ping_healthcheck ""
