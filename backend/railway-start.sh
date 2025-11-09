#!/bin/bash
# Railway deployment startup script for Phobetron Backend

set -e

echo "🚀 Starting Phobetron Backend on Railway..."

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
until pg_isready -h $(echo $DATABASE_URL | sed 's|.*@\([^:]*\):.*|\1|') -p $(echo $DATABASE_URL | sed 's|.*:\([0-9]*\)/.*|\1|') -U $(echo $DATABASE_URL | sed 's|.*://\([^:]*\):.*|\1|'); do
  echo "Database is unavailable - sleeping"
  sleep 2
done

echo "✅ Database is ready!"

# Run database migrations
echo "🔄 Running database migrations..."
cd /app
alembic upgrade head

echo "🎯 Starting FastAPI application..."
# Start the application
exec uvicorn app.main:app --host 0.0.0.0 --port $PORT --workers 1