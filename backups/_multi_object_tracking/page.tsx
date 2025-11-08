/**
 * Solar System Module - TheSkyLive.com Implementation
 * 
 * Professional-grade interactive solar system featuring:
 * - Pure THREE.js imperative rendering
 * - Keplerian orbital elements with time-dependent updates
 * - Battle-tested TheSkyLive.com color schemes
 * - Proven orbit calculations and mechanics
 * - Simple sprite-based planet rendering
 * - Scene rotation animation
 * - Minimalist approach for performance
 */

'use client';

import { useState, Suspense, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { MainLayout } from '@/components/layout';
import {
  useEphemeris,
  useOrbitalElements,
  useCloseApproaches,
} from '@/lib/hooks';

// Dynamically import TheSkyLive Three.js component (client-side only)
const TheSkyLiveCanvas = dynamic(
  () => import('@/components/visualization/TheSkyLiveCanvas'),
  { ssr: false }
);

export default function SolarSystemPage() {
  const { loading: ephemerisLoading } = useEphemeris({
    autoRefresh: true,
    refreshInterval: 60000,
  });
  const { loading: orbitalLoading } = useOrbitalElements({
    autoRefresh: true,
    refreshInterval: 300000,
  });
  const { loading: approachesLoading } = useCloseApproaches({
    autoRefresh: true,
    refreshInterval: 300000,
  });

  // Enhanced state management
  const [speedMultiplier, setSpeedMultiplier] = useState(0.5); // Start slower (0.5 hours per frame)
  const [isPaused, setIsPaused] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [showOrbits, setShowOrbits] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [selectedPlanetName, setSelectedPlanetName] = useState<string | null>(null);
  const [currentSimulationTime, setCurrentSimulationTime] = useState<number>(() => Date.now());
  const [cameraControls, setCameraControls] = useState<{
    setTopView: () => void;
    setSideView: () => void;
    setEarthFocus: () => void;
    resetView: () => void;
    jumpTime: (milliseconds: number) => void;
    resetToToday: () => void;
  } | null>(null);

  const loading = ephemerisLoading || orbitalLoading || approachesLoading;

  const handlePlanetSelect = useCallback((planetName: string) => {
    setSelectedPlanetName(planetName);
  }, []);

  const handleTimeUpdate = useCallback((time: number) => {
    setCurrentSimulationTime(time);
  }, []);

  const handleCameraControlsReady = useCallback((controls: {
    setTopView: () => void;
    setSideView: () => void;
    setEarthFocus: () => void;
    resetView: () => void;
    jumpTime: (milliseconds: number) => void;
    resetToToday: () => void;
  }) => {
    setCameraControls(controls);
  }, []);

  return (
    <MainLayout
      title="Solar System Explorer"
      subtitle="TheSkyLive.com Implementation - Keplerian Orbital Mechanics"
    >
      <div className="h-[calc(100vh-4rem)] bg-black">
        {/* Three.js Canvas */}
        <Suspense
          fallback={
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-6 h-24 w-24 animate-spin rounded-full border-4 border-zinc-700 border-t-blue-500" />
                <h2 className="text-2xl font-bold text-zinc-50">
                  Initializing Solar System...
                </h2>
                <p className="mt-2 text-zinc-400">
                  Loading Three.js renderer and celestial data
                </p>
              </div>
            </div>
          }
        >
          <TheSkyLiveCanvas
            showGrid={showGrid}
            showOrbits={showOrbits}
            showLabels={showLabels}
            speedMultiplier={speedMultiplier}
            isPaused={isPaused}
            onPlanetSelect={handlePlanetSelect}
            onTimeUpdate={handleTimeUpdate}
            onCameraControlsReady={handleCameraControlsReady}
          />
        </Suspense>

        {/* Control Panel Overlay */}
        <div className="absolute bottom-6 left-24 w-80 rounded-lg border border-zinc-800 bg-zinc-900/95 p-4 backdrop-blur-md shadow-xl z-50">
          <h3 className="mb-4 font-semibold text-zinc-50 flex items-center gap-2">
            ⏰ Time Machine
          </h3>
          
          {/* Current Date/Time Display */}
          <div className="mb-4 rounded-lg bg-zinc-950/50 p-3 text-center">
            <div className="text-xs text-zinc-400 mb-1">Current Simulation Date</div>
            <div className="text-lg font-mono font-bold text-blue-400">
              {new Date(currentSimulationTime).toLocaleDateString('en-US', { 
                month: 'short', 
                day: '2-digit', 
                year: 'numeric' 
              })}
            </div>
            <div className="text-sm font-mono text-zinc-500">
              {new Date(currentSimulationTime).toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false
              })}
            </div>
          </div>

          {/* Quick Jump Buttons */}
          <div className="mb-4 border-t border-zinc-800 pt-4">
            <label className="mb-2 block text-xs font-medium text-zinc-400">
              🚀 Quick Time Jump
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => cameraControls?.jumpTime(-31536000000)} // -1 year
                className="px-3 py-2 text-xs rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                disabled={!cameraControls}
              >
                ⏪ -1 Year
              </button>
              <button
                onClick={() => cameraControls?.jumpTime(31536000000)} // +1 year
                className="px-3 py-2 text-xs rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                disabled={!cameraControls}
              >
                ⏩ +1 Year
              </button>
              <button
                onClick={() => cameraControls?.jumpTime(-2592000000)} // -30 days (1 month approx)
                className="px-3 py-2 text-xs rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                disabled={!cameraControls}
              >
                ⏪ -1 Month
              </button>
              <button
                onClick={() => cameraControls?.jumpTime(2592000000)} // +30 days
                className="px-3 py-2 text-xs rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                disabled={!cameraControls}
              >
                ⏩ +1 Month
              </button>
              <button
                onClick={() => cameraControls?.jumpTime(-604800000)} // -7 days
                className="px-3 py-2 text-xs rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                disabled={!cameraControls}
              >
                ⏪ -7 Days
              </button>
              <button
                onClick={() => cameraControls?.jumpTime(604800000)} // +7 days
                className="px-3 py-2 text-xs rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                disabled={!cameraControls}
              >
                ⏩ +7 Days
              </button>
            </div>
          </div>

          {/* Special Events */}
          <div className="mb-4 border-t border-zinc-800 pt-4">
            <label className="mb-2 block text-xs font-medium text-zinc-400">
              ✨ Jump to Events
            </label>
            <div className="space-y-2">
              <button
                onClick={() => cameraControls?.resetToToday()}
                className="w-full px-3 py-2 text-xs rounded bg-blue-600 hover:bg-blue-500 text-white transition-colors flex items-center justify-center gap-2"
                disabled={!cameraControls}
              >
                🏠 Reset to Today
              </button>
              <button
                onClick={() => {
                  // Jump to next major planetary conjunction (approximate)
                  // For demo: jump 6 months forward
                  cameraControls?.jumpTime(15552000000); // ~180 days
                }}
                className="w-full px-3 py-2 text-xs rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                disabled={!cameraControls}
              >
                🌟 Next Planetary Alignment
              </button>
              <button
                onClick={() => {
                  // Jump to next total solar eclipse: August 12, 2026
                  const eclipseDate = new Date('2026-08-12T00:00:00Z').getTime();
                  const jumpAmount = eclipseDate - currentSimulationTime;
                  if (jumpAmount > 0) {
                    cameraControls?.jumpTime(jumpAmount);
                  }
                }}
                className="w-full px-3 py-2 text-xs rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                disabled={!cameraControls}
              >
                🌑 Next Solar Eclipse (2026)
              </button>
            </div>
          </div>

          {/* Camera Presets */}
          <div className="border-t border-zinc-800 pt-4">
            <label className="mb-2 block text-xs font-medium text-zinc-400">
              📷 Camera Presets
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => cameraControls?.setTopView()}
                className="px-3 py-2 text-xs rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                disabled={!cameraControls}
              >
                🔝 Top View
              </button>
              <button
                onClick={() => cameraControls?.setSideView()}
                className="px-3 py-2 text-xs rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                disabled={!cameraControls}
              >
                👁️ Side View
              </button>
              <button
                onClick={() => cameraControls?.setEarthFocus()}
                className="px-3 py-2 text-xs rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                disabled={!cameraControls}
              >
                🌍 Earth Focus
              </button>
              <button
                onClick={() => cameraControls?.resetView()}
                className="px-3 py-2 text-xs rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                disabled={!cameraControls}
              >
                🔄 Reset View
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Controls Panel */}
        <div className="absolute bottom-6 right-6 w-80 rounded-lg border border-zinc-800 bg-zinc-900/95 p-4 backdrop-blur-md shadow-xl z-50">
          <h3 className="mb-4 font-semibold text-zinc-50 flex items-center gap-2">
            🎮 Controls
          </h3>
          
          {/* Orbital Speed Control */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-zinc-400">
                Orbital Speed
              </label>
              <span className="text-sm font-mono text-blue-400">
                {speedMultiplier.toFixed(1)}x
              </span>
            </div>
            <input
              type="range"
              min="0.1"
              max="5"
              step="0.1"
              value={speedMultiplier}
              onChange={(e) => setSpeedMultiplier(parseFloat(e.target.value))}
              className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:cursor-pointer"
            />
            <div className="flex justify-between mt-1 text-xs text-zinc-600">
              <span>0.1x</span>
              <span className="text-zinc-500">1 hour per frame</span>
              <span>5x</span>
            </div>
          </div>

          {/* Pause/Resume Button */}
          <div className="mb-4">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                isPaused
                  ? 'bg-green-600 hover:bg-green-500 text-white'
                  : 'bg-yellow-600 hover:bg-yellow-500 text-white'
              }`}
            >
              {isPaused ? '▶️ Resume' : '⏸️ Pause'} Simulation
            </button>
          </div>

          {/* Visibility Toggles */}
          <div className="space-y-2 border-t border-zinc-800 pt-4">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-zinc-300">Show Grid</span>
              <input
                type="checkbox"
                checked={showGrid}
                onChange={(e) => setShowGrid(e.target.checked)}
                className="h-5 w-5 rounded border-zinc-700 bg-zinc-800 text-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
              />
            </label>
            
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-zinc-300">Show Orbits</span>
              <input
                type="checkbox"
                checked={showOrbits}
                onChange={(e) => setShowOrbits(e.target.checked)}
                className="h-5 w-5 rounded border-zinc-700 bg-zinc-800 text-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
              />
            </label>
            
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-zinc-300">Show Labels</span>
              <input
                type="checkbox"
                checked={showLabels}
                onChange={(e) => setShowLabels(e.target.checked)}
                className="h-5 w-5 rounded border-zinc-700 bg-zinc-800 text-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
              />
            </label>
          </div>

          {/* Camera Controls Info */}
          <div className="mt-4 rounded-lg bg-zinc-950/50 p-3 text-xs text-zinc-400 space-y-1 border-t border-zinc-800 pt-4">
            <p className="font-medium text-zinc-300 mb-2">🖱️ Camera Controls:</p>
            <p>• <span className="text-zinc-500">Left Click + Drag:</span> Rotate</p>
            <p>• <span className="text-zinc-500">Right Click + Drag:</span> Pan</p>
            <p>• <span className="text-zinc-500">Scroll Wheel:</span> Zoom</p>
            <p>• <span className="text-zinc-500">Click Planet:</span> Select</p>
          </div>
        </div>

        {/* Simple Stats Panel */}
        <div className="absolute right-6 top-6 w-80 rounded-lg border border-zinc-800 bg-zinc-900/95 p-4 backdrop-blur-md shadow-xl">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold text-zinc-50">System Status</h3>
            {loading && (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-700 border-t-blue-500" />
            )}
          </div>

          <div className="space-y-3 text-sm">
            <div className="rounded-lg bg-zinc-950/50 p-3">
              <p className="text-xs text-zinc-400 mb-1">Celestial Objects Tracked</p>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div>
                  <p className="text-lg font-bold text-blue-400">8</p>
                  <p className="text-xs text-zinc-500">Planets</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-amber-400">6</p>
                  <p className="text-xs text-zinc-500">Asteroids</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-cyan-400">4</p>
                  <p className="text-xs text-zinc-500">Comets</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-red-400">2</p>
                  <p className="text-xs text-zinc-500">NEOs</p>
                </div>
              </div>
              <p className="text-center text-xs text-zinc-400 mt-2">Total: 20 objects</p>
            </div>

            <div className="rounded-lg bg-zinc-950/50 p-3">
              <p className="text-xs text-zinc-400 mb-1">Orbital Data Points</p>
              <p className="text-2xl font-bold text-green-400">
                -
              </p>
            </div>

            <div className="rounded-lg bg-zinc-950/50 p-3">
              <p className="text-xs text-zinc-400 mb-1">Close Approaches</p>
              <p className="text-2xl font-bold text-red-400">
                -
              </p>
            </div>

            <div className="border-t border-zinc-800 pt-3">
              <p className="text-xs text-zinc-400 mb-2">Implementation Notes</p>
              <ul className="space-y-1 text-xs text-zinc-500">
                <li>• Pure THREE.js rendering</li>
                <li>• No React Three Fiber overhead</li>
                <li>• Multi-object tracking (20+ objects)</li>
                <li>• Keplerian mechanics (accurate)</li>
                <li>• Type-specific visual styling</li>
                <li>• Scene rotation (TheSkyLive style)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
