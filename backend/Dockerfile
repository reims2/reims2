FROM eclipse-temurin:17.0.8_7-jdk-jammy@sha256:37d9fc7ab7a3612d77ece07b10ba55b11cf7ee2e0ff631d3e2d7b4d01c927ce2 AS build
RUN apt-get update && apt-get install -y --no-install-recommends dumb-init

ENV PORT 5000
WORKDIR /usr/src/app
COPY .mvn/ .mvn
COPY mvnw pom.xml ./
RUN --mount=type=cache,target=/root/.m2 ./mvnw dependency:go-offline
COPY ./src ./src
RUN --mount=type=cache,target=/root/.m2 ./mvnw clean install -DskipTests

# PROD IMAGE
FROM eclipse-temurin:17.0.8_7-jre-jammy@sha256:716e9c69045a1ae0ea5c5a64930f14c7e43f0ff8e3a6c7751fe42e23ee8f643e
RUN apt-get update && apt-get upgrade -y && apt install curl -y && rm -rf /var/lib/apt/lists/*

ENV HOST 0.0.0.0
ENV PORT 5000

WORKDIR /usr/src/app
COPY --from=build /usr/bin/dumb-init /usr/bin/dumb-init
COPY --from=build /usr/src/app/target/*.jar ./app.jar

EXPOSE 5000

HEALTHCHECK --interval=5s --timeout=10s --retries=5 --start-period=20s CMD curl --fail http://localhost:$PORT/api || exit 1   


ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["java",  "-jar", "/usr/src/app/app.jar", "--spring.profiles.active=mysql" ]
