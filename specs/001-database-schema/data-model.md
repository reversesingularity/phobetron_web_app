# Phase 1: Data Model & Entity Relationships

**Feature**: Database Schema Implementation  
**Branch**: 001-database-schema  
**Date**: 2025-10-25

## Overview

This document defines the complete entity-relationship model for the Celestial Signs database. The schema is organized into four logical domains: Scientific Data, Theological Data, Alert System, and Correlation Engine.

---

## Domain Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    CELESTIAL SIGNS DATABASE                      │
│                                                                  │
│  ┌────────────────────────┐  ┌──────────────────────────────┐  │
│  │  SCIENTIFIC DOMAIN     │  │  THEOLOGICAL DOMAIN          │  │
│  │                        │  │                              │  │
│  │  • Ephemeris Data      │  │  • Prophecies                │  │
│  │  • Orbital Elements    │  │  • Celestial Signs           │  │
│  │  • Impact Risks        │  │  • Prophecy-Sign Links       │  │
│  │  • Close Approaches    │  │                              │  │
│  │  • Earthquakes         │◄─┼──┐                           │  │
│  │  • Solar Events        │  │  │   ┌──────────────────┐   │  │
│  │  • Meteor Showers      │  │  │   │  ALERT SYSTEM    │   │  │
│  │  • Volcanic Activity   │  │  └──►│  • Data Triggers │   │  │
│  └────────────────────────┘  │      │  • Alerts        │   │  │
│                               │      └──────────────────┘   │  │
│                               └──────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              CORRELATION ENGINE                           │  │
│  │  • Correlation Rules                                      │  │
│  │  • Event Correlations                                     │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Entity-Relationship Diagram

### Core Relationships

```
┌──────────────────────┐         ┌────────────────────┐
│  prophecies          │         │ celestial_signs    │
│──────────────────────│         │────────────────────│
│ id (PK)              │         │ id (PK)            │
│ event_name           │         │ sign_name          │
│ scripture_reference  │         │ sign_description   │
│ prophecy_category    │         │ primary_scripture  │
│ chronological_order  │         │ related_scriptures │
└──────────────────────┘         └────────────────────┘
         │                                │
         │         ┌────────────────┐     │
         └────────►│ prophecy_sign_ │◄────┘
                   │ links          │
                   │────────────────│
                   │ id (PK)        │
                   │ prophecy_id    │
                   │ sign_id        │
                   └────────────────┘
                           │
                           │ Referenced by
                           ▼
                   ┌────────────────┐
                   │ data_triggers  │
                   │────────────────│
                   │ id (PK)        │
                   │ sign_id (FK)   │
                   │ trigger_name   │
                   │ data_source_api│
                   │ query_parameter│
                   │ query_operator │
                   │ query_value    │
                   │ additional_cond│
                   │ priority       │
                   │ is_active      │
                   └────────────────┘
                           │
                           │ Generates
                           ▼
                   ┌────────────────┐
                   │ alerts         │
                   │────────────────│
                   │ id (PK)        │
                   │ trigger_id (FK)│
                   │ alert_type     │
                   │ severity       │
                   │ status         │
                   │ triggered_at   │
                   │ acknowledged_at│
                   │ resolved_at    │
                   │ trigger_data   │
                   └────────────────┘
```

### Scientific Data Tables (Independent)

All scientific tables are standalone (no foreign keys between them):

```
ephemeris_data          orbital_elements       impact_risks
──────────────          ────────────────       ─────────────
id (PK, UUID)           id (PK, UUID)          id (PK, UUID)
object_name             object_name            object_name
epoch_jd                epoch_jd               torino_scale_max
epoch_iso               epoch_iso              palermo_scale_cum
x_au, y_au, z_au        eccentricity          impact_probability
vx, vy, vz              semi_major_axis_au    possible_impacts
range_au                inclination_deg       is_active
data_source             is_interstellar       last_updated
ingested_at             data_source           

neo_close_approaches    earthquakes           solar_events
────────────────────    ───────────           ─────────────
id (PK, UUID)           id (PK, UUID)         id (PK, UUID)
object_name             usgs_event_id         event_type
approach_date           magnitude             event_time
min_distance_au         epicenter (PostGIS)   flare_class
min_distance_ld         latitude              cme_speed_km_s
relative_velocity_km_s  longitude             kp_index
absolute_magnitude_h    depth_km              g_scale
estimated_diameter_km   event_time            data_source

meteor_showers          volcanic_activity
──────────────          ─────────────────
id (PK, UUID)           id (PK, UUID)
shower_name             volcano_name
peak_date               location (PostGIS)
predicted_zhr           latitude, longitude
radiant_constellation   activity_level
parent_body             vei
data_source             eruption_start_date
```

### Correlation Engine

```
┌─────────────────────────┐
│  correlation_rules      │
│─────────────────────────│
│ id (PK)                 │
│ rule_name               │
│ primary_event_type      │
│ secondary_event_type    │
│ time_window_days        │
│ primary_threshold       │
│ secondary_threshold     │
│ is_active               │
└─────────────────────────┘
         │
         │ Detects
         ▼
┌─────────────────────────┐
│  event_correlations     │
│─────────────────────────│
│ id (PK, UUID)           │
│ rule_id (FK)            │
│ primary_event_id (UUID) │
│ secondary_event_id(UUID)│
│ time_delta_hours        │
│ confidence_score        │
│ detected_at             │
└─────────────────────────┘
```

---

## Table Specifications

### 1. ephemeris_data

**Purpose**: Store JPL Horizons position vectors for celestial objects

**Primary Key**: `id` (UUID)  
**Unique Constraint**: `(object_name, epoch_iso)`  
**Indexes**: 
- `idx_ephemeris_object` on `object_name`
- `idx_ephemeris_epoch` on `epoch_iso`
- `idx_ephemeris_jd` on `epoch_jd`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | UUID | No | Auto-generated UUID |
| object_name | VARCHAR(100) | No | Object identifier (e.g., "Oumuamua", "433 Eros") |
| object_designation | VARCHAR(50) | Yes | Alternative designation (e.g., "1I/2017 U1") |
| epoch_jd | DOUBLE PRECISION | No | Julian Date epoch |
| epoch_iso | TIMESTAMP WITH TIME ZONE | No | ISO 8601 timestamp |
| x_au | DOUBLE PRECISION | No | X coordinate in AU (J2000 frame) |
| y_au | DOUBLE PRECISION | No | Y coordinate in AU (J2000 frame) |
| z_au | DOUBLE PRECISION | No | Z coordinate in AU (J2000 frame) |
| vx_au_per_day | DOUBLE PRECISION | Yes | X velocity in AU/day |
| vy_au_per_day | DOUBLE PRECISION | Yes | Y velocity in AU/day |
| vz_au_per_day | DOUBLE PRECISION | Yes | Z velocity in AU/day |
| range_au | DOUBLE PRECISION | Yes | Distance from Earth in AU |
| range_rate | DOUBLE PRECISION | Yes | Rate of distance change |
| reference_frame | VARCHAR(20) | No | Default 'J2000' |
| data_source | VARCHAR(50) | No | Default 'JPL_HORIZONS' |
| ingested_at | TIMESTAMP WITH TIME ZONE | No | Insert timestamp |

**Sample Data**:
```sql
INSERT INTO ephemeris_data (object_name, epoch_jd, epoch_iso, x_au, y_au, z_au, range_au) 
VALUES ('Oumuamua', 2458071.5, '2017-10-19 00:00:00+00', 0.2559, -0.1733, 0.0067, 0.1609);
```

---

### 2. orbital_elements

**Purpose**: Store classical orbital elements from JPL Horizons

**Primary Key**: `id` (UUID)  
**Unique Constraint**: `(object_name, epoch_iso)`  
**Indexes**:
- `idx_orbital_object` on `object_name`
- `idx_orbital_eccentricity` on `eccentricity`
- `idx_orbital_interstellar` on `is_interstellar`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | UUID | No | Auto-generated UUID |
| object_name | VARCHAR(100) | No | Object identifier |
| epoch_jd | DOUBLE PRECISION | No | Julian Date epoch |
| epoch_iso | TIMESTAMP WITH TIME ZONE | No | ISO 8601 timestamp |
| eccentricity | DOUBLE PRECISION | No | Orbital eccentricity (e) |
| semi_major_axis_au | DOUBLE PRECISION | Yes | Semi-major axis (a) in AU |
| inclination_deg | DOUBLE PRECISION | No | Orbital inclination (i) |
| longitude_ascending_node_deg | DOUBLE PRECISION | Yes | Longitude of ascending node (Ω) |
| argument_perihelion_deg | DOUBLE PRECISION | Yes | Argument of perihelion (ω) |
| mean_anomaly_deg | DOUBLE PRECISION | Yes | Mean anomaly (M) |
| perihelion_distance_au | DOUBLE PRECISION | Yes | Perihelion distance (q) |
| aphelion_distance_au | DOUBLE PRECISION | Yes | Aphelion distance (Q) |
| orbital_period_years | DOUBLE PRECISION | Yes | Orbital period (P) |
| **is_interstellar** | BOOLEAN | No | **COMPUTED: eccentricity > 1.0** |
| data_source | VARCHAR(50) | No | Default 'JPL_HORIZONS' |
| ingested_at | TIMESTAMP WITH TIME ZONE | No | Insert timestamp |

**Generated Column**:
```sql
is_interstellar BOOLEAN GENERATED ALWAYS AS (eccentricity > 1.0) STORED
```

---

### 3. impact_risks

**Purpose**: Store JPL Sentry impact risk assessments

**Primary Key**: `id` (UUID)  
**Unique Constraint**: `object_name`  
**Indexes**:
- `idx_risk_torino` on `torino_scale_max`
- `idx_risk_palermo` on `palermo_scale_cumulative`
- `idx_risk_active` on `is_active`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | UUID | No | Auto-generated UUID |
| object_name | VARCHAR(100) | No | Object identifier (UNIQUE) |
| object_designation | VARCHAR(50) | Yes | Alternative designation |
| torino_scale_max | INTEGER | Yes | Max Torino scale (0-10) |
| palermo_scale_cumulative | DOUBLE PRECISION | Yes | Cumulative Palermo scale |
| impact_probability_cumulative | DOUBLE PRECISION | Yes | Total impact probability |
| possible_impacts | INTEGER | Yes | Number of potential impacts |
| last_observation_date | DATE | Yes | Most recent observation |
| is_active | BOOLEAN | No | Default TRUE |
| removal_date | TIMESTAMP WITH TIME ZONE | Yes | Date removed from monitoring |
| data_source | VARCHAR(50) | No | Default 'JPL_SENTRY' |
| last_updated | TIMESTAMP WITH TIME ZONE | No | Last data refresh |
| ingested_at | TIMESTAMP WITH TIME ZONE | No | Initial insert |

---

### 4. earthquakes

**Purpose**: Store USGS seismic events with PostGIS spatial data

**Primary Key**: `id` (UUID)  
**Unique Constraint**: `usgs_event_id`  
**Indexes**:
- `idx_earthquake_time` on `event_time`
- `idx_earthquake_magnitude` on `magnitude`
- **`idx_earthquake_spatial` GIST on `epicenter`** (PostGIS spatial index)

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | UUID | No | Auto-generated UUID |
| usgs_event_id | VARCHAR(50) | No | USGS unique identifier (UNIQUE) |
| magnitude | DOUBLE PRECISION | No | Earthquake magnitude |
| magnitude_type | VARCHAR(10) | Yes | Type (e.g., "mw", "ml") |
| location_description | TEXT | Yes | Human-readable location |
| **epicenter** | **GEOGRAPHY(POINT, 4326)** | No | **PostGIS point** |
| latitude | DOUBLE PRECISION | No | Latitude (-90 to 90) |
| longitude | DOUBLE PRECISION | No | Longitude (-180 to 180) |
| depth_km | DOUBLE PRECISION | No | Depth in kilometers |
| event_time | TIMESTAMP WITH TIME ZONE | No | Earthquake occurrence time |
| felt_reports | INTEGER | Yes | Number of "Did You Feel It?" reports |
| tsunami | BOOLEAN | No | Default FALSE |
| data_source | VARCHAR(50) | No | Default 'USGS' |
| ingested_at | TIMESTAMP WITH TIME ZONE | No | Insert timestamp |

**Spatial Query Example**:
```sql
-- Find earthquakes within 100km of a point
SELECT usgs_event_id, magnitude, location_description
FROM earthquakes
WHERE ST_DWithin(epicenter, ST_MakePoint(-122.4194, 37.7749)::geography, 100000)
ORDER BY event_time DESC;
```

---

### 5. prophecies

**Purpose**: Store biblical prophecy records

**Primary Key**: `id` (SERIAL)  
**Indexes**: None (small reference table)

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | SERIAL | No | Sequential integer ID |
| event_name | VARCHAR(255) | No | Prophecy name |
| scripture_reference | VARCHAR(100) | No | Citation (e.g., "Revelation 6:12-14") |
| scripture_text | TEXT | Yes | Full passage text |
| event_description | TEXT | Yes | Detailed description |
| prophecy_category | VARCHAR(50) | Yes | Category (e.g., "SEAL_JUDGMENT") |
| chronological_order | INTEGER | Yes | Sequence number |
| created_at | TIMESTAMP WITH TIME ZONE | No | Insert timestamp |
| updated_at | TIMESTAMP WITH TIME ZONE | No | Last modification |

---

### 6. celestial_signs

**Purpose**: Store prophetic sign definitions

**Primary Key**: `id` (SERIAL)  
**Unique Constraint**: `sign_name`  
**Indexes**: None (small reference table)

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | SERIAL | No | Sequential integer ID |
| sign_name | VARCHAR(255) | No | Sign name (UNIQUE) |
| sign_description | TEXT | Yes | Detailed description |
| theological_interpretation | TEXT | Yes | Theological analysis |
| primary_scripture | VARCHAR(100) | Yes | Main scripture reference |
| **related_scriptures** | **TEXT[]** | Yes | **PostgreSQL array of references** |
| created_at | TIMESTAMP WITH TIME ZONE | No | Insert timestamp |

**Array Example**:
```sql
INSERT INTO celestial_signs (sign_name, related_scriptures)
VALUES ('Great Earthquake', ARRAY['Matthew 24:7', 'Luke 21:11', 'Revelation 16:18']);
```

---

### 7. prophecy_sign_links

**Purpose**: Many-to-many junction table

**Primary Key**: `id` (SERIAL)  
**Foreign Keys**: 
- `prophecy_id` → `prophecies.id` (ON DELETE CASCADE)
- `sign_id` → `celestial_signs.id` (ON DELETE CASCADE)

**Unique Constraint**: `(prophecy_id, sign_id)`  
**Indexes**:
- `idx_prop_sign_prophecy` on `prophecy_id`
- `idx_prop_sign_sign` on `sign_id`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | SERIAL | No | Sequential integer ID |
| prophecy_id | INTEGER | No | Foreign key to prophecies |
| sign_id | INTEGER | No | Foreign key to celestial_signs |

**Cascade Behavior**: Deleting a prophecy automatically removes all links.

---

### 8. data_triggers

**Purpose**: Store Prophetic Data Signature (PDS) alert rules

**Primary Key**: `id` (SERIAL)  
**Foreign Keys**: `sign_id` → `celestial_signs.id` (ON DELETE CASCADE)  
**Indexes**:
- `idx_trigger_sign` on `sign_id`
- `idx_trigger_active` on `is_active`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | SERIAL | No | Sequential integer ID |
| sign_id | INTEGER | No | Foreign key to celestial_signs |
| trigger_name | VARCHAR(255) | No | Descriptive rule name |
| description | TEXT | Yes | Rule explanation |
| data_source_api | VARCHAR(100) | No | API to query (e.g., 'JPL_SENTRY') |
| query_parameter | VARCHAR(100) | No | Field to evaluate (e.g., 'torino_scale_max') |
| query_operator | VARCHAR(10) | No | Operator (e.g., '>', '=', 'CONTAINS') |
| query_value | VARCHAR(100) | No | Threshold value |
| **additional_conditions** | **JSONB** | Yes | **Complex conditions as JSON** |
| priority | INTEGER | No | Priority level (1=High, 5=Low) |
| is_active | BOOLEAN | No | Default TRUE |
| created_at | TIMESTAMP WITH TIME ZONE | No | Insert timestamp |
| updated_at | TIMESTAMP WITH TIME ZONE | No | Last modification |

**JSONB Example**:
```json
{
  "secondary_check": "palermo_scale_cumulative > -2",
  "min_observations": 3,
  "excluded_objects": ["433 Eros"]
}
```

---

### 9. alerts

**Purpose**: Store generated alerts with lifecycle tracking

**Primary Key**: `id` (UUID)  
**Foreign Keys**: `trigger_id` → `data_triggers.id`  
**Indexes**:
- `idx_alert_status` on `status`
- `idx_alert_severity` on `severity`
- `idx_alert_time` on `triggered_at`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | UUID | No | Auto-generated UUID |
| trigger_id | INTEGER | Yes | Foreign key to data_triggers |
| alert_type | VARCHAR(50) | No | Type (e.g., 'PDS_MATCH', 'CORRELATION') |
| title | VARCHAR(255) | No | Alert title |
| description | TEXT | Yes | Detailed message |
| related_object_name | VARCHAR(100) | Yes | Object that triggered alert |
| related_event_id | UUID | Yes | Link to source event table |
| severity | VARCHAR(20) | No | 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL' |
| status | VARCHAR(20) | No | 'ACTIVE', 'ACKNOWLEDGED', 'RESOLVED' |
| triggered_at | TIMESTAMP WITH TIME ZONE | No | Alert creation time |
| acknowledged_at | TIMESTAMP WITH TIME ZONE | Yes | When user acknowledged |
| resolved_at | TIMESTAMP WITH TIME ZONE | Yes | When issue resolved |
| **trigger_data** | **JSONB** | Yes | **Snapshot of data that caused alert** |
| created_at | TIMESTAMP WITH TIME ZONE | No | Insert timestamp |

---

### 10. correlation_rules

**Purpose**: Define event correlation analysis rules

**Primary Key**: `id` (SERIAL)  
**Unique Constraint**: `rule_name`  
**Indexes**: None (small configuration table)

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | SERIAL | No | Sequential integer ID |
| rule_name | VARCHAR(255) | No | Unique rule identifier |
| description | TEXT | Yes | Rule explanation |
| primary_event_type | VARCHAR(50) | No | First event type (e.g., 'SOLAR_FLARE') |
| secondary_event_type | VARCHAR(50) | No | Second event type (e.g., 'EARTHQUAKE') |
| time_window_days | INTEGER | No | Max time between events |
| **primary_threshold** | **JSONB** | Yes | **Conditions for primary event** |
| **secondary_threshold** | **JSONB** | Yes | **Conditions for secondary event** |
| minimum_occurrences | INTEGER | No | Min matches to report correlation |
| is_active | BOOLEAN | No | Default TRUE |
| priority | INTEGER | No | Default 3 |
| created_at | TIMESTAMP WITH TIME ZONE | No | Insert timestamp |

**Threshold Example**:
```json
{
  "flare_class": "X",
  "min_intensity": 5.0
}
```

---

### 11. event_correlations

**Purpose**: Store detected event correlations

**Primary Key**: `id` (UUID)  
**Foreign Keys**: `rule_id` → `correlation_rules.id`  
**Indexes**:
- `idx_corr_rule` on `rule_id`
- `idx_corr_primary` on `primary_event_id`
- `idx_corr_detected` on `detected_at`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | UUID | No | Auto-generated UUID |
| rule_id | INTEGER | Yes | Foreign key to correlation_rules |
| primary_event_id | UUID | No | ID of first event |
| secondary_event_id | UUID | No | ID of second event |
| time_delta_hours | DOUBLE PRECISION | Yes | Time between events |
| confidence_score | DOUBLE PRECISION | Yes | Correlation confidence (0.0-1.0) |
| detected_at | TIMESTAMP WITH TIME ZONE | No | Detection timestamp |

---

## Views

### v_high_risk_objects

**Purpose**: Active potentially hazardous objects with high risk scores

```sql
CREATE VIEW v_high_risk_objects AS
SELECT 
    ir.object_name,
    ir.torino_scale_max,
    ir.palermo_scale_cumulative,
    ir.impact_probability_cumulative,
    oe.eccentricity,
    oe.is_interstellar,
    ir.last_updated
FROM impact_risks ir
LEFT JOIN orbital_elements oe ON ir.object_name = oe.object_name
WHERE ir.is_active = TRUE
    AND (ir.torino_scale_max > 0 OR ir.palermo_scale_cumulative > -2)
ORDER BY ir.torino_scale_max DESC, ir.palermo_scale_cumulative DESC;
```

### v_recent_significant_quakes

**Purpose**: Major earthquakes in the last 30 days

```sql
CREATE VIEW v_recent_significant_quakes AS
SELECT 
    usgs_event_id,
    magnitude,
    location_description,
    latitude,
    longitude,
    depth_km,
    event_time,
    felt_reports
FROM earthquakes
WHERE magnitude >= 6.0
    AND event_time >= NOW() - INTERVAL '30 days'
ORDER BY event_time DESC;
```

### v_active_alerts_summary

**Purpose**: Count of active alerts by severity

```sql
CREATE VIEW v_active_alerts_summary AS
SELECT 
    severity,
    COUNT(*) as alert_count,
    MAX(triggered_at) as latest_alert
FROM alerts
WHERE status = 'ACTIVE'
GROUP BY severity
ORDER BY 
    CASE severity
        WHEN 'CRITICAL' THEN 1
        WHEN 'HIGH' THEN 2
        WHEN 'MEDIUM' THEN 3
        WHEN 'LOW' THEN 4
    END;
```

---

## Functions

### calculate_distance_km()

**Purpose**: PostGIS helper for geographic distance calculations

```sql
CREATE OR REPLACE FUNCTION calculate_distance_km(
    lat1 DOUBLE PRECISION,
    lon1 DOUBLE PRECISION,
    lat2 DOUBLE PRECISION,
    lon2 DOUBLE PRECISION
) RETURNS DOUBLE PRECISION AS $$
BEGIN
    RETURN ST_Distance(
        ST_SetSRID(ST_MakePoint(lon1, lat1), 4326)::geography,
        ST_SetSRID(ST_MakePoint(lon2, lat2), 4326)::geography
    ) / 1000.0;  -- Convert meters to kilometers
END;
$$ LANGUAGE plpgsql IMMUTABLE;
```

**Usage**:
```sql
SELECT calculate_distance_km(37.7749, -122.4194, 34.0522, -118.2437) AS distance_km;
-- Returns: 559.12 (San Francisco to Los Angeles)
```

---

## Data Validation Rules

### Constraint Summary

| Table | Constraint Type | Constraint Name | Rule |
|-------|----------------|-----------------|------|
| ephemeris_data | UNIQUE | unique_ephemeris_epoch | (object_name, epoch_iso) |
| orbital_elements | UNIQUE | unique_orbital_epoch | (object_name, epoch_iso) |
| impact_risks | UNIQUE | unique_sentry_object | object_name |
| earthquakes | UNIQUE | - | usgs_event_id |
| celestial_signs | UNIQUE | - | sign_name |
| prophecy_sign_links | UNIQUE | unique_prophecy_sign | (prophecy_id, sign_id) |
| prophecy_sign_links | FK CASCADE | - | prophecy_id → prophecies.id |
| prophecy_sign_links | FK CASCADE | - | sign_id → celestial_signs.id |
| data_triggers | FK CASCADE | - | sign_id → celestial_signs.id |
| alerts | FK | - | trigger_id → data_triggers.id |
| event_correlations | FK | - | rule_id → correlation_rules.id |

### Check Constraints (Optional Future Enhancement)

```sql
-- Ensure magnitude is realistic
ALTER TABLE earthquakes ADD CONSTRAINT chk_magnitude CHECK (magnitude BETWEEN -2.0 AND 10.0);

-- Ensure latitude/longitude bounds
ALTER TABLE earthquakes ADD CONSTRAINT chk_latitude CHECK (latitude BETWEEN -90 AND 90);
ALTER TABLE earthquakes ADD CONSTRAINT chk_longitude CHECK (longitude BETWEEN -180 AND 180);

-- Ensure Torino scale range
ALTER TABLE impact_risks ADD CONSTRAINT chk_torino CHECK (torino_scale_max BETWEEN 0 AND 10);

-- Ensure priority range
ALTER TABLE data_triggers ADD CONSTRAINT chk_priority CHECK (priority BETWEEN 1 AND 5);
```

---

## Migration Dependencies

```
001_initial_schema.py
    ↓ Creates all 14 tables
    
002_create_views.py
    ↓ Depends on: ephemeris_data, orbital_elements, impact_risks, earthquakes, alerts
    
003_create_functions.py
    ↓ Standalone (PostGIS function)
    
004_seed_theological_data.py
    ↓ Depends on: prophecies, celestial_signs, prophecy_sign_links, data_triggers, correlation_rules
```

---

## Next Steps

**Phase 1 Continuation**:
1. ✅ Data model complete
2. ⏭️ Generate SQL DDL contracts in `contracts/` directory
3. ⏭️ Write `quickstart.md` for developer setup
4. ⏭️ Update agent context files

**Proceed to**: contracts/schema.sql generation
