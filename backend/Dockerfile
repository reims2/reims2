FROM eclipse-temurin:17.0.7_7-jdk-jammy AS build

ENV PORT 5000
WORKDIR /usr/src/app
COPY .mvn/ .mvn
COPY mvnw pom.xml ./
RUN --mount=type=cache,target=/root/.m2 ./mvnw dependency:go-offline
COPY ./src ./src
RUN --mount=type=cache,target=/root/.m2 ./mvnw clean install -DskipTests

# PROD IMAGE
FROM eclipse-temurin:17.0.7_7-jre-jammy
RUN apt-get update && apt-get upgrade -y && apt install curl -y && rm -rf /var/lib/apt/lists/*

ENV HOST 0.0.0.0
ENV PORT 5000

WORKDIR /usr/src/app
COPY --from=build /usr/src/app/target/*.jar ./app.jar

EXPOSE 5000

HEALTHCHECK --interval=5s --timeout=10s --retries=5 --start-period=20s CMD curl --fail http://localhost:$PORT/api || exit 1   


ENTRYPOINT ["java",  "-jar", "/usr/src/app/app.jar", "--spring.profiles.active=mysql" ]
