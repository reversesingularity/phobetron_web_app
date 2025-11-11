# Vite + React Production Dockerfile

FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Copy built assets and node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Expose port
EXPOSE $PORT

# Start the preview server
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "$PORT"]
