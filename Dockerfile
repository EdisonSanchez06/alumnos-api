FROM eclipse-temurin:17-jdk-alpine

WORKDIR /app

COPY .mvn/ .mvn
COPY ["mvnw", "."]
COPY ["mvnw.cmd", "."]
COPY ["pom.xml", "."]

RUN chmod +x mvnw
RUN ./mvnw dependency:go-offline

COPY src ./src

EXPOSE 8080

CMD ["./mvnw", "spring-boot:run"]
