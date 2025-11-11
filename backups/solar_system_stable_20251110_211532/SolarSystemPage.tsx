import { useState, useCallback } from 'react';
import CelestialCanvas from '../components/visualization/CelestialCanvas';
import CameraControlsPanel from '../components/visualization/CameraControlsPanel';
import { Play, Pause, RotateCcw, Zap, Grid3x3, Tag, Moon, Star } from 'lucide-react';

export default function SolarSystemPage() {
  const [showGrid, setShowGrid] = useState(true);
  const [showOrbits, setShowOrbits] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [showConstellations, setShowConstellations] = useState(false);
  const [showMoons, setShowMoons] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [isCameraControlsOpen, setIsCameraControlsOpen] = useState(false);
  const [cameraControls, setCameraControls] = useState<{
    setTopView: () => void;
    setSideView: () => void;
    setEarthFocus: () => void;
    resetView: () => void;
    jumpTime: (milliseconds: number) => void;
    resetToToday: () => void;
    startRecording: () => void;
    stopRecording: () => void;
    focusObject: (objectName: string) => void;
    getAvailableObjects: () => string[];
  } | null>(null);

  const handleCameraControlsReady = useCallback((controls: {
    setTopView: () => void;
    setSideView: () => void;
    setEarthFocus: () => void;
    resetView: () => void;
    jumpTime: (milliseconds: number) => void;
    resetToToday: () => void;
    startRecording: () => void;
    stopRecording: () => void;
    focusObject: (objectName: string) => void;
    getAvailableObjects: () => string[];
  }) => {
    console.log('🎮 SolarSystemPage received camera controls');
    console.log('📦 Controls object:', controls);
    console.log('🔍 Available functions:', Object.keys(controls));
    setCameraControls(controls);
    console.log('✅ Camera controls state updated');
  }, []); // Empty dependency array - this function never needs to change

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Solar System Visualization</h1>
            <p className="text-gray-400 text-sm mt-1">
              3D orbital mechanics with real-time planetary positions
            </p>
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Playback Controls */}
          <div className="flex gap-2">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                isPaused
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-yellow-600 hover:bg-yellow-700 text-white'
              }`}
            >
              {isPaused ? (
                <>
                  <Play className="w-4 h-4" />
                  Play
                </>
              ) : (
                <>
                  <Pause className="w-4 h-4" />
                  Pause
                </>
              )}
            </button>
          </div>

          {/* Speed Control */}
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-gray-400" />
            <label className="text-gray-400 text-sm">Speed:</label>
            <select
              value={speedMultiplier}
              onChange={(e) => setSpeedMultiplier(Number(e.target.value))}
              aria-label="Simulation speed multiplier"
              className="bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value={0.1}>0.1x</option>
              <option value={0.5}>0.5x</option>
              <option value={1}>1x (Real-time)</option>
              <option value={2}>2x</option>
              <option value={5}>5x</option>
              <option value={10}>10x</option>
              <option value={100}>100x</option>
              <option value={1000}>1000x</option>
            </select>
          </div>

          {/* Divider */}
          <div className="h-8 w-px bg-gray-600"></div>

          {/* Display Toggles */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                showGrid
                  ? 'bg-primary-600 hover:bg-primary-700 text-white'
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              }`}
            >
              <Grid3x3 className="w-4 h-4" />
              Grid
            </button>

            <button
              onClick={() => setShowOrbits(!showOrbits)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                showOrbits
                  ? 'bg-primary-600 hover:bg-primary-700 text-white'
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              }`}
            >
              <RotateCcw className="w-4 h-4" />
              Orbits
            </button>

            <button
              onClick={() => setShowLabels(!showLabels)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                showLabels
                  ? 'bg-primary-600 hover:bg-primary-700 text-white'
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              }`}
            >
              <Tag className="w-4 h-4" />
              Labels
            </button>

            <button
              onClick={() => setShowMoons(!showMoons)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                showMoons
                  ? 'bg-primary-600 hover:bg-primary-700 text-white'
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              }`}
            >
              <Moon className="w-4 h-4" />
              Moons
            </button>

            <button
              onClick={() => setShowConstellations(!showConstellations)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                showConstellations
                  ? 'bg-primary-600 hover:bg-primary-700 text-white'
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              }`}
            >
              <Star className="w-4 h-4" />
              Constellations
            </button>
          </div>
        </div>
      </div>

      {/* 3D Canvas */}
      <div className="flex-1 relative">
        <CelestialCanvas
          showGrid={showGrid}
          showOrbits={showOrbits}
          showLabels={showLabels}
          showConstellations={showConstellations}
          showMoons={showMoons}
          isPaused={isPaused}
          speedMultiplier={speedMultiplier}
          onCameraControlsReady={handleCameraControlsReady}
        />
        
        {/* Camera Controls Panel */}
        <CameraControlsPanel
          cameraControls={cameraControls}
          isOpen={isCameraControlsOpen}
          onToggle={() => setIsCameraControlsOpen(!isCameraControlsOpen)}
        />
      </div>

      {/* Info Footer */}
      <div className="bg-gray-800 border-t border-gray-700 p-3">
        <div className="flex items-center justify-between text-sm text-gray-400">
          <div className="flex gap-6">
            <span>🖱️ Drag to rotate • Scroll to zoom • Click planets for info</span>
            <span>⌨️ Space: Pause • ← → : Time step</span>
          </div>
          <div>
            <span className="text-primary-400">Data from NASA JPL Horizons</span>
          </div>
        </div>
      </div>
    </div>
  );
}
