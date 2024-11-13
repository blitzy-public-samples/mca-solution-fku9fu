# =====================================
# Stage 1: Builder
# =====================================
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /usr/src/app

# Copy package files for dependency installation
COPY package*.json ./

# Install all dependencies including dev dependencies for build
RUN npm ci

# Copy TypeScript configuration
COPY tsconfig.json ./

# Copy source code
COPY src/ ./src/

# Build the application
RUN npm run build

# Remove dev dependencies to optimize image
RUN npm prune --production

# =====================================
# Stage 2: Production
# =====================================
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production && \
    # Clean npm cache to reduce image size
    npm cache clean --force && \
    # Add node user for security
    adduser -D -h /usr/src/app node && \
    # Set correct permissions
    chown -R node:node /usr/src/app

# Copy built application from builder stage
COPY --from=builder --chown=node:node /usr/src/app/dist ./dist

# Set production environment
ENV NODE_ENV=production \
    PORT=3000

# Switch to non-root user
USER node

# Expose application port
EXPOSE 3000

# Health check configuration
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start the application
CMD ["node", "dist/main"]