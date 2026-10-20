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

- A push to `main` builds images, runs e2e, deploys staging and then prod. Set the repo variable
  `DEPLOY_FREEZE` to `true` during campaigns to keep these deploys and automatic server setup off the box.
- The Staging workflow deploys the branch picked in "Use workflow from" to dev.reims2.app.
  The next push to `main` puts main back.
- Server setup runs on changes to `setup.yml`, the setup or hardening roles, or `requirements.yml`.
  Hardening can reboot the box.
- On the server, every stack directory works with plain compose: `cd /srv/prod && docker compose logs
backend`. The other projects are `/srv/staging`, `/srv/traefik` and `/srv/monitoring`.
- A failed deploy rolls back to the previously deployed image tag and fails the job.
- `autoheal` (in `/srv/monitoring`) restarts containers whose healthcheck fails, since compose only
  restarts containers that exit.

## A new box

CI logs in as root with the `DEPLOY_SSH_KEY` secret of the `production` and `staging` environments,
opens the vault with `VAULT_PASSWORD` in `production` and checks the host key against the repo variable
`DEPLOY_KNOWN_HOSTS`. Refresh that after a reinstall: `ssh-keyscan reims2.app | gh variable set
DEPLOY_KNOWN_HOSTS`. Set up the box from a local checkout with `creds/pub_keys` (your SSH public keys plus
the CI deploy key) and `creds/vault_password`:

```bash
ansible-galaxy install -r requirements.yml
ansible-playbook -i hosts setup.yml
ansible-playbook -i hosts deploy.yml -e stack=prod -e app_tag=sha-<commit> --vault-password-file creds/vault_password
ansible-playbook -i hosts deploy.yml -e stack=staging -e app_tag=sha-<commit>
ssh root@reims2.app /srv/prod/s3backup/restore.sh
scripts/copy-prod-to-staging.sh
```

## Backups and restore

Every 6 hours `backup.sh` dumps the database (without the `roles` table, which Flyway seeds) and a copy
of Grafana's `grafana.db` to S3 as `reims2-backup-<timestamp>.tgz`, then pings healthchecks.io. It
refuses to upload while the `glasses` table is empty, so a fresh box can't overwrite the newest backup
with an empty one.

`restore.sh [backup key]` restores the newest backup by default, into a database without glasses. To
restore over live data, delete it with `cd /srv/prod && docker compose down -v` and deploy again first. `scripts/copy-prod-to-staging.sh` copies prod's data into staging. Staging
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
| `s3backup_healthcheck_url`                                           | healthchecks.io ping URL, empty disables it                         | `vars/prod.yml`                 |
| `s3backup_enabled`                                                   | `false` deploys backup scripts without the cron job, for test boxes | `true`                          |
| `traefik_https_letsencrypt_enabled`                                  | `false` serves Traefik's default certificate, for test boxes        | `true`                          |
