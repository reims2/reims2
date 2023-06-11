FROM node:16 AS build
RUN apt-get update && apt-get install -y --no-install-recommends dumb-init

WORKDIR /usr/src/app
COPY . /usr/src/app/
RUN --mount=type=cache,target=/root/.yarn YARN_CACHE_FOLDER=/root/.yarn yarn install --immutable
RUN yarn build
RUN yarn workspaces focus --production

# PROD IMAGE
FROM node:16.20.0-bullseye-slim
RUN apt-get update && apt-get upgrade -y

ENV NODE_ENV production
ENV HOST 0.0.0.0
ENV PORT 5000

COPY --from=build /usr/bin/dumb-init /usr/bin/dumb-init
USER node
WORKDIR /usr/src/app
COPY --chown=node:node --from=build /usr/src/app/nuxt.config.ts /usr/src/app/nuxt.config.ts
COPY --chown=node:node --from=build /usr/src/app/static /usr/src/app/static
COPY --chown=node:node --from=build /usr/src/app/node_modules /usr/src/app/node_modules
COPY --chown=node:node --from=build /usr/src/app/.nuxt /usr/src/app/.nuxt

EXPOSE 5000
CMD ["dumb-init", "node", "node_modules/nuxt/bin/nuxt.js", "start"]
