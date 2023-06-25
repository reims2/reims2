# REIMS2 Ansible role

> Ansible is an IT automation tool. It can configure systems and deploy software.

For deploying a complete instance of REIMS2, do the following **on your local dev machine**:

0. [Install ansible](https://docs.ansible.com/ansible/latest/installation_guide/intro_installation.html)
1. Install ansible dependencies with `ansible-galaxy install -r requirements.yml`
2. Add your server to the existing `hosts` file
3. Add config variables to `main.yml` (see below)
4. Create a file `creds/pub_keys` containing your SSH public keys (password based SSH login will be disabled!)
5. If you want to restore a database dump, set the `db_dump` variable to include it. It's recommend to use the `dump.example.sql` file in this repo.

Run setup script for hardening first (strongly recommended):

```bash
ansible-playbook -i hosts setup.yml
```

Now deploy REIMS2 with:

```bash
# vaulti-id can be removed if not using ansible-vault
ansible-playbook -i hosts main.yml --vault-id <plaintext-file-with-vault-password>
```

**That's it, REIMS should be up and running!**

## Initial setup

If you use the example `dump.sql`, the initial username is `test` and password `testtest`. It's recommended to create a new admin user, login as that and delete this initial user.

A grafana monitoring solution will be available at `monitoring.<yourdomain>`. Don't forget to configure it with a password. You can add a Mysql datasource in grafana with domain `mariadb:3306`. Username is `monitoring` and password is set using the `monitoring_db_password` variable (not yet working).

## Important role variables

These are the most important variables to set in `main.yml`:

| Variable                  | Description                                                                                          | Default      |
| ------------------------- | ---------------------------------------------------------------------------------------------------- | ------------ |
| `backend_jwt_token`       | JWT token for backend authentication                                                                 | REQUIRED     |
| `reims2_db_password`      | Password for REIMS2 database user                                                                    | REQUIRED     |
| `reims2_db_root_password` | Password for REIMS2 database root user                                                               | REQUIRED     |
| `aws_key_id`              | AWS key ID for S3 backups                                                                            | REQUIRED     |
| `aws_secret_key`          | AWS secret key for S3 backups                                                                        | REQUIRED     |
| `stack_name`              | Internal name for the REIMS stack. Must be unique and can't contain special characters               | REQUIRED     |
| `app_domain`              | Domain name for REIMS2                                                                               | `reims2.app` |
| `reset_docker_stack`      | Docker stack configuration will be fully reset to fix any hickups. Usually not recommended for prod. | `false`      |
