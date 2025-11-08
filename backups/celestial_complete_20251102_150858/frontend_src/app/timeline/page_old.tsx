'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { MainLayout } from '@/components/layout';
import {
  CalendarIcon,
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  FunnelIcon,
  ClockIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { CelestialEvent } from '@/lib/types/celestial';
import { getAllCelestialEvents } from '@/lib/utils/celestialCalculations';

interface TimelineItem {
  id: string;
  date: Date;
  type: 'celestial' | 'prophecy' | 'correlation';
  title: string;
  description: string;
  significance: 'low' | 'medium' | 'high' | 'critical';
  eventType?: string;
  linkedIds?: string[];
}

export default function TimelineViewerPage() {
  const [events, setEvents] = useState<CelestialEvent[]>([]);
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);
  const [zoomLevel, setZoomLevel] = useState(2); // 1=years, 2=months, 3=weeks, 4=days
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filterType, setFilterType] = useState<'all' | 'celestial' | 'prophecy' | 'correlation'>('all');
  const [filterSignificance, setFilterSignificance] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');
  
  // Stable star positions for celestial background
  const [starPositions] = useState(() =>
    Array.from({ length: 20 }, () => ({
      top: Math.random() * 100,
      left: Math.random() * 100,
      size: Math.random() * 2 + 1,
      duration: Math.random() * 3 + 2,
    }))
  );
  
  const timelineRef = useRef<HTMLDivElement>(null);

  // Load events on mount
  useEffect(() => {
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 2); // 2 years in past
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 5); // 5 years in future
    
    const celestialEvents = getAllCelestialEvents(startDate, endDate);

    // Convert celestial events to timeline items
    const items: TimelineItem[] = celestialEvents.map(event => ({
      id: event.id,
      date: event.eventDate,
      type: 'celestial',
      title: event.title,
      description: event.description,
      significance: event.propheticSignificance,
      eventType: event.eventType,
      linkedIds: event.linkedProphecies
    }));

    // Add sample prophecy markers
    const prophecyMarkers: TimelineItem[] = [
      {
        id: 'prophecy-joel-2-31',
        date: new Date('2025-09-07'), // Blood moon date
        type: 'prophecy',
        title: 'Joel 2:31 - Blood Moon Prophecy',
        description: 'The sun shall be turned to darkness, and the moon to blood, before the great and awesome day of the Lord comes.',
        significance: 'critical',
        linkedIds: ['eclipse-0'] // Link to blood moon event
      },
      {
        id: 'prophecy-matt-24-29',
        date: new Date('2025-12-21'), // Conjunction date
        type: 'prophecy',
        title: 'Matthew 24:29 - Signs in the Heavens',
        description: 'Immediately after the tribulation of those days the sun will be darkened, and the moon will not give its light, and the stars will fall from heaven.',
        significance: 'high',
        linkedIds: ['conjunction-0']
      },
      {
        id: 'prophecy-rev-6-12',
        date: new Date('2027-08-17'), // Another blood moon
        type: 'prophecy',
        title: 'Revelation 6:12 - Sixth Seal',
        description: 'When he opened the sixth seal, I looked, and behold, there was a great earthquake, and the sun became black as sackcloth, the full moon became like blood.',
        significance: 'critical',
        linkedIds: []
      }
    ];

    // Batch state updates
    setEvents(celestialEvents);
    setTimelineItems([...items, ...prophecyMarkers].sort((a, b) => a.date.getTime() - b.date.getTime()));
  }, []);

  // Filter timeline items
  const filteredItems = timelineItems.filter(item => {
    const typeMatch = filterType === 'all' || item.type === filterType;
    const significanceMatch = filterSignificance === 'all' || item.significance === filterSignificance;
    return typeMatch && significanceMatch;
  });

  // Get zoom level label
  const getZoomLabel = () => {
    switch (zoomLevel) {
      case 1: return 'Years';
      case 2: return 'Months';
      case 3: return 'Weeks';
      case 4: return 'Days';
      default: return 'Months';
    }
  };

  // Navigate timeline
  const navigateTimeline = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    const amount = zoomLevel === 1 ? 12 : zoomLevel === 2 ? 3 : zoomLevel === 3 ? 4 : 7;
    
    if (direction === 'prev') {
      if (zoomLevel === 1) newDate.setFullYear(newDate.getFullYear() - 1);
      else if (zoomLevel === 2) newDate.setMonth(newDate.getMonth() - amount);
      else if (zoomLevel === 3) newDate.setDate(newDate.getDate() - amount * 7);
      else newDate.setDate(newDate.getDate() - amount);
    } else {
      if (zoomLevel === 1) newDate.setFullYear(newDate.getFullYear() + 1);
      else if (zoomLevel === 2) newDate.setMonth(newDate.getMonth() + amount);
      else if (zoomLevel === 3) newDate.setDate(newDate.getDate() + amount * 7);
      else newDate.setDate(newDate.getDate() + amount);
    }
    
    setCurrentDate(newDate);
  };

  // Get visible range based on zoom level
  const getVisibleRange = () => {
    const start = new Date(currentDate);
    const end = new Date(currentDate);
    
    if (zoomLevel === 1) {
      start.setFullYear(start.getFullYear() - 1);
      end.setFullYear(end.getFullYear() + 1);
    } else if (zoomLevel === 2) {
      start.setMonth(start.getMonth() - 6);
      end.setMonth(end.getMonth() + 6);
    } else if (zoomLevel === 3) {
      start.setDate(start.getDate() - 28);
      end.setDate(end.getDate() + 28);
    } else {
      start.setDate(start.getDate() - 14);
      end.setDate(end.getDate() + 14);
    }
    
    return { start, end };
  };

  const visibleRange = getVisibleRange();
  const visibleItems = filteredItems.filter(item => 
    item.date >= visibleRange.start && item.date <= visibleRange.end
  );

  // Get item position on timeline (0-100%)
  const getItemPosition = (date: Date) => {
    const total = visibleRange.end.getTime() - visibleRange.start.getTime();
    const offset = date.getTime() - visibleRange.start.getTime();
    return (offset / total) * 100;
  };

  // Get type icon
  const getTypeIcon = (type: TimelineItem['type']) => {
    switch (type) {
      case 'celestial':
        return '🌙';
      case 'prophecy':
        return '📜';
      case 'correlation':
        return '🔗';
    }
  };

  // Get significance badge
  const getSignificanceBadge = (significance: TimelineItem['significance']) => {
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
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Heading className="text-white">Timeline Viewer</Heading>
            <p className="text-gray-300 mt-1">
              Visualize celestial events and prophecies across time
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/watchmans-view">
              <Button color="zinc">
                Watchman&apos;s View
              </Button>
            </Link>
            <Link href="/prophecy-enhanced">
              <Button color="zinc">
                Prophecy Codex
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent>
              <div className="text-center py-4">
                <p className="text-4xl font-bold text-blue-400">{events.length}</p>
                <p className="text-gray-300 text-sm mt-1">Celestial Events</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent>
              <div className="text-center py-4">
                <p className="text-4xl font-bold text-purple-400">
                  {timelineItems.filter(i => i.type === 'prophecy').length}
                </p>
                <p className="text-gray-300 text-sm mt-1">Prophecy Markers</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent>
              <div className="text-center py-4">
                <p className="text-4xl font-bold text-red-400">
                  {timelineItems.filter(i => i.significance === 'critical').length}
                </p>
                <p className="text-gray-300 text-sm mt-1">Critical Events</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent>
              <div className="text-center py-4">
                <p className="text-4xl font-bold text-cyan-400">{visibleItems.length}</p>
                <p className="text-gray-300 text-sm mt-1">Visible Now</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Timeline Controls */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent>
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Navigation */}
              <div className="flex items-center gap-2">
                <Button color="cyan" onClick={() => navigateTimeline('prev')}>
                  <ArrowLeftIcon className="w-4 h-4" />
                </Button>
                <div className="px-4 py-2 bg-zinc-800 rounded-lg">
                  <p className="text-white font-semibold">
                    {currentDate.toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                <Button color="cyan" onClick={() => navigateTimeline('next')}>
                  <ArrowRightIcon className="w-4 h-4" />
                </Button>
                <Button 
                  color="zinc" 
                  onClick={() => setCurrentDate(new Date())}
                >
                  Today
                </Button>
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center gap-2">
                <span className="text-gray-300 text-sm">Zoom: {getZoomLabel()}</span>
                <Button 
                  color="zinc" 
                  onClick={() => setZoomLevel(Math.max(1, zoomLevel - 1))}
                  disabled={zoomLevel === 1}
                >
                  <MagnifyingGlassMinusIcon className="w-4 h-4" />
                </Button>
                <Button 
                  color="zinc" 
                  onClick={() => setZoomLevel(Math.min(4, zoomLevel + 1))}
                  disabled={zoomLevel === 4}
                >
                  <MagnifyingGlassPlusIcon className="w-4 h-4" />
                </Button>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2">
                <FunnelIcon className="w-4 h-4 text-gray-400" />
                <select
                  aria-label="Filter by event type"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as TimelineItem['type'] | 'all')}
                  className="bg-zinc-800 text-white border-zinc-700 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="all">All Types</option>
                  <option value="celestial">Celestial Only</option>
                  <option value="prophecy">Prophecies Only</option>
                  <option value="correlation">Correlations Only</option>
                </select>
                <select
                  aria-label="Filter by significance level"
                  value={filterSignificance}
                  onChange={(e) => setFilterSignificance(e.target.value as typeof filterSignificance)}
                  className="bg-zinc-800 text-white border-zinc-700 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="all">All Significance</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline Visualization */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">
              {visibleRange.start.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              {' → '}
              {visibleRange.end.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </CardTitle>
            <CardDescription className="text-gray-300">
              Showing {visibleItems.length} events in this time range
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative" ref={timelineRef}>
              {/* Timeline axis */}
              <div className="relative h-2 bg-zinc-800 rounded-full mb-12">
                {/* Current date marker */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-1 h-4 bg-cyan-500"
                  style={{ left: `${getItemPosition(new Date())}%` }}
                >
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-cyan-400 whitespace-nowrap">
                    Today
                  </div>
                </div>

                {/* Event markers */}
                {visibleItems.map((item, index) => {
                  const position = getItemPosition(item.date);
                  const isPast = item.date < new Date();
                  const topOffset = index % 2 === 0 ? '-48px' : '24px';
                  
                  return (
                    <div
                      key={item.id}
                      className="absolute"
                      style={{
                        left: `${position}%`,
                        top: topOffset
                      }}
                    >
                      {/* Connector line */}
                      <div
                        className={`absolute left-1/2 -translate-x-1/2 w-0.5 ${
                          index % 2 === 0 ? 'top-full h-12' : 'bottom-full h-6'
                        } ${
                          item.significance === 'critical' ? 'bg-red-500' :
                          item.significance === 'high' ? 'bg-purple-500' :
                          item.significance === 'medium' ? 'bg-blue-500' :
                          'bg-zinc-600'
                        }`}
                      />
                      
                      {/* Event marker */}
                      <div
                        className={`w-3 h-3 rounded-full ${
                          item.significance === 'critical' ? 'bg-red-500' :
                          item.significance === 'high' ? 'bg-purple-500' :
                          item.significance === 'medium' ? 'bg-blue-500' :
                          'bg-zinc-500'
                        } ${isPast ? 'opacity-50' : ''} shadow-lg`}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Event details below timeline */}
              <div className="space-y-3 mt-8">
                {visibleItems.map((item) => {
                  const isPast = item.date < new Date();
                  
                  return (
                    <div
                      key={item.id}
                      className={`bg-zinc-800 rounded-lg p-4 border ${
                        item.significance === 'critical' ? 'border-red-500/30' :
                        item.significance === 'high' ? 'border-purple-500/30' :
                        item.significance === 'medium' ? 'border-blue-500/30' :
                        'border-zinc-700'
                      } ${isPast ? 'opacity-60' : ''}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xl">{getTypeIcon(item.type)}</span>
                            <h3 className="font-semibold text-white">{item.title}</h3>
                            {getSignificanceBadge(item.significance)}
                            {isPast && (
                              <Badge color="zinc" className="bg-zinc-600/10 text-zinc-400">
                                Past
                              </Badge>
                            )}
                          </div>
                          <p className="text-gray-300 text-sm">{item.description}</p>
                          {item.linkedIds && item.linkedIds.length > 0 && (
                            <div className="mt-2 flex items-center gap-2">
                              <span className="text-xs text-gray-400">Linked:</span>
                              {item.linkedIds.map(id => (
                                <code key={id} className="text-xs bg-zinc-900 px-2 py-1 rounded text-cyan-300">
                                  {id}
                                </code>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-sm text-gray-400">
                            {item.date.toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </div>
                          {!isPast && (
                            <div className="text-xs text-blue-400 mt-1">
                              {formatTimeRemaining(item.date)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {visibleItems.length === 0 && (
                <div className="text-center py-12">
                  <CalendarIcon className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No events in this time range</p>
                  <p className="text-gray-500 text-sm mt-1">Try adjusting the filters or navigation</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Legend */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Legend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">🌙</span>
                <span className="text-gray-300 text-sm">Celestial Event</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl">📜</span>
                <span className="text-gray-300 text-sm">Prophecy Marker</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl">🔗</span>
                <span className="text-gray-300 text-sm">Correlation</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-cyan-500" />
                <span className="text-gray-300 text-sm">Today</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
