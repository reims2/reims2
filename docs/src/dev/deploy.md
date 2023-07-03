# Deploying REIMS2

REIMS2 consists of multiple parts:

- Backend written in Java with Spring Boot
- Frontend based on Vue+Vuetify+Nuxt, written in Javascript/Typescript
- These docs based on Vitepress.

We use Docker Stack and Swarm for deploying. It's configured to automatically deploy on pushed to the `main` branch.

## Initial server installation

[Simply use the provided ansible scripts](https://github.com/reims2/reims2-ansible-playbook)
