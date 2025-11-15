/**
 * Camera Controls Panel Component
 * 
 * Provides UI controls for camera manipulation in the 3D Solar System view.
 * Features:
 * - Quick camera presets (Top View, Side View, etc.)
 * - Focus Object dropdown to center on any celestial body
 * - Movement controls reference guide
 * - Reset camera button
 */

import { useState, useEffect } from 'react';
import { Camera, RotateCw } from 'lucide-react';

interface CameraControlsPanelProps {
  cameraControls: {
    setTopView: () => void;
    setSideView: () => void;
    setEarthFocus: () => void;
    resetView: () => void;
    focusObject: (objectName: string) => void;
    getAvailableObjects: () => string[];
  } | null;
  isOpen: boolean;
  onToggle: () => void;
}

export default function CameraControlsPanel({ 
  cameraControls, 
  isOpen,
  onToggle 
}: CameraControlsPanelProps) {
  const [availableObjects, setAvailableObjects] = useState<string[]>([]);
  const [selectedObject, setSelectedObject] = useState<string>('');

  useEffect(() => {
    console.log('🎨 CameraControlsPanel: cameraControls changed', cameraControls ? 'PRESENT' : 'NULL');
    if (cameraControls) {
      const objects = cameraControls.getAvailableObjects();
      console.log('📋 CameraControlsPanel: Got available objects:', objects);
      setAvailableObjects(objects);
    }
  }, [cameraControls]);

  const handleFocusObject = (objectName: string) => {
    console.log('🎯 CameraControlsPanel: handleFocusObject called with:', objectName);
    console.log('🎮 cameraControls is:', cameraControls ? 'PRESENT' : 'NULL');
    if (cameraControls && objectName) {
      setSelectedObject(objectName);
      console.log('📞 Calling cameraControls.focusObject()');
      cameraControls.focusObject(objectName);
    } else {
      console.error('❌ Cannot focus: cameraControls or objectName missing');
    }
  };

  const handleReset = () => {
    if (cameraControls) {
      cameraControls.resetView();
      setSelectedObject('');
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="fixed bottom-4 left-4 z-40 flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-white shadow-lg transition-all hover:bg-cyan-600 lg:left-112"
        aria-label="Toggle camera controls"
      >
        <Camera className="h-5 w-5" />
        Camera
      </button>

      {/* Camera Controls Panel */}
      {isOpen && (
        <div className="fixed bottom-16 left-4 z-40 w-80 rounded-lg border border-cyan-500/30 bg-zinc-900/95 p-4 shadow-xl backdrop-blur-md lg:left-112">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-cyan-400">Camera Controls</h3>
            <button
              onClick={onToggle}
              className="text-zinc-400 transition-colors hover:text-white"
              aria-label="Close camera controls"
            >
              ✕
            </button>
          </div>

          {/* Quick Presets */}
          <div className="mb-4">
            <h4 className="mb-2 text-sm font-medium text-zinc-300">Quick Presets</h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  console.log('🎬 Top View button clicked');
                  cameraControls?.setTopView();
                }}
                disabled={!cameraControls}
                className="rounded bg-zinc-800 px-3 py-2 text-xs text-zinc-300 transition-all hover:bg-cyan-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Top View
              </button>
              <button
                onClick={() => {
                  console.log('🎬 Side View button clicked');
                  cameraControls?.setSideView();
                }}
                disabled={!cameraControls}
                className="rounded bg-zinc-800 px-3 py-2 text-xs text-zinc-300 transition-all hover:bg-cyan-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Side View
              </button>
              <button
                onClick={() => {
                  console.log('🎬 Oblique View button clicked');
                  cameraControls?.setEarthFocus();
                }}
                disabled={!cameraControls}
                className="rounded bg-zinc-800 px-3 py-2 text-xs text-zinc-300 transition-all hover:bg-cyan-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Oblique View
              </button>
              <button
                onClick={() => {
                  console.log('🎬 Inner System button clicked');
                  handleFocusObject('Sun');
                }}
                disabled={!cameraControls}
                className="rounded bg-zinc-800 px-3 py-2 text-xs text-zinc-300 transition-all hover:bg-cyan-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Inner System
              </button>
              <button
                onClick={() => {
                  console.log('🎬 Outer System button clicked');
                  handleFocusObject('Jupiter');
                }}
                disabled={!cameraControls}
                className="rounded bg-zinc-800 px-3 py-2 text-xs text-zinc-300 transition-all hover:bg-cyan-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Outer System
              </button>
              <button
                onClick={() => {
                  console.log('🎬 Wide Shot button clicked');
                  handleFocusObject('Neptune');
                }}
                disabled={!cameraControls}
                className="rounded bg-zinc-800 px-3 py-2 text-xs text-zinc-300 transition-all hover:bg-cyan-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Wide Shot
              </button>
            </div>
          </div>

          {/* Focus Object Dropdown */}
          <div className="mb-4">
            <h4 className="mb-2 text-sm font-medium text-zinc-300">Focus Object</h4>
            <select
              value={selectedObject}
              onChange={(e) => handleFocusObject(e.target.value)}
              disabled={!cameraControls || availableObjects.length === 0}
              className="w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-300 transition-all focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Select object to focus camera on"
            >
              <option value="">Select an object...</option>
              {availableObjects.map((obj) => (
                <option key={obj} value={obj}>
                  {obj}
                </option>
              ))}
            </select>
          </div>

          {/* Movement Controls Reference */}
          <div className="mb-4 rounded border border-zinc-700/50 bg-zinc-800/50 p-3">
            <h4 className="mb-2 text-sm font-medium text-zinc-300">Movement Controls</h4>
            <div className="space-y-1 text-xs text-zinc-400">
              <div className="flex justify-between">
                <span>Pan:</span>
                <span className="text-zinc-500">Right Click + Drag</span>
              </div>
              <div className="flex justify-between">
                <span>Zoom:</span>
                <span className="text-zinc-500">Scroll Wheel</span>
              </div>
              <div className="flex justify-between">
                <span>Orbit:</span>
                <span className="text-zinc-500">Left Click + Drag</span>
              </div>
              <div className="flex justify-between">
                <span>Reset:</span>
                <span className="text-zinc-500">R Key</span>
              </div>
            </div>
          </div>

          {/* Reset Camera Button */}
          <button
            onClick={handleReset}
            disabled={!cameraControls}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-linear-to-r from-cyan-500 to-blue-500 px-4 py-2 font-medium text-white shadow-lg transition-all hover:from-cyan-600 hover:to-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RotateCw className="h-4 w-4" />
            Reset Camera
          </button>
        </div>
      )}
    </>
  );
}
