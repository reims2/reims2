FROM bellsoft/liberica-openjdk-debian:25.0.1-11 AS build
WORKDIR /workspace

COPY .mvn/ .mvn
COPY mvnw pom.xml ./
RUN --mount=type=cache,target=/root/.m2 ./mvnw -Dmaven.repo.local=/root/.m2 -B dependency:go-offline

COPY src src
RUN --mount=type=cache,target=/root/.m2 ./mvnw -Dmaven.repo.local=/root/.m2 -B clean install -DskipTests

RUN mv /workspace/target/*.jar application.jar
RUN java -Djarmode=tools -jar application.jar extract --layers --destination /workspace/layers

# PROD IMAGE
FROM bellsoft/liberica-openjre-alpine:25.0.1-11 AS runtime
RUN apk add --no-cache dumb-init

RUN addgroup -S app && adduser -S -G app app
USER app:app

ENV HOST=0.0.0.0
ENV PORT=5000
EXPOSE $PORT

WORKDIR /app
COPY --from=build /workspace/layers/dependencies/ ./
COPY --from=build /workspace/layers/spring-boot-loader/ ./
COPY --from=build /workspace/layers/snapshot-dependencies/ ./
COPY --from=build /workspace/layers/application/ ./
COPY --from=build /workspace/application.jar ./

HEALTHCHECK --interval=5s --timeout=10s --retries=8 --start-period=20s CMD wget -nv -t1 --spider http://localhost:$PORT/actuator/health || exit 1

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["java", "-jar", "application.jar", "--spring.profiles.active=prod"]
