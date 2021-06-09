# Deploying REIMS2

REIMS2 consists of two parts:

- Backend written in Java with Spring Boot
- Frontend based on Vue+Vuetify+Nuxt, written in Javascript/Typescript

We use Dokku for deploying, because it's very easy and even allows nice stuff like zero downtime deployments.

## Deploying updates of REIMS

1. Once per developer machine:
   ```bash
   # Set git remote config
   cd reims2-backend
   git remote add api dokku@YOUR_DOKKU_DOMAIN.com:api
   cd reims2-frontend
   git remote add frontend dokku@YOUR_DOKKU_DOMAIN.com:frontend
   cd reims2-docs
   git remote add docs dokku@YOUR_DOKKU_DOMAIN.com:docs
   ```
2. Deploy with Dokku!
   ```bash
   git push api
   git push frontend
   git push docs
   ```

## Initial server installation

[Simply use the provided ansible scripts](https://github.com/reims2/reims2-ansible-playbook)
