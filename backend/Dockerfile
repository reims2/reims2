FROM eclipse-temurin:21.0.2_13-jdk-jammy@sha256:feacf32a39822acd503b5ba0cda9944c465ae0c8a50ee71d094d584272927508 AS build

ENV PORT 5000
WORKDIR /usr/src/app
COPY .mvn/ .mvn
COPY mvnw pom.xml ./
RUN --mount=type=cache,target=/root/.m2 ./mvnw dependency:go-offline

COPY ./src ./src
RUN --mount=type=cache,target=/root/.m2 ./mvnw clean install -DskipTests

WORKDIR /usr/src/app/target
RUN java -Djarmode=layertools -jar ./*.jar extract

# PROD IMAGE
FROM eclipse-temurin:21.0.2_13-jre-alpine@sha256:d605fa47b2fba5c4152836258ebedc5e185c04cfce6344333045d98958611411
RUN apk add dumb-init

ENV HOST 0.0.0.0
ENV PORT 5000
EXPOSE $PORT

WORKDIR /usr/src/app
COPY --from=build /usr/src/app/target/dependencies/ ./
COPY --from=build /usr/src/app/target/spring-boot-loader/ ./
COPY --from=build /usr/src/app/target/snapshot-dependencies/ ./
COPY --from=build /usr/src/app/target/application/ ./

HEALTHCHECK --interval=5s --timeout=10s --retries=5 --start-period=20s CMD wget -nv -t1 --spider http://localhost:$PORT/api || exit 1   

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["java", "org.springframework.boot.loader.launch.JarLauncher", "--spring.profiles.active=prod" ]
