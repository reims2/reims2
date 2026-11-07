# REIMS2 System Overview

REIMS2 is composed of:

- A backend implemented in Java 25 with Spring Boot 4
- A MariaDB database
- A frontend constructed with Vue 3 and Vuetify 4 written in Typescript
- These docs generated with Vitepress
- A Grafana instance for system monitoring, using Prometheus for data collection and the backend's `stats_*` SQL views for inventory stats. It alerts on Telegram when the server struggles, requests fail or browsers report errors (`ansible/README.md`)
- [offen/docker-volume-backup](https://offen.github.io/docker-volume-backup/) for regular backups to AWS S3
- A Traefik proxy server for connecting the different components

Each component runs as a Docker container in a Docker Compose project on a single server.

GitHub Actions deploys every push to the `main` branch with the Ansible playbooks, first to dev.reims2.app and then to production, unless production was used in the last 48 hours.

Renovate keeps the dependencies current (`.github/renovate.json`). Minor and patch updates of what ships to production come grouped once a month. Linters, test packages and the toolchain (Node, pnpm, Maven, GitHub Actions) only run in CI, so theirs come every three months, in a group each. Security fixes come right away. Each PR merges itself on a Saturday once all checks pass. Majors get a PR each and wait 30 days after their release, so closing one keeps that major away until the next. MariaDB and Ansible Galaxy majors always wait for a manual merge. Renovate assigns the PRs that need someone. Renovate PRs that change the frontend also run the Visual check, which compares the user guide screenshots with the PR's base and fails on any visible difference.

For setting up a new instance, refer to the provided Ansible scripts. These scripts also provide a detailed overview of the REIMS2 system.
[Ansible scripts](https://github.com/reims2/reims2/tree/main/ansible)
