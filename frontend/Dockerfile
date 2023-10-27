FROM node:20@sha256:62efd17e997bc843aefa4c003ed84f43dfac83fa6228c57c898482e50a02e45c AS build

WORKDIR /usr/src/app
COPY .yarn/ .yarn/
COPY public/ public/
COPY src/ src/
COPY .yarnrc.yml index.html package.json yarn.lock tsconfig.json tsconfig.node.json vite.config.ts .browserslistrc ./

RUN --mount=type=cache,target=/root/.yarn YARN_CACHE_FOLDER=/root/.yarn yarn install --immutable

ARG GIT_VERSION=unknown
ENV VITE_GIT_VERSION=${GIT_VERSION}
RUN yarn build

# PROD IMAGE
FROM caddy:2.7.5-alpine

COPY LICENSE LICENSE
COPY ./Caddyfile /etc/caddy/Caddyfile
COPY --from=build /usr/src/app/dist /usr/share/caddy

EXPOSE 5000
HEALTHCHECK --interval=5s --timeout=5s --retries=3 --start-period=15s CMD wget -nv -t1 --spider 'http://localhost:5000' || exit 1

