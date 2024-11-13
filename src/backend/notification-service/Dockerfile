# Human Tasks:
# 1. Ensure Docker version 24.x is installed on the build system
# 2. Verify that port 3004 is available and not blocked by firewall
# 3. Configure monitoring system to track the health check endpoint
# 4. Set up proper logging collection for winston logs
# 5. Ensure RabbitMQ connection details are provided via environment variables

# Base image version locked for security and stability
# node:18-alpine (Based on requirement from package.json engines field)
FROM node:18-alpine AS builder

# Addresses requirement: System Availability (2. SYSTEM OVERVIEW/Success Criteria)
# Run as non-root user for security
USER node

# Set working directory and ensure proper permissions
WORKDIR /usr/src/app

# Copy package files with correct ownership
COPY --chown=node:node package*.json ./

# Install all dependencies including devDependencies for build
RUN npm install

# Copy source code and TypeScript config
COPY --chown=node:node src/ ./src/
COPY --chown=node:node tsconfig.json ./

# Build TypeScript code
RUN npm run build

# Remove devDependencies to optimize image size
RUN npm prune --production

# Start fresh for production image
FROM node:18-alpine

# Addresses requirement: System Availability (2. SYSTEM OVERVIEW/Success Criteria)
# Run as non-root user for security
USER node

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY --chown=node:node package*.json ./

# Install production dependencies only
# Versions from package.json:
# - express@^4.18.2
# - amqplib@^0.10.3
# - winston@^3.9.0
# - axios@^1.4.0
RUN npm ci --only=production

# Copy built JavaScript files from builder stage
COPY --chown=node:node --from=builder /usr/src/app/dist ./dist

# Set production environment
# Addresses requirement: System Availability (2. SYSTEM OVERVIEW/Success Criteria)
ENV NODE_ENV=production
ENV PORT=3004

# Addresses requirement: Integration Layer (2. SYSTEM OVERVIEW/High-Level Description)
# Expose port for webhook HTTP endpoints
EXPOSE 3004

# Health check configuration
# Addresses requirement: System Availability (2. SYSTEM OVERVIEW/Success Criteria)
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3004/health || exit 1

# Start the notification service
# Addresses requirement: Notification Service (4. SYSTEM ARCHITECTURE/4.1 High-Level Architecture)
CMD ["node", "dist/server.js"]