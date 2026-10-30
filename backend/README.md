# REIMS2 Backend

Java 25 / Spring Boot 4 REST API for REIMS2. See the root `CLAUDE.md` for the architecture.

## Run locally

Start a MariaDB instance with Docker:

```bash
docker run --detach --rm --name reims-db --env MARIADB_USER=reims --env MARIADB_PASSWORD=reims --env MARIADB_DATABASE=reims --env MARIADB_ROOT_PASSWORD=root -p 3306:3306 mariadb:latest
```

Then start the backend with the `dev` profile, which recreates the schema and fills it with test data:

```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

The API runs on http://localhost:9966/api, Swagger UI on http://localhost:9966/swagger-ui/index.html.

`./mvnw test` runs the tests against an in-memory H2 database, no Docker needed.

## Authentication

`POST /api/auth/signin` with `{"username": "test", "password": "testtest"}` (a user from the dev test data) returns a JWT
as `accessToken`. Send it as `Authorization: Bearer <token>` with every other request. Admins create further users via
`POST /api/auth/signup` with `{"username": "...", "password": "...", "roles": [{"name": "ROLE_USER"}]}`.
