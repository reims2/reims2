FROM node:20@sha256:e06aae17c40c7a6b5296ca6f942a02e6737ae61bbbf3e2158624bb0f887991b5 AS build

WORKDIR /usr/src/app
COPY .yarn/ .yarn/
COPY src/ src/
COPY .yarnrc.yml package.json yarn.lock ./
# For last modified time in vitepress
COPY .git/ .git/

RUN --mount=type=cache,target=/root/.yarn YARN_CACHE_FOLDER=/root/.yarn yarn install --immutable

RUN yarn build

# PROD IMAGE
FROM caddy:2.7.6-alpine@sha256:dda81a416214d4dbdd978810efa19643e39b626fe0f979558fbb116758784c89

COPY LICENSE LICENSE
COPY ./Caddyfile /etc/caddy/Caddyfile
COPY --from=build /usr/src/app/src/.vitepress/dist /usr/share/caddy/docs

EXPOSE 5000

HEALTHCHECK --interval=5s --timeout=5s --retries=3 --start-period=15s CMD wget -nv -t1 --spider 'http://localhost:5000/docs/' || exit 1
