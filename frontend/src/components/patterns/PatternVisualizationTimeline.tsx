'use client';

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { motion } from 'motion/react';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';

interface TimelineEvent {
  id: string;
  date: Date;
  type: 'earthquake' | 'volcanic' | 'hurricane' | 'tsunami' | 'celestial' | 'feast' | 'correlation';
  title: string;
  magnitude?: number;
  vei?: number; // Volcanic Explosivity Index
  category?: number; // Hurricane category
  intensity?: number; // Tsunami intensity
  significance: number; // 0-1
  location?: string;
  description: string;
  feast_alignment?: boolean;
  correlations?: string[];
}

interface PatternVisualizationTimelineProps {
  startDate?: Date;
  endDate?: Date;
  events?: TimelineEvent[];
  height?: number;
  highlightedEventId?: string | null;
  onEventClick?: (eventId: string) => void;
}

export default function PatternVisualizationTimeline({
  startDate = new Date('1999-01-01'),
  endDate = new Date('2030-12-31'),
  events = [],
  height = 600,
  highlightedEventId = null,
  onEventClick,
}: PatternVisualizationTimelineProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);

  // Export timeline as PNG
  const exportToPNG = async () => {
    if (!svgRef.current) return;

    try {
      // Create a canvas element
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Get SVG dimensions
      const svgElement = svgRef.current;
      const bbox = svgElement.getBoundingClientRect();
      canvas.width = bbox.width;
      canvas.height = bbox.height;

      // Set white background
      ctx.fillStyle = '#09090b'; // zinc-950
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Convert SVG to string
      const svgString = new XMLSerializer().serializeToString(svgElement);
      const svg = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svg);

      // Load image and draw to canvas
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);

        // Download as PNG
        canvas.toBlob((blob) => {
          if (!blob) return;
          const pngUrl = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.download = `pattern-timeline-${new Date().toISOString().split('T')[0]}.png`;
          link.href = pngUrl;
          link.click();
          URL.revokeObjectURL(pngUrl);
        });
      };
      img.src = url;
    } catch (error) {
      console.error('Error exporting PNG:', error);
    }
  };

  useEffect(() => {
    if (!svgRef.current || events.length === 0) return;

    // Clear previous render
    d3.select(svgRef.current).selectAll('*').remove();

    // Dimensions
    const margin = { top: 80, right: 60, bottom: 60, left: 180 };
    const width = svgRef.current.clientWidth;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create SVG container
    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .style('background', 'transparent');

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Vertical timeline - Y axis is time
    const yScale = d3
      .scaleTime()
      .domain([startDate, endDate])
      .range([0, innerHeight]);

    // Seven columns for event types: 4 seismos + celestial + feast + correlation
    const columnWidth = innerWidth / 7;
    const xPositions: Record<string, number> = {
      earthquake: columnWidth * 0.5,   // Column 1: Earthquakes
      volcanic: columnWidth * 1.5,     // Column 2: Volcanic
      hurricane: columnWidth * 2.5,    // Column 3: Hurricanes
      tsunami: columnWidth * 3.5,      // Column 4: Tsunamis
      celestial: columnWidth * 4.5,    // Column 5: Celestial
      feast: columnWidth * 5.5,        // Column 6: Feasts
      correlation: columnWidth * 6.5,  // Column 7: Correlations
    };

    const sizeScale = d3
      .scaleSqrt()
      .domain([0, 1])
      .range([6, 25]);

    const colorScale = d3
      .scaleOrdinal<string>()
      .domain(['earthquake', 'volcanic', 'hurricane', 'tsunami', 'celestial', 'feast', 'correlation'])
      .range([
        '#92400e', // brown (earthquake - ground shaking)
        '#dc2626', // red-orange (volcanic - ground eruption) 
        '#475569', // blue-gray (hurricane - air commotion)
        '#06b6d4', // cyan (tsunami - sea commotion)
        '#3b82f6', // blue (celestial)
        '#fbbf24', // gold (feast)
        '#a78bfa', // purple (correlation)
      ]);

    // Add zoom and pan behavior
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.8, 3])
      .on('zoom', (event) => {
        g.attr('transform', `translate(${margin.left},${margin.top}) ${event.transform}`);
      });

    svg.call(zoom as any);

    // Vertical grid lines for columns
    [0, 1, 2, 3, 4, 5, 6, 7].forEach((i) => {
      g.append('line')
        .attr('x1', columnWidth * i)
        .attr('x2', columnWidth * i)
        .attr('y1', -20)
        .attr('y2', innerHeight + 20)
        .attr('stroke', i === 0 || i === 7 ? 'transparent' : 'rgba(255, 255, 255, 0.06)')
        .attr('stroke-width', 1);
    });

    // Horizontal year grid lines
    const years = d3.timeYear.range(startDate, endDate);
    g.append('g')
      .attr('class', 'grid')
      .selectAll('line')
      .data(years)
      .join('line')
      .attr('x1', -10)
      .attr('x2', innerWidth + 10)
      .attr('y1', (d) => yScale(d))
      .attr('y2', (d) => yScale(d))
      .attr('stroke', 'rgba(255, 255, 255, 0.05)')
      .attr('stroke-dasharray', '2,2');

    // Year labels on the right
    const yAxis = d3
      .axisRight(yScale)
      .ticks(d3.timeYear.every(10))
      .tickFormat(d3.timeFormat('%Y') as any)
      .tickSize(0);

    g.append('g')
      .attr('class', 'y-axis')
      .attr('transform', `translate(${innerWidth + 20}, 0)`)
      .call(yAxis)
      .selectAll('text')
      .attr('fill', '#94a3b8')
      .attr('font-size', '12px')
      .attr('font-weight', '500');

    // Column headers (updated for 7 columns)
    const headers = [
      { label: '🌍\nEarthquakes', emoji: '🌍', color: '#92400e', x: xPositions.earthquake },
      { label: '🌋\nVolcanic', emoji: '🌋', color: '#dc2626', x: xPositions.volcanic },
      { label: '🌀\nHurricanes', emoji: '🌀', color: '#475569', x: xPositions.hurricane },
      { label: '🌊\nTsunamis', emoji: '🌊', color: '#06b6d4', x: xPositions.tsunami },
      { label: '✨\nCelestial', emoji: '✨', color: '#3b82f6', x: xPositions.celestial },
      { label: '📜\nFeasts', emoji: '📜', color: '#fbbf24', x: xPositions.feast },
      { label: '🔗\nCorrelations', emoji: '🔗', color: '#a78bfa', x: xPositions.correlation },
    ];

    headers.forEach((header) => {
      const lines = header.label.split('\n');
      const textGroup = g.append('g')
        .attr('transform', `translate(${header.x}, -40)`);
      
      lines.forEach((line, i) => {
        textGroup.append('text')
          .attr('text-anchor', 'middle')
          .attr('y', i * 16)
          .attr('fill', header.color)
          .attr('font-size', i === 0 ? '16px' : '11px') // Emoji larger, text smaller
          .attr('font-weight', i === 0 ? '400' : '600')
          .text(line);
      });
    });

    // Style axes
    g.selectAll('.domain')
      .attr('stroke', 'rgba(255, 255, 255, 0.1)');

    // Collision detection and positioning algorithm
    // Group events by type and detect overlaps
    const eventsByType = {
      earthquake: events.filter(e => e.type === 'earthquake'),
      celestial: events.filter(e => e.type === 'celestial'),
      feast: events.filter(e => e.type === 'feast'),
    };

    // Function to calculate x offset to prevent overlaps
    const calculateXOffsets = (eventsInColumn: TimelineEvent[]) => {
      const offsets: Record<string, number> = {};
      const minSpacing = 40; // minimum pixels between event centers
      
      // Sort by date
      const sorted = [...eventsInColumn].sort((a, b) => a.date.getTime() - b.date.getTime());
      
      sorted.forEach((event, i) => {
        let offset = 0;
        const yPos = yScale(event.date);
        const radius = sizeScale(event.significance);
        
        // Check for collisions with previous events
        for (let j = i - 1; j >= 0; j--) {
          const otherEvent = sorted[j];
          const otherYPos = yScale(otherEvent.date);
          const otherRadius = sizeScale(otherEvent.significance);
          const verticalDistance = Math.abs(yPos - otherYPos);
          
          // If events are close vertically, offset horizontally
          if (verticalDistance < minSpacing) {
            const otherOffset = offsets[otherEvent.id] || 0;
            // Alternate left and right offsets
            const alternateDirection = (i % 2 === 0) ? 1 : -1;
            offset = otherOffset + (alternateDirection * (radius + otherRadius + 10));
            // Limit offset range
            offset = Math.max(-columnWidth * 0.35, Math.min(columnWidth * 0.35, offset));
          } else if (verticalDistance > minSpacing * 3) {
            // Far enough away, stop checking
            break;
          }
        }
        
        offsets[event.id] = offset;
      });
      
      return offsets;
    };

    // Calculate offsets for each column
    const xOffsets: Record<string, number> = {};
    Object.entries(eventsByType).forEach(([type, eventsInColumn]) => {
      const columnOffsets = calculateXOffsets(eventsInColumn);
      Object.assign(xOffsets, columnOffsets);
    });

    // Draw correlation lines first (behind circles)
    const correlationLines = g
      .append('g')
      .attr('class', 'correlation-lines');

    events.forEach((event) => {
      if (event.correlations && event.correlations.length > 0) {
        event.correlations.forEach((correlatedId) => {
          const correlatedEvent = events.find((e) => e.id === correlatedId);
          if (correlatedEvent && event.type !== 'correlation') {
            const x1 = (xPositions[event.type] || 0) + (xOffsets[event.id] || 0);
            const x2 = (xPositions[correlatedEvent.type] || 0) + (xOffsets[correlatedEvent.id] || 0);
            
            correlationLines
              .append('path')
              .attr('d', () => {
                const y1 = yScale(event.date);
                const y2 = yScale(correlatedEvent.date);
                const midY = (y1 + y2) / 2;
                
                return `M ${x1} ${y1} 
                        Q ${(x1 + x2) / 2} ${midY}, ${x2} ${y2}`;
              })
              .attr('stroke', '#a78bfa')
              .attr('stroke-width', 1.5)
              .attr('stroke-opacity', 0.4)
              .attr('fill', 'none')
              .attr('stroke-dasharray', '5,5');
          }
        });
      }
    });

    // Draw event circles with collision-aware positioning
    const circles = g
      .append('g')
      .attr('class', 'events')
      .selectAll('circle')
      .data(events.filter(e => e.type !== 'correlation'))
      .join('circle')
      .attr('cx', (d) => (xPositions[d.type] || 0) + (xOffsets[d.id] || 0))
      .attr('cy', (d) => yScale(d.date))
      .attr('r', (d) => sizeScale(d.significance))
      .attr('fill', (d) => colorScale(d.type))
      .attr('opacity', 0.85)
      .attr('stroke', (d) => (d.feast_alignment ? '#fbbf24' : '#ffffff'))
      .attr('stroke-width', (d) => (d.feast_alignment ? 3 : 0.5))
      .attr('stroke-opacity', (d) => (d.feast_alignment ? 1 : 0.3))
      .attr('class', (d) => `event-circle event-${d.id}`)
      .style('cursor', 'pointer')
      .style('transition', 'all 0.2s ease')
      .on('click', function(event, d) {
        if (onEventClick) {
          onEventClick(d.id);
        }
      })
      .on('mouseover', function (event, d) {
        // Highlight
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', sizeScale(d.significance) * 1.4)
          .attr('opacity', 1)
          .attr('stroke-width', (d.feast_alignment ? 4 : 2));

        // Show tooltip
        if (tooltipRef.current) {
          tooltipRef.current.style.display = 'block';
          tooltipRef.current.style.left = `${event.pageX + 15}px`;
          tooltipRef.current.style.top = `${event.pageY - 15}px`;
        }
        setSelectedEvent(d);
      })
      .on('mouseout', function (event, d) {
        // Reset only if not highlighted from table
        if (highlightedEventId !== d.id) {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('r', (d) => sizeScale(d.significance))
            .attr('opacity', 0.85)
            .attr('stroke-width', (d.feast_alignment ? 3 : 0.5));
        }

        // Hide tooltip
        if (tooltipRef.current) {
          tooltipRef.current.style.display = 'none';
        }
        setSelectedEvent(null);
      });

    // Animate entrance
    circles
      .attr('r', 0)
      .attr('opacity', 0)
      .transition()
      .duration(1000)
      .delay((d, i) => i * 30)
      .attr('r', (d) => sizeScale(d.significance))
      .attr('opacity', 0.85);

    setIsLoading(false);
  }, [events, startDate, endDate, height]);

  // Handle external highlighting (from table clicks)
  useEffect(() => {
    if (!svgRef.current) return;

    // Reset all circles
    d3.select(svgRef.current)
      .selectAll('.event-circle')
      .transition()
      .duration(200)
      .attr('r', function() {
        const d = d3.select(this).datum() as TimelineEvent;
        const sizeScale = d3.scaleLinear().domain([0, 1]).range([8, 35]);
        return sizeScale(d.significance);
      })
      .attr('opacity', 0.85)
      .attr('stroke-width', function() {
        const d = d3.select(this).datum() as TimelineEvent;
        return d.feast_alignment ? 3 : 0.5;
      });

    // Highlight the selected event
    if (highlightedEventId) {
      const highlightedCircle = d3.select(svgRef.current).select(`.event-${highlightedEventId}`);
      
      if (!highlightedCircle.empty()) {
        const eventData = highlightedCircle.datum() as TimelineEvent;
        const sizeScale = d3.scaleLinear().domain([0, 1]).range([8, 35]);
        
        highlightedCircle
          .transition()
          .duration(300)
          .attr('r', sizeScale(eventData.significance) * 1.6)
          .attr('opacity', 1)
          .attr('stroke-width', eventData.feast_alignment ? 5 : 3)
          .attr('stroke', '#00ff88') // Bright highlight color
          .attr('stroke-opacity', 1);

        // Scroll the highlighted circle into view
        const circleNode = highlightedCircle.node() as SVGCircleElement;
        if (circleNode) {
          circleNode.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
  }, [highlightedEventId]);

  return (
    <div className="relative w-full">
      {/* Header */}
      <motion.div
        className="mb-6 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-3">
          Pattern Visualization Timeline
        </h2>
        <p className="text-zinc-300 text-base">
          Convergence patterns of biblical celestial events and atmospheric events Feast dates
        </p>
      </motion.div>

      {/* Legend - Top Center */}
      <motion.div
        className="mb-4 flex justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="bg-zinc-900/80 backdrop-blur-sm rounded-lg border border-zinc-700/50 px-6 py-3 flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500"></div>
            <span className="text-sm font-medium text-zinc-200">Atmospheric Events</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-500"></div>
            <span className="text-sm font-medium text-zinc-200">Celestial Events</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
            <span className="text-sm font-medium text-zinc-200">Hebrew Feast Days</span>
          </div>
          <div className="flex items-center gap-2 pl-4 border-l border-zinc-700">
            <div className="w-4 h-4 rounded-full bg-white border-2 border-yellow-500"></div>
            <span className="text-sm font-medium text-zinc-200">Feast Aligned</span>
          </div>
        </div>
      </motion.div>

      {/* Loading State */}
      {isLoading && events.length === 0 && (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500 mb-4"></div>
            <p className="text-zinc-400">Loading timeline data...</p>
          </div>
        </div>
      )}

      {/* SVG Timeline */}
      <div className="relative rounded-xl border border-zinc-700/30 bg-gradient-to-br from-zinc-900/60 to-zinc-950/80 p-8 backdrop-blur-xl shadow-2xl overflow-hidden">
        <svg ref={svgRef} className="w-full" style={{ minHeight: `${height}px` }} />
        
        {/* Controls */}
        <div className="absolute bottom-6 left-6 flex gap-3">
          <button
            onClick={() => {
              if (svgRef.current) {
                const svg = d3.select(svgRef.current);
                svg.transition().duration(750).call(
                  (d3.zoom() as any).transform,
                  d3.zoomIdentity
                );
              }
            }}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-zinc-800/90 backdrop-blur-sm text-zinc-200 border border-zinc-700/50 hover:bg-zinc-700/90 hover:text-cyan-400 hover:border-cyan-500/30 transition-all shadow-lg"
          >
            Reset View
          </button>
          <button
            onClick={exportToPNG}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-cyan-500/20 backdrop-blur-sm text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 hover:border-cyan-400 transition-all shadow-lg"
          >
            <ArrowDownTrayIcon className="h-4 w-4" />
            Export PNG
          </button>
        </div>
      </div>

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="fixed z-50 hidden pointer-events-none"
        style={{ display: 'none' }}
      >
        {selectedEvent && (
          <motion.div
            className="bg-zinc-900/95 backdrop-blur-xl border border-cyan-500/30 rounded-lg p-4 shadow-2xl max-w-xs"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <h4 className="font-bold text-cyan-400 mb-1 text-sm">
              {selectedEvent.title}
            </h4>
            <p className="text-zinc-400 text-xs mb-2">
              {selectedEvent.date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
            {selectedEvent.location && (
              <p className="text-zinc-300 text-xs mb-1">
                📍 {selectedEvent.location}
              </p>
            )}
            {selectedEvent.magnitude && (
              <p className="text-zinc-300 text-xs mb-1">
                📊 Magnitude: <span className="font-semibold">{selectedEvent.magnitude}</span>
              </p>
            )}
            <p className="text-zinc-300 text-xs mb-1">
              ⭐ Significance: <span className="font-semibold">{(selectedEvent.significance * 100).toFixed(0)}%</span>
            </p>
            {selectedEvent.feast_alignment && (
              <p className="text-yellow-400 text-xs font-semibold mb-1">
                🕎 Hebrew Feast Aligned
              </p>
            )}
            <p className="text-zinc-400 text-xs mt-2 leading-relaxed">
              {selectedEvent.description}
            </p>
          </motion.div>
        )}
      </div>

      {/* Stats Summary */}
      <motion.div
        className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <div className="rounded-lg bg-zinc-900/50 border border-red-500/20 p-4 text-center">
          <div className="text-2xl font-bold text-red-400">
            {events.filter((e) => e.type === 'earthquake').length}
          </div>
          <div className="text-xs text-zinc-400 mt-1">Earthquakes</div>
        </div>
        <div className="rounded-lg bg-zinc-900/50 border border-blue-500/20 p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">
            {events.filter((e) => e.type === 'celestial').length}
          </div>
          <div className="text-xs text-zinc-400 mt-1">Celestial Events</div>
        </div>
        <div className="rounded-lg bg-zinc-900/50 border border-yellow-500/20 p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">
            {events.filter((e) => e.type === 'feast').length}
          </div>
          <div className="text-xs text-zinc-400 mt-1">Feast Days</div>
        </div>
        <div className="rounded-lg bg-zinc-900/50 border border-purple-500/20 p-4 text-center">
          <div className="text-2xl font-bold text-purple-400">
            {events.filter((e) => e.feast_alignment).length}
          </div>
          <div className="text-xs text-zinc-400 mt-1">Feast Aligned</div>
        </div>
      </motion.div>
    </div>
  );
}
