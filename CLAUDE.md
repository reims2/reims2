# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

REIMS2 (Richmond Eyeglass Inventory Matching System) is the inventory app
[Partners for Visual Health](https://partnersforvisualhealth.org/) uses at its annual eyeglass campaigns in
El Salvador. Staff match donated used glasses to a patient's prescription at two independent sites, Santa
Ana (`sa`) and San Miguel (`sm`). They're almost always online, so offline-only features and tests get low
priority.

Live: https://reims2.app, demo: https://dev.reims2.app, docs: https://reims2.app/docs.

Five independent projects, each with its own README, dependencies and CI job:

- `backend/`: Java 25 / Spring Boot 4 REST API (Maven)
- `frontend/`: Vue 3 / Vuetify 4 / TypeScript SPA (Vite), an installable PWA
- `e2e/`: Playwright specs against the full stack from the root `compose.yaml`
- `docs/`: VitePress site served at `/docs`, for users and developers
- `ansible/`: playbooks that set up the VPS and deploy everything as Docker Compose projects

## Commands

### Backend (`backend/`)

```bash
# local DB with the same frozen prod data as dev.reims2.app, login test/testtest
docker run --detach --name reims-db --env MARIADB_USER=reims2 --env MARIADB_PASSWORD=reims \
  --env MARIADB_DATABASE=reims --env MARIADB_ROOT_PASSWORD=root -p 3306:3306 \
  -v "$PWD/../ansible/roles/app/files/staging-seed.sql.gz:/docker-entrypoint-initdb.d/staging-seed.sql.gz:ro" mariadb:13

./mvnw spring-boot:run -Dspring-boot.run.profiles=dev    # :9966, Swagger UI at /swagger-ui/index.html
./mvnw test -Dtest=GlassesRestControllerIntegrationTest   # one class, drop -Dtest for all
./mvnw package                                            # what CI runs
```

Tests start MariaDB through Testcontainers, so they need Docker. `@IntegrationTest` classes share one Spring
context and database that nothing cleans up, so a test that breaks a row's invariants has to restore it.
They run with security on and sign in with `@WithMockUser`. `ConcurrencyIntegrationTest` races real transactions against
each other, and JaCoCo fails the build below 95% line or 90% branch coverage. `OpenApiSpecTest` rewrites `backend/openapi.json`
and fails when the API changed: commit it and run `pnpm generate:api` in `frontend/` to regenerate
`src/model/api.d.ts`. CI checks both.

### Frontend (`frontend/`)

```bash
pnpm dev:local     # :3000 against a local backend on :9966, dev:remote uses dev.reims2.app instead
pnpm lint          # eslint --fix
pnpm format:check
pnpm test          # vitest with coverage
pnpm vitest run src/test/philscore_score.test.ts
pnpm test:mutation # Stryker on lib/philscore, blurscore and interleave, CI runs it when they change
pnpm build         # vue-tsc + vite build, what CI runs
```

### E2E (`e2e/`)

Specs expect REIMS at `http://localhost:3000` (`BASE_URL` overrides it) with login `test`/`testtest`.
`./stack.sh` provides that: the root compose stack plus a Traefik that routes like prod, seeded from
`seed.sql`. Specs create their own glasses with the `createGlasses` fixture (`tests/fixtures.ts`).

```bash
./stack.sh build && ./stack.sh up        # `pull` tests published images (TAG=sha-abc1234), `down` deletes
pnpm playwright test --project chromium  # what PRs run, add a spec path for one
pnpm test:ui                             # pick the project top-left first
pnpm screenshots                         # regenerates docs/src/public/screenshots, commit by hand
```

CI runs this stack in the GitHub runner: Chromium on PRs and `main`, all browsers weekly.

### Docs and Ansible

`docs/`: `pnpm dev`, `pnpm build`, `pnpm format:check`.

`ansible/` normally runs from CI. `ansible/README.md` covers a new box, restores and variables.

```bash
ansible-playbook -i hosts setup.yml                     # Docker, firewall, hardening
ansible-playbook -i hosts deploy.yml -e stack=staging   # dev.reims2.app
ansible-playbook -i hosts deploy.yml -e stack=prod --vault-password-file creds/vault_password
```

## Architecture

### Matching runs in the browser

The backend does no prescription matching. `frontend/src/lib/philscore.ts` and `lib/blurscore.ts` (predicted
blur) score every pair in the glasses store (`stores/glasses.ts`) client-side. `lib/interleave.ts` mixes
blur's picks into PhilScore's list as experimental suggestions (`docs/src/dev/ai-notes/predicted-blur-matching.md`),
and `composables/find.ts` wires up a search. Prescription values only reach the server through the search
log (`POST /api/glasses/{location}/searchLog`): the prescription, PhilScore's match count and the shown
pairs. PhilScore is a deliberate port of REIMS1. Read `docs/src/philscore.md` before changing tolerances or
scoring: any difference from REIMS1 not documented there is a bug.

### Offline-first sync

- The frontend keeps all in-stock glasses of the current site (`GET /api/glasses/{location}/all`) in a Pinia
  store persisted to local storage.
- It polls that endpoint with `If-None-Match`. The ETag is a hash that `ChangeService` bumps on every write,
  read in the same transaction as the list, so an unchanged site answers `304` without a body.
- Dispenses, undos and edits that get no response are queued in a localStorage outbox
  (`frontend/src/lib/outbox.ts`) and upload in order while the app is open. Search logs aren't queued. A
  5xx on the first try isn't queued, the page shows it. A queued entry is retried on a 5xx and dropped on a
  4xx, which also makes the next poll reload all glasses. So the backend answers 4xx only for a change that
  can never succeed: bad input, or a conflict like editing a pair dispensed in the meantime.

### Domain model

A `Glasses` row has a `location`, a `sku` (only while in stock), a `glassesType` (`single`/`multifocal`) and
two `Eye`s (`od`/`os`) with sphere, cylinder, axis and add. Axis means nothing without cylinder: the frontend
forces it to 0 then (`sanitizeEyeValues`), but code reading stored data should check cylinder first.

Glasses are never deleted. Dispensing, also with a deletion reason, clears the SKU and stamps a `Dispense`
record (reason, previous SKU), so `PUT /{id}/undispense` can restore it unless the SKU went to a new pair
since. Add hands out the lowest free SKU but skips ones freed in the last 10 minutes, so an undo right after
a dispense still finds its SKU free. Writes address glasses by id, so a queued change can't hit a pair that got
the SKU later.

### Backend (`backend/src/main/java/org/pvh/`)

- `rest/` → `service/` → `repository/` on Spring Data JPA. DTO records in `model/dto/` map to and from
  entities themselves (`GlassesResponseDTO.from`, `GlassesRequestDTO.applyTo`). `LocationEnum` holds the
  sites and their SKU ranges.
- No server-side filtering or paging: the Inventory page filters, sorts and pages the store in the browser
  (`frontend/src/composables/table-filter.ts`).
- Each write is one transaction that bumps the change hash before any plain read, so InnoDB's snapshot
  can't predate the hash lock. Only a locking read of the changed row may come first.
- Flyway owns the schema, Hibernate only validates. Every staging deploy reloads a frozen copy of prod's data
  from March 2024, so a push to `main` tries new migrations on real data before prod.
- Errors are RFC 9457 problem details. `error/ApiExceptionHandler.java` maps the domain exceptions in
  `error/` to status codes, services never pick one.
- Auth is an HttpOnly `SESSION` cookie from Spring Session JDBC (`security/WebSecurityConfig.java`) that
  ends after 90 days without use. The session holds only the username (`SessionUserRepository`), so roles
  come from the database on every request, and deleting a user also deletes their sessions. Writes need the
  `XSRF-TOKEN` cookie echoed as an `X-XSRF-TOKEN` header, which `lib/api.ts` adds. `@PreAuthorize` enforces
  `ROLE_USER` and `ROLE_ADMIN`, a role hierarchy gives admins every user right, and user management is admin-only.

### Frontend (`frontend/src/`)

`views/` are routed pages, and `router/index.ts` puts all but the start page behind login. `composables/`
hold per-page logic (`find.ts`, `add.ts`, `edit.ts`), `lib/` framework-agnostic core logic and the API client
(`lib/api.ts`). It's openapi-fetch typed by `src/model/api.d.ts`, and its middleware turns every failed request into
an `ApiError`. `@/` resolves to `src/`. Build UI from Vuetify components, their props and utility classes, with
colors from the theme in `plugins/vuetify.ts`. Write custom CSS only when Vuetify has no way to get the look,
and keep it small.

### CI/CD

`.github/workflows/pr.yml` runs lint, tests and builds for frontend, backend and docs, plus ansible-lint and
e2e. On Renovate PRs that change the frontend, `visual.yml` also compares the guide screenshots with the PR's
base. `main.yml` also pushes images to GHCR (`docker.yml`), runs e2e against them, then deploys staging and
prod through `ansible.yml`. Prod is left alone while a campaign uses it (`ansible/tasks/prod-quiet.yml`).
`staging.yml` deploys any branch to staging by hand, `server-setup.yml` runs `setup.yml`.

## Documentation

`docs/src/` is the published site (nav in `.vitepress/config.ts`). Read before touching related code:
`optometry-basics.md` (prescription basics), `philscore.md` and `dev/system.md`. `dev/user-stories.md` and
`dev/requirements.md` are the original scope. `dev/notes.md` holds raw historical meeting notes, check them
against the code before trusting them as spec.

When writing docs, extend an existing page and work new facts into its sentences instead of adding
sections, and keep each topic in one place. Short sentences, no em dashes. Longer session write-ups (deep
dives, investigations, handovers) go in `docs/src/dev/ai-notes/` as short focused pages, not here and not in
the repo root.
