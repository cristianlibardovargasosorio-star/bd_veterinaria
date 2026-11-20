# Etapa 1: Build con Maven (no incluida en la imagen final)
FROM maven:3.9.9-eclipse-temurin-21-alpine AS builder
WORKDIR /build
COPY pom.xml .
RUN mvn -B dependency:go-offline
COPY src ./src
RUN mvn -B clean package -DskipTests

# Etapa 2: Runtime mínimo sin código fuente ni herramientas de compilación
FROM eclipse-temurin:21-jre-alpine AS runtime
WORKDIR /app

RUN addgroup -S vetsoft && adduser -S vetsoft -G vetsoft
COPY --from=builder /build/target/*.jar app.jar
RUN chown -R vetsoft:vetsoft /app

USER vetsoft
EXPOSE 8080
HEALTHCHECK --interval=15s --timeout=5s --start-period=25s --retries=5 \
  CMD wget -qO- http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
