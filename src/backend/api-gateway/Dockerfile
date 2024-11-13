# Human Tasks:
# 1. Verify SSL certificate paths and ensure certificates are properly installed
# 2. Configure REDIS_PASSWORD environment variable in deployment
# 3. Review memory cache size based on production load requirements
# 4. Test SSL/TLS configuration with production certificates
# 5. Verify client body size limits match application requirements

# Stage 1: Builder
# REQ-8.3.1 Container Strategy: Implements secure multi-stage build with minimal attack surface
FROM kong:3.4.x-alpine AS builder

# Install build dependencies and security updates
RUN apk update && \
    apk add --no-cache \
    curl=8.4.0-r0 \
    openssl=1.1.1u-r2 \
    lua-dev=5.4.6-r0 \
    gcc=12.2.1_git20220924-r10 \
    musl-dev=1.2.4-r2 \
    make=4.4.1-r1 \
    git=2.40.1-r0

# Install Kong plugins for JWT and rate limiting
# REQ-4.2.1 Core Components: Kong API Gateway implementation for request routing, authentication, rate limiting
WORKDIR /tmp/plugins
RUN luarocks install kong-jwt-plugin && \
    luarocks install kong-plugin-rate-limiting

# Configure SSL certificates with proper permissions
# REQ-4.4.2 Security Architecture: Implements secure API access through WAF, API Gateway
WORKDIR /etc/kong/ssl
COPY ssl/dollarfunding.crt /etc/kong/ssl/
COPY ssl/dollarfunding.key /etc/kong/ssl/
RUN chmod 644 /etc/kong/ssl/dollarfunding.crt && \
    chmod 600 /etc/kong/ssl/dollarfunding.key && \
    chown kong:kong /etc/kong/ssl/*

# Copy and validate configuration files
COPY kong.yml /etc/kong/kong.yml
COPY plugins/jwt.yml /etc/kong/plugins/jwt.yml
COPY plugins/rate-limiting.yml /etc/kong/plugins/rate-limiting.yml
RUN kong check /etc/kong/kong.yml

# Generate Software Bill of Materials (SBOM)
# REQ-8.3.1 Container Strategy: SBOM generation
RUN apk add --no-cache syft=0.85.0-r0 && \
    syft /usr/local/share/lua/5.1/kong > /sbom.json

# Run security vulnerability scan
# REQ-8.3.1 Container Strategy: Security scanning
RUN apk add --no-cache grype=0.65.0-r0 && \
    grype /usr/local/share/lua/5.1/kong --fail-on high

# Stage 2: Final
# REQ-8.3.1 Container Strategy: Minimal attack surface
FROM kong:3.4.x-alpine

# Copy validated artifacts from builder stage
COPY --from=builder /etc/kong/ssl /etc/kong/ssl
COPY --from=builder /etc/kong/kong.yml /etc/kong/kong.yml
COPY --from=builder /etc/kong/plugins /etc/kong/plugins
COPY --from=builder /usr/local/share/lua/5.1/kong /usr/local/share/lua/5.1/kong
COPY --from=builder /sbom.json /sbom.json

# Set secure environment variables
# REQ-4.2.1 Core Components: Kong configuration for request routing and security
ENV KONG_DATABASE=off \
    KONG_PROXY_LISTEN="0.0.0.0:8000 ssl" \
    KONG_ADMIN_LISTEN="0.0.0.0:8001 ssl" \
    KONG_SSL_CERT="/etc/kong/ssl/dollarfunding.crt" \
    KONG_SSL_CERT_KEY="/etc/kong/ssl/dollarfunding.key" \
    KONG_PLUGINS="bundled,jwt,rate-limiting" \
    KONG_NGINX_WORKER_PROCESSES="auto" \
    KONG_PROXY_ACCESS_LOG="/dev/stdout" \
    KONG_ADMIN_ACCESS_LOG="/dev/stdout" \
    KONG_PROXY_ERROR_LOG="/dev/stderr" \
    KONG_ADMIN_ERROR_LOG="/dev/stderr" \
    KONG_NGINX_WORKER_CONNECTIONS="16384"

# Configure health check endpoints
# REQ-4.2.1 Core Components: Health monitoring
HEALTHCHECK --interval=10s --timeout=5s --retries=5 --start-period=30s \
    CMD kong health

# Expose required ports
EXPOSE 8000 8001 8443 8444

# Set non-root user and permissions
# REQ-4.4.2 Security Architecture: Secure deployment configuration
USER kong

# Configure read-only root filesystem
# REQ-4.4.2 Security Architecture: Secure container configuration
VOLUME ["/usr/local/kong/ssl", "/usr/local/kong/conf"]

# Set Kong entrypoint with proper configuration
ENTRYPOINT ["kong", "docker-start"]
CMD ["-c", "/etc/kong/kong.yml"]