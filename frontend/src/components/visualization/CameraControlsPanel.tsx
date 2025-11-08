/**
 * Camera Controls Panel Component
 * 
 * Provides an intuitive UI for controlling the 3D camera in the Solar System visualization.
 * Features:
 * - Quick camera preset views (Top, Side, Earth Focus, Inner/Outer System, etc.)
 * - Focus Object dropdown to center camera on any celestial body
 * - Advanced cinematographic controls (Pan, Dolly, Track, Crane, Orbit, Tilt, Roll, Zoom)
 * - Reset camera button
 * - Keyboard shortcuts reference
 */

'use client';

import { useState } from 'react';
import * as THREE from 'three';

interface CameraControlsPanelProps {
  cameraControls: {
    setTopView: () => void;
    setSideView: () => void;
    setEarthFocus: () => void;
    resetView: () => void;
    zoom: (delta: number) => void;
    pan: (x: number, y: number) => void;
    orbit: (azimuth: number, polar: number) => void;
    dolly: (distance: number) => void;
    track: (x: number, y: number) => void;
    crane: (height: number) => void;
    tilt: (angle: number) => void;
    roll: (angle: number) => void;
  } | null;
  planetsRef?: React.MutableRefObject<Map<string, THREE.Mesh>> | null;
  onFocusPlanet?: (planetName: string) => void;
  className?: string;
}

export default function CameraControlsPanel({ 
  cameraControls, 
  planetsRef,
  onFocusPlanet,
  className = '' 
}: CameraControlsPanelProps) {
  const [selectedObject, setSelectedObject] = useState<string>('');

  // Get available planets from the scene
  const availableObjects = planetsRef ? 
    Array.from(planetsRef.current?.keys() || []).map(name => 
      name.charAt(0).toUpperCase() + name.slice(1)
    ) : 
    ['Sun', 'Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune'];

  const handleObjectSelect = (objectName: string) => {
    if (objectName && onFocusPlanet) {
      setSelectedObject(objectName);
      onFocusPlanet(objectName);
    }
  };

  const handleQuickPreset = (preset: string) => {
    if (!cameraControls) return;
    
    switch (preset) {
      case 'top':
        cameraControls.setTopView();
        setSelectedObject('');
        break;
      case 'side':
        cameraControls.setSideView();
        setSelectedObject('');
        break;
      case 'earth':
        cameraControls.setEarthFocus();
        setSelectedObject('Earth');
        break;
      case 'reset':
        cameraControls.resetView();
        setSelectedObject('');
        break;
    }
  };

  return (
    <div className={`w-80 rounded-lg border border-zinc-800 bg-zinc-900/95 backdrop-blur-md shadow-xl ${className}`}>
      {/* Header */}
      <div className="border-b border-zinc-800 p-3 flex items-center gap-2">
        <svg className="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        <h3 className="font-semibold text-zinc-50 text-sm">Camera Controls</h3>
        <span className="ml-auto text-xs text-zinc-500">🎬 Cinematic</span>
      </div>

      <div className="p-4 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
        {/* Quick Presets */}
        <div>
          <p className="text-xs font-medium text-zinc-400 mb-2">📸 Quick Presets</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleQuickPreset('top')}
              disabled={!cameraControls}
              className="px-3 py-2 text-sm rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-zinc-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Top View
            </button>
            <button
              onClick={() => handleQuickPreset('side')}
              disabled={!cameraControls}
              className="px-3 py-2 text-sm rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-zinc-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Side View
            </button>
            <button
              onClick={() => handleQuickPreset('earth')}
              disabled={!cameraControls}
              className="px-3 py-2 text-sm rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-zinc-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Earth Focus
            </button>
            <button
              onClick={() => handleQuickPreset('reset')}
              disabled={!cameraControls}
              className="px-3 py-2 text-sm rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-zinc-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Default View
            </button>
          </div>
        </div>

        {/* Focus Object Dropdown */}
        <div>
          <label htmlFor="focus-object" className="block text-xs font-medium text-zinc-400 mb-2">
            🎯 Focus on Object
          </label>
          <select
            id="focus-object"
            value={selectedObject}
            onChange={(e) => handleObjectSelect(e.target.value)}
            disabled={!cameraControls || !onFocusPlanet}
            className="w-full px-3 py-2 text-sm rounded-md bg-zinc-800 border border-zinc-700 text-zinc-300 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">Select celestial body...</option>
            {availableObjects.map((objectName) => (
              <option key={objectName} value={objectName}>
                {objectName}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-zinc-500">
            Camera smoothly moves to the selected object
          </p>
        </div>

        {/* Advanced Controls */}
        <div>
          <p className="text-xs font-medium text-zinc-400 mb-2">🎬 Advanced Controls</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => cameraControls?.zoom(-5)}
              disabled={!cameraControls}
              className="px-3 py-1.5 text-xs rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-zinc-50 transition-colors disabled:opacity-50"
            >
              Zoom In
            </button>
            <button
              onClick={() => cameraControls?.zoom(5)}
              disabled={!cameraControls}
              className="px-3 py-1.5 text-xs rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-zinc-50 transition-colors disabled:opacity-50"
            >
              Zoom Out
            </button>
            <button
              onClick={() => cameraControls?.orbit(0.1, 0)}
              disabled={!cameraControls}
              className="px-3 py-1.5 text-xs rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-zinc-50 transition-colors disabled:opacity-50"
            >
              Orbit Left
            </button>
            <button
              onClick={() => cameraControls?.orbit(-0.1, 0)}
              disabled={!cameraControls}
              className="px-3 py-1.5 text-xs rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-zinc-50 transition-colors disabled:opacity-50"
            >
              Orbit Right
            </button>
            <button
              onClick={() => cameraControls?.tilt(-0.1)}
              disabled={!cameraControls}
              className="px-3 py-1.5 text-xs rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-zinc-50 transition-colors disabled:opacity-50"
            >
              Tilt Up
            </button>
            <button
              onClick={() => cameraControls?.tilt(0.1)}
              disabled={!cameraControls}
              className="px-3 py-1.5 text-xs rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-zinc-50 transition-colors disabled:opacity-50"
            >
              Tilt Down
            </button>
          </div>
        </div>

        {/* Movement Guide */}
        <div>
          <p className="text-xs font-medium text-zinc-400 mb-2">⌨️ Keyboard Shortcuts</p>
          <div className="bg-zinc-950/50 rounded-lg p-3 border border-zinc-800">
            <div className="text-xs text-zinc-400 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Orbit Camera</span>
                <span className="text-cyan-400 font-mono">Left Drag</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Pan View</span>
                <span className="text-cyan-400 font-mono">Right Drag</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Zoom</span>
                <span className="text-cyan-400 font-mono">Scroll Wheel</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Reset Camera</span>
                <span className="text-cyan-400 font-mono">R Key</span>
              </div>
            </div>
          </div>
        </div>

        {/* Reset Button */}
        <button
          onClick={() => handleQuickPreset('reset')}
          disabled={!cameraControls}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-md bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
