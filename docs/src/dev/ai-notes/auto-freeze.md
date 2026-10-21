# Automatic deploy freeze

Not built yet. Today the repo variable `DEPLOY_FREEZE` keeps deploys and automatic server setup off the
box, and someone has to remember to set it before input week and the campaign. Planned in October 2026
to replace it with a check of whether prod is in use.

## Plan

- One step in `.github/workflows/ansible.yml`, only for prod and only when a push started the run
  (`github.event_name == 'push'`). That covers the prod deploy and automatic server setup.
- It asks prod's MariaDB over SSH how many glasses were added or dispensed in the last 48 hours. The
  database clock is UTC like the stored timestamps:

  ```sql
  select (select count(*) from glasses where creation_date > now() - interval 48 hour)
       + (select count(*) from dispense where modify_date > now() - interval 48 hour);
  ```

- If any were, the job fails with "N glasses added or dispensed in the last 48 hours, prod left alone".
  GitHub has no yellow or neutral result for a finished job, and a cancelled one is easy to miss, so red
  plus the failure email it is. "Re-run failed jobs" once things are quiet deploys.
- Running Deploy by hand on `main` skips the check. That is the hotfix path.
- Staging keeps deploying. It only touches `/srv/staging` and yields CPU to prod.
- A fresh box or an unreachable database counts as not in use, so a first deploy goes through.
- `DEPLOY_FREEZE` and its conditions in `main.yml` and `server-setup.yml` go away, along with the
  mentions in `ansible/README.md` and `CLAUDE.md`.

48 hours rather than 24 because the app works offline, so a day in the field may only reach the
database at the evening sync, and Renovate merges on weekends, which can be quiet days mid-campaign.
