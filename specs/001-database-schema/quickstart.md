# Quick Start Guide: Database Schema Setup

**Feature**: Database Schema Implementation  
**Branch**: `001-database-schema`  
**Estimated Setup Time**: 15-20 minutes

---

## Prerequisites

Before starting, ensure you have:

- [x] **PostgreSQL 17** installed and running on `localhost:5432`
- [x] **PostGIS 3.4+** extension available for PostgreSQL
- [x] **Python 3.11+** installed with pip
- [x] **Git** for version control
- [x] Database `celestial_signs` created
- [x] User `celestial_app` with password `celestial2025` configured

---

## Setup Steps

### 1. Create Database and Extensions

```bash
# Create database (if not already created)
createdb celestial_signs

# Enable required extensions
psql celestial_signs -c "CREATE EXTENSION IF NOT EXISTS postgis;"
psql celestial_signs -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"

# Verify PostGIS installation
psql celestial_signs -c "SELECT PostGIS_Full_Version();"
```

**Expected Output**: Should show PostGIS 3.4+ version information

---

### 2. Create Database User

```bash
# Create application user
psql celestial_signs -c "CREATE USER celestial_app WITH PASSWORD 'celestial2025';"

# Grant permissions
psql celestial_signs <<EOF
GRANT CONNECT ON DATABASE celestial_signs TO celestial_app;
GRANT USAGE ON SCHEMA public TO celestial_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO celestial_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO celestial_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO celestial_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO celestial_app;
EOF
```

---

### 3. Set Up Python Environment

```bash
# Navigate to backend directory
cd F:\Projects\phobetron_web_app\backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows PowerShell:
.\venv\Scripts\Activate.ps1
# Windows CMD:
venv\Scripts\activate.bat
# Linux/macOS:
source venv/bin/activate

# Upgrade pip
python -m pip install --upgrade pip
```

---

### 4. Install Python Dependencies

```bash
# Install core dependencies
pip install alembic==1.13.0 sqlalchemy==2.0.23 psycopg2-binary==2.9.9 geoalchemy2==0.14.2

# Install testing dependencies
pip install pytest==8.0.0 pytest-postgresql==5.0.0 pytest-alembic==0.11.0

# (Optional) Create requirements.txt for reproducibility
pip freeze > requirements.txt
```

**requirements.txt** (generated):
```
alembic==1.13.0
geoalchemy2==0.14.2
psycopg2-binary==2.9.9
pytest==8.0.0
pytest-alembic==0.11.0
pytest-postgresql==5.0.0
sqlalchemy==2.0.23
```

---

### 5. Initialize Alembic

```bash
# Initialize Alembic (creates alembic/ directory)
alembic init alembic
```

This creates:
```
backend/
├── alembic/
│   ├── versions/           # Migration files go here
│   ├── env.py             # Environment configuration
│   ├── script.py.mako     # Migration template
│   └── README
└── alembic.ini            # Alembic configuration
```

---

### 6. Configure Alembic

Edit `alembic.ini` and update the database URL:

```ini
# Line ~63 in alembic.ini
# BEFORE:
# sqlalchemy.url = driver://user:pass@localhost/dbname

# AFTER:
sqlalchemy.url = postgresql://celestial_app:celestial2025@localhost:5432/celestial_signs
```

**Security Note**: For production, use environment variables:
```ini
sqlalchemy.url = postgresql://celestial_app:${DB_PASSWORD}@localhost:5432/celestial_signs
```

Then set: `export DB_PASSWORD=celestial2025` (Linux/macOS) or `$env:DB_PASSWORD="celestial2025"` (PowerShell)

---

### 7. Create SQLAlchemy Base

Create `backend/app/db/base.py`:

```python
"""SQLAlchemy declarative base and database session configuration."""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Database URL from environment or default
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://celestial_app:celestial2025@localhost:5432/celestial_signs"
)

# Create engine
engine = create_engine(
    DATABASE_URL,
    echo=False,  # Set to True for SQL query logging
    pool_pre_ping=True,  # Verify connections before using
    pool_size=10,
    max_overflow=20
)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Declarative base for models
Base = declarative_base()

# Dependency for FastAPI (future use)
def get_db():
    """Dependency that provides a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

---

### 8. Update Alembic Environment

Edit `backend/alembic/env.py` to import your models:

```python
# Add after imports section (around line 8)
import sys
from pathlib import Path

# Add backend/app to Python path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.db.base import Base
from app.models.scientific import *  # EphemerisData, OrbitalElements, etc.
from app.models.events import *      # Earthquakes, SolarEvents, etc.
from app.models.theological import * # Prophecies, CelestialSigns, etc.
from app.models.alerts import *      # DataTriggers, Alerts
from app.models.correlations import * # CorrelationRules, EventCorrelations

# Update target_metadata (around line 21)
target_metadata = Base.metadata
```

---

### 9. Create First Migration

```bash
# Auto-generate migration from models
alembic revision --autogenerate -m "initial schema"

# This creates: backend/alembic/versions/abc123_initial_schema.py
```

**Review the generated migration** in `alembic/versions/` before proceeding.

---

### 10. Run Migrations

```bash
# Apply all pending migrations
alembic upgrade head

# Expected output:
# INFO  [alembic.runtime.migration] Running upgrade  -> abc123, initial schema
```

**Verify tables created**:
```bash
psql celestial_signs -c "\dt"
```

Should list 14 tables:
- alerts
- celestial_signs
- correlation_rules
- data_triggers
- earthquakes
- ephemeris_data
- event_correlations
- impact_risks
- meteor_showers
- neo_close_approaches
- orbital_elements
- prophecies
- prophecy_sign_links
- solar_events
- volcanic_activity

---

### 11. Run Seed Data Migration

```bash
# Create seed data migration
alembic revision -m "seed theological data"

# Edit the generated file to include INSERT statements from contracts/seed-data.sql
# Then run:
alembic upgrade head
```

---

### 12. Verify Setup

```bash
# Check database connection
psql postgresql://celestial_app:celestial2025@localhost:5432/celestial_signs -c "SELECT COUNT(*) FROM prophecies;"

# Expected output: 3 (or more if seed data loaded)

# Check PostGIS function
psql celestial_signs -c "SELECT calculate_distance_km(37.7749, -122.4194, 34.0522, -118.2437);"

# Expected output: 559.12 (San Francisco to Los Angeles distance in km)

# Check views
psql celestial_signs -c "SELECT * FROM v_high_risk_objects;"

# Should return empty result set (no data ingested yet)
```

---

## Testing

### Run Unit Tests

```bash
# Run all tests
pytest tests/

# Run specific test file
pytest tests/test_migrations.py -v

# Run with coverage
pytest --cov=app tests/
```

### Test Migration Rollback

```bash
# Downgrade one migration
alembic downgrade -1

# Check tables removed
psql celestial_signs -c "\dt"

# Re-upgrade
alembic upgrade head
```

---

## Common Issues & Troubleshooting

### Issue 1: "PostGIS extension not found"

**Solution**:
```bash
# Install PostGIS for PostgreSQL 17 (example for Ubuntu)
sudo apt-get install postgresql-17-postgis-3

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### Issue 2: "Permission denied for database"

**Solution**:
```bash
# Re-grant permissions
psql celestial_signs -c "GRANT ALL PRIVILEGES ON DATABASE celestial_signs TO celestial_app;"
```

### Issue 3: "Alembic can't find models"

**Solution**: Verify `alembic/env.py` has correct imports and `sys.path` includes `backend/app`

### Issue 4: "psycopg2 installation fails"

**Solution**: Use binary package:
```bash
pip uninstall psycopg2
pip install psycopg2-binary
```

---

## Next Steps

After successful setup:

1. **Implement SQLAlchemy Models**: Create model files in `backend/app/models/`
2. **Create Remaining Migrations**: 
   - `002_create_views.py`
   - `003_create_functions.py`
   - `004_seed_theological_data.py`
3. **Write Tests**: Add test files in `backend/tests/`
4. **Data Ingestion**: Implement API clients for JPL Horizons, USGS, NOAA (separate feature)

---

## Quick Reference

### Useful Commands

```bash
# Check current migration version
alembic current

# View migration history
alembic history

# Upgrade to specific version
alembic upgrade abc123

# Downgrade to specific version
alembic downgrade abc123

# Show SQL without executing
alembic upgrade head --sql

# Create empty migration (manual SQL)
alembic revision -m "custom migration"

# Re-generate requirements.txt
pip freeze > requirements.txt
```

### Database Connection Strings

```bash
# Development (local)
postgresql://celestial_app:celestial2025@localhost:5432/celestial_signs

# Test database (pytest-postgresql creates ephemeral DB)
# No manual connection needed - handled by fixtures

# Production (example - use environment variables)
postgresql://celestial_app:${DB_PASSWORD}@prod-db.example.com:5432/celestial_signs?sslmode=require
```

---

## Support

- **Alembic Docs**: https://alembic.sqlalchemy.org/
- **SQLAlchemy Docs**: https://docs.sqlalchemy.org/
- **PostGIS Docs**: https://postgis.net/docs/
- **Project Issues**: Open issue on GitHub repository

---

**Setup Complete!** 🎉

You now have a fully configured database schema ready for astronomical data ingestion.
