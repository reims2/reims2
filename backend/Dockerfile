FROM eclipse-temurin:25.0.2_10-jdk-jammy@sha256:2b4712613c67b3484a7fa3f533357700b863767b179eb9d2edbfa43362cd11a5 AS build

ENV PORT=5000
WORKDIR /usr/src/app
COPY .mvn/ .mvn
COPY mvnw pom.xml ./
RUN --mount=type=cache,target=/root/.m2 ./mvnw -Dmaven.repo.local=/root/.m2 dependency:go-offline

COPY ./src ./src
RUN --mount=type=cache,target=/root/.m2 ./mvnw -Dmaven.repo.local=/root/.m2 clean install -DskipTests

WORKDIR /usr/src/app/target
RUN java -Djarmode=layertools -jar ./*.jar extract

# PROD IMAGE
FROM eclipse-temurin:25.0.2_10-jre-alpine@sha256:f10d6259d0798c1e12179b6bf3b63cea0d6843f7b09c9f9c9c422c50e44379ec
RUN apk add dumb-init

ENV HOST=0.0.0.0
ENV PORT=5000
EXPOSE $PORT

WORKDIR /usr/src/app
COPY --from=build /usr/src/app/target/dependencies/ ./
COPY --from=build /usr/src/app/target/spring-boot-loader/ ./
COPY --from=build /usr/src/app/target/snapshot-dependencies/ ./
COPY --from=build /usr/src/app/target/application/ ./

HEALTHCHECK --interval=5s --timeout=10s --retries=8 --start-period=20s CMD wget -nv -t1 --spider http://localhost:$PORT/api || exit 1   

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["java", "org.springframework.boot.loader.launch.JarLauncher", "--spring.profiles.active=prod" ]
