FROM node:18@sha256:e7e0921e352fc579d4d1807ecb2a91f42548cb5097e8bd2742e13bd672b7dc4a AS build
RUN apt-get update && apt-get install -y --no-install-recommends dumb-init

WORKDIR /usr/src/app
COPY . /usr/src/app/
RUN --mount=type=cache,target=/root/.yarn YARN_CACHE_FOLDER=/root/.yarn yarn install --immutable
RUN --mount=type=cache,target=/root/.yarn YARN_CACHE_FOLDER=/root/.yarn yarn build
RUN --mount=type=cache,target=/root/.yarn YARN_CACHE_FOLDER=/root/.yarn yarn workspaces focus --production

# PROD IMAGE
FROM node:18.16.1-bullseye-slim@sha256:1ba1ddfc61b385b6436fd0fa0d1d42d322a0cd03c1ff110fa39e828511152aef
RUN apt-get update && apt-get upgrade -y && apt install curl -y && rm -rf /var/lib/apt/lists/*

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

HEALTHCHECK --interval=5s --timeout=5s --retries=3 --start-period=15s CMD curl --fail http://localhost:$PORT/ || exit 1   

CMD ["dumb-init", "node", "node_modules/nuxt/bin/nuxt.js", "start"]
