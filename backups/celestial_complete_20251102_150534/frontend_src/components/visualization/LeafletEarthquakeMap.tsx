/**
 * Leaflet Earthquake Map
 * 
 * Interactive OpenStreetMap visualization with earthquake hotspots
 * using Leaflet and React-Leaflet.
 */

'use client';

import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import type { Earthquake } from '@/lib/types';
import 'leaflet/dist/leaflet.css';

interface LeafletEarthquakeMapProps {
  earthquakes?: Earthquake[];
  onEarthquakeSelect?: (earthquake: Earthquake) => void;
  showEarthquakes?: boolean;
  minMagnitude?: number;
}

// Component to fit bounds to earthquakes
function FitBounds({ earthquakes }: { earthquakes: Earthquake[] }) {
  const map = useMap();
  
  useEffect(() => {
    if (earthquakes.length > 0) {
      const bounds = earthquakes.map(eq => [
        eq.location.coordinates[1], // lat
        eq.location.coordinates[0]  // lon
      ] as [number, number]);
      
      if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 5 });
      }
    }
  }, [earthquakes, map]);
  
  return null;
}

export default function LeafletEarthquakeMap({
  earthquakes = [],
  onEarthquakeSelect,
  showEarthquakes = true,
  minMagnitude = 4.0,
}: LeafletEarthquakeMapProps) {
  const filteredEarthquakes = useMemo(
    () => earthquakes.filter((eq) => eq.magnitude >= minMagnitude),
    [earthquakes, minMagnitude]
  );

  // Get color and size based on magnitude
  const getMarkerStyle = (magnitude: number) => {
    if (magnitude >= 7.0) {
      return { color: '#ef4444', fillColor: '#ef4444', radius: 20, weight: 2 }; // red
    } else if (magnitude >= 6.0) {
      return { color: '#f97316', fillColor: '#f97316', radius: 16, weight: 2 }; // orange
    } else if (magnitude >= 5.0) {
      return { color: '#eab308', fillColor: '#eab308', radius: 12, weight: 2 }; // yellow
    } else {
      return { color: '#22c55e', fillColor: '#22c55e', radius: 8, weight: 1.5 }; // green
    }
  };

  // Get magnitude label
  const getMagnitudeLabel = (magnitude: number) => {
    if (magnitude >= 7.0) return 'Major';
    if (magnitude >= 6.0) return 'Strong';
    if (magnitude >= 5.0) return 'Moderate';
    return 'Light';
  };

  if (typeof window === 'undefined') {
    return (
      <div className="flex h-full items-center justify-center bg-zinc-950">
        <p className="text-zinc-400">Loading map...</p>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={[20, 0]}
        zoom={2}
        style={{ height: '100%', width: '100%', background: '#18181b' }}
        zoomControl={true}
      >
        {/* OpenStreetMap Dark Theme */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="map-tiles"
        />
        
        {/* Earthquake Markers */}
        {showEarthquakes && filteredEarthquakes.map((eq, index) => {
          const [lon, lat] = eq.location.coordinates;
          const style = getMarkerStyle(eq.magnitude);
          
          return (
            <CircleMarker
              key={`eq-${index}`}
              center={[lat, lon]}
              pathOptions={{
                ...style,
                fillOpacity: 0.6,
                opacity: 0.8,
              }}
              radius={style.radius}
              eventHandlers={{
                click: () => onEarthquakeSelect?.(eq),
              }}
            >
              <Popup>
                <div className="text-sm">
                  <div className="font-bold text-zinc-900">
                    M{eq.magnitude.toFixed(1)} - {getMagnitudeLabel(eq.magnitude)}
                  </div>
                  <div className="mt-1 text-zinc-700">
                    {eq.place_name || eq.region}
                  </div>
                  <div className="mt-1 text-xs text-zinc-600">
                    Depth: {eq.depth_km.toFixed(1)} km
                  </div>
                  <div className="mt-1 text-xs text-zinc-600">
                    {new Date(eq.event_time).toLocaleString()}
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
        
        {/* Auto-fit bounds to earthquakes */}
        <FitBounds earthquakes={filteredEarthquakes} />
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-6 right-6 z-[1000] bg-zinc-900/95 border border-zinc-800 rounded-lg p-4 backdrop-blur shadow-2xl">
        <h4 className="text-xs font-semibold text-zinc-200 mb-2">Magnitude Scale</h4>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-white"></div>
            <span className="text-xs text-zinc-300">M7.0+ Major</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500 border-2 border-white"></div>
            <span className="text-xs text-zinc-300">M6.0-6.9 Strong</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 border-2 border-white"></div>
            <span className="text-xs text-zinc-300">M5.0-5.9 Moderate</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 border border-white"></div>
            <span className="text-xs text-zinc-300">M4.0-4.9 Light</span>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-zinc-700">
          <p className="text-xs text-zinc-400">
            <span className="font-semibold text-zinc-200">{filteredEarthquakes.length}</span> events shown
          </p>
        </div>
      </div>

      {/* Empty State */}
      {filteredEarthquakes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/50 backdrop-blur-sm z-[999]">
          <div className="text-center bg-zinc-900/90 border border-zinc-800 rounded-lg p-8">
            <div className="text-6xl mb-4">🌍</div>
            <p className="text-zinc-300 font-medium">No earthquakes M{minMagnitude}+ to display</p>
            <p className="text-xs text-zinc-500 mt-2">Adjust the minimum magnitude filter</p>
          </div>
        </div>
      )}

      {/* Loading overlay if no data yet */}
      {earthquakes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm z-[999]">
          <div className="text-center">
            <div className="h-12 w-12 mx-auto animate-spin rounded-full border-4 border-zinc-700 border-t-blue-500" />
            <p className="mt-4 text-zinc-300">Loading earthquake data...</p>
          </div>
        </div>
      )}
      
      <style jsx global>{`
        .leaflet-container {
          background: #18181b !important;
        }
        .leaflet-tile-pane {
          opacity: 0.7;
        }
        .leaflet-popup-content-wrapper {
          background: white;
          border-radius: 8px;
        }
        .leaflet-popup-tip {
          background: white;
        }
        .leaflet-control-zoom {
          border: 1px solid #3f3f46 !important;
          background: rgba(24, 24, 27, 0.95) !important;
          backdrop-filter: blur(8px);
        }
        .leaflet-control-zoom a {
          background: transparent !important;
          color: #d4d4d8 !important;
          border-bottom: 1px solid #3f3f46 !important;
        }
        .leaflet-control-zoom a:hover {
          background: rgba(63, 63, 70, 0.5) !important;
          color: white !important;
        }
        .leaflet-control-attribution {
          background: rgba(24, 24, 27, 0.8) !important;
          color: #a1a1aa !important;
          font-size: 10px !important;
        }
        .leaflet-control-attribution a {
          color: #60a5fa !important;
        }
      `}</style>
    </div>
  );
}
