'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Heading, 
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
import { CelestialEvent } from '@/lib/types/celestial';
import { 
  getAllCelestialEvents, 
  formatTimeRemaining 
} from '@/lib/utils/celestialCalculations';
import { eventPredictor, EventPrediction } from '@/lib/ai/eventPredictor';
import { monitoringEngine } from '@/lib/ai/realTimeMonitor';
import { showToast } from '@/lib/toast';
import { MainLayout } from '@/components/layout';

export default function WatchmansViewPage() {
  const [timeFilter, setTimeFilter] = useState<'7days' | '30days' | '1year' | 'all'>('7days');
  const [significanceFilter, setSignificanceFilter] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');
  const [upcomingEvents, setUpcomingEvents] = useState<CelestialEvent[]>([]);
  const [predictions, setPredictions] = useState<Map<string, EventPrediction>>(new Map());
  const [aiMonitoring, setAiMonitoring] = useState(false);
  const [showAiInsights, setShowAiInsights] = useState(false);

  // Load celestial events and start AI monitoring on mount
  useEffect(() => {
    const loadEvents = () => {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setFullYear(endDate.getFullYear() + 5); // Load 5 years of data
      
      const events = getAllCelestialEvents(startDate, endDate);
      setUpcomingEvents(events);
      
      // Generate AI predictions for all events
      const predictionMap = new Map<string, EventPrediction>();
      events.forEach(event => {
        const prediction = eventPredictor.predict(event);
        predictionMap.set(event.id, prediction);
      });
      setPredictions(predictionMap);
      
      // Start AI monitoring
      monitoringEngine.startMonitoring(events);
      setAiMonitoring(true);
      
      showToast.success('🤖 AI Prediction Engine: ACTIVE');
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
    
    return passesTimeFilter && passesSignificanceFilter;
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
    bloodMoons: upcomingEvents.filter(e => e.isBloodMoon || e.eventType === 'blood_moon').length
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

  return (
    <MainLayout title="Watchman's View" subtitle="Monitor celestial events and prophetic signs in the heavens">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex justify-end gap-3">
          <Button 
            color={showAiInsights ? 'cyan' : 'zinc'}
            onClick={() => setShowAiInsights(!showAiInsights)}
          >
            <CpuChipIcon className="w-4 h-4 mr-2" />
            {showAiInsights ? 'Hide' : 'Show'} AI Insights
          </Button>
          <Link href="/prophecy-enhanced">
            <Button color="zinc">
              Prophecy Codex
            </Button>
          </Link>
          <Link href="/solar-system">
            <Button color="cyan">
              <GlobeAltIcon className="w-4 h-4 mr-2" />
              View in 3D
            </Button>
          </Link>
        </div>

        {/* AI Insights Panel */}
        {showAiInsights && (
          <Card className="bg-linear-to-r from-purple-900/20 to-cyan-900/20 border-purple-500/30">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CpuChipIcon className="w-8 h-8 text-purple-400" />
                  <div>
                    <CardTitle className="text-white">AI Prediction Engine</CardTitle>
                    <CardDescription className="text-gray-300">
                      Machine Learning Analysis • Pattern Recognition • Anomaly Detection
                    </CardDescription>
                  </div>
                </div>
                <Badge color={aiMonitoring ? 'green' : 'zinc'}>
                  {aiMonitoring ? 'ACTIVE' : 'INACTIVE'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-800">
                  <div className="flex items-center gap-2 mb-2">
                    <LightBulbIcon className="w-5 h-5 text-yellow-400" />
                    <p className="text-sm font-medium text-gray-200">Confidence Score</p>
                  </div>
                  <p className="text-2xl font-bold text-yellow-400">
                    {Array.from(predictions.values()).reduce((sum, p) => sum + p.confidenceScore, 0) / Math.max(predictions.size, 1) * 100}%
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Average across all predictions</p>
                </div>
                
                <div className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-800">
                  <div className="flex items-center gap-2 mb-2">
                    <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />
                    <p className="text-sm font-medium text-gray-200">High Priority</p>
                  </div>
                  <p className="text-2xl font-bold text-red-400">
                    {Array.from(predictions.values()).filter(p => 
                      p.predictedSignificance === 'critical' || p.predictedSignificance === 'high'
                    ).length}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Critical/High significance events</p>
                </div>
                
                <div className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-800">
                  <div className="flex items-center gap-2 mb-2">
                    <SparklesIcon className="w-5 h-5 text-purple-400" />
                    <p className="text-sm font-medium text-gray-200">Anomalies Detected</p>
                  </div>
                  <p className="text-2xl font-bold text-purple-400">
                    {Array.from(predictions.values()).filter(p => p.anomalyScore > 0.7).length}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Unusual patterns requiring review</p>
                </div>
              </div>
              
              <div className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-800">
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
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">All Events</CardTitle>
                <CalendarIcon className="w-6 h-6 text-cyan-400" />
              </div>
              <CardDescription className="text-gray-300">
                Total tracked events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-blue-400">{stats.totalEvents}</p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Next 7 Days</CardTitle>
                <ClockIcon className="w-6 h-6 text-yellow-400" />
              </div>
              <CardDescription className="text-gray-300">
                Imminent events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-yellow-400">{stats.urgentEvents}</p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Critical</CardTitle>
                <ExclamationTriangleIcon className="w-6 h-6 text-red-400" />
              </div>
              <CardDescription className="text-gray-300">
                High significance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-red-400">{stats.criticalEvents}</p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Blood Moons</CardTitle>
                <SparklesIcon className="w-6 h-6 text-red-400" />
              </div>
              <CardDescription className="text-gray-300">
                Joel 2:31 signs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-red-400">{stats.bloodMoons}</p>
            </CardContent>
          </Card>
        </div>

        {/* Urgent Events Panel (Next 7 Days) */}
        {urgentEvents.length > 0 && (
          <Card className="bg-zinc-900 border-2 border-yellow-500/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white flex items-center gap-2">
                    <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400" />
                    Urgent: Events in Next 7 Days
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    Watch and pray - these events are imminent
                  </CardDescription>
                </div>
                <Badge color="yellow" className="bg-yellow-500/10 text-yellow-400 ring-yellow-500/20">
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
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-white">{event.title}</h3>
                          {getEventTypeBadge(event.eventType)}
                          {getSignificanceBadge(event.propheticSignificance)}
                        </div>
                        <p className="text-gray-300 text-sm">{event.description}</p>
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
        )}

        {/* Filters */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent>
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <label className="text-gray-200 text-sm block mb-2">Time Range</label>
                <div className="flex gap-2">
                  <Button
                    color={timeFilter === '7days' ? 'cyan' : 'zinc'}
                    onClick={() => setTimeFilter('7days')}
                  >
                    7 Days
                  </Button>
                  <Button
                    color={timeFilter === '30days' ? 'cyan' : 'zinc'}
                    onClick={() => setTimeFilter('30days')}
                  >
                    30 Days
                  </Button>
                  <Button
                    color={timeFilter === '1year' ? 'cyan' : 'zinc'}
                    onClick={() => setTimeFilter('1year')}
                  >
                    1 Year
                  </Button>
                  <Button
                    color={timeFilter === 'all' ? 'cyan' : 'zinc'}
                    onClick={() => setTimeFilter('all')}
                  >
                    All
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-gray-200 text-sm block mb-2">Significance</label>
                <div className="flex gap-2">
                  <Button
                    color={significanceFilter === 'all' ? 'cyan' : 'zinc'}
                    onClick={() => setSignificanceFilter('all')}
                  >
                    All
                  </Button>
                  <Button
                    color={significanceFilter === 'critical' ? 'red' : 'zinc'}
                    onClick={() => setSignificanceFilter('critical')}
                  >
                    Critical
                  </Button>
                  <Button
                    color={significanceFilter === 'high' ? 'purple' : 'zinc'}
                    onClick={() => setSignificanceFilter('high')}
                  >
                    High
                  </Button>
                  <Button
                    color={significanceFilter === 'medium' ? 'blue' : 'zinc'}
                    onClick={() => setSignificanceFilter('medium')}
                  >
                    Medium
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* All Events Table */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">All Celestial Events</CardTitle>
            <CardDescription className="text-gray-300">
              {filteredEvents.length} events match your filters
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader className="text-gray-300">Event</TableHeader>
                  <TableHeader className="text-gray-300">Type</TableHeader>
                  <TableHeader className="text-gray-300">Date & Time</TableHeader>
                  <TableHeader className="text-gray-300">Countdown</TableHeader>
                  <TableHeader className="text-gray-300">Significance</TableHeader>
                  <TableHeader className="text-gray-300">🤖 AI Prediction</TableHeader>
                  <TableHeader className="text-gray-300">Prophecies</TableHeader>
                  <TableHeader className="text-gray-300">Actions</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredEvents.map(event => (
                  <TableRow key={event.id} className="hover:bg-zinc-800/50">
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
                    <TableCell className="text-blue-400 font-semibold">
                      {getTimeRemaining(event.eventDate)}
                    </TableCell>
                    <TableCell>
                      {getSignificanceBadge(event.propheticSignificance)}
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const prediction = predictions.get(event.id);
                        if (!prediction) return <span className="text-gray-500 text-xs">Analyzing...</span>;
                        
                        return (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              {getSignificanceBadge(prediction.predictedSignificance)}
                              <span className="text-xs text-gray-400">
                                {(prediction.confidenceScore * 100).toFixed(0)}%
                              </span>
                            </div>
                            {prediction.anomalyScore > 0.7 && (
                              <Badge color="purple" className="text-xs">
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
                        <Button color="cyan" className="text-xs">
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
                <p className="text-gray-400">No events match your current filters</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
