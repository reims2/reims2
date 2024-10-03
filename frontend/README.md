# REIMS2 frontend

[![CI Workflow](https://img.shields.io/github/actions/workflow/status/reims2/reims2-frontend/ci.yml?branch=main&label=ci)](https://github.com/reims2/reims2-frontend/actions/workflows/ci.yml)
![Uptime](https://img.shields.io/uptimerobot/ratio/m789007197-530f6cec68b3f8f49de17c99?label=uptime)
[![Lighthouse](https://img.shields.io/github/actions/workflow/status/reims2/reims2-frontend/lighthouse.yml?branch=main&label=Lighthouse)](https://github.com/reims2/reims2-frontend/actions/workflows/lighthouse.yml)

This is the frontend for [REIMS2](https://reims2.app)

## Build Setup

```bash
# install yarn, only required once
corepack enable

# Install dependencies
yarn install

# Run dev server for local API
yarn run dev:local
# or, using the remote dev API
yarn run dev:remote
```

Available at http://localhost:3000. The local API is expected to be running at http://localhost:9966 (default of reims2-backend)).
