/**
 * Interstellar Anomaly Detection Panel
 * =====================================
 * 
 * Detects and displays unusual characteristics of interstellar objects
 * Features:
 * - Anomaly score gauge (0-1 scale)
 * - Classification badge (HIGHLY ANOMALOUS, ANOMALOUS, UNUSUAL, NORMAL)
 * - Detected anomalies list with icons
 * - Investigation status
 * - Comparison to known objects
 */

'use client';

import { useState, useEffect, useMemo } from 'react';
import { Badge } from '@/components/catalyst/badge';
import { mlAPI, InterstellarAnomaly } from '@/lib/api/mlClient';
import {
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';

interface InterstellarAnomalyPanelProps {
  name: string;
  objectData: {
    eccentricity: number;
    non_gravitational_accel?: number;
    axis_ratio?: number;
    has_tail?: boolean;
  };
  className?: string;
}

const getClassificationColor = (classification: string): 'red' | 'orange' | 'yellow' | 'zinc' => {
  switch (classification) {
    case 'HIGHLY ANOMALOUS':
      return 'red';
    case 'ANOMALOUS':
      return 'orange';
    case 'UNUSUAL':
      return 'yellow';
    default:
      return 'zinc';
  }
};

const getAnomalyIcon = (anomaly: string) => {
  if (anomaly.includes('Hyperbolic')) return '🌌';
  if (anomaly.includes('acceleration')) return '⚡';
  if (anomaly.includes('elongation')) return '📏';
  if (anomaly.includes('cometary')) return '❓';
  return '•';
};

export default function InterstellarAnomalyPanel({ 
  name, 
  objectData, 
  className = '' 
}: InterstellarAnomalyPanelProps) {
  const [anomaly, setAnomaly] = useState<InterstellarAnomaly | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Memoize the request data to prevent unnecessary re-fetches
  const requestData = useMemo(() => ({
    name,
    eccentricity: objectData.eccentricity,
    non_gravitational_accel: objectData.non_gravitational_accel,
    axis_ratio: objectData.axis_ratio,
    has_tail: objectData.has_tail,
  }), [name, objectData.eccentricity, objectData.non_gravitational_accel, objectData.axis_ratio, objectData.has_tail]);

  useEffect(() => {
    const detectAnomaly = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await mlAPI.detectInterstellarAnomaly(requestData);

        setAnomaly(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Anomaly detection failed');
        console.error('Interstellar anomaly detection error:', err);
      } finally {
        setLoading(false);
      }
    };

    detectAnomaly();
  }, [requestData]);

  if (loading) {
    return (
      <div className={`rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 ${className}`}>
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-purple-400" />
          <div>
            <p className="text-sm font-medium text-zinc-300">Analyzing {name}...</p>
            <p className="text-xs text-zinc-500">Running anomaly detection models</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !anomaly) {
    return (
      <div className={`rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 ${className}`}>
        <div className="flex items-center gap-2">
          <InformationCircleIcon className="h-5 w-5 text-zinc-500" />
          <p className="text-sm text-zinc-400">Anomaly data unavailable</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-lg border border-zinc-800 bg-gradient-to-br from-zinc-900/90 to-zinc-950/90 backdrop-blur-md shadow-xl ${className}`}
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 text-left transition-colors hover:bg-zinc-800/30"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="font-semibold text-white">{name}</h4>
            <p className="text-xs text-zinc-400">Interstellar Object Analysis</p>
          </div>
          <Badge color={getClassificationColor(anomaly.classification)}>
            {anomaly.classification}
          </Badge>
        </div>

        {/* Anomaly Score Gauge */}
        <div className="mt-3">
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="text-zinc-500">Anomaly Score</span>
            <span className="font-mono font-bold text-purple-400">
              {(anomaly.anomaly_score * 100).toFixed(1)}%
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
            <div
              style={{ width: `${anomaly.anomaly_score * 100}%` }}
              className={`h-full rounded-full transition-all duration-500 ${
                anomaly.anomaly_score >= 0.7
                  ? 'bg-gradient-to-r from-red-600 to-red-400'
                  : anomaly.anomaly_score >= 0.4
                  ? 'bg-gradient-to-r from-orange-600 to-orange-400'
                  : anomaly.anomaly_score >= 0.2
                  ? 'bg-gradient-to-r from-yellow-600 to-yellow-400'
                  : 'bg-gradient-to-r from-green-600 to-green-400'
              }`}
            />
          </div>
        </div>
      </button>

      {/* Expandable Details */}
      {isExpanded && (
        <div className="border-t border-zinc-800 p-4">
          {/* Detected Anomalies */}
          {anomaly.detected_anomalies.length > 0 && (
            <div className="mb-4">
              <p className="mb-2 text-xs font-medium text-zinc-400">Detected Anomalies:</p>
              <div className="space-y-1.5">
                {anomaly.detected_anomalies.map((detection, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 rounded-lg bg-zinc-950/50 p-2 text-xs text-zinc-300"
                  >
                    <span className="text-base">{getAnomalyIcon(detection)}</span>
                    <span className="flex-1">{detection}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Status Indicators */}
          <div className="space-y-2">
            <div className="flex items-center justify-between rounded-lg bg-zinc-950/50 p-2">
              <span className="text-xs text-zinc-400">Interstellar Origin</span>
              <div className="flex items-center gap-1">
                {anomaly.is_interstellar ? (
                  <>
                    <CheckCircleIcon className="h-4 w-4 text-green-400" />
                    <span className="text-xs font-medium text-green-400">Confirmed</span>
                  </>
                ) : (
                  <>
                    <InformationCircleIcon className="h-4 w-4 text-zinc-500" />
                    <span className="text-xs font-medium text-zinc-400">Unlikely</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-zinc-950/50 p-2">
              <span className="text-xs text-zinc-400">Investigation Required</span>
              <div className="flex items-center gap-1">
                {anomaly.requires_investigation ? (
                  <>
                    <ExclamationTriangleIcon className="h-4 w-4 text-orange-400" />
                    <span className="text-xs font-medium text-orange-400">Yes</span>
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="h-4 w-4 text-green-400" />
                    <span className="text-xs font-medium text-green-400">No</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Known Comparisons */}
          <div className="mt-4 rounded-lg bg-zinc-950/50 p-3 text-xs">
            <p className="mb-2 font-medium text-zinc-300">Known Interstellar Objects:</p>
            <div className="space-y-1 text-zinc-400">
              <p>• 1I/&apos;Oumuamua (2017): Hyperbolic, elongated ~10:1</p>
              <p>• 2I/Borisov (2019): Hyperbolic, active comet</p>
              <p>• 3I/2020 SO (2020): Possible rocket booster</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
