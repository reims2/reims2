# overridden with the repo's .git by a named build context, empty for a plain build
FROM scratch AS git

FROM node:24.21.0@sha256:3d27e5c11e5786e309ec3e03f93ae536eb36e6e5eb3714d5eb3300a36157add0 AS build

# mirrors the repo layout so git finds each page's history under docs/
WORKDIR /usr/src/app/docs
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY src/ src/
# for the last updated footer, mounted so .git stays out of the layers
RUN --mount=type=bind,from=git,target=/usr/src/app/.git pnpm build

# PROD IMAGE
FROM caddy:2.11.7-alpine@sha256:d8542f48d34a9cf4e4c11a478865229840e87e4c96ea3f439101f31a5d35f75f
# caddy only writes to its config and data dirs
RUN addgroup -S app && adduser -S -G app app && chown app:app /config /data
USER app:app

COPY LICENSE LICENSE
COPY ./Caddyfile /etc/caddy/Caddyfile
COPY --from=build /usr/src/app/docs/src/.vitepress/dist /usr/share/caddy/docs

EXPOSE 5000

HEALTHCHECK --interval=5s --timeout=5s --retries=3 --start-period=15s CMD wget -nv -t1 --spider 'http://localhost:5000/docs/' || exit 1
