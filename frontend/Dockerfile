# Frontend Production Dockerfile for Phobetron (Vite + React)
# Multi-stage build for optimized production image

# Stage 1: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build the application
ENV NODE_ENV=production
RUN npm run build

# Stage 2: Production with nginx
FROM nginx:alpine AS runner

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy startup script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:${PORT:-80} || exit 1

# Start nginx with our custom entrypoint
CMD ["/docker-entrypoint.sh"]
