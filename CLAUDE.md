# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

REIMS2 is the inventory app [Partners for Visual Health](https://partnersforvisualhealth.org/) uses at its
annual eyeglass campaigns in El Salvador to match donated glasses to a patient's prescription. Two sites
run independently, Santa Ana (`sa`) and San Miguel (`sm`). Staff are almost always online, so offline-only
features and tests get low priority. Live: https://reims2.app, demo: https://dev.reims2.app.

Five independent projects, each with its own README, dependencies and CI job: `backend/` (Spring Boot 4,
Java 25, Maven), `frontend/` (Vue 3, Vuetify 4, TypeScript PWA), `e2e/` (Playwright), `docs/` (VitePress,
served at `/docs`) and `ansible/` (VPS setup and Docker Compose deploys).

## Commands

### Backend (`backend/`)

```bash
# local DB with the same frozen prod data as dev.reims2.app, login test/testtest
docker run --detach --name reims-db --env MARIADB_USER=reims2 --env MARIADB_PASSWORD=reims \
  --env MARIADB_DATABASE=reims --env MARIADB_ROOT_PASSWORD=root -p 3306:3306 \
  -v "$PWD/../ansible/roles/app/files/staging-seed.sql.gz:/docker-entrypoint-initdb.d/staging-seed.sql.gz:ro" mariadb:13

./mvnw spring-boot:run -Dspring-boot.run.profiles=dev    # :9966, Swagger UI at /swagger-ui/index.html
./mvnw test -Dtest=GlassesRestControllerIntegrationTest   # one class
./mvnw package                                            # what CI runs
```

Tests need Docker for Testcontainers. `@IntegrationTest` classes share one context and database that
nothing cleans up, so a test that breaks a row's invariants must restore it. They sign in with
`@WithMockUser`. JaCoCo fails the build below 95% line or 90% branch coverage. `OpenApiSpecTest` rewrites
`backend/openapi.json` when the API changed: commit it and run `pnpm generate:api` in `frontend/`.

### Frontend (`frontend/`)

```bash
pnpm dev:local     # :3000 against a local backend, dev:remote uses dev.reims2.app
pnpm lint && pnpm format:check
pnpm test          # vitest, one file: pnpm vitest run src/test/philscore_score.test.ts
pnpm test:mutation # Stryker on lib/philscore, blurscore and interleave, CI runs it when they change
pnpm build         # what CI runs
```

### E2E (`e2e/`)

Specs expect REIMS at `http://localhost:3000` (`BASE_URL` overrides it) with login `test`/`testtest`, and
create their own glasses with the `createGlasses` fixture.

```bash
./stack.sh build && ./stack.sh up        # compose stack behind a prod-like Traefik, `down` deletes it
pnpm playwright test --project chromium  # what PRs run, add a spec path for one
pnpm screenshots                         # regenerates docs/src/public/screenshots
```

### Docs and Ansible

`docs/`: `pnpm dev`, `pnpm build`, `pnpm format:check`. `ansible/` normally runs from CI, its README has
the playbook commands, restores and variables.

## Architecture

### Matching runs in the browser

The backend does no prescription matching. `frontend/src/lib/philscore.ts` and `lib/blurscore.ts` score
every pair in the glasses store client-side, and `lib/interleave.ts` mixes blur's picks into PhilScore's
list. Prescriptions only reach the server through the search log. PhilScore is a deliberate port of
REIMS1: read `docs/src/philscore.md` before changing it, any difference from REIMS1 not documented there is
a bug.

### Offline-first sync

The frontend keeps all in-stock glasses of its site in a persisted Pinia store and polls
`GET /api/glasses/{location}/all` with `If-None-Match`. The ETag is a hash `ChangeService` bumps on every
write. Changes that get no response wait in a localStorage outbox (`lib/outbox.ts`). A queued entry is
retried on a 5xx and dropped on a 4xx, so the backend answers 4xx only for a change that can never
succeed, like editing a pair dispensed in the meantime.

### Domain and backend

- A `Glasses` row has a `location`, a `sku` while in stock, and two `Eye`s (`od`/`os`). Axis means nothing
  without cylinder, so check cylinder first when reading stored data.
- Glasses are never deleted. Dispensing clears the SKU and records a `Dispense`, which undispense reverses
  unless the SKU was reused. New pairs skip SKUs freed in the last 10 minutes so an undo finds its SKU free.
  Writes address glasses by id.
- Each write is one transaction that bumps the change hash before any plain read, else InnoDB's snapshot
  can predate the hash lock. Only a locking read of the changed row may come first. The hash row's lock
  also makes writes to a site take turns, so two adds can't pick the same SKU.
- No server-side filtering or paging, the Inventory page does it in the browser.
- Flyway owns the schema, Hibernate only validates. Staging reloads a March 2024 copy of prod on every
  deploy, so `main` tries new migrations on real data before prod.
- Errors are RFC 9457 problem details. `error/ApiExceptionHandler.java` maps domain exceptions to status
  codes, services never pick one.
- Auth is a Spring Session JDBC cookie that holds only the username (`security/SessionUserRepository`), so
  roles come from the database on every request. Writes need the `XSRF-TOKEN` cookie echoed as
  `X-XSRF-TOKEN`. A role hierarchy gives `ROLE_ADMIN` every `ROLE_USER` right.

### Frontend (`frontend/src/`)

`composables/` hold per-page logic, `lib/` framework-agnostic logic and the openapi-fetch client
(`lib/api.ts`), whose middleware turns every failed request into an `ApiError`. Build UI from Vuetify
components, props and utility classes with theme colors from `plugins/vuetify.ts`. Write custom CSS only
when Vuetify can't get the look, and keep it small.

### CI/CD

`pr.yml` runs every project's checks plus Chromium e2e. `main.yml` pushes images to GHCR, runs e2e against
them, then deploys staging and prod through Ansible. Prod is left alone while a campaign uses it
(`ansible/tasks/prod-quiet.yml`).

## Documentation

Read `docs/src/optometry-basics.md`, `philscore.md` and `dev/system.md` before touching related code.
`dev/notes.md` holds raw historical meeting notes, check them against the code before trusting them.

When writing docs, extend an existing page and work new facts into its sentences instead of adding
sections. Short sentences, no em dashes. Longer write-ups (deep dives, investigations, handovers) go in
`docs/src/dev/ai-notes/` as short focused pages, not here.
