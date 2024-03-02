# REIMS2 system overview

REIMS2 consists of multiple parts:

- Backend written in Java 21 with Spring Boot 3
- Database using MariaDB
- Frontend based on Vue 3 with Vuetify 3, written in Typescript
- These docs based on Vitepress.
- Grafana instance for monitoring, used with Prometheus
- A small backup script for regular backups to AWS S3
- Proxy server with Traefix

All of these services are deployed as Docker containers.

We then use Docker Stack and Swarm for deploying. It's configured to automatically deploy on pushed to the `main` branch.

To setup a new instance, you need to use the provided ansible scripts. They are also relevant to get an overview of REIMS2 in more detail.
[ansible scripts](https://github.com/reims2/reims2-ansible-playbook)
