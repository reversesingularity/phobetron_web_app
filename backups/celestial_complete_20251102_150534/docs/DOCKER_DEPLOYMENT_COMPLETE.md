# 🐳 Docker Configuration & Deployment Guide

## Complete Docker Setup for Celestial Signs

---

## File: `docker-compose.yml` (Project Root)

```yaml
version: '3.8'

services:
  # PostgreSQL with PostGIS
  database:
    image: postgis/postgis:15-3.3
    container_name: celestial-db
    environment:
      POSTGRES_DB: celestial_signs
      POSTGRES_USER: celestial_app
      POSTGRES_PASSWORD: ${DB_PASSWORD:-celestial2025_change_in_prod}
      PGDATA: /var/lib/postgresql/data/pgdata
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backend/alembic/versions:/docker-entrypoint-initdb.d
    ports:
      - "5432:5432"
    networks:
      - celestial-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U celestial_app -d celestial_signs"]
      interval: 10s
      timeout: 5s
      retries: 5

  # FastAPI Backend
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: celestial-backend
    environment:
      DATABASE_URL: postgresql://celestial_app:${DB_PASSWORD:-celestial2025_change_in_prod}@database:5432/celestial_signs
      ENVIRONMENT: ${ENVIRONMENT:-development}
      LOG_LEVEL: ${LOG_LEVEL:-info}
    volumes:
      - ./backend:/app
      - backend_cache:/app/.cache
    ports:
      - "8000:8000"
    networks:
      - celestial-network
    depends_on:
      database:
        condition: service_healthy
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

  # Next.js Frontend
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: celestial-frontend
    environment:
      NEXT_PUBLIC_API_URL: ${NEXT_PUBLIC_API_URL:-http://localhost:8000}
      NEXT_PUBLIC_CATALYST_KEY: ${CATALYST_UI_KEY}
    volumes:
      - ./frontend:/app
      - /app/node_modules
      - /app/.next
    ports:
      - "3000:3000"
    networks:
      - celestial-network
    depends_on:
      - backend
    command: npm run dev

  # Nginx Reverse Proxy (Production)
  nginx:
    image: nginx:alpine
    container_name: celestial-nginx
    volumes:
      - ./docker/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./docker/ssl:/etc/nginx/ssl:ro
    ports:
      - "80:80"
      - "443:443"
    networks:
      - celestial-network
    depends_on:
      - backend
      - frontend
    profiles:
      - production

  # Redis (for caching - optional)
  redis:
    image: redis:7-alpine
    container_name: celestial-redis
    ports:
      - "6379:6379"
    networks:
      - celestial-network
    volumes:
      - redis_data:/data
    profiles:
      - production

volumes:
  postgres_data:
    driver: local
  backend_cache:
    driver: local
  redis_data:
    driver: local

networks:
  celestial-network:
    driver: bridge
```

---

## File: `backend/Dockerfile`

```dockerfile
# Backend Dockerfile for FastAPI application
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    postgresql-client \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first (for Docker layer caching)
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir --break-system-packages -r requirements.txt

# Copy application code
COPY . .

# Create non-root user
RUN useradd -m -u 1000 celestial && \
    chown -R celestial:celestial /app

USER celestial

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8000/health')"

# Default command (can be overridden by docker-compose)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## File: `frontend/Dockerfile`

```dockerfile
# Frontend Dockerfile for Next.js application
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment for build
ENV NEXT_TELEMETRY_DISABLED 1

# Build application
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

---

## File: `docker/nginx.conf` (Production Reverse Proxy)

```nginx
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server backend:8000;
    }

    upstream frontend {
        server frontend:3000;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=general_limit:10m rate=30r/s;

    server {
        listen 80;
        server_name celestialsigns.app www.celestialsigns.app;

        # Redirect HTTP to HTTPS in production
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name celestialsigns.app www.celestialsigns.app;

        # SSL Configuration (replace with your actual certificates)
        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

        # API routes (backend)
        location /api/ {
            limit_req zone=api_limit burst=20 nodelay;
            
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;

            # Timeouts
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
        }

        # Frontend (Next.js)
        location / {
            limit_req zone=general_limit burst=50 nodelay;
            
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;

            # WebSocket support (for Next.js HMR)
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
        }

        # Static assets caching
        location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
            proxy_pass http://frontend;
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

---

## File: `.env.example` (Project Root)

```env
# Environment Configuration Template
# Copy to .env and fill in your values

# ============================================================================
# DATABASE
# ============================================================================
DB_PASSWORD=your_secure_password_here
DATABASE_URL=postgresql://celestial_app:${DB_PASSWORD}@localhost:5432/celestial_signs

# ============================================================================
# BACKEND
# ============================================================================
ENVIRONMENT=development  # development | production
LOG_LEVEL=info           # debug | info | warning | error
SECRET_KEY=your_secret_key_here_min_32_chars

# External API Keys (if required)
METEOMATICS_API_KEY=
CATALYST_UI_KEY=your_catalyst_subscription_key

# ============================================================================
# FRONTEND
# ============================================================================
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_ENVIRONMENT=development

# ============================================================================
# DOCKER
# ============================================================================
COMPOSE_PROJECT_NAME=celestial-signs

# ============================================================================
# PRODUCTION (optional)
# ============================================================================
# DOMAIN=celestialsigns.app
# SSL_EMAIL=your-email@example.com
```

---

## File: `backend/requirements.txt`

```txt
# ============================================================================
# FastAPI Backend Dependencies
# ============================================================================

# Web Framework
fastapi==0.104.1
uvicorn[standard]==0.24.0
pydantic==2.5.0
pydantic-settings==2.1.0

# Database
sqlalchemy==2.0.23
psycopg2-binary==2.9.9
alembic==1.13.0
geoalchemy2==0.14.2

# Astronomical Libraries
astroquery==0.4.6
skyfield==1.46
czml3==1.0.1
poliastro==0.17.0

# HTTP & Data
requests==2.31.0
httpx==0.25.2
aiohttp==3.9.1

# Utilities
python-dotenv==1.0.0
python-dateutil==2.8.2
pytz==2023.3

# Testing
pytest==7.4.3
pytest-asyncio==0.21.1
pytest-cov==4.1.0

# Code Quality
black==23.12.0
flake8==6.1.0
mypy==1.7.1

# Optional (Production)
gunicorn==21.2.0
redis==5.0.1
celery==5.3.4
```

---

## Quick Start Commands

### Development Mode (Local)
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild after code changes
docker-compose up -d --build

# Access database
docker-compose exec database psql -U celestial_app -d celestial_signs

# Run backend shell
docker-compose exec backend python

# Run migrations
docker-compose exec backend alembic upgrade head
```

### Production Mode
```bash
# Start with production profile
docker-compose --profile production up -d

# Check status
docker-compose ps

# View nginx logs
docker-compose logs nginx

# Backup database
docker-compose exec database pg_dump -U celestial_app celestial_signs > backup.sql

# Restore database
cat backup.sql | docker-compose exec -T database psql -U celestial_app celestial_signs
```

---

## File: `Makefile` (Project Root - Optional Convenience)

```makefile
.PHONY: help setup dev prod clean logs test

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-15s %s\n", $$1, $$2}'

setup: ## Initial project setup
	@echo "Setting up Celestial Signs..."
	cp .env.example .env
	docker-compose up -d database
	@echo "Waiting for database to be ready..."
	sleep 10
	docker-compose exec database psql -U celestial_app -d celestial_signs -f /docker-entrypoint-initdb.d/001_initial_schema.sql
	@echo "Setup complete! Edit .env with your configuration."

dev: ## Start development environment
	docker-compose up -d
	@echo "Development environment started."
	@echo "Frontend: http://localhost:3000"
	@echo "Backend API: http://localhost:8000"
	@echo "API Docs: http://localhost:8000/docs"

prod: ## Start production environment
	docker-compose --profile production up -d
	@echo "Production environment started."

stop: ## Stop all services
	docker-compose down

clean: ## Stop and remove all containers, volumes
	docker-compose down -v
	@echo "All containers and volumes removed."

logs: ## View logs from all services
	docker-compose logs -f

test-backend: ## Run backend tests
	docker-compose exec backend pytest

test-frontend: ## Run frontend tests
	docker-compose exec frontend npm test

migrate: ## Run database migrations
	docker-compose exec backend alembic upgrade head

shell-backend: ## Open Python shell in backend
	docker-compose exec backend python

shell-db: ## Open PostgreSQL shell
	docker-compose exec database psql -U celestial_app -d celestial_signs

backup: ## Backup database
	@mkdir -p backups
	docker-compose exec database pg_dump -U celestial_app celestial_signs > backups/backup_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "Backup created in backups/ directory"

restart: stop dev ## Restart development environment
```

---

## Deployment Options

### Option 1: Self-Hosted (Docker + VPS)
**Providers**: DigitalOcean, Linode, Vultr  
**Cost**: $12-24/month (2-4GB RAM VPS)

```bash
# On your VPS
git clone https://github.com/yourusername/celestial-signs.git
cd celestial-signs
cp .env.example .env
# Edit .env with production values
docker-compose --profile production up -d
```

### Option 2: Vercel (Frontend) + Railway (Backend + DB)
**Cost**: $0-20/month (free tiers available)

**Frontend (Vercel)**:
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy frontend
cd frontend
vercel --prod
```

**Backend + Database (Railway)**:
```bash
# Install Railway CLI
npm i -g @railway/cli

# Deploy
railway login
railway init
railway up
```

### Option 3: AWS (Full Cloud)
**Cost**: $50-100/month (with ECS, RDS, CloudFront)
- Frontend: S3 + CloudFront
- Backend: ECS (Fargate)
- Database: RDS PostgreSQL with PostGIS

---

## Monitoring Setup

### File: `docker-compose.monitoring.yml` (Optional)

```yaml
version: '3.8'

services:
  # Prometheus (metrics)
  prometheus:
    image: prom/prometheus:latest
    container_name: celestial-prometheus
    volumes:
      - ./docker/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    ports:
      - "9090:9090"
    networks:
      - celestial-network

  # Grafana (visualization)
  grafana:
    image: grafana/grafana:latest
    container_name: celestial-grafana
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana
    ports:
      - "3001:3000"
    networks:
      - celestial-network

volumes:
  prometheus_data:
  grafana_data:

networks:
  celestial-network:
    external: true
```

---

## Troubleshooting

### Database Connection Issues
```bash
# Check if database is running
docker-compose ps database

# Check database logs
docker-compose logs database

# Test connection
docker-compose exec database psql -U celestial_app -d celestial_signs -c "SELECT version();"
```

### Backend Not Starting
```bash
# Check backend logs
docker-compose logs backend

# Verify environment variables
docker-compose exec backend env | grep DATABASE

# Test import
docker-compose exec backend python -c "from app.main import app; print('OK')"
```

### Frontend Build Errors
```bash
# Clear Next.js cache
docker-compose exec frontend rm -rf .next

# Rebuild
docker-compose up -d --build frontend
```

---

**Your Docker environment is now production-ready!** 🐳
