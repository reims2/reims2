FROM node:18@sha256:f4698d49371c8a9fa7dd78b97fb2a532213903066e47966542b3b1d403449da4 AS build
RUN apt-get update && apt-get install -y --no-install-recommends dumb-init

ENV NODE_OPTIONS --openssl-legacy-provider

WORKDIR /usr/src/app
COPY . /usr/src/app/
RUN --mount=type=cache,target=/root/.yarn YARN_CACHE_FOLDER=/root/.yarn yarn install --immutable
RUN yarn build

# PROD IMAGE
FROM node:18.16.1-bullseye-slim@sha256:1ba1ddfc61b385b6436fd0fa0d1d42d322a0cd03c1ff110fa39e828511152aef
RUN apt-get update && apt-get upgrade -y && apt install curl -y && rm -rf /var/lib/apt/lists/*

# renovate: datasource=npm depName=http=server
ENV HTTP_SERVER_VERSION=14.1.0
RUN npm install -g http-server@${HTTP_SERVER_VERSION}

ENV NODE_ENV production
ENV HOST 0.0.0.0
ENV PORT 5000

COPY --from=build /usr/bin/dumb-init /usr/bin/dumb-init
USER node
WORKDIR /usr/src/app
COPY --chown=node:node --from=build /usr/src/app/src/.vitepress/dist ./dist/docs

EXPOSE 5000

HEALTHCHECK --interval=5s --timeout=10s --retries=2 CMD curl --fail http://localhost:$PORT/docs/ || exit 1   

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["http-server", "dist"]
