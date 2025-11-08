/**
 * Solar System Comparison Page
 * 
 * Side-by-side comparison of:
 * - Modern React Three Fiber implementation
 * - Celestial Signs original implementation
 */

'use client';

import { useState, Suspense } from 'react';
import { MainLayout } from '@/components/layout';
import dynamic from 'next/dynamic';

// Dynamically import both implementations
const EnhancedSolarSystemCanvas = dynamic(
  () => import('@/components/visualization/EnhancedSolarSystemCanvas'),
  { ssr: false }
);

const CelestialCanvas = dynamic(
  () => import('@/components/visualization/CelestialCanvas'),
  { ssr: false }
);

export default function SolarSystemComparePage() {
  const [activeView, setActiveView] = useState<'split' | 'modern' | 'classic'>('split');

  return (
    <MainLayout
      title="Solar System Comparison"
      subtitle="Modern R3F vs Classic THREE.js Implementation"
    >
      <div className="h-[calc(100vh-4rem)] bg-black flex flex-col">
        {/* View Toggle Controls */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 flex gap-2 bg-zinc-900/95 backdrop-blur-md p-2 rounded-lg border border-zinc-700">
          <button
            onClick={() => setActiveView('modern')}
            className={`px-4 py-2 rounded text-sm font-medium transition-all ${
              activeView === 'modern'
                ? 'bg-blue-500 text-white'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            }`}
          >
            🚀 Modern R3F
          </button>
          <button
            onClick={() => setActiveView('split')}
            className={`px-4 py-2 rounded text-sm font-medium transition-all ${
              activeView === 'split'
                ? 'bg-blue-500 text-white'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            }`}
          >
            ⚖️ Split View
          </button>
          <button
            onClick={() => setActiveView('classic')}
            className={`px-4 py-2 rounded text-sm font-medium transition-all ${
              activeView === 'classic'
                ? 'bg-blue-500 text-white'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            }`}
          >
            🌟 Classic
          </button>
        </div>

        {/* Comparison Views */}
        <div className="flex-1 flex">
          {/* Modern Implementation */}
          {(activeView === 'modern' || activeView === 'split') && (
            <div className={`${activeView === 'split' ? 'w-1/2' : 'w-full'} relative border-r border-zinc-800`}>
              <div className="absolute top-4 left-4 z-40 bg-blue-600/90 backdrop-blur-sm px-3 py-1.5 rounded text-white text-sm font-semibold">
                Modern React Three Fiber
              </div>
              <Suspense fallback={<LoadingFallback />}>
                <EnhancedSolarSystemCanvas
                  speedMultiplier={1}
                  ephemerisData={[]}
                  orbitalElementsData={[]}
                  closeApproachesData={[]}
                  onPlanetSelect={() => {}}
                  onNEOSelect={() => {}}
                  showGrid={false}
                  showOrbits={true}
                  showLabels={true}
                  showNEOs={false}
                />
              </Suspense>
              
              {/* Feature List */}
              <div className="absolute bottom-4 left-4 z-40 bg-zinc-900/95 backdrop-blur-md p-3 rounded-lg border border-zinc-700 max-w-xs">
                <h3 className="text-white text-sm font-semibold mb-2">✨ Features:</h3>
                <ul className="text-xs text-zinc-300 space-y-1">
                  <li>✅ React Three Fiber (Declarative)</li>
                  <li>✅ 2K NASA Textures</li>
                  <li>✅ Atmospheric Shaders</li>
                  <li>✅ Saturn Rings & Earth Clouds</li>
                  <li>✅ Time Simulation System</li>
                  <li>✅ Ephemeris Interpolation</li>
                  <li>✅ Professional Lens Flare</li>
                </ul>
              </div>
            </div>
          )}

          {/* Classic Celestial Implementation */}
          {(activeView === 'classic' || activeView === 'split') && (
            <div className={`${activeView === 'split' ? 'w-1/2' : 'w-full'} relative`}>
              <div className="absolute top-4 right-4 z-40 bg-purple-600/90 backdrop-blur-sm px-3 py-1.5 rounded text-white text-sm font-semibold">
                Classic Celestial Canvas
              </div>
              <Suspense fallback={<LoadingFallback />}>
                <CelestialCanvas />
              </Suspense>
              
              {/* Feature List */}
              <div className="absolute bottom-4 right-4 z-40 bg-zinc-900/95 backdrop-blur-md p-3 rounded-lg border border-zinc-700 max-w-xs">
                <h3 className="text-white text-sm font-semibold mb-2">🌟 Features:</h3>
                <ul className="text-xs text-zinc-300 space-y-1">
                  <li>✅ Pure THREE.js (Imperative)</li>
                  <li>✅ Keplerian Orbital Elements</li>
                  <li>✅ Accurate Planet Colors</li>
                  <li>✅ Proven Orbit Calculations</li>
                  <li>✅ Simple Sprite Planets</li>
                  <li>✅ Scene Rotation</li>
                  <li>✅ Minimalist Approach</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Comparison Legend */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 bg-zinc-900/95 backdrop-blur-md p-3 rounded-lg border border-zinc-700">
          <div className="text-center">
            <p className="text-xs text-zinc-400 mb-1">Both implementations use accurate astronomical color schemes</p>
            <div className="flex gap-4 text-xs text-zinc-300">
              <span>🎨 Same Colors</span>
              <span>•</span>
              <span>🔭 Same Orbital Math</span>
              <span>•</span>
              <span>🚀 Different Rendering</span>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

function LoadingFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-black">
      <div className="text-center">
        <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-zinc-700 border-t-blue-500" />
        <p className="text-zinc-400">Loading 3D Scene...</p>
      </div>
    </div>
  );
}
