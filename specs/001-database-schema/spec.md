# Feature Specification: Database Schema Implementation

**Feature Branch**: `001-database-schema`  
**Created**: 2025-10-25  
**Status**: Draft  
**Input**: Create initial database schema using Alembic migrations for PostgreSQL 17 with PostGIS

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Scientific Data Storage (Priority: P1)

The system must store astronomical and geophysical data from multiple external APIs (JPL Horizons, USGS, NOAA) in a structured database that enables efficient querying and correlation analysis.

**Why this priority**: This is the foundational data layer that all other features depend on. Without proper data storage, no analysis, visualization, or alerting can occur.

**Independent Test**: Can be fully tested by inserting sample ephemeris data, orbital elements, and earthquake records, then querying them back with filters (by date, object name, magnitude). Success means data persists correctly with proper spatial indexing for PostGIS queries.

**Acceptance Scenarios**:

1. **Given** ephemeris data from JPL Horizons API, **When** the system ingests position vectors for a comet, **Then** the data is stored with proper J2000 reference frame coordinates (x, y, z in AU) and can be retrieved by object name and epoch
2. **Given** orbital elements with eccentricity > 1.0, **When** the data is stored, **Then** the system automatically marks the object as interstellar using a generated column
3. **Given** earthquake data from USGS, **When** seismic events are stored with latitude/longitude, **Then** PostGIS geography points enable spatial queries within a radius
4. **Given** multiple data sources writing concurrently, **When** duplicate entries are attempted (same object_name and epoch_iso), **Then** the system enforces uniqueness constraints and rejects duplicates

---

### User Story 2 - Prophetic Content Management (Priority: P2)

The system must store biblical prophecies, celestial signs, and their relationships to enable correlation between theological interpretations and astronomical events.

**Why this priority**: This enables the core prophetic analysis feature, but depends on having astronomical data in place first (P1). This is the theological "overlay" on scientific data.

**Independent Test**: Can be tested by inserting prophecy records (e.g., Revelation 6:12-14), celestial signs (e.g., "Great Earthquake"), and linking them via the many-to-many relationship table. Success means retrieving a prophecy returns all linked celestial signs.

**Acceptance Scenarios**:

1. **Given** a biblical prophecy record, **When** it is linked to multiple celestial signs, **Then** the many-to-many relationship preserves all associations and prevents duplicate links
2. **Given** prophecy categories (SEAL_JUDGMENT, TRUMPET_JUDGMENT), **When** querying for all prophecies in a category, **Then** results are ordered by chronological sequence
3. **Given** a celestial sign with multiple scripture references, **When** stored as a PostgreSQL array, **Then** all references are retrievable without normalization

---

### User Story 3 - Alert Trigger Configuration (Priority: P2)

The system must store configurable data triggers (Prophetic Data Signatures) that define conditions for generating alerts when astronomical events match prophetic criteria.

**Why this priority**: This connects the scientific and theological layers by defining rules that watch for significant patterns. It's P2 because it requires both data layers (P1 and P2.1) to exist first.

**Independent Test**: Can be tested by creating a trigger rule (e.g., "Torino scale > 0") and verifying it's stored with proper JSON conditions, priority levels, and active status. Success means rules can be toggled on/off and queried by sign_id.

**Acceptance Scenarios**:

1. **Given** a data trigger with query parameters (data_source_api, query_parameter, query_operator, query_value), **When** the trigger is activated, **Then** the system can evaluate whether incoming data matches the condition
2. **Given** triggers with different priority levels (1=High, 5=Low), **When** multiple triggers activate, **Then** alerts are generated according to priority order
3. **Given** complex trigger conditions stored as JSONB, **When** additional filter logic is needed beyond basic operators, **Then** the system supports nested conditions (e.g., "torino_scale_max > 0 AND palermo_scale_cumulative > -2")

---

### User Story 4 - Alert Generation and Tracking (Priority: P3)

The system must store generated alerts when trigger conditions are met, tracking their lifecycle from active to acknowledged to resolved.

**Why this priority**: This is the output layer that depends on all previous components. It's P3 because users need data (P1), prophetic mappings (P2.1), and trigger rules (P2.2) functioning before alerts become meaningful.

**Independent Test**: Can be tested by manually inserting alert records with different statuses and severity levels, then querying active alerts sorted by severity. Success means alerts transition through states (ACTIVE → ACKNOWLEDGED → RESOLVED) with proper timestamps.

**Acceptance Scenarios**:

1. **Given** an alert triggered by a data condition, **When** the alert is created, **Then** it stores the complete trigger_data as JSONB for audit trail and includes links to the source event (related_event_id)
2. **Given** alerts with severity levels (LOW, MEDIUM, HIGH, CRITICAL), **When** users query active alerts, **Then** results are sorted by severity (CRITICAL first) then by triggered_at timestamp
3. **Given** an active alert, **When** a user acknowledges it, **Then** the acknowledged_at timestamp is recorded and status changes to ACKNOWLEDGED
4. **Given** time-series alert data, **When** analyzing patterns, **Then** the system supports querying alerts by date ranges and grouping by alert_type or related_object_name

---

### User Story 5 - Event Correlation Analysis (Priority: P3)

The system must store correlation rules that define relationships between different event types (e.g., solar flares preceding earthquakes) and record detected correlations for statistical analysis.

**Why this priority**: This is an advanced analytical feature that requires substantial historical data (P1) to be meaningful. It's P3 because basic alerting (P3.1) provides more immediate value.

**Independent Test**: Can be tested by creating a correlation rule (e.g., "X-class flare → M7.5+ earthquake within 3 days"), then manually inserting matching events and verifying the correlation is detected with proper time_delta_hours and confidence_score calculations.

**Acceptance Scenarios**:

1. **Given** a correlation rule with time_window_days, **When** two events occur within that window, **Then** the system creates an event_correlations record with calculated time_delta_hours
2. **Given** correlation rules with threshold conditions stored as JSONB, **When** evaluating potential correlations, **Then** both primary and secondary events must meet their respective thresholds
3. **Given** multiple correlation rules tracking different event pairs, **When** a single event (e.g., X-class flare) could match multiple rules, **Then** each matching correlation is recorded independently

---

### Edge Cases

- **What happens when ephemeris data arrives out of chronological order?** The unique constraint on (object_name, epoch_iso) prevents duplicates, but does not enforce ordering. Queries must explicitly ORDER BY epoch_iso.
- **How does the system handle hyperbolic orbits where aphelion_distance_au and orbital_period_years are undefined?** These fields are nullable, and the is_interstellar generated column provides a clear boolean flag for filtering.
- **What if a prophecy is deleted that has linked celestial signs?** The ON DELETE CASCADE constraint automatically removes entries from prophecy_sign_links, preserving referential integrity.
- **How are geographic queries optimized when searching for earthquakes near a volcano?** PostGIS spatial indexes (GIST) enable efficient radius searches using the geography type with ST_Distance calculations in the helper function.
- **What happens if a trigger's additional_conditions JSONB contains invalid JSON?** PostgreSQL validates JSONB at insert time and will reject malformed data with a clear error message.
- **How does the system prevent duplicate alerts for the same event?** The trigger_data JSONB stores a hash or unique identifier of the source event, allowing application-level deduplication logic (not enforced at schema level).
- **What if solar_events has both a solar flare and CME at the exact same timestamp?** The schema allows this since both are distinct event types. Queries can filter by event_type to distinguish them.
- **How are time zones handled consistently across all timestamp fields?** All timestamp columns use TIMESTAMP WITH TIME ZONE to store UTC internally, ensuring consistent temporal queries regardless of client timezone.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST create a PostgreSQL 17 database schema with PostGIS extension enabled for spatial data types
- **FR-002**: System MUST store ephemeris data (position vectors) from JPL Horizons API with Cartesian coordinates (x, y, z in AU) and velocity vectors (AU/day) in J2000 reference frame
- **FR-003**: System MUST store orbital elements including eccentricity, semi-major axis, inclination, longitude of ascending node, argument of perihelion, mean anomaly, perihelion distance, and aphelion distance
- **FR-004**: System MUST automatically identify interstellar objects using a generated column that evaluates eccentricity > 1.0
- **FR-005**: System MUST store impact risk data from JPL Sentry API including Torino scale (0-10), Palermo scale (cumulative), and impact probability
- **FR-006**: System MUST store NEO close approach data with minimum distance (AU and lunar distances), approach date, and relative velocity
- **FR-007**: System MUST store earthquake data from USGS with PostGIS geography points for spatial queries, including magnitude, depth, location description, and event timestamp
- **FR-008**: System MUST enable spatial queries on earthquakes and volcanic activity using PostGIS geographic indexes (GIST)
- **FR-009**: System MUST store solar events (solar flares, CMEs, geomagnetic storms) from NOAA SWPC with classification data (flare class, CME speed, Kp index, G-scale)
- **FR-010**: System MUST store meteor shower data with predicted Zenithal Hourly Rate (ZHR), peak dates, and radiant coordinates
- **FR-011**: System MUST store volcanic activity with PostGIS geography points, Volcanic Explosivity Index (VEI 0-8), and activity levels
- **FR-012**: System MUST store biblical prophecies with scripture references, full text, event descriptions, prophecy categories, and chronological ordering
- **FR-013**: System MUST store celestial signs with theological interpretations, primary scripture, and arrays of related scriptures
- **FR-014**: System MUST implement a many-to-many relationship between prophecies and celestial signs via prophecy_sign_links table
- **FR-015**: System MUST store data triggers (Prophetic Data Signatures) with query definitions including data_source_api, query_parameter, query_operator, query_value, and JSONB additional conditions
- **FR-016**: System MUST support trigger priority levels (1=High, 5=Low) and active/inactive status toggle
- **FR-017**: System MUST store generated alerts with severity levels (LOW, MEDIUM, HIGH, CRITICAL), status tracking (ACTIVE, ACKNOWLEDGED, RESOLVED), and JSONB trigger_data for audit trails
- **FR-018**: System MUST track alert lifecycle with timestamps for triggered_at, acknowledged_at, and resolved_at
- **FR-019**: System MUST store correlation rules defining relationships between event types with time windows, threshold conditions (JSONB), and minimum occurrence counts
- **FR-020**: System MUST record detected event correlations with time_delta_hours, confidence_score, and references to both primary and secondary events
- **FR-021**: System MUST enforce uniqueness constraints on ephemeris data (object_name, epoch_iso) and orbital elements (object_name, epoch_iso) to prevent duplicate ingestion
- **FR-022**: System MUST create indexes on frequently queried fields including object_name, epoch_iso, magnitude, event_time, torino_scale_max, and eccentricity
- **FR-023**: System MUST provide database views for common queries: v_high_risk_objects, v_recent_significant_quakes, v_active_alerts_summary
- **FR-024**: System MUST implement a helper function calculate_distance_km() that uses PostGIS ST_Distance for geographic calculations
- **FR-025**: System MUST use UUID primary keys for scientific event tables (ephemeris_data, alerts, event_correlations) and SERIAL primary keys for theological reference tables (prophecies, celestial_signs)
- **FR-026**: System MUST configure ON DELETE CASCADE for foreign key relationships in prophecy_sign_links to maintain referential integrity
- **FR-027**: System MUST use Alembic migration system to version control all schema changes with reversible up/down migrations
- **FR-028**: System MUST support PostgreSQL connection: postgresql://celestial_app:celestial2025@localhost:5432/celestial_signs

### Key Entities

- **EphemerisData**: Position vectors for celestial objects with x/y/z coordinates in AU, velocity vectors, Julian Date epochs, and distance metrics from JPL Horizons API
- **OrbitalElements**: Classical orbital elements (e, a, i, Ω, ω, M) with computed is_interstellar flag for hyperbolic orbits
- **ImpactRisks**: Hazard assessment data from JPL Sentry including Torino/Palermo scales and impact probabilities for potentially hazardous objects
- **NeoCloseApproaches**: Upcoming close approach events with minimum distance, velocity, and estimated object diameter
- **Earthquakes**: Seismic events with PostGIS geography points, magnitude, depth, USGS event IDs, and tsunami flags
- **SolarEvents**: Solar flares, CMEs, and geomagnetic storms with classification metrics (flare class, Kp index, G-scale) and Earth arrival predictions
- **MeteorShowers**: Predicted meteor activity with ZHR values, peak dates, radiant coordinates, and parent bodies
- **VolcanicActivity**: Volcanic eruptions and monitoring data with PostGIS geography, VEI scale, activity levels, and ash plume heights
- **Prophecies**: Biblical prophecies with scripture references, full text, categories (SEAL_JUDGMENT, TRUMPET_JUDGMENT), and chronological ordering
- **CelestialSigns**: Prophetic signs (Great Earthquake, Moon to Blood, Stars Falling) with theological interpretations and scripture arrays
- **ProphecySignLinks**: Many-to-many junction table linking prophecies to multiple celestial signs
- **DataTriggers**: Configurable alert rules (PDS) with query conditions, JSONB additional filters, priority levels, and active status
- **Alerts**: Generated alerts with severity, status lifecycle, related event links, JSONB trigger data, and timestamp tracking
- **CorrelationRules**: Statistical correlation definitions between event types with time windows, threshold conditions, and minimum occurrence requirements
- **EventCorrelations**: Detected correlations between events with time deltas, confidence scores, and bidirectional event references

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Database schema includes all 14 core tables (ephemeris_data, orbital_elements, impact_risks, neo_close_approaches, earthquakes, solar_events, meteor_showers, volcanic_activity, prophecies, celestial_signs, prophecy_sign_links, data_triggers, alerts, correlation_rules, event_correlations) with proper column types and constraints
- **SC-002**: PostGIS extension is enabled and geography columns for earthquakes and volcanic_activity support spatial queries with GIST indexes
- **SC-003**: Uniqueness constraints prevent duplicate ephemeris and orbital element records for the same object and epoch combination
- **SC-004**: Generated column is_interstellar correctly identifies hyperbolic orbits (eccentricity > 1.0) without manual updates
- **SC-005**: All timestamp fields use TIMESTAMP WITH TIME ZONE for consistent UTC storage and timezone-aware queries
- **SC-006**: Foreign key constraints with ON DELETE CASCADE maintain referential integrity between prophecies, celestial_signs, and prophecy_sign_links
- **SC-007**: JSONB columns (additional_conditions in data_triggers, trigger_data in alerts, threshold fields in correlation_rules) accept complex nested structures and reject malformed JSON at insert time
- **SC-008**: Indexes on high-traffic query fields (object_name, epoch_iso, magnitude, torino_scale_max, event_time) improve query performance
- **SC-009**: Three database views (v_high_risk_objects, v_recent_significant_quakes, v_active_alerts_summary) provide pre-aggregated common queries
- **SC-010**: Helper function calculate_distance_km() returns accurate kilometer distances between geographic coordinate pairs using PostGIS ST_Distance
- **SC-011**: Sample seed data for theological content (prophecies, celestial signs, data triggers, correlation rules) is available for immediate testing
- **SC-012**: Alembic migration system allows schema rollback to previous versions without data loss
- **SC-013**: Database connection using postgresql://celestial_app:celestial2025@localhost:5432/celestial_signs succeeds with proper user permissions (SELECT, INSERT, UPDATE, DELETE on all tables)

---

## Assumptions

- PostgreSQL 17 is already installed and running on localhost:5432
- PostGIS extension is available and can be enabled (CREATE EXTENSION IF NOT EXISTS postgis)
- Database user celestial_app exists with password celestial2025 and appropriate permissions
- Database celestial_signs already exists (not created by this migration)
- Alembic is the chosen migration framework (Python-based)
- Application will handle data ingestion from external APIs (JPL Horizons, USGS, NOAA, etc.) - this spec covers only the schema
- JSONB is preferred over JSON for additional_conditions and trigger_data due to better indexing and query performance
- UUID generation uses uuid-ossp extension (uuid_generate_v4())
- Default timezone for all timestamp fields is UTC
- Spatial queries will primarily use distance-based filters (within X kilometers) rather than complex polygon intersections
- Correlation analysis will be performed by application logic querying stored rules, not by database triggers or stored procedures
- Alert deduplication logic resides in application code, not enforced by unique constraints (multiple alerts for same event are allowed)
- Scripture text storage uses TEXT type (unlimited length) as some passages may exceed VARCHAR(255)
- Prophetic categories use fixed string values (SEAL_JUDGMENT, TRUMPET_JUDGMENT, etc.) managed by application code
- Database indexes are created at migration time, not dynamically added later
- Sample seed data focuses on theological content (prophecies, signs); scientific data will come from API ingestion
- Migration files are prefixed with version numbers (001_initial_schema.py) for chronological ordering
- Schema supports both interstellar objects (e > 1.0) and traditional solar system objects (e < 1.0) in the same tables
- Activity levels for volcanic_activity (NORMAL, ELEVATED, ERUPTING) are stored as VARCHAR rather than ENUM for flexibility

---

## Dependencies

- PostgreSQL 17 installed and accessible at localhost:5432
- PostGIS extension available for PostgreSQL 17
- Python 3.9+ for running Alembic migrations
- Alembic package installed in Python environment
- SQLAlchemy 2.0+ as ORM layer (Alembic dependency)
- psycopg2 or asyncpg PostgreSQL driver for Python
- Database celestial_signs must exist before running migrations
- User celestial_app must exist with CONNECT, USAGE, SELECT, INSERT, UPDATE, DELETE privileges

---

## Out of Scope

- Creation of the celestial_signs database itself (assumed to exist)
- Creation of celestial_app database user and password management
- Data ingestion logic for external APIs (JPL Horizons, USGS, NOAA, Global Meteor Network, Smithsonian Volcanism Program)
- Application-level validation rules for data quality (e.g., magnitude ranges, valid coordinate bounds)
- Database backup and disaster recovery procedures
- Performance tuning beyond basic indexes (e.g., partitioning, materialized views)
- Real-time triggers or stored procedures for alert generation (handled by application code)
- User authentication and authorization tables (login system not included in this feature)
- Audit logging tables for tracking schema changes or data modifications
- Database monitoring and alerting infrastructure (e.g., slow query logging, connection pooling)
- ETL pipelines for historical data backfill from external APIs
- Data retention policies and automated archival of old records
- Multi-tenant schema design (single database for all users)
- Encryption at rest or column-level encryption for sensitive data
- Full-text search indexes on scripture_text or event descriptions
- GraphQL or REST API endpoint generation from schema (future feature)
