/**
 * Pattern Timeline Visualization
 * Shows historical celestial patterns: tetrads, conjunctions, clusters, parallels
 * Uses 2025 design trends: glassmorphism, gradient markers, smooth animations
 */

'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { format, parseISO, differenceInDays } from 'date-fns';

// Types
interface Event {
  id: number;
  event_date: string;
  event_type: string;
  description?: string;
  significance_score?: number;
  jerusalem_visible?: boolean;
  feast_day?: string;
}

interface Tetrad {
  start_date: string;
  end_date: string;
  eclipses: Event[];
  duration_days: number;
  jerusalem_visible_count: number;
  significance_score: number;
}

interface Conjunction {
  start_date: string;
  end_date: string;
  conjunctions: Event[];
  duration_days: number;
  planets_involved: string[];
}

interface Cluster {
  cluster_id: number;
  event_count: number;
  events: Event[];
  significance_score: number;
  start_date: string;
  end_date: string;
}

interface HistoricalMatch {
  event_1: Event;
  event_2: Event;
  similarity_score: number;
  time_difference_days: number;
}

interface PatternData {
  tetrads: Tetrad[];
  conjunctions: Conjunction[];
  clusters: Cluster[];
  historical_matches: HistoricalMatch[];
  total_events: number;
}

interface PatternTimelineProps {
  data: PatternData;
  startYear?: number;
  endYear?: number;
  height?: number;
  onEventSelect?: (event: Event) => void;
  onPatternSelect?: (pattern: any) => void;
}

export default function PatternTimeline({
  data,
  startYear = 1900,
  endYear = 2100,
  height = 400,
  onEventSelect,
  onPatternSelect,
}: PatternTimelineProps) {
  const [hoveredItem, setHoveredItem] = useState<any>(null);
  const [selectedPattern, setSelectedPattern] = useState<any>(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Calculate timeline scale
  const yearRange = endYear - startYear;
  const pixelsPerYear = useMemo(() => {
    return (800 * zoomLevel) / yearRange; // Base width 800px
  }, [yearRange, zoomLevel]);

  // Convert date to X position
  const dateToX = (dateString: string): number => {
    const date = parseISO(dateString);
    const year = date.getFullYear();
    const dayOfYear = Math.floor(
      (date.getTime() - new Date(year, 0, 0).getTime()) / (1000 * 60 * 60 * 24)
    );
    const yearProgress = (year - startYear) + (dayOfYear / 365);
    return yearProgress * pixelsPerYear;
  };

  // Render tetrad markers
  const renderTetrads = () => {
    return data.tetrads.map((tetrad, index) => {
      const x1 = dateToX(tetrad.start_date);
      const x2 = dateToX(tetrad.end_date);
      const width = x2 - x1;

      return (
        <motion.g
          key={`tetrad-${index}`}
          onMouseEnter={() => setHoveredItem({ type: 'tetrad', data: tetrad })}
          onMouseLeave={() => setHoveredItem(null)}
          onClick={() => {
            setSelectedPattern({ type: 'tetrad', data: tetrad });
            onPatternSelect?.(tetrad);
          }}
          whileHover={{ scale: 1.05 }}
          className="cursor-pointer"
        >
          {/* Background region */}
          <rect
            x={x1}
            y={50}
            width={width}
            height={80}
            fill="url(#tetradGradient)"
            opacity={0.2}
            rx={8}
          />

          {/* Eclipse markers */}
          {tetrad.eclipses.map((eclipse, idx) => {
            const ex = dateToX(eclipse.event_date);
            return (
              <motion.circle
                key={`eclipse-${idx}`}
                cx={ex}
                cy={90}
                r={8}
                fill={eclipse.jerusalem_visible ? '#ef4444' : '#f87171'}
                stroke="#fecaca"
                strokeWidth={2}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: idx * 0.1 }}
              />
            );
          })}

          {/* Label */}
          <text
            x={x1 + width / 2}
            y={145}
            textAnchor="middle"
            className="text-xs font-medium fill-red-300"
          >
            {format(parseISO(tetrad.start_date), 'yyyy')}-
            {format(parseISO(tetrad.end_date), 'yy')} Tetrad
          </text>
        </motion.g>
      );
    });
  };

  // Render conjunction markers
  const renderConjunctions = () => {
    return data.conjunctions.map((conjunction, index) => {
      const x1 = dateToX(conjunction.start_date);
      const x2 = dateToX(conjunction.end_date);
      const centerX = (x1 + x2) / 2;

      // Planet symbols
      const planetSymbols: Record<string, string> = {
        Jupiter: '♃',
        Saturn: '♄',
        Mars: '♂',
        Venus: '♀',
      };

      return (
        <motion.g
          key={`conjunction-${index}`}
          onMouseEnter={() => setHoveredItem({ type: 'conjunction', data: conjunction })}
          onMouseLeave={() => setHoveredItem(null)}
          onClick={() => {
            setSelectedPattern({ type: 'conjunction', data: conjunction });
            onPatternSelect?.(conjunction);
          }}
          whileHover={{ scale: 1.05 }}
          className="cursor-pointer"
        >
          {/* Connection line */}
          <line
            x1={x1}
            x2={x2}
            y={180}
            stroke="url(#conjunctionGradient)"
            strokeWidth={3}
            strokeDasharray="5,5"
          />

          {/* Planet symbols */}
          <circle
            cx={centerX}
            cy={180}
            r={14}
            fill="url(#planetGradient)"
            stroke="#fbbf24"
            strokeWidth={2}
          />
          <text
            x={centerX}
            y={186}
            textAnchor="middle"
            className="text-base font-bold fill-yellow-900"
          >
            {conjunction.planets_involved.map(p => planetSymbols[p] || '●').join('')}
          </text>

          {/* Label */}
          <text
            x={centerX}
            y={210}
            textAnchor="middle"
            className="text-xs font-medium fill-yellow-300"
          >
            {conjunction.planets_involved.join(' & ')}
          </text>
        </motion.g>
      );
    });
  };

  // Render event clusters
  const renderClusters = () => {
    return data.clusters.map((cluster, index) => {
      const x1 = dateToX(cluster.start_date);
      const x2 = dateToX(cluster.end_date);
      const width = x2 - x1;
      const centerX = x1 + width / 2;

      // Color by significance
      const clusterColor =
        cluster.significance_score > 0.8
          ? '#8b5cf6'
          : cluster.significance_score > 0.6
          ? '#a78bfa'
          : '#c4b5fd';

      return (
        <motion.g
          key={`cluster-${index}`}
          onMouseEnter={() => setHoveredItem({ type: 'cluster', data: cluster })}
          onMouseLeave={() => setHoveredItem(null)}
          onClick={() => {
            setSelectedPattern({ type: 'cluster', data: cluster });
            onPatternSelect?.(cluster);
          }}
          whileHover={{ scale: 1.02 }}
          className="cursor-pointer"
        >
          {/* Cluster region */}
          <rect
            x={x1}
            y={240}
            width={width}
            height={60}
            fill={clusterColor}
            opacity={0.3}
            rx={6}
          />

          {/* Event dots */}
          {cluster.events.slice(0, 10).map((event, idx) => {
            const ex = dateToX(event.event_date);
            return (
              <circle
                key={`cluster-event-${idx}`}
                cx={ex}
                cy={270}
                r={4}
                fill={clusterColor}
              />
            );
          })}

          {/* Label */}
          <text
            x={centerX}
            y={320}
            textAnchor="middle"
            className="text-xs font-medium fill-purple-300"
          >
            {cluster.event_count} events
          </text>
        </motion.g>
      );
    });
  };

  // Render timeline axis
  const renderAxis = () => {
    const years = [];
    const step = Math.ceil(yearRange / (800 / 100)); // One mark per ~100px

    for (let year = startYear; year <= endYear; year += step) {
      const x = ((year - startYear) * pixelsPerYear);
      years.push(
        <g key={`year-${year}`}>
          <line x1={x} x2={x} y1={350} y2={360} stroke="#52525b" strokeWidth={1} />
          <text
            x={x}
            y={375}
            textAnchor="middle"
            className="text-xs font-medium fill-zinc-400"
          >
            {year}
          </text>
        </g>
      );
    }

    return (
      <g>
        <line x1={0} x2={yearRange * pixelsPerYear} y1={350} y2={350} stroke="#52525b" strokeWidth={2} />
        {years}
      </g>
    );
  };

  return (
    <div className="relative w-full overflow-hidden rounded-xl bg-zinc-900/50 border border-zinc-800 backdrop-blur-xl">
      {/* Controls */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
        <h3 className="text-lg font-semibold text-white">
          📅 Celestial Pattern Timeline
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.25))}
            className="px-3 py-1 text-sm font-medium text-zinc-300 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors"
          >
            −
          </button>
          <span className="text-sm text-zinc-400">{Math.round(zoomLevel * 100)}%</span>
          <button
            onClick={() => setZoomLevel(Math.min(3, zoomLevel + 0.25))}
            className="px-3 py-1 text-sm font-medium text-zinc-300 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors"
          >
            +
          </button>
        </div>
      </div>

      {/* Timeline SVG */}
      <div className="overflow-x-auto p-4" style={{ height: `${height}px` }}>
        <svg
          width={yearRange * pixelsPerYear}
          height={height - 60}
          className="select-none"
        >
          {/* Gradients */}
          <defs>
            <linearGradient id="tetradGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#dc2626" stopOpacity={0.6} />
              <stop offset="100%" stopColor="#f87171" stopOpacity={0.6} />
            </linearGradient>
            <linearGradient id="conjunctionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#fbbf24" stopOpacity={0.8} />
            </linearGradient>
            <radialGradient id="planetGradient">
              <stop offset="0%" stopColor="#fef3c7" />
              <stop offset="100%" stopColor="#fbbf24" />
            </radialGradient>
          </defs>

          {/* Render patterns */}
          {renderTetrads()}
          {renderConjunctions()}
          {renderClusters()}
          {renderAxis()}
        </svg>
      </div>

      {/* Hover tooltip */}
      <AnimatePresence>
        {hoveredItem && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-4 left-4 right-4 rounded-xl bg-zinc-900/95 border border-zinc-700 p-4 backdrop-blur-xl shadow-2xl"
          >
            <div className="text-sm">
              <div className="font-semibold text-white mb-2">
                {hoveredItem.type === 'tetrad' && '🌙 Blood Moon Tetrad'}
                {hoveredItem.type === 'conjunction' && '🪐 Planetary Conjunction'}
                {hoveredItem.type === 'cluster' && '⭐ Event Cluster'}
              </div>
              {hoveredItem.type === 'tetrad' && (
                <>
                  <div className="text-zinc-300">
                    {hoveredItem.data.eclipses.length} lunar eclipses
                  </div>
                  <div className="text-zinc-400 text-xs">
                    {hoveredItem.data.jerusalem_visible_count} visible from Jerusalem
                  </div>
                </>
              )}
              {hoveredItem.type === 'conjunction' && (
                <div className="text-zinc-300">
                  {hoveredItem.data.planets_involved.join(' & ')} approach
                </div>
              )}
              {hoveredItem.type === 'cluster' && (
                <div className="text-zinc-300">
                  {hoveredItem.data.event_count} correlated events
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <div className="flex items-center gap-6 px-4 py-3 border-t border-zinc-800 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-red-500" />
          <span className="text-zinc-400">Blood Moon Tetrads</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-yellow-500" />
          <span className="text-zinc-400">Planetary Conjunctions</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-purple-500" />
          <span className="text-zinc-400">Event Clusters</span>
        </div>
      </div>
    </div>
  );
}
