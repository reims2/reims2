# REIMS2 backend

REIMS2 Java Backend with Spring Boot

# Run command

To run the backend, you'll have to type in the following command:

```
export PVH_JWT_SECRET=AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAtestTokenTheKeyNeedsToBeAtLeast512BitsLongElseException
./mvnw spring-boot:run
```

Then you can the API Endpoints via:
http://localhost:9966/pvh/api/glasses

# Swagger Documentation

http://localhost:9966/pvh/swagger-ui.html

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
http://localhost:9966/pvh/api/auth/signin
```

With Following Example Body:

```
{
  "username": "test",
  "password": "testtest"
}
```

You'll get an Bearer Token, which you will need to provide to get access on Endpoints.
