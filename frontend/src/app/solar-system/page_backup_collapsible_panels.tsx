/**
 * Solar System Module - Celestial Signs Implementation
 * 
 * Professional-grade interactive solar system featuring:
 * - Pure THREE.js imperative rendering
 * - Keplerian orbital elements with time-dependent updates
 * - Accurate celestial body color schemes
 * - Proven orbit calculations and mechanics
 * - Enhanced moon systems with phases
 * - Scene rotation animation
 * - Optimized for performance
 */

'use client';

import { useState, Suspense, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { MainLayout } from '@/components/layout';
import TimeControlsPanel from '@/components/visualization/TimeControlsPanel';
import {
  useEphemeris,
  useOrbitalElements,
  useCloseApproaches,
} from '@/lib/hooks';
import { getAllCelestialEvents } from '@/lib/utils/celestialCalculations';
import { CelestialEvent } from '@/lib/types/celestial';
import { showToast } from '@/lib/toast';

// Dynamically import Celestial Canvas Three.js component (client-side only)
const CelestialCanvas = dynamic(
  () => import('@/components/visualization/CelestialCanvas'),
  { ssr: false }
);

export default function SolarSystemPage() {
  const searchParams = useSearchParams();
  const eventId = searchParams?.get('eventId');
  const jumpToDate = searchParams?.get('date');
  
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
  const [speedMultiplier, setSpeedMultiplier] = useState(1.0); // Start at realtime (1 hour per frame)
  const [isPaused, setIsPaused] = useState(false); // Running by default
  const [showGrid, setShowGrid] = useState(true);
  const [showOrbits, setShowOrbits] = useState(true);
  const [currentEvent, setCurrentEvent] = useState<CelestialEvent | null>(null);
  const [celestialEvents, setCelestialEvents] = useState<CelestialEvent[]>([]);
  
  // Load celestial events for visualization
  useEffect(() => {
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 2); // 2 years ago
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 5); // 5 years ahead
    
    const events = getAllCelestialEvents(startDate, endDate);
    setCelestialEvents(events);
    
    // If eventId is provided, find and highlight that event
    if (eventId) {
      const event = events.find(e => e.id === eventId);
      if (event) {
        setCurrentEvent(event);
        showToast.eventAlert(`Viewing: ${event.title}`);
      }
    }
    
    // If date is provided, find event closest to that date
    if (jumpToDate && !eventId) {
      const targetDate = new Date(jumpToDate);
      const closestEvent = events.reduce((prev, curr) => {
        const prevDiff = Math.abs(prev.eventDate.getTime() - targetDate.getTime());
        const currDiff = Math.abs(curr.eventDate.getTime() - targetDate.getTime());
        return currDiff < prevDiff ? curr : prev;
      });
      
      if (closestEvent) {
        setCurrentEvent(closestEvent);
        showToast.eventAlert(`Nearest event: ${closestEvent.title}`);
      }
    }
  }, [eventId, jumpToDate]);
  const [showLabels, setShowLabels] = useState(true);
  const [showConstellations, setShowConstellations] = useState(false);
  const [selectedPlanetName, setSelectedPlanetName] = useState<string | null>(null);
  const [currentSimulationTime, setCurrentSimulationTime] = useState<number>(() => Date.now());
  const [isTimeControlsOpen, setIsTimeControlsOpen] = useState(false); // Minimized by default for cleaner view
  const [isControlsOpen, setIsControlsOpen] = useState(false); // Minimized by default
  const [isStatsOpen, setIsStatsOpen] = useState(false); // System Status minimized by default
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

  // Time controls handlers
  const handlePlayPause = useCallback(() => {
    setIsPaused(!isPaused);
  }, [isPaused]);

  const handleSpeedChange = useCallback((speed: number) => {
    setSpeedMultiplier(speed);
  }, []);

  const handleTimeJump = useCallback((milliseconds: number) => {
    cameraControls?.jumpTime(milliseconds);
  }, [cameraControls]);

  const handleDateChange = useCallback((date: Date) => {
    const jumpAmount = date.getTime() - currentSimulationTime;
    cameraControls?.jumpTime(jumpAmount);
  }, [cameraControls, currentSimulationTime]);

  return (
    <MainLayout
      title="Solar System Explorer"
      subtitle="Real-time 3D visualization with Keplerian Orbital Mechanics"
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
          <CelestialCanvas
            showGrid={showGrid}
            showOrbits={showOrbits}
            showLabels={showLabels}
            showConstellations={showConstellations}
            speedMultiplier={speedMultiplier}
            isPaused={isPaused}
            onPlanetSelect={handlePlanetSelect}
            onTimeUpdate={handleTimeUpdate}
            onCameraControlsReady={handleCameraControlsReady}
          />
        </Suspense>

        {/* Time Controls Panel - Collapsible on ALL screen sizes */}
        <div className="fixed bottom-4 left-20 lg:left-72 z-40">
          {/* Minimize/Expand Button - Always visible */}
          <button
            onClick={() => setIsTimeControlsOpen(!isTimeControlsOpen)}
            className="absolute -top-3 -left-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-red-500 text-white shadow-lg hover:bg-red-600 transition-colors ring-2 ring-white"
            aria-label={isTimeControlsOpen ? "Minimize time controls" : "Expand time controls"}
          >
            {isTimeControlsOpen ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </button>

          <div className={`
            transition-all duration-300 ease-in-out
            ${isTimeControlsOpen 
              ? 'opacity-100 scale-100 translate-y-0' 
              : 'opacity-0 scale-95 translate-y-4 pointer-events-none'
            }
          `}>
            <TimeControlsPanel
              currentTime={currentSimulationTime}
              isPaused={isPaused}
              speedMultiplier={speedMultiplier}
              onPlayPause={handlePlayPause}
              onSpeedChange={handleSpeedChange}
              onTimeJump={handleTimeJump}
              onDateChange={handleDateChange}
            />
          </div>
        </div>

        {/* Enhanced Controls Panel - Collapsible on ALL screen sizes */}
        <div className={`fixed right-4 z-30 transition-all duration-300 ${isControlsOpen ? 'bottom-4' : 'bottom-4'}`}>
          {/* Toggle Button - Always visible */}
          <button
            onClick={() => setIsControlsOpen(!isControlsOpen)}
            className="mb-2 ml-auto flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 shadow-lg hover:bg-zinc-700 hover:text-zinc-50 transition-all"
            aria-label={isControlsOpen ? "Close controls" : "Open controls"}
          >
            {isControlsOpen ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            )}
          </button>

          <div className={`
            w-80 rounded-lg border border-zinc-800 bg-zinc-900/95 backdrop-blur-md shadow-xl transition-all duration-300 ease-in-out overflow-y-auto
            ${isControlsOpen 
              ? 'max-h-[calc(100vh-8rem)] p-4 opacity-100 scale-100' 
              : 'max-h-0 p-0 opacity-0 scale-95 pointer-events-none'
            }
          `}>
          <h3 className="mb-4 font-semibold text-zinc-50 flex items-center gap-2">
            🎮 Controls
          </h3>
          
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
            
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-zinc-300">Show Constellations</span>
              <input
                type="checkbox"
                checked={showConstellations}
                onChange={(e) => setShowConstellations(e.target.checked)}
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

        {/* System Status Panel - Collapsible, Top-Right */}
        <div className="fixed top-4 right-4 z-30">
          {/* Toggle Button - Always visible */}
          <button
            onClick={() => setIsStatsOpen(!isStatsOpen)}
            className="mb-2 ml-auto flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 shadow-lg hover:bg-zinc-700 hover:text-zinc-50 transition-all"
            aria-label={isStatsOpen ? "Close stats" : "Open stats"}
          >
            {isStatsOpen ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            )}
          </button>

          <div className={`
            w-80 rounded-lg border border-zinc-800 bg-zinc-900/95 backdrop-blur-md shadow-xl transition-all duration-300 ease-in-out
            ${isStatsOpen 
              ? 'max-h-[500px] p-4 opacity-100 scale-100' 
              : 'max-h-0 p-0 opacity-0 scale-95 pointer-events-none'
            }
          `}>
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
                <p className="text-xs text-zinc-300 mb-1">Close Approaches</p>
                <p className="text-2xl font-bold text-red-400">
                  -
                </p>
                <p className="text-xs text-zinc-400 mt-1">No imminent approaches</p>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </MainLayout>
  );
}
