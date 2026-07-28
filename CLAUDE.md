# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

REIMS2 (Richmond Eyeglass Inventory Matching System) is a mono-repo for the inventory app used by the
non-profit [Partners for Visual Health](https://partnersforvisualhealth.org/) at its annual eyeglass
campaigns in El Salvador. Staff match donated used glasses to a patient's prescription on-site, often
without internet access, at two independent locations: Santa Ana (`sa`) and San Miguel (`sm`).

Live instance: https://reims2.app (demo: https://dev.reims2.app). Public docs: https://reims2.app/docs.

Five independent projects live here, each with its own README, dependencies, and CI job:

- `backend/`: Java 21 / Spring Boot 3 REST API (Maven)
- `frontend/`: Vue 3 / Vuetify 3 / TypeScript SPA (Vite), installable as an offline-capable PWA
- `e2e/`: Playwright tests that run against a deployed instance of the frontend and backend
- `docs/`: VitePress site published at `/docs`, for both end users and developers
- `ansible/`: playbooks that deploy the whole stack to a VPS via Docker Swarm

## Commands

### Backend (`backend/`)

```bash
# one-off local DB
docker run --detach --rm --name reims-db --env MARIADB_USER=reims --env MARIADB_PASSWORD=reims \
  --env MARIADB_DATABASE=reims --env MARIADB_ROOT_PASSWORD=root -p 3306:3306 mariadb:latest

./mvnw spring-boot:run -Dspring-boot.run.profiles=dev    # http://localhost:9966, swagger-ui at /swagger-ui/index.html
./mvnw test                                              # all tests
./mvnw test -Dtest=GlassesRestControllerIntegrationTest   # single test class
./mvnw package                                            # build, what CI runs
```

The `dev` profile drops/recreates the schema against the MariaDB container above and seeds it via Flyway
test-data migrations. Tests run against an in-memory H2 DB with security disabled instead
(`src/test/resources/application.properties`), so `./mvnw test` needs no Docker container.

### Frontend (`frontend/`)

```bash
corepack enable && yarn install
yarn dev:local     # dev server on :3000 against a local backend on :9966
yarn dev:remote    # dev server against the dev.reims2.app API instead
yarn lint          # eslint --fix
yarn format:check  # prettier --check
yarn test          # vitest run --coverage
yarn vitest run src/test/philscore_score.test.ts   # single test file
yarn build         # vue-tsc --noEmit && vite build, what CI runs
```

### E2E (`e2e/`)

Expects REIMS running at `http://localhost:3000` (override with `BASE_URL`), login `test`/`testtest`.

```bash
yarn install
yarn test:ui                             # Playwright UI, pick the project top-left before running
yarn playwright test tests/find.spec.ts  # single spec, headless
```

CI only runs specs tagged `@fast` on pushes/PRs. The full suite runs weekly against a throwaway `e2e`
instance that's deployed and torn down for the run.

### Docs (`docs/`)

```bash
yarn install
yarn dev    # vitepress dev src
yarn build  # vitepress build src
```

### Ansible (`ansible/`)

Deploys backend, frontend, docs, MariaDB, Traefik, Grafana/Prometheus and S3 backups as a Docker Swarm
stack: `ansible-playbook -i hosts main.yml`. See `ansible/README.md` for required variables.

## Architecture

### Matching runs entirely client-side

This is the central design fact of the system: the backend does no prescription matching. Given a
prescription typed into the UI, `frontend/src/lib/philscore.ts` filters and scores every glass held in
`useGlassesStore` (`frontend/src/stores/glasses.ts`), purely in the browser. See
`frontend/src/composables/find.ts` for how a search is wired up. This is what lets the app work with no
network connection during a campaign. The backend only learns about a search when it finds no match
(`POST /api/glasses/{location}/unsuccessfulSearch`); that's also the only path by which prescription
values reach the server. The algorithm is a deliberate port of the original REIMS1 implementation. Read
`docs/src/philscore.md` before changing its tolerance or scoring rules: any behavioral difference from
REIMS1 is treated as a bug, not an opportunity to improve it.

### Offline-first sync

- On load, the frontend fetches all non-dispensed glasses for the current site
  (`GET /api/glasses/{location}/all`) into a Pinia store persisted to local storage.
- Rather than re-polling that full list, it cheaply polls `GET /api/glasses/{location}/changes` for a hash
  that the backend (`ChangeService`) bumps on every write. The full list is only refetched when the hash
  changes.
- Dispense/undispense and edit `PUT` requests are queued with Workbox background sync
  (`frontend/vite.config.ts`) when offline, then replayed once connectivity returns.

### Domain model

A `Glasses` row has a `location` (`sa`/`sm`), a `sku` (present while in stock, cleared on dispense), a
`glassesType` (`single` or `multifocal`), and two `Eye`s (`os`/`od`) with sphere/cylinder/axis/add.
Dispensing doesn't delete the row. It clears the SKU and stamps a `Dispense` sub-record (reason, previous
SKU) so `PUT /undispense/{id}` can restore it, as long as the SKU hasn't been reissued to a new pair since.

### Backend (`backend/src/main/java/org/pvh/`)

Standard `rest/` → `service/` (`MainService`, `ChangeService`) → `repository/` layering on Spring Data JPA.
Free-text filtering (the `?search=` param on `GET /api/glasses/{location}`) goes through a hand-rolled RSQL
layer in `repository/RSQL/`, which also resolves dotted, joined properties, e.g.
`od.sphere>=2.0;glassesType==single`. DTO-to-entity mapping uses MapStruct (`model/mapper/*Impl`). Despite
being Spring `@Component`s, the codebase calls them via a static `getInstance()` singleton rather than
autowiring. Follow that existing convention rather than injecting `GlassesMapper` directly. Auth is JWT
(`security/jwt/`) with two roles, `ROLE_USER` and `ROLE_ADMIN`, enforced with `@PreAuthorize` per endpoint.
Deletes are admin-only; most other read/write endpoints allow both roles.

### Frontend (`frontend/src/`)

`views/` are routed pages (`router/index.ts` gates everything except `/` and `/login` behind auth).
`stores/` are Pinia state (`glasses`, `auth`, `root` for the selected site and UI state, `table`, `users`).
`composables/` hold per-page view-model logic (`find.ts`, `add.ts`, `edit.ts`). `lib/` holds
framework-agnostic core logic (`philscore.ts`, the typed `axios` error/instance wrapper). Path alias `@/`
resolves to `src/`.

### CI/CD

GitHub Actions in `.github/workflows/`: `pr.yml` runs lint+test+build for frontend/backend/docs on PRs
into `main`/`dev`. `main.yml` additionally builds and pushes per-component Docker images (`docker.yml`),
deploys to `dev.reims2.app` on pushes to `dev`, and on `main` runs the full pipeline plus `e2e.yml` before
`prod-deploy.yml` promotes to production. Deploys go through the `ansible/` playbooks against the Docker
Swarm stack.

## Documentation

`docs/src/` is the VitePress source for the published site (nav/sidebar in `docs/src/.vitepress/config.ts`).
Worth reading before touching related code: `optometry-basics.md` (domain background for prescriptions),
`philscore.md` (matching algorithm), `dev/system.md` (system overview), `dev/user-stories.md` /
`dev/requirements.md` (original product scope), `dev/notes.md` (raw meeting notes, historical: check
against current code before trusting as spec).

When adding documentation, extend an existing page and integrate new facts into existing sentences
instead of bolting on new sections. Check whether a topic is already covered elsewhere before adding
a new page, and consolidate into one place rather than restating it. Keep sentences short. Skip em
dashes. Longer write-ups from a session (architecture deep-dives, investigation reports, migration
handovers) belong in `docs/src/dev/ai-notes/`, not this file and not the repo root. Keep entries
there short too: one focused page beats an exhaustive one.
