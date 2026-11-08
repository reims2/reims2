# REIMS2 Backend

Java 25 / Spring Boot 4 REST API for REIMS2. See the root `CLAUDE.md` for the architecture.

## Run locally

Start a MariaDB instance with Docker. It loads the same frozen prod data as dev.reims2.app:

```bash
docker run --detach --rm --name reims-db --env MARIADB_USER=reims2 --env MARIADB_PASSWORD=reims --env MARIADB_DATABASE=reims --env MARIADB_ROOT_PASSWORD=root -p 3306:3306 -v "$PWD/../ansible/roles/app/files/staging-seed.sql.gz:/docker-entrypoint-initdb.d/staging-seed.sql.gz:ro" mariadb:13
```

Then start the backend with the `dev` profile:

```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

The API runs on http://localhost:9966/api, Swagger UI on http://localhost:9966/swagger-ui/index.html.

`./mvnw test` runs the tests against a MariaDB that Testcontainers starts, so Docker has to run. If `OpenApiSpecTest` fails, the API changed: commit the rewritten `openapi.json` and run `pnpm generate:api` in `frontend/`.

## Authentication

`POST /api/auth/signin` with `{"username": "test", "password": "testtest"}` (the user in the local database) starts a
session: the `SESSION` cookie authenticates every other request until `POST /api/auth/signout` or 90 days without
use. Requests that change something also need the `XSRF-TOKEN` cookie's value in an `X-XSRF-TOKEN` header, Swagger UI
sends it by itself. Admins create further users via
`POST /api/auth/signup` with `{"username": "...", "password": "...", "roles": [{"name": "ROLE_USER"}]}`.
