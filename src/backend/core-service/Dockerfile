# Human Tasks:
# 1. Configure container registry credentials in CI/CD pipeline
# 2. Set up environment-specific configuration for SPRING_PROFILES_ACTIVE
# 3. Configure container resource limits in Kubernetes/deployment platform
# 4. Set up log volume mounts in production environment
# 5. Configure network policies for the exposed port
# 6. Set up monitoring for container health checks

# Addresses requirement: Containerization - Container specifications for core services using OpenJDK 17 Slim base image
# Build stage
FROM gradle:8.2.0-jdk17 AS builder

# Set working directory
WORKDIR /app

# Copy Gradle configuration files
COPY build.gradle settings.gradle ./
COPY gradle ./gradle

# Copy source code and resources
COPY src ./src

# Build application with Gradle and create layered JAR
# Addresses requirement: Core Service Framework - Spring Boot 3.1.x as the industry standard Java enterprise framework
RUN gradle bootJar --no-daemon

# Extract layers for optimized Docker caching
RUN mkdir -p build/dependency && \
    cd build/dependency && \
    jar -xf ../libs/*.jar

# Runtime stage
# Addresses requirement: Core Service Technology Stack - Java 17 LTS for enterprise-grade stability
FROM eclipse-temurin:17-jdk-jammy

# Create non-root user for security
RUN useradd -r -u 1001 -g root springapp

# Set working directory
WORKDIR /app

# Copy application layers from builder stage
COPY --from=builder /app/build/dependency/BOOT-INF/lib ./lib
COPY --from=builder /app/build/dependency/META-INF ./META-INF
COPY --from=builder /app/build/dependency/BOOT-INF/classes ./classes

# Set ownership to non-root user
RUN chown -R springapp:root /app && \
    chmod -R g+rwX /app

# Switch to non-root user
USER 1001

# Configure JVM options for containerized environment
ENV JAVA_OPTS="-XX:+UseContainerSupport \
    -XX:MaxRAMPercentage=75.0 \
    -XX:InitialRAMPercentage=50.0 \
    -XX:+UseG1GC \
    -XX:+HeapDumpOnOutOfMemoryError \
    -XX:HeapDumpPath=/app/logs/heapdump.hprof \
    -Djava.security.egd=file:/dev/./urandom \
    -Dspring.profiles.active=${SPRING_PROFILES_ACTIVE:dev} \
    -Dserver.port=8080"

# Expose application port
# Addresses requirement from application.yml - server.port configuration
EXPOSE 8080

# Configure health check using Spring Boot Actuator
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8080/api/v1/actuator/health || exit 1

# Set entrypoint to run Spring Boot application
ENTRYPOINT [ "sh", "-c", \
    "java $JAVA_OPTS -cp lib/*:classes org.springframework.boot.loader.JarLauncher" ]

# Labels for container metadata
LABEL maintainer="Dollar Funding Development Team" \
      application="core-service" \
      version="1.0.0" \
      description="MCA Processing System Core Service"