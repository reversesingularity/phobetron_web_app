/**
 * ML/AI API Client
 * =================
 * 
 * Client for ML/AI prediction endpoints:
 * - NEO trajectory and collision risk assessment
 * - Watchman enhanced alerts
 * - Pattern detection (tetrads, conjunctions)
 * - LSTM seismic forecasting
 * - Anomaly detection
 * - Multi-horizon predictions
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8020';

// ===== Production ML Prediction Types =====
export interface SeismicPrediction {
  predicted_magnitude: number;
  confidence: number;
  risk_level: string;
  forecast_date: string;
  confidence_interval_lower: number;
  confidence_interval_upper: number;
  contributing_factors: string[];
  recommendations: string[];
}

export interface AnomalyDetection {
  is_anomaly: boolean;
  anomaly_score: number;
  confidence: number;
  anomaly_type: string | null;
  severity: string;
  detected_patterns: string[];
  similar_historical_events: Array<{
    date: string;
    event: string;
    similarity: number;
  }>;
}

export interface MultiHorizonForecast {
  forecast_date: string;
  horizon_7_days: {
    predicted_magnitude_range: [number, number];
    probability_major_event: number;
    confidence: number;
    peak_risk_date: string;
    key_factors: string[];
  };
  horizon_14_days: {
    predicted_magnitude_range: [number, number];
    probability_major_event: number;
    confidence: number;
    peak_risk_date: string;
    key_factors: string[];
  };
  horizon_30_days: {
    predicted_magnitude_range: [number, number];
    probability_major_event: number;
    confidence: number;
    peak_risk_date: string;
    key_factors: string[];
  };
  overall_risk_assessment: string;
  confidence_trend: string;
}

// ===== Existing Types =====
export interface NEORiskAssessment {
  object_name: string;
  collision_probability: number;
  torino_scale: number;
  palermo_scale: number;
  closest_approach_date: string;
  closest_approach_distance_km: number;
  impact_energy_megatons: number;
  risk_level: 'MINIMAL' | 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  confidence: number;
  orbital_stability: 'STABLE' | 'PERTURBED' | 'CHAOTIC';
  recommendations: string[];
}

export interface InterstellarAnomaly {
  object_name: string;
  anomaly_score: number;
  classification: string;
  detected_anomalies: string[];
  is_interstellar: boolean;
  requires_investigation: boolean;
}

export interface WatchmanAlert {
  alert_id: string;
  event_type: string;
  event_date: string;
  severity_score: number;
  prophetic_significance: number;
  cluster_id: number;
  pattern_type: string;
  biblical_references: string[];
  confidence: number;
  recommendations: string[];
  related_events: string[];
}

export interface PatternDetectionResult {
  detected_patterns: Array<{
    type: string;
    dates?: string[];
    planets?: string[];
    significance_score: number;
    biblical_reference: string;
    description: string;
  }>;
  event_clusters: Record<string, string[]>;
  summary: {
    total_events_analyzed: number;
    patterns_detected: number;
    tetrads_found?: number;
    conjunction_patterns?: number;
    clusters_found?: number;
  };
}

export interface PropheticSignificance {
  event_type: string;
  event_date: string;
  significance_score: number;
  significance_level: string;
  biblical_references: string[];
  feast_alignment: {
    passover_season: boolean;
    tabernacles_season: boolean;
  };
}

class MLAPIClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  /**
   * Assess collision risk for a Near-Earth Object
   */
  async assessNEORisk(data: {
    name: string;
    semi_major_axis: number;
    eccentricity: number;
    inclination: number;
    absolute_magnitude?: number;
    diameter_km?: number;
    closest_approach_date: string;
    closest_approach_distance_km: number;
    relative_velocity_km_s?: number;
    orbital_period?: number;
    moid_au?: number;
  }): Promise<NEORiskAssessment> {
    // The backend expects these exact field names (from ml_routes.py)
    const backendPayload = {
      name: data.name,
      semi_major_axis: data.semi_major_axis,
      eccentricity: data.eccentricity,
      inclination: data.inclination,
      absolute_magnitude: data.absolute_magnitude || 20.0,
      diameter_km: data.diameter_km || 0.1,
      closest_approach_date: data.closest_approach_date, // Will be parsed as datetime
      closest_approach_distance_km: data.closest_approach_distance_km,
      relative_velocity_km_s: data.relative_velocity_km_s || 20.0,
      orbital_period: data.orbital_period || 1.0,
      moid_au: data.moid_au,
    };

    console.log('[NEO Risk Assessment] Request URL:', `${this.baseURL}/api/v1/ml/neo-risk-assessment`);
    console.log('[NEO Risk Assessment] Request payload:', backendPayload);

    const response = await fetch(`${this.baseURL}/api/v1/ml/neo-risk-assessment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(backendPayload),
    });

    console.log('[NEO Risk Assessment] Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[NEO Risk Assessment] Error response:', errorText);
      throw new Error(`NEO risk assessment failed: ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();
    console.log('[NEO Risk Assessment] Success response:', result);
    return result;
  }

  /**
   * Map Torino scale to risk level
   */
  private getRiskLevel(torinoScale: number): 'MINIMAL' | 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' {
    if (torinoScale === 0) return 'MINIMAL';
    if (torinoScale <= 2) return 'LOW';
    if (torinoScale <= 4) return 'MODERATE';
    if (torinoScale <= 7) return 'HIGH';
    return 'CRITICAL';
  }

  /**
   * Detect anomalies in interstellar objects
   */
  async detectInterstellarAnomaly(data: {
    name: string;
    eccentricity: number;
    non_gravitational_accel?: number;
    axis_ratio?: number;
    has_tail?: boolean;
  }): Promise<InterstellarAnomaly> {
    const response = await fetch(`${this.baseURL}/api/v1/ml/interstellar-anomaly-detection`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Anomaly detection failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Generate enhanced Watchman alert
   */
  async generateWatchmanAlert(data: {
    event_id: string;
    event_type: string;
    event_date: string;
    rarity?: string;
    magnitude?: number;
    distance_km?: number;
    context_events?: Array<Record<string, any>>;
  }): Promise<WatchmanAlert> {
    const response = await fetch(`${this.baseURL}/api/v1/ml/watchman-alert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Alert generation failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Detect celestial patterns
   */
  async detectPatterns(data: {
    events: Array<Record<string, any>>;
    pattern_types?: string[];
  }): Promise<PatternDetectionResult> {
    const response = await fetch(`${this.baseURL}/api/v1/ml/pattern-detection`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Pattern detection failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get historical Blood Moon Tetrads
   */
  async getTetradHistory(startYear: number = 1493, endYear: number = 2100): Promise<{
    count: number;
    tetrads: Array<{
      period: string;
      dates: string[];
      historical_events: string;
      feast_alignments: string[];
      significance: number;
    }>;
    biblical_reference: string;
    note: string;
  }> {
    const response = await fetch(
      `${this.baseURL}/api/v1/ml/tetrad-history?start_year=${startYear}&end_year=${endYear}`
    );

    if (!response.ok) {
      throw new Error(`Tetrad history fetch failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Calculate prophetic significance for an event
   */
  async calculatePropheticSignificance(
    eventType: string,
    eventDate: string
  ): Promise<PropheticSignificance> {
    const response = await fetch(
      `${this.baseURL}/api/v1/ml/prophetic-significance?event_type=${encodeURIComponent(
        eventType
      )}&event_date=${encodeURIComponent(eventDate)}`
    );

    if (!response.ok) {
      throw new Error(`Significance calculation failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get ML system status
   */
  async getMLStatus(): Promise<{
    status: string;
    models: Record<string, any>;
    version: string;
    last_updated: string;
  }> {
    const response = await fetch(`${this.baseURL}/api/v1/ml/status`);

    if (!response.ok) {
      throw new Error(`ML status fetch failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Batch assess multiple NEOs
   */
  async batchAssessNEOs(limit: number = 10): Promise<{
    count: number;
    neos: Array<{
      name: string;
      torino_scale: number;
      risk_level: string;
      closest_approach: string;
      distance_km: number;
    }>;
    last_updated: string;
  }> {
    const response = await fetch(
      `${this.baseURL}/api/v1/ml/neo-batch-assessment?limit=${limit}`
    );

    if (!response.ok) {
      throw new Error(`Batch NEO assessment failed: ${response.statusText}`);
    }

    return response.json();
  }

  // ===== Production ML Prediction Methods =====

  /**
   * Predict seismic activity using LSTM forecaster
   */
  async predictSeismicActivity(data: {
    moon_distance_km: number;
    moon_phase: number;
    solar_activity: number;
    planetary_alignments: number;
    eclipse_proximity_days: number;
    correlation_score: number;
  }): Promise<SeismicPrediction> {
    const response = await fetch(
      `${this.baseURL}/api/v1/ml/predict-seismic`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      throw new Error(`Seismic prediction failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Predict NEO collision risk (production endpoint)
   */
  async predictNEOCollisionRisk(data: {
    object_name: string;
    semi_major_axis_au: number;
    eccentricity: number;
    inclination_deg: number;
    perihelion_distance_au: number;
    orbital_period_years: number;
  }): Promise<NEORiskAssessment> {
    const response = await fetch(
      `${this.baseURL}/api/v1/ml/predict-neo-approach`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      throw new Error(`NEO prediction failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Detect celestial anomalies
   */
  async detectAnomalies(data: {
    correlation_score: number;
    eclipse_count: number;
    alignment_count: number;
    earthquake_magnitude?: number;
    solar_activity: number;
    moon_distance_normalized: number;
  }): Promise<AnomalyDetection> {
    const response = await fetch(
      `${this.baseURL}/api/v1/ml/detect-anomalies`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      throw new Error(`Anomaly detection failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get multi-horizon seismic forecasts (7, 14, 30 days)
   */
  async getMultiHorizonForecast(): Promise<MultiHorizonForecast> {
    const response = await fetch(
      `${this.baseURL}/api/v1/ml/forecast-multi-horizon`
    );

    if (!response.ok) {
      throw new Error(`Multi-horizon forecast failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get ML model status and health
   */
  async getModelStatus(): Promise<{
    status: string;
    last_training_date: string;
    models: Array<{
      name: string;
      status: string;
      accuracy?: number;
      precision?: number;
      version: string;
    }>;
    total_predictions_today: number;
    average_response_time_ms: number;
  }> {
    const response = await fetch(`${this.baseURL}/api/v1/ml/model-status`);

    if (!response.ok) {
      throw new Error(`Model status fetch failed: ${response.statusText}`);
    }

    return response.json();
  }
}

// Export singleton instance
export const mlAPI = new MLAPIClient();

// Export class for testing/custom instances
export default MLAPIClient;
