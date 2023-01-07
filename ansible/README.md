# REIMS2 Ansible role

> Ansible is an IT automation tool. It can configure systems and deploy software.

For deploying a complete instance of REIMS2, do the following **on your local dev machine**:

0. [Install ansible](https://docs.ansible.com/ansible/latest/installation_guide/intro_installation.html)
1. Install ansible dependencies with `ansible-galaxy install -r requirements.yml`
2. Add your server **domain** (on which it will be accessible from) in the existing `hosts` file
3. Add your JWT token (can be any secure password) as `backend_jwt_token` in `main.yml`
4. Create a file `creds/pub_keys` containing your SSH public keys (password based SSH login will be disabled!)
5. Rename `dump.sql.example` to `dump.sql` to populate REIMS2 with example data.
6. Add your dokku deploy key (e.g. for GitHub actions) in subfolder `creds/deploy_key.pub` (otherwise comment out the dokku_users stuff in `plays/reims.yml`)
7. Enter you AWS key+secret inside `reims.yml` for S3 backups (otherwise remove all `aws_*` variables)

Now deploy with:

```bash
# Don't forget --ask-vault-pass if using Ansible vault for the AWS password.
ansible-playbook -i hosts main.yml
```

**That's it, REIMS should be up and running!**

The initial username is `test` and password `testtest`. It's recommended to create a new admin user, login as that and delete this initial user.

It'll also configure a developer instance at `dev.yourdomain.de`.

## I only want to restore an old database dump

Copy your SQL dump file to `dump.sql` in this folder. Then run the following command:

```bash
ansible-playbook -i hosts --tags restore-mysql main.yml
```
