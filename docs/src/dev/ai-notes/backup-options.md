# Backup tool options

Backups are a hand-written `backup.sh` run by cron every 6 hours
([`ansible/roles/s3backup/`](https://github.com/reims2/reims2/tree/main/ansible/roles/s3backup)). It
dumps the data, copies Grafana's `grafana.db`, uploads both with `dokku/s3backup` and pings
healthchecks.io. `restore.sh` restores the newest backup. Replacing them with an off-the-shelf
container was considered in October 2026 and put off: it changes the data-safety path, so do it after
a campaign, not right before one.

## Candidates (checked 2026-10-20)

- [nfrastack/db-backup](https://github.com/nfrastack/db-backup) (formerly tiredofit/docker-db-backup):
  MariaDB and SQLite jobs, S3, cron schedule, retention, scripted restore from S3, pre/post hooks. The
  closest fit. Open core: the AGPL community edition covers all of this, paid tiers add more. Version 5
  is a recent rewrite. A healthchecks.io ping needs a `POST_COMMAND` hook.
- [offen/docker-volume-backup](https://github.com/offen/docker-volume-backup): the most used. Archives
  volumes or directories to S3 with cron and retention. DB dumps run through `archive-pre` labels,
  Grafana would stop briefly via a label. No restore command, and its notifications don't map cleanly
  onto healthchecks.io success/failure pings.
- [databacker/mysql-backup](https://github.com/databacker/mysql-backup): MySQL/MariaDB only, with S3,
  schedule, pruning and a restore command. `grafana.db` would need another tool.

## What a replacement must keep

- An empty database never becomes the newest backup. Today `backup.sh` refuses while `glasses` is
  empty. Retention must not be able to rotate out every good backup either.
- `grafana.db` is part of the backup.
- healthchecks.io gets a success ping, and a failure ping or none on failure.
- The existing `reims2-backup-*.tgz` files stay restorable. They hold a data-only dump, see
  `restore.sh`.

A full dump (with `CREATE TABLE`) would also let a restore run over a live database, which the
data-only dump can't.
