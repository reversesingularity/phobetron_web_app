/**
 * ML API Hooks
 * React hooks for accessing ML-powered predictions and alerts
 */

import { useState, useEffect } from 'react';

const ML_API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8020';

interface EnhancedAlert {
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

interface NEORiskAssessment {
  object_name: string;
  collision_probability: number;
  torino_scale: number;
  palermo_scale: number;
  closest_approach_date: string;
  closest_approach_distance_km: number;
  impact_energy_megatons: number;
  risk_level: string;
  confidence: number;
  orbital_stability: string;
  recommendations: string[];
}

interface InterstellarAnomaly {
  object_name: string;
  anomaly_score: number;
  classification: string;
  detected_anomalies: string[];
  is_interstellar: boolean;
  requires_investigation: boolean;
}

interface DetectedPattern {
  type: string;
  dates?: string[];
  planets?: string[];
  significance_score: number;
  biblical_reference?: string;
  description: string;
  feast_alignments?: string[];
  historical_note?: string;
}

/**
 * Hook to fetch NEO risk assessment
 */
export function useNEORiskAssessment(neoName?: string) {
  const [assessment, setAssessment] = useState<NEORiskAssessment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!neoName) return;

    const fetchAssessment = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${ML_API_BASE}/api/v1/ml/neo-risk-assessment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ neo_name: neoName })
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        setAssessment(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch assessment');
        console.error('NEO assessment error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAssessment();
  }, [neoName]);

  return { assessment, loading, error };
}

/**
 * Hook to fetch enhanced watchman alerts
 */
export function useEnhancedAlerts(eventType?: string) {
  const [alerts, setAlerts] = useState<EnhancedAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAlerts = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = eventType
          ? `${ML_API_BASE}/api/v1/ml/watchman-alerts?event_type=${eventType}`
          : `${ML_API_BASE}/api/v1/ml/watchman-alerts`;

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        setAlerts(data.alerts || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch alerts');
        console.error('Enhanced alerts error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, [eventType]);

  return { alerts, loading, error, refresh: () => setLoading(true) };
}

/**
 * Hook to detect celestial patterns
 */
export function usePatternDetection(startDate?: Date, endDate?: Date) {
  const [patterns, setPatterns] = useState<DetectedPattern[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPatterns = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (startDate) params.append('start_date', startDate.toISOString().split('T')[0]);
        if (endDate) params.append('end_date', endDate.toISOString().split('T')[0]);

        const response = await fetch(
          `${ML_API_BASE}/api/v1/ml/pattern-detection?${params.toString()}`
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        setPatterns([
          ...(data.tetrads || []),
          ...(data.conjunctions || []),
          ...(data.clusters || [])
        ]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to detect patterns');
        console.error('Pattern detection error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPatterns();
  }, [startDate, endDate]);

  return { patterns, loading, error };
}

/**
 * Hook to detect interstellar anomalies
 */
export function useInterstellarAnomalies(objectName?: string) {
  const [anomaly, setAnomaly] = useState<InterstellarAnomaly | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!objectName) return;

    const fetchAnomaly = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${ML_API_BASE}/api/v1/ml/interstellar-anomaly`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ object_name: objectName })
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        setAnomaly(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to detect anomaly');
        console.error('Interstellar anomaly error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnomaly();
  }, [objectName]);

  return { anomaly, loading, error };
}
