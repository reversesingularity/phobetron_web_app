/**
 * Watchman's Dashboard - Earth-Centric View
 * 
 * OpenStreetMap-based visualization showing seismic activity,
 * volcanic eruptions, meteor showers, and other geophysical events.
 */

'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { MainLayout } from '@/components/layout';
import { useEarthquakes, useCorrelations } from '@/lib/hooks';
import { Earthquake } from '@/lib/types';
import { 
  GlobeAltIcon, 
  ChartBarIcon,
  MapPinIcon,
  AdjustmentsHorizontalIcon 
} from '@heroicons/react/24/outline';

// Dynamic import to avoid SSR issues with Leaflet
const LeafletEarthquakeMap = dynamic(
  () => import('@/components/visualization/LeafletEarthquakeMap'),
  { ssr: false, loading: () => (
    <div className="flex h-full items-center justify-center bg-zinc-950">
      <div className="text-center">
        <div className="h-12 w-12 mx-auto animate-spin rounded-full border-4 border-zinc-700 border-t-cyan-500" />
        <p className="mt-4 text-cyan-300">Loading Earth map...</p>
      </div>
    </div>
  )}
);

export default function WatchmanDashboardPage() {
  const [minMagnitude, setMinMagnitude] = useState(4.0);
  const [selectedEarthquake, setSelectedEarthquake] = useState<Earthquake | null>(null);
  const [showEarthquakes, setShowEarthquakes] = useState(true);
  
  // Stable star positions for celestial background
  const [starPositions] = useState(() =>
    Array.from({ length: 12 }, () => ({
      top: Math.random() * 100,
      left: Math.random() * 100,
      size: Math.random() * 2 + 1,
      duration: Math.random() * 3 + 2,
    }))
  );
  
  const { earthquakes, loading: eqLoading, totalCount } = useEarthquakes({ 
    minMagnitude, 
    autoRefresh: true 
  });
  const { highConfidenceCount } = useCorrelations({ minConfidence: 0.7 });

  // Get recent significant earthquakes (last 24 hours)
  const recentEarthquakes = earthquakes ? earthquakes.slice(0, 10) : [];

  return (
    <MainLayout title="Watchman's Dashboard" subtitle="Earth-Centric Event Monitoring">
      <div className="relative h-[calc(100vh-4rem)] bg-zinc-950 overflow-hidden">
        {/* Celestial Background */}
        <div className="fixed inset-0 pointer-events-none">
          {/* Twinkling Stars */}
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

          {/* Nebula Clouds */}
          <motion.div
            className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 bg-linear-to-br from-cyan-500/10 via-blue-500/5 to-transparent rounded-full blur-3xl"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 bg-linear-to-tr from-purple-500/10 via-pink-500/5 to-transparent rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        {/* Leaflet Map Canvas */}
        <div className="absolute inset-0 z-10">
          <LeafletEarthquakeMap
            earthquakes={earthquakes || []}
            onEarthquakeSelect={setSelectedEarthquake}
            showEarthquakes={showEarthquakes}
            minMagnitude={minMagnitude}
          />
        </div>

        {/* Statistics Panel */}
        <motion.div 
          className="absolute left-6 top-6 w-80 space-y-4 z-20"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Panel Header */}
          <div className="flex items-center gap-2 mb-3">
            <GlobeAltIcon className="h-6 w-6 text-cyan-400" />
            <h2 className="text-xl font-bold bg-linear-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Earth Monitor
            </h2>
          </div>

          {/* Summary Cards */}
          <motion.div 
            className="grid grid-cols-2 gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            <motion.div 
              className="rounded-xl border border-cyan-500/20 bg-linear-to-br from-zinc-900/90 to-zinc-950/90 p-4 backdrop-blur-xl shadow-lg"
              whileHover={{ scale: 1.02, translateY: -2 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className="flex items-center gap-2 mb-1">
                <ChartBarIcon className="h-4 w-4 text-cyan-400" />
                <p className="text-xs font-medium text-cyan-400/80">Earthquakes M4+</p>
              </div>
              <p className="text-3xl font-bold text-cyan-50 tracking-tight">
                {eqLoading ? '...' : totalCount}
              </p>
            </motion.div>
            
            <motion.div 
              className="rounded-xl border border-orange-500/20 bg-linear-to-br from-zinc-900/90 to-zinc-950/90 p-4 backdrop-blur-xl shadow-lg"
              whileHover={{ scale: 1.02, translateY: -2 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className="flex items-center gap-2 mb-1">
                <MapPinIcon className="h-4 w-4 text-orange-400" />
                <p className="text-xs font-medium text-orange-400/80">Correlations</p>
              </div>
              <p className="text-3xl font-bold text-orange-400 tracking-tight">
                {highConfidenceCount}
              </p>
            </motion.div>
          </motion.div>

          {/* Recent Events */}
          <motion.div 
            className="rounded-xl border border-cyan-500/20 bg-linear-to-br from-zinc-900/90 to-zinc-950/90 p-5 backdrop-blur-xl shadow-lg"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <h3 className="mb-4 text-lg font-bold bg-linear-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Recent Earthquakes
            </h3>
            <div className="max-h-96 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
              {eqLoading ? (
                <p className="text-sm text-zinc-400">Loading...</p>
              ) : recentEarthquakes.length > 0 ? (
                recentEarthquakes.map((eq, idx) => (
                  <motion.div
                    key={eq.id}
                    className="rounded-lg border border-zinc-700/50 bg-zinc-950/80 p-3 text-sm hover:border-cyan-500/30 hover:bg-zinc-900/80 transition-all cursor-pointer"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05, duration: 0.3 }}
                    whileHover={{ x: 4, transition: { duration: 0.2 } }}
                    onClick={() => setSelectedEarthquake(eq)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-lg font-bold text-cyan-50">M {eq.magnitude}</span>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        eq.magnitude >= 6 ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                        eq.magnitude >= 5 ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                        'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                      }`}>
                        {eq.magnitude >= 6 ? 'Major' : eq.magnitude >= 5 ? 'Strong' : 'Moderate'}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-300 mb-1">
                      📍 {eq.location.coordinates[1].toFixed(2)}°N, {eq.location.coordinates[0].toFixed(2)}°E
                    </p>
                    <p className="text-xs text-zinc-500">
                      ⬇️ Depth: {eq.depth_km}km • 🕐 {new Date(eq.event_time).toLocaleString()}
                    </p>
                  </motion.div>
                ))
              ) : (
                <p className="text-sm text-zinc-500">No recent earthquakes</p>
              )}
            </div>
          </motion.div>
        </motion.div>

        {/* Map Controls */}
        <motion.div 
          className="absolute bottom-6 right-6 rounded-xl border border-cyan-500/20 bg-linear-to-br from-zinc-900/90 to-zinc-950/90 p-5 backdrop-blur-xl shadow-lg z-20"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <AdjustmentsHorizontalIcon className="h-5 w-5 text-cyan-400" />
            <h3 className="font-bold text-cyan-50">Layer Controls</h3>
          </div>
          
          <div className="space-y-3 text-sm">
            <label className="flex items-center gap-3 text-zinc-300 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={showEarthquakes}
                onChange={(e) => setShowEarthquakes(e.target.checked)}
                className="rounded border-zinc-600 bg-zinc-900 text-cyan-500 focus:ring-2 focus:ring-cyan-500/20" 
              />
              <span className="group-hover:text-cyan-400 transition-colors">
                Earthquakes
              </span>
            </label>
          </div>
          
          <div className="mt-5 pt-4 border-t border-zinc-700/50">
            <label htmlFor="magnitude-slider" className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-cyan-400/80">Min Magnitude</span>
              <span className="text-sm font-bold text-cyan-400">M{minMagnitude.toFixed(1)}</span>
            </label>
            <input
              id="magnitude-slider"
              type="range"
              min="3.0"
              max="7.0"
              step="0.5"
              value={minMagnitude}
              onChange={(e) => setMinMagnitude(parseFloat(e.target.value))}
              className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              aria-label="Minimum earthquake magnitude filter"
            />
            <div className="flex justify-between text-xs text-zinc-500 mt-2">
              <span>M3.0</span>
              <span>M7.0</span>
            </div>
          </div>
        </motion.div>

        {/* Selected Earthquake Panel */}
        {selectedEarthquake && (
          <motion.div 
            className="absolute top-6 left-1/2 -translate-x-1/2 w-[420px] rounded-xl border border-orange-500/30 bg-linear-to-br from-orange-950/95 to-zinc-950/95 p-6 backdrop-blur-xl shadow-2xl z-30"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/20 border border-orange-500/30">
                  <MapPinIcon className="h-6 w-6 text-orange-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-orange-50">
                    M{selectedEarthquake.magnitude.toFixed(1)} Earthquake
                  </h3>
                  <p className="text-sm text-orange-300/70">Event Details</p>
                </div>
              </div>
              <motion.button
                onClick={() => setSelectedEarthquake(null)}
                className="p-2 rounded-lg text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 transition-all"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Close earthquake details"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="p-3 rounded-lg bg-zinc-900/50 border border-orange-500/20">
                <p className="text-orange-400/70 text-xs mb-1">Location</p>
                <p className="text-orange-100 font-medium">{selectedEarthquake.place_name}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-zinc-900/50 border border-orange-500/20">
                  <p className="text-orange-400/70 text-xs mb-1">Time</p>
                  <p className="text-orange-100 font-medium">
                    {new Date(selectedEarthquake.event_time).toLocaleString()}
                  </p>
                </div>
                
                <div className="p-3 rounded-lg bg-zinc-900/50 border border-orange-500/20">
                  <p className="text-orange-400/70 text-xs mb-1">Depth</p>
                  <p className="text-orange-100 font-medium">{selectedEarthquake.depth_km.toFixed(1)} km</p>
                </div>
              </div>
              
              <div className="p-3 rounded-lg bg-zinc-900/50 border border-orange-500/20">
                <p className="text-orange-400/70 text-xs mb-1">Coordinates</p>
                <p className="text-orange-100 font-medium font-mono">
                  {selectedEarthquake.location.coordinates[1].toFixed(3)}°, {selectedEarthquake.location.coordinates[0].toFixed(3)}°
                </p>
              </div>
              
              <div className="p-3 rounded-lg bg-zinc-900/50 border border-orange-500/20">
                <p className="text-orange-400/70 text-xs mb-1">Source</p>
                <p className="text-orange-100 font-medium">{selectedEarthquake.event_source}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Custom Scrollbar Styles */}
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
