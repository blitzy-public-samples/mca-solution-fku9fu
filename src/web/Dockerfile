# Human Tasks:
# 1. Verify that host machine has Docker version 20.10.0 or higher installed
# 2. Ensure proper network access to NPM registry for dependency installation
# 3. Configure CDN settings in production environment if using content distribution
# 4. Review NGINX security headers and adjust based on security requirements

# Stage 1: Build React Application
# Implements: Web Frontend (4. SYSTEM ARCHITECTURE/4.2 Component Details/4.2.1 Core Components)
FROM node:18-alpine AS builder

# Set build arguments and environment variables
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# Set working directory
WORKDIR /app

# Copy package files for dependency installation
# This layer is cached unless package files change
COPY package*.json ./

# Install dependencies using clean install for reproducible builds
# npm ci is faster and more reliable than npm install for CI/CD
RUN npm ci --only=production

# Copy application source and configuration files
COPY . .

# Build the application
# Uses configuration from vite.config.ts to output to /app/dist
RUN npm run build

# Stage 2: Production NGINX Server
# Implements: Static Content Distribution (4. SYSTEM ARCHITECTURE/4.2 Component Details/4.2.1 Core Components)
FROM nginx:1.25-alpine

# Create nginx user if it doesn't exist and set proper permissions
RUN adduser -D -H -u 101 -s /sbin/nologin nginx || true

# Remove default nginx configuration
RUN rm /etc/nginx/conf.d/default.conf

# Create custom NGINX configuration for SPA routing
RUN echo 'server { \
    listen 80; \
    server_name _; \
    root /usr/share/nginx/html; \
    index index.html; \
    # Security headers \
    add_header X-Frame-Options "SAMEORIGIN"; \
    add_header X-XSS-Protection "1; mode=block"; \
    add_header X-Content-Type-Options "nosniff"; \
    add_header Referrer-Policy "strict-origin-when-cross-origin"; \
    add_header Content-Security-Policy "default-src '\''self'\''; script-src '\''self'\'' '\''unsafe-inline'\'' '\''unsafe-eval'\''; style-src '\''self'\'' '\''unsafe-inline'\''; img-src '\''self'\'' data: https:; font-src '\''self'\'' data:;"; \
    # Gzip compression \
    gzip on; \
    gzip_vary on; \
    gzip_min_length 10240; \
    gzip_proxied expired no-cache no-store private auth; \
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/x-javascript application/xml application/json; \
    gzip_disable "MSIE [1-6]\."; \
    # SPA routing \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    # Cache control for static assets \
    location /assets { \
        expires 1y; \
        add_header Cache-Control "public, no-transform"; \
    } \
    # Health check endpoint \
    location /health { \
        access_log off; \
        return 200 "healthy\n"; \
    } \
}' > /etc/nginx/conf.d/app.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Set proper permissions for nginx user
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

# Switch to non-root user
USER nginx

# Expose port 80
EXPOSE 80

# Configure health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl --fail http://localhost:80/health || exit 1

# Start NGINX
CMD ["nginx", "-g", "daemon off;"]