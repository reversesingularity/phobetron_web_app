"""
Create the test database with PostGIS extension.
Run this with postgres superuser privileges.
"""
import psycopg
import sys

# Get postgres password from user
postgres_password = input("Enter PostgreSQL superuser password: ")

# Connect to PostgreSQL default database
try:
    conn = psycopg.connect(
        f"host=localhost port=5432 dbname=postgres user=postgres password={postgres_password}"
    )
except psycopg.OperationalError as e:
    print(f"\nError connecting to PostgreSQL: {e}")
    print("\nPlease ensure PostgreSQL is running and the password is correct.")
    sys.exit(1)

conn.autocommit = True
cur = conn.cursor()

# Create test database
try:
    cur.execute("DROP DATABASE IF EXISTS celestial_signs_test;")
    print("Dropped existing test database (if any)")
    
    cur.execute("CREATE DATABASE celestial_signs_test OWNER celestial_app;")
    print("Created celestial_signs_test database")
except Exception as e:
    print(f"Error creating database: {e}")
    sys.exit(1)

cur.close()
conn.close()

# Connect to new test database to enable extensions
conn = psycopg.connect(
    f"host=localhost port=5432 dbname=celestial_signs_test user=postgres password={postgres_password}"
)
conn.autocommit = True
cur = conn.cursor()

try:
    cur.execute("CREATE EXTENSION IF NOT EXISTS postgis;")
    print("Enabled PostGIS extension")
    
    cur.execute("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";")
    print("Enabled uuid-ossp extension")
    
    # Verify
    cur.execute("SELECT PostGIS_version();")
    version = cur.fetchone()[0]
    print(f"PostGIS version: {version}")
    
except Exception as e:
    print(f"Error enabling extensions: {e}")

cur.close()
conn.close()

print("\nTest database ready!")
