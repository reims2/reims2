Traefik
=========

This will setup a [Traefik](https://docs.traefik.io/v2.0/) server that acts as a dynamic reverse proxy and uses docker labels to route traffic. It also takes care about enabling/renewing Let's Encrypt certificates if specified.

**Note: If using the IPv6 configuration: When changing the address etc, you will need to manually take care about removing old/unused firewall rules!**

Requirements
------------

You will need to have docker and docker-compose installed or declared as dependencies with their respective roles.

Role Variables
--------------

**Please look at the [defaults/main.yml](defaults/main.yml) for all available variables and their description.**

**Note: Lines that are commented out via `#` are usually still valid/used variables, but they are not defined by default, so they might enable a feature, when uncommenting/defining them!**  

### Global variables, that are used:

- `docker_package`: Defined by the docker role, this is the package name of docker within your package manager.

Dependencies
------------

- docker
- docker-compose

License
-------

GPL-3.0-only
