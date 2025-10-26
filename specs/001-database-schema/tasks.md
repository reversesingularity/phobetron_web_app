# Tasks: Database Schema Implementation

**Feature Branch**: `001-database-schema`  
**Input**: Design documents from `/specs/001-database-schema/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, quickstart.md ✅

**Total Tasks**: 73  
**User Stories**: 5 (P1: 1, P2: 2, P3: 2)  
**Parallel Opportunities**: 24 tasks can run in parallel  
**Estimated Duration**: 2-3 weeks (5 sprints)

---

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4, US5)
- File paths are absolute or relative to `F:\Projects\phobetron_web_app\backend\`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize Python backend project with Alembic migration framework

- [ ] T001 Create backend directory structure: `backend/app/`, `backend/tests/`, `backend/alembic/`
- [ ] T002 Create Python virtual environment in `backend/venv/` (Python 3.11+)
- [ ] T003 Install core dependencies: `pip install alembic==1.13.0 sqlalchemy==2.0.23 psycopg2-binary==2.9.9 geoalchemy2==0.14.2`
- [ ] T004 [P] Install testing dependencies: `pip install pytest==8.0.0 pytest-postgresql==5.0.0 pytest-alembic==0.11.0`
- [ ] T005 [P] Generate `backend/requirements.txt` from installed packages
- [ ] T006 [P] Create `backend/pyproject.toml` with project metadata and dependencies
- [ ] T007 Initialize Alembic: run `alembic init alembic` from backend directory
- [ ] T008 Configure `backend/alembic.ini` with database URL: `postgresql://celestial_app:celestial2025@localhost:5432/celestial_signs`
- [ ] T009 [P] Create `backend/.env.example` with environment variable templates
- [ ] T010 [P] Create `backend/README.md` with setup instructions from quickstart.md

**Checkpoint**: Backend project structure initialized, ready for database setup

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core database infrastructure that MUST be complete before ANY user story implementation

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T011 Verify PostgreSQL 17 installed and running on localhost:5432
- [ ] T012 Create database: `createdb celestial_signs`
- [ ] T013 Enable PostGIS extension: `psql celestial_signs -c "CREATE EXTENSION IF NOT EXISTS postgis;"`
- [ ] T014 Enable UUID extension: `psql celestial_signs -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"`
- [ ] T015 Create database user: `psql -c "CREATE USER celestial_app WITH PASSWORD 'celestial2025';"`
- [ ] T016 Grant permissions to celestial_app user (CONNECT, USAGE, SELECT, INSERT, UPDATE, DELETE)
- [ ] T017 Create SQLAlchemy declarative base in `backend/app/db/base.py`
- [ ] T018 Create database session factory in `backend/app/db/session.py`
- [ ] T019 Update `backend/alembic/env.py` to import Base and set target_metadata
- [ ] T020 Create pytest configuration in `backend/tests/conftest.py` with test database fixtures
- [ ] T021 [P] Create `backend/app/__init__.py` package marker
- [ ] T022 [P] Create `backend/app/db/__init__.py` package marker
- [ ] T023 [P] Create `backend/app/models/__init__.py` package marker
- [ ] T024 [P] Create `backend/tests/__init__.py` package marker

**Checkpoint**: Foundation ready - database accessible, Alembic configured, user story implementation can begin

---

## Phase 3: User Story 1 - Scientific Data Storage (Priority: P1) 🎯 MVP

**Goal**: Store astronomical and geophysical data from external APIs with spatial indexing

**Independent Test**: Insert sample ephemeris, orbital elements, and earthquake records. Query by object name, date range, and 100km spatial radius. Verify uniqueness constraints reject duplicates.

### Models for User Story 1

- [ ] T025 [P] [US1] Create EphemerisData model in `backend/app/models/scientific.py` with UUID PK, cartesian coordinates (x_au, y_au, z_au), velocity vectors, unique constraint on (object_name, epoch_iso)
- [ ] T026 [P] [US1] Create OrbitalElements model in `backend/app/models/scientific.py` with UUID PK, eccentricity, semi_major_axis_au, inclination_deg, perihelion_distance_au, computed column is_interstellar (eccentricity > 1.0)
- [ ] T027 [P] [US1] Create ImpactRisks model in `backend/app/models/scientific.py` with UUID PK, torino_scale_max, palermo_scale_cumulative, impact_probability_cumulative, is_active boolean
- [ ] T028 [P] [US1] Create NeoCloseApproaches model in `backend/app/models/scientific.py` with UUID PK, approach_date, minimum_distance_au, relative_velocity_km_s
- [ ] T029 [P] [US1] Create Earthquakes model in `backend/app/models/events.py` with UUID PK, PostGIS geography point (epicenter), magnitude, depth_km, usgs_event_id unique constraint
- [ ] T030 [P] [US1] Create SolarEvents model in `backend/app/models/events.py` with UUID PK, event_type (SOLAR_FLARE/CME/GEOMAG_STORM), flare_class, cme_speed_km_s, kp_index, g_scale
- [ ] T031 [P] [US1] Create MeteorShowers model in `backend/app/models/events.py` with UUID PK, shower_name, peak_date, predicted_zhr, radiant_constellation
- [ ] T032 [P] [US1] Create VolcanicActivity model in `backend/app/models/events.py` with UUID PK, PostGIS geography point (location), activity_level, vei (0-8), eruption_start_date

### Migration for User Story 1

- [ ] T033 [US1] Create Alembic migration `001_initial_scientific_schema.py` using `alembic revision --autogenerate -m "initial scientific schema"`
- [ ] T034 [US1] Review generated migration and add indexes: idx_ephemeris_object, idx_ephemeris_epoch, idx_orbital_eccentricity, idx_earthquake_magnitude, idx_earthquake_spatial (GIST on epicenter)
- [ ] T035 [US1] Add unique constraints to migration: (object_name, epoch_iso) for ephemeris_data and orbital_elements, usgs_event_id for earthquakes
- [ ] T036 [US1] Run migration: `alembic upgrade head` and verify 8 scientific tables created
- [ ] T037 [US1] Test migration rollback: `alembic downgrade -1` and verify tables dropped, then `alembic upgrade head` to restore

### Tests for User Story 1

- [ ] T038 [P] [US1] Create unit test `backend/tests/test_models/test_scientific_models.py` to validate EphemerisData, OrbitalElements, ImpactRisks models
- [ ] T039 [P] [US1] Create unit test `backend/tests/test_models/test_events_models.py` to validate Earthquakes, SolarEvents, MeteorShowers, VolcanicActivity models
- [ ] T040 [P] [US1] Create constraint test `backend/tests/test_constraints.py` to verify uniqueness constraints reject duplicate (object_name, epoch_iso)
- [ ] T041 [P] [US1] Create spatial query test `backend/tests/test_spatial_queries.py` to verify PostGIS geography queries work (ST_DWithin for 100km radius)
- [ ] T042 [P] [US1] Create generated column test in `backend/tests/test_constraints.py` to verify is_interstellar auto-computes when eccentricity > 1.0

### Validation for User Story 1

- [ ] T043 [US1] Insert test data: Add 10 ephemeris records for "Oumuamua" with different epochs
- [ ] T044 [US1] Query test: Retrieve ephemeris by object_name and order by epoch_iso DESC
- [ ] T045 [US1] Insert test data: Add earthquake at (37.7749, -122.4194) with magnitude 7.0
- [ ] T046 [US1] Spatial query test: Find earthquakes within 100km of test location using ST_DWithin
- [ ] T047 [US1] Uniqueness test: Attempt duplicate insert with same (object_name, epoch_iso) and verify constraint rejection
- [ ] T048 [US1] Generated column test: Insert orbital element with eccentricity 1.5 and verify is_interstellar = TRUE

**Checkpoint**: User Story 1 complete - Scientific data layer fully functional and independently tested

---

## Phase 4: User Story 2 - Prophetic Content Management (Priority: P2)

**Goal**: Store biblical prophecies, celestial signs, and many-to-many relationships for theological analysis

**Independent Test**: Insert Revelation 6:12-14 prophecy, link to "Great Earthquake" and "Moon to Blood" signs. Query prophecy and verify all linked signs returned. Test CASCADE delete removes links.

### Models for User Story 2

- [ ] T049 [P] [US2] Create Prophecies model in `backend/app/models/theological.py` with SERIAL PK, event_name, scripture_reference, scripture_text (TEXT), prophecy_category, chronological_order
- [ ] T050 [P] [US2] Create CelestialSigns model in `backend/app/models/theological.py` with SERIAL PK, sign_name (UNIQUE), sign_description, theological_interpretation, primary_scripture, related_scriptures (TEXT[] array)
- [ ] T051 [US2] Create ProphecySignLinks model in `backend/app/models/theological.py` with SERIAL PK, prophecy_id FK (ON DELETE CASCADE), sign_id FK (ON DELETE CASCADE), unique constraint on (prophecy_id, sign_id)

### Migration for User Story 2

- [ ] T052 [US2] Update migration `001_initial_scientific_schema.py` to include theological tables OR create new migration `002_theological_schema.py`
- [ ] T053 [US2] Add foreign key relationships with CASCADE: prophecy_sign_links.prophecy_id → prophecies.id, prophecy_sign_links.sign_id → celestial_signs.id
- [ ] T054 [US2] Add indexes: idx_prop_sign_prophecy, idx_prop_sign_sign on prophecy_sign_links
- [ ] T055 [US2] Run migration: `alembic upgrade head` and verify 3 theological tables created
- [ ] T056 [US2] Test CASCADE behavior: Insert prophecy with links, delete prophecy, verify links auto-deleted

### Tests for User Story 2

- [ ] T057 [P] [US2] Create unit test `backend/tests/test_models/test_theological_models.py` to validate Prophecies, CelestialSigns, ProphecySignLinks models
- [ ] T058 [P] [US2] Create relationship test in `backend/tests/test_models/test_theological_models.py` to verify many-to-many links work correctly
- [ ] T059 [P] [US2] Create CASCADE test in `backend/tests/test_constraints.py` to verify deleting prophecy removes all links

### Validation for User Story 2

- [ ] T060 [US2] Insert test prophecy: "Sixth Seal Judgment" (Revelation 6:12-14) with category SEAL_JUDGMENT
- [ ] T061 [US2] Insert test signs: "Great Earthquake", "Sun Darkened", "Moon to Blood" with scripture arrays
- [ ] T062 [US2] Link prophecy to 3 signs via prophecy_sign_links table
- [ ] T063 [US2] Query test: Retrieve prophecy with all linked signs using JOIN or relationship attribute
- [ ] T064 [US2] CASCADE delete test: Delete prophecy and verify prophecy_sign_links rows removed automatically

**Checkpoint**: User Story 2 complete - Theological layer functional and independently tested

---

## Phase 5: User Story 3 - Alert Trigger Configuration (Priority: P2)

**Goal**: Store configurable Prophetic Data Signature (PDS) rules with JSONB conditions for alert generation

**Independent Test**: Create trigger rule ("Torino scale > 0" with JSONB secondary check). Toggle is_active on/off. Query triggers by sign_id. Verify JSONB validates malformed JSON.

### Models for User Story 3

- [ ] T065 [P] [US3] Create DataTriggers model in `backend/app/models/alerts.py` with SERIAL PK, sign_id FK (ON DELETE CASCADE), trigger_name, data_source_api, query_parameter, query_operator, query_value, additional_conditions (JSONB), priority (1-5), is_active boolean

### Migration for User Story 3

- [ ] T066 [US3] Update migration to include data_triggers table with foreign key to celestial_signs
- [ ] T067 [US3] Add indexes: idx_trigger_sign, idx_trigger_active on data_triggers
- [ ] T068 [US3] Run migration: `alembic upgrade head` and verify data_triggers table created
- [ ] T069 [US3] Test JSONB validation: Attempt insert with malformed JSON in additional_conditions and verify rejection

### Tests for User Story 3

- [ ] T070 [P] [US3] Create unit test `backend/tests/test_models/test_alerts_models.py` to validate DataTriggers model
- [ ] T071 [P] [US3] Create JSONB test in `backend/tests/test_models/test_alerts_models.py` to verify complex nested conditions store/retrieve correctly

### Validation for User Story 3

- [ ] T072 [US3] Insert test trigger: "Wormwood - High Impact Risk" linked to sign_id for "Wormwood Star" with query_parameter "torino_scale_max", operator ">", value "0"
- [ ] T073 [US3] Insert JSONB condition: `{"secondary_check": "palermo_scale_cumulative > -2"}` in additional_conditions
- [ ] T074 [US3] Query test: Retrieve triggers by sign_id and verify JSONB data intact
- [ ] T075 [US3] Toggle test: Set is_active = FALSE, query active triggers, verify excluded

**Checkpoint**: User Story 3 complete - Alert trigger configuration functional and independently tested

---

## Phase 6: User Story 4 - Alert Generation and Tracking (Priority: P3)

**Goal**: Store generated alerts with severity/status lifecycle and JSONB audit trail

**Independent Test**: Insert alert with ACTIVE status and CRITICAL severity. Update to ACKNOWLEDGED with timestamp. Query active alerts sorted by severity. Verify status transitions work.

### Models for User Story 4

- [ ] T076 [P] [US4] Create Alerts model in `backend/app/models/alerts.py` with UUID PK, trigger_id FK (nullable), alert_type, title, description, related_object_name, related_event_id (UUID), severity (LOW/MEDIUM/HIGH/CRITICAL), status (ACTIVE/ACKNOWLEDGED/RESOLVED), triggered_at, acknowledged_at, resolved_at, trigger_data (JSONB)

### Migration for User Story 4

- [ ] T077 [US4] Update migration to include alerts table with foreign key to data_triggers
- [ ] T078 [US4] Add indexes: idx_alert_status, idx_alert_severity, idx_alert_time on alerts
- [ ] T079 [US4] Run migration: `alembic upgrade head` and verify alerts table created

### Tests for User Story 4

- [ ] T080 [P] [US4] Create unit test `backend/tests/test_models/test_alerts_models.py` to validate Alerts model with lifecycle states
- [ ] T081 [P] [US4] Create status transition test in `backend/tests/test_models/test_alerts_models.py` to verify ACTIVE → ACKNOWLEDGED → RESOLVED flow

### Validation for User Story 4

- [ ] T082 [US4] Insert test alert: Create CRITICAL alert for "Oumuamua" with status ACTIVE
- [ ] T083 [US4] Status transition test: Update alert to ACKNOWLEDGED and set acknowledged_at timestamp
- [ ] T084 [US4] Query test: Retrieve active alerts sorted by severity (CRITICAL first, then HIGH, MEDIUM, LOW)
- [ ] T085 [US4] JSONB audit test: Store complete trigger_data snapshot and verify retrieval

**Checkpoint**: User Story 4 complete - Alert tracking functional and independently tested

---

## Phase 7: User Story 5 - Event Correlation Analysis (Priority: P3)

**Goal**: Store correlation rules and detected correlations between event types with time windows

**Independent Test**: Create rule "X-class flare → M7.5+ earthquake within 3 days". Insert matching events. Verify correlation detected with time_delta_hours calculated correctly.

### Models for User Story 5

- [ ] T086 [P] [US5] Create CorrelationRules model in `backend/app/models/correlations.py` with SERIAL PK, rule_name (UNIQUE), description, primary_event_type, secondary_event_type, time_window_days, primary_threshold (JSONB), secondary_threshold (JSONB), minimum_occurrences, is_active, priority
- [ ] T087 [P] [US5] Create EventCorrelations model in `backend/app/models/correlations.py` with UUID PK, rule_id FK, primary_event_id (UUID), secondary_event_id (UUID), time_delta_hours, confidence_score (0.0-1.0), detected_at

### Migration for User Story 5

- [ ] T088 [US5] Update migration to include correlation_rules and event_correlations tables
- [ ] T089 [US5] Add indexes: idx_corr_rule, idx_corr_primary, idx_corr_detected on event_correlations
- [ ] T090 [US5] Run migration: `alembic upgrade head` and verify 2 correlation tables created

### Tests for User Story 5

- [ ] T091 [P] [US5] Create unit test `backend/tests/test_models/test_correlations_models.py` to validate CorrelationRules and EventCorrelations models
- [ ] T092 [P] [US5] Create correlation detection test in `backend/tests/test_models/test_correlations_models.py` to verify time_delta_hours calculation

### Validation for User Story 5

- [ ] T093 [US5] Insert test rule: "Comet Perihelion - Earthquake Cluster" with time_window_days = 7
- [ ] T094 [US5] Insert JSONB thresholds: primary_threshold = `{}`, secondary_threshold = `{"magnitude": 6.0}`
- [ ] T095 [US5] Insert test correlation: primary_event_id (comet), secondary_event_id (earthquake), time_delta_hours = 48.5
- [ ] T096 [US5] Query test: Retrieve correlations by rule_id and verify time deltas correct

**Checkpoint**: User Story 5 complete - Correlation analysis functional and independently tested

---

## Phase 8: Database Views and Functions

**Purpose**: Add pre-aggregated views and helper functions for common queries

- [ ] T097 [P] Create migration `002_create_views.py` using `alembic revision -m "create views"`
- [ ] T098 [P] Add v_high_risk_objects view in migration: SELECT from impact_risks LEFT JOIN orbital_elements WHERE is_active AND (torino_scale_max > 0 OR palermo_scale_cumulative > -2)
- [ ] T099 [P] Add v_recent_significant_quakes view in migration: SELECT from earthquakes WHERE magnitude >= 6.0 AND event_time >= NOW() - INTERVAL '30 days'
- [ ] T100 [P] Add v_active_alerts_summary view in migration: SELECT severity, COUNT(*), MAX(triggered_at) FROM alerts WHERE status = 'ACTIVE' GROUP BY severity
- [ ] T101 [P] Create migration `003_create_functions.py` using `alembic revision -m "create functions"`
- [ ] T102 [P] Add calculate_distance_km() function in migration: PL/pgSQL function using ST_Distance with geography type, returns DOUBLE PRECISION
- [ ] T103 Run migrations: `alembic upgrade head` and verify views and function created
- [ ] T104 [P] Create view test `backend/tests/test_views.py` to validate view queries return expected results
- [ ] T105 [P] Create function test `backend/tests/test_functions.py` to verify calculate_distance_km(37.7749, -122.4194, 34.0522, -118.2437) returns ~559 km

**Checkpoint**: Views and functions operational

---

## Phase 9: Seed Data for Theological Content

**Purpose**: Load initial prophecies, celestial signs, triggers, and correlation rules

- [ ] T106 Create migration `004_seed_theological_data.py` using `alembic revision -m "seed theological data"`
- [ ] T107 Add INSERT statements for 3 prophecies: "Sixth Seal Judgment", "Wormwood Star Falls", "Day of the Lord Signs"
- [ ] T108 Add INSERT statements for 7 celestial signs: "Great Earthquake", "Sun Darkened", "Moon to Blood", "Stars Falling", "Wormwood Star", "Wandering Stars", "Revelation 12 Sign"
- [ ] T109 Add INSERT statements for prophecy_sign_links: Link "Sixth Seal" to 4 signs, "Wormwood" to 1 sign, "Day of Lord" to 2 signs
- [ ] T110 Add INSERT statements for 8 data_triggers: "Wormwood - High Impact Risk", "Extreme Meteor Storm", "Magnitude 8.5+ Earthquake", "Major Total Solar Eclipse", "VEI 7+ Supervolcano", "Total Lunar Eclipse", "Hyperbolic Orbit Detection", "Wormwood - Name Match"
- [ ] T111 Add INSERT statements for 3 correlation_rules: "Comet Perihelion - Earthquake Cluster", "X-Class Flare - Major Earthquake", "Geomagnetic Storm - Volcanic Activity"
- [ ] T112 Run migration: `alembic upgrade head` and verify seed data loaded
- [ ] T113 [P] Create seed data test `backend/tests/test_seed_data.py` to validate theological records exist
- [ ] T114 Query test: `SELECT COUNT(*) FROM prophecies` should return 3
- [ ] T115 Query test: `SELECT COUNT(*) FROM celestial_signs` should return 7
- [ ] T116 Query test: `SELECT COUNT(*) FROM data_triggers` should return 8

**Checkpoint**: Seed data loaded and validated

---

## Phase 10: Migration Testing

**Purpose**: Validate all migrations are reversible and maintain data integrity

- [ ] T117 Create comprehensive migration test `backend/tests/test_migrations.py` using pytest-alembic
- [ ] T118 Test full upgrade path: `alembic upgrade head` from empty database
- [ ] T119 Test full downgrade path: `alembic downgrade base` and verify all tables/views/functions dropped
- [ ] T120 Test single-step rollback: After each migration, run `alembic downgrade -1` and verify reversibility
- [ ] T121 Test re-upgrade after rollback: `alembic upgrade head` should restore schema without errors
- [ ] T122 Test migration idempotence: Run `alembic upgrade head` twice and verify no errors
- [ ] T123 Verify data preservation: Insert test data, downgrade to previous version, upgrade, verify data intact (where applicable)

**Checkpoint**: All migrations tested and validated as reversible

---

## Phase 11: Performance Testing

**Purpose**: Validate query performance meets <100ms requirement for spatial queries

- [ ] T124 Load test dataset: Insert 10,000 ephemeris records for 100 objects
- [ ] T125 Load test dataset: Insert 1,000 earthquake records across global locations
- [ ] T126 Load test dataset: Insert 500 solar events, 100 meteor showers, 50 volcanic eruptions
- [ ] T127 Benchmark spatial query: Time `SELECT * FROM earthquakes WHERE ST_DWithin(epicenter, point, 100000)` - must be <100ms
- [ ] T128 Benchmark ephemeris query: Time `SELECT * FROM ephemeris_data WHERE object_name = 'Test' ORDER BY epoch_iso DESC LIMIT 100` - must be <50ms
- [ ] T129 Benchmark view query: Time `SELECT * FROM v_high_risk_objects` - must be <200ms
- [ ] T130 Verify GIST index usage: Run EXPLAIN ANALYZE on spatial queries and confirm index scan (not sequential scan)
- [ ] T131 Verify B-tree index usage: Run EXPLAIN ANALYZE on object_name queries and confirm index scan

**Checkpoint**: Performance benchmarks met

---

## Phase 12: Documentation and Polish

**Purpose**: Finalize documentation and code quality

- [ ] T132 [P] Update `backend/README.md` with complete setup instructions
- [ ] T133 [P] Create `backend/docs/SCHEMA.md` documenting all 14 tables with column descriptions
- [ ] T134 [P] Create `backend/docs/MIGRATIONS.md` explaining migration workflow and rollback procedures
- [ ] T135 [P] Add docstrings to all SQLAlchemy models with data source references (JPL Horizons, USGS, NOAA)
- [ ] T136 [P] Add inline comments to complex JSONB queries and PostGIS operations
- [ ] T137 [P] Create `backend/docs/QUERIES.md` with example SQL queries for common use cases
- [ ] T138 Run linter: `pylint backend/app/` and fix any critical issues
- [ ] T139 Run type checker: `mypy backend/app/` and add type hints where missing
- [ ] T140 Update `backend/requirements.txt` with final dependency versions
- [ ] T141 Validate quickstart.md: Follow all steps in a clean environment and verify success
- [ ] T142 Create `backend/CHANGELOG.md` documenting migration sequence and breaking changes

**Checkpoint**: Documentation complete and validated

---

## Phase 13: Final Validation

**Purpose**: End-to-end validation of all success criteria from spec.md

- [ ] T143 **SC-001**: Verify all 14 tables exist: `\dt` in psql should list ephemeris_data, orbital_elements, impact_risks, neo_close_approaches, earthquakes, solar_events, meteor_showers, volcanic_activity, prophecies, celestial_signs, prophecy_sign_links, data_triggers, alerts, correlation_rules, event_correlations
- [ ] T144 **SC-002**: Verify PostGIS enabled: `SELECT PostGIS_Full_Version();` returns 3.4+
- [ ] T145 **SC-003**: Verify uniqueness constraints: INSERT duplicate (object_name, epoch_iso) and confirm rejection
- [ ] T146 **SC-004**: Verify is_interstellar: INSERT eccentricity 1.5 and confirm is_interstellar = TRUE auto-computed
- [ ] T147 **SC-005**: Verify TIMESTAMP WITH TIME ZONE: `\d ephemeris_data` shows "timestamp with time zone" for epoch_iso
- [ ] T148 **SC-006**: Verify CASCADE: DELETE prophecy with links and confirm prophecy_sign_links auto-deleted
- [ ] T149 **SC-007**: Verify JSONB validation: INSERT malformed JSON in additional_conditions and confirm rejection
- [ ] T150 **SC-008**: Verify indexes: `\di` in psql should list idx_ephemeris_object, idx_earthquake_magnitude, idx_earthquake_spatial, etc.
- [ ] T151 **SC-009**: Verify views: `SELECT * FROM v_high_risk_objects, v_recent_significant_quakes, v_active_alerts_summary;` should succeed
- [ ] T152 **SC-010**: Verify function: `SELECT calculate_distance_km(37.7749, -122.4194, 34.0522, -118.2437);` returns ~559
- [ ] T153 **SC-011**: Verify seed data: `SELECT COUNT(*) FROM prophecies;` returns 3+
- [ ] T154 **SC-012**: Verify rollback: `alembic downgrade -1 && alembic upgrade head` succeeds without data loss
- [ ] T155 **SC-013**: Verify connection: `psql postgresql://celestial_app:celestial2025@localhost:5432/celestial_signs` connects successfully

**Checkpoint**: All 13 success criteria validated ✅

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup)
    ↓
Phase 2 (Foundational) ← CRITICAL BLOCKER for all user stories
    ↓
    ├─→ Phase 3 (US1 - P1) [Can start]
    ├─→ Phase 4 (US2 - P2) [Can start in parallel with US1]
    ├─→ Phase 5 (US3 - P2) [Depends on US2 for sign_id FK]
    ├─→ Phase 6 (US4 - P3) [Depends on US3 for trigger_id FK]
    └─→ Phase 7 (US5 - P3) [Can start in parallel with US4]
    ↓
Phase 8 (Views & Functions) [Depends on US1 complete]
    ↓
Phase 9 (Seed Data) [Depends on US2, US3 complete]
    ↓
Phase 10 (Migration Testing) [Depends on all migrations created]
    ↓
Phase 11 (Performance) [Depends on all tables created]
    ↓
Phase 12 (Documentation) [Can start any time after Phase 2]
    ↓
Phase 13 (Final Validation) [Depends on ALL phases complete]
```

### User Story Dependencies

- **US1 (P1)**: No dependencies on other stories - **START HERE**
- **US2 (P2)**: Can start immediately after Phase 2 (Foundational) - Independent
- **US3 (P2)**: Depends on US2 (needs celestial_signs.id for sign_id FK)
- **US4 (P3)**: Depends on US3 (needs data_triggers.id for trigger_id FK)
- **US5 (P3)**: No dependencies on other stories - Can run in parallel with US4

### Optimal Execution Strategy

**Week 1** (MVP Sprint):
1. Complete Phase 1 (Setup) - 1 day
2. Complete Phase 2 (Foundational) - 1 day
3. Complete Phase 3 (US1 - Scientific Data) - 3 days
4. **DEPLOY MVP**: Scientific data layer functional

**Week 2** (Theological + Alerts):
1. Complete Phase 4 (US2 - Prophetic Content) - 2 days
2. Complete Phase 5 (US3 - Alert Triggers) - 2 days
3. Complete Phase 9 (Seed Data) - 1 day

**Week 3** (Analytics + Validation):
1. Complete Phase 6 (US4 - Alert Tracking) - 1 day
2. Complete Phase 7 (US5 - Correlations) in parallel with Phase 8 (Views) - 2 days
3. Complete Phases 10-13 (Testing, Docs, Validation) - 2 days

### Parallel Opportunities

**Within Phase 1 (Setup)**:
- T004, T005, T006, T009, T010 can all run in parallel (different files)

**Within Phase 2 (Foundational)**:
- T021, T022, T023, T024 can run in parallel (package markers)

**Within Phase 3 (US1)**:
- T025-T032 (8 model files) can all run in parallel
- T038-T042 (5 test files) can all run in parallel

**Within Phase 4 (US2)**:
- T049, T050 can run in parallel (different models)
- T057, T058, T059 can run in parallel (different test files)

**Within Phase 8 (Views & Functions)**:
- T097-T102 can run in parallel (migrations are independent)
- T104, T105 can run in parallel (different test files)

**Within Phase 12 (Documentation)**:
- T132-T137 can all run in parallel (different docs)

---

## Implementation Strategy

### MVP First (User Story 1 Only) - Recommended

**Timeline**: 3 days after foundation

1. Complete Phase 1 (Setup) - Day 1
2. Complete Phase 2 (Foundational) - Day 1
3. Complete Phase 3 (US1) - Days 2-4
   - Day 2: Models (T025-T032)
   - Day 3: Migration (T033-T037)
   - Day 4: Tests & Validation (T038-T048)
4. **STOP and VALIDATE**: Test US1 independently
5. **DEPLOY MVP**: Scientific data ingestion ready

**Value**: Functional database for astronomical data with spatial queries

### Incremental Delivery (Full Feature)

**Timeline**: 2-3 weeks

1. **Week 1**: Foundation + US1 → Deploy MVP
2. **Week 2**: US2 + US3 + Seed Data → Deploy theological layer
3. **Week 3**: US4 + US5 + Views + Testing → Deploy analytics layer
4. Each delivery adds value without breaking previous stories

### Parallel Team Strategy

With 3 developers after Phase 2 complete:

- **Developer A**: Phase 3 (US1) - Scientific models
- **Developer B**: Phase 4 (US2) - Theological models
- **Developer C**: Phase 5 (US3) - Alert triggers

After US1-US3 complete:
- **Developer A**: Phase 8 (Views & Functions)
- **Developer B**: Phase 6 (US4) - Alert tracking
- **Developer C**: Phase 7 (US5) - Correlations

---

## Testing Strategy

### Test-Driven Development (TDD)

Each user story follows Red-Green-Refactor:

1. **Red**: Write tests (T038-T042 for US1) - Tests FAIL
2. **Green**: Implement models (T025-T032) - Tests PASS
3. **Refactor**: Optimize queries, add indexes

### Test Categories

1. **Unit Tests**: Model validation, field types, constraints
2. **Integration Tests**: Foreign key relationships, CASCADE behavior
3. **Contract Tests**: Migration reversibility (pytest-alembic)
4. **Performance Tests**: Spatial query benchmarks (<100ms requirement)

### Test Execution

```bash
# Run all tests
pytest backend/tests/ -v

# Run specific user story tests
pytest backend/tests/test_models/test_scientific_models.py -v

# Run with coverage
pytest --cov=backend/app backend/tests/

# Run performance benchmarks
pytest backend/tests/test_performance.py -v --benchmark-only
```

---

## Completion Criteria

Feature is **DONE** when:

- [x] All 155 tasks completed
- [x] All 13 success criteria (SC-001 through SC-013) validated
- [x] All 5 user stories independently tested
- [x] All migrations reversible (tested with alembic downgrade)
- [x] Performance benchmarks met (<100ms spatial queries)
- [x] Quickstart.md validated in clean environment
- [x] All tests passing (pytest shows 100% pass rate)
- [x] Documentation complete (README, SCHEMA, MIGRATIONS, QUERIES)

---

## Quick Reference

### Key Commands

```bash
# Setup
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Migrations
alembic upgrade head        # Apply all migrations
alembic downgrade -1        # Rollback one migration
alembic revision --autogenerate -m "description"  # Generate migration
alembic current             # Show current version
alembic history             # Show migration history

# Testing
pytest backend/tests/ -v                    # All tests
pytest backend/tests/test_migrations.py -v  # Migration tests only
pytest --cov=backend/app backend/tests/     # With coverage

# Database
psql celestial_signs -c "\dt"   # List tables
psql celestial_signs -c "\di"   # List indexes
psql celestial_signs -c "\dv"   # List views
psql celestial_signs -c "\df"   # List functions
```

### File Structure Reference

```
backend/
├── app/
│   ├── db/
│   │   ├── base.py              (T017)
│   │   └── session.py           (T018)
│   └── models/
│       ├── scientific.py        (T025-T028)
│       ├── events.py            (T029-T032)
│       ├── theological.py       (T049-T051)
│       ├── alerts.py            (T065, T076)
│       └── correlations.py      (T086-T087)
├── alembic/
│   ├── versions/
│   │   ├── 001_*.py            (T033)
│   │   ├── 002_*.py            (T097)
│   │   ├── 003_*.py            (T101)
│   │   └── 004_*.py            (T106)
│   └── env.py                  (T019)
├── tests/
│   ├── conftest.py             (T020)
│   ├── test_migrations.py      (T117)
│   ├── test_constraints.py     (T040, T059)
│   ├── test_spatial_queries.py (T041)
│   ├── test_views.py           (T104)
│   ├── test_functions.py       (T105)
│   ├── test_seed_data.py       (T113)
│   └── test_models/
│       ├── test_scientific_models.py    (T038)
│       ├── test_events_models.py        (T039)
│       ├── test_theological_models.py   (T057)
│       ├── test_alerts_models.py        (T070, T080)
│       └── test_correlations_models.py  (T091)
├── requirements.txt            (T005)
├── pyproject.toml             (T006)
└── README.md                  (T010, T132)
```

---

**Tasks Generated**: 2025-10-25  
**Ready for Implementation**: ✅ All tasks defined with clear paths and acceptance criteria

**Next Step**: Begin with Phase 1 (Setup) → Phase 2 (Foundational) → Phase 3 (US1 MVP)
