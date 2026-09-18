FROM eclipse-temurin:25.0.4_7-jdk-jammy@sha256:0cbcd13ae550a9c8334d5ef4483a4247625f47067f16127e28638fdafaeb35ea AS build

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
FROM eclipse-temurin:25.0.4_7-jre-alpine@sha256:2ca9adf44f5c29d28ecd26cf92d75cc0c66b7f32bfd839a4439e363a8b428af8
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
