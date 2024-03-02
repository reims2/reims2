# REIMS2 System Overview

REIMS2 is composed of:

- A backend implemented in Java 21 with Spring Boot 3
- A MariaDB database
- A frontend constructed with Vue 3 and Vuetify 3 written in Typescript
- These docs generated with Vitepress
- A Grafana instance for system monitoring, using Prometheus for data collection
- A script for regular backups to AWS S3
- A Traefik proxy server for connecting the different components

Each component is deployed as a Docker container.

Deployment is orchestrated using Docker Stack and Swarm, configured for automatic deployment upon pushes to the `main` branch using GitHub Actions.

For setting up a new instance, refer to the provided Ansible scripts. These scripts also provide a detailed overview of the REIMS2 system.
[Ansible scripts](https://github.com/reims2/reims2-ansible-playbook)
