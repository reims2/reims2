# REIMS2 Ansible

Two playbooks run the whole server. `setup.yml` prepares a box: Docker, firewall, swap, unattended
upgrades and hardening. `deploy.yml` runs one stack as Docker Compose projects. GitHub Actions runs both,
so day to day you only push to `main`.

| Stack   | Command                       | What runs                                                       |
| ------- | ----------------------------- | --------------------------------------------------------------- |
| prod    | `deploy.yml -e stack=prod`    | Traefik, Grafana/Prometheus, the app in `/srv/prod`, S3 backups |
| staging | `deploy.yml -e stack=staging` | the app in `/srv/staging`, served at dev.reims2.app             |

Prod values and vaulted secrets are in `vars/prod.yml`, staging values in `vars/staging.yml`. The app's
services come from the root `compose.yaml`, which the `app` role copies next to a generated `.env`.

## Everyday use

- A push to `main` builds images, runs e2e, deploys staging and then prod. If glasses were added or
  dispensed on prod in the last 48 hours, a push leaves prod alone and its prod deploy or server setup fails
  instead (`tasks/prod-quiet.yml`). 48 hours, because offline sites may only sync in the evening and
  Renovate merges on weekends. Re-run the latest failed runs once it's quiet. For a hotfix mid-campaign,
  run Deploy on `main` by hand, which skips the check.
- The Staging workflow deploys the branch picked in "Use workflow from" to dev.reims2.app.
  The next push to `main` puts main back.
- Server setup runs on changes to `setup.yml`, the setup or hardening roles, or `requirements.yml`.
- On the server, every stack directory works with plain compose: `cd /srv/prod && docker compose logs
backend`. The other projects are `/srv/staging`, `/srv/traefik` and `/srv/monitoring`.
- A deploy fails when the containers don't get healthy or `/api`, `/` and `/docs/` don't answer on the
  public domain. It then rolls back to the previously deployed image tag and fails the job, and a failed
  staging deploy skips prod.
- `autoheal` (in `/srv/monitoring`) restarts containers whose healthcheck fails, since compose only
  restarts containers that exit.

## A new box

Start from an Ubuntu LTS box with root SSH access. Point `reims2.app`, `dev.reims2.app` and
`monitoring.reims2.app` at it first, so Traefik gets Let's Encrypt certificates. `creds/` is not in git.
`creds/vault_password` opens the vault in `vars/prod.yml`, so keep a copy outside the repo.
`creds/pub_keys` lists every SSH key that gets root, since hardening turns off password logins. That
includes the CI key: `ssh-keygen -t ed25519 -N '' -f creds/deploy`, then add `creds/deploy.pub`.

CI logs in as root with that key, stored as the `DEPLOY_SSH_KEY` secret of the `production` and
`staging` environments. It opens the vault with `VAULT_PASSWORD` in `production` and checks the host key
against the repo variable `DEPLOY_KNOWN_HOSTS`. Refresh that after a reinstall: `ssh-keyscan reims2.app |
gh variable set DEPLOY_KNOWN_HOSTS`. Then set up the box from a local checkout:

```bash
ansible-galaxy install -r requirements.yml
ansible-playbook -i hosts setup.yml
ansible-playbook -i hosts deploy.yml -e stack=prod -e app_tag=sha-<commit> --vault-password-file creds/vault_password
ansible-playbook -i hosts deploy.yml -e stack=staging -e app_tag=sha-<commit>
ssh root@reims2.app /srv/prod/s3backup/restore.sh
scripts/copy-prod-to-staging.sh
```

Without a backup the database starts with no users. Insert a first admin the way
`scripts/copy-prod-to-staging.sh` inserts `test` (bcrypt hash, all roles), then add everyone else in the
app. Outside this repo live the AWS S3 bucket `reims2-backup`, the healthchecks.io check of the backup
and UptimeRobot checks of reims2.app. The bucket has versioning and Object Lock (compliance mode, 30
days default retention) on. Its key, in the vault, may only `s3:PutObject`, `s3:GetObject`,
`s3:ListBucket` and `s3:GetBucketLocation`, so root on the box can't destroy a backup. The
healthchecks.io check filters on the HTTP request body: `docker-volume-backup succeeded` is success,
`docker-volume-backup failed` is failure, anything else is ignored.

## Backups and restore

Every 6 hours [offen/docker-volume-backup](https://offen.github.io/docker-volume-backup/) (in
`/srv/prod/s3backup`) dumps the database (without the `roles` table, which Flyway seeds) through a label
on `mariadb` in `roles/app/files/compose.prod.yaml`, stops Grafana for a few seconds to copy its data
dir and uploads both to S3 as `reims2-backup-<timestamp>.tgz`. Old backups are kept. The dump refuses
while the `glasses` table is empty, so a fresh box never uploads an empty backup. Each run reports
success or failure to healthchecks.io. `cd /srv/prod/s3backup && docker compose exec backup backup`
runs one now, `docker compose logs backup` there shows past runs.

`restore.sh [backup key]` restores the newest backup by default, into a database without glasses. To
restore over live data, delete it with `cd /srv/prod && docker compose down -v` and deploy again first. `scripts/copy-prod-to-staging.sh` copies prod's data into staging. Run it before merging a migration, so the
next `main` deploy tries the migration on prod's data on staging first. Staging
keeps its own users and always has `test`/`testtest`.

## Grafana

Grafana runs at `monitoring.<app_domain>`. The REIMS2 and Refill stats dashboards are provisioned from
`roles/monitoring/files/dashboards/` and read the `stats_*` views from the backend's Flyway migrations.
Edit and save them in Grafana as usual, then copy the JSON from the save dialog over the file and commit.
UI edits and Grafana users live in `grafana.db`, which the backup includes. The `app` role creates the
`monitoring` database user that Grafana and the MySQL exporter use.

## Variables

| Variable                                                             | Description                                                         | Default                         |
| -------------------------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------- |
| `stack`                                                              | `prod` or `staging`, picks `vars/<stack>.yml`                       | required                        |
| `app_tag`                                                            | image tag to deploy, e.g. `sha-abc1234`                             | the deployed tag, else `latest` |
| `reims2_db_password`, `reims2_db_root_password`, `reims2_jwt_secret` | app secrets, no single quotes                                       | in `vars/`                      |
| `monitoring_db_password`                                             | password of the `monitoring` DB user                                | `vars/prod.yml`                 |
| `aws_key_id`, `aws_secret_key`                                       | S3 credentials for backups                                          | `vars/prod.yml`                 |
| `s3backup_healthcheck_url`                                           | shoutrrr URL of the healthchecks.io check, empty disables it        | `vars/prod.yml`                 |
| `s3backup_enabled`                                                   | `false` deploys the backup but keeps it stopped, for test boxes     | `true`                          |
| `traefik_https_letsencrypt_enabled`                                  | `false` serves Traefik's default certificate, for test boxes        | `true`                          |
