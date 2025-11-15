# Frontend Production Dockerfile for Phobetron - Production Stable (Vite + React)
# Multi-stage build for optimized production image

# Stage 1: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install all dependencies (including devDependencies for build)
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Build the application
ENV NODE_ENV=production
# Use the VITE_API_URL from .env file (Railway backend URL)
RUN npm run build

# Stage 2: Production with nginx
FROM nginx:alpine AS runner

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
RUN rm -f /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Substitute environment variables in nginx config
RUN envsubst '${PORT}' < /etc/nginx/conf.d/default.conf > /etc/nginx/conf.d/default.conf.tmp && mv /etc/nginx/conf.d/default.conf.tmp /etc/nginx/conf.d/default.conf

# Remove default nginx config to avoid conflicts
RUN rm -f /etc/nginx/conf.d/default.conf.backup

# Expose port (Railway handles external port mapping)
EXPOSE ${PORT:-80}

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
