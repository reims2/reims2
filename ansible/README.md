# REIMS2 ansible role

> Ansible is an IT automation tool. It can configure systems and deploy software.

For deploying a complete instance of REIMS2 (with dokku), do the following **on your local dev machine**:

0. [Install ansible](https://docs.ansible.com/ansible/latest/installation_guide/intro_installation.html)
1. Install ansible dependencies with `ansible-galaxy install -r requirements.yml`
2. Add your server **domain** in the existing `hosts` file
3. Add your dokku deploy key (e.g. for GitHub actions) in subfolder `creds/deploy_key.pub` (or comment out the dokku_users stuff)
4. Enter you AWS key+secret inside `reims.yml` for S3 backups (or just comment out the mysql:backup stuff)
5. Optionally place `dump.sql` in the main directory to restore the database

Now deploy with:

```bash
# Don't forget --ask-vault-pass if using Ansible vault for the AWS password.
ansible-playbook -i hosts reims.yml
```

**That's it, REIMS should be up and running!**

### Optional OS hardening

Use the `setup.yml` playbook for some OS hardening stuff.

But first create a file `creds/pub_keys` containing your SSH public keys for login. Password based SSH login will be disabled!

```bash
ansible-playbook -i hosts setup.yml
```

### Upload a new database dump

_Uses local `dump.sql`_

```bash
ansible-playbook -i hosts --tags restore-mysql reims.yml
```
