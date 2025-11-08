/**
 * NEO Risk Badge Component
 * ========================
 * 
 * Displays real-time collision risk assessment for Near-Earth Objects
 * Features:
 * - Torino Scale color coding (0-10)
 * - Collision probability
 * - Closest approach distance
 * - Impact energy
 * - Orbital stability indicator
 * - Recommendations popup
 */

'use client';

import { useState, useEffect, useMemo } from 'react';
import { AnimatePresence } from 'motion/react';
import { Badge } from '@/components/catalyst/badge';
import { mlAPI, NEORiskAssessment } from '@/lib/api/mlClient';
import { 
  ExclamationTriangleIcon, 
  ShieldCheckIcon,
  InformationCircleIcon 
} from '@heroicons/react/24/outline';

interface NEORiskBadgeProps {
  name: string;
  orbitalData: {
    semi_major_axis: number;
    eccentricity: number;
    inclination: number;
    absolute_magnitude?: number;
    diameter_km?: number;
    orbital_period?: number;
  };
  closestApproach: {
    date: Date;
    distance_km: number;
    velocity_km_s?: number;
  };
  className?: string;
}

const getTorinoColor = (scale: number): { bg: string; text: string; ring: string } => {
  if (scale === 0) return { bg: 'bg-zinc-500/10', text: 'text-zinc-400', ring: 'ring-zinc-500/20' };
  if (scale === 1) return { bg: 'bg-green-500/10', text: 'text-green-400', ring: 'ring-green-500/20' };
  if (scale <= 4) return { bg: 'bg-yellow-500/10', text: 'text-yellow-400', ring: 'ring-yellow-500/20' };
  if (scale <= 7) return { bg: 'bg-orange-500/10', text: 'text-orange-400', ring: 'ring-orange-500/20' };
  return { bg: 'bg-red-500/10', text: 'text-red-400', ring: 'ring-red-500/20' };
};

const getRiskLevelIcon = (level: string) => {
  switch (level) {
    case 'CRITICAL':
    case 'HIGH':
      return <ExclamationTriangleIcon className="h-4 w-4" />;
    case 'MINIMAL':
    case 'LOW':
      return <ShieldCheckIcon className="h-4 w-4" />;
    default:
      return <InformationCircleIcon className="h-4 w-4" />;
  }
};

export default function NEORiskBadge({ name, orbitalData, closestApproach, className = '' }: NEORiskBadgeProps) {
  const [assessment, setAssessment] = useState<NEORiskAssessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Memoize the request data to prevent unnecessary re-fetches
  const requestData = useMemo(() => {
    console.log('[NEORiskBadge] Creating request data for:', name);
    console.log('[NEORiskBadge] Orbital data:', orbitalData);
    console.log('[NEORiskBadge] Closest approach:', closestApproach);
    
    return {
      name,
      ...orbitalData,
      closest_approach_date: closestApproach.date.toISOString(),
      closest_approach_distance_km: closestApproach.distance_km,
      relative_velocity_km_s: closestApproach.velocity_km_s || 20.0,
    };
  }, [name, orbitalData.semi_major_axis, orbitalData.eccentricity, closestApproach.distance_km]);

  useEffect(() => {
    console.log('[NEORiskBadge] useEffect triggered for:', name);
    console.log('[NEORiskBadge] Request data:', requestData);
    
    const fetchRiskAssessment = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('[NEORiskBadge] Calling mlAPI.assessNEORisk...');
        const result = await mlAPI.assessNEORisk(requestData);
        console.log('[NEORiskBadge] Received result:', result);

        setAssessment(result);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Risk assessment failed';
        console.error('[NEORiskBadge] Error:', errorMessage, err);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchRiskAssessment();
  }, [requestData]);

  if (loading) {
    return (
      <div className={`inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-1.5 ${className}`}>
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-700 border-t-zinc-400" />
        <span className="text-xs text-zinc-400">Analyzing...</span>
      </div>
    );
  }

  if (error || !assessment) {
    return (
      <div className={`inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-1.5 ${className}`}>
        <InformationCircleIcon className="h-4 w-4 text-zinc-500" />
        <span className="text-xs text-zinc-500">Risk data unavailable</span>
      </div>
    );
  }

  const colors = getTorinoColor(assessment.torino_scale);

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setShowDetails(!showDetails)}
        className={`inline-flex items-center gap-2 rounded-lg border ${colors.bg} ${colors.text} ring-1 ${colors.ring} px-3 py-1.5 transition-all hover:ring-2`}
        title="Click badge for detailed risk assessment"
      >
        {getRiskLevelIcon(assessment.risk_level)}
        <span className="text-xs font-semibold">T-{assessment.torino_scale}</span>
        <span className="text-xs opacity-75">{assessment.risk_level}</span>
      </button>

      <AnimatePresence>
        {showDetails && (
          <div
            className="fixed inset-0 z-[9999] flex items-start justify-center pt-20 px-4"
            onClick={() => setShowDetails(false)}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            
            {/* Panel */}
            <div
              className="relative z-[10000] w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-900 p-4 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setShowDetails(false)}
                className="absolute right-3 top-3 rounded-lg p-1 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
                aria-label="Close"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            {/* Header */}
            <div className="mb-3 flex items-start justify-between">
              <div>
                <h4 className="font-semibold text-white">{assessment.object_name}</h4>
                <p className="text-xs text-zinc-400">Risk Assessment</p>
              </div>
              <Badge color={assessment.risk_level === 'CRITICAL' ? 'red' : assessment.risk_level === 'HIGH' ? 'orange' : 'zinc'}>
                {assessment.risk_level}
              </Badge>
            </div>

            {/* Metrics Grid */}
            <div className="mb-3 grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-zinc-950/50 p-2">
                <p className="text-xs text-zinc-500">Torino Scale</p>
                <p className={`text-lg font-bold ${colors.text}`}>{assessment.torino_scale}/10</p>
              </div>
              <div className="rounded-lg bg-zinc-950/50 p-2">
                <p className="text-xs text-zinc-500">Palermo Scale</p>
                <p className="text-lg font-bold text-white">{assessment.palermo_scale.toFixed(2)}</p>
              </div>
              <div className="rounded-lg bg-zinc-950/50 p-2">
                <p className="text-xs text-zinc-500">Collision Prob.</p>
                <p className="text-lg font-bold text-white">{(assessment.collision_probability * 100).toExponential(2)}%</p>
              </div>
              <div className="rounded-lg bg-zinc-950/50 p-2">
                <p className="text-xs text-zinc-500">Impact Energy</p>
                <p className="text-lg font-bold text-white">{assessment.impact_energy_megatons.toFixed(1)} MT</p>
              </div>
            </div>

            {/* Closest Approach */}
            <div className="mb-3 rounded-lg bg-zinc-950/50 p-2">
              <p className="text-xs text-zinc-500">Closest Approach</p>
              <p className="text-sm font-medium text-white">
                {new Date(assessment.closest_approach_date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
              <p className="text-xs text-zinc-400">{assessment.closest_approach_distance_km.toLocaleString()} km</p>
            </div>

            {/* Orbital Stability */}
            <div className="mb-3 flex items-center gap-2">
              <span className="text-xs text-zinc-500">Orbital Stability:</span>
              <Badge color={assessment.orbital_stability === 'STABLE' ? 'green' : assessment.orbital_stability === 'PERTURBED' ? 'yellow' : 'orange'}>
                {assessment.orbital_stability}
              </Badge>
            </div>

            {/* Recommendations */}
            {assessment.recommendations.length > 0 && (
              <div className="space-y-1.5 border-t border-zinc-800 pt-3">
                <p className="text-xs font-medium text-zinc-400">Recommendations:</p>
                {assessment.recommendations.map((rec, idx) => (
                  <p key={idx} className="text-xs text-zinc-300">
                    {rec}
                  </p>
                ))}
              </div>
            )}

            {/* Confidence */}
            <div className="mt-3 flex items-center justify-between border-t border-zinc-800 pt-2">
              <span className="text-xs text-zinc-500">Model Confidence</span>
              <span className="text-xs font-medium text-white">{(assessment.confidence * 100).toFixed(0)}%</span>
            </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
