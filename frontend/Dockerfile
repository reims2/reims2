FROM node:24.11.0@sha256:34af25027ee1b8bffd482ba995ec1e577fbd398db87beb4c60b80c2c9c025127 AS build

WORKDIR /usr/src/app
COPY .yarn/ .yarn/
COPY public/ public/
COPY src/ src/
COPY .yarnrc.yml .pnp.* index.html package.json yarn.lock tsconfig.json tsconfig.node.json vite.config.ts .browserslistrc ./

RUN yarn install --immutable

ARG GIT_VERSION=unknown
ENV VITE_GIT_VERSION=${GIT_VERSION}
RUN yarn build

# PROD IMAGE
FROM caddy:2.10.2-alpine@sha256:953131cfea8e12bfe1c631a36308e9660e4389f0c3dfb3be957044d3ac92d446

COPY ./Caddyfile /etc/caddy/Caddyfile
COPY --from=build /usr/src/app/dist /usr/share/caddy

EXPOSE 5000
HEALTHCHECK --interval=5s --timeout=5s --retries=3 --start-period=15s CMD wget -nv -t1 --spider 'http://localhost:5000' || exit 1

