# Railway Deployment Guide for Phobetron

## Overview
This guide explains how to deploy the Phobetron backend API to Railway.

## Prerequisites
- Railway account
- GitHub repository connected to Railway

## Deployment Steps

### 1. Connect Repository to Railway
1. Go to [Railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your Phobetron repository
4. Railway will automatically detect the `railway.toml` configuration

### 2. Database Setup
Railway automatically provisions a PostgreSQL database. No manual setup required.

### 3. Environment Variables
Set these environment variables in your Railway project dashboard:

```bash
# CORS Origins (required)
BACKEND_CORS_ORIGINS=["https://your-railway-app-url.up.railway.app"]

# Optional: External API Keys
NEWS_API_KEY=your_news_api_key
TWITTER_API_KEY=your_twitter_api_key
```

### 4. Deploy
Railway will automatically build and deploy using the configuration in `railway.toml` and `backend/Dockerfile`.

## Configuration Files

### railway.toml
- Uses Docker builder
- Points to `backend/Dockerfile`
- Uses `railway-start.sh` for startup

### backend/Dockerfile
- Python 3.11 slim base image
- Installs PostgreSQL client libraries
- Copies and runs the application
- Includes health checks

### backend/railway-start.sh
- Waits for database to be ready
- Runs Alembic migrations
- Starts the FastAPI application

## Troubleshooting

### Build Failures
- Check that all files in `backend/` are properly committed
- Ensure `requirements.txt` includes all dependencies
- Verify `railway.toml` points to correct Dockerfile path

### Database Connection Issues
- Railway automatically provides `DATABASE_URL`
- Check Railway logs for connection errors
- Ensure database migrations run successfully

### Application Startup Issues
- Check that `$PORT` environment variable is used
- Verify CORS origins include your Railway app URL
- Check application logs in Railway dashboard

## Monitoring
- View logs in Railway dashboard
- Monitor database usage
- Check application health endpoint: `https://your-app-url.up.railway.app/health`

## Updating Deployment
- Push changes to your GitHub repository
- Railway will automatically redeploy
- Database migrations run automatically on startup