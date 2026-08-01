FROM eclipse-temurin:25.0.3_9-jdk-jammy@sha256:0348e7b24ad4479cf35927b750671bb4b78465c303003b08536f6f2fa6f180cd AS build

ENV PORT=5000
WORKDIR /usr/src/app
COPY .mvn/ .mvn
COPY mvnw pom.xml ./
RUN --mount=type=cache,target=/root/.m2 ./mvnw -Dmaven.repo.local=/root/.m2 dependency:go-offline

COPY ./src ./src
RUN --mount=type=cache,target=/root/.m2 ./mvnw -Dmaven.repo.local=/root/.m2 clean install -DskipTests

WORKDIR /usr/src/app/target
RUN mv ./*.jar application.jar
RUN java -Djarmode=tools -jar application.jar extract --layers --destination extracted

# PROD IMAGE
FROM eclipse-temurin:25.0.3_9-jre-alpine@sha256:28db6fdf60e38945e43d840c0333aeaec66c15943070104f7586fd3c9d1665b0
RUN apk add dumb-init

ENV HOST=0.0.0.0
ENV PORT=5000
EXPOSE $PORT

WORKDIR /usr/src/app
COPY --from=build /usr/src/app/target/extracted/dependencies/ ./
COPY --from=build /usr/src/app/target/extracted/spring-boot-loader/ ./
COPY --from=build /usr/src/app/target/extracted/snapshot-dependencies/ ./
COPY --from=build /usr/src/app/target/extracted/application/ ./

HEALTHCHECK --interval=5s --timeout=10s --retries=8 --start-period=20s CMD wget -nv -t1 --spider http://localhost:$PORT/api || exit 1   

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["java", "-jar", "application.jar", "--spring.profiles.active=prod" ]
