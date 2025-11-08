"""Test database connectivity."""

from app.db.session import engine
from sqlalchemy import text

try:
    with engine.connect() as conn:
        result = conn.execute(text("SELECT version();"))
        version = result.scalar()
        print("✅ Database connection successful!")
        print(f"PostgreSQL version: {version}")
        
        # Check PostGIS extension
        result = conn.execute(text("SELECT PostGIS_version();"))
        postgis_version = result.scalar()
        print(f"✅ PostGIS version: {postgis_version}")
        
        # Check uuid-ossp extension
        result = conn.execute(text("SELECT uuid_generate_v4();"))
        uuid = result.scalar()
        print(f"✅ UUID generation working: {uuid}")
        
except Exception as e:
    print(f"❌ Database connection failed: {e}")
    exit(1)

print("\n🎉 Phase 2 Foundation - Database Setup Complete!")
