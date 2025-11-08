/**
 * Earth Hotspot Visualization
 * 
 * 2D world map with earthquake hotspot visualization using SVG overlays.
 * Shows seismic activity intensity with color-coded markers and heat zones.
 */

'use client';

import { useMemo, useState } from 'react';
import { Earthquake } from '@/lib/types';

interface CesiumEarthCanvasProps {
  earthquakes?: Earthquake[];
  onEarthquakeSelect?: (earthquake: Earthquake) => void;
  showEarthquakes?: boolean;
  minMagnitude?: number;
}

export default function CesiumEarthCanvas({
  earthquakes = [],
  onEarthquakeSelect,
  showEarthquakes = true,
  minMagnitude = 4.0,
}: CesiumEarthCanvasProps) {
  const [hoveredEarthquake, setHoveredEarthquake] = useState<Earthquake | null>(null);
  
  const filteredEarthquakes = useMemo(
    () => earthquakes.filter((eq) => eq.magnitude >= minMagnitude),
    [earthquakes, minMagnitude]
  );

  // Convert lat/lon to SVG coordinates (Mercator projection simplified)
  const latLonToXY = (lon: number, lat: number) => {
    const x = ((lon + 180) / 360) * 100;
    const y = ((90 - lat) / 180) * 100;
    return { x, y };
  };

  // Get color and size based on magnitude
  const getMarkerStyle = (magnitude: number) => {
    if (magnitude >= 7.0) {
      return { color: '#ef4444', size: 20, intensity: 0.9 }; // red
    } else if (magnitude >= 6.0) {
      return { color: '#f97316', size: 16, intensity: 0.7 }; // orange
    } else if (magnitude >= 5.0) {
      return { color: '#eab308', size: 12, intensity: 0.5 }; // yellow
    } else {
      return { color: '#22c55e', size: 8, intensity: 0.3 }; // green
    }
  };

  // Calculate hotspot zones (areas with multiple earthquakes)
  const hotspotZones = useMemo(() => {
    const zones: { lat: number; lon: number; count: number; maxMagnitude: number }[] = [];
    const gridSize = 10; // degrees
    
    filteredEarthquakes.forEach((eq) => {
      const [lon, lat] = eq.location.coordinates;
      const zoneLat = Math.floor(lat / gridSize) * gridSize;
      const zoneLon = Math.floor(lon / gridSize) * gridSize;
      
      const existingZone = zones.find(z => z.lat === zoneLat && z.lon === zoneLon);
      if (existingZone) {
        existingZone.count++;
        existingZone.maxMagnitude = Math.max(existingZone.maxMagnitude, eq.magnitude);
      } else {
        zones.push({ lat: zoneLat, lon: zoneLon, count: 1, maxMagnitude: eq.magnitude });
      }
    });
    
    return zones.filter(z => z.count >= 2); // Only show zones with 2+ earthquakes
  }, [filteredEarthquakes]);

  return (
    <div className="relative h-full w-full bg-zinc-950">
      {/* World Map Container */}
      <div className="absolute inset-0 flex items-center justify-center p-8">
        <div className="relative w-full h-full max-w-6xl">
          {/* SVG World Map with Hotspots */}
          <svg 
            viewBox="0 0 100 50" 
            className="w-full h-full"
            style={{ filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.5))' }}
          >
            {/* Background Grid */}
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(63, 63, 70, 0.3)" strokeWidth="0.1"/>
              </pattern>
              
              {/* Radial gradients for hotspot zones */}
              {hotspotZones.map((zone, i) => (
                <radialGradient key={`gradient-${i}`} id={`hotspot-${i}`}>
                  <stop offset="0%" stopColor={zone.maxMagnitude >= 6 ? "#ef4444" : "#f97316"} stopOpacity="0.4"/>
                  <stop offset="50%" stopColor={zone.maxMagnitude >= 6 ? "#ef4444" : "#f97316"} stopOpacity="0.2"/>
                  <stop offset="100%" stopColor="transparent" stopOpacity="0"/>
                </radialGradient>
              ))}
            </defs>
            
            {/* World Map Base */}
            <rect width="100" height="50" fill="#0a0a0a" />
            <rect width="100" height="50" fill="url(#grid)" />
            
            {/* Continents Outline (simplified) */}
            <g opacity="0.3" stroke="#3f3f46" strokeWidth="0.2" fill="none">
              {/* North America */}
              <path d="M 10 8 Q 12 6 15 7 L 18 10 L 22 9 L 25 12 L 28 15 Q 30 18 28 20 L 22 25 L 15 23 Q 10 20 10 15 Z" />
              {/* South America */}
              <path d="M 22 25 Q 24 28 23 32 L 21 38 Q 18 40 16 38 L 18 32 Q 20 28 22 25 Z" />
              {/* Europe */}
              <path d="M 48 10 L 52 8 L 55 10 L 54 15 L 50 16 L 48 14 Z" />
              {/* Africa */}
              <path d="M 48 16 Q 50 18 52 20 L 54 28 Q 52 32 48 30 L 46 24 Q 44 20 48 16 Z" />
              {/* Asia */}
              <path d="M 55 10 Q 60 8 70 10 L 78 12 L 82 15 L 80 20 Q 75 18 70 20 L 65 18 L 60 20 Q 55 18 55 15 Z" />
              {/* Australia */}
              <path d="M 75 28 Q 78 26 82 28 L 84 32 Q 82 35 78 34 L 75 32 Z" />
            </g>
            
            {/* Hotspot Zones (Background Glow) */}
            {showEarthquakes && hotspotZones.map((zone, i) => {
              const { x, y } = latLonToXY(zone.lon + 5, zone.lat + 5);
              const radius = Math.min(zone.count * 2, 15);
              return (
                <circle
                  key={`hotspot-${i}`}
                  cx={x}
                  cy={y}
                  r={radius}
                  fill={`url(#hotspot-${i})`}
                  opacity="0.6"
                />
              );
            })}
            
            {/* Earthquake Markers */}
            {showEarthquakes && filteredEarthquakes.map((eq, index) => {
              const [lon, lat] = eq.location.coordinates;
              const { x, y } = latLonToXY(lon, lat);
              const style = getMarkerStyle(eq.magnitude);
              const isHovered = hoveredEarthquake?.id === eq.id;
              
              return (
                <g key={`eq-${index}`}>
                  {/* Pulse animation for larger earthquakes */}
                  {eq.magnitude >= 6.0 && (
                    <circle
                      cx={x}
                      cy={y}
                      r={style.size / 10}
                      fill="none"
                      stroke={style.color}
                      strokeWidth="0.15"
                      opacity="0.4"
                    >
                      <animate
                        attributeName="r"
                        from={style.size / 10}
                        to={style.size / 5}
                        dur="2s"
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="opacity"
                        from="0.6"
                        to="0"
                        dur="2s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  )}
                  
                  {/* Main marker */}
                  <circle
                    cx={x}
                    cy={y}
                    r={isHovered ? style.size / 6 : style.size / 8}
                    fill={style.color}
                    opacity={isHovered ? 1 : style.intensity}
                    stroke="#ffffff"
                    strokeWidth="0.15"
                    className="cursor-pointer transition-all"
                    onMouseEnter={() => setHoveredEarthquake(eq)}
                    onMouseLeave={() => setHoveredEarthquake(null)}
                    onClick={() => onEarthquakeSelect?.(eq)}
                  />
                </g>
              );
            })}
          </svg>
          
          {/* Tooltip for hovered earthquake */}
          {hoveredEarthquake && (
            <div 
              className="absolute pointer-events-none bg-zinc-900/95 border border-zinc-700 rounded-lg p-3 shadow-2xl"
              style={{
                left: `${((hoveredEarthquake.location.coordinates[0] + 180) / 360) * 100}%`,
                top: `${((90 - hoveredEarthquake.location.coordinates[1]) / 180) * 100}%`,
                transform: 'translate(-50%, -120%)',
              }}
            >
              <div className="text-xs space-y-1">
                <p className="font-bold text-zinc-50">
                  M{hoveredEarthquake.magnitude.toFixed(1)} Earthquake
                </p>
                <p className="text-zinc-400">
                  {hoveredEarthquake.place_name}
                </p>
                <p className="text-zinc-500">
                  Depth: {hoveredEarthquake.depth_km.toFixed(1)} km
                </p>
                <p className="text-zinc-500 text-[10px]">
                  {new Date(hoveredEarthquake.event_time).toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Legend */}
      <div className="absolute bottom-6 right-6 bg-zinc-900/90 border border-zinc-800 rounded-lg p-4 backdrop-blur">
        <h4 className="text-xs font-semibold text-zinc-300 mb-2">Magnitude Scale</h4>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500"></div>
            <span className="text-xs text-zinc-400">M7.0+ Major</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span className="text-xs text-zinc-400">M6.0-6.9 Strong</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
            <span className="text-xs text-zinc-400">M5.0-5.9 Moderate</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-xs text-zinc-400">M4.0-4.9 Light</span>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-zinc-800">
          <p className="text-xs text-zinc-500">
            <span className="font-semibold text-zinc-400">{filteredEarthquakes.length}</span> events shown
          </p>
          <p className="text-xs text-zinc-500">
            <span className="font-semibold text-zinc-400">{hotspotZones.length}</span> hotspot zones
          </p>
        </div>
      </div>
      
      {/* Empty State */}
      {filteredEarthquakes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🌍</div>
            <p className="text-zinc-400">No earthquakes M{minMagnitude}+ to display</p>
            <p className="text-xs text-zinc-600 mt-2">Adjust the minimum magnitude filter</p>
          </div>
        </div>
      )}
    </div>
  );
}
