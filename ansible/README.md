# REIMS2 ansible role

For deploying a complete instance of REIMS2 (with dokku), do the following **on your local dev machine**:

0. [Install ansible](https://docs.ansible.com/ansible/latest/installation_guide/intro_installation.html)
1. Add your server in `hosts` file
2. Add your dokku deploy key (e.g. for GitHub actions) in `creds/deploy_key.pub`.
3. Install ansible dependencies with `ansible-galaxy install -r requirements.yml`
4. Deploy with `ansible-playbook -i hosts reims.yml`

That's it!

### Optional OS hardening

Create a file `creds/pub_keys` containing your SSH public keys for logging in via SSH in the future. Password based SSH login will be disabled!

Then run the `setup.yml` playbook for some OS hardening stuff:

```bash
ansible-playbook -i hosts setup.yml
```
