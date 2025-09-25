# End to end tests for REIMS

## How to run

Reims is expected to be running at `http://localhost:3000` with username `test` and password `testtest`.

1. `yarn install`

2. `yarn run test:ui` for the playwright UI

3. Don't forget to set the active project in the top left corner in the playwright UI

## Optionally

Environment variable `BASE_URL` can be used to change REIMS URL.

`yarn run test` to run tests in console

### To run with docker

A hacky workaround using npm. Delete `node_modules` and `package-lock.json` after running this, otherwise yarn will complain.

`export DISPLAY=:0.0 && xhost +local:docker; docker run -it -v ./:/srv/e2e --rm --ipc=host --net=host --volume="$HOME/.Xauthority:/root/.Xauthority:rw" -e DISPLAY=$DISPLAY mcr.microsoft.com/playwright:v1.55.0 /bin/bash -c 'cd /srv/e2e/ && BASE_URL=http://localhost:5173/; npm i; npx -y playwright test --ui`
