/**
 * Watchman's Dashboard - Earth-Centric View
 * 
 * OpenStreetMap-based visualization showing seismic activity,
 * volcanic eruptions, meteor showers, and other geophysical events.
 */

'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { MainLayout } from '@/components/layout';
import { useEarthquakes, useCorrelations } from '@/lib/hooks';
import { Earthquake } from '@/lib/types';

// Dynamic import to avoid SSR issues with Leaflet
const LeafletEarthquakeMap = dynamic(
  () => import('@/components/visualization/LeafletEarthquakeMap'),
  { ssr: false, loading: () => (
    <div className="flex h-full items-center justify-center bg-zinc-950">
      <div className="text-center">
        <div className="h-12 w-12 mx-auto animate-spin rounded-full border-4 border-zinc-700 border-t-blue-500" />
        <p className="mt-4 text-zinc-300">Loading map...</p>
      </div>
    </div>
  )}
);

export default function WatchmanDashboardPage() {
  const [minMagnitude, setMinMagnitude] = useState(4.0);
  const [selectedEarthquake, setSelectedEarthquake] = useState<Earthquake | null>(null);
  const [showEarthquakes, setShowEarthquakes] = useState(true);
  
  const { earthquakes, loading: eqLoading, totalCount } = useEarthquakes({ 
    minMagnitude, 
    autoRefresh: true 
  });
  const { highConfidenceCount } = useCorrelations({ minConfidence: 0.7 });

  // Get recent significant earthquakes (last 24 hours)
  const recentEarthquakes = earthquakes ? earthquakes.slice(0, 10) : [];

  return (
    <MainLayout title="Watchman's Dashboard" subtitle="Earth-Centric Event Monitoring">
      <div className="relative h-[calc(100vh-4rem)] bg-zinc-950">
        {/* Leaflet Map Canvas */}
        <LeafletEarthquakeMap
          earthquakes={earthquakes || []}
          onEarthquakeSelect={setSelectedEarthquake}
          showEarthquakes={showEarthquakes}
          minMagnitude={minMagnitude}
        />

        {/* Statistics Panel */}
        <div className="absolute left-6 top-6 w-80 space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/90 p-3 backdrop-blur">
              <p className="text-xs text-zinc-400">Earthquakes M4+</p>
              <p className="mt-1 text-2xl font-bold text-zinc-50">{eqLoading ? '...' : totalCount}</p>
            </div>
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/90 p-3 backdrop-blur">
              <p className="text-xs text-zinc-400">Correlations</p>
              <p className="mt-1 text-2xl font-bold text-orange-500">{highConfidenceCount}</p>
            </div>
          </div>

          {/* Recent Events */}
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/90 p-4 backdrop-blur">
            <h3 className="mb-3 font-semibold text-zinc-50">Recent Earthquakes</h3>
            <div className="max-h-96 space-y-2 overflow-y-auto">
              {eqLoading ? (
                <p className="text-sm text-zinc-500">Loading...</p>
              ) : recentEarthquakes.length > 0 ? (
                recentEarthquakes.map((eq) => (
                  <div
                    key={eq.id}
                    className="rounded border border-zinc-800 bg-zinc-950 p-2 text-sm hover:border-zinc-700"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-zinc-50">M {eq.magnitude}</span>
                      <span className={`rounded px-2 py-0.5 text-xs ${
                        eq.magnitude >= 6 ? 'bg-red-500/20 text-red-400' :
                        eq.magnitude >= 5 ? 'bg-orange-500/20 text-orange-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {eq.magnitude >= 6 ? 'Major' : eq.magnitude >= 5 ? 'Strong' : 'Moderate'}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-zinc-400">
                      {eq.location.coordinates[1].toFixed(2)}°N, {eq.location.coordinates[0].toFixed(2)}°E
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      Depth: {eq.depth_km}km | {new Date(eq.event_time).toLocaleString()}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-zinc-500">No recent earthquakes</p>
              )}
            </div>
          </div>
        </div>

        {/* Map Controls */}
        <div className="absolute bottom-6 right-6 rounded-lg border border-zinc-800 bg-zinc-900/90 p-4 backdrop-blur">
          <h3 className="mb-3 font-semibold text-zinc-50">Layer Controls</h3>
          <div className="space-y-2 text-sm">
            <label className="flex items-center gap-2 text-zinc-400 cursor-pointer">
              <input 
                type="checkbox" 
                checked={showEarthquakes}
                onChange={(e) => setShowEarthquakes(e.target.checked)}
                className="rounded" 
              />
              Earthquakes
            </label>
          </div>
          <div className="mt-4">
            <label htmlFor="magnitude-slider" className="text-xs text-zinc-400">
              Min Magnitude
            </label>
            <input
              id="magnitude-slider"
              type="range"
              min="3.0"
              max="7.0"
              step="0.5"
              value={minMagnitude}
              onChange={(e) => setMinMagnitude(parseFloat(e.target.value))}
              className="w-full mt-2"
              aria-label="Minimum earthquake magnitude filter"
            />
            <div className="flex justify-between text-xs text-zinc-500 mt-1">
              <span>M3.0</span>
              <span className="font-bold text-zinc-300">M{minMagnitude.toFixed(1)}</span>
              <span>M7.0</span>
            </div>
          </div>
        </div>

        {/* Selected Earthquake Panel */}
        {selectedEarthquake && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 w-96 rounded-lg border border-orange-800 bg-orange-950/90 p-4 backdrop-blur">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-orange-50">
                M{selectedEarthquake.magnitude.toFixed(1)} Earthquake
              </h3>
              <button
                onClick={() => setSelectedEarthquake(null)}
                className="text-orange-400 hover:text-orange-300"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2 text-sm text-orange-200">
              <p><strong>Location:</strong> {selectedEarthquake.place_name}</p>
              <p><strong>Time:</strong> {new Date(selectedEarthquake.event_time).toLocaleString()}</p>
              <p><strong>Depth:</strong> {selectedEarthquake.depth_km.toFixed(1)} km</p>
              <p><strong>Coordinates:</strong> {selectedEarthquake.location.coordinates[1].toFixed(3)}°, {selectedEarthquake.location.coordinates[0].toFixed(3)}°</p>
              <p><strong>Source:</strong> {selectedEarthquake.event_source}</p>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
