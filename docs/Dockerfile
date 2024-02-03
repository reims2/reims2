FROM node:20@sha256:fd0115473b293460df5b217ea73ff216928f2b0bb7650c5e7aa56aae4c028426 AS build

WORKDIR /usr/src/app
COPY .yarn/ .yarn/
COPY src/ src/
COPY .yarnrc.yml package.json yarn.lock ./

RUN --mount=type=cache,target=/root/.yarn YARN_CACHE_FOLDER=/root/.yarn yarn install --immutable

RUN yarn build

# PROD IMAGE
FROM caddy:2.7.6-alpine@sha256:80ca561981768b2c3568cc4bef3d4cd1f11c2a625c806bedeb8453aef98779a0

COPY LICENSE LICENSE
COPY ./Caddyfile /etc/caddy/Caddyfile
COPY --from=build /usr/src/app/src/.vitepress/dist /usr/share/caddy/docs

EXPOSE 5000

HEALTHCHECK --interval=5s --timeout=5s --retries=3 --start-period=15s CMD wget -nv -t1 --spider 'http://localhost:5000/docs/' || exit 1
