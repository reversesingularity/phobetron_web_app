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

import { useState, Suspense, useCallback, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { MainLayout } from '@/components/layout';
import TimeControlsPanel from '@/components/visualization/TimeControlsPanel';
import AdvancedCameraPanel from '@/components/visualization/AdvancedCameraPanel';
import * as THREE from 'three';
import {
  useEphemeris,
  useOrbitalElements,
  useCloseApproaches,
} from '@/lib/hooks';
import { getAllCelestialEvents } from '@/lib/utils/celestialCalculations';
import { CelestialEvent } from '@/lib/types/celestial';
import { showToast } from '@/lib/toast';
import NEORiskBadge from '@/components/ml/NEORiskBadge';
import InterstellarAnomalyPanel from '@/components/ml/InterstellarAnomalyPanel';
import { CollapsiblePanel } from '@/components/ui/CollapsiblePanel';
import DataSourceStatusPanel from '@/components/data-sources/DataSourceStatusPanel';

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
  const [isCameraPanelOpen, setIsCameraPanelOpen] = useState(false); // Camera panel minimized by default
  const [isControlsOpen, setIsControlsOpen] = useState(false); // Minimized by default
  const [isStatsOpen, setIsStatsOpen] = useState(false); // System Status minimized by default
  const [showNEORisks, setShowNEORisks] = useState(true); // Show NEO risk badges by default
  const [cameraControls, setCameraControls] = useState<{
    setTopView: () => void;
    setSideView: () => void;
    setEarthFocus: () => void;
    resetView: () => void;
    jumpTime: (milliseconds: number) => void;
    resetToToday: () => void;
    focusObject?: (position: THREE.Vector3, distance?: number) => void;
  } | null>(null);

  // Ref to store planetsRef from CelestialCanvas
  const planetsRef = useRef<Map<string, THREE.Mesh>>(new Map());

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
    focusObject?: (position: THREE.Vector3, distance?: number) => void;
  }) => {
    setCameraControls(controls);
  }, []);

  // Handler for when planets are loaded and ready
  const handlePlanetsReady = useCallback((planetsRefFromCanvas: React.MutableRefObject<Map<string, THREE.Mesh>>) => {
    // Copy the reference so we have access to the planets map
    planetsRef.current = planetsRefFromCanvas.current;
    console.log(`📹 Received planetsRef with ${planetsRef.current.size} celestial objects`);
  }, []);

  // Handler for focusing camera on a specific planet/object
  const handleFocusPlanet = useCallback((planetName: string) => {
    if (!cameraControls?.focusObject) return;
    
    const planet = planetsRef.current.get(planetName);
    if (planet) {
      // Distance based on object type for optimal framing
      let distance = 50; // Default
      const planetLower = planetName.toLowerCase();
      
      // Adjust distance based on object size/importance
      if (planetLower === 'sun') distance = 50;
      else if (['jupiter', 'saturn'].includes(planetLower)) distance = 25;
      else if (['earth', 'venus', 'mars'].includes(planetLower)) distance = 10;
      else if (planetLower === 'mercury') distance = 8;
      else if (planetName.includes('I/')) distance = 20; // Interstellar objects
      else if (['apophis', 'ryugu'].includes(planetLower)) distance = 5;
      else distance = 15; // Asteroids and comets
      
      cameraControls.focusObject(planet.position, distance);
      console.log(`📹 Focusing camera on ${planetName} at distance ${distance}`);
    }
  }, [cameraControls]);

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
            onPlanetsReady={handlePlanetsReady}
            onCameraControlsReady={handleCameraControlsReady}
          />
        </Suspense>

        {/* Time Controls Panel - Collapsible on ALL screen sizes */}
        <div className="fixed bottom-4 left-4 lg:left-65 z-40">
          {/* Minimize/Expand Button - Always visible */}
          <button
            onClick={() => setIsTimeControlsOpen(!isTimeControlsOpen)}
            className="absolute -top-12 -left-0.009 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-red-500 text-white shadow-lg hover:bg-red-600 transition-colors ring-2 ring-white"
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

        {/* System Status Panel - Collapsible, Top-Right */}
        <div className="fixed top-18 right-4 z-30">
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

        {/* Enhanced Controls Panel - Below System Status, Top-Right */}
        <div className="fixed top-32 right-4 z-30">
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
              ? 'max-h-[calc(100vh-30rem)] p-4 opacity-100 scale-100' 
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
            
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-zinc-300">Show NEO Risk Badges</span>
              <input
                type="checkbox"
                checked={showNEORisks}
                onChange={(e) => setShowNEORisks(e.target.checked)}
                className="h-5 w-5 rounded border-zinc-700 bg-zinc-800 text-red-500 focus:ring-2 focus:ring-red-500 focus:ring-offset-0"
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
        </div>

        {/* Advanced Camera Panel - Bottom Right */}
        <div className="fixed bottom-4 right-4 z-30">
          {/* Toggle Button */}
          <button
            onClick={() => setIsCameraPanelOpen(!isCameraPanelOpen)}
            className="mb-2 ml-auto flex h-10 w-10 items-center justify-center rounded-full bg-purple-500 text-white shadow-lg hover:bg-purple-600 transition-colors ring-2 ring-white"
            aria-label={isCameraPanelOpen ? "Close camera panel" : "Open camera panel"}
          >
            {isCameraPanelOpen ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </button>

          <div className={`
            transition-all duration-300 ease-in-out
            ${isCameraPanelOpen 
              ? 'opacity-100 scale-100 translate-y-0' 
              : 'opacity-0 scale-95 translate-y-4 pointer-events-none'
            }
          `}>
            <AdvancedCameraPanel 
              cameraControls={cameraControls} 
              planetsRef={planetsRef}
              onFocusPlanet={handleFocusPlanet}
            />
          </div>
        </div>

        {/* NEO Risk Assessment Panel - Right side, collapsible */}
        {showNEORisks && (
          <div className="fixed top-[70px] right-96 z-20 w-80">
            <CollapsiblePanel title="⚠️ NEO Risk Assessments" defaultCollapsed={false}>
              <div className="space-y-3">
                {/* Apophis (99942) */}
                <div className="rounded-lg bg-zinc-950/50 p-3">
                  <p className="text-xs text-zinc-400 mb-2">99942 Apophis</p>
                  <NEORiskBadge
                    name="99942 Apophis"
                    orbitalData={{
                      semi_major_axis: 0.922,
                      eccentricity: 0.191,
                      inclination: 3.33,
                      absolute_magnitude: 19.7,
                      diameter_km: 0.37,
                      orbital_period: 0.89,
                    }}
                    closestApproach={{
                      date: new Date('2029-04-13'),
                      distance_km: 31_600,
                      velocity_km_s: 7.4,
                    }}
                  />
                </div>

                {/* Ryugu (162173) */}
                <div className="rounded-lg bg-zinc-950/50 p-3">
                  <p className="text-xs text-zinc-400 mb-2">162173 Ryugu</p>
                  <NEORiskBadge
                    name="162173 Ryugu"
                    orbitalData={{
                      semi_major_axis: 1.190,
                      eccentricity: 0.190,
                      inclination: 5.88,
                      absolute_magnitude: 19.25,
                      diameter_km: 0.9,
                      orbital_period: 1.30,
                    }}
                    closestApproach={{
                      date: new Date('2076-11-12'),
                      distance_km: 450_000,
                      velocity_km_s: 5.2,
                    }}
                  />
                </div>

                <div className="text-xs text-zinc-500 border-t border-zinc-800 pt-3">
                  <p>💡 Click badge for detailed risk assessment</p>
                </div>
              </div>
            </CollapsiblePanel>
          </div>
        )}

        {/* Data Source Status Panel - Bottom left, above time controls */}
        <div className="fixed bottom-32 left-20 lg:left-72 z-30 w-80">
          <DataSourceStatusPanel />
        </div>

        {/* Interstellar Object Analysis Panel - Positioned after left nav, collapsible */}
        {showNEORisks && (
          <div className="fixed top-17 left-65 z-20 w-90 max-h-[calc(100vh-120px)] overflow-y-auto">
            <CollapsiblePanel title="🌌 Interstellar Objects" defaultCollapsed={true}>
              <div className="space-y-3">
                <InterstellarAnomalyPanel
                  name="1I/'Oumuamua"
                  objectData={{
                    eccentricity: 1.20,
                    non_gravitational_accel: 2.5e-6,
                    axis_ratio: 10.0,
                    has_tail: false,
                  }}
                />
                
                <InterstellarAnomalyPanel
                  name="2I/Borisov"
                  objectData={{
                    eccentricity: 3.36,
                    non_gravitational_accel: 1.2e-5,
                    axis_ratio: 1.5,
                    has_tail: true,
                  }}
                />
                
                {/* 3I/ATLAS - Fragmenting comet with anomalous behavior */}
                <InterstellarAnomalyPanel
                  name="3I/ATLAS (C/2019 Y4)"
                  objectData={{
                    eccentricity: 6.1374,  // Hyperbolic - interstellar origin likely
                    non_gravitational_accel: 5.8e-6,  // Strong outgassing
                    axis_ratio: 2.5,  // Irregular fragmentation
                    has_tail: true,  // Anomalous tail pointing toward Sun (debris)
                  }}
                />
              </div>
            </CollapsiblePanel>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
