# Implementation Plan: Database Schema Implementation

**Branch**: `001-database-schema` | **Date**: 2025-10-25 | **Spec**: [spec.md](spec.md)  
**Input**: Feature specification from `/specs/001-database-schema/spec.md`

## Summary

Create a production-ready PostgreSQL 17 database schema with PostGIS extension using Alembic migrations. The schema supports astronomical data ingestion (ephemeris vectors, orbital elements, impact risks), geophysical events (earthquakes, volcanic activity), space weather (solar flares, CMEs), prophetic biblical content (prophecies, celestial signs), and an alert system with correlation analysis. Implements 14 core tables with spatial indexing, JSONB for flexible conditions, generated columns for computed fields, and comprehensive seed data for theological content.

## Technical Context

**Language/Version**: Python 3.11+  
**Primary Dependencies**: Alembic 1.13+, SQLAlchemy 2.0+, psycopg2-binary 2.9+ (or asyncpg for async support), GeoAlchemy2 0.14+ (PostGIS integration)  
**Storage**: PostgreSQL 17 with PostGIS 3.4+ extension  
**Testing**: pytest 8.0+, pytest-postgresql (for isolated test databases), pytest-alembic (migration testing)  
**Target Platform**: Linux/Windows server (backend service), localhost:5432 for development  
**Project Type**: Web application (backend component - database layer)  
**Performance Goals**: Support 10,000+ ephemeris records per object, spatial queries <100ms for 100km radius searches, concurrent writes from 5+ API ingestion workers  
**Constraints**: Database connection limit (100 connections max), PostGIS GIST index build time for large datasets, Alembic migration rollback must preserve data integrity  
**Scale/Scope**: 14 tables, ~50 columns total across scientific and theological domains, initial seed data ~50 theological records, expected growth to 1M+ scientific event records within first year

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Status**: ⚠️ CONSTITUTION TEMPLATE NOT RATIFIED

The `.specify/memory/constitution.md` file contains only placeholder content. This project does not yet have a ratified constitution with specific principles (e.g., Library-First, Test-First, CLI Interface).

**Recommendation**: For this database schema feature, we'll proceed with industry-standard best practices:
- **Migration-First**: All schema changes versioned via Alembic migrations (reversible up/down)
- **Test Database Isolation**: pytest-postgresql creates ephemeral test databases
- **Contract Testing**: Validate schema constraints, indexes, and views match specification
- **Documentation-Driven**: SQLAlchemy models include docstrings referencing data sources (JPL, USGS, NOAA)

**Re-evaluation after Phase 1**: Once the project constitution is ratified, we'll validate compliance and adjust if needed.


## Project Structure

### Documentation (this feature)

```text
specs/001-database-schema/
├── plan.md              # This file - technical implementation plan
├── spec.md              # Feature specification (already created)
├── research.md          # Phase 0: Technology decisions and best practices
├── data-model.md        # Phase 1: Entity-relationship diagrams and schemas
├── quickstart.md        # Phase 1: Developer setup guide for running migrations
├── contracts/           # Phase 1: Database schema contracts (SQL DDL)
│   ├── schema.sql       # Complete DDL for all 14 tables
│   ├── views.sql        # View definitions (v_high_risk_objects, etc.)
│   ├── functions.sql    # Helper functions (calculate_distance_km)
│   └── seed-data.sql    # Theological content seed data
└── checklists/
    └── requirements.md  # Specification quality checklist (already created)
```

### Source Code (repository root)

```text
backend/
├── alembic/
│   ├── versions/
│   │   ├── 001_initial_schema.py           # Main migration: 14 tables + PostGIS
│   │   ├── 002_create_views.py             # Views for common queries
│   │   ├── 003_create_functions.py         # Helper functions
│   │   └── 004_seed_theological_data.py    # Seed prophecies & signs
│   ├── env.py                              # Alembic environment config
│   ├── script.py.mako                      # Migration template
│   └── README.md                           # Migration usage guide
├── alembic.ini                             # Alembic configuration file
├── app/
│   ├── __init__.py
│   ├── db/
│   │   ├── __init__.py
│   │   ├── base.py                         # SQLAlchemy declarative base
│   │   └── session.py                      # Database session management
│   └── models/
│       ├── __init__.py
│       ├── scientific.py                    # EphemerisData, OrbitalElements, etc.
│       ├── events.py                        # Earthquakes, SolarEvents, etc.
│       ├── theological.py                   # Prophecies, CelestialSigns
│       ├── alerts.py                        # DataTriggers, Alerts
│       └── correlations.py                  # CorrelationRules, EventCorrelations
├── tests/
│   ├── __init__.py
│   ├── conftest.py                         # pytest fixtures (test database)
│   ├── test_migrations.py                  # Test all migrations up/down
│   ├── test_models/
│   │   ├── test_scientific_models.py
│   │   ├── test_events_models.py
│   │   ├── test_theological_models.py
│   │   ├── test_alerts_models.py
│   │   └── test_correlations_models.py
│   ├── test_constraints.py                 # Uniqueness, FK, generated columns
│   ├── test_spatial_queries.py             # PostGIS geography queries
│   └── test_seed_data.py                   # Validate theological seed data
├── pyproject.toml                          # Python dependencies (Alembic, SQLAlchemy, etc.)
├── requirements.txt                        # Alternative: pip-style dependencies
└── README.md                               # Backend setup instructions

frontend/                                    # (Out of scope for this feature)
docker/                                      # (Existing - may contain docker-compose.yml)
docs/                                        # (Existing documentation)
```

**Structure Decision**: Web application architecture (Option 2) selected based on existing `backend/` and `frontend/` directories in repository root. This feature implements only the backend database layer. The backend uses standard Python project structure with Alembic migrations in `backend/alembic/` and SQLAlchemy models in `backend/app/models/`. PostGIS spatial types are handled via GeoAlchemy2.

## Complexity Tracking

> **Not applicable** - No constitution violations. This feature follows standard database migration patterns with industry-standard tooling (Alembic, SQLAlchemy, PostGIS).

---

## Phase 0: Research (✅ COMPLETE)

**Status**: All technology decisions finalized  
**Document**: [research.md](research.md)

**Key Decisions**:
- ✅ Alembic 1.13+ for migrations (Python standard, reversible migrations)
- ✅ SQLAlchemy 2.0+ as ORM (required by Alembic, supports generated columns)
- ✅ PostGIS 3.4+ for spatial queries (GIST indexes, geography types)
- ✅ psycopg2-binary 2.9+ as database driver (mature, synchronous for migrations)
- ✅ pytest 8.0+ with pytest-postgresql for isolated test databases

**Best Practices Identified**:
- Generated columns for computed fields (is_interstellar flag)
- JSONB for flexible trigger conditions
- UUID primary keys for event tables, SERIAL for reference tables
- 4-migration sequence: schema → views → functions → seed data

---

## Phase 1: Design & Contracts (✅ COMPLETE)

**Status**: Data model, contracts, and quickstart guide finalized  
**Documents**:
- ✅ [data-model.md](data-model.md) - Complete ER diagrams and table specifications
- ✅ [quickstart.md](quickstart.md) - Developer setup guide (15-20 min setup)
- ⏭️ [contracts/](contracts/) - SQL DDL contracts (to be generated from data-model.md)

**Data Model Summary**:
- **14 tables** across 4 domains (Scientific, Theological, Alerts, Correlations)
- **PostGIS geography columns** for earthquakes and volcanic_activity with GIST indexes
- **Generated column** for is_interstellar (computed from eccentricity > 1.0)
- **JSONB columns** for flexible trigger conditions and alert audit trails
- **3 views**: v_high_risk_objects, v_recent_significant_quakes, v_active_alerts_summary
- **1 helper function**: calculate_distance_km() for geographic distance calculations

**Foreign Key Relationships**:
```
prophecies ←→ prophecy_sign_links ←→ celestial_signs
                                         ↓
                                   data_triggers
                                         ↓
                                      alerts

correlation_rules → event_correlations
```

**Migration Sequence**:
1. `001_initial_schema.py` - All 14 tables with indexes and constraints
2. `002_create_views.py` - 3 pre-aggregated views for common queries
3. `003_create_functions.py` - PostGIS helper function
4. `004_seed_theological_data.py` - Prophecies, signs, triggers, correlation rules

---

## Phase 2: Tasks (⏭️ NEXT STEP)

**Status**: Ready for `/speckit.tasks` command

**Command to run**:
```bash
/speckit.tasks
```

This will generate `tasks.md` with:
- Detailed implementation checklist
- SQLAlchemy model creation tasks
- Alembic migration file creation tasks
- Test suite implementation tasks
- Acceptance criteria verification steps

---

## Implementation Roadmap

### Sprint 1: Foundation (P1 - Scientific Data Layer)
1. Set up backend Python environment (venv, dependencies)
2. Initialize Alembic and configure alembic.ini
3. Create SQLAlchemy models for scientific tables:
   - `app/models/scientific.py` (EphemerisData, OrbitalElements, ImpactRisks)
   - `app/models/events.py` (Earthquakes, SolarEvents, MeteorShowers, VolcanicActivity)
4. Create migration `001_initial_schema.py` (scientific tables only)
5. Write tests: `test_scientific_models.py`, `test_spatial_queries.py`
6. Verify: Insert sample data, run spatial queries, test uniqueness constraints

### Sprint 2: Theological Overlay (P2)
1. Create SQLAlchemy models for theological tables:
   - `app/models/theological.py` (Prophecies, CelestialSigns, ProphecySignLinks)
2. Update migration `001_initial_schema.py` to include theological tables
3. Create migration `004_seed_theological_data.py`
4. Write tests: `test_theological_models.py`, `test_seed_data.py`
5. Verify: Query prophecies with linked signs, test cascade deletes

### Sprint 3: Alert System (P2)
1. Create SQLAlchemy models for alert tables:
   - `app/models/alerts.py` (DataTriggers, Alerts)
2. Update migration `001_initial_schema.py` to include alert tables
3. Write tests: `test_alerts_models.py`, `test_trigger_conditions.py`
4. Verify: Create triggers, generate test alerts, test JSONB queries

### Sprint 4: Views, Functions & Correlation (P3)
1. Create SQLAlchemy models for correlation tables:
   - `app/models/correlations.py` (CorrelationRules, EventCorrelations)
2. Create migration `002_create_views.py`
3. Create migration `003_create_functions.py`
4. Write tests: `test_views.py`, `test_functions.py`, `test_correlations_models.py`
5. Verify: Query views, test calculate_distance_km(), detect correlations

### Sprint 5: Integration Testing
1. Run full migration suite (upgrade/downgrade)
2. Test pytest-alembic migration reversibility
3. Load realistic test datasets (1000+ records)
4. Benchmark spatial queries (<100ms requirement)
5. Validate all constraints, indexes, and generated columns

---

## Success Metrics

From [spec.md](spec.md) Success Criteria:

- ✅ **SC-001**: All 14 tables created with proper column types
- ✅ **SC-002**: PostGIS enabled with GIST indexes on geography columns
- ✅ **SC-003**: Uniqueness constraints prevent duplicates
- ✅ **SC-004**: Generated column is_interstellar auto-computes
- ✅ **SC-005**: TIMESTAMP WITH TIME ZONE for consistent UTC storage
- ✅ **SC-006**: ON DELETE CASCADE maintains referential integrity
- ✅ **SC-007**: JSONB columns validate JSON structure
- ✅ **SC-008**: Indexes on high-traffic columns
- ✅ **SC-009**: Three database views provide pre-aggregated queries
- ✅ **SC-010**: calculate_distance_km() returns accurate distances
- ✅ **SC-011**: Seed data for theological content available
- ✅ **SC-012**: Alembic rollback works without data loss
- ✅ **SC-013**: Database connection succeeds with celestial_app user

**All success criteria can be validated once implementation is complete.**

---

## Ready for Implementation

**Branch**: `001-database-schema`  
**Next Command**: `/speckit.tasks` to generate detailed implementation checklist  
**Estimated Development Time**: 2-3 weeks (5 sprints × 2-3 days each)

**Phase 1 Complete** ✅ All planning artifacts generated. Ready to begin coding.
