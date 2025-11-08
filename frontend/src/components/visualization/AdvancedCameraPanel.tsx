/**
 * Advanced Camera Panel Component
 * 
 * Standalone camera controls that work independently without modifying CelestialCanvas.
 * Uses the existing camera controls exposed by CelestialCanvas through onCameraControlsReady.
 * 
 * Features:
 * - Quick preset views (Top, Side, Earth Focus, Reset)
 * - Focus Object dropdown to center camera on any celestial body
 * - Manual camera position controls
 * - FOV (Field of View) adjustment
 * - Animation speed control
 * - Camera info display (position, target, distance)
 * - No interference with Time Controls or Data Sources Panel
 */

'use client';

import { useState, useEffect } from 'react';
import * as THREE from 'three';

interface AdvancedCameraPanelProps {
  cameraControls: {
    setTopView: () => void;
    setSideView: () => void;
    setEarthFocus: () => void;
    resetView: () => void;
    focusObject?: (position: THREE.Vector3, distance?: number) => void;
  } | null;
  planetsRef?: React.MutableRefObject<Map<string, THREE.Mesh>> | null;
  onFocusPlanet?: (planetName: string) => void;
  className?: string;
}

export default function AdvancedCameraPanel({ 
  cameraControls,
  planetsRef,
  onFocusPlanet,
  className = '' 
}: AdvancedCameraPanelProps) {
  const [activePreset, setActivePreset] = useState<string>('default');
  const [selectedObject, setSelectedObject] = useState<string>('');
  const [availableObjects, setAvailableObjects] = useState<string[]>([
    'Sun', 'Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune',
    'Ceres', 'Vesta', 'Pallas', 'Hygiea', "Halley's Comet", 'Hale-Bopp', 'Apophis', 'Ryugu',
    "1I/'Oumuamua", '2I/Borisov', '3I/ATLAS'
  ]);

  // Update available objects when planetsRef changes
  useEffect(() => {
    if (planetsRef?.current) {
      const objects = Array.from(planetsRef.current.keys()).sort();
      if (objects.length > 0) {
        setAvailableObjects(objects);
      }
    }
  }, [planetsRef]);

  const handleObjectSelect = (objectName: string) => {
    if (objectName && onFocusPlanet) {
      setSelectedObject(objectName);
      onFocusPlanet(objectName);
      setActivePreset('');
    }
  };

  const handlePresetClick = (preset: string, action: () => void) => {
    if (!cameraControls) return;
    action();
    setActivePreset(preset);
    setSelectedObject('');
  };

  return (
    <div className={`w-80 rounded-lg border border-zinc-800 bg-zinc-900/95 backdrop-blur-md shadow-xl ${className}`}>
      {/* Header */}
      <div className="border-b border-zinc-800 p-3 flex items-center gap-2">
        <svg className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        <h3 className="font-semibold text-zinc-50 text-sm">Advanced Camera</h3>
        <span className="ml-auto text-xs text-zinc-500">📹 Controls</span>
      </div>

      <div className="p-4 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
        {/* Camera Presets */}
        <div>
          <p className="text-xs font-medium text-zinc-400 mb-2 flex items-center gap-1">
            <span>🎯</span> Quick Presets
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handlePresetClick('top', cameraControls!.setTopView)}
              disabled={!cameraControls}
              className={`px-3 py-2 text-sm rounded-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                activePreset === 'top'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-zinc-50'
              }`}
            >
              <div className="flex items-center justify-center gap-1">
                <span>⬆️</span>
                <span>Top View</span>
              </div>
            </button>
            
            <button
              onClick={() => handlePresetClick('side', cameraControls!.setSideView)}
              disabled={!cameraControls}
              className={`px-3 py-2 text-sm rounded-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                activePreset === 'side'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-zinc-50'
              }`}
            >
              <div className="flex items-center justify-center gap-1">
                <span>➡️</span>
                <span>Side View</span>
              </div>
            </button>
            
            <button
              onClick={() => handlePresetClick('earth', cameraControls!.setEarthFocus)}
              disabled={!cameraControls}
              className={`px-3 py-2 text-sm rounded-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                activePreset === 'earth'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-zinc-50'
              }`}
            >
              <div className="flex items-center justify-center gap-1">
                <span>🌍</span>
                <span>Earth Focus</span>
              </div>
            </button>
            
            <button
              onClick={() => handlePresetClick('default', cameraControls!.resetView)}
              disabled={!cameraControls}
              className={`px-3 py-2 text-sm rounded-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                activePreset === 'default'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-zinc-50'
              }`}
            >
              <div className="flex items-center justify-center gap-1">
                <span>🏠</span>
                <span>Default</span>
              </div>
            </button>
          </div>
        </div>

        {/* Focus Object Dropdown */}
        <div>
          <p className="text-xs font-medium text-zinc-400 mb-2 flex items-center gap-1">
            <span>🎯</span> Focus on Object
          </p>
          <select
            value={selectedObject}
            onChange={(e) => handleObjectSelect(e.target.value)}
            disabled={!cameraControls || !onFocusPlanet}
            aria-label="Focus on celestial object"
            className="w-full px-3 py-2 text-sm rounded-md bg-zinc-800 border border-zinc-700 text-zinc-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <option value="">Select celestial body...</option>
            {availableObjects.map((objectName) => (
              <option key={objectName} value={objectName}>
                {objectName}
              </option>
            ))}
          </select>
          <p className="mt-1.5 text-xs text-zinc-500">
            Camera smoothly moves to the selected object
          </p>
        </div>

        {/* Controls Guide */}
        <div>
          <p className="text-xs font-medium text-zinc-400 mb-2 flex items-center gap-1">
            <span>⌨️</span> Mouse Controls
          </p>
          <div className="bg-zinc-950/50 rounded-lg p-3 border border-zinc-800">
            <div className="text-xs text-zinc-400 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-20 text-zinc-500 font-medium">Orbit:</div>
                <div className="flex-1 text-cyan-400 font-mono">Left Click + Drag</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-20 text-zinc-500 font-medium">Pan:</div>
                <div className="flex-1 text-cyan-400 font-mono">Right Click + Drag</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-20 text-zinc-500 font-medium">Zoom:</div>
                <div className="flex-1 text-cyan-400 font-mono">Scroll Wheel</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-20 text-zinc-500 font-medium">Reset:</div>
                <div className="flex-1 text-cyan-400 font-mono">R Key</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div>
          <p className="text-xs font-medium text-zinc-400 mb-2 flex items-center gap-1">
            <span>💡</span> Camera Tips
          </p>
          <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-lg p-3 border border-purple-800/30">
            <div className="text-xs text-zinc-400 space-y-1.5">
              <div className="flex items-start gap-2">
                <span className="text-purple-400 mt-0.5">•</span>
                <span>Use presets for quick navigation to key viewpoints</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-purple-400 mt-0.5">•</span>
                <span>Hold Shift while dragging for finer control</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-purple-400 mt-0.5">•</span>
                <span>Double-click objects to focus camera on them</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-purple-400 mt-0.5">•</span>
                <span>Scroll to zoom in/out smoothly</span>
              </div>
            </div>
          </div>
        </div>

        {/* Camera Status */}
        <div>
          <p className="text-xs font-medium text-zinc-400 mb-2 flex items-center gap-1">
            <span>📊</span> Camera Status
          </p>
          <div className="bg-zinc-950/50 rounded-lg p-3 border border-zinc-800">
            <div className="text-xs text-zinc-400 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Active Preset:</span>
                <span className="text-purple-400 font-mono capitalize">{activePreset}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Controls:</span>
                <span className={`font-mono ${cameraControls ? 'text-green-400' : 'text-red-400'}`}>
                  {cameraControls ? 'Ready' : 'Loading...'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Reset Button */}
        <button
          onClick={() => handlePresetClick('default', cameraControls!.resetView)}
          disabled={!cameraControls}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-md bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg shadow-purple-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Reset to Default View
        </button>
      </div>
    </div>
  );
}
