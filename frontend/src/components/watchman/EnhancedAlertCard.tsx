/**
 * Enhanced Alert Card Component
 * Displays ML-powered alerts with severity scores, prophetic significance, and biblical references
 */

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/catalyst/badge';
import { Button } from '@/components/catalyst/button';
import { 
  ExclamationTriangleIcon,
  SparklesIcon,
  BookOpenIcon,
  ClockIcon,
  LinkIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';

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

interface EnhancedAlertCardProps {
  alert: EnhancedAlert;
  onViewDetails?: (alertId: string) => void;
  defaultCollapsed?: boolean;
}

export function EnhancedAlertCard({ alert, onViewDetails, defaultCollapsed = false }: EnhancedAlertCardProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  // Determine severity color
  const getSeverityColor = (score: number) => {
    if (score >= 80) return 'red';
    if (score >= 60) return 'orange';
    if (score >= 40) return 'yellow';
    return 'zinc';
  };

  const severityColor = getSeverityColor(alert.severity_score);

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border bg-gradient-to-br shadow-xl backdrop-blur-xl transition-all ${
        severityColor === 'red'
          ? 'border-red-800/50 from-red-900/20 to-zinc-950/90'
          : severityColor === 'orange'
          ? 'border-orange-800/50 from-orange-900/20 to-zinc-950/90'
          : severityColor === 'yellow'
          ? 'border-yellow-800/50 from-yellow-900/20 to-zinc-950/90'
          : 'border-zinc-800/50 from-zinc-900/90 to-zinc-950/90'
      }`}
    >
      }`}
    >
      {/* Header - Always visible */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <ExclamationTriangleIcon className={`h-5 w-5 ${
                severityColor === 'red' ? 'text-red-400' :
                severityColor === 'orange' ? 'text-orange-400' :
                severityColor === 'yellow' ? 'text-yellow-400' :
                'text-zinc-400'
              }`} />
              <h3 className="text-lg font-bold text-white">
                {alert.event_type.replace(/_/g, ' ').toUpperCase()}
              </h3>
            </div>
            <p className="mt-1 text-sm text-zinc-400">
              {new Date(alert.event_date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge color={severityColor as any}>
              {alert.pattern_type.replace(/_/g, ' ')}
            </Badge>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="rounded-lg p-1 text-zinc-400 transition-colors hover:bg-zinc-800/50 hover:text-white"
              aria-label={isCollapsed ? 'Expand' : 'Collapse'}
            >
              {isCollapsed ? (
                <ChevronDownIcon className="h-5 w-5" />
              ) : (
                <ChevronUpIcon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Collapsible Content */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              {/* Scores */}
              <div className="mb-4 grid grid-cols-2 gap-4">
                {/* Severity Score */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs text-zinc-400">Severity</span>
                    <span className="text-xs font-bold text-white">{alert.severity_score.toFixed(0)}/100</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                    <div
                      style={{ width: `${alert.severity_score}%` }}
                      className={`h-full transition-all duration-500 ${
                        severityColor === 'red' ? 'bg-red-500' :
                        severityColor === 'orange' ? 'bg-orange-500' :
                        severityColor === 'yellow' ? 'bg-yellow-500' :
                        'bg-zinc-500'
                      }`}
                    />
                  </div>
                </div>

                {/* Prophetic Significance */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs text-zinc-400">Prophetic Sig.</span>
                    <span className="text-xs font-bold text-white">{(alert.prophetic_significance * 100).toFixed(0)}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                    <div
                      style={{ width: `${alert.prophetic_significance * 100}%` }}
                      className="h-full bg-purple-500 transition-all duration-500"
                    />
                  </div>
                </div>
              </div>

              </div>

              {/* Biblical References */}
              {alert.biblical_references && alert.biblical_references.length > 0 && (
                <div className="mb-4">
                  <div className="mb-2 flex items-center gap-2">
                    <BookOpenIcon className="h-4 w-4 text-purple-400" />
                    <span className="text-xs font-semibold text-zinc-300">Biblical References</span>
                  </div>
                  <div className="space-y-1">
                    {alert.biblical_references.slice(0, 2).map((ref, idx) => (
                      <p key={idx} className="text-xs text-zinc-400 line-clamp-1">
                        {ref}
                      </p>
                    ))}
                    {alert.biblical_references.length > 2 && (
                      <p className="text-xs text-purple-400">
                        +{alert.biblical_references.length - 2} more references
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {alert.recommendations && alert.recommendations.length > 0 && (
                <div className="mb-4">
                  <div className="mb-2 flex items-center gap-2">
                    <SparklesIcon className="h-4 w-4 text-blue-400" />
                    <span className="text-xs font-semibold text-zinc-300">AI Recommendations</span>
                  </div>
                  <div className="space-y-1">
                    {alert.recommendations.slice(0, 2).map((rec, idx) => (
                      <p key={idx} className="text-xs text-zinc-400">
                        {rec}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-zinc-800 pt-4">
                <div className="flex items-center gap-4 text-xs text-zinc-500">
                  <div className="flex items-center gap-1">
                    <ClockIcon className="h-4 w-4" />
                    <span>Confidence: {(alert.confidence * 100).toFixed(0)}%</span>
                  </div>
                  {alert.related_events && alert.related_events.length > 0 && (
                    <div className="flex items-center gap-1">
                      <LinkIcon className="h-4 w-4" />
                      <span>{alert.related_events.length} related</span>
                    </div>
                  )}
                </div>

                {onViewDetails && (
                  <Button
                    onClick={() => onViewDetails(alert.alert_id)}
                    color="dark/zinc"
                    className="text-xs"
                  >
                    View Details
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
          </div>
          {onViewDetails && (
            <Button
              onClick={() => onViewDetails(alert.alert_id)}
              className="text-xs"
              color="dark/zinc"
            >
              View Details
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
