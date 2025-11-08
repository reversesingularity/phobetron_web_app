'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  SparklesIcon, 
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  BoltIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { eventPredictor, type EventPrediction } from '@/lib/ai/eventPredictor';
import { getAllCelestialEvents } from '@/lib/utils/celestialCalculations';
import { getAllEarthEvents } from '@/lib/services/earthEventsService';
import { checkCelestialFeastCorrelation, checkEarthFeastCorrelation } from '@/lib/utils/feastCorrelation';

interface MonitoredEvent {
  id: string;
  type: 'celestial' | 'terrestrial';
  title: string;
  date: Date;
  significance: 'critical' | 'high' | 'medium' | 'low';
  prediction: EventPrediction;
  feastCorrelation?: boolean;
  magnitude?: number;
  location?: string;
}

export default function MLEventMonitor() {
  const [monitoredEvents, setMonitoredEvents] = useState<MonitoredEvent[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    critical: 0,
    high: 0,
    feastAligned: 0,
    avgConfidence: 0
  });

  // Scan for significant events
  const scanEvents = async () => {
    setIsScanning(true);
    
    try {
      const now = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 6); // Next 6 months
      
      // Get celestial events
      const celestialEvents = getAllCelestialEvents(now, endDate);
      const earthEvents = getAllEarthEvents(now, endDate);
      
      const monitored: MonitoredEvent[] = [];
      
      // Process celestial events
      celestialEvents.forEach(event => {
        const prediction = eventPredictor.predict(event);
        const feastCorrelation = checkCelestialFeastCorrelation(event, 3);
        
        if (prediction.predictedSignificance === 'critical' || 
            prediction.predictedSignificance === 'high' ||
            (feastCorrelation && feastCorrelation.correlationScore > 70)) {
          monitored.push({
            id: event.id,
            type: 'celestial',
            title: event.title,
            date: event.eventDate,
            significance: prediction.predictedSignificance,
            prediction,
            feastCorrelation: !!feastCorrelation,
            location: 'Global'
          });
        }
      });
      
      // Process terrestrial events
      earthEvents.forEach(event => {
        const feastCorrelation = checkEarthFeastCorrelation(event, 3);
        
        // Create a simplified prediction for earth events since they don't use the full eventPredictor
        const earthPrediction: EventPrediction = {
          eventId: event.id,
          predictedSignificance: event.severity,
          confidenceScore: event.severity === 'critical' ? 0.95 : event.severity === 'high' ? 0.85 : 0.75,
          propheticRelevance: feastCorrelation ? feastCorrelation.correlationScore / 100 : 0.3,
          historicalPrecedents: [],
          anomalyScore: event.severity === 'critical' ? 0.8 : 0.5,
          reasoning: [
            `${event.type.charAt(0).toUpperCase() + event.type.slice(1)} event detected`,
            `Severity: ${event.severity.toUpperCase()}`,
            `Magnitude: ${event.magnitude}`,
            event.location ? `Location: ${event.location}` : 'Location: Multiple regions'
          ].filter(Boolean),
          recommendedActions: [
            'Monitor closely for developments',
            'Review feast day correlations',
            event.severity === 'critical' ? 'Alert watchman network' : 'Continue regular monitoring'
          ]
        };
        
        if (event.severity === 'critical' || event.severity === 'high' ||
            (feastCorrelation && feastCorrelation.correlationScore > 70)) {
          monitored.push({
            id: event.id,
            type: 'terrestrial',
            title: `${event.type.charAt(0).toUpperCase() + event.type.slice(1)} ${event.magnitude ? `M${event.magnitude}` : ''}`,
            date: event.date,
            significance: event.severity,
            prediction: earthPrediction,
            feastCorrelation: !!feastCorrelation,
            magnitude: event.magnitude,
            location: event.location
          });
        }
      });
      
      // Sort by date and significance
      monitored.sort((a, b) => {
        if (a.significance === 'critical' && b.significance !== 'critical') return -1;
        if (b.significance === 'critical' && a.significance !== 'critical') return 1;
        return a.date.getTime() - b.date.getTime();
      });
      
      setMonitoredEvents(monitored);
      
      // Calculate stats
      const critical = monitored.filter(e => e.significance === 'critical').length;
      const high = monitored.filter(e => e.significance === 'high').length;
      const feastAligned = monitored.filter(e => e.feastCorrelation).length;
      const avgConf = monitored.reduce((sum, e) => sum + e.prediction.confidenceScore, 0) / monitored.length || 0;
      
      setStats({
        total: monitored.length,
        critical,
        high,
        feastAligned,
        avgConfidence: avgConf
      });
      
    } catch (error) {
      console.error('Error scanning events:', error);
    } finally {
      setIsScanning(false);
    }
  };

  // Initial scan
  useEffect(() => {
    scanEvents();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(scanEvents, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* AI Monitoring Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-purple-500/30 bg-linear-to-br from-purple-900/20 to-blue-900/20 p-6 backdrop-blur-xl"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-purple-500/20 border border-purple-500/30">
              <SparklesIcon className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                AI Event Monitor
              </h2>
              <p className="text-sm text-purple-300/70 mt-1">
                Real-time ML-powered celestial & terrestrial event detection
              </p>
            </div>
          </div>
          
          <button
            onClick={scanEvents}
            disabled={isScanning}
            className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isScanning ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <BoltIcon className="w-4 h-4" />
                Scan Now
              </>
            )}
          </button>
        </div>
      </motion.div>

      {/* ML Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="rounded-lg border border-cyan-500/30 bg-zinc-900/50 p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <ChartBarIcon className="w-4 h-4 text-cyan-400" />
            <p className="text-xs font-medium text-cyan-400/80">Total Events</p>
          </div>
          <p className="text-2xl font-bold text-cyan-400">{stats.total}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="rounded-lg border border-red-500/30 bg-zinc-900/50 p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <ExclamationTriangleIcon className="w-4 h-4 text-red-400" />
            <p className="text-xs font-medium text-red-400/80">Critical</p>
          </div>
          <p className="text-2xl font-bold text-red-400">{stats.critical}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="rounded-lg border border-orange-500/30 bg-zinc-900/50 p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <ExclamationTriangleIcon className="w-4 h-4 text-orange-400" />
            <p className="text-xs font-medium text-orange-400/80">High Priority</p>
          </div>
          <p className="text-2xl font-bold text-orange-400">{stats.high}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="rounded-lg border border-yellow-500/30 bg-zinc-900/50 p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <SparklesIcon className="w-4 h-4 text-yellow-400" />
            <p className="text-xs font-medium text-yellow-400/80">Feast Aligned</p>
          </div>
          <p className="text-2xl font-bold text-yellow-400">{stats.feastAligned}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="rounded-lg border border-green-500/30 bg-zinc-900/50 p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <CheckCircleIcon className="w-4 h-4 text-green-400" />
            <p className="text-xs font-medium text-green-400/80">Avg Confidence</p>
          </div>
          <p className="text-2xl font-bold text-green-400">{(stats.avgConfidence * 100).toFixed(0)}%</p>
        </motion.div>
      </div>

      {/* Monitored Events List */}
      <div className="space-y-3">
        {monitoredEvents.length === 0 && !isScanning && (
          <div className="text-center py-12">
            <CheckCircleIcon className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <p className="text-lg font-semibold text-zinc-300">No Significant Events Detected</p>
            <p className="text-sm text-zinc-500 mt-2">The AI monitoring system is actively scanning for celestial & terrestrial events</p>
          </div>
        )}

        {monitoredEvents.map((event: MonitoredEvent, idx: number) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`rounded-lg border p-5 hover:shadow-lg transition-all ${
              event.significance === 'critical'
                ? 'border-red-500/50 bg-red-950/20 hover:border-red-500'
                : event.significance === 'high'
                ? 'border-orange-500/50 bg-orange-950/20 hover:border-orange-500'
                : 'border-zinc-700/50 bg-zinc-900/50 hover:border-cyan-500/50'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                {/* Event Header */}
                <div className="flex items-center gap-3 mb-2">
                  {event.type === 'celestial' ? (
                    <SparklesIcon className="w-5 h-5 text-cyan-400" />
                  ) : (
                    <GlobeAltIcon className="w-5 h-5 text-orange-400" />
                  )}
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    event.significance === 'critical'
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : event.significance === 'high'
                      ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                      : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  }`}>
                    {event.significance.toUpperCase()}
                  </span>
                  {event.feastCorrelation && (
                    <span className="px-2 py-1 rounded-full text-xs font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                      ✡️ FEAST ALIGNED
                    </span>
                  )}
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30">
                    {(event.prediction.confidenceScore * 100).toFixed(0)}% ML Confidence
                  </span>
                </div>

                {/* Event Title */}
                <h3 className="text-lg font-bold text-white mb-1">{event.title}</h3>
                
                {/* Event Details */}
                <div className="flex items-center gap-4 text-sm text-zinc-400 mb-3">
                  <span>{event.type === 'celestial' ? '🌟 Celestial' : '🌍 Terrestrial'}</span>
                  <span>📅 {event.date.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}</span>
                  {event.magnitude && <span>📊 M{event.magnitude.toFixed(1)}</span>}
                  {event.location && <span>📍 {event.location}</span>}
                </div>

                {/* AI Reasoning */}
                {event.prediction.reasoning.length > 0 && (
                  <div className="mt-3 p-3 rounded-lg bg-purple-950/30 border border-purple-500/20">
                    <p className="text-xs font-semibold text-purple-300 mb-2">🤖 AI Analysis:</p>
                    <ul className="text-xs text-zinc-400 space-y-1">
                      {event.prediction.reasoning.slice(0, 3).map((reason: string, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-purple-400 mt-0.5">•</span>
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recommended Actions */}
                {event.prediction.recommendedActions && event.prediction.recommendedActions.length > 0 && (
                  <div className="mt-3 flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-cyan-300">Recommended:</span>
                    {event.prediction.recommendedActions.slice(0, 2).map((action: string, i: number) => (
                      <span key={i} className="px-2 py-1 rounded text-xs bg-cyan-950/50 text-cyan-300 border border-cyan-500/30">
                        {action}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
