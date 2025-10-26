/**
 * Cesium Earth Dashboard - Simplified Version
 * 
 * Note: Full Cesium integration requires additional Next.js configuration
 * This is a placeholder that will be enhanced in the next iteration.
 * For now, we'll use a 2D earthquake map visualization.
 */

'use client';

import { useMemo } from 'react';
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
  const filteredEarthquakes = useMemo(
    () => earthquakes.filter((eq) => eq.magnitude >= minMagnitude),
    [earthquakes, minMagnitude]
  );

  const handleEarthquakeClick = (earthquake: Earthquake) => {
    if (onEarthquakeSelect) {
      onEarthquakeSelect(earthquake);
    }
  };

  return (
    <div className="relative h-full w-full bg-zinc-950">
      {/* Placeholder for 3D Globe - Will be replaced with Cesium.js */}
      <div className="flex h-full flex-col items-center justify-center">
        <div className="text-center max-w-2xl">
          <div className="mb-4 text-6xl animate-pulse">🌍</div>
          <h2 className="text-2xl font-bold text-zinc-50">
            Cesium Earth Dashboard
          </h2>
          <p className="mt-2 text-zinc-400">
            3D Globe visualization coming soon!
          </p>
          
          <div className="mt-6 rounded-lg bg-blue-950/50 border border-blue-800 p-4">
            <h3 className="font-semibold text-blue-300 mb-2">
              📊 Current Data:
            </h3>
            <div className="space-y-1 text-sm text-blue-200">
              <p>
                {showEarthquakes ? filteredEarthquakes.length : 0} earthquakes M
                {minMagnitude}+
              </p>
              <p>Ready for Cesium.js integration</p>
            </div>
          </div>

          {/* Show recent earthquakes list */}
          {showEarthquakes && filteredEarthquakes.length > 0 && (
            <div className="mt-6 max-h-96 overflow-y-auto rounded-lg bg-zinc-900/50 border border-zinc-700 p-4">
              <h3 className="font-semibold text-zinc-300 mb-3">
                Recent Earthquakes (M{minMagnitude}+)
              </h3>
              <div className="space-y-2">
                {filteredEarthquakes.slice(0, 10).map((eq, index) => (
                  <button
                    key={index}
                    onClick={() => handleEarthquakeClick(eq)}
                    className="w-full text-left p-3 rounded bg-zinc-800/50 hover:bg-zinc-700/50 border border-zinc-700 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-semibold text-zinc-100">
                          M{eq.magnitude.toFixed(1)} - {eq.place_name}
                        </p>
                        <p className="text-xs text-zinc-400 mt-1">
                          {new Date(eq.event_time).toLocaleString()}
                        </p>
                      </div>
                      <div className={`px-2 py-1 rounded text-xs font-bold ${
                        eq.magnitude >= 7.0 ? 'bg-red-500 text-white' :
                        eq.magnitude >= 6.0 ? 'bg-orange-500 text-white' :
                        eq.magnitude >= 5.0 ? 'bg-yellow-500 text-black' :
                        'bg-green-500 text-white'
                      }`}>
                        M{eq.magnitude.toFixed(1)}
                      </div>
                    </div>
                    <p className="text-xs text-zinc-500 mt-1">
                      Depth: {eq.depth_km.toFixed(1)} km
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
