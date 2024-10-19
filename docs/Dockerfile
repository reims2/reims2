FROM node:20.18.0@sha256:d7c25dbb3da3f8d9990073780e3c1eb0f0c68a55ef5adf402aa96fb4ee49f6e1 AS build

WORKDIR /usr/src/app
COPY .yarn/ .yarn/
COPY src/ src/
COPY .yarnrc.yml .pnp.* .yarnrc.yml package.json yarn.lock ./
# For last modified time in vitepress
# COPY ..git/ .git/

RUN yarn install --immutable

RUN yarn build

# PROD IMAGE
FROM caddy:2.8.4-alpine@sha256:33937b9d51461ea87794350c1c09ce53f327802508929d78f3b5642533f2f7db

COPY LICENSE LICENSE
COPY ./Caddyfile /etc/caddy/Caddyfile
COPY --from=build /usr/src/app/src/.vitepress/dist /usr/share/caddy/docs

EXPOSE 5000

HEALTHCHECK --interval=5s --timeout=5s --retries=3 --start-period=15s CMD wget -nv -t1 --spider 'http://localhost:5000/docs/' || exit 1
