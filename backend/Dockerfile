# Stage 1: Build
FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /build

# Copy Maven wrapper & pom.xml first for efficient layer caching
COPY pom.xml mvnw ./
COPY .mvn .mvn

RUN chmod +x mvnw && ./mvnw dependency:go-offline -B

# Copy source code and build production jar
COPY src src
RUN ./mvnw clean package -DskipTests -B

# Stage 2: Production Runtime
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Add security non-root user
RUN addgroup -S andara && adduser -S andara -G andara

# Create storage upload directory
RUN mkdir -p /app/uploads && chown -R andara:andara /app

COPY --from=builder /build/target/andara-erp-backend-*.jar app.jar

USER andara

ENV SPRING_PROFILES_ACTIVE=prod
ENV JAVA_TOOL_OPTIONS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=70.0 -XX:+UseG1GC -Djava.security.egd=file:/dev/./urandom"

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]
