FROM node:18 AS build
RUN apt-get update && apt-get install -y --no-install-recommends dumb-init

ENV NODE_OPTIONS --openssl-legacy-provider

WORKDIR /usr/src/app
COPY . /usr/src/app/
RUN --mount=type=cache,target=/root/.yarn YARN_CACHE_FOLDER=/root/.yarn yarn install --immutable
RUN --mount=type=cache,target=/root/.yarn YARN_CACHE_FOLDER=/root/.yarn yarn build
RUN --mount=type=cache,target=/root/.yarn YARN_CACHE_FOLDER=/root/.yarn yarn workspaces focus --production

# PROD IMAGE
FROM node:18.16.1-bullseye-slim
RUN apt-get update && apt-get upgrade -y && apt install curl -y && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV production
ENV HOST 0.0.0.0
ENV PORT 5000

COPY --from=build /usr/bin/dumb-init /usr/bin/dumb-init
USER node
WORKDIR /usr/src/app
COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/package.json ./package.json
COPY --chown=node:node --from=build /usr/src/app/src/.vitepress/dist ./src/.vitepress/dist

EXPOSE 5000

HEALTHCHECK --interval=5s --timeout=10s --retries=2 CMD curl --fail http://localhost:$PORT/docs/ || exit 1   

CMD ["dumb-init", "yarn", "run", "start"]
