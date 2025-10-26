/**
 * TypeScript Type Definitions
 * 
 * Matches backend Pydantic schemas for type safety across the stack.
 */

// ============================================================================
// COMMON TYPES
// ============================================================================

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  skip: number;
  limit: number;
}

// ============================================================================
// SCIENTIFIC TYPES
// ============================================================================

export interface Ephemeris {
  id: string;
  object_name: string;
  epoch_jd: number;
  x_au: number;
  y_au: number;
  z_au: number;
  vx_au_per_day: number;
  vy_au_per_day: number;
  vz_au_per_day: number;
  distance_from_sun_au: number;
  distance_from_earth_au: number;
  created_at: string;
}

export interface OrbitalElements {
  id: string;
  object_name: string;
  epoch_jd: number;
  semi_major_axis_au: number;
  eccentricity: number;
  inclination_deg: number;
  longitude_of_ascending_node_deg: number;
  argument_of_periapsis_deg: number;
  mean_anomaly_deg: number;
  perihelion_distance_au: number;
  aphelion_distance_au: number;
  orbital_period_years: number;
  created_at: string;
}

export interface ImpactRisk {
  id: string;
  object_name: string;
  impact_probability: number;
  palermo_scale: number;
  torino_scale: number;
  impact_energy_megatons: number;
  potential_impact_date: string;
  created_at: string;
}

export interface CloseApproach {
  id: string;
  object_name: string;
  approach_date: string;
  miss_distance_au: number;
  miss_distance_km: number;
  relative_velocity_km_s: number;
  object_diameter_km: number | null;
  created_at: string;
}

// ============================================================================
// EVENTS TYPES
// ============================================================================

export interface Earthquake {
  id: string;
  event_time: string;
  magnitude: number;
  depth_km: number;
  location: {
    type: string;
    coordinates: [number, number]; // [longitude, latitude]
  };
  place_name: string;
  event_source: string;
  created_at: string;
}

export interface VolcanicActivity {
  id: string;
  volcano_name: string;
  eruption_start: string;
  eruption_end: string | null;
  vei: number;
  location: {
    type: string;
    coordinates: [number, number];
  };
  eruption_category: string;
  created_at: string;
}

export interface SolarEvent {
  id: string;
  event_type: string;
  event_start: string;
  event_end: string | null;
  flare_class: string | null;
  kp_index: number | null;
  solar_wind_speed_km_s: number | null;
  created_at: string;
}

export interface MeteorShower {
  id: number;
  shower_name: string;
  iau_code: string | null;
  peak_month: number;
  peak_day_start: number;
  peak_day_end: number;
  radiant_ra_deg: number | null;
  radiant_dec_deg: number | null;
  zhr_max: number | null;
  velocity_km_s: number | null;
  parent_body: string | null;
  created_at: string;
}

// ============================================================================
// THEOLOGICAL TYPES
// ============================================================================

export interface Prophecy {
  id: number;
  event_name: string;
  scripture_reference: string;
  scripture_text: string;
  prophecy_category: string;
  related_events: string[] | null;
  created_at: string;
}

export interface CelestialSign {
  id: number;
  sign_name: string;
  sign_description: string;
  theological_interpretation: string;
  primary_scripture: string;
  related_scriptures: string[] | null;
  sign_type: string | null;
}

export interface ProphecySignLink {
  id: number;
  prophecy_id: number;
  sign_id: number;
  created_at: string;
}

// ============================================================================
// ALERTS TYPES
// ============================================================================

export interface DataTrigger {
  id: number;
  sign_id: number;
  trigger_name: string;
  description: string | null;
  data_source_api: string;
  query_parameter: string;
  query_operator: string;
  query_value: string;
  additional_conditions: Record<string, any> | null;
  priority: number;
  is_active: boolean;
  created_at: string;
}

export interface Alert {
  id: string;
  alert_type: string;
  title: string;
  description: string;
  related_event_id: string | null;
  related_object_name: string | null;
  severity: string;
  status: string;
  trigger_data: Record<string, any> | null;
  triggered_at: string;
  acknowledged_at: string | null;
  resolved_at: string | null;
}

// ============================================================================
// CORRELATIONS TYPES
// ============================================================================

export interface CorrelationRule {
  id: number;
  rule_name: string;
  primary_event_type: string;
  primary_threshold: Record<string, any>;
  secondary_event_type: string;
  secondary_threshold: Record<string, any>;
  time_window_days: number;
  minimum_confidence: number;
  priority: number;
  is_active: boolean;
  created_at: string;
}

export interface EventCorrelation {
  id: string;
  rule_id: number;
  primary_event_id: string;
  primary_event_type: string;
  primary_event_time: string;
  primary_event_data: Record<string, any> | null;
  secondary_event_id: string;
  secondary_event_type: string;
  secondary_event_time: string;
  secondary_event_data: Record<string, any> | null;
  time_delta_hours: number;
  confidence_score: number;
  spatial_distance_km: number | null;
  detected_at: string;
}
