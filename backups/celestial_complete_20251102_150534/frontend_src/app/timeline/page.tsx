'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MainLayout } from '@/components/layout';
import {
  CalendarIcon,
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  SparklesIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { CelestialEvent } from '@/lib/types/celestial';
import { getAllCelestialEvents } from '@/lib/utils/celestialCalculations';

interface TimelineItem {
  id: string;
  date: Date;
  type: 'celestial' | 'prophecy';
  title: string;
  description: string;
  significance: 'low' | 'medium' | 'high' | 'critical';
}

export default function TimelineViewerPage() {
  const [events, setEvents] = useState<CelestialEvent[]>([]);
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);
  const [zoomLevel, setZoomLevel] = useState(2); // 1=years, 2=months, 3=weeks
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filterType, setFilterType] = useState<'all' | 'celestial' | 'prophecy'>('all');
  
  // Stable star positions
  const [starPositions] = useState(() =>
    Array.from({ length: 18 }, () => ({
      top: Math.random() * 100,
      left: Math.random() * 100,
      size: Math.random() * 2 + 1,
      duration: Math.random() * 3 + 2,
    }))
  );

  // Load events
  useEffect(() => {
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 1);
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 3);
    
    const celestialEvents = getAllCelestialEvents(startDate, endDate);
    const items: TimelineItem[] = celestialEvents.map(event => ({
      id: event.id,
      date: event.eventDate,
      type: 'celestial',
      title: event.title,
      description: event.description,
      significance: event.propheticSignificance,
    }));

    const prophecyMarkers: TimelineItem[] = [
      {
        id: 'prophecy-1',
        date: new Date('2025-09-07'),
        type: 'prophecy',
        title: 'Joel 2:31 - Blood Moon',
        description: 'The sun shall be turned to darkness, and the moon to blood.',
        significance: 'critical',
      },
      {
        id: 'prophecy-2',
        date: new Date('2025-12-21'),
        type: 'prophecy',
        title: 'Matthew 24:29 - Signs in Heavens',
        description: 'The sun will be darkened, and the moon will not give its light.',
        significance: 'high',
      },
    ];

    setEvents(celestialEvents);
    setTimelineItems([...items, ...prophecyMarkers].sort((a, b) => a.date.getTime() - b.date.getTime()));
  }, []);

  const getZoomLabel = () => ['Years', 'Months', 'Weeks'][zoomLevel - 1];

  const navigateTimeline = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    const months = zoomLevel === 1 ? 12 : zoomLevel === 2 ? 3 : 1;
    
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - months);
    } else {
      newDate.setMonth(newDate.getMonth() + months);
    }
    setCurrentDate(newDate);
  };

  const getVisibleRange = () => {
    const start = new Date(currentDate);
    const end = new Date(currentDate);
    const months = zoomLevel === 1 ? 12 : zoomLevel === 2 ? 6 : 2;
    start.setMonth(start.getMonth() - months);
    end.setMonth(end.getMonth() + months);
    return { start, end };
  };

  const visibleRange = getVisibleRange();
  const filteredItems = timelineItems.filter(item => {
    const typeMatch = filterType === 'all' || item.type === filterType;
    const inRange = item.date >= visibleRange.start && item.date <= visibleRange.end;
    return typeMatch && inRange;
  });

  const getItemPosition = (date: Date) => {
    const total = visibleRange.end.getTime() - visibleRange.start.getTime();
    const offset = date.getTime() - visibleRange.start.getTime();
    return Math.max(0, Math.min(100, (offset / total) * 100));
  };

  return (
    <MainLayout title="Timeline" subtitle="Celestial Events Across Time">
      <div className="relative min-h-screen bg-zinc-950 p-6 overflow-hidden">
        {/* Celestial Background */}
        <div className="fixed inset-0 pointer-events-none">
          {starPositions.map((star, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                top: `${star.top}%`,
                left: `${star.left}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
              }}
              animate={{
                opacity: [0.2, 1, 0.2],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: star.duration,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}
          <motion.div
            className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 bg-linear-to-br from-purple-500/10 via-blue-500/5 to-transparent rounded-full blur-3xl"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 bg-linear-to-tr from-cyan-500/10 via-teal-500/5 to-transparent rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto space-y-6">
          {/* Stats Cards */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-4 gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div 
              className="rounded-xl border border-cyan-500/20 bg-linear-to-br from-zinc-900/90 to-zinc-950/90 p-6 backdrop-blur-xl text-center"
              whileHover={{ scale: 1.02, translateY: -2 }}
            >
              <p className="text-4xl font-bold text-cyan-400">{events.length}</p>
              <p className="text-sm text-zinc-400 mt-2">Celestial Events</p>
            </motion.div>
            
            <motion.div 
              className="rounded-xl border border-purple-500/20 bg-linear-to-br from-zinc-900/90 to-zinc-950/90 p-6 backdrop-blur-xl text-center"
              whileHover={{ scale: 1.02, translateY: -2 }}
            >
              <p className="text-4xl font-bold text-purple-400">
                {timelineItems.filter(i => i.type === 'prophecy').length}
              </p>
              <p className="text-sm text-zinc-400 mt-2">Prophecy Markers</p>
            </motion.div>
            
            <motion.div 
              className="rounded-xl border border-red-500/20 bg-linear-to-br from-zinc-900/90 to-zinc-950/90 p-6 backdrop-blur-xl text-center"
              whileHover={{ scale: 1.02, translateY: -2 }}
            >
              <p className="text-4xl font-bold text-red-400">
                {timelineItems.filter(i => i.significance === 'critical').length}
              </p>
              <p className="text-sm text-zinc-400 mt-2">Critical Events</p>
            </motion.div>
            
            <motion.div 
              className="rounded-xl border border-green-500/20 bg-linear-to-br from-zinc-900/90 to-zinc-950/90 p-6 backdrop-blur-xl text-center"
              whileHover={{ scale: 1.02, translateY: -2 }}
            >
              <p className="text-4xl font-bold text-green-400">{filteredItems.length}</p>
              <p className="text-sm text-zinc-400 mt-2">Visible Now</p>
            </motion.div>
          </motion.div>

          {/* Timeline Controls */}
          <motion.div 
            className="rounded-xl border border-cyan-500/20 bg-linear-to-br from-zinc-900/90 to-zinc-950/90 p-6 backdrop-blur-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Navigation */}
              <div className="flex items-center gap-3">
                <motion.button
                  onClick={() => navigateTimeline('prev')}
                  className="p-2 rounded-lg bg-zinc-800 border border-cyan-500/20 text-cyan-400 hover:bg-zinc-700 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ArrowLeftIcon className="w-5 h-5" />
                </motion.button>
                
                <div className="px-6 py-2 bg-zinc-800 rounded-lg border border-cyan-500/20">
                  <p className="text-cyan-50 font-semibold flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-cyan-400" />
                    {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </p>
                </div>
                
                <motion.button
                  onClick={() => navigateTimeline('next')}
                  className="p-2 rounded-lg bg-zinc-800 border border-cyan-500/20 text-cyan-400 hover:bg-zinc-700 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ArrowRightIcon className="w-5 h-5" />
                </motion.button>
                
                <motion.button
                  onClick={() => setCurrentDate(new Date())}
                  className="px-4 py-2 rounded-lg bg-zinc-800 border border-cyan-500/20 text-cyan-50 hover:bg-zinc-700 transition-colors text-sm font-medium"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Today
                </motion.button>
              </div>

              {/* Zoom & Filters */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-zinc-400">Zoom: {getZoomLabel()}</span>
                  <motion.button
                    onClick={() => setZoomLevel(Math.max(1, zoomLevel - 1))}
                    disabled={zoomLevel === 1}
                    className="p-2 rounded-lg bg-zinc-800 border border-cyan-500/20 text-cyan-400 hover:bg-zinc-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    whileHover={zoomLevel > 1 ? { scale: 1.05 } : {}}
                    whileTap={zoomLevel > 1 ? { scale: 0.95 } : {}}
                  >
                    <MagnifyingGlassMinusIcon className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    onClick={() => setZoomLevel(Math.min(3, zoomLevel + 1))}
                    disabled={zoomLevel === 3}
                    className="p-2 rounded-lg bg-zinc-800 border border-cyan-500/20 text-cyan-400 hover:bg-zinc-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    whileHover={zoomLevel < 3 ? { scale: 1.05 } : {}}
                    whileTap={zoomLevel < 3 ? { scale: 0.95 } : {}}
                  >
                    <MagnifyingGlassPlusIcon className="w-4 h-4" />
                  </motion.button>
                </div>

                <select 
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as 'all' | 'celestial' | 'prophecy')}
                  className="px-4 py-2 rounded-lg bg-zinc-800 border border-cyan-500/20 text-cyan-50 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  aria-label="Filter event type"
                >
                  <option value="all">All Types</option>
                  <option value="celestial">Celestial Only</option>
                  <option value="prophecy">Prophecy Only</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Timeline Visualization */}
          <motion.div 
            className="rounded-xl border border-cyan-500/20 bg-linear-to-br from-zinc-900/90 to-zinc-950/90 p-8 backdrop-blur-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <ClockIcon className="h-6 w-6 text-cyan-400" />
              <h2 className="text-xl font-bold bg-linear-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Event Timeline
              </h2>
            </div>

            {/* Timeline Track */}
            <div className="relative h-32 mb-8">
              {/* Base Line */}
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-linear-to-r from-cyan-500/20 via-purple-500/20 to-cyan-500/20 rounded-full transform -translate-y-1/2" />
              
              {/* Event Markers */}
              {filteredItems.map((item, idx) => {
                const position = getItemPosition(item.date);
                const isProphecy = item.type === 'prophecy';
                const isCritical = item.significance === 'critical';
                
                return (
                  <motion.div
                    key={item.id}
                    className="absolute top-1/2 transform -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${position}%` }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05, duration: 0.3 }}
                  >
                    <motion.div
                      className={`w-4 h-4 rounded-full ${
                        isProphecy 
                          ? 'bg-purple-500 border-2 border-purple-300' 
                          : isCritical
                          ? 'bg-red-500 border-2 border-red-300'
                          : 'bg-cyan-500 border-2 border-cyan-300'
                      }`}
                      whileHover={{ scale: 1.5 }}
                      animate={isCritical ? {
                        scale: [1, 1.2, 1],
                        opacity: [1, 0.7, 1],
                      } : {}}
                      transition={isCritical ? {
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      } : {}}
                    />
                  </motion.div>
                );
              })}
            </div>

            {/* Event List */}
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
              {filteredItems.length > 0 ? (
                filteredItems.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    className={`p-4 rounded-lg border ${
                      item.type === 'prophecy'
                        ? 'border-purple-500/30 bg-purple-950/20'
                        : item.significance === 'critical'
                        ? 'border-red-500/30 bg-red-950/20'
                        : 'border-cyan-500/30 bg-cyan-950/20'
                    } hover:scale-[1.01] transition-transform`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05, duration: 0.3 }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`mt-1 ${item.type === 'prophecy' ? 'text-2xl' : 'text-xl'}`}>
                          {item.type === 'prophecy' ? '📜' : '🌙'}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-cyan-50">{item.title}</h3>
                          <p className="text-sm text-zinc-400 mt-1">{item.description}</p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-zinc-500">
                            <span>{item.date.toLocaleDateString()}</span>
                            <span className={`px-2 py-0.5 rounded-full ${
                              item.significance === 'critical' ? 'bg-red-500/20 text-red-400' :
                              item.significance === 'high' ? 'bg-orange-500/20 text-orange-400' :
                              item.significance === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-blue-500/20 text-blue-400'
                            }`}>
                              {item.significance.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12">
                  <SparklesIcon className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                  <p className="text-zinc-400">No events in this time range</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Custom Scrollbar */}
        <style jsx global>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(39, 39, 42, 0.5);
            border-radius: 3px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(6, 182, 212, 0.3);
            border-radius: 3px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(6, 182, 212, 0.5);
          }
        `}</style>
      </div>
    </MainLayout>
  );
}
