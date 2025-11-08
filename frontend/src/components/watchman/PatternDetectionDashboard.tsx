/**
 * Pattern Detection Dashboard
 * Displays detected celestial patterns: tetrads, triple conjunctions, event clusters
 */

'use client';

import { motion } from 'framer-motion';
import { Badge } from '@/components/catalyst/badge';
import { 
  SparklesIcon,
  MoonIcon,
  GlobeAltIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

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

interface PatternDetectionDashboardProps {
  patterns: DetectedPattern[];
  loading?: boolean;
}

export function PatternDetectionDashboard({ patterns, loading }: PatternDetectionDashboardProps) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-zinc-800/50 bg-gradient-to-br from-zinc-900/50 to-zinc-950/50 p-6">
        <div className="flex items-center justify-center py-12">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-zinc-800 border-t-purple-500" />
        </div>
      </div>
    );
  }

  const getPatternIcon = (type: string) => {
    if (type.includes('TETRAD') || type.includes('MOON')) {
      return <MoonIcon className="h-6 w-6 text-red-400" />;
    }
    if (type.includes('CONJUNCTION')) {
      return <GlobeAltIcon className="h-6 w-6 text-blue-400" />;
    }
    return <SparklesIcon className="h-6 w-6 text-purple-400" />;
  };

  const getPatternColor = (score: number) => {
    if (score >= 0.9) return 'red';
    if (score >= 0.7) return 'orange';
    if (score >= 0.5) return 'yellow';
    return 'blue';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <ChartBarIcon className="h-6 w-6 text-purple-400" />
        <h2 className="text-2xl font-bold text-white">Detected Patterns</h2>
        <Badge color="purple">{patterns.length} Found</Badge>
      </div>

      {patterns.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800/50 bg-gradient-to-br from-zinc-900/50 to-zinc-950/50 p-12 text-center">
          <SparklesIcon className="mx-auto mb-4 h-12 w-12 text-zinc-600" />
          <p className="text-zinc-400">No significant patterns detected in current timeframe</p>
          <p className="mt-2 text-sm text-zinc-500">Expand date range or adjust filters</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {patterns.map((pattern, idx) => {
            const color = getPatternColor(pattern.significance_score);
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className={`group relative overflow-hidden rounded-xl border p-6 transition-all hover:scale-[1.02] ${
                  color === 'red'
                    ? 'border-red-800/50 bg-red-900/10 hover:border-red-500/50'
                    : color === 'orange'
                    ? 'border-orange-800/50 bg-orange-900/10 hover:border-orange-500/50'
                    : color === 'yellow'
                    ? 'border-yellow-800/50 bg-yellow-900/10 hover:border-yellow-500/50'
                    : 'border-blue-800/50 bg-blue-900/10 hover:border-blue-500/50'
                }`}
              >
                {/* Icon */}
                <div className="mb-4 flex items-start justify-between">
                  <div className={`rounded-xl p-3 ${
                    color === 'red' ? 'bg-red-500/10 ring-1 ring-red-500/20' :
                    color === 'orange' ? 'bg-orange-500/10 ring-1 ring-orange-500/20' :
                    color === 'yellow' ? 'bg-yellow-500/10 ring-1 ring-yellow-500/20' :
                    'bg-blue-500/10 ring-1 ring-blue-500/20'
                  }`}>
                    {getPatternIcon(pattern.type)}
                  </div>
                  <Badge color={color as any}>
                    {(pattern.significance_score * 100).toFixed(0)}%
                  </Badge>
                </div>

                {/* Pattern Info */}
                <h3 className="mb-2 text-lg font-bold text-white">
                  {pattern.type.replace(/_/g, ' ')}
                </h3>
                <p className="mb-3 text-sm text-zinc-400">{pattern.description}</p>

                {/* Dates or Planets */}
                {pattern.dates && pattern.dates.length > 0 && (
                  <div className="mb-3">
                    <p className="mb-1 text-xs font-semibold text-zinc-500">Dates:</p>
                    <div className="flex flex-wrap gap-1">
                      {pattern.dates.map((date, i) => (
                        <span key={i} className="rounded bg-zinc-800 px-2 py-0.5 text-xs text-zinc-300">
                          {new Date(date).toLocaleDateString()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {pattern.planets && pattern.planets.length > 0 && (
                  <div className="mb-3">
                    <p className="mb-1 text-xs font-semibold text-zinc-500">Planets:</p>
                    <div className="flex flex-wrap gap-1">
                      {pattern.planets.map((planet, i) => (
                        <span key={i} className="rounded bg-zinc-800 px-2 py-0.5 text-xs text-zinc-300">
                          {planet}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Feast Alignments */}
                {pattern.feast_alignments && pattern.feast_alignments.length > 0 && (
                  <div className="mb-3 rounded-lg bg-purple-900/20 p-3">
                    <p className="mb-1 text-xs font-semibold text-purple-300">🕎 Feast Day Alignments:</p>
                    {pattern.feast_alignments.map((feast, i) => (
                      <p key={i} className="text-xs text-purple-200">{feast}</p>
                    ))}
                  </div>
                )}

                {/* Biblical Reference */}
                {pattern.biblical_reference && (
                  <div className="mb-3 rounded-lg bg-blue-900/20 p-3">
                    <p className="text-xs text-blue-200">📖 {pattern.biblical_reference}</p>
                  </div>
                )}

                {/* Historical Note */}
                {pattern.historical_note && (
                  <div className="rounded-lg bg-amber-900/20 p-3">
                    <p className="text-xs text-amber-200">📜 {pattern.historical_note}</p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
