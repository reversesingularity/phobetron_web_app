#!/bin/bash
# Railway deployment startup script for Phobetron Backend
# Enhanced with robust database connectivity and migration retry logic

set -e

echo "🚀 Starting Phobetron Backend on Railway..."

# Enhanced database connectivity testing with retry logic
echo "⏳ Testing database connectivity with enhanced retry logic..."
python3 -c "
import os
import time
import psycopg2
from urllib.parse import urlparse
import sys

database_url = os.getenv('DATABASE_URL')
if not database_url:
    print('❌ DATABASE_URL not set')
    sys.exit(1)

parsed = urlparse(database_url)
db_config = {
    'host': parsed.hostname,
    'port': parsed.port or 5432,
    'user': parsed.username,
    'password': parsed.password,
    'database': parsed.path.lstrip('/'),
    'sslmode': 'require'
}

print(f'🔍 Connecting to database at {db_config[\"host\"]}:{db_config[\"port\"]}')
max_retries = 10
retry_delay = 5

for attempt in range(max_retries):
    try:
        print(f'🔄 Database connection attempt {attempt + 1}/{max_retries}...')
        conn = psycopg2.connect(**db_config)
        conn.close()
        print('✅ Database connection successful!')
        break
    except Exception as e:
        print(f'❌ Database connection failed (attempt {attempt + 1}/{max_retries}): {e}')
        if attempt < max_retries - 1:
            echo "⏳ Retrying in $retry_delay seconds..."
            sleep $retry_delay
        else
            echo "💥 All database connection attempts failed!"
            sys.exit(1)

print('✅ Database is ready!')
"

# Enhanced migration logic with retry
echo "🔄 Running database migrations with retry logic..."
cd /app
max_migration_retries = 3
migration_retry_delay = 10

for migration_attempt in range(max_migration_retries):
    echo "🔄 Migration attempt $((migration_attempt + 1))/$max_migration_retries..."
    if alembic upgrade head; then
        echo "✅ Database migrations completed successfully!"
        break
    else
        echo "❌ Migration attempt $((migration_attempt + 1)) failed"
        if [ $migration_attempt -lt $((max_migration_retries - 1)) ]; then
            echo "⏳ Retrying migrations in $migration_retry_delay seconds..."
            sleep $migration_retry_delay
        else
            echo "💥 All migration attempts failed!"
            exit 1
        fi
    fi
done

echo "🎯 Starting FastAPI application..."
# Start the application
exec uvicorn app.main:app --host 0.0.0.0 --port $PORT --workers 1