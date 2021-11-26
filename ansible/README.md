# REIMS2 ansible role

> Ansible is an IT automation tool. It can configure systems and deploy software.

For deploying a complete instance of REIMS2, do the following **on your local dev machine**:

0. [Install ansible](https://docs.ansible.com/ansible/latest/installation_guide/intro_installation.html)
1. Install ansible dependencies with `ansible-galaxy install -r requirements.yml`
2. Add your server **domain** in the existing `hosts` file
3. Add your JWT token (can be any secure password) as `backend_jwt_token`
4. Rename `dump.sql.example` to `dump.sql` to populate REIMS2 with example data.
5. Optionally add your dokku deploy key (e.g. for GitHub actions) in subfolder `creds/deploy_key.pub` (otherwise comment out the dokku_users stuff)
6. Optionally enter you AWS key+secret inside `reims.yml` for S3 backups (otherwise just comment out the mysql:backup stuff)

Now deploy with:

```bash
# Don't forget --ask-vault-pass if using Ansible vault for the AWS password.
ansible-playbook -i hosts reims.yml
```

**That's it, REIMS should be up and running!**

The initial username is `initial` and password `testtest`. It's recommended to create a new admin user, login as that and delete this initial user.

## Optional OS hardening

Use the `setup.yml` playbook for some OS hardening stuff.

But first create a file `creds/pub_keys` containing your SSH public keys because password based SSH login will be disabled!

```bash
ansible-playbook -i hosts setup.yml
```

## How to restore an old database dump

Copy your sql dump file to `dump.sql` in this folder. Then run the following command:

```bash
ansible-playbook -i hosts --tags restore-mysql reims.yml
```
