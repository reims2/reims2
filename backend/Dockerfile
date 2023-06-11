FROM eclipse-temurin:17.0.7_7-jdk-jammy AS build

WORKDIR /usr/src/app
COPY .mvn/ .mvn
COPY mvnw pom.xml ./
RUN ./mvnw dependency:go-offline
COPY ./src ./src
RUN ./mvnw clean install

# PROD IMAGE
FROM eclipse-temurin:17.0.7_7-jre-jammy
RUN apt-get update && apt-get upgrade -y

ENV HOST 0.0.0.0
ENV PORT 5000

WORKDIR /usr/src/app
COPY --from=build /usr/src/app/target/*.jar ./app.jar

EXPOSE 5000
ENTRYPOINT ["java", "-jar", "/usr/src/app/app.jar" ]
