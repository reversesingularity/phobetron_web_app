'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Badge,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeader,
  TableCell
} from '@/components/catalyst';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { 
  ClockIcon, 
  EyeIcon, 
  CalendarIcon,
  GlobeAltIcon,
  SparklesIcon,
  ExclamationTriangleIcon,
  CpuChipIcon,
  LightBulbIcon,
} from '@heroicons/react/24/outline';
import MLPredictionsPanel from '@/components/ml/MLPredictionsPanel';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'; // Star of David icon
import { CelestialEvent } from '@/lib/types/celestial';
import { 
  getAllCelestialEvents, 
  formatTimeRemaining 
} from '@/lib/utils/celestialCalculations';
import { eventPredictor, EventPrediction } from '@/lib/ai/eventPredictor';
import { monitoringEngine } from '@/lib/ai/realTimeMonitor';
import { showToast } from '@/lib/toast';
import { MainLayout } from '@/components/layout';
import { 
  getFeastProximity, 
  getHebrewYear,
  formatFeastDateRange,
  type HebrewFeast
} from '@/lib/utils/hebrewCalendar';
import { 
  checkCelestialFeastCorrelation,
  filterEventsWithFeastCorrelations,
  type FeastCorrelation,
  type EarthEvent
} from '@/lib/utils/feastCorrelation';
import { 
  getAllEarthEvents,
  getEarthEventStats,
  getEventTypeDisplayName,
  getSeverityColor
} from '@/lib/services/earthEventsService';
import {
  getAllUnifiedEvents,
  getUnifiedEventStats,
  filterUnifiedEvents,
  type UnifiedEvent
} from '@/lib/services/unifiedEventsService';

export default function WatchmansViewPage() {
  const [timeFilter, setTimeFilter] = useState<'7days' | '30days' | '1year' | 'all'>('7days');
  const [significanceFilter, setSignificanceFilter] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');
  const [upcomingEvents, setUpcomingEvents] = useState<CelestialEvent[]>([]);
  const [predictions, setPredictions] = useState<Map<string, EventPrediction>>(new Map());
  const [aiMonitoring, setAiMonitoring] = useState(false);
  const [showAiInsights, setShowAiInsights] = useState(false);
  
  // New state for Hebrew feast filtering
  const [feastFilter, setFeastFilter] = useState<'all' | 'feasts_only'>('all');
  const [showEarthEvents, setShowEarthEvents] = useState(false);
  const [earthEvents, setEarthEvents] = useState<EarthEvent[]>([]);
  
  // Unified events state - synced with Alerts and Patterns pages
  const [unifiedEvents, setUnifiedEvents] = useState<UnifiedEvent[]>([]);
  const [unifiedStats, setUnifiedStats] = useState({
    total: 0,
    celestial: 0,
    terrestrial: 0,
    critical: 0,
    high: 0,
    earthquakes: 0,
    geomagnetic: 0,
    solarFlares: 0,
    feastAligned: 0,
    highFeastCorrelation: 0,
    upcoming7Days: 0,
    avgConfidence: 0
  });

  // Calculate feast correlations for all events
  const feastCorrelations = useMemo(() => {
    return filterEventsWithFeastCorrelations(upcomingEvents, 3, 0);
  }, [upcomingEvents]);
  
  // Calculate Earth event feast correlations
  const earthFeastCorrelations = useMemo(() => {
    return filterEventsWithFeastCorrelations(earthEvents, 3, 0);
  }, [earthEvents]);

  // Generate stable random star positions only once using ref to avoid hydration mismatch
  const starPositionsRef = useRef<Array<{top: number, left: number, delay: number}> | null>(null);
  if (starPositionsRef.current === null) {
    starPositionsRef.current = Array.from({ length: 10 }, () => ({
      top: Math.random() * 100,
      left: Math.random() * 100,
      delay: Math.random() * 3
    }));
  }
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load celestial events and start AI monitoring on mount
  useEffect(() => {
    const loadEvents = () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 90); // Include past 90 days
      const endDate = new Date();
      endDate.setFullYear(endDate.getFullYear() + 5); // Load 5 years of future data
      
      // Load unified events (synchronizes with Alerts and Patterns pages)
      const unified = getAllUnifiedEvents(startDate, endDate, {
        includePredictions: true,
        includeFeastCorrelations: true,
        minFeastCorrelationScore: 0
      });
      setUnifiedEvents(unified);
      
      // Calculate unified statistics
      const stats = getUnifiedEventStats(unified);
      setUnifiedStats(stats);
      
      // Still load celestial events separately for compatibility with existing code
      const events = getAllCelestialEvents(startDate, endDate);
      
      // Enhance events with feast correlations
      const enhancedEvents = events.map(event => {
        const feastProximity = getFeastProximity(event.eventDate, 3);
        if (feastProximity) {
          const correlation = checkCelestialFeastCorrelation(event, 3);
          return {
            ...event,
            feastProximity,
            feastCorrelationScore: correlation?.correlationScore,
            coincidesWithFeastName: feastProximity.feast.name,
            hebrewDate: `${getHebrewYear(event.eventDate.getFullYear())}`
          };
        }
        return event;
      });
      
      setUpcomingEvents(enhancedEvents);
      
      // Load Earth events
      const earthEventsData = getAllEarthEvents(startDate, endDate);
      setEarthEvents(earthEventsData);
      
      // Generate AI predictions for all events
      const predictionMap = new Map<string, EventPrediction>();
      enhancedEvents.forEach(event => {
        const prediction = eventPredictor.predict(event);
        predictionMap.set(event.id, prediction);
      });
      setPredictions(predictionMap);
      
      // Start AI monitoring
      monitoringEngine.startMonitoring(enhancedEvents);
      setAiMonitoring(true);
      
      showToast.success('🤖 AI Prediction Engine: ACTIVE');
      
      // Show toast about feast correlations if any found
      const feastCount = enhancedEvents.filter(e => e.feastProximity).length;
      if (feastCount > 0) {
        showToast.success(`✡️ ${feastCount} events correlate with Hebrew feasts`);
      }
    };

    loadEvents();
    
    // Cleanup: stop monitoring when component unmounts
    return () => {
      monitoringEngine.stopMonitoring();
    };
  }, []);

  // No legacy events needed - using real calculated data from celestialCalculations.ts
  // All events come from: eclipses, conjunctions, NEOs, and comets
  
  // Calculate time remaining for each event
  const getTimeRemaining = (eventDate: Date) => {
    return formatTimeRemaining(eventDate);
  };

  // Filter events based on selected filters
  const filteredEvents = upcomingEvents.filter(event => {
    const now = new Date();
    const eventDate = event.eventDate;
    const daysDiff = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    
    // Time filter
    let passesTimeFilter = true;
    if (timeFilter === '7days') passesTimeFilter = daysDiff <= 7 && daysDiff >= 0;
    if (timeFilter === '30days') passesTimeFilter = daysDiff <= 30 && daysDiff >= 0;
    if (timeFilter === '1year') passesTimeFilter = daysDiff <= 365 && daysDiff >= 0;
    
    // Significance filter
    const passesSignificanceFilter = significanceFilter === 'all' || event.propheticSignificance === significanceFilter;
    
    // Feast filter
    const passesFeastFilter = feastFilter === 'all' || (feastFilter === 'feasts_only' && event.feastProximity);
    
    return passesTimeFilter && passesSignificanceFilter && passesFeastFilter;
  });

  // Get events in next 7 days for urgent panel
  const urgentEvents = upcomingEvents.filter(event => {
    const now = new Date();
    const daysDiff = (event.eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff <= 7 && daysDiff >= 0;
  }).sort((a, b) => a.eventDate.getTime() - b.eventDate.getTime());

  // Statistics
  const stats = {
    totalEvents: upcomingEvents.length,
    urgentEvents: urgentEvents.length,
    criticalEvents: upcomingEvents.filter(e => e.propheticSignificance === 'critical').length,
    bloodMoons: upcomingEvents.filter(e => e.isBloodMoon || e.eventType === 'blood_moon').length,
    feastCorrelations: feastCorrelations.length,
    highFeastCorrelations: feastCorrelations.filter(c => c.significance === 'critical' || c.significance === 'high').length
  };

  // Get event type badge color
  const getEventTypeBadge = (type: CelestialEvent['eventType']) => {
    switch (type) {
      case 'blood_moon':
        return <Badge color="red" className="bg-red-500/10 text-red-400 ring-red-500/20">Blood Moon</Badge>;
      case 'eclipse':
        return <Badge color="purple" className="bg-purple-500/10 text-purple-400 ring-purple-500/20">Eclipse</Badge>;
      case 'conjunction':
        return <Badge color="cyan" className="bg-cyan-500/10 text-cyan-400 ring-cyan-500/20">Conjunction</Badge>;
      case 'neo_approach':
        return <Badge color="yellow" className="bg-yellow-500/10 text-yellow-400 ring-yellow-500/20">NEO Approach</Badge>;
      case 'comet_perihelion':
        return <Badge color="blue" className="bg-blue-500/10 text-blue-400 ring-blue-500/20">Comet</Badge>;
      default:
        return <Badge color="zinc" className="bg-zinc-500/10 text-zinc-400 ring-zinc-500/20">Unknown</Badge>;
    }
  };

  // Get significance badge
  const getSignificanceBadge = (significance: CelestialEvent['propheticSignificance']) => {
    switch (significance) {
      case 'critical':
        return <Badge color="red" className="bg-red-500/10 text-red-400 ring-red-500/20">Critical</Badge>;
      case 'high':
        return <Badge color="purple" className="bg-purple-500/10 text-purple-400 ring-purple-500/20">High</Badge>;
      case 'medium':
        return <Badge color="blue" className="bg-blue-500/10 text-blue-400 ring-blue-500/20">Medium</Badge>;
      case 'low':
        return <Badge color="zinc" className="bg-zinc-500/10 text-zinc-400 ring-zinc-500/20">Low</Badge>;
    }
  };

  // Get feast correlation badge and icon
  const getFeastBadge = (event: CelestialEvent) => {
    if (!event.feastProximity) return null;
    
    const { feast, proximityDays, isDirectMatch } = event.feastProximity;
    const score = event.feastCorrelationScore || 0;
    
    let badgeColor: 'red' | 'orange' | 'yellow' | 'blue' = 'blue';
    if (score >= 85) badgeColor = 'red';
    else if (score >= 70) badgeColor = 'orange';
    else if (score >= 50) badgeColor = 'yellow';
    
    return (
      <div className="flex items-center gap-1">
        <StarIconSolid className="w-4 h-4 text-blue-400 drop-shadow-[0_0_6px_rgba(96,165,250,0.8)]" title="Hebrew Feast Correlation" />
        <Badge color={badgeColor} className={`bg-${badgeColor}-500/10 text-${badgeColor}-400 ring-${badgeColor}-500/20 text-xs`}>
          {isDirectMatch ? '✡️ ' : '~'}{feast.hebrewName}
          {proximityDays > 0 && ` (±${proximityDays}d)`}
        </Badge>
      </div>
    );
  };

  return (
    <MainLayout title="Watchman's View" subtitle="Monitor celestial events and prophetic signs in the heavens">
      {/* Celestial Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-linear-to-b from-slate-950 via-slate-900 to-slate-950" />
        
        {/* Radial gradient overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-purple-600/30 via-blue-600/20 to-transparent" />
        
        {/* Animated stars - only render on client to prevent hydration mismatch */}
        {isClient && starPositionsRef.current && (
          <div className="absolute inset-0">
            {starPositionsRef.current.map((star, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-white animate-twinkle"
                style={{
                  width: '3px',
                  height: '3px',
                  top: `${star.top}%`,
                  left: `${star.left}%`,
                  opacity: 0.9,
                  animationDelay: `${star.delay}s`,
                  boxShadow: '0 0 6px 2px rgba(255,255,255,0.8), 0 0 12px 4px rgba(147,51,234,0.4)',
                  background: 'radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(147,197,253,0.8) 50%, transparent 100%)'
                }}
              />
            ))}
          </div>
        )}
        
        {/* Nebula clouds */}
        <div className="absolute top-20 left-10 w-[600px] h-[600px] bg-blue-500/30 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-20 right-10 w-[700px] h-[700px] bg-purple-500/30 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '10s' }} />
        <div className="absolute top-1/2 left-1/3 w-[500px] h-[500px] bg-indigo-500/25 rounded-full blur-[100px]" />
        
        {/* Shooting stars */}
        <div className="absolute left-1/4 top-1/4 h-1 w-24 animate-shooting-star bg-linear-to-r from-transparent via-white to-transparent opacity-0 shadow-[0_0_10px_rgba(255,255,255,0.8)]" style={{ animationDelay: '2s' }} />
        <div className="absolute right-1/3 top-1/3 h-1 w-20 animate-shooting-star bg-linear-to-r from-transparent via-white to-transparent opacity-0 shadow-[0_0_10px_rgba(255,255,255,0.8)]" style={{ animationDelay: '5s' }} />
        <div className="absolute left-1/2 top-1/2 h-1 w-28 animate-shooting-star bg-linear-to-r from-transparent via-cyan-200 to-transparent opacity-0 shadow-[0_0_10px_rgba(0,255,255,0.6)]" style={{ animationDelay: '7s' }} />
      </div>

      <div className="relative space-y-6">
        {/* Header Actions */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-end gap-3"
        >
          <Button 
            color={showAiInsights ? 'cyan' : 'zinc'}
            onClick={() => setShowAiInsights(!showAiInsights)}
            className="backdrop-blur-xl"
          >
            <CpuChipIcon className="w-4 h-4 mr-2" />
            {showAiInsights ? 'Hide' : 'Show'} AI Insights
          </Button>
          <Link href="/prophecy-enhanced">
            <Button color="zinc" className="backdrop-blur-xl">
              Prophecy Codex
            </Button>
          </Link>
          <Link href="/solar-system">
            <Button color="cyan" className="backdrop-blur-xl">
              <GlobeAltIcon className="w-4 h-4 mr-2" />
              View in 3D
            </Button>
          </Link>
        </motion.div>

        {/* AI Insights Panel */}
        {showAiInsights && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="overflow-hidden border-purple-500/30 bg-linear-to-br from-purple-900/20 to-cyan-900/20 backdrop-blur-xl shadow-2xl shadow-purple-500/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CpuChipIcon className="w-8 h-8 text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
                    <div>
                      <CardTitle className="text-2xl font-bold bg-linear-to-r from-purple-300 via-cyan-300 to-blue-300 bg-clip-text text-transparent">
                        AI Prediction Engine
                      </CardTitle>
                      <CardDescription className="text-gray-300">
                        Machine Learning Analysis • Pattern Recognition • Anomaly Detection
                      </CardDescription>
                    </div>
                  </div>
                  <Badge color={aiMonitoring ? 'green' : 'zinc'} className="backdrop-blur-xl">
                    {aiMonitoring ? 'ACTIVE' : 'INACTIVE'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <motion.div 
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-800 backdrop-blur-sm hover:border-yellow-500/50 transition-all"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <LightBulbIcon className="w-5 h-5 text-yellow-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.8)]" />
                      <p className="text-sm font-medium text-gray-200">Confidence Score</p>
                    </div>
                    <p className="text-2xl font-bold text-yellow-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]">
                      {(Array.from(predictions.values()).reduce((sum, p) => sum + p.confidenceScore, 0) / Math.max(predictions.size, 1) * 100).toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Average across all predictions</p>
                  </motion.div>
                  
                  <motion.div 
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-800 backdrop-blur-sm hover:border-red-500/50 transition-all"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <ExclamationTriangleIcon className="w-5 h-5 text-red-400 drop-shadow-[0_0_6px_rgba(248,113,113,0.8)]" />
                      <p className="text-sm font-medium text-gray-200">High Priority</p>
                    </div>
                    <p className="text-2xl font-bold text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.6)]">
                      {Array.from(predictions.values()).filter(p => 
                        p.predictedSignificance === 'critical' || p.predictedSignificance === 'high'
                      ).length}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Critical/High significance events</p>
                  </motion.div>
                  
                  <motion.div 
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-800 backdrop-blur-sm hover:border-purple-500/50 transition-all"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <SparklesIcon className="w-5 h-5 text-purple-400 drop-shadow-[0_0_6px_rgba(192,132,252,0.8)]" />
                      <p className="text-sm font-medium text-gray-200">Anomalies Detected</p>
                    </div>
                    <p className="text-2xl font-bold text-purple-400 drop-shadow-[0_0_8px_rgba(192,132,252,0.6)]">
                      {Array.from(predictions.values()).filter(p => p.anomalyScore > 0.7).length}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Unusual patterns requiring review</p>
                  </motion.div>
                </div>
                
                <div className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-800 backdrop-blur-sm">
                  <p className="text-sm font-medium text-gray-200 mb-2">🤖 AI Capabilities Active:</p>
                  <ul className="text-xs text-gray-300 space-y-1">
                    <li>✓ Real-time significance prediction (Bayesian inference)</li>
                    <li>✓ Historical pattern matching (cosine similarity)</li>
                    <li>✓ Prophecy correlation analysis (NLP + semantic matching)</li>
                    <li>✓ Statistical anomaly detection (2σ deviation threshold)</li>
                    <li>✓ Continuous learning from user feedback</li>
                    <li>✓ Automated alert generation (confidence-weighted)</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ML Predictions Panel - Always Visible */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <MLPredictionsPanel autoRefresh={true} refreshInterval={300000} />
        </motion.div>

        {/* Statistics Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-5 gap-4"
        >
          <Card className="bg-linear-to-br from-zinc-900/90 to-zinc-950/90 border-zinc-800/50 backdrop-blur-xl hover:border-cyan-500/50 transition-all shadow-xl group">
            <div className="absolute inset-0 bg-linear-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">All Events</CardTitle>
                <CalendarIcon className="w-6 h-6 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
              </div>
              <CardDescription className="text-gray-300">
                Total tracked events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-blue-400 drop-shadow-[0_0_12px_rgba(59,130,246,0.6)]">{stats.totalEvents}</p>
            </CardContent>
          </Card>

          <Card className="bg-linear-to-br from-zinc-900/90 to-zinc-950/90 border-zinc-800/50 backdrop-blur-xl hover:border-yellow-500/50 transition-all shadow-xl group relative">
            <div className="absolute inset-0 bg-linear-to-br from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Next 7 Days</CardTitle>
                <ClockIcon className="w-6 h-6 text-yellow-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
              </div>
              <CardDescription className="text-gray-300">
                Imminent events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-yellow-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]">{stats.urgentEvents}</p>
            </CardContent>
          </Card>

          <Card className="bg-linear-to-br from-zinc-900/90 to-zinc-950/90 border-zinc-800/50 backdrop-blur-xl hover:border-red-500/50 transition-all shadow-xl group relative">
            <div className="absolute inset-0 bg-linear-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Critical</CardTitle>
                <ExclamationTriangleIcon className="w-6 h-6 text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.8)]" />
              </div>
              <CardDescription className="text-gray-300">
                High significance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-red-400 drop-shadow-[0_0_12px_rgba(248,113,113,0.6)]">{stats.criticalEvents}</p>
            </CardContent>
          </Card>

          <Card className="bg-linear-to-br from-zinc-900/90 to-zinc-950/90 border-zinc-800/50 backdrop-blur-xl hover:border-red-500/50 transition-all shadow-xl group relative">
            <div className="absolute inset-0 bg-linear-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Blood Moons</CardTitle>
                <SparklesIcon className="w-6 h-6 text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.8)]" />
              </div>
              <CardDescription className="text-gray-300">
                Joel 2:31 signs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-red-400 drop-shadow-[0_0_12px_rgba(248,113,113,0.6)]">{stats.bloodMoons}</p>
            </CardContent>
          </Card>

          <Card className="bg-linear-to-br from-zinc-900/90 to-zinc-950/90 border-zinc-800/50 backdrop-blur-xl hover:border-blue-500/50 transition-all shadow-xl group relative">
            <div className="absolute inset-0 bg-linear-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-1">
                  <StarIconSolid className="w-4 h-4 text-blue-400" />
                  Feasts
                </CardTitle>
                <CalendarIcon className="w-6 h-6 text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
              </div>
              <CardDescription className="text-gray-300">
                Hebrew calendar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-blue-400 drop-shadow-[0_0_12px_rgba(96,165,250,0.6)]">{stats.feastCorrelations}</p>
              {stats.highFeastCorrelations > 0 && (
                <p className="text-xs text-orange-400 mt-1">✡️ {stats.highFeastCorrelations} high significance</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Urgent Events Panel (Next 7 Days) */}
        {urgentEvents.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="bg-linear-to-br from-yellow-900/20 to-zinc-900/90 border-2 border-yellow-500/20 backdrop-blur-xl shadow-2xl shadow-yellow-500/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-2xl font-bold bg-linear-to-r from-yellow-300 via-orange-300 to-red-300 bg-clip-text text-transparent">
                      <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                      Urgent: Events in Next 7 Days
                    </CardTitle>
                    <CardDescription className="text-gray-300">
                      Watch and pray - these events are imminent
                    </CardDescription>
                  </div>
                  <Badge color="yellow" className="bg-yellow-500/10 text-yellow-400 ring-yellow-500/20 backdrop-blur-xl">
                    {urgentEvents.length} Events
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {urgentEvents.map(event => (
                  <div key={event.id} className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-semibold text-white">{event.title}</h3>
                          {getEventTypeBadge(event.eventType)}
                          {getSignificanceBadge(event.propheticSignificance)}
                          {getFeastBadge(event)}
                        </div>
                        <p className="text-gray-300 text-sm">{event.description}</p>
                        {event.feastProximity && (
                          <div className="mt-2 text-xs text-blue-300 bg-blue-950/30 p-2 rounded border border-blue-900/30">
                            ✡️ <span className="font-semibold">{event.feastProximity.feast.name}</span>: {event.feastProximity.feast.description}
                          </div>
                        )}
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-2xl font-bold text-yellow-400">
                          {getTimeRemaining(event.eventDate)}
                        </div>
                        <div className="text-xs text-gray-400">remaining</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-sm">
                      <div className="text-gray-400">
                        <span className="text-gray-300">Date:</span>{' '}
                        {event.eventDate.toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                      <div className="text-gray-400">
                        <span className="text-gray-300">Visibility:</span>{' '}
                        {event.visibilityRegions.join(', ')}
                      </div>
                      {event.linkedProphecies.length > 0 && (
                        <div className="text-cyan-300">
                          📜 {event.linkedProphecies.join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
        )}

        {/* Filters Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2 
            className="mb-4 bg-linear-to-r from-cyan-300 via-blue-300 to-purple-300 bg-clip-text text-3xl font-bold text-transparent"
            style={{
              textShadow: '0 0 40px rgba(34,211,238,0.4), 0 0 20px rgba(147,51,234,0.3), 0 2px 10px rgba(0,0,0,0.8)'
            }}
          >
            Filter Events
          </h2>
          <Card className="bg-linear-to-br from-zinc-900/90 to-zinc-950/90 border-zinc-800/50 backdrop-blur-xl shadow-xl">
            <CardContent className="pt-6">
              <div className="flex flex-wrap items-center gap-4">
                <div>
                  <label className="text-gray-200 text-sm font-medium block mb-2">Time Range</label>
                  <div className="flex gap-2">
                    <Button
                      color={timeFilter === '7days' ? 'cyan' : 'zinc'}
                      onClick={() => setTimeFilter('7days')}
                      className="backdrop-blur-xl"
                    >
                      7 Days
                    </Button>
                    <Button
                      color={timeFilter === '30days' ? 'cyan' : 'zinc'}
                      onClick={() => setTimeFilter('30days')}
                      className="backdrop-blur-xl"
                    >
                      30 Days
                    </Button>
                    <Button
                      color={timeFilter === '1year' ? 'cyan' : 'zinc'}
                      onClick={() => setTimeFilter('1year')}
                      className="backdrop-blur-xl"
                    >
                      1 Year
                    </Button>
                    <Button
                      color={timeFilter === 'all' ? 'cyan' : 'zinc'}
                      onClick={() => setTimeFilter('all')}
                      className="backdrop-blur-xl"
                    >
                      All
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-gray-200 text-sm font-medium block mb-2">Significance</label>
                  <div className="flex gap-2">
                    <Button
                      color={significanceFilter === 'all' ? 'cyan' : 'zinc'}
                      onClick={() => setSignificanceFilter('all')}
                      className="backdrop-blur-xl"
                    >
                      All
                    </Button>
                    <Button
                      color={significanceFilter === 'critical' ? 'red' : 'zinc'}
                      onClick={() => setSignificanceFilter('critical')}
                      className="backdrop-blur-xl"
                    >
                    Critical
                  </Button>
                  <Button
                    color={significanceFilter === 'high' ? 'purple' : 'zinc'}
                    onClick={() => setSignificanceFilter('high')}
                    className="backdrop-blur-xl"
                  >
                    High
                  </Button>
                  <Button
                    color={significanceFilter === 'medium' ? 'blue' : 'zinc'}
                    onClick={() => setSignificanceFilter('medium')}
                    className="backdrop-blur-xl"
                  >
                    Medium
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-gray-200 text-sm font-medium block mb-2">
                  <StarIconSolid className="w-4 h-4 text-blue-400 inline mr-1" />
                  Hebrew Feasts
                </label>
                <div className="flex gap-2">
                  <Button
                    color={feastFilter === 'all' ? 'cyan' : 'zinc'}
                    onClick={() => setFeastFilter('all')}
                    className="backdrop-blur-xl"
                  >
                    All Events
                  </Button>
                  <Button
                    color={feastFilter === 'feasts_only' ? 'blue' : 'zinc'}
                    onClick={() => setFeastFilter('feasts_only')}
                    className="backdrop-blur-xl"
                  >
                    ✡️ Feast Days Only
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        </motion.div>

        {/* All Events Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2 
            className="mb-4 bg-linear-to-r from-cyan-300 via-blue-300 to-purple-300 bg-clip-text text-3xl font-bold text-transparent"
            style={{
              textShadow: '0 0 40px rgba(34,211,238,0.4), 0 0 20px rgba(147,51,234,0.3), 0 2px 10px rgba(0,0,0,0.8)'
            }}
          >
            All Celestial Events
          </h2>
          <Card className="bg-linear-to-br from-zinc-900/90 to-zinc-950/90 border-zinc-800/50 backdrop-blur-xl shadow-xl">
            <CardHeader>
              <CardDescription className="text-gray-300 text-lg">
                {filteredEvents.length} events match your filters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHead>
                    <TableRow className="border-zinc-800/50">
                      <TableHeader className="text-cyan-300 font-semibold">Event</TableHeader>
                      <TableHeader className="text-cyan-300 font-semibold">Type</TableHeader>
                      <TableHeader className="text-cyan-300 font-semibold">Date & Time</TableHeader>
                      <TableHeader className="text-cyan-300 font-semibold">Countdown</TableHeader>
                      <TableHeader className="text-cyan-300 font-semibold">Significance</TableHeader>
                      <TableHeader className="text-cyan-300 font-semibold">
                        <StarIconSolid className="w-4 h-4 inline mr-1" />
                        Feast Correlation
                      </TableHeader>
                      <TableHeader className="text-cyan-300 font-semibold">🤖 AI Prediction</TableHeader>
                      <TableHeader className="text-cyan-300 font-semibold">Prophecies</TableHeader>
                      <TableHeader className="text-cyan-300 font-semibold">Actions</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredEvents.map((event, index) => (
                  <TableRow 
                    key={event.id} 
                    className="border-zinc-800/50 hover:bg-zinc-800/30 transition-colors backdrop-blur-sm"
                    style={{
                      animation: `fadeIn 0.3s ease-out ${index * 0.05}s both`
                    }}
                  >
                    <TableCell className="font-medium text-white">
                      {event.title}
                      <div className="text-xs text-gray-400 mt-1">
                        {event.celestialObjects.join(' • ')}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getEventTypeBadge(event.eventType)}
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {event.eventDate.toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                      <div className="text-xs text-gray-400 mt-1">
                        {event.durationMinutes}min
                      </div>
                    </TableCell>
                    <TableCell className="text-cyan-400 font-semibold">
                      {getTimeRemaining(event.eventDate)}
                    </TableCell>
                    <TableCell>
                      {getSignificanceBadge(event.propheticSignificance)}
                    </TableCell>
                    <TableCell>
                      {event.feastProximity ? (
                        <div className="space-y-1">
                          {getFeastBadge(event)}
                          <div className="text-xs text-gray-400">
                            Score: <span className="text-blue-400 font-semibold">{event.feastCorrelationScore || 0}</span>/100
                          </div>
                          {event.feastProximity.feast.significance === 'high' && (
                            <div className="text-xs text-orange-400">
                              📜 {event.feastProximity.feast.biblicalReference}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const prediction = predictions.get(event.id);
                        if (!prediction) return <span className="text-gray-500 text-xs">Analyzing...</span>;
                        
                        return (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              {getSignificanceBadge(prediction.predictedSignificance)}
                              <span className="text-xs text-purple-400 font-semibold">
                                {(prediction.confidenceScore * 100).toFixed(0)}%
                              </span>
                            </div>
                            {prediction.anomalyScore > 0.7 && (
                              <Badge color="purple" className="text-xs bg-purple-500/10 text-purple-400 ring-purple-500/20">
                                ⚠️ Anomaly
                              </Badge>
                            )}
                            <div className="text-xs text-gray-400">
                              {prediction.historicalPrecedents.length} precedents
                            </div>
                          </div>
                        );
                      })()}
                    </TableCell>
                    <TableCell>
                      {event.linkedProphecies.length > 0 ? (
                        <div className="space-y-1">
                          {event.linkedProphecies.map(prophecy => (
                            <code key={prophecy} className="text-xs bg-zinc-800 px-2 py-1 rounded text-cyan-300 block">
                              {prophecy}
                            </code>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm">None</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Link href={`/solar-system?eventId=${event.id}&date=${event.eventDate.toISOString()}`}>
                        <Button color="cyan" className="text-xs backdrop-blur-xl hover:scale-105 transition-transform">
                          <EyeIcon className="w-3 h-3 mr-1" />
                          View in 3D
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredEvents.length === 0 && (
              <div className="text-center py-12">
                <CalendarIcon className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 text-lg">No events match your current filters</p>
                <p className="text-gray-500 text-sm mt-2">Try adjusting your time range or significance filters</p>
              </div>
            )}
          </div>
          </CardContent>
        </Card>
        </motion.div>

        {/* Earth Events Dashboard Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
        <Card className="backdrop-blur-xl bg-zinc-900/60 border-zinc-800 shadow-2xl shadow-cyan-500/5 overflow-hidden">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 via-red-500 to-yellow-500">
                  🌍 Earth Events Dashboard
                </CardTitle>
                <CardDescription className="text-zinc-400 mt-1">
                  Monitor significant Earth events with Hebrew feast correlations
                </CardDescription>
              </div>
              <Button
                onClick={() => setShowEarthEvents(!showEarthEvents)}
                color={showEarthEvents ? 'orange' : 'zinc'}
                className="backdrop-blur-xl"
              >
                {showEarthEvents ? '👁️ Hide Events' : '🌎 Show Events'}
              </Button>
            </div>
          </CardHeader>

          {showEarthEvents && (
            <CardContent className="space-y-6">
              {/* Earth Events Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Total Events */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-br from-red-950/40 to-orange-950/40 backdrop-blur-xl border border-red-900/30 rounded-xl p-4 hover:border-red-500/50 transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-red-300 text-sm font-medium">Total Events</span>
                    <GlobeAltIcon className="w-5 h-5 text-red-400" />
                  </div>
                  <div className="text-3xl font-bold text-red-200">
                    {unifiedStats.terrestrial}
                  </div>
                  <p className="text-xs text-red-400/60 mt-1">All terrestrial events</p>
                </motion.div>

                {/* Earthquakes */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-br from-yellow-950/40 to-orange-950/40 backdrop-blur-xl border border-yellow-900/30 rounded-xl p-4 hover:border-yellow-500/50 transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-yellow-300 text-sm font-medium">Earthquakes</span>
                    <span className="text-2xl">🌋</span>
                  </div>
                  <div className="text-3xl font-bold text-yellow-200">
                    {unifiedStats.earthquakes}
                  </div>
                  <p className="text-xs text-yellow-400/60 mt-1">Magnitude 5.0+</p>
                </motion.div>

                {/* Solar/Geomagnetic */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-br from-purple-950/40 to-pink-950/40 backdrop-blur-xl border border-purple-900/30 rounded-xl p-4 hover:border-purple-500/50 transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-purple-300 text-sm font-medium">Solar Events</span>
                    <span className="text-2xl">☀️</span>
                  </div>
                  <div className="text-3xl font-bold text-purple-200">
                    {unifiedStats.geomagnetic + unifiedStats.solarFlares}
                  </div>
                  <p className="text-xs text-purple-400/60 mt-1">Flares & storms</p>
                </motion.div>

                {/* Feast Correlations */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-br from-blue-950/40 to-cyan-950/40 backdrop-blur-xl border border-blue-900/30 rounded-xl p-4 hover:border-blue-500/50 transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-blue-300 text-sm font-medium">Feast Days</span>
                    <StarIconSolid className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="text-3xl font-bold text-blue-200">
                    {unifiedEvents.filter(e => e.type === 'terrestrial' && e.feastCorrelation).length}
                  </div>
                  <p className="text-xs text-blue-400/60 mt-1">
                    ✡️ {unifiedEvents.filter(e => e.type === 'terrestrial' && e.feastCorrelation && (e.feastCorrelation.significance === 'critical' || e.feastCorrelation.significance === 'high')).length} high significance
                  </p>
                </motion.div>
              </div>

              {/* Earth Events Table */}
              <div className="overflow-x-auto">
                <h3 className="text-lg font-semibold text-orange-300 mb-4 flex items-center gap-2">
                  <GlobeAltIcon className="w-5 h-5" />
                  Recent Earth Events (Synced with Alerts & Patterns)
                </h3>

                <Table className="w-full">
                  <TableHead>
                    <TableRow>
                      <TableHeader>Date</TableHeader>
                      <TableHeader>Event Type</TableHeader>
                      <TableHeader>Location</TableHeader>
                      <TableHeader>Magnitude/Intensity</TableHeader>
                      <TableHeader>Severity</TableHeader>
                      <TableHeader>AI Confidence</TableHeader>
                      <TableHeader>
                        <div className="flex items-center gap-1">
                          <StarIconSolid className="w-4 h-4 mr-1 inline" />
                          Feast Correlation
                        </div>
                      </TableHeader>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {unifiedEvents
                      .filter(e => e.type === 'terrestrial')
                      .slice(0, 15)
                      .map((event, index) => {
                      return (
                        <TableRow key={event.id || index}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <CalendarIcon className="w-4 h-4 text-gray-400" />
                              <span className="text-sm">{event.date.toLocaleDateString()}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              color={
                                event.earthEventType === 'earthquake' ? 'yellow' :
                                event.earthEventType === 'volcanic' ? 'orange' :
                                event.earthEventType === 'geomagnetic' ? 'purple' :
                                event.earthEventType === 'solar_flare' ? 'red' : 'blue'
                              }
                              className="text-xs"
                            >
                              {event.earthEventType === 'earthquake' ? '🌋 Earthquake' :
                               event.earthEventType === 'volcanic' ? '🌋 Volcanic' :
                               event.earthEventType === 'geomagnetic' ? '🌌 Geomagnetic' :
                               event.earthEventType === 'solar_flare' ? '☀️ Solar Flare' :
                               event.earthEventType === 'meteor' ? '☄️ Meteor' : event.earthEventType}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-300">{event.location}</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-orange-300">
                                {event.magnitude?.toFixed(1) || 'N/A'}
                              </span>
                              {event.magnitude && (
                                <span className="text-xs text-gray-400">
                                  {event.earthEventType === 'earthquake' ? 'M' :
                                   event.earthEventType === 'geomagnetic' ? 'Kp' :
                                   event.earthEventType === 'solar_flare' ? 'X-class' : ''}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              color={
                                event.severity === 'critical' ? 'red' :
                                event.severity === 'high' ? 'orange' :
                                event.severity === 'medium' ? 'yellow' : 'blue'
                              }
                              className="text-xs"
                            >
                              {(event.severity || event.significance).toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {event.aiPrediction && (
                              <div className="flex items-center gap-2">
                                <div className="w-16 bg-zinc-800 rounded-full h-2">
                                  <div 
                                    className={`h-2 rounded-full ${
                                      event.aiPrediction.confidenceScore >= 0.9 ? 'bg-green-500' :
                                      event.aiPrediction.confidenceScore >= 0.7 ? 'bg-blue-500' :
                                      event.aiPrediction.confidenceScore >= 0.5 ? 'bg-yellow-500' :
                                      'bg-red-500'
                                    }`}
                                    style={{ width: `${event.aiPrediction.confidenceScore * 100}%` }}
                                  />
                                </div>
                                <span className="text-xs text-gray-400">
                                  {(event.aiPrediction.confidenceScore * 100).toFixed(0)}%
                                </span>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {event.feastCorrelation ? (
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <StarIconSolid className="w-4 h-4 text-blue-400" />
                                  <Badge 
                                    color={
                                      event.feastCorrelation.score >= 85 ? 'red' :
                                      event.feastCorrelation.score >= 70 ? 'orange' :
                                      event.feastCorrelation.score >= 50 ? 'yellow' : 'blue'
                                    }
                                    className="text-xs"
                                  >
                                    ✡️ {event.feastCorrelation.feastName}
                                    {event.feastCorrelation.daysFromFeast > 0 && ` ±${event.feastCorrelation.daysFromFeast}d`}
                                  </Badge>
                                </div>
                                <div className="text-xs text-blue-400">
                                  Score: {event.feastCorrelation.score}/100
                                </div>
                                {(event.feastCorrelation.significance === 'critical' || event.feastCorrelation.significance === 'high') && (
                                  <div className="text-xs text-orange-400 font-semibold">
                                    ⚠️ High Significance
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-500 text-sm">-</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>

                {earthEvents.length === 0 && (
                  <div className="text-center py-12">
                    <GlobeAltIcon className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400 text-lg">No Earth events in the selected time range</p>
                    <p className="text-gray-500 text-sm mt-2">Check back later for updates</p>
                  </div>
                )}
              </div>

              {/* Feast Correlation Summary */}
              {earthFeastCorrelations.length > 0 && (
                <div className="bg-gradient-to-br from-blue-950/30 to-purple-950/30 backdrop-blur-xl border border-blue-900/30 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-blue-300 mb-4 flex items-center gap-2">
                    <StarIconSolid className="w-5 h-5" />
                    Earth Events on Hebrew Feast Days
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {earthFeastCorrelations
                      .filter(c => c.significance === 'critical' || c.significance === 'high')
                      .slice(0, 4)
                      .map((correlation, index) => {
                        // Type guard to check if event is EarthEvent
                        const earthEvent = correlation.event as EarthEvent;
                        const isEarthEvent = 'type' in earthEvent && 'location' in earthEvent;
                        
                        return (
                        <div 
                          key={index}
                          className="bg-black/30 rounded-lg p-4 border border-blue-900/20"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h4 className="text-sm font-semibold text-blue-200 mb-1">
                                {isEarthEvent && earthEvent.type === 'earthquake' ? '🌋' :
                                 isEarthEvent && earthEvent.type === 'volcanic' ? '🌋' :
                                 isEarthEvent && earthEvent.type === 'geomagnetic' ? '🌌' :
                                 isEarthEvent && earthEvent.type === 'solar_flare' ? '☀️' : '🌍'} {isEarthEvent ? earthEvent.location : 'Unknown'}
                              </h4>
                              <p className="text-xs text-gray-400">
                                {isEarthEvent && earthEvent.date ? earthEvent.date.toLocaleDateString() : 'Unknown date'} • Magnitude {isEarthEvent && earthEvent.magnitude ? earthEvent.magnitude.toFixed(1) : 'N/A'}
                              </p>
                            </div>
                            <Badge 
                              color={correlation.correlationScore >= 85 ? 'red' : 'orange'}
                              className="text-xs"
                            >
                              {correlation.correlationScore}/100
                            </Badge>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <StarIconSolid className="w-4 h-4 text-blue-400 shrink-0" />
                              <span className="text-sm text-blue-300">
                                ✡️ {correlation.feastProximity.feast.name} ({correlation.feastProximity.feast.hebrewName})
                              </span>
                            </div>
                            <p className="text-xs text-gray-400 leading-relaxed">
                              {correlation.analysis}
                            </p>
                          </div>
                        </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </CardContent>
          )}
        </Card>
        </motion.div>
      </div>
    </MainLayout>
  );
}
