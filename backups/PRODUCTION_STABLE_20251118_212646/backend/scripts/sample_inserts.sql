-- Sample SQL Inserts for Testing Phobetron Database
-- Run these manually if you want to quickly test specific tables

-- ============================================================================
-- INTERSTELLAR OBJECTS (Hyperbolic Orbits)
-- ============================================================================

INSERT INTO orbital_elements (
    id, object_name, epoch_iso, semi_major_axis_au, eccentricity, 
    inclination_deg, longitude_ascending_node_deg, argument_perihelion_deg, 
    mean_anomaly_deg, data_source, created_at
) VALUES
(
    gen_random_uuid(),
    '1I/2017 U1 (Oumuamua)',
    '2017-10-14 00:00:00',
    -1.280,  -- Negative = hyperbolic
    1.201,   -- e > 1 = hyperbolic
    122.7,
    24.6,
    241.8,
    0.0,
    'JPL',
    NOW()
),
(
    gen_random_uuid(),
    '2I/Borisov',
    '2019-09-10 00:00:00',
    -0.851,
    3.357,
    44.05,
    308.15,
    209.1,
    0.0,
    'JPL',
    NOW()
),
(
    gen_random_uuid(),
    'C/2025 V1 (Borisov)',
    '2025-01-01 00:00:00',
    -1.500,
    2.800,
    85.0,
    120.0,
    150.0,
    0.0,
    'MPC',
    NOW()
)
ON CONFLICT (object_name, epoch_iso) DO NOTHING;

-- ============================================================================
-- NEO IMPACT RISKS (JPL Sentry Data)
-- ============================================================================

INSERT INTO impact_risks (
    id, object_name, impact_date, impact_probability, 
    palermo_scale, torino_scale, estimated_diameter_m, 
    impact_energy_mt, data_source, assessment_date, created_at
) VALUES
(
    gen_random_uuid(),
    '99942 Apophis',
    '2029-04-13 21:46:00',
    0.000027,
    -3.2,
    0,
    370,
    870,
    'JPL Sentry',
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    '2023 DW',
    '2046-02-14 12:00:00',
    0.00012,
    -2.8,
    1,
    50,
    15,
    'JPL Sentry',
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    '1999 AN10',
    '2027-08-07 00:00:00',
    0.0000053,
    -4.1,
    0,
    800,
    3500,
    'JPL Sentry',
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    '101955 Bennu',
    '2182-09-24 00:00:00',
    0.00037,
    -1.7,
    1,
    490,
    1200,
    'JPL Sentry',
    NOW(),
    NOW()
)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- VOLCANIC ERUPTIONS (σεισμός - Seismos)
-- ============================================================================

INSERT INTO volcanic_activity (
    id, volcano_name, country, vei, eruption_start, eruption_end,
    location, eruption_type, plume_height_km, notes, data_source, created_at
) VALUES
(
    gen_random_uuid(),
    'Mount St. Helens',
    'United States',
    5,
    '1980-05-18 08:32:00',
    '1980-05-18 17:00:00',
    ST_SetSRID(ST_MakePoint(-122.18, 46.20), 4326)::geography,
    'Stratovolcano',
    24.0,
    'Catastrophic eruption with lateral blast',
    'USGS',
    NOW()
),
(
    gen_random_uuid(),
    'Mount Pinatubo',
    'Philippines',
    6,
    '1991-06-15 13:42:00',
    '1991-06-15 16:00:00',
    ST_SetSRID(ST_MakePoint(120.35, 15.13), 4326)::geography,
    'Stratovolcano',
    35.0,
    'Second largest eruption of 20th century',
    'PHIVOLCS',
    NOW()
),
(
    gen_random_uuid(),
    'Eyjafjallajökull',
    'Iceland',
    4,
    '2010-04-14 01:00:00',
    '2010-05-23 00:00:00',
    ST_SetSRID(ST_MakePoint(-19.62, 63.63), 4326)::geography,
    'Stratovolcano',
    9.0,
    'Disrupted European air travel',
    'IMO',
    NOW()
),
(
    gen_random_uuid(),
    'Krakatoa',
    'Indonesia',
    6,
    '1883-08-27 10:02:00',
    '1883-08-27 10:41:00',
    ST_SetSRID(ST_MakePoint(105.42, -6.10), 4326)::geography,
    'Caldera',
    80.0,
    'One of deadliest volcanic events in recorded history',
    'Smithsonian GVP',
    NOW()
)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- HURRICANES (σεισμός - Commotion of the Air)
-- ============================================================================

INSERT INTO hurricanes (
    id, storm_name, basin, storm_type, season, formation_date, dissipation_date,
    peak_location, max_sustained_winds_kph, min_central_pressure_hpa, 
    category, ace_index, fatalities, damages_usd_millions,
    affected_regions, landfall_locations, notes, data_source, created_at
) VALUES
(
    gen_random_uuid(),
    'Katrina',
    'Atlantic',
    'Hurricane',
    2005,
    '2005-08-23 00:00:00',
    '2005-08-31 00:00:00',
    ST_SetSRID(ST_MakePoint(-89.60, 29.25), 4326)::geography,
    280,
    902,
    5,
    14.4,
    1833,
    125000,
    ARRAY['Louisiana', 'Mississippi', 'Alabama', 'Florida'],
    ARRAY['Buras, Louisiana', 'Gulfport, Mississippi'],
    'One of deadliest hurricanes in US history',
    'NOAA NHC',
    NOW()
),
(
    gen_random_uuid(),
    'Patricia',
    'East Pacific',
    'Hurricane',
    2015,
    '2015-10-20 00:00:00',
    '2015-10-24 00:00:00',
    ST_SetSRID(ST_MakePoint(-105.00, 19.00), 4326)::geography,
    345,
    872,
    5,
    9.9,
    13,
    462,
    ARRAY['Mexico', 'Jalisco', 'Colima'],
    ARRAY['Cuixmala, Jalisco'],
    'Strongest hurricane ever recorded in Western Hemisphere',
    'NOAA NHC',
    NOW()
),
(
    gen_random_uuid(),
    'Maria',
    'Atlantic',
    'Hurricane',
    2017,
    '2017-09-16 00:00:00',
    '2017-10-02 00:00:00',
    ST_SetSRID(ST_MakePoint(-66.62, 18.04), 4326)::geography,
    280,
    908,
    5,
    31.6,
    3059,
    91610,
    ARRAY['Puerto Rico', 'Dominica', 'US Virgin Islands'],
    ARRAY['Yabucoa, Puerto Rico'],
    'Worst natural disaster in Puerto Rico history',
    'NOAA NHC',
    NOW()
)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- TSUNAMIS (σεισμός - Commotion of Ground and Sea)
-- ============================================================================

INSERT INTO tsunamis (
    id, event_date, source_location, source_type, earthquake_magnitude,
    max_wave_height_m, max_runup_m, affected_regions, fatalities,
    damages_usd_millions, intensity_scale, travel_time_minutes,
    warning_issued, notes, data_source, created_at
) VALUES
(
    gen_random_uuid(),
    '2011-03-11 14:46:00',
    ST_SetSRID(ST_MakePoint(142.37, 38.32), 4326)::geography,
    'EARTHQUAKE',
    9.1,
    40.5,
    39.0,
    ARRAY['Japan', 'Tohoku', 'Fukushima', 'Miyagi'],
    15894,
    235000,
    10,
    0,
    TRUE,
    '2011 Tōhoku earthquake and tsunami. Triggered Fukushima nuclear disaster.',
    'NOAA NGDC',
    NOW()
),
(
    gen_random_uuid(),
    '2004-12-26 07:59:00',
    ST_SetSRID(ST_MakePoint(95.78, 3.30), 4326)::geography,
    'EARTHQUAKE',
    9.3,
    30.0,
    51.0,
    ARRAY['Indonesia', 'Sri Lanka', 'India', 'Thailand'],
    227898,
    10000,
    12,
    15,
    FALSE,
    'Indian Ocean earthquake and tsunami. Deadliest tsunami in recorded history.',
    'NOAA NGDC',
    NOW()
),
(
    gen_random_uuid(),
    '1958-07-09 22:15:00',
    ST_SetSRID(ST_MakePoint(-137.09, 58.65), 4326)::geography,
    'LANDSLIDE',
    8.3,
    524.0,
    524.0,
    ARRAY['Alaska', 'Lituya Bay'],
    5,
    NULL,
    7,
    0,
    FALSE,
    'Lituya Bay megatsunami. Tallest wave ever recorded.',
    'USGS',
    NOW()
)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Count interstellar objects
SELECT COUNT(*) as interstellar_count 
FROM orbital_elements 
WHERE eccentricity >= 1.0 OR is_interstellar = TRUE;

-- Count NEO impact risks
SELECT COUNT(*) as neo_count FROM impact_risks;

-- Count seismos events
SELECT 
    (SELECT COUNT(*) FROM volcanic_activity) as volcanic_count,
    (SELECT COUNT(*) FROM hurricanes) as hurricane_count,
    (SELECT COUNT(*) FROM tsunamis) as tsunami_count;

-- View sample interstellar objects
SELECT object_name, eccentricity, semi_major_axis_au, is_interstellar
FROM orbital_elements
WHERE eccentricity >= 1.0
ORDER BY eccentricity DESC;

-- View top NEO risks by Torino scale
SELECT object_name, impact_date, torino_scale, palermo_scale, impact_probability
FROM impact_risks
ORDER BY torino_scale DESC, impact_probability DESC
LIMIT 10;

-- View recent volcanic eruptions
SELECT volcano_name, country, vei, eruption_start
FROM volcanic_activity
WHERE vei >= 4
ORDER BY eruption_start DESC
LIMIT 10;

-- View category 5 hurricanes
SELECT storm_name, season, category, max_sustained_winds_kph, fatalities
FROM hurricanes
WHERE category = 5
ORDER BY max_sustained_winds_kph DESC;

-- View deadliest tsunamis
SELECT event_date, source_type, max_wave_height_m, fatalities, intensity_scale
FROM tsunamis
ORDER BY fatalities DESC NULLS LAST
LIMIT 10;
