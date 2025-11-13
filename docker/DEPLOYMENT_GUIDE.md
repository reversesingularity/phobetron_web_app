# 🚀 Phobetron Production Deployment Guide

## Quick Start

### Prerequisites
- Docker Desktop installed and running
- At least 4GB RAM available
- 10GB disk space

### 1. Initial Setup

```powershell
# Navigate to docker directory
cd F:\Projects\phobetron_web_app\docker

# Create .env file from example
Copy-Item .env.production.example .env

# Edit .env with your production values
notepad .env
```

**Important**: Update these values in `.env`:
- `POSTGRES_PASSWORD` - Strong database password
- `SECRET_KEY` - Random string for JWT tokens (min 32 characters)
- `CORS_ORIGINS` - Your production domain(s)

### 2. Build Production Images

```powershell
.\deploy-production.ps1 -Build
```

This will:
- Build optimized Docker images for frontend and backend
- Tag images as `phobetron/frontend:latest` and `phobetron/backend:latest`
- Store images in Docker Desktop

⏱️ First build takes 5-10 minutes

### 3. Deploy to Docker Desktop

```powershell
.\deploy-production.ps1 -Deploy
```

This will:
- Start PostgreSQL database with PostGIS
- Start FastAPI backend on port 8020
- Start Next.js frontend on port 3000
- Create isolated Docker network
- Set up health checks

### 4. Verify Deployment

Open your browser:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8020
- **API Docs**: http://localhost:8020/docs

Check container status:
```powershell
docker ps
```

You should see 3 running containers:
- `phobetron_db_prod`
- `phobetron_backend_prod`
- `phobetron_frontend_prod`

## 📋 Common Commands

### View Logs
```powershell
# All services
.\deploy-production.ps1 -Logs

# Specific service
docker logs -f phobetron_backend_prod
docker logs -f phobetron_frontend_prod
docker logs -f phobetron_db_prod
```

### Stop All Services
```powershell
.\deploy-production.ps1 -Stop
```

### Rebuild and Redeploy
```powershell
.\deploy-production.ps1 -Build -Deploy
```

### Clean Everything (Reset)
```powershell
# Warning: This deletes all data!
.\deploy-production.ps1 -Clean
```

## 🗄️ Database Management

### Access PostgreSQL
```powershell
docker exec -it phobetron_db_prod psql -U phobetron -d phobetron
```

### Backup Database
```powershell
docker exec phobetron_db_prod pg_dump -U phobetron phobetron > backup_$(Get-Date -Format 'yyyyMMdd_HHmmss').sql
```

### Restore Database
```powershell
docker exec -i phobetron_db_prod psql -U phobetron -d phobetron < backup_20251112_120000.sql
```

## 🔧 Configuration

### Environment Variables

**Database**:
- `POSTGRES_PASSWORD` - Database password (required)

**Backend**:
- `SECRET_KEY` - JWT token secret (required)
- `API_V1_STR` - API prefix (default: `/api/v1`)
- `CORS_ORIGINS` - Allowed origins (comma-separated)

**Frontend**:
- `NEXT_PUBLIC_API_URL` - Backend API URL

### Ports

| Service  | Port | Description |
|----------|------|-------------|
| Frontend | 3000 | Next.js web app |
| Backend  | 8020 | FastAPI server |
| Database | 5432 | PostgreSQL |

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Docker Desktop                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐   ┌──────────────┐   ┌────────────┐ │
│  │   Frontend   │   │   Backend    │   │  Database  │ │
│  │              │   │              │   │            │ │
│  │  Next.js     │──▶│  FastAPI     │──▶│ PostgreSQL │ │
│  │  Port 3000   │   │  Port 8020   │   │ Port 5432  │ │
│  │              │   │              │   │  PostGIS   │ │
│  └──────────────┘   └──────────────┘   └────────────┘ │
│         │                   │                   │       │
│         └───────────────────┴───────────────────┘       │
│                  phobetron_network                      │
│                                                          │
│  Volumes:                                                │
│  • postgres_data  (persistent database storage)         │
└─────────────────────────────────────────────────────────┘
```

## 🐛 Troubleshooting

### Container won't start
```powershell
# Check logs
docker logs phobetron_backend_prod
docker logs phobetron_frontend_prod

# Verify .env file exists
Test-Path F:\Projects\phobetron_web_app\docker\.env
```

### Database connection issues
```powershell
# Check if database is healthy
docker ps --filter "name=phobetron_db_prod"

# Test connection
docker exec phobetron_db_prod pg_isready -U phobetron
```

### Port already in use
```powershell
# Find what's using the port
Get-NetTCPConnection -LocalPort 3000, 8020, 5432

# Stop conflicting services or change ports in docker-compose.production.yml
```

### Frontend shows "API Error"
1. Check backend is running: `docker ps`
2. Verify `NEXT_PUBLIC_API_URL` in `.env`
3. Check CORS settings in backend `.env`

## 🔒 Security Checklist

Before production deployment:

- [ ] Changed `POSTGRES_PASSWORD` from default
- [ ] Set strong `SECRET_KEY` (min 32 random characters)
- [ ] Updated `CORS_ORIGINS` to production domains only
- [ ] Enabled SSL/TLS for production (add reverse proxy)
- [ ] Configured firewall rules
- [ ] Set up database backups
- [ ] Enabled Docker health checks
- [ ] Reviewed container logs for errors

## 📊 Monitoring

### Check Health Status
```powershell
# All services
docker-compose -f docker-compose.production.yml ps

# Specific health check
docker inspect --format='{{.State.Health.Status}}' phobetron_backend_prod
```

### Resource Usage
```powershell
docker stats
```

## 🚢 Export Images

### Save images for offline deployment
```powershell
# Export frontend
docker save phobetron/frontend:latest | gzip > phobetron-frontend.tar.gz

# Export backend
docker save phobetron/backend:latest | gzip > phobetron-backend.tar.gz
```

### Load images on another machine
```powershell
# Load frontend
docker load < phobetron-frontend.tar.gz

# Load backend
docker load < phobetron-backend.tar.gz
```

## 🎯 Performance Optimization

### Frontend Optimization
- Images are optimized during build
- Static assets are cached
- Gzip compression enabled
- Standalone output reduces image size

### Backend Optimization
- Health checks ensure service availability
- Connection pooling for database
- Multi-worker deployment (can be scaled)

### Database Optimization
- PostGIS extensions for geospatial queries
- Persistent volume for data
- Regular backups recommended

## 📞 Support

For issues or questions:
1. Check logs: `.\deploy-production.ps1 -Logs`
2. Review this README
3. Check Docker Desktop dashboard
4. Review `.env` configuration

## 🎉 Success!

Your Phobetron application is now running in production-ready Docker containers!

Access your application:
- 🌐 **Frontend**: http://localhost:3000
- 📡 **Backend API**: http://localhost:8020/docs
- 🗄️ **Database**: localhost:5432

Next steps:
- Set up reverse proxy (nginx/traefik) for SSL
- Configure domain name
- Set up automated backups
- Monitor logs and performance
