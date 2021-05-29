# REIMS2 ansible role

For deploying a complete instance of REIMS2 (with dokku), do the following on your dev machine (after [installing ansible](https://docs.ansible.com/ansible/latest/installation_guide/intro_installation.html)):

```bash
# Install dependencies
ansible-galaxy install -r requirements.yml
# Deploying REIMS2 with dokku
ansible-playbook -i hosts reims.yml
```

It's that easy!

### Optional

Create a file `creds/pub_keys` containing your SSH public keys for logging in via SSH in the future.

Run the `setup.yml` playbook for some OS hardening stuff first:

```bash
ansible-playbook -i hosts setup.yml
```
