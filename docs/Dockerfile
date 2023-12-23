FROM node:20@sha256:8d0f16fe841577f9317ab49011c6d819e1fa81f8d4af7ece7ae0ac815e07ac84 AS build

WORKDIR /usr/src/app
COPY .yarn/ .yarn/
COPY src/ src/
COPY .yarnrc.yml package.json yarn.lock ./

RUN --mount=type=cache,target=/root/.yarn YARN_CACHE_FOLDER=/root/.yarn yarn install --immutable

RUN yarn build

# PROD IMAGE
FROM caddy:2.7.6-alpine@sha256:eabac2898cf9fc7dc94d3fb03ac84c9c923aa6cc6f04874937d2f525e0d2f006

COPY LICENSE LICENSE
COPY ./Caddyfile /etc/caddy/Caddyfile
COPY --from=build /usr/src/app/src/.vitepress/dist /usr/share/caddy/docs

EXPOSE 5000

HEALTHCHECK --interval=5s --timeout=5s --retries=3 --start-period=15s CMD wget -nv -t1 --spider 'http://localhost:5000/docs/' || exit 1
