# REIMS2 Backend

REIMS2 Java Backend with Spring Boot

# Run command

To run the backend, you'll have to type in the following command:

Spin up a local MariaDB instance with Docker first:

```bash
docker run --detach --rm --name reims-db --env MARIADB_USER=reims --env MARIADB_PASSWORD=reims --env MARIADB_DATABASE=reims --env MARIADB_ROOT_PASSWORD=root -p 3306:3306 mariadb:latest
```

Then start the backend with the following command:

```bash
spring_profiles_active=local ./mvnw spring-boot:run
```

Then you can the API Endpoints via:
http://localhost:9966/api/glasses

# Swagger Documentation

http://localhost:9966/v3/api-docs

http://localhost:9966/swagger-ui/index.html

# Security

Secured by JWT. How to deal with it?
Well, Sign up a user:

```
http://localhost:9966/pvh/api/auth/signup
```

With Following Example Body:

```
{
  "username": "test",
  "password": "testtest",
  "role" : ["mod", "user", "admin"]
}
```

Or, with a one-liner in curl
`curl -d '{"username": "test","password": "testtest","role" : ["mod", "user", "admin"]}' -H "Content-Type: application/json" -X POST https://reims2.app/api/auth/signup`

Then you can log in with:

```
http://localhost:9966/api/auth/signin
```

With Following Example Body:

```
{
  "username": "test",
  "password": "testtest"
}
```

You'll get an Bearer Token, which you will need to provide to get access on Endpoints.
