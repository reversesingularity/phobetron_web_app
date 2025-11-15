# Celestial Signs Backend

Database schema and migrations for the Celestial Signs project - tracking astronomical events, geophysical phenomena, and theological prophecies.

## Quick Start

### Prerequisites
- Python 3.11+
- PostgreSQL 17 with PostGIS 3.4+
- Running PostgreSQL server on localhost:5432

### Installation

1. **Create Python virtual environment:**
   ```powershell
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   ```

2. **Install dependencies:**
   ```powershell
   pip install -r requirements.txt
   ```

3. **Configure environment:**
   ```powershell
   Copy-Item .env.example .env
   # Edit .env with your database credentials
   ```

4. **Setup database:**
   ```powershell
   # Create database
   createdb celestial_signs
   
   # Enable PostGIS extension
   psql celestial_signs -c "CREATE EXTENSION IF NOT EXISTS postgis;"
   psql celestial_signs -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"
   
   # Create user (if needed)
   psql postgres -c "CREATE USER celestial_app WITH PASSWORD 'celestial2025';"
   psql postgres -c "GRANT ALL PRIVILEGES ON DATABASE celestial_signs TO celestial_app;"
   ```

5. **Run migrations:**
   ```powershell
   alembic upgrade head
   ```

### Running Tests

```powershell
pytest
```

## Project Structure

```
backend/
├── alembic/              # Migration scripts
│   ├── versions/         # Individual migration files
│   └── env.py           # Alembic environment configuration
├── app/
│   ├── db/
│   │   ├── base.py      # SQLAlchemy declarative base
│   │   └── session.py   # Database session factory
│   └── models/          # SQLAlchemy ORM models
│       ├── scientific.py # Astronomical data models
│       ├── events.py     # Geophysical event models
│       ├── theological.py # Prophecy and sign models
│       └── alerts.py     # Alert and correlation models
├── tests/               # Test suite
│   ├── conftest.py      # Pytest fixtures
│   └── test_models/     # Model tests
├── requirements.txt     # Python dependencies
├── pyproject.toml       # Project configuration
└── .env                 # Environment variables (not in git)
```

## Database Schema

### Scientific Data (User Story 1 - MVP)
- **ephemeris_data** - Celestial object positions over time
- **orbital_elements** - Orbital parameters for celestial objects
- **impact_risks** - NEO impact risk assessments
- **neo_close_approaches** - Near-Earth Object close approach data
- **earthquakes** - Seismic event records
- **solar_events** - Solar activity (flares, CMEs, geomagnetic storms)
- **meteor_showers** - Annual meteor shower data
- **volcanic_activity** - Volcanic eruption records

### Theological Data (User Story 2)
- **prophecies** - Biblical prophecy records
- **celestial_signs** - Observed celestial sign phenomena

### Correlation System (User Story 3)
- **prophecy_sign_links** - Manual prophecy-to-sign associations
- **correlation_rules** - Automated correlation rule definitions
- **event_correlations** - Detected event correlations

### Alert System (User Story 4 & 5)
- **data_triggers** - Trigger conditions for alerts
- **alerts** - Generated alert records

## Development Workflow

See [quickstart.md](../specs/001-database-schema/quickstart.md) for detailed setup instructions.

### Creating a New Migration

```powershell
alembic revision -m "description of change"
# Edit the generated file in alembic/versions/
alembic upgrade head
```

### Rollback a Migration

```powershell
alembic downgrade -1  # Rollback one migration
alembic downgrade <revision>  # Rollback to specific revision
```

## Testing Strategy

- **Unit tests**: Individual model validation
- **Integration tests**: Cross-table relationships and constraints
- **Spatial query tests**: PostGIS functionality validation
- **Migration tests**: Alembic upgrade/downgrade cycles

## Performance Considerations

- Spatial indexes (GIST) on all geography columns
- Composite indexes on frequently queried combinations
- Generated columns for computed fields
- JSONB indexes on alert condition filters

## Troubleshooting

### PostGIS not available
```powershell
# Install PostGIS extension in PostgreSQL
psql celestial_signs -c "CREATE EXTENSION postgis;"
```

### Migration fails
```powershell
# Check current migration state
alembic current

# View migration history
alembic history

# Reset to base and reapply
alembic downgrade base
alembic upgrade head
```

### Test database connection issues
```powershell
# Verify PostgreSQL is running
pg_ctl status

# Test connection
psql -U celestial_app -d celestial_signs -c "SELECT version();"
```

## References

- [Complete Specification](../specs/001-database-schema/spec.md)
- [Technical Plan](../specs/001-database-schema/plan.md)
- [Data Model](../specs/001-database-schema/data-model.md)
- [Implementation Tasks](../specs/001-database-schema/tasks.md)
