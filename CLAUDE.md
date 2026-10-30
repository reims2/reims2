# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

REIMS2 (Richmond Eyeglass Inventory Matching System) is a mono-repo for the inventory app used by the
non-profit [Partners for Visual Health](https://partnersforvisualhealth.org/) at its annual eyeglass
campaigns in El Salvador. Staff match donated used glasses to a patient's prescription on-site, often
without internet access, at two independent locations: Santa Ana (`sa`) and San Miguel (`sm`).

Live instance: https://reims2.app (demo: https://dev.reims2.app). Public docs: https://reims2.app/docs.

Five independent projects live here, each with its own README, dependencies, and CI job:

- `backend/`: Java 21 / Spring Boot 4 REST API (Maven)
- `frontend/`: Vue 3 / Vuetify 3 / TypeScript SPA (Vite), installable as an offline-capable PWA
- `e2e/`: Playwright tests that run against the full stack from the root `compose.yaml`
- `docs/`: VitePress site published at `/docs`, for both end users and developers
- `ansible/`: playbooks that set up the VPS and deploy the stack as Docker Compose projects

## Commands

### Backend (`backend/`)

```bash
# one-off local DB
docker run --detach --name reims-db --env MARIADB_USER=reims --env MARIADB_PASSWORD=reims \
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
pnpm install
pnpm dev:local     # dev server on :3000 against a local backend on :9966
pnpm dev:remote    # dev server against the dev.reims2.app API instead
pnpm lint          # eslint --fix
pnpm format:check  # prettier --check
pnpm test          # vitest run --coverage
pnpm vitest run src/test/philscore_score.test.ts   # single test file
pnpm build         # vue-tsc --noEmit && vite build, what CI runs
```

### E2E (`e2e/`)

Expects REIMS running at `http://localhost:3000` (override with `BASE_URL`), login `test`/`testtest`.
`e2e/stack.sh` provides exactly that: the root `compose.yaml` stack plus a Traefik that routes like prod,
seeded from `e2e/dump.example.sql` (port via `E2E_PORT`). Specs create their own glasses through the
`createGlasses` fixture in `e2e/tests/fixtures.ts` instead of relying on seed rows.

```bash
./stack.sh build     # or `pull` to test published images (set TAG, e.g. sha-abc1234)
./stack.sh up        # start, or reseed a running stack; `down` deletes it
pnpm install
pnpm test:ui                             # Playwright UI, pick the project top-left before running
pnpm playwright test tests/find.spec.ts  # single spec, headless
pnpm playwright test --project chromium # what CI runs on every PR
```

CI runs the same stack inside the GitHub runner, never on the server: all specs on Chromium on PRs (images
built from source) and on `main` (the images just pushed), on all browsers weekly.

### Docs (`docs/`)

```bash
pnpm install
pnpm dev    # vitepress dev src
pnpm build  # vitepress build src
```

### Ansible (`ansible/`)

Runs backend, frontend, docs, MariaDB, Traefik, Grafana/Prometheus and S3 backups as Docker Compose
projects. CI runs these, see `ansible/README.md` for a new box, restore and variables.

```bash
ansible-playbook -i hosts setup.yml                                   # Docker, firewall, hardening
ansible-playbook -i hosts deploy.yml -e stack=prod --vault-password-file creds/vault_password
ansible-playbook -i hosts deploy.yml -e stack=staging                 # dev.reims2.app
```

## Architecture

### Matching runs entirely client-side

This is the central design fact of the system: the backend does no prescription matching. Given a
prescription typed into the UI, `frontend/src/lib/philscore.ts` filters and scores every glass held in
`useGlassesStore` (`frontend/src/stores/glasses.ts`), purely in the browser. See
`frontend/src/composables/find.ts` for how a search is wired up. This is what lets the app work with no
network connection during a campaign. The backend only learns each search's prescription and match count
(`POST /api/glasses/{location}/searchLog`, stored in `search_log`); that's also the only path by which
prescription values reach the server. The algorithm is a deliberate port of the original REIMS1 implementation. Read
`docs/src/philscore.md` before changing its tolerance or scoring rules: any behavioral difference from
REIMS1 not documented there is treated as a bug, not an opportunity to improve it.

### Offline-first sync

- On load, the frontend fetches all non-dispensed glasses for the current site
  (`GET /api/glasses/{location}/all`) into a Pinia store persisted to local storage.
- Rather than re-polling that full list, it cheaply polls `GET /api/glasses/{location}/changes` for a hash
  that the backend (`ChangeService`) bumps on every write. The full list is only refetched when the hash
  changes.
- Dispense/undispense and edit `PUT` requests and search log `POST`s are queued with Workbox background
  sync (`frontend/vite.config.ts`) when offline, then replayed once connectivity returns. A 5xx on the
  first try isn't queued and shows an error, but a replay that hits a 5xx stays queued. The header's
  "waiting to upload" chip counts the queued dispense/edit requests straight from Workbox's IndexedDB
  (`frontend/src/composables/pending-changes.ts`).

### Domain model

A `Glasses` row has a `location` (`sa`/`sm`), a `sku` (present while in stock, cleared on dispense), a
`glassesType` (`single` or `multifocal`), and two `Eye`s (`os`/`od`) with sphere/cylinder/axis/add.
Dispensing doesn't delete the row. It clears the SKU and stamps a `Dispense` sub-record (reason, previous
SKU) so `PUT /undispense/{id}` can restore it, as long as the SKU hasn't been reissued to a new pair since.

### Backend (`backend/src/main/java/org/pvh/`)

Standard `rest/` → `service/` (`MainService`, `ChangeService`) → `repository/` layering on Spring Data JPA.
There's no server-side filtering or paging of glasses: the View Glasses table filters, sorts and pages the
glasses store in the browser (`frontend/src/composables/table-filter.ts`). DTOs in `model/dto/` are records
that map to and from entities themselves (`GlassesResponseDTO.from`, `GlassesRequestDTO.applyTo`). Each write
runs in one transaction that bumps the change hash first. Errors are RFC 9457 problem details from
`error/ApiExceptionHandler.java`. Only bad input may get a 4xx, since a queued offline change is dropped on a
4xx but retried on a 5xx. Auth is JWT via Spring Security's OAuth2 resource server
(`security/WebSecurityConfig.java`), with roles read from the database on every request. The two roles,
`ROLE_USER` and `ROLE_ADMIN`, are enforced with `@PreAuthorize` per endpoint. Deletes are admin-only; most
other read/write endpoints allow both roles.

### Frontend (`frontend/src/`)

`views/` are routed pages (`router/index.ts` gates everything except `/` and `/login` behind auth).
`stores/` are Pinia state (`glasses`, `auth`, `root` for the selected site and UI state, `users`).
`composables/` hold per-page view-model logic (`find.ts`, `add.ts`, `edit.ts`). `lib/` holds
framework-agnostic core logic (`philscore.ts`, the typed `axios` error/instance wrapper). Path alias `@/`
resolves to `src/`.

### CI/CD

GitHub Actions in `.github/workflows/`: `pr.yml` runs lint+test+build for frontend/backend/docs,
ansible-lint and the e2e specs on PRs. `main.yml` additionally builds and pushes per-component
images to GHCR (`docker.yml`), runs `e2e.yml` against them, then deploys staging (dev.reims2.app) and
production through `ansible.yml`, which runs the `ansible/` playbooks. Pushes leave production alone while
it's in use during a campaign (`ansible/tasks/prod-quiet.yml`). `staging.yml` deploys any branch to staging
by hand, `server-setup.yml` runs `setup.yml`.

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
