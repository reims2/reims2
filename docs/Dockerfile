FROM node:20.14.0@sha256:d0a9a2399581a9de1ff962a48a28b5cfe700678a6a5df8e31a63aaa47bebb923 AS build

WORKDIR /usr/src/app
COPY .yarn/ .yarn/
COPY src/ src/
COPY .yarnrc.yml .pnp.* .yarnrc.yml package.json yarn.lock ./
# For last modified time in vitepress
COPY .git/ .git/

RUN yarn install --immutable

RUN yarn build

# PROD IMAGE
FROM caddy:2.8.4-alpine@sha256:896c6fb9e3eae11890f53dc528b8a9be1b4d058f6b7603024feb084fc203c0b4

COPY LICENSE LICENSE
COPY ./Caddyfile /etc/caddy/Caddyfile
COPY --from=build /usr/src/app/src/.vitepress/dist /usr/share/caddy/docs

EXPOSE 5000

HEALTHCHECK --interval=5s --timeout=5s --retries=3 --start-period=15s CMD wget -nv -t1 --spider 'http://localhost:5000/docs/' || exit 1
