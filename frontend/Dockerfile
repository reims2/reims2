FROM node:24.21.0@sha256:3d27e5c11e5786e309ec3e03f93ae536eb36e6e5eb3714d5eb3300a36157add0 AS build

WORKDIR /usr/src/app
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY public/ public/
COPY src/ src/
COPY index.html tsconfig.json tsconfig.app.json tsconfig.node.json vite.config.ts ./

ARG GIT_VERSION=unknown
ENV VITE_GIT_VERSION=${GIT_VERSION}
RUN pnpm build

# PROD IMAGE
FROM caddy:2.11.7-alpine@sha256:d8542f48d34a9cf4e4c11a478865229840e87e4c96ea3f439101f31a5d35f75f
# caddy only writes to its config and data dirs
RUN addgroup -S app && adduser -S -G app app && chown app:app /config /data
USER app:app

COPY ./Caddyfile /etc/caddy/Caddyfile
COPY --from=build /usr/src/app/dist /usr/share/caddy

EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=5s --retries=3 --start-period=15s --start-interval=1s CMD wget -nv -t1 --spider 'http://localhost:5000' || exit 1

