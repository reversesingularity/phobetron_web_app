# 🗄️ CELESTIAL SIGNS - Database Schema & Migrations

## Complete PostgreSQL + PostGIS Schema Design

---

## Table of Contents
1. [Database Overview](#overview)
2. [Schema Diagrams](#diagrams)
3. [Table Definitions](#tables)
4. [Initial Migration SQL](#migration)
5. [Sample Data Seeds](#seeds)
6. [SQLAlchemy Models](#models)

---

## DATABASE OVERVIEW {#overview}

**Database**: PostgreSQL 15+ with PostGIS 3.3+  
**Schema**: Two primary domains - Scientific Data & Theological Data

```
┌─────────────────────────────────────────────────────────────┐
│                    CELESTIAL_SIGNS DB                        │
│                                                              │
│  ┌──────────────────────┐  ┌────────────────────────────┐  │
│  │  SCIENTIFIC SCHEMA   │  │   THEOLOGICAL SCHEMA       │  │
│  │                      │  │                            │  │
│  │  • ephemeris_data    │  │  • prophecies             │  │
│  │  • orbital_elements  │  │  • celestial_signs        │  │
│  │  • impact_risks      │  │  • prophecy_sign_links    │  │
│  │  • earthquakes       │  │  • data_triggers          │  │
│  │  • solar_events      │  │                            │  │
│  │  • meteor_showers    │  │                            │  │
│  │  • volcanic_activity │  │                            │  │
│  │  • alerts            │  │                            │  │
│  └──────────────────────┘  └────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              CORRELATION ENGINE                       │  │
│  │  • event_correlations                                 │  │
│  │  • correlation_rules                                  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## INITIAL MIGRATION SQL {#migration}

### File: `backend/alembic/versions/001_initial_schema.sql`

```sql
-- ============================================================================
-- CELESTIAL SIGNS - Initial Database Schema
-- Migration Version: 001
-- Created: 2025-10-24
-- Description: Core tables for astronomical data and prophetic analysis
-- ============================================================================

-- Enable PostGIS extension for geospatial data
CREATE EXTENSION IF NOT EXISTS postgis;

-- Enable UUID extension for primary keys
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- SCIENTIFIC DATA SCHEMA
-- ============================================================================

-- Table: ephemeris_data
-- Purpose: Store position vectors from JPL Horizons API
-- Source: Astroquery (JPL Horizons EPHEM_TYPE='VECTORS')
CREATE TABLE ephemeris_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    object_name VARCHAR(100) NOT NULL,
    object_designation VARCHAR(50),  -- e.g., "3I/ATLAS", "2004 MN4"
    epoch_jd DOUBLE PRECISION NOT NULL,  -- Julian Date
    epoch_iso TIMESTAMP WITH TIME ZONE NOT NULL,  -- ISO 8601 timestamp
    
    -- Cartesian coordinates (J2000 reference frame, AU)
    x_au DOUBLE PRECISION NOT NULL,
    y_au DOUBLE PRECISION NOT NULL,
    z_au DOUBLE PRECISION NOT NULL,
    
    -- Velocity vectors (AU/day)
    vx_au_per_day DOUBLE PRECISION,
    vy_au_per_day DOUBLE PRECISION,
    vz_au_per_day DOUBLE PRECISION,
    
    -- Distance to Sun and Earth
    range_au DOUBLE PRECISION,  -- Distance from Earth
    range_rate DOUBLE PRECISION,  -- Rate of change of distance
    
    -- Metadata
    reference_frame VARCHAR(20) DEFAULT 'J2000',
    data_source VARCHAR(50) DEFAULT 'JPL_HORIZONS',
    ingested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes for fast queries
    CONSTRAINT unique_ephemeris_epoch UNIQUE (object_name, epoch_iso)
);

CREATE INDEX idx_ephemeris_object ON ephemeris_data(object_name);
CREATE INDEX idx_ephemeris_epoch ON ephemeris_data(epoch_iso);
CREATE INDEX idx_ephemeris_jd ON ephemeris_data(epoch_jd);

-- Table: orbital_elements
-- Purpose: Store classical orbital elements (e, a, i, etc.)
-- Source: JPL Horizons EPHEM_TYPE='ELEMENTS'
CREATE TABLE orbital_elements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    object_name VARCHAR(100) NOT NULL,
    epoch_jd DOUBLE PRECISION NOT NULL,
    epoch_iso TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Classical orbital elements
    eccentricity DOUBLE PRECISION NOT NULL,  -- e (0 = circular, >1 = hyperbolic)
    semi_major_axis_au DOUBLE PRECISION,  -- a (undefined for hyperbolic)
    inclination_deg DOUBLE PRECISION NOT NULL,  -- i
    longitude_ascending_node_deg DOUBLE PRECISION,  -- Ω (OMEGA)
    argument_perihelion_deg DOUBLE PRECISION,  -- ω (omega)
    mean_anomaly_deg DOUBLE PRECISION,  -- M
    perihelion_distance_au DOUBLE PRECISION,  -- q
    aphelion_distance_au DOUBLE PRECISION,  -- Q (undefined for hyperbolic)
    
    -- Additional parameters
    orbital_period_years DOUBLE PRECISION,  -- P (undefined for hyperbolic)
    
    -- Classification flags
    is_interstellar BOOLEAN GENERATED ALWAYS AS (eccentricity > 1.0) STORED,
    
    data_source VARCHAR(50) DEFAULT 'JPL_HORIZONS',
    ingested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_orbital_epoch UNIQUE (object_name, epoch_iso)
);

CREATE INDEX idx_orbital_object ON orbital_elements(object_name);
CREATE INDEX idx_orbital_eccentricity ON orbital_elements(eccentricity);
CREATE INDEX idx_orbital_interstellar ON orbital_elements(is_interstellar);

-- Table: impact_risks
-- Purpose: Store data from JPL Sentry API for potential Earth impactors
-- Source: JPL Sentry API
CREATE TABLE impact_risks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    object_name VARCHAR(100) NOT NULL,
    object_designation VARCHAR(50),
    
    -- Risk assessment metrics
    torino_scale_max INTEGER,  -- 0-10 scale (ts_max from API)
    palermo_scale_cumulative DOUBLE PRECISION,  -- ps_cum from API
    impact_probability_cumulative DOUBLE PRECISION,  -- ip from API
    
    -- Impact scenarios
    possible_impacts INTEGER,  -- Number of potential impact events
    last_observation_date DATE,
    
    -- Monitoring status
    is_active BOOLEAN DEFAULT TRUE,
    removal_date TIMESTAMP WITH TIME ZONE,  -- If removed from monitoring
    
    -- Metadata
    data_source VARCHAR(50) DEFAULT 'JPL_SENTRY',
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ingested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_sentry_object UNIQUE (object_name)
);

CREATE INDEX idx_risk_torino ON impact_risks(torino_scale_max);
CREATE INDEX idx_risk_palermo ON impact_risks(palermo_scale_cumulative);
CREATE INDEX idx_risk_active ON impact_risks(is_active);

-- Table: neo_close_approaches
-- Purpose: Store upcoming close approaches from JPL CNEOS CAD API
-- Source: JPL Close Approach Data API
CREATE TABLE neo_close_approaches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    object_name VARCHAR(100) NOT NULL,
    object_designation VARCHAR(50),
    
    -- Approach details
    approach_date TIMESTAMP WITH TIME ZONE NOT NULL,
    minimum_distance_au DOUBLE PRECISION NOT NULL,
    minimum_distance_ld DOUBLE PRECISION,  -- Lunar distances
    relative_velocity_km_s DOUBLE PRECISION,
    
    -- Object characteristics
    absolute_magnitude_h DOUBLE PRECISION,  -- H parameter
    estimated_diameter_km_min DOUBLE PRECISION,
    estimated_diameter_km_max DOUBLE PRECISION,
    
    data_source VARCHAR(50) DEFAULT 'JPL_CNEOS',
    ingested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_approach UNIQUE (object_name, approach_date)
);

CREATE INDEX idx_approach_date ON neo_close_approaches(approach_date);
CREATE INDEX idx_approach_distance ON neo_close_approaches(minimum_distance_au);

-- Table: earthquakes
-- Purpose: Store seismic events from USGS
-- Source: USGS Earthquake Hazards Program API
CREATE TABLE earthquakes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usgs_event_id VARCHAR(50) UNIQUE NOT NULL,
    
    -- Event details
    magnitude DOUBLE PRECISION NOT NULL,
    magnitude_type VARCHAR(10),  -- e.g., "mw", "ml"
    location_description TEXT,
    
    -- Spatial data (PostGIS point)
    epicenter GEOGRAPHY(POINT, 4326) NOT NULL,  -- lat/lon as geography
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    depth_km DOUBLE PRECISION NOT NULL,
    
    -- Temporal data
    event_time TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Additional metadata
    felt_reports INTEGER,
    tsunami BOOLEAN DEFAULT FALSE,
    
    data_source VARCHAR(50) DEFAULT 'USGS',
    ingested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_earthquake_time ON earthquakes(event_time);
CREATE INDEX idx_earthquake_magnitude ON earthquakes(magnitude);
CREATE INDEX idx_earthquake_spatial ON earthquakes USING GIST(epicenter);

-- Table: solar_events
-- Purpose: Store solar flares, CMEs, geomagnetic storms
-- Source: NOAA SWPC APIs
CREATE TABLE solar_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(50) NOT NULL,  -- 'SOLAR_FLARE', 'CME', 'GEOMAG_STORM'
    event_time TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Solar flare specific
    flare_class VARCHAR(10),  -- 'X1.5', 'M2.3', etc.
    flare_region INTEGER,  -- Active region number
    
    -- CME specific
    cme_speed_km_s DOUBLE PRECISION,
    cme_direction VARCHAR(20),  -- 'EARTH_DIRECTED', 'OFF_DISK', etc.
    
    -- Geomagnetic storm specific
    kp_index DOUBLE PRECISION,  -- 0-9 scale
    dst_index INTEGER,  -- Disturbance Storm Time
    g_scale INTEGER,  -- NOAA G-scale (1-5)
    
    -- Impact predictions
    predicted_earth_arrival TIMESTAMP WITH TIME ZONE,
    
    data_source VARCHAR(50) DEFAULT 'NOAA_SWPC',
    ingested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_solar_type ON solar_events(event_type);
CREATE INDEX idx_solar_time ON solar_events(event_time);
CREATE INDEX idx_solar_kp ON solar_events(kp_index);

-- Table: meteor_showers
-- Purpose: Store predicted meteor shower activity
-- Source: Global Meteor Network API, Meteomatics
CREATE TABLE meteor_showers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shower_name VARCHAR(100) NOT NULL,  -- e.g., "Leonids", "Perseids"
    
    -- Activity period
    peak_date DATE NOT NULL,
    start_date DATE,
    end_date DATE,
    
    -- Intensity metrics
    predicted_zhr INTEGER,  -- Zenithal Hourly Rate
    zhr_uncertainty INTEGER,
    
    -- Radiant information
    radiant_constellation VARCHAR(50),
    radiant_ra_deg DOUBLE PRECISION,
    radiant_dec_deg DOUBLE PRECISION,
    
    -- Parent comet
    parent_body VARCHAR(100),
    
    data_source VARCHAR(50) DEFAULT 'GMN_API',
    ingested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_meteor_peak ON meteor_showers(peak_date);
CREATE INDEX idx_meteor_zhr ON meteor_showers(predicted_zhr);

-- Table: volcanic_activity
-- Purpose: Store volcanic eruptions and monitoring data
-- Source: Smithsonian Global Volcanism Program API
CREATE TABLE volcanic_activity (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    volcano_name VARCHAR(200) NOT NULL,
    
    -- Location (PostGIS point)
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    elevation_m INTEGER,
    
    -- Activity details
    activity_level VARCHAR(50),  -- 'NORMAL', 'ELEVATED', 'ERUPTING'
    vei INTEGER,  -- Volcanic Explosivity Index (0-8)
    eruption_start_date DATE,
    eruption_end_date DATE,
    
    -- Impact assessment
    ash_plume_height_km DOUBLE PRECISION,
    
    data_source VARCHAR(50) DEFAULT 'GVP_API',
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ingested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_volcano_location ON volcanic_activity USING GIST(location);
CREATE INDEX idx_volcano_activity ON volcanic_activity(activity_level);
CREATE INDEX idx_volcano_vei ON volcanic_activity(vei);

-- ============================================================================
-- THEOLOGICAL DATA SCHEMA
-- ============================================================================

-- Table: prophecies
-- Purpose: Store biblical prophecies related to eschatology
CREATE TABLE prophecies (
    id SERIAL PRIMARY KEY,
    event_name VARCHAR(255) NOT NULL,
    scripture_reference VARCHAR(100) NOT NULL,  -- e.g., "Revelation 6:12-14"
    scripture_text TEXT,  -- Full text of the passage
    event_description TEXT,
    
    -- Classification
    prophecy_category VARCHAR(50),  -- 'SEAL_JUDGMENT', 'TRUMPET', 'BOWL', etc.
    chronological_order INTEGER,  -- Sequence in prophetic timeline
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: celestial_signs
-- Purpose: Specific signs described in prophecy
CREATE TABLE celestial_signs (
    id SERIAL PRIMARY KEY,
    sign_name VARCHAR(255) NOT NULL UNIQUE,
    sign_description TEXT,
    theological_interpretation TEXT,
    
    -- Biblical references
    primary_scripture VARCHAR(100),
    related_scriptures TEXT[],  -- Array of additional references
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: prophecy_sign_links
-- Purpose: Many-to-many relationship between prophecies and signs
CREATE TABLE prophecy_sign_links (
    id SERIAL PRIMARY KEY,
    prophecy_id INTEGER NOT NULL REFERENCES prophecies(id) ON DELETE CASCADE,
    sign_id INTEGER NOT NULL REFERENCES celestial_signs(id) ON DELETE CASCADE,
    
    CONSTRAINT unique_prophecy_sign UNIQUE (prophecy_id, sign_id)
);

CREATE INDEX idx_prop_sign_prophecy ON prophecy_sign_links(prophecy_id);
CREATE INDEX idx_prop_sign_sign ON prophecy_sign_links(sign_id);

-- Table: data_triggers
-- Purpose: Define PDS (Prophetic Data Signatures) - rules for alert generation
CREATE TABLE data_triggers (
    id SERIAL PRIMARY KEY,
    sign_id INTEGER NOT NULL REFERENCES celestial_signs(id) ON DELETE CASCADE,
    
    trigger_name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Query definition
    data_source_api VARCHAR(100) NOT NULL,  -- 'JPL_SENTRY', 'USGS', 'GMN_API', etc.
    query_parameter VARCHAR(100) NOT NULL,  -- Field to evaluate (e.g., 'magnitude', 'ts_max')
    query_operator VARCHAR(10) NOT NULL,  -- '>', '<', '=', 'CONTAINS', etc.
    query_value VARCHAR(100) NOT NULL,  -- Threshold value
    
    -- Additional conditions (JSON for complex logic)
    additional_conditions JSONB,
    
    -- Alert settings
    priority INTEGER NOT NULL DEFAULT 3,  -- 1=High, 5=Low
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_trigger_sign ON data_triggers(sign_id);
CREATE INDEX idx_trigger_active ON data_triggers(is_active);

-- ============================================================================
-- ALERTS SYSTEM
-- ============================================================================

-- Table: alerts
-- Purpose: Store generated alerts when PDS conditions are met
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trigger_id INTEGER REFERENCES data_triggers(id),
    
    -- Alert metadata
    alert_type VARCHAR(50) NOT NULL,  -- 'PDS_MATCH', 'CORRELATION', 'MANUAL'
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Associated data
    related_object_name VARCHAR(100),  -- e.g., asteroid that triggered alert
    related_event_id UUID,  -- Links to source event (earthquake_id, etc.)
    
    -- Alert details
    severity VARCHAR(20) DEFAULT 'MEDIUM',  -- 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    status VARCHAR(20) DEFAULT 'ACTIVE',  -- 'ACTIVE', 'ACKNOWLEDGED', 'RESOLVED'
    
    -- Timestamps
    triggered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    trigger_data JSONB,  -- Store full data that caused trigger
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_alert_status ON alerts(status);
CREATE INDEX idx_alert_severity ON alerts(severity);
CREATE INDEX idx_alert_time ON alerts(triggered_at);

-- ============================================================================
-- CORRELATION ENGINE
-- ============================================================================

-- Table: correlation_rules
-- Purpose: Define rules for detecting temporal correlations between events
CREATE TABLE correlation_rules (
    id SERIAL PRIMARY KEY,
    rule_name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    
    -- Event types to correlate
    primary_event_type VARCHAR(50) NOT NULL,  -- 'SOLAR_FLARE', 'COMET_PERIHELION', etc.
    secondary_event_type VARCHAR(50) NOT NULL,  -- 'EARTHQUAKE', 'GEOMAG_STORM', etc.
    
    -- Correlation criteria
    time_window_days INTEGER NOT NULL,  -- Look for events within X days
    primary_threshold JSONB,  -- Threshold for primary event
    secondary_threshold JSONB,  -- Threshold for secondary event
    minimum_occurrences INTEGER DEFAULT 1,
    
    -- Settings
    is_active BOOLEAN DEFAULT TRUE,
    priority INTEGER DEFAULT 3,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: event_correlations
-- Purpose: Store detected correlations
CREATE TABLE event_correlations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rule_id INTEGER REFERENCES correlation_rules(id),
    
    -- Correlated events
    primary_event_id UUID NOT NULL,
    secondary_event_id UUID NOT NULL,
    
    -- Correlation metrics
    time_delta_hours DOUBLE PRECISION,  -- Time between events
    confidence_score DOUBLE PRECISION,  -- 0.0 to 1.0
    
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_corr_rule ON event_correlations(rule_id);
CREATE INDEX idx_corr_primary ON event_correlations(primary_event_id);
CREATE INDEX idx_corr_detected ON event_correlations(detected_at);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function: Calculate distance between two geographic points
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

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- View: Active high-risk objects
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

-- View: Recent significant earthquakes
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

-- View: Active alerts by severity
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

-- ============================================================================
-- GRANTS (for application user)
-- ============================================================================

-- Create application user (run separately, not in migration)
-- CREATE USER celestial_app WITH PASSWORD 'change_in_production';
-- GRANT CONNECT ON DATABASE celestial_signs TO celestial_app;
-- GRANT USAGE ON SCHEMA public TO celestial_app;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO celestial_app;
-- GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO celestial_app;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
```

---

## SAMPLE DATA SEEDS {#seeds}

### File: `backend/seeds/001_initial_theological_data.sql`

```sql
-- ============================================================================
-- SEED DATA: Initial Prophetic Content
-- ============================================================================

-- Insert core prophecies
INSERT INTO prophecies (event_name, scripture_reference, scripture_text, event_description, prophecy_category, chronological_order) VALUES
('Sixth Seal Judgment', 'Revelation 6:12-14', 
 'I looked when He opened the sixth seal, and behold, there was a great earthquake; and the sun became black as sackcloth of hair, and the moon became like blood. And the stars of heaven fell to the earth, as a fig tree drops its late figs when it is shaken by a mighty wind. Then the sky receded as a scroll when it is rolled up, and every mountain and island was moved out of its place.',
 'A series of cosmic and terrestrial catastrophes marking divine judgment',
 'SEAL_JUDGMENT', 6),

('Wormwood Star Falls', 'Revelation 8:10-11',
 'Then the third angel sounded: And a great star fell from heaven, burning like a torch, and it fell on a third of the rivers and on the springs of water. The name of the star is Wormwood. A third of the waters became wormwood, and many men died from the water, because it was made bitter.',
 'A celestial impact event contaminating water sources',
 'TRUMPET_JUDGMENT', 3),

('Day of the Lord Signs', 'Joel 2:30-31',
 'And I will show wonders in the heavens and in the earth: Blood and fire and pillars of smoke. The sun shall be turned into darkness, and the moon into blood, before the coming of the great and awesome day of the Lord.',
 'Cosmic signs preceding the Day of the Lord',
 'DAY_OF_LORD', 1);

-- Insert celestial signs
INSERT INTO celestial_signs (sign_name, sign_description, theological_interpretation, primary_scripture, related_scriptures) VALUES
('Great Earthquake', 
 'A seismic event of extraordinary magnitude causing global disruption',
 'Represents divine judgment and the shaking of earthly powers. Historically interpreted as literal earthquakes of unprecedented scale.',
 'Revelation 6:12',
 ARRAY['Matthew 24:7', 'Luke 21:11', 'Revelation 16:18']),

('Sun Darkened',
 'The sun losing its light, causing darkness',
 'May represent atmospheric obscuration from volcanic activity, smoke, or supernatural intervention. Also interpreted symbolically as political upheaval.',
 'Joel 2:31',
 ARRAY['Matthew 24:29', 'Revelation 6:12', 'Isaiah 13:10', 'Ezekiel 32:7']),

('Moon to Blood',
 'The moon appearing red in color',
 'Commonly associated with total lunar eclipses ("Blood Moons"). May also indicate atmospheric conditions or supernatural phenomena.',
 'Joel 2:31',
 ARRAY['Acts 2:20', 'Revelation 6:12']),

('Stars Falling from Heaven',
 'Stars falling to earth like figs from a shaken tree',
 'Historically interpreted as intense meteor showers (e.g., 1833 Leonids). May represent asteroid impacts, satellite debris, or symbolic judgment on heavenly powers.',
 'Revelation 6:13',
 ARRAY['Matthew 24:29', 'Mark 13:25']),

('Wormwood Star',
 'A great star burning like a torch falls to earth',
 'Interpreted as a comet or asteroid impact causing massive water contamination. The name implies bitterness/toxicity.',
 'Revelation 8:10-11',
 ARRAY[]::VARCHAR[]),

('Wandering Stars',
 'Stars that deviate from fixed paths',
 'Ancient term for planets or comets. In Jude, metaphor for false teachers. Modern application: interstellar objects with hyperbolic orbits.',
 'Jude 1:13',
 ARRAY[]::VARCHAR[]),

('Revelation 12 Sign',
 'A woman clothed with the sun, moon under feet, crown of twelve stars',
 'Specific astronomical alignment involving Virgo, Leo, Sun, Moon, and planets. Interpreted by some as a prophetic sign; others view symbolically.',
 'Revelation 12:1-2',
 ARRAY[]::VARCHAR[]);

-- Link prophecies to signs
INSERT INTO prophecy_sign_links (prophecy_id, sign_id) VALUES
(1, 1),  -- Sixth Seal -> Great Earthquake
(1, 2),  -- Sixth Seal -> Sun Darkened
(1, 3),  -- Sixth Seal -> Moon to Blood
(1, 4),  -- Sixth Seal -> Stars Falling
(2, 5),  -- Wormwood -> Wormwood Star
(3, 2),  -- Day of Lord -> Sun Darkened
(3, 3);  -- Day of Lord -> Moon to Blood

-- Create data triggers (PDS definitions)
INSERT INTO data_triggers (sign_id, trigger_name, description, data_source_api, query_parameter, query_operator, query_value, priority, additional_conditions) VALUES
-- Wormwood Star triggers
(5, 'Wormwood - High Impact Risk', 
 'Monitors JPL Sentry for objects with significant Torino or Palermo scale values',
 'JPL_SENTRY', 'torino_scale_max', '>', '0', 1,
 '{"secondary_check": "palermo_scale_cumulative > -2"}'),

(5, 'Wormwood - Name Match',
 'Alerts if any object is discovered with "Wormwood" in the designation',
 'MPC_API', 'object_name', 'CONTAINS', 'wormwood', 1, NULL),

-- Stars Falling triggers
(4, 'Extreme Meteor Storm',
 'Triggers on predicted ZHR exceeding 1000 (storm-level activity)',
 'GMN_API', 'predicted_zhr', '>', '1000', 2, NULL),

-- Great Earthquake triggers
(1, 'Magnitude 8.5+ Earthquake',
 'Alerts on extremely powerful seismic events',
 'USGS', 'magnitude', '>', '8.5', 2, NULL),

-- Sun Darkened triggers
(2, 'Major Total Solar Eclipse',
 'Monitors for significant total solar eclipses',
 'NASA_ECLIPSE', 'event_type', '=', 'TOTAL', 3,
 '{"min_duration_seconds": 120}'),

(2, 'VEI 7+ Supervolcano Eruption',
 'Alerts on volcanic eruptions capable of global atmospheric dimming',
 'GVP_API', 'vei', '>=', '7', 1, NULL),

-- Moon to Blood triggers
(3, 'Total Lunar Eclipse',
 'Monitors for total lunar eclipses (Blood Moons)',
 'NASA_ECLIPSE', 'event_type', '=', 'TOTAL_LUNAR', 4, NULL),

-- Wandering Stars (Interstellar Objects) triggers
(6, 'Hyperbolic Orbit Detection',
 'Alerts when any object confirmed with eccentricity > 1.0',
 'JPL_HORIZONS', 'eccentricity', '>', '1.0', 2, NULL);

-- Insert sample correlation rules
INSERT INTO correlation_rules (rule_name, description, primary_event_type, secondary_event_type, time_window_days, primary_threshold, secondary_threshold, minimum_occurrences, priority) VALUES
('Comet Perihelion - Earthquake Cluster',
 'Examines temporal clustering of M6+ earthquakes around comet perihelion passages',
 'COMET_PERIHELION', 'EARTHQUAKE', 7,
 '{}',  -- No specific threshold for perihelion
 '{"magnitude": 6.0}',
 3, 3),

('X-Class Flare - Major Earthquake',
 'Investigates potential correlation between X-class solar flares and M7.5+ earthquakes',
 'SOLAR_FLARE', 'EARTHQUAKE', 3,
 '{"flare_class": "X"}',
 '{"magnitude": 7.5}',
 1, 2),

('Geomagnetic Storm - Volcanic Activity',
 'Explores potential links between intense geomagnetic storms and volcanic eruptions',
 'GEOMAG_STORM', 'VOLCANIC_ERUPTION', 5,
 '{"kp_index": 8}',
 '{"vei": 4}',
 1, 3);

COMMIT;
```

---

## SQLAlchemy Models {#models}

### File: `backend/app/models/ephemeris.py`

```python
"""
SQLAlchemy models for astronomical data.
Optimized for GitHub Copilot code generation.
"""

from sqlalchemy import Column, String, Float, DateTime, Boolean, Integer, Text
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from geoalchemy2 import Geography
from datetime import datetime
import uuid

from app.db.base import Base


# TODO: Copilot will generate complete model with all columns from schema
class EphemerisData(Base):
    """
    Stores position vectors from JPL Horizons API.
    
    Data source: Astroquery (JPL Horizons EPHEM_TYPE='VECTORS')
    Reference frame: J2000
    Units: AU for positions, AU/day for velocities
    """
    __tablename__ = "ephemeris_data"
    
    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Object identification
    object_name = Column(String(100), nullable=False, index=True)
    object_designation = Column(String(50))
    
    # Temporal coordinates
    epoch_jd = Column(Float, nullable=False, index=True)  # Julian Date
    epoch_iso = Column(DateTime(timezone=True), nullable=False, index=True)
    
    # Cartesian coordinates (J2000, AU)
    x_au = Column(Float, nullable=False)
    y_au = Column(Float, nullable=False)
    z_au = Column(Float, nullable=False)
    
    # Velocity vectors (AU/day)
    vx_au_per_day = Column(Float)
    vy_au_per_day = Column(Float)
    vz_au_per_day = Column(Float)
    
    # Distance metrics
    range_au = Column(Float)  # Distance from Earth
    range_rate = Column(Float)  # Rate of change
    
    # Metadata
    reference_frame = Column(String(20), default='J2000')
    data_source = Column(String(50), default='JPL_HORIZONS')
    ingested_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    
    def __repr__(self):
        return f"<EphemerisData(object={self.object_name}, epoch={self.epoch_iso})>"


# TODO: Copilot will generate OrbitalElements model following same pattern
class OrbitalElements(Base):
    """
    Stores classical orbital elements (e, a, i, Ω, ω, M).
    
    Critical field: eccentricity (e)
    - e < 1.0: Elliptical (bound) orbit
    - e = 1.0: Parabolic orbit
    - e > 1.0: Hyperbolic (unbound) orbit -> INTERSTELLAR OBJECT
    """
    __tablename__ = "orbital_elements"
    
    # TODO: Copilot generates full model here
    pass


# TODO: Complete additional models for impact_risks, earthquakes, etc.
```

---

**Continue to Part 3: API Design & Frontend Components?**

This database foundation provides:
- ✅ Production-ready PostgreSQL schema
- ✅ PostGIS integration for geospatial queries
- ✅ Complete theological data structure
- ✅ Sample seed data for immediate testing
- ✅ SQLAlchemy models with Copilot-friendly TODOs
