#!/bin/bash
{{ ansible_managed | comment }}

docker exec "$(docker ps -q -f name=reims2_db)" sh -c 'exec mariadb-dump {{ reims2_db_name }} -uroot -p"{{ reims2_db_root_password }}"' > {{ s3backup_data_location }}/dump.sql

docker run -it \
      -e AWS_ACCESS_KEY_ID={{ aws_key_id }}\
      -e AWS_SECRET_ACCESS_KEY={{ aws_secret_key }}\
      -e BUCKET_NAME={{ aws_bucket_name }} \
      -e BACKUP_NAME=reims2-backup \
      -v {{ s3backup_data_location }}:/backup dokku/s3backup:{{ s3backup_version }}