#!/bin/sh
# Runs the app stack for e2e on http://localhost:${E2E_PORT:-3000}.
#   stack.sh up      start (or restart) the stack, wait until it's healthy and reseed the test data
#   stack.sh down    stop it and delete its data
#   stack.sh <cmd>   any other docker compose command, e.g. build, pull, logs or `up -d` without waiting
set -eu
cd "$(dirname "$0")/.."

compose() {
  docker compose -p reims2-e2e --env-file e2e/e2e.env -f compose.yaml -f e2e/compose.e2e.yaml "$@"
}

case "${*:-up}" in
  up)
    compose up -d --wait
    # schema comes from Flyway on backend start, so the data-only dump goes in afterwards
    compose exec -T mariadb sh -c 'mariadb -uroot -p"$MARIADB_ROOT_PASSWORD" "$MARIADB_DATABASE"' \
      < e2e/seed.sql
    ;;
  down)
    compose down -v
    ;;
  *)
    compose "$@"
    ;;
esac
