#!/bin/bash
# Railway deployment startup script for Phobetron Backend

set -e

echo "🚀 Starting Phobetron Backend on Railway..."

# Wait for database to be ready using Python
echo "⏳ Waiting for database to be ready..."
python3 -c "
import os
import time
import psycopg2
from urllib.parse import urlparse

database_url = os.getenv('DATABASE_URL')
if not database_url:
    print('❌ DATABASE_URL not set')
    exit(1)

parsed = urlparse(database_url)
db_config = {
    'host': parsed.hostname,
    'port': parsed.port or 5432,
    'user': parsed.username,
    'password': parsed.password,
    'database': parsed.path.lstrip('/')
}

for i in range(30):  # Try for 60 seconds (30 * 2s)
    try:
        conn = psycopg2.connect(**db_config)
        conn.close()
        print('✅ Database is ready!')
        break
    except Exception as e:
        print(f'Database not ready (attempt {i+1}/30): {e}')
        time.sleep(2)
else:
    print('❌ Database failed to become ready after 60 seconds')
    exit(1)
"

# Run database migrations
echo "🔄 Running database migrations..."
cd /app
alembic upgrade head

echo "🎯 Starting FastAPI application..."
# Start the application
exec uvicorn app.main:app --host 0.0.0.0 --port $PORT --workers 1