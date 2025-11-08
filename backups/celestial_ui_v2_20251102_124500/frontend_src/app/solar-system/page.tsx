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

// Dynamically import TheSkyLive Three.js component (client-side only)
const TheSkyLiveCanvas = dynamic(
  () => import('@/components/visualization/TheSkyLiveCanvas'),
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
            showConstellations={showConstellations}
            speedMultiplier={speedMultiplier}
            isPaused={isPaused}
            onPlanetSelect={handlePlanetSelect}
            onTimeUpdate={handleTimeUpdate}
            onCameraControlsReady={handleCameraControlsReady}
          />
        </Suspense>

        {/* Time Controls Panel */}
        <TimeControlsPanel
          currentTime={currentSimulationTime}
          isPaused={isPaused}
          speedMultiplier={speedMultiplier}
          onPlayPause={handlePlayPause}
          onSpeedChange={handleSpeedChange}
          onTimeJump={handleTimeJump}
          onDateChange={handleDateChange}
        />

        {/* Enhanced Controls Panel */}
        <div className="absolute bottom-6 right-6 w-80 rounded-lg border border-zinc-800 bg-zinc-900/95 p-4 backdrop-blur-md shadow-xl z-50">
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
              <p className="text-xs text-zinc-300 mb-1">Close Approaches</p>
              <p className="text-2xl font-bold text-red-400">
                -
              </p>
              <p className="text-xs text-zinc-400 mt-1">No imminent approaches</p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
