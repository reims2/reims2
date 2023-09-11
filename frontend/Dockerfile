FROM node:20@sha256:69cf8e7dcc78e63db74ca6ed570e571e41029accdac21b219b6ac57e9aca63cf AS build
RUN apt-get update && apt-get install -y --no-install-recommends dumb-init

WORKDIR /usr/src/app
COPY . /usr/src/app/
RUN --mount=type=cache,target=/root/.yarn YARN_CACHE_FOLDER=/root/.yarn yarn install --immutable

ARG GIT_VERSION=unknown
ENV VITE_GIT_VERSION=${GIT_VERSION}
RUN yarn build

# PROD IMAGE
FROM node:20.6.1-bullseye-slim@sha256:ee905d8492c443aebe41f4cc525ebabefef757df43556c444be67391cc031cba
RUN apt-get update && apt-get upgrade -y && apt install curl -y && rm -rf /var/lib/apt/lists/*

# renovate: datasource=npm depName=http-server
ENV HTTP_SERVER_VERSION=14.1.1
RUN npm install -g http-server@${HTTP_SERVER_VERSION}

COPY --from=build /usr/bin/dumb-init /usr/bin/dumb-init
USER node
WORKDIR /usr/src/app
COPY --chown=node:node --from=build /usr/src/app/dist /usr/src/app/dist
EXPOSE 5000

ENV PORT 5000

HEALTHCHECK --interval=5s --timeout=5s --retries=3 --start-period=15s CMD curl --fail http://localhost:$PORT || exit 1   

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["sh", "-c", "http-server --brotli --gzip --proxy http://localhost:$PORT? dist"]
