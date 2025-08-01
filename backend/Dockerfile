FROM eclipse-temurin:21.0.7_6-jdk-jammy@sha256:746ad7128069fdaa77df1f06a0463ad50f4ae787648cbbcc6d6ab0e702e6c97e AS build

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
FROM eclipse-temurin:21.0.7_6-jre-alpine@sha256:7b5c88eb4182a92aab3a4b10550061a6e18639bf176e7ebca21f866b19f853c1
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
