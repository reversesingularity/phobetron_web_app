/**
 * NEO Risk Tooltip Component
 * Displays collision risk information on hover
 */

import React from 'react';
import type { NEORiskAssessment } from '@/lib/api/mlClient';

interface NEORiskTooltipProps {
  assessment: NEORiskAssessment;
  position: { x: number; y: number };
}

export default function NEORiskTooltip({ assessment, position }: NEORiskTooltipProps) {
  // Determine color based on Torino Scale
  const getTorinoColor = (scale: number) => {
    if (scale === 0) return 'text-white';
    if (scale <= 2) return 'text-yellow-400';
    if (scale <= 4) return 'text-orange-400';
    return 'text-red-400';
  };

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'MINIMAL': return 'bg-green-500/30 text-green-200 border-green-500/50';
      case 'LOW': return 'bg-blue-500/30 text-blue-200 border-blue-500/50';
      case 'MODERATE': return 'bg-yellow-500/30 text-yellow-200 border-yellow-500/50';
      case 'HIGH': return 'bg-orange-500/30 text-orange-200 border-orange-500/50';
      case 'CRITICAL': return 'bg-red-500/30 text-red-200 border-red-500/50';
      default: return 'bg-gray-500/30 text-gray-200 border-gray-500/50';
    }
  };

  // Helper formatters (defensive - handle null/undefined)
  const fmtNumber = (v: number | null | undefined, decimals = 2) => {
    return typeof v === 'number' && Number.isFinite(v) ? v.toFixed(decimals) : 'N/A';
  };

  const fmtPercent = (v: number | null | undefined, decimals = 2) => {
    if (typeof v === 'number' && Number.isFinite(v)) return (v * 100).toFixed(decimals) + '%';
    return 'N/A';
  };

  const fmtLocaleNumber = (v: number | null | undefined) => {
    return typeof v === 'number' && Number.isFinite(v) ? v.toLocaleString() : 'N/A';
  };

  const fmtDate = (s: string | null | undefined) => {
    try {
      if (!s) return 'N/A';
      const d = new Date(s);
      if (Number.isNaN(d.getTime())) return 'N/A';
      return d.toLocaleDateString();
    } catch (e) {
      return 'N/A';
    }
  };

  return (
    <div
      className="fixed pointer-events-none z-9999"
      style={{
        left: `${position.x + 20}px`,
        top: `${position.y - 10}px`,
      }}
    >
      <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg shadow-2xl p-4 max-w-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-bold text-lg">{assessment.object_name}</h3>
          <span className={`px-2 py-1 rounded text-xs font-semibold border ${getRiskBadgeColor(assessment.risk_level)}`}>
            {assessment.risk_level}
          </span>
        </div>

        {/* Torino Scale */}
        <div className="mb-3 pb-3 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Torino Scale</span>
            <span className={`text-2xl font-bold ${getTorinoColor(assessment.torino_scale)}`}>
              {assessment.torino_scale}
            </span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-gray-400 text-sm">Palermo Scale</span>
            <span className="text-white text-sm font-mono">
              {fmtNumber(assessment.palermo_scale, 2)}
            </span>
          </div>
        </div>

        {/* Collision Probability */}
        <div className="mb-3 pb-3 border-b border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Collision Probability</span>
              <span className="text-white font-semibold">
              {fmtPercent(assessment.collision_probability, 4)}
            </span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div
              className="bg-linear-to-r from-green-500 via-yellow-500 to-red-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min((typeof assessment.collision_probability === 'number' && Number.isFinite(assessment.collision_probability) ? assessment.collision_probability * 100 : 0), 100)}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-gray-500 text-xs">Confidence: {fmtPercent(assessment.confidence, 1)}</span>
            <span className="text-gray-500 text-xs">{assessment.orbital_stability}</span>
          </div>
        </div>

        {/* Closest Approach */}
        <div className="mb-3 pb-3 border-b border-gray-700">
          <div className="text-gray-400 text-xs uppercase tracking-wider mb-2">Closest Approach</div>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">Date:</span>
              <span className="text-white text-sm">
                {fmtDate(assessment.closest_approach_date)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">Distance:</span>
              <span className="text-white text-sm">
                {fmtLocaleNumber(assessment.closest_approach_distance_km)} km
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">Impact Energy:</span>
              <span className="text-white text-sm">
                {fmtNumber(assessment.impact_energy_megatons, 2)} MT
              </span>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        {assessment.recommendations.length > 0 && (
          <div>
            <div className="text-gray-400 text-xs uppercase tracking-wider mb-2">Recommendations</div>
            <ul className="space-y-1">
              {assessment.recommendations.map((rec, idx) => (
                <li key={idx} className="text-sm text-gray-300 flex items-start">
                  <span className="text-indigo-400 mr-2">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
