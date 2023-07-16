FROM eclipse-temurin:17.0.7_7-jdk-jammy@sha256:34161363f20bc85a98d230f41126b75ac40935580378c8d9ca043ec7a96f23da AS build
RUN apt-get update && apt-get install -y --no-install-recommends dumb-init

ENV PORT 5000
WORKDIR /usr/src/app
COPY .mvn/ .mvn
COPY mvnw pom.xml ./
RUN --mount=type=cache,target=/root/.m2 ./mvnw dependency:go-offline
COPY ./src ./src
RUN --mount=type=cache,target=/root/.m2 ./mvnw clean install -DskipTests

# PROD IMAGE
FROM eclipse-temurin:17.0.7_7-jre-jammy@sha256:f9d5e219ba439970ed373ff6e9f5ba2746db45789949f9f3fa474aa6bab1eae7
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
