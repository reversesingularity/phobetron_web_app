import { useState, useCallback, useEffect, useRef } from 'react';
import CelestialCanvas from '../components/visualization/CelestialCanvas';
import CameraControlsPanel from '../components/visualization/CameraControlsPanel';
import TimeControlsPanel from '../components/visualization/TimeControlsPanel';
import { Play, Pause, RotateCcw, Zap, Grid3x3, Tag, Moon, Star, AlertTriangle } from 'lucide-react';
import aiCanvasService, { CanvasUpdate } from '../services/aiCanvasService';

export default function SolarSystemPage() {
  const [showGrid, setShowGrid] = useState(true);
  const [showOrbits, setShowOrbits] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [showConstellations, setShowConstellations] = useState(false);
  const [showMoons, setShowMoons] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const timeResetRef = useRef<number | null>(null); // Track manual time changes

  // Time progression effect - continuously advance time when not paused
  useEffect(() => {
    let animationId: number;
    let lastTime = performance.now();
    let localCurrentTime = currentTime; // Local copy for animation loop

    const animate = (currentFrameTime: number) => {
      const deltaTime = currentFrameTime - lastTime;
      lastTime = currentFrameTime;

      // Check if time was manually reset
      if (timeResetRef.current !== null) {
        localCurrentTime = timeResetRef.current;
        timeResetRef.current = null;
      }

      // Advance time only when not paused and deltaTime is reasonable
      if (!isPaused && deltaTime > 0 && deltaTime < 1000) {
        localCurrentTime += (deltaTime * speedMultiplier);
        setCurrentTime(localCurrentTime);
      }

      animationId = requestAnimationFrame(animate);
    };

    // Start the animation loop
    animationId = requestAnimationFrame(animate);

    // Cleanup function
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isPaused, speedMultiplier]); // Re-run when pause state or speed changes
  const [isCameraControlsOpen, setIsCameraControlsOpen] = useState(false);
  const [aiAlerts, setAiAlerts] = useState<CanvasUpdate[]>([]);
  const [showAiAlerts, setShowAiAlerts] = useState(false);
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

  // Time control functions
  const handlePlayPause = useCallback(() => {
    setIsPaused(!isPaused);
  }, [isPaused]);

  const handleSpeedChange = useCallback((speed: number) => {
    setSpeedMultiplier(speed);
  }, []);

  const handleTimeJump = useCallback((milliseconds: number) => {
    setCurrentTime(prev => {
      const newTime = prev + milliseconds;
      const validTime = newTime > 0 ? newTime : Date.now();
      
      // Signal the animation loop to reset time
      timeResetRef.current = validTime;
      return validTime;
    });
    if (cameraControls?.jumpTime) {
      cameraControls.jumpTime(milliseconds);
    }
  }, [cameraControls]);

  const handleDateChange = useCallback((date: Date) => {
    const newTime = date.getTime();
    const validTime = newTime > 0 ? newTime : Date.now();
    
    // Signal the animation loop to reset time
    timeResetRef.current = validTime;
    setCurrentTime(validTime);
    
    if (cameraControls?.jumpTime) {
      const diff = date.getTime() - Date.now();
      cameraControls.jumpTime(diff);
    }
  }, [cameraControls]);

  const handleAlertsUpdate = useCallback((alerts: CanvasUpdate[]) => {
    setAiAlerts(alerts);
  }, []);

  const handleTimeUpdate = useCallback((time: number) => {
    setCurrentTime(time);
  }, []);

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
              <option value={0.1}>0.1x (Very Slow)</option>
              <option value={1}>1x (Real-time)</option>
              <option value={24}>24x (1 Day/Hour)</option>
              <option value={168}>168x (1 Week/Hour)</option>
              <option value={720}>720x (1 Month/Hour)</option>
              <option value={8760}>8760x (1 Year/Hour)</option>
              <option value={100000}>100,000x (Extreme)</option>
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
          currentTime={currentTime}
          onTimeUpdate={handleTimeUpdate}
          onAlertsUpdate={handleAlertsUpdate}
          onCameraControlsReady={handleCameraControlsReady}
        />
        
        {/* Camera Controls Panel */}
        <CameraControlsPanel
          cameraControls={cameraControls}
          isOpen={isCameraControlsOpen}
          onToggle={() => setIsCameraControlsOpen(!isCameraControlsOpen)}
        />
        
        {/* Time Controls Panel */}
        <TimeControlsPanel
          currentTime={currentTime}
          isPaused={isPaused}
          speedMultiplier={speedMultiplier}
          onPlayPause={handlePlayPause}
          onSpeedChange={handleSpeedChange}
          onTimeJump={handleTimeJump}
          onDateChange={handleDateChange}
        />

        {/* AI Alerts Panel */}
        {aiAlerts.length > 0 && (
          <div className="fixed top-4 right-4 z-30 bg-red-900/95 backdrop-blur-sm border border-red-800 rounded-lg shadow-2xl p-4 w-80 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-red-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                AI Alerts ({aiAlerts.length})
              </h3>
              <button
                onClick={() => setShowAiAlerts(!showAiAlerts)}
                className="text-red-400 hover:text-red-300 text-xs"
              >
                {showAiAlerts ? 'Collapse' : 'Expand'}
              </button>
            </div>

            {showAiAlerts && (
              <div className="space-y-2">
                {aiAlerts.map((alert, index) => (
                  <div
                    key={`${alert.object_id}-${index}`}
                    className={`p-2 rounded border ${
                      alert.priority >= 4
                        ? 'bg-red-950 border-red-700'
                        : alert.priority >= 3
                        ? 'bg-orange-950 border-orange-700'
                        : 'bg-yellow-950 border-yellow-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="text-xs font-medium text-white">
                          {aiCanvasService.formatUpdateForDisplay(alert)}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {new Date(alert.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                      <div className={`text-xs px-1 py-0.5 rounded ${
                        alert.priority >= 4
                          ? 'bg-red-700 text-red-200'
                          : alert.priority >= 3
                          ? 'bg-orange-700 text-orange-200'
                          : 'bg-yellow-700 text-yellow-200'
                      }`}>
                        P{alert.priority}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
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
