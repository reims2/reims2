# java-backend
Java Backend with Spring Boot

# Run command
To run the backend, you'll have to type in the following command:
```
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
  "username": "daniel33",
  "password": "admin!1223",
  "role" : ["mod", "user", "admin"]
}
```

Then you can log in with:
```
http://localhost:9966/pvh/api/auth/signin
```
With Following Example Body:
```
{
  "username": "daniel33",
  "password": "admin!1223"
}
```
You'll get an Bearer Token, which you will need to provide to get access on Endpoints.

