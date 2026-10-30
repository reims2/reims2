# REIMS2 System Overview

REIMS2 is composed of:

- A backend implemented in Java 21 with Spring Boot 4
- A MariaDB database
- A frontend constructed with Vue 3 and Vuetify 3 written in Typescript
- These docs generated with Vitepress
- A Grafana instance for system monitoring, using Prometheus for data collection and the backend's `stats_*` SQL views for inventory stats
- [offen/docker-volume-backup](https://offen.github.io/docker-volume-backup/) for regular backups to AWS S3
- A Traefik proxy server for connecting the different components

Each component runs as a Docker container in a Docker Compose project on a single server.

GitHub Actions deploys every push to the `main` branch with the Ansible playbooks, first to dev.reims2.app and then to production, unless production was used in the last 48 hours.

For setting up a new instance, refer to the provided Ansible scripts. These scripts also provide a detailed overview of the REIMS2 system.
[Ansible scripts](https://github.com/reims2/reims2/tree/main/ansible)
