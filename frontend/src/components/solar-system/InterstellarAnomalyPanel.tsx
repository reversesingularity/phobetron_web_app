/**
 * Interstellar Anomaly Panel
 * Displays detected anomalies in interstellar objects like 'Oumuamua
 */

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/catalyst/badge';
import { Button } from '@/components/catalyst/button';
import {
  SparklesIcon,
  ExclamationCircleIcon,
  RocketLaunchIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { useInterstellarAnomalies } from '@/lib/hooks/useMLPredictions';

interface InterstellarAnomalyPanelProps {
  objectNames: string[];
  className?: string;
}

/**
 * Get anomaly severity color based on score
 */
function getAnomalyColor(score: number): 'zinc' | 'yellow' | 'orange' | 'red' {
  if (score >= 0.8) return 'red';
  if (score >= 0.6) return 'orange';
  if (score >= 0.3) return 'yellow';
  return 'zinc';
}

/**
 * Get anomaly icon based on type
 */
function getAnomalyIcon(anomaly: string): React.ComponentType<{ className?: string }> {
  if (anomaly.includes('hyperbolic') || anomaly.includes('trajectory')) {
    return RocketLaunchIcon;
  }
  if (anomaly.includes('acceleration')) {
    return ExclamationCircleIcon;
  }
  return SparklesIcon;
}

/**
 * Single object anomaly card
 */
function ObjectAnomalyCard({ objectName }: { objectName: string }) {
  const { data: anomaly, loading } = useInterstellarAnomalies(objectName);
  const [expanded, setExpanded] = useState(false);

  if (loading) {
    return (
      <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/30 p-6">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 animate-pulse rounded-full bg-zinc-800" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 animate-pulse rounded bg-zinc-800" />
            <div className="h-3 w-48 animate-pulse rounded bg-zinc-800/50" />
          </div>
        </div>
      </div>
    );
  }

  if (!anomaly) {
    return (
      <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/30 p-6">
        <div className="text-center text-sm text-zinc-500">
          No data available for {objectName}
        </div>
      </div>
    );
  }

  const color = getAnomalyColor(anomaly.anomaly_score);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border border-${color}-800/50 bg-gradient-to-br from-${color}-900/10 to-zinc-950/50 p-6`}
    >
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`rounded-lg bg-${color}-500/10 p-3 ring-1 ring-${color}-500/20`}>
            <SparklesIcon className={`h-6 w-6 text-${color}-400`} />
          </div>
          
          <div>
            <h4 className="font-bold text-white">{anomaly.object_name}</h4>
            <p className="text-sm text-zinc-400">
              {anomaly.is_interstellar ? 'Confirmed Interstellar' : 'Under Investigation'}
            </p>
          </div>
        </div>

        <Badge color={color}>
          Score: {(anomaly.anomaly_score * 100).toFixed(0)}%
        </Badge>
      </div>

      {/* Anomaly Score Bar */}
      <div className="mb-4">
        <div className="mb-1 flex items-center justify-between text-xs">
          <span className="text-zinc-400">Anomaly Score</span>
          <span className="font-mono text-white">
            {(anomaly.anomaly_score * 100).toFixed(1)}%
          </span>
        </div>
        
        <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${anomaly.anomaly_score * 100}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className={`h-full bg-gradient-to-r from-${color}-500 to-${color}-400`}
          />
        </div>
      </div>

      {/* Confidence Bar */}
      <div className="mb-4">
        <div className="mb-1 flex items-center justify-between text-xs">
          <span className="text-zinc-400">Analysis Confidence</span>
          <span className="font-mono text-white">
            {(anomaly.confidence * 100).toFixed(1)}%
          </span>
        </div>
        
        <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${anomaly.confidence * 100}%` }}
            transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-blue-500 to-blue-400"
          />
        </div>
      </div>

      {/* Detected Anomalies */}
      {anomaly.detected_anomalies && anomaly.detected_anomalies.length > 0 && (
        <div className="mb-4">
          <div className="mb-2 text-xs font-semibold uppercase text-zinc-500">
            Detected Anomalies
          </div>
          
          <div className="space-y-2">
            {anomaly.detected_anomalies.map((anom, idx) => {
              const Icon = getAnomalyIcon(anom);
              return (
                <div
                  key={idx}
                  className="flex items-start gap-2 rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-2 text-xs"
                >
                  <Icon className={`mt-0.5 h-4 w-4 flex-shrink-0 text-${color}-400`} />
                  <span className="text-zinc-300">{anom}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Investigation Status */}
      {anomaly.requires_investigation && (
        <div className="mb-4 rounded-lg border border-amber-800/50 bg-amber-900/10 p-3">
          <div className="flex items-center gap-2">
            <MagnifyingGlassIcon className="h-4 w-4 text-amber-400" />
            <span className="text-xs font-semibold text-amber-300">
              Requires Further Investigation
            </span>
          </div>
        </div>
      )}

      {/* Recommendations */}
      {anomaly.recommendations && anomaly.recommendations.length > 0 && (
        <div>
          <Button
            onClick={() => setExpanded(!expanded)}
            color="dark/zinc"
            className="mb-2 w-full text-xs"
          >
            {expanded ? 'Hide' : 'Show'} AI Recommendations ({anomaly.recommendations.length})
          </Button>

          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              {anomaly.recommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-3 text-xs text-zinc-300"
                >
                  <span className="font-semibold text-white">{idx + 1}.</span> {rec}
                </div>
              ))}
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  );
}

/**
 * Main panel component
 */
export function InterstellarAnomalyPanel({ 
  objectNames, 
  className = '' 
}: InterstellarAnomalyPanelProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-purple-500/10 p-3 ring-1 ring-purple-500/20">
          <SparklesIcon className="h-6 w-6 text-purple-400" />
        </div>
        
        <div>
          <h3 className="text-xl font-bold text-white">
            Interstellar Object Analysis
          </h3>
          <p className="text-sm text-zinc-400">
            AI-powered anomaly detection for unusual objects
          </p>
        </div>
      </div>

      {/* Info Box */}
      <div className="rounded-xl border border-blue-800/50 bg-blue-900/10 p-4">
        <div className="mb-2 flex items-center gap-2">
          <ExclamationCircleIcon className="h-5 w-5 text-blue-400" />
          <span className="text-sm font-semibold text-blue-300">
            About Interstellar Anomaly Detection
          </span>
        </div>
        
        <p className="text-xs text-zinc-400">
          Our ML system analyzes objects for unusual characteristics like hyperbolic trajectories 
          (eccentricity &gt; 1), non-gravitational acceleration, extreme elongation ratios, and 
          missing cometary features. Objects like 1I/'Oumuamua (first confirmed interstellar visitor) 
          exhibit multiple anomalies requiring further study.
        </p>
      </div>

      {/* Object Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {objectNames.map(name => (
          <ObjectAnomalyCard key={name} objectName={name} />
        ))}
      </div>

      {/* Known Interstellar Objects */}
      <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/30 p-4">
        <h4 className="mb-3 text-sm font-semibold text-white">
          Known Interstellar Objects
        </h4>
        
        <div className="grid gap-3 text-xs md:grid-cols-3">
          <div className="rounded-lg border border-zinc-800/50 bg-zinc-900/50 p-3">
            <div className="mb-1 font-semibold text-white">1I/'Oumuamua</div>
            <div className="mb-2 text-zinc-400">Discovered 2017</div>
            <Badge color="red" className="text-[10px]">e = 1.20</Badge>
          </div>
          
          <div className="rounded-lg border border-zinc-800/50 bg-zinc-900/50 p-3">
            <div className="mb-1 font-semibold text-white">2I/Borisov</div>
            <div className="mb-2 text-zinc-400">Discovered 2019</div>
            <Badge color="orange" className="text-[10px]">e = 3.36</Badge>
          </div>
          
          <div className="rounded-lg border border-zinc-800/50 bg-zinc-900/50 p-3">
            <div className="mb-1 font-semibold text-white">3I/ATLAS</div>
            <div className="mb-2 text-zinc-400">Discovered 2024</div>
            <Badge color="yellow" className="text-[10px]">e = 1.05</Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
