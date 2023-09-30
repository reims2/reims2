FROM node:20@sha256:6b3f9aa7eefa8d4c93d43914e78aa2bfea9a12808b0059e5da78854dfa8b8768 AS build
RUN apt-get update && apt-get install -y --no-install-recommends dumb-init

WORKDIR /usr/src/app
COPY . /usr/src/app/
RUN --mount=type=cache,target=/root/.yarn YARN_CACHE_FOLDER=/root/.yarn yarn install --immutable

ARG GIT_VERSION=unknown
ENV VITE_GIT_VERSION=${GIT_VERSION}
RUN yarn build

# PROD IMAGE
FROM node:20.8.0-bullseye-slim@sha256:ae31e40fdecf15751ee23055b60717e2ce6e03acc4ee7ffd8f87e76813d8010f
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
