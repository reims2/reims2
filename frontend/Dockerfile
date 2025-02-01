FROM node:22.13.0@sha256:fa54405993eaa6bab6b6e460f5f3e945a2e2f07942ba31c0e297a7d9c2041f62 AS build

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
FROM caddy:2.9.1-alpine@sha256:b60636634fd2aebaf9460cf60997ad83aad6b139318d5713e2b78a60f52b139c

COPY ./Caddyfile /etc/caddy/Caddyfile
COPY --from=build /usr/src/app/dist /usr/share/caddy

EXPOSE 5000
HEALTHCHECK --interval=5s --timeout=5s --retries=3 --start-period=15s CMD wget -nv -t1 --spider 'http://localhost:5000' || exit 1

