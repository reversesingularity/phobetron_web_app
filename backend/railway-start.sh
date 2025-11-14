#!/bin/bash
# Railway deployment startup script for Phobetron Backend
# Simplified version - starts uvicorn immediately, database migrations run on-demand

set -e

echo "========================================"
echo "Starting Phobetron Backend on Railway"
echo "Version: 1.0.1 (Pool size: 20)"
echo "========================================"
echo "Current directory: $(pwd)"
echo "Python version: $(python3 --version)"
echo ""

# Set default PORT if not provided by Railway
PORT="${PORT:-8080}"
echo "Using PORT: $PORT"

echo "Starting uvicorn on 0.0.0.0:$PORT..."
echo "Environment variables:"
echo "  PORT=$PORT"
echo "  DATABASE_URL=${DATABASE_URL:0:30}... (truncated)"
echo "  RAILWAY_ENVIRONMENT=${RAILWAY_ENVIRONMENT:-not set}"
echo ""

# Run database migrations before starting the server
echo "Running database migrations..."
alembic upgrade head || echo "Warning: Migration failed, continuing anyway"
echo "Migrations complete"
echo ""

# Start uvicorn - the /health endpoint will respond immediately
# Database connectivity and migrations are handled by the application lifespan
exec uvicorn app.main:app \
    --host 0.0.0.0 \
    --port $PORT \
    --log-level info \
    --access-log \
    --timeout-keep-alive 120
