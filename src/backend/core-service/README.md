# Dollar Funding MCA Processing System - Core Service

## Overview

The Core Service is a Spring Boot-based application that serves as the central business logic and data management component of the MCA Processing System. It provides robust REST APIs for system integration, handles merchant data processing, and manages application workflows with asynchronous support.

> **Human Tasks:**
> 1. Configure database credentials in application.properties
> 2. Set up Auth0 tenant and configure JWT settings
> 3. Configure async task executor thread pool sizes based on environment
> 4. Set up monitoring for async task execution metrics
> 5. Configure scheduled task cron expressions
> 6. Set up SSL certificates for HTTPS
> 7. Configure backup retention policies
> 8. Set up log rotation and archival

## Prerequisites

- Java 17 LTS
- PostgreSQL 14.x
- Gradle 8.2.0+
- Redis 7.0+ (for caching)
- Auth0 account for authentication
- AWS account for cloud services

## Setup Instructions

### 1. Database Setup

```bash
# Create PostgreSQL database
createdb -U postgres mca_processing

# Run migrations
./gradlew flywayMigrate
```

### 2. Application Configuration

Create `application.properties` in `src/main/resources`:

```properties
# Server Configuration
server.port=8080
server.servlet.context-path=/api/v1

# Database Configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/mca_processing
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect

# Connection Pool Settings
spring.datasource.hikari.maximum-pool-size=10
spring.datasource.hikari.minimum-idle=5
spring.datasource.hikari.idle-timeout=300000

# Redis Cache Configuration
spring.redis.host=${REDIS_HOST}
spring.redis.port=6379
spring.redis.password=${REDIS_PASSWORD}

# Auth0 Configuration
auth0.audience=${AUTH0_AUDIENCE}
auth0.issuer=${AUTH0_ISSUER}
spring.security.oauth2.resourceserver.jwt.issuer-uri=${AUTH0_ISSUER}

# Async Executor Configuration
core.async.core-pool-size=5
core.async.max-pool-size=10
core.async.queue-capacity=25

# Actuator Configuration
management.endpoints.web.exposure.include=health,metrics,prometheus
management.endpoint.health.show-details=always
```

### 3. Building the Application

```bash
# Clean and build
./gradlew clean build

# Run tests
./gradlew test

# Build Docker image
./gradlew bootBuildImage
```

### 4. Running the Application

```bash
# Run locally
./gradlew bootRun

# Run with specific profile
java -jar -Dspring.profiles.active=prod build/libs/core-service-1.0.0.jar
```

## API Documentation

### Authentication

All API endpoints require JWT authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

### Endpoints

#### Application Management

```
GET /applications
POST /applications
GET /applications/{id}
PUT /applications/{id}
DELETE /applications/{id}
```

#### Document Management

```
POST /applications/{id}/documents
GET /applications/{id}/documents
GET /applications/{id}/documents/{documentId}
DELETE /applications/{id}/documents/{documentId}
```

#### Webhook Management

```
POST /webhooks
GET /webhooks
DELETE /webhooks/{id}
```

### Response Format

```json
{
  "data": {
    "id": "uuid",
    "type": "application",
    "attributes": {
      "status": "PENDING",
      "merchantName": "Example Corp",
      "fundingAmount": 50000.00
    },
    "relationships": {
      "documents": {
        "data": [
          {
            "id": "uuid",
            "type": "document"
          }
        ]
      }
    }
  },
  "meta": {
    "timestamp": "2023-07-20T10:30:00Z",
    "version": "1.0"
  }
}
```

## Configuration Guide

### Environment Variables

Required environment variables:

```
DB_USERNAME=database_user
DB_PASSWORD=database_password
REDIS_HOST=redis.host
REDIS_PASSWORD=redis_password
AUTH0_AUDIENCE=your_auth0_audience
AUTH0_ISSUER=your_auth0_issuer
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
```

### Security Configuration

1. JWT Configuration:
   - Configure Auth0 tenant
   - Set up API audience
   - Configure allowed scopes

2. SSL Configuration:
   - Place SSL certificate in `src/main/resources/keystore`
   - Configure SSL properties in application.properties

3. CORS Configuration:
   - Configure allowed origins in SecurityConfig
   - Set up allowed methods and headers

## Development Guidelines

### Code Structure

```
src/
├── main/
│   ├── java/
│   │   └── com/
│   │       └── dollarfunding/
│   │           └── core/
│   │               ├── config/
│   │               ├── controller/
│   │               ├── model/
│   │               ├── repository/
│   │               ├── service/
│   │               └── util/
│   └── resources/
│       ├── db/
│       │   └── migration/
│       └── application.properties
└── test/
```

### Coding Standards

1. Follow Spring Boot best practices
2. Use constructor injection for dependencies
3. Implement proper exception handling
4. Write comprehensive unit tests
5. Document public APIs with Javadoc

### Async Processing

1. Use @Async annotation for non-blocking operations
2. Configure thread pools appropriately
3. Implement proper error handling
4. Monitor async task execution

### Security Best Practices

1. Input validation
2. Output encoding
3. Proper error handling
4. Secure password storage
5. Rate limiting
6. Audit logging

## Testing

### Unit Tests

```bash
# Run unit tests
./gradlew test

# Run with coverage
./gradlew test jacocoTestReport
```

### Integration Tests

```bash
# Run integration tests
./gradlew integrationTest

# Run with specific profile
./gradlew integrationTest -Dspring.profiles.active=test
```

### Performance Tests

```bash
# Run performance tests
./gradlew performanceTest
```

## Deployment

### Production Deployment

1. Build production JAR:
```bash
./gradlew bootJar
```

2. Build Docker image:
```bash
docker build -t core-service:1.0.0 .
```

3. Deploy to Kubernetes:
```bash
kubectl apply -f k8s/
```

### Database Migrations

```bash
# Create new migration
./gradlew createMigration -Pname=add_new_table

# Apply migrations
./gradlew flywayMigrate

# Verify migrations
./gradlew flywayInfo
```

### Monitoring Setup

1. Configure Prometheus metrics
2. Set up Grafana dashboards
3. Configure log aggregation
4. Set up alerting rules

### Backup Procedures

1. Database backups:
   - Automated daily backups
   - Point-in-time recovery
   - Cross-region replication

2. Document backups:
   - S3 versioning
   - Cross-region replication
   - Lifecycle policies

## Support

For technical support and troubleshooting:
1. Check application logs
2. Monitor actuator endpoints
3. Review error tracking system
4. Contact DevOps team

## License

Copyright © 2023 Dollar Funding. All rights reserved.