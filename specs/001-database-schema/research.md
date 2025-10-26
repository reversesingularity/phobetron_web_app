# Phase 0: Research & Technology Decisions

**Feature**: Database Schema Implementation  
**Branch**: 001-database-schema  
**Date**: 2025-10-25

## Overview

This document consolidates research findings for implementing a PostgreSQL 17 database schema with PostGIS spatial extensions using Python-based Alembic migrations. All technology choices from the specification's assumptions have been validated against current best practices.

---

## Technology Stack Decisions

### Decision 1: Alembic for Schema Migrations

**Chosen**: Alembic 1.13+ as database migration framework

**Rationale**:
- Industry standard for Python projects with SQLAlchemy
- Supports autogeneration of migrations from model changes
- Reversible migrations (upgrade/downgrade) for safe rollback
- Version-controlled schema changes in Git
- Handles complex operations (computed columns, PostGIS types) via custom operations
- Active development and strong community support

**Alternatives Considered**:
1. **Django Migrations**: Rejected - requires full Django framework; overkill for database-only feature
2. **Flyway/Liquibase**: Rejected - Java-based tools; adds JVM dependency; not idiomatic for Python projects
3. **Raw SQL Scripts**: Rejected - no automatic version tracking; manual rollback complexity; error-prone

**Best Practices**:
- Name migrations descriptively: `001_initial_schema.py`, not `001_migration.py`
- One logical change per migration for clean rollback boundaries
- Test both upgrade and downgrade paths in CI/CD
- Use Alembic's `op.execute()` for complex operations (views, functions, seed data)
- Store migration files in `backend/alembic/versions/` with numeric prefixes

**References**:
- Alembic Documentation: https://alembic.sqlalchemy.org/en/latest/
- SQLAlchemy 2.0 Migration Guide: https://docs.sqlalchemy.org/en/20/changelog/migration_20.html

---

### Decision 2: SQLAlchemy 2.0 as ORM Layer

**Chosen**: SQLAlchemy 2.0+ with declarative models

**Rationale**:
- Required dependency for Alembic (tight integration)
- Type-safe Python models map directly to database schema
- Supports PostgreSQL-specific types (UUID, JSONB, ARRAY)
- GeoAlchemy2 extension provides PostGIS types (Geography, Geometry)
- Asyncio support via asyncpg driver (future-proof for async API layer)
- Generated columns supported in 2.0+ (`Computed()` construct)

**Alternatives Considered**:
1. **Raw psycopg2**: Rejected - no type safety; manual query construction; no ORM benefits
2. **Peewee ORM**: Rejected - smaller ecosystem; weaker PostGIS support; not compatible with Alembic
3. **Tortoise ORM**: Rejected - async-only; incompatible with Alembic's synchronous migration context

**Best Practices**:
- Use declarative base: `Base = declarative_base()`
- Group models by domain: `scientific.py`, `theological.py`, `alerts.py`
- Include docstrings with data source references (JPL Horizons, USGS, NOAA)
- Use type hints for IDE support: `Column(String(100), nullable=False)`
- Define relationships explicitly: `relationship("CelestialSign", back_populates="prophecies")`

**Key Features Used**:
- `Column(UUID(as_uuid=True), default=uuid.uuid4)` for UUID primary keys
- `Column(JSONB)` for flexible additional_conditions and trigger_data
- `Column(ARRAY(String))` for related_scriptures arrays
- `Column(Computed("eccentricity > 1.0"))` for is_interstellar flag
- `GeoAlchemy2.Geography(POINT, 4326)` for earthquake/volcano locations

**References**:
- SQLAlchemy 2.0 Docs: https://docs.sqlalchemy.org/en/20/
- GeoAlchemy2 PostGIS: https://geoalchemy-2.readthedocs.io/en/latest/

---

### Decision 3: PostGIS 3.4+ for Spatial Data

**Chosen**: PostGIS 3.4+ extension with geography types

**Rationale**:
- Standard for geospatial queries in PostgreSQL
- Geography type uses spherical Earth model (accurate distance calculations)
- GIST indexes enable fast spatial queries (<100ms for 100km radius)
- ST_Distance function returns meters natively (convertible to kilometers)
- Wide ecosystem support (QGIS, Leaflet, Mapbox integration for future visualization)
- Proven scalability (USGS, NASA use PostGIS for earthquake/satellite data)

**Alternatives Considered**:
1. **Geometry type (Cartesian)**: Rejected - planar distance calculations inaccurate for global data
2. **External GIS service (Google Maps API)**: Rejected - adds latency; API rate limits; cost
3. **H3 hexagonal indexing**: Rejected - overkill for point-based queries; more complex

**Best Practices**:
- Use `Geography(POINT, 4326)` for lat/lon coordinates (WGS84 standard)
- Always create GIST indexes: `CREATE INDEX idx_earthquake_spatial ON earthquakes USING GIST(epicenter)`
- Store both geography and explicit lat/lon columns for non-spatial queries
- Use `ST_DWithin(epicenter, ST_MakePoint(lon, lat)::geography, radius_meters)` for efficient radius searches
- Helper function encapsulates distance calculations: `calculate_distance_km(lat1, lon1, lat2, lon2)`

**Performance Considerations**:
- GIST index build time: ~1 second per 10,000 points
- Spatial query performance: ~50ms for 100km radius with 1M points (with index)
- Geography calculations slower than geometry (~20% overhead) but necessary for accuracy

**References**:
- PostGIS Documentation: https://postgis.net/docs/
- PostGIS Performance Tips: https://postgis.net/workshops/postgis-intro/indexing.html

---

### Decision 4: psycopg2-binary for Database Driver

**Chosen**: psycopg2-binary 2.9+ as PostgreSQL adapter

**Rationale**:
- Most mature PostgreSQL driver for Python (20+ years of development)
- Binary package simplifies installation (no C compiler required)
- Full PostgreSQL 17 compatibility
- Synchronous operations suitable for Alembic migration context
- Wide adoption ensures compatibility with monitoring tools (pgAdmin, DataGrip)

**Alternatives Considered**:
1. **asyncpg**: Rejected for migrations - Alembic requires synchronous driver; use asyncpg later for async API layer
2. **psycopg3**: Considered - newer but less ecosystem support; wait for broader adoption
3. **pg8000**: Rejected - pure Python (slower); less feature-complete

**Best Practices**:
- Use connection pooling in application layer (SQLAlchemy's QueuePool)
- Set `pool_pre_ping=True` to detect stale connections
- Configure statement timeout: `SET statement_timeout = '30s'` for long-running migrations
- Use prepared statements for repeated queries (automatic in SQLAlchemy)

**References**:
- psycopg2 Documentation: https://www.psycopg.org/docs/

---

### Decision 5: pytest + pytest-postgresql for Testing

**Chosen**: pytest 8.0+ with pytest-postgresql plugin

**Rationale**:
- pytest is Python standard for testing (over unittest)
- pytest-postgresql creates isolated ephemeral databases per test session
- Automatic cleanup prevents test pollution
- Fixtures enable reusable database setup logic
- pytest-alembic plugin validates migration reversibility

**Alternatives Considered**:
1. **unittest (stdlib)**: Rejected - more verbose; lacks fixture ecosystem
2. **Manual test database**: Rejected - requires manual setup/teardown; prone to data leaks
3. **Docker test containers**: Considered - heavier weight; slower startup; use for integration tests

**Best Practices**:
- Use `pytest-postgresql` fixture for isolated test databases
- Separate test categories: `tests/test_migrations.py`, `tests/test_constraints.py`, `tests/test_spatial_queries.py`
- Test both upgrade and downgrade paths: `alembic downgrade -1 && alembic upgrade +1`
- Mock external API calls (JPL, USGS) in model tests - focus on schema validation
- Use parametrized tests for multiple table validations

**Example Fixture**:
```python
@pytest.fixture
def test_db(postgresql):
    """Create test database with PostGIS."""
    engine = create_engine(postgresql.url())
    Base.metadata.create_all(engine)
    yield engine
    Base.metadata.drop_all(engine)
```

**References**:
- pytest Documentation: https://docs.pytest.org/
- pytest-postgresql: https://pypi.org/project/pytest-postgresql/
- pytest-alembic: https://pypi.org/project/pytest-alembic/

---

## Database Design Patterns

### Pattern 1: Generated Columns for Computed Fields

**Use Case**: Automatically flag interstellar objects (eccentricity > 1.0) without application logic

**Implementation**:
```python
is_interstellar = Column(Boolean, Computed("eccentricity > 1.0"), nullable=False)
```

**SQL Equivalent**:
```sql
is_interstellar BOOLEAN GENERATED ALWAYS AS (eccentricity > 1.0) STORED
```

**Benefits**:
- Always consistent (no manual updates required)
- Indexed for fast queries: `SELECT * FROM orbital_elements WHERE is_interstellar = TRUE`
- Stored physically (not recomputed on read)

**Trade-offs**:
- Cannot be updated manually (always computed)
- Requires PostgreSQL 12+ (supported in v17)

---

### Pattern 2: JSONB for Flexible Conditions

**Use Case**: Store complex trigger conditions that vary by rule type

**Implementation**:
```python
additional_conditions = Column(JSONB, nullable=True)
```

**Example Data**:
```json
{
  "secondary_check": "palermo_scale_cumulative > -2",
  "min_duration_seconds": 120,
  "excluded_regions": ["Antarctica"]
}
```

**Benefits**:
- Schema flexibility without ALTER TABLE migrations
- GIN indexes enable fast key-based queries: `WHERE additional_conditions @> '{"min_duration_seconds": 120}'`
- Automatic validation (rejects malformed JSON)

**Best Practices**:
- Document expected schema in model docstrings
- Validate structure in application code (Pydantic models)
- Avoid deep nesting (>3 levels) for query performance

---

### Pattern 3: UUID vs SERIAL Primary Keys

**Decision**: Use UUID for event tables (ephemeris_data, alerts), SERIAL for reference tables (prophecies, celestial_signs)

**Rationale**:
- **UUID**: Distributed-friendly (multiple ingestion workers won't collide); globally unique for external API correlation
- **SERIAL**: Human-readable IDs for reference data (Prophecy #7 easier to reference than UUID); sequential ordering

**Implementation**:
```python
# UUID for event tables
id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

# SERIAL for reference tables
id = Column(Integer, primary_key=True, autoincrement=True)
```

---

## Migration Strategy

### Migration Sequence

1. **001_initial_schema.py**: Core 14 tables with indexes
2. **002_create_views.py**: v_high_risk_objects, v_recent_significant_quakes, v_active_alerts_summary
3. **003_create_functions.py**: calculate_distance_km() helper
4. **004_seed_theological_data.py**: Insert prophecies, celestial signs, data triggers, correlation rules

**Rationale for Sequence**:
- Views depend on tables (must come after 001)
- Functions are standalone but logically grouped
- Seed data requires all tables and relationships in place

### Rollback Strategy

Each migration includes `downgrade()` function:
- Drop views/functions before dropping tables they reference
- Use `op.execute("DROP VIEW IF EXISTS ...")` for safety
- Seed data rollback: DELETE statements with WHERE clauses (preserve user-added data)

---

## Performance Optimization

### Index Strategy

**Primary Indexes** (created in 001_initial_schema.py):
- B-tree indexes on frequently queried columns: object_name, epoch_iso, magnitude, event_time
- GIST indexes on PostGIS geography columns: epicenter, location
- Unique indexes on composite keys: (object_name, epoch_iso)

**Index Sizing**:
- B-tree: ~1KB per 100 rows (negligible for <1M rows)
- GIST: ~5KB per 100 rows (moderate for spatial data)

**Maintenance**:
- Auto-vacuum handles index bloat (default settings sufficient)
- Manual REINDEX if performance degrades after 10M+ rows

### Query Optimization Tips

1. **Spatial Queries**: Always use GIST-indexed columns
   ```sql
   -- GOOD: Uses GIST index
   SELECT * FROM earthquakes WHERE ST_DWithin(epicenter, ST_MakePoint(-122, 37)::geography, 100000);
   
   -- BAD: Sequential scan
   SELECT * FROM earthquakes WHERE latitude BETWEEN 36 AND 38 AND longitude BETWEEN -123 AND -121;
   ```

2. **JSONB Queries**: Use GIN indexes for key lookups
   ```sql
   -- Create GIN index
   CREATE INDEX idx_trigger_conditions ON data_triggers USING GIN(additional_conditions);
   
   -- Fast lookup
   SELECT * FROM data_triggers WHERE additional_conditions @> '{"min_duration_seconds": 120}';
   ```

3. **Time-Series Queries**: Use epoch_iso indexes with ORDER BY
   ```sql
   SELECT * FROM ephemeris_data WHERE object_name = 'Oumuamua' ORDER BY epoch_iso DESC LIMIT 100;
   ```

---

## Security Considerations

### Database User Permissions

```sql
-- Application user (celestial_app) needs:
GRANT CONNECT ON DATABASE celestial_signs TO celestial_app;
GRANT USAGE ON SCHEMA public TO celestial_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO celestial_app;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO celestial_app;

-- Read-only user for analytics (optional)
CREATE USER celestial_readonly WITH PASSWORD 'readonly2025';
GRANT CONNECT ON DATABASE celestial_signs TO celestial_readonly;
GRANT USAGE ON SCHEMA public TO celestial_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO celestial_readonly;
```

### Connection String Security

- Never commit passwords to Git
- Use environment variables: `DATABASE_URL=postgresql://celestial_app:${DB_PASSWORD}@localhost:5432/celestial_signs`
- Rotate passwords quarterly
- Use SSL/TLS in production: `?sslmode=require`

---

## Development Environment Setup

### Prerequisites

1. **PostgreSQL 17** installed and running
2. **PostGIS 3.4+** extension available
3. **Python 3.11+** with pip/venv
4. **Git** for version control

### Installation Steps

```bash
# 1. Create virtual environment
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 2. Install dependencies
pip install alembic sqlalchemy psycopg2-binary geoalchemy2 pytest pytest-postgresql

# 3. Initialize Alembic (if not already done)
alembic init alembic

# 4. Configure alembic.ini
# Edit sqlalchemy.url: postgresql://celestial_app:celestial2025@localhost:5432/celestial_signs

# 5. Create database and enable PostGIS
createdb celestial_signs
psql celestial_signs -c "CREATE EXTENSION IF NOT EXISTS postgis;"
psql celestial_signs -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"

# 6. Run migrations
alembic upgrade head

# 7. Verify setup
psql celestial_signs -c "\dt"  # List tables (should show 14 tables)
```

---

## Validation Checklist

Before marking Phase 0 complete, validate:

- [x] All technology choices documented with rationale
- [x] Alternatives considered and rejection reasons clear
- [x] Best practices identified for each tool
- [x] Migration strategy defined (4 migrations planned)
- [x] Performance optimization patterns documented
- [x] Security considerations addressed (user permissions, password handling)
- [x] Development environment setup guide complete
- [x] No "NEEDS CLARIFICATION" markers remaining

---

## Next Steps

Proceed to **Phase 1: Design & Contracts**:
1. Create `data-model.md` with ER diagrams and table relationships
2. Generate SQL DDL contracts in `contracts/` directory
3. Write `quickstart.md` for developer onboarding
4. Update agent context files (Copilot) with technology stack

**Phase 1 Deliverables**:
- `data-model.md`: Visual ER diagrams, table descriptions, column details
- `contracts/schema.sql`: Complete DDL for 14 tables
- `contracts/views.sql`: View definitions
- `contracts/functions.sql`: Helper function SQL
- `contracts/seed-data.sql`: Theological content inserts
- `quickstart.md`: Step-by-step migration guide
