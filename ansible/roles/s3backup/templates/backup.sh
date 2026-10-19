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

docker exec "$(docker ps -q -f name=^{{ stack_name }}_mariadb)" sh -c 'exec mariadb-dump {{ reims2_db_name }} --ignore-table={{ reims2_db_name }}.roles --complete-insert --no-create-info -uroot -p"{{ reims2_db_root_password }}"' > {{ s3backup_data_location }}/dump.sql

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
