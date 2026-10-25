# End to end tests for REIMS

## How to run

Reims is expected to be running at `http://localhost:3000` with username `test` and password `testtest`.
`./stack.sh build && ./stack.sh up` starts exactly that with Docker (the root `compose.yaml` plus a
Traefik routing like prod), and `./stack.sh down` removes it again. CI runs the tests the same way,
plus `pnpm lint`, `pnpm format:check` and `pnpm typecheck`. Specs create the glasses they need through
the API with the `createGlasses` fixture (`tests/fixtures.ts`), which deletes them again afterwards, so
don't rely on the seeded rows.

1. `pnpm install`

2. `pnpm test:ui` for the playwright UI

3. Don't forget to set the active project in the top left corner in the playwright UI

## Optionally

Environment variable `BASE_URL` can be used to change REIMS URL.

`pnpm test` to run tests in console

### To run with docker

A hacky workaround that runs the Playwright UI from its Docker image.

`export DISPLAY=:0.0 && xhost +local:docker; docker run -it -v ./:/srv/e2e --rm --ipc=host --net=host --volume="$HOME/.Xauthority:/root/.Xauthority:rw" -e DISPLAY=$DISPLAY mcr.microsoft.com/playwright:v1.55.0 /bin/bash -c 'cd /srv/e2e/ && BASE_URL=http://localhost:5173/; corepack enable; pnpm install; pnpm playwright test --ui`
