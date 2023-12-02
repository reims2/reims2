FROM eclipse-temurin:21.0.1_12-jdk-jammy@sha256:948e69a959820ea040f843e34122d2537a2b28ddd07b4b707e6e852f66c20a74 AS build
RUN apt-get update && apt-get install -y --no-install-recommends dumb-init

ENV PORT 5000
WORKDIR /usr/src/app
COPY .mvn/ .mvn
COPY mvnw pom.xml ./
RUN --mount=type=cache,target=/root/.m2 ./mvnw dependency:go-offline
COPY ./src ./src
RUN --mount=type=cache,target=/root/.m2 ./mvnw clean install -DskipTests

# PROD IMAGE
FROM eclipse-temurin:21.0.1_12-jre-jammy@sha256:21628a404fffff882686af8cc4e27d276c5f55296f5baad46822c684e41305c5
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
