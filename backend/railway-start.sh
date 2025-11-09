#!/bin/bash
# Railway deployment startup script for Phobetron Backend
# Enhanced with robust database connectivity and migration retry logic

set -e

echo "Starting Phobetron Backend on Railway..."

# Wait for database to be fully ready (Railway databases may take time to spin up)
echo "Waiting 120 seconds for database to initialize..."
sleep 120

# Enhanced database connectivity testing with increased retry logic
echo "Testing database connectivity with enhanced retry logic..."
python3 -c "
import os
import time
import psycopg2
from urllib.parse import urlparse
import sys

# Try to use DATABASE_PRIVATE_URL first for direct connection (bypasses proxy)
db_config = {}
database_private_url = os.getenv('DATABASE_PRIVATE_URL')
if database_private_url:
    print('Using DATABASE_PRIVATE_URL for direct database connection')
    parsed = urlparse(database_private_url)
    db_config = {
        'host': parsed.hostname,
        'port': parsed.port or 5432,
        'user': parsed.username,
        'password': parsed.password,
        'database': parsed.path.lstrip('/'),
        'sslmode': 'require',
        'connect_timeout': 30
    }
elif os.getenv('PGHOST'):
    print('Using individual PG environment variables for database connection')
    # Fallback to individual PG variables (may still be proxy)
    db_config = {
        'host': os.getenv('PGHOST'),
        'port': int(os.getenv('PGPORT', 5432)),
        'user': os.getenv('PGUSER'),
        'password': os.getenv('PGPASSWORD'),
        'database': os.getenv('PGDATABASE'),
        'sslmode': 'require',
        'connect_timeout': 30
    }
else:
    print('Using DATABASE_URL for database connection (proxy)')
    # Final fallback to parsing DATABASE_URL (proxy)
    database_url = os.getenv('DATABASE_URL')
    if not database_url:
        print('ERROR: No database connection variables found')
        sys.exit(1)
    
    parsed = urlparse(database_url)
    db_config = {
        'host': parsed.hostname,
        'port': parsed.port or 5432,
        'user': parsed.username,
        'password': parsed.password,
        'database': parsed.path.lstrip('/'),
        'sslmode': 'require',
        'connect_timeout': 30
    }

if not all(db_config.get(k) for k in ['host', 'user', 'password', 'database']):
    print('ERROR: Incomplete database configuration')
    sys.exit(1)

print(f'Connecting to database at {db_config[\"host\"]}:{db_config[\"port\"]}')
max_retries = 30
retry_delay = 10

for attempt in range(max_retries):
    try:
        print(f'Database connection attempt {attempt + 1}/{max_retries}...')
        conn = psycopg2.connect(**db_config)
        conn.close()
        print('Database connection successful!')
        break
    except Exception as e:
        print(f'Database connection failed (attempt {attempt + 1}/{max_retries}): {e}')
        if attempt < max_retries - 1:
            print(f'Retrying in {retry_delay} seconds...')
            time.sleep(retry_delay)
        else:
            print('All database connection attempts failed!')
            sys.exit(1)

print('Database is ready!')
"

# Enhanced migration logic with increased retry
echo "Running database migrations with retry logic..."
cd /app
max_migration_retries=10
migration_retry_delay=30

for migration_attempt in $(seq 1 $max_migration_retries); do
    echo "Migration attempt $migration_attempt/$max_migration_retries..."
    
    # Run migrations and capture output
    migration_output=$(alembic upgrade head 2>&1)
    migration_exit_code=$?
    
    # Check if migrations succeeded or if tables already exist (which is OK)
    if [ $migration_exit_code -eq 0 ]; then
        echo "Database migrations completed successfully!"
        echo "$migration_output"
        break
    elif echo "$migration_output" | grep -q "already exists"; then
        echo "Tables already exist - migrations previously completed"
        echo "Database schema is up to date!"
        break
    else
        echo "Migration attempt $migration_attempt failed"
        echo "$migration_output"
        if [ $migration_attempt -lt $max_migration_retries ]; then
            echo "Retrying migrations in $migration_retry_delay seconds..."
            sleep $migration_retry_delay
        else
            echo "All migration attempts failed!"
            echo "Final error output:"
            echo "$migration_output"
            exit 1
        fi
    fi
done

echo "Starting FastAPI application..."

# Set default PORT if not provided by Railway
if [ -z "$PORT" ]; then
    echo "WARNING: PORT environment variable not set, defaulting to 8000"
    PORT=8000
else
    echo "Using PORT from environment: $PORT"
fi

echo "Starting uvicorn on 0.0.0.0:$PORT..."
exec uvicorn app.main:app --host 0.0.0.0 --port $PORT