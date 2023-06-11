FROM node:16 AS build
RUN apt-get update && apt-get install -y --no-install-recommends dumb-init

WORKDIR /usr/src/app
COPY . /usr/src/app/
RUN yarn install --immutable
RUN yarn build
RUN yarn workspaces focus --production

# PROD IMAGE
FROM node:16.20.0-bullseye-slim
RUN apt-get update && apt-get upgrade -y

ENV NODE_ENV production

COPY --from=build /usr/bin/dumb-init /usr/bin/dumb-init
USER node
WORKDIR /usr/src/app
COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/package.json ./package.json
COPY --chown=node:node --from=build /usr/src/app/src/.vuepress ./src/.vuepress

EXPOSE 5000
CMD ["dumb-init", "node", "node_modules/.bin/vuepress", "serve", "--host", "0.0.0.0", "--port", "5000", "src"]
