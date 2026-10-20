#!/bin/bash
# Copies prod's data into staging (dev.reims2.app). Staging keeps its own users and always has test/testtest.
# Usage: ansible/scripts/copy-prod-to-staging.sh [ssh args], default root@reims2.app
set -eo pipefail
[ $# -gt 0 ] || set -- root@reims2.app

# passed as an argument, not on stdin, so docker exec can't swallow the rest of the script
ssh "$@" "$(cat <<'EOF'
set -eo pipefail
prod_dump() {
  cd /srv/prod && docker compose exec -T mariadb sh -c 'exec mariadb-dump -uroot -p"$MARIADB_ROOT_PASSWORD" --single-transaction --ignore-table="$MARIADB_DATABASE.users" --ignore-table="$MARIADB_DATABASE.user_roles" "$MARIADB_DATABASE"'
}
staging_db() {
  cd /srv/staging && docker compose exec -T mariadb sh -c 'exec mariadb -uroot -p"$MARIADB_ROOT_PASSWORD" "$MARIADB_DATABASE" "$@"' sh "$@"
}
prod_dump | staging_db
staging_db <<'SQL'
insert into users (username, password)
  select 'test', '$2a$10$vpFqQIbEm0Zd0eco2hLxgOTiujxoziOGvKgbX6KE1ud8hwdHJXsE2' from dual
  where not exists (select 1 from users where username = 'test');
insert ignore into user_roles (user_id, role_id)
  select u.id, r.id from users u join roles r where u.username = 'test';
SQL
cd /srv/staging && docker compose restart backend >/dev/null
staging_db -N -e "select concat(count(*), ' glasses on staging') from glasses"
EOF
)" < /dev/null
