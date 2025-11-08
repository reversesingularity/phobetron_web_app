/**
 * Enhanced Solar System Canvas Component
 * 
 * Advanced Three.js visualization with:
 * - Real ephemeris data for planets
 * - Elliptical orbits from orbital elements
 * - NEO/asteroid rendering
 * - Coordinate grid system
 * - Comet tails and effects
 * - Enhanced animations
 */

'use client';

import { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import { Canvas, useFrame, useThree, ThreeEvent } from '@react-three/fiber';
import { OrbitControls, Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { Ephemeris, OrbitalElements, CloseApproach } from '@/lib/types';
import {
  auToThreeJS,
  getPlanetConfig,
  formatDistance,
  calculateEllipticalOrbit,
  getPositionFromOrbit,
  getNEOConfig,
  formatApproachDate,
} from '@/lib/utils/astronomy';

// ============================================================================
// UTILITIES
// ============================================================================

// Seeded random number generator for consistent starfield
class SeededRandom {
  private seed: number;
  constructor(seed: number) {
    this.seed = seed;
  }
  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
}

// Texture loader singleton
const textureLoader = new THREE.TextureLoader();

// ============================================================================
// TIME SIMULATION UTILITIES
// ============================================================================

// Time simulation state management
interface TimeSimulationState {
  simulationDate: Date;
  isLiveMode: boolean;
  playbackSpeed: number; // days per second
  isPaused: boolean;
}

// Convert simulation time to position using Keplerian orbital elements
function calculatePositionFromElements(
  elements: OrbitalElements,
  julianDate: number
): THREE.Vector3 {
  const { 
    semi_major_axis_au: a,
    eccentricity: e,
    inclination_deg,
    longitude_of_ascending_node_deg,
    argument_of_periapsis_deg,
    mean_anomaly_deg,
  } = elements;

  // Convert to radians
  const i = (inclination_deg * Math.PI) / 180;
  const Omega = (longitude_of_ascending_node_deg * Math.PI) / 180;
  const omega = (argument_of_periapsis_deg * Math.PI) / 180;
  
  // Calculate mean anomaly at given time
  // M = M0 + n * (t - t0) where n = mean motion
  // For simplicity, use current mean anomaly (should calculate orbital period)
  const M = (mean_anomaly_deg * Math.PI) / 180;
  
  // Solve Kepler's equation for eccentric anomaly E
  // M = E - e * sin(E)
  let E = M;
  for (let iter = 0; iter < 10; iter++) {
    E = M + e * Math.sin(E);
  }
  
  // Calculate true anomaly
  const nu = 2 * Math.atan2(
    Math.sqrt(1 + e) * Math.sin(E / 2),
    Math.sqrt(1 - e) * Math.cos(E / 2)
  );
  
  // Calculate distance
  const r = a * (1 - e * Math.cos(E));
  
  // Position in orbital plane
  const x_orbital = r * Math.cos(nu);
  const y_orbital = r * Math.sin(nu);
  
  // Rotate to ecliptic coordinates
  const x = (Math.cos(Omega) * Math.cos(omega + nu) - Math.sin(Omega) * Math.sin(omega + nu) * Math.cos(i)) * r;
  const y = (Math.sin(Omega) * Math.cos(omega + nu) + Math.cos(Omega) * Math.sin(omega + nu) * Math.cos(i)) * r;
  const z = Math.sin(i) * Math.sin(omega + nu) * r;
  
  return new THREE.Vector3(x * 10, y * 10, z * 10); // Convert to Three.js units
}

// Convert Date to Julian Date
function dateToJulianDate(date: Date): number {
  const time = date.getTime();
  return (time / 86400000.0) + 2440587.5;
}

// Interpolate between ephemeris data points
function interpolateEphemeris(
  ephemerisData: Ephemeris[],
  targetJulianDate: number
): Map<string, THREE.Vector3> {
  const positions = new Map<string, THREE.Vector3>();
  
  // Group by object name
  const byObject = new Map<string, Ephemeris[]>();
  ephemerisData.forEach(eph => {
    const name = eph.object_name;
    if (!byObject.has(name)) {
      byObject.set(name, []);
    }
    byObject.get(name)!.push(eph);
  });
  
  // Interpolate for each object
  byObject.forEach((ephList, objectName) => {
    if (ephList.length === 0) return;
    
    // Sort by epoch_jd
    ephList.sort((a, b) => a.epoch_jd - b.epoch_jd);
    
    // Find surrounding data points
    let before: Ephemeris | null = null;
    let after: Ephemeris | null = null;
    
    for (let i = 0; i < ephList.length; i++) {
      const ephJD = ephList[i].epoch_jd;
      
      if (ephJD <= targetJulianDate) {
        before = ephList[i];
      }
      if (ephJD >= targetJulianDate && !after) {
        after = ephList[i];
        break;
      }
    }
    
    // Interpolate position
    if (before && after) {
      const t = (targetJulianDate - before.epoch_jd) / (after.epoch_jd - before.epoch_jd);
      
      const x = before.x_au + (after.x_au - before.x_au) * t;
      const y = before.y_au + (after.y_au - before.y_au) * t;
      const z = before.z_au + (after.z_au - before.z_au) * t;
      
      positions.set(objectName, new THREE.Vector3(x * 10, y * 10, z * 10));
    } else if (before) {
      // Use last known position
      positions.set(objectName, new THREE.Vector3(
        before.x_au * 10,
        before.y_au * 10,
        before.z_au * 10
      ));
    } else if (after) {
      // Use first known position
      positions.set(objectName, new THREE.Vector3(
        after.x_au * 10,
        after.y_au * 10,
        after.z_au * 10
      ));
    }
  });
  
  return positions;
}

// ============================================================================
// ORBITAL VISUALIZATION UTILITIES
// ============================================================================

// Calculate orbital special points
interface OrbitalPoints {
  perihelion: THREE.Vector3;
  aphelion: THREE.Vector3;
  ascendingNode: THREE.Vector3 | null;
  descendingNode: THREE.Vector3 | null;
}

function calculateOrbitalPoints(elements: OrbitalElements): OrbitalPoints {
  const a = elements.semi_major_axis_au;
  const e = elements.eccentricity;
  const inc = (elements.inclination_deg * Math.PI) / 180;
  const omega = (elements.argument_of_periapsis_deg * Math.PI) / 180;
  const Omega = (elements.longitude_of_ascending_node_deg * Math.PI) / 180;

  // Perihelion (closest to Sun)
  const perihelionDist = a * (1 - e);
  const perihelion = new THREE.Vector3(
    perihelionDist * Math.cos(omega),
    0,
    perihelionDist * Math.sin(omega)
  );
  perihelion.applyAxisAngle(new THREE.Vector3(0, 1, 0), Omega);
  perihelion.applyAxisAngle(new THREE.Vector3(1, 0, 0), inc);
  perihelion.multiplyScalar(10); // Convert to Three.js units

  // Aphelion (farthest from Sun)
  const aphelionDist = a * (1 + e);
  const aphelion = new THREE.Vector3(
    aphelionDist * Math.cos(omega + Math.PI),
    0,
    aphelionDist * Math.sin(omega + Math.PI)
  );
  aphelion.applyAxisAngle(new THREE.Vector3(0, 1, 0), Omega);
  aphelion.applyAxisAngle(new THREE.Vector3(1, 0, 0), inc);
  aphelion.multiplyScalar(10);

  // Orbital nodes (where orbit crosses ecliptic plane)
  let ascendingNode = null;
  let descendingNode = null;

  if (Math.abs(inc) > 0.01) { // Only if orbit is inclined
    // Ascending node (where orbit crosses ecliptic going north)
    const nodeAngle = -omega; // Simplified calculation
    const nodeDist = a * (1 - e * e) / (1 + e * Math.cos(nodeAngle));
    ascendingNode = new THREE.Vector3(
      nodeDist * Math.cos(Omega),
      0,
      nodeDist * Math.sin(Omega)
    );
    ascendingNode.multiplyScalar(10);

    // Descending node (opposite side)
    descendingNode = new THREE.Vector3(
      nodeDist * Math.cos(Omega + Math.PI),
      0,
      nodeDist * Math.sin(Omega + Math.PI)
    );
    descendingNode.multiplyScalar(10);
  }

  return { perihelion, aphelion, ascendingNode, descendingNode };
}

// Orbital marker component
function OrbitalMarker({
  position,
  color,
  size = 0.15,
  label,
  glow = false,
}: {
  position: THREE.Vector3;
  color: string;
  size?: number;
  label: string;
  glow?: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current && glow) {
      // Pulsing animation for current position
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
      meshRef.current.scale.setScalar(scale);
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[size, 16, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={glow ? 0.9 : 0.6}
          blending={glow ? THREE.AdditiveBlending : THREE.NormalBlending}
        />
      </mesh>
      {glow && (
        <mesh>
          <sphereGeometry args={[size * 1.5, 16, 16]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.2}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}
    </group>
  );
}

// Advanced orbit path with gradient opacity
function AdvancedOrbitPath({
  points,
  color,
  currentPositionIndex,
  isSelected,
  objectType = 'planet',
  showMarkers = true,
  orbitalElements,
}: {
  points: THREE.Vector3[];
  color: string;
  currentPositionIndex: number;
  isSelected: boolean;
  objectType?: 'planet' | 'comet' | 'asteroid' | 'interstellar';
  showMarkers?: boolean;
  orbitalElements?: OrbitalElements;
}) {
  const geometryRef = useRef<THREE.BufferGeometry>(null);
  const orbitalPoints = useMemo(() => {
    if (orbitalElements) {
      return calculateOrbitalPoints(orbitalElements);
    }
    return null;
  }, [orbitalElements]);

  // Create gradient colors for past/future orbit segments
  const colors = useMemo(() => {
    const colorArray = new Float32Array(points.length * 3);
    const baseColor = new THREE.Color(color);

    for (let i = 0; i < points.length; i++) {
      let opacity: number;
      if (i < currentPositionIndex) {
        // Past orbit: more transparent
        opacity = 0.3;
      } else {
        // Future orbit: less transparent
        opacity = 0.6;
      }

      // Apply selection brightness
      if (isSelected) {
        opacity = Math.min(opacity * 1.5, 1.0);
      }

      colorArray[i * 3] = baseColor.r * opacity;
      colorArray[i * 3 + 1] = baseColor.g * opacity;
      colorArray[i * 3 + 2] = baseColor.b * opacity;
    }

    return colorArray;
  }, [points.length, currentPositionIndex, isSelected, color]);

  // Update geometry with colors
  useEffect(() => {
    if (geometryRef.current) {
      geometryRef.current.setAttribute(
        'color',
        new THREE.BufferAttribute(colors, 3)
      );
    }
  }, [colors]);

  // Get object type color
  const getObjectColor = () => {
    if (isSelected) return color;
    
    switch (objectType) {
      case 'comet':
        return '#00CED1'; // Cyan with glow
      case 'asteroid':
        return '#808080'; // Gray
      case 'interstellar':
        return '#FF4500'; // Orange-red
      default:
        return color; // Planet color
    }
  };

  return (
    <group>
      {/* Main orbital path with dashed line style (TheSkyLive.com) */}
      <Line
        points={points}
        color={getObjectColor()}
        lineWidth={isSelected ? 5 : 4}
        transparent={false}
        dashed
        dashScale={50}
        dashSize={3}
        gapSize={1}
      />

      {/* Orbit label on path (TheSkyLive.com style) */}
      {points.length > 0 && (
        <Html
          position={points[Math.floor(points.length * 0.75)]} // Place at 75% around orbit
          center
          distanceFactor={20}
          zIndexRange={[50, 0]}
        >
          <div className="text-xs text-white/50 font-medium select-none pointer-events-none whitespace-nowrap">
            {/* This would show the object name on the orbit path */}
          </div>
        </Html>
      )}

      {/* Orbital markers */}
      {showMarkers && orbitalPoints && (
        <>
          {/* Perihelion (closest to Sun) */}
          <OrbitalMarker
            position={orbitalPoints.perihelion}
            color="#FFD700"
            size={0.12}
            label="Perihelion"
          />

          {/* Aphelion (farthest from Sun) */}
          <OrbitalMarker
            position={orbitalPoints.aphelion}
            color="#4169E1"
            size={0.12}
            label="Aphelion"
          />

          {/* Ascending node */}
          {orbitalPoints.ascendingNode && (
            <OrbitalMarker
              position={orbitalPoints.ascendingNode}
              color="#00FF00"
              size={0.08}
              label="☊"
            />
          )}

          {/* Descending node */}
          {orbitalPoints.descendingNode && (
            <OrbitalMarker
              position={orbitalPoints.descendingNode}
              color="#FF0000"
              size={0.08}
              label="☋"
            />
          )}
        </>
      )}
    </group>
  );
}

// Planet texture configurations (using Solar System Scope textures)
const PLANET_TEXTURES: Record<string, {
  color: string;
  bump?: string;
  specular?: string;
  clouds?: string;
  night?: string;
  ring?: string;
  size: number;
  hasAtmosphere?: boolean;
  atmosphereColor?: string;
  tilt?: number;
}> = {
  mercury: {
    color: 'https://www.solarsystemscope.com/textures/download/2k_mercury.jpg',
    bump: 'https://www.solarsystemscope.com/textures/download/2k_mercury.jpg',
    size: 0.35,
  },
  venus: {
    color: 'https://www.solarsystemscope.com/textures/download/2k_venus_atmosphere.jpg',
    size: 0.65,
    hasAtmosphere: true,
    atmosphereColor: '#FFA500',
  },
  earth: {
    color: 'https://www.solarsystemscope.com/textures/download/2k_earth_daymap.jpg',
    bump: 'https://www.solarsystemscope.com/textures/download/2k_earth_normal_map.jpg',
    specular: 'https://www.solarsystemscope.com/textures/download/2k_earth_specular_map.jpg',
    clouds: 'https://www.solarsystemscope.com/textures/download/2k_earth_clouds.jpg',
    night: 'https://www.solarsystemscope.com/textures/download/2k_earth_nightmap.jpg',
    size: 0.70,
    hasAtmosphere: true,
    atmosphereColor: '#4169E1',
    tilt: 23.5,
  },
  mars: {
    color: 'https://www.solarsystemscope.com/textures/download/2k_mars.jpg',
    bump: 'https://www.solarsystemscope.com/textures/download/2k_mars.jpg',
    size: 0.50,
  },
  jupiter: {
    color: 'https://www.solarsystemscope.com/textures/download/2k_jupiter.jpg',
    size: 1.8,
    hasAtmosphere: true,
    atmosphereColor: '#D2B48C',
  },
  saturn: {
    color: 'https://www.solarsystemscope.com/textures/download/2k_saturn.jpg',
    ring: 'https://www.solarsystemscope.com/textures/download/2k_saturn_ring_alpha.png',
    size: 1.5,
    hasAtmosphere: true,
    atmosphereColor: '#F4A460',
    tilt: 26.7,
  },
  uranus: {
    color: 'https://www.solarsystemscope.com/textures/download/2k_uranus.jpg',
    size: 1.0,
    hasAtmosphere: true,
    atmosphereColor: '#4FD0E7',
    tilt: 97.8,
  },
  neptune: {
    color: 'https://www.solarsystemscope.com/textures/download/2k_neptune.jpg',
    size: 0.95,
    hasAtmosphere: true,
    atmosphereColor: '#4169E1',
  },
};

// Atmosphere shader for gas giants and Earth
const atmosphereVertexShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const atmosphereFragmentShader = `
  uniform vec3 glowColor;
  uniform float coefficient;
  uniform float power;
  
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  void main() {
    vec3 viewDirection = normalize(-vPosition);
    float intensity = pow(coefficient + dot(viewDirection, vNormal), power);
    gl_FragColor = vec4(glowColor, 1.0) * intensity;
  }
`;

// ============================================================================
// CAMERA CONTROL SYSTEM & INTERFACES
// ============================================================================

// Selected object state (for camera tracking)
interface SelectedObject {
  type: 'planet' | 'neo' | 'sun';
  name: string;
  position: THREE.Vector3;
  ephemeris?: Ephemeris;
  approach?: CloseApproach;
  radius: number;
}

// Camera controller component
function CameraController({
  selectedObject,
}: {
  selectedObject: SelectedObject | null;
  onResetCamera?: () => void;
}) {
  const { camera, controls } = useThree();
  const targetPosition = useRef(new THREE.Vector3());
  const targetLookAt = useRef(new THREE.Vector3());
  const isTransitioning = useRef(false);
  const transitionProgress = useRef(0);
  const startPosition = useRef(new THREE.Vector3());
  const startLookAt = useRef(new THREE.Vector3());

  useEffect(() => {
    if (selectedObject) {
      // Start camera transition to selected object
      isTransitioning.current = true;
      transitionProgress.current = 0;
      startPosition.current.copy(camera.position);
      
      // Get current controls target (where camera is looking)
      if (controls && 'target' in controls) {
        startLookAt.current.copy(controls.target as THREE.Vector3);
      }

      // Calculate target position (offset from object)
      const distance = Math.max(selectedObject.radius * 5, 5); // Min 5 AU away
      const offset = new THREE.Vector3(distance, distance * 0.5, distance);
      targetPosition.current.copy(selectedObject.position).add(offset);
      targetLookAt.current.copy(selectedObject.position);
    }
  }, [selectedObject, camera, controls]);

  useFrame((_state, delta) => {
    if (isTransitioning.current && selectedObject) {
      // Smooth camera transition using lerp
      transitionProgress.current = Math.min(transitionProgress.current + delta * 0.8, 1);
      
      // Ease-out cubic function for smooth deceleration
      const easeProgress = 1 - Math.pow(1 - transitionProgress.current, 3);

      // Interpolate camera position
      camera.position.lerpVectors(
        startPosition.current,
        targetPosition.current,
        easeProgress
      );

      // Update controls target to look at object
      if (controls && 'target' in controls && 'update' in controls) {
        const currentLookAt = new THREE.Vector3();
        currentLookAt.lerpVectors(
          startLookAt.current,
          targetLookAt.current,
          easeProgress
        );
        (controls.target as THREE.Vector3).copy(currentLookAt);
        (controls as { update: () => void }).update();
      }

      // End transition when complete
      if (transitionProgress.current >= 1) {
        isTransitioning.current = false;
      }
    } else if (selectedObject && controls && 'target' in controls && 'update' in controls) {
      // Keep camera locked to object during orbit
      (controls.target as THREE.Vector3).copy(selectedObject.position);
      (controls as { update: () => void }).update();
    }
  });

  return null;
}

// Info overlay component (top-left TheSkyLive style)
function InfoOverlay({
  selectedObject,
  playbackSpeed,
  isPaused,
  simulationDate,
}: {
  selectedObject: SelectedObject | null;
  cameraPosition?: THREE.Vector3;
  playbackSpeed: number;
  isPaused: boolean;
  simulationDate?: Date;
}) {
  const currentDate = simulationDate || new Date();
  const timeString = currentDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });
  const dateString = currentDate.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <Html
      position={[0, 0, 0]}
      zIndexRange={[100, 0]}
    >
      <div className="fixed left-4 top-4 pointer-events-none select-none">
        {/* Time Display - TheSkyLive.com style */}
        <div className="mb-2 rounded bg-black/60 px-3 py-1.5 text-white backdrop-blur-sm border border-white/20">
          <div className="text-sm font-medium">
            Time: {dateString} {timeString}
          </div>
        </div>

        {/* Instruction Text */}
        <div className="text-xs text-white/70">
          Click orbit to lock camera on object, or{' '}
          <span className="text-yellow-400">reset camera</span>
        </div>

        {/* Playback Speed Indicator */}
        {playbackSpeed !== 1 && (
          <div className="mt-2 rounded bg-black/60 px-2 py-1 text-xs text-white backdrop-blur-sm border border-white/20">
            Speed: {isPaused ? 'PAUSED' : `${playbackSpeed.toFixed(1)}x`}
          </div>
        )}

        {/* Selected Object Info */}
        {selectedObject && (
          <div className="mt-2 rounded bg-black/70 px-3 py-2 text-white backdrop-blur-sm border border-blue-400/50">
            <div className="text-sm font-semibold text-blue-300">{selectedObject.name}</div>
            {selectedObject.ephemeris && (
              <div className="mt-1 space-y-0.5 text-xs text-white/80">
                <div>☀️ {formatDistance(selectedObject.ephemeris.distance_from_sun_au)}</div>
                <div>🌍 {formatDistance(selectedObject.ephemeris.distance_from_earth_au)}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </Html>
  );
}

// ============================================================================
// TIME CONTROL PANEL COMPONENT
// ============================================================================

function TimeControlPanel({
  simulationDate,
  isLiveMode,
  playbackSpeed,
  isPaused,
  onDateChange,
  onPlayPauseToggle,
  onSpeedChange,
  onStepBackward,
  onStepForward,
  onLiveModeToggle,
}: {
  simulationDate: Date;
  isLiveMode: boolean;
  playbackSpeed: number;
  isPaused: boolean;
  onDateChange: (date: Date) => void;
  onPlayPauseToggle: () => void;
  onSpeedChange: (speed: number) => void;
  onStepBackward: (amount: 'day' | 'month' | 'year') => void;
  onStepForward: (amount: 'day' | 'month' | 'year') => void;
  onLiveModeToggle: () => void;
}) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState(
    simulationDate.toISOString().slice(0, 10)
  );

  const speedOptions = [0.1, 0.5, 1, 10, 100, 1000];

  const handleDateSubmit = () => {
    const newDate = new Date(tempDate);
    if (!isNaN(newDate.getTime())) {
      onDateChange(newDate);
      setShowDatePicker(false);
    }
  };

  return (
    <Html position={[0, 0, 0]} zIndexRange={[100, 0]}>
      <div className="fixed right-4 top-4 pointer-events-auto select-none">
        {/* Main Time Control Box */}
        <div className="rounded-lg bg-black/80 backdrop-blur-md border border-white/30 shadow-xl">
          {/* Current Date/Time Display */}
          <div className="px-4 py-3 border-b border-white/20">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xs text-white/60">Simulation Time</div>
                <div className="text-sm font-semibold text-white">
                  {simulationDate.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>
                <div className="text-xs text-white/80">
                  {simulationDate.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </div>
              </div>
              
              {/* Live Mode Toggle */}
              <button
                onClick={onLiveModeToggle}
                className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
                  isLiveMode
                    ? 'bg-green-500 text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
                title={isLiveMode ? 'Live mode active' : 'Switch to live time'}
              >
                {isLiveMode ? '● LIVE' : 'Go Live'}
              </button>
            </div>
          </div>

          {/* Playback Controls */}
          <div className="px-4 py-3 space-y-3">
            {/* Play/Pause & Speed */}
            <div className="flex items-center gap-2">
              <button
                onClick={onPlayPauseToggle}
                disabled={isLiveMode}
                className="shrink-0 w-10 h-10 rounded-full bg-yellow-500 hover:bg-yellow-400 disabled:bg-white/10 disabled:text-white/30 text-black flex items-center justify-center font-bold transition-colors"
                title={isPaused ? 'Play' : 'Pause'}
              >
                {isPaused ? '▶' : '⏸'}
              </button>
              
              <div className="flex-1 min-w-0">
                <div className="text-xs text-white/60 mb-1">Playback Speed</div>
                <select
                  value={playbackSpeed}
                  onChange={(e) => onSpeedChange(Number(e.target.value))}
                  disabled={isLiveMode || isPaused}
                  title="Playback speed in days per second"
                  className="w-full px-2 py-1 rounded bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:border-yellow-400 disabled:opacity-50"
                >
                  {speedOptions.map((speed) => (
                    <option key={speed} value={speed} className="bg-gray-900">
                      {speed}x {speed >= 100 ? 'days/sec' : 'days/sec'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Step Controls */}
            <div className="space-y-2">
              <div className="text-xs text-white/60">Time Steps</div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onStepBackward('day')}
                  disabled={isLiveMode}
                  className="px-2 py-1.5 rounded bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white text-xs transition-colors"
                >
                  ◀ 1 Day
                </button>
                <button
                  onClick={() => onStepForward('day')}
                  disabled={isLiveMode}
                  className="px-2 py-1.5 rounded bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white text-xs transition-colors"
                >
                  1 Day ▶
                </button>
                <button
                  onClick={() => onStepBackward('month')}
                  disabled={isLiveMode}
                  className="px-2 py-1.5 rounded bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white text-xs transition-colors"
                >
                  ◀ 1 Month
                </button>
                <button
                  onClick={() => onStepForward('month')}
                  disabled={isLiveMode}
                  className="px-2 py-1.5 rounded bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white text-xs transition-colors"
                >
                  1 Month ▶
                </button>
                <button
                  onClick={() => onStepBackward('year')}
                  disabled={isLiveMode}
                  className="px-2 py-1.5 rounded bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white text-xs transition-colors"
                >
                  ◀ 1 Year
                </button>
                <button
                  onClick={() => onStepForward('year')}
                  disabled={isLiveMode}
                  className="px-2 py-1.5 rounded bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white text-xs transition-colors"
                >
                  1 Year ▶
                </button>
              </div>
            </div>

            {/* Date Picker */}
            <div className="space-y-2">
              <button
                onClick={() => setShowDatePicker(!showDatePicker)}
                disabled={isLiveMode}
                className="w-full px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white text-xs transition-colors"
              >
                📅 Jump to Date
              </button>
              
              {showDatePicker && (
                <div className="space-y-2">
                  <input
                    type="date"
                    value={tempDate}
                    onChange={(e) => setTempDate(e.target.value)}
                    title="Select simulation date"
                    placeholder="YYYY-MM-DD"
                    className="w-full px-2 py-1.5 rounded bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:border-yellow-400"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleDateSubmit}
                      className="flex-1 px-2 py-1 rounded bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-semibold transition-colors"
                    >
                      Go
                    </button>
                    <button
                      onClick={() => setShowDatePicker(false)}
                      className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-xs transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Keyboard Shortcuts Help */}
        <div className="mt-2 px-3 py-2 rounded bg-black/60 backdrop-blur-sm border border-white/20 text-xs text-white/70">
          <div className="font-semibold text-white mb-1">Shortcuts</div>
          <div>Space: Play/Pause • +/-: Speed • ←→: Step Day</div>
        </div>
      </div>
    </Html>
  );
}

// ============================================================================
// ORBIT PATH LABELS COMPONENT (TheSkyLive.com style)
// ============================================================================

function OrbitPathLabel({
  planetName,
  orbitPoints,
  color,
}: {
  planetName: string;
  orbitPoints: THREE.Vector3[];
  color: string;
}) {
  // Place label at aphelion (farthest point from sun)
  const labelPosition = useMemo(() => {
    if (!orbitPoints || orbitPoints.length === 0) return new THREE.Vector3();
    
    // Find point farthest from origin (aphelion)
    let maxDist = 0;
    let aphelionPoint = orbitPoints[0];
    
    orbitPoints.forEach(point => {
      const dist = Math.sqrt(point.x * point.x + point.y * point.y + point.z * point.z);
      if (dist > maxDist) {
        maxDist = dist;
        aphelionPoint = point;
      }
    });
    
    return aphelionPoint;
  }, [orbitPoints]);

  return (
    <Html
      position={[labelPosition.x, labelPosition.y, labelPosition.z]}
      center
      distanceFactor={50}
      zIndexRange={[100, 0]}
    >
      <div
        className="pointer-events-none select-none px-2 py-0.5 text-xs font-semibold tracking-wide"
        style={{
          color: color,
          textShadow: `0 0 4px ${color}, 0 0 8px ${color}`,
          opacity: 0.7,
        }}
      >
        {planetName.toUpperCase()}
      </div>
    </Html>
  );
}

// ============================================================================
// REALISTIC STARFIELD COMPONENT
// ============================================================================

function RealisticStarfield() {
  const starsRef = useRef<THREE.Points>(null);

  const starGeometry = useMemo(() => {
    const starCount = 12000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);

    // Star color temperatures (B-V index approximation)
    const starTypes = [
      { color: [0.6, 0.7, 1.0], weight: 15 },   // Blue-white (hot O, B stars)
      { color: [0.9, 0.9, 1.0], weight: 25 },   // White (A stars)
      { color: [1.0, 1.0, 0.9], weight: 30 },   // Yellow-white (F, G stars like Sun)
      { color: [1.0, 0.9, 0.7], weight: 20 },   // Orange (K stars)
      { color: [1.0, 0.7, 0.5], weight: 10 },   // Red (M stars)
    ];
    
    const rng = new SeededRandom(12345);

    for (let i = 0; i < starCount; i++) {
      // Distribute stars in a sphere (Hipparcos-style)
      const radius = 300 + rng.next() * 200;
      const theta = rng.next() * Math.PI * 2;
      const phi = Math.acos(2 * rng.next() - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      // Assign star color based on weighted distribution
      const rand = rng.next() * 100;
      let cumulative = 0;
      let selectedType = starTypes[2]; // Default to yellow-white
      
      for (const type of starTypes) {
        cumulative += type.weight;
        if (rand <= cumulative) {
          selectedType = type;
          break;
        }
      }

      colors[i * 3] = selectedType.color[0];
      colors[i * 3 + 1] = selectedType.color[1];
      colors[i * 3 + 2] = selectedType.color[2];

      // Magnitude-based size (brighter stars are larger)
      const magnitude = rng.next();
      sizes[i] = magnitude < 0.1 ? 3.5 : // Bright stars
                 magnitude < 0.3 ? 2.5 : // Medium stars
                 magnitude < 0.6 ? 1.5 : // Dimmer stars
                 1.0;                      // Faint stars
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    return geometry;
  }, []);

  useFrame((state) => {
    if (starsRef.current) {
      // Subtle parallax rotation
      starsRef.current.rotation.y = state.clock.elapsedTime * 0.0001;
    }
  });

  return (
    <points ref={starsRef} geometry={starGeometry}>
      <pointsMaterial
        size={1.5}
        sizeAttenuation={true}
        vertexColors={true}
        transparent={true}
        opacity={0.9}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// ============================================================================
// MILKY WAY GLOW COMPONENT
// ============================================================================

function MilkyWayGlow() {
  const spriteTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;

    // Create radial gradient for glow
    const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, 'rgba(200, 220, 255, 0.3)');
    gradient.addColorStop(0.3, 'rgba(150, 180, 255, 0.15)');
    gradient.addColorStop(0.6, 'rgba(100, 130, 200, 0.05)');
    gradient.addColorStop(1, 'rgba(50, 70, 150, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);

    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, []);

  return (
    <group>
      {/* Multiple glow sprites at different positions for depth */}
      {[
        { pos: [0, 50, -300], scale: 250 },
        { pos: [150, -30, -280], scale: 180 },
        { pos: [-120, 40, -290], scale: 200 },
        { pos: [80, -50, -270], scale: 160 },
        { pos: [-150, 60, -310], scale: 190 },
      ].map((glow, idx) => (
        <sprite key={idx} position={glow.pos as [number, number, number]} scale={[glow.scale, glow.scale, 1]}>
          <spriteMaterial
            map={spriteTexture}
            transparent={true}
            opacity={0.6}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </sprite>
      ))}
    </group>
  );
}

// ============================================================================
// ECLIPTIC GRID COMPONENT (TheSkyLive.com style)
// ============================================================================

function EclipticGrid() {
  const gridLines = useMemo(() => {
    const lines: THREE.Vector3[][] = [];
    const gridSize = 500;
    const majorStep = 50;

    // Create major circles in the ecliptic plane
    for (let i = -gridSize; i <= gridSize; i += majorStep) {
      // Longitude lines (vertical circles)
      const longitudeLine: THREE.Vector3[] = [];
      for (let angle = 0; angle <= Math.PI * 2; angle += 0.1) {
        longitudeLine.push(
          new THREE.Vector3(
            i,
            Math.sin(angle) * gridSize * 0.8,
            Math.cos(angle) * gridSize * 0.8
          )
        );
      }
      lines.push(longitudeLine);

      // Latitude lines (horizontal circles)
      const latitudeLine: THREE.Vector3[] = [];
      for (let angle = 0; angle <= Math.PI * 2; angle += 0.1) {
        latitudeLine.push(
          new THREE.Vector3(
            Math.cos(angle) * gridSize,
            i * 0.8,
            Math.sin(angle) * gridSize
          )
        );
      }
      lines.push(latitudeLine);
    }

    // Ecliptic plane (main horizontal circle)
    const eclipticCircle: THREE.Vector3[] = [];
    for (let angle = 0; angle <= Math.PI * 2; angle += 0.05) {
      eclipticCircle.push(
        new THREE.Vector3(
          Math.cos(angle) * gridSize,
          0,
          Math.sin(angle) * gridSize
        )
      );
    }
    lines.push(eclipticCircle);

    return lines;
  }, []);

  return (
    <group>
      {gridLines.map((line, idx) => (
        <Line
          key={idx}
          points={line}
          color="#00d4ff"
          lineWidth={idx === gridLines.length - 1 ? 2 : 0.5}
          transparent
          opacity={idx === gridLines.length - 1 ? 0.4 : 0.2}
        />
      ))}
    </group>
  );
}

// ============================================================================
// CONSTELLATION LINES (TheSkyLive.com Background)
// ============================================================================

function ConstellationLines() {
  // Simplified constellation patterns for subtle visual effect (TheSkyLive.com style)
  const constellationPatterns = useMemo(() => {
    const distance = 450; // Project onto celestial sphere (farther back)
    const patterns: THREE.Vector3[][] = [];
    const rng = new SeededRandom(54321); // Use seeded random for consistency
    
    // Reduce to only 5 major constellations for cleaner look
    // Orion pattern (simplified)
    patterns.push([
      new THREE.Vector3(-80, 140, -distance),
      new THREE.Vector3(-40, 170, -distance),
      new THREE.Vector3(0, 190, -distance),
      new THREE.Vector3(40, 170, -distance),
    ]);
    
    // Big Dipper pattern
    patterns.push([
      new THREE.Vector3(180, 90, -distance),
      new THREE.Vector3(210, 105, -distance),
      new THREE.Vector3(240, 95, -distance),
    ]);
    
    // Cassiopeia W pattern
    patterns.push([
      new THREE.Vector3(-180, 180, -distance),
      new THREE.Vector3(-150, 200, -distance),
      new THREE.Vector3(-120, 185, -distance),
    ]);
    
    // Two additional subtle patterns
    for (let i = 0; i < 2; i++) {
      const pattern: THREE.Vector3[] = [];
      const baseX = (rng.next() - 0.5) * 500;
      const baseY = (rng.next() - 0.5) * 350;
      const segments = 2 + Math.floor(rng.next() * 3); // Fewer segments
      
      for (let j = 0; j < segments; j++) {
        pattern.push(
          new THREE.Vector3(
            baseX + j * 40 + (rng.next() - 0.5) * 30,
            baseY + (rng.next() - 0.5) * 50,
            -distance + (rng.next() - 0.5) * 40
          )
        );
      }
      patterns.push(pattern);
    }
    
    return patterns;
  }, []);

  return (
    <group>
      {constellationPatterns.map((pattern, i) => (
        <Line
          key={i}
          points={pattern}
          color="#9CA3AF"  // Gray/purple - more subtle than before
          lineWidth={0.3}
          transparent
          opacity={0.08}  // Very subtle
        />
      ))}
    </group>
  );
}

// ============================================================================
// COORDINATE GRID COMPONENT (Updated)
// ============================================================================

interface CoordinateGridProps {
  size?: number;
  divisions?: number;
  colorCenterLine?: string;
  colorGrid?: string;
}

function CoordinateGrid({
  size = 500,
  divisions = 20,
  colorCenterLine = '#6366F1',
  colorGrid = '#4B5563',
}: CoordinateGridProps) {
  return (
    <group>
      {/* XZ Plane Grid (horizontal) - more subtle */}
      <gridHelper
        args={[size, divisions, '#4B5563', '#374151']}
        rotation={[0, 0, 0]}
        material-opacity={0.15}
        material-transparent={true}
      />

      {/* XY Plane Grid (vertical - ecliptic) - more subtle */}
      <gridHelper
        args={[size, divisions, '#6366F1', '#374151']}
        rotation={[Math.PI / 2, 0, 0]}
        material-opacity={0.15}
        material-transparent={true}
      />

      {/* YZ Plane Grid (vertical) - more subtle */}
      <gridHelper
        args={[size, divisions, '#10B981', '#374151']}
        rotation={[0, 0, Math.PI / 2]}
        material-opacity={0.15}
        material-transparent={true}
      />
    </group>
  );
}

// ============================================================================
// TEXTURED PLANET COMPONENT (Phase 2: TheSkyLive.com Quality)
// ============================================================================

interface PlanetProps {
  name: string;
  ephemeris?: Ephemeris;
  orbitalElements?: OrbitalElements;
  speedMultiplier: number;
  onSelect?: (ephemeris: Ephemeris | null) => void;
  showOrbit?: boolean;
  showLabel?: boolean;
  isSelected?: boolean;
  dimmed?: boolean;
}

function Planet({
  name,
  ephemeris,
  orbitalElements,
  speedMultiplier,
  onSelect,
  showOrbit = true,
  showLabel = false,
  isSelected = false,
  dimmed = false,
}: PlanetProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const config = getPlanetConfig(name);
  const [orbitPosition, setOrbitPosition] = useState(0);
  const [texturesLoaded, setTexturesLoaded] = useState(false);

  const planetName = name.toLowerCase();
  const textureConfig = PLANET_TEXTURES[planetName];
  const planetSize = textureConfig?.size || config.size * 0.5;

  // Load planet textures
  const textures = useMemo(() => {
    if (!textureConfig) return null;

    const loadedTextures: {
      color?: THREE.Texture;
      bump?: THREE.Texture;
      specular?: THREE.Texture;
      clouds?: THREE.Texture;
      night?: THREE.Texture;
    } = {};

    // Load color map
    if (textureConfig.color) {
      loadedTextures.color = textureLoader.load(
        textureConfig.color,
        () => setTexturesLoaded(true),
        undefined,
        (error) => {
          console.warn(`Failed to load ${planetName} color texture:`, error);
          setTexturesLoaded(true);
        }
      );
    }

    // Load bump map
    if (textureConfig.bump) {
      loadedTextures.bump = textureLoader.load(textureConfig.bump);
    }

    // Load specular map (Earth only)
    if (textureConfig.specular) {
      loadedTextures.specular = textureLoader.load(textureConfig.specular);
    }

    // Load clouds (Earth only)
    if (textureConfig.clouds) {
      loadedTextures.clouds = textureLoader.load(textureConfig.clouds);
    }

    // Load night lights (Earth only)
    if (textureConfig.night) {
      loadedTextures.night = textureLoader.load(textureConfig.night);
    }

    return loadedTextures;
  }, [textureConfig, planetName]);

  // Calculate elliptical orbit from orbital elements
  const orbitPoints = useMemo(() => {
    if (orbitalElements) {
      return calculateEllipticalOrbit(orbitalElements, 128);
    }
    // Fallback: create circular orbit based on average distance
    const fallbackDistances: Record<string, number> = {
      mercury: 0.39,
      venus: 0.72,
      earth: 1.0,
      mars: 1.52,
      jupiter: 5.2,
      saturn: 9.54,
      uranus: 19.19,
      neptune: 30.07,
    };
    const distance = fallbackDistances[planetName] || 1.0;
    const points: THREE.Vector3[] = [];
    const segments = 128;
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      points.push(new THREE.Vector3(
        Math.cos(angle) * distance * 10,
        0,
        Math.sin(angle) * distance * 10
      ));
    }
    return points;
  }, [orbitalElements, planetName]);

  // Get position from ephemeris or calculate from orbit
  const position = useMemo(() => {
    if (ephemeris) {
      return auToThreeJS(ephemeris.x_au, ephemeris.y_au, ephemeris.z_au);
    }
    if (orbitalElements) {
      const pos = getPositionFromOrbit(orbitalElements, orbitPosition);
      return [pos.x, pos.y, pos.z] as [number, number, number];
    }
    // Fallback
    const fallbackDistances: Record<string, number> = {
      mercury: 0.4,
      venus: 0.7,
      earth: 1.0,
      mars: 1.5,
      jupiter: 5.2,
      saturn: 9.5,
      uranus: 19.2,
      neptune: 30.1,
    };
    const distance = fallbackDistances[planetName] || 1.0;
    return [distance * 10, 0, 0] as [number, number, number];
  }, [ephemeris, orbitalElements, orbitPosition, planetName]);

  // Animate orbit position and rotation
  useFrame((state, delta) => {
    if (meshRef.current) {
      // Rotate planet on its axis (different speeds for realism)
      const rotationSpeeds: Record<string, number> = {
        jupiter: 0.04,  // Fast rotator
        saturn: 0.038,
        earth: 0.01,
        mars: 0.01,
        venus: 0.002,   // Slow rotator
        mercury: 0.005,
        uranus: 0.015,
        neptune: 0.012,
      };
      const rotationSpeed = rotationSpeeds[planetName] || 0.01;
      meshRef.current.rotation.y += rotationSpeed * speedMultiplier;
    }

    // Advance orbit position if using orbital elements
    if (orbitalElements && !ephemeris) {
      setOrbitPosition((prev) => prev + delta * speedMultiplier * 0.1);
    }

    // Rotate clouds slightly faster than planet (Earth)
    if (cloudsRef.current && planetName === 'earth') {
      cloudsRef.current.rotation.y += 0.012 * speedMultiplier;
    }

    // Rotate atmosphere glow
    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y += 0.001 * speedMultiplier;
    }
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect(ephemeris || null);
    }
  };

  // Calculate tilt
  const tiltRadians = textureConfig?.tilt ? (textureConfig.tilt * Math.PI) / 180 : 0;

  // Get TheSkyLive.com-style orbit color
  // Get TheSkyLive.com-style orbit color
  const getOrbitColor = () => {
    const orbitColors: Record<string, string> = {
      mercury: '#967E76',  // TheSkyLive: 0x967E76
      venus: '#9CD4C2',    // TheSkyLive: 0x9CD4C2
      earth: '#5B8CDF',    // TheSkyLive: 0x5B8CDF
      mars: '#D33826',     // TheSkyLive: 0xD33826
      jupiter: '#B2B767',  // TheSkyLive: 0xB2B767
      saturn: '#DE7C72',   // TheSkyLive: 0xDE7C72
      uranus: '#B7C0DF',   // TheSkyLive: 0xB7C0DF
      neptune: '#9A8BB3',  // TheSkyLive: 0x9A8BB3
    };
    return orbitColors[planetName] || '#4B5563';
  };

  // Calculate current position index in orbit
  const currentOrbitIndex = useMemo(() => {
    if (!orbitPoints) return 0;
    // Find closest point to current position
    let minDist = Infinity;
    let closestIndex = 0;
    for (let i = 0; i < orbitPoints.length; i++) {
      const point = orbitPoints[i];
      const dist = Math.sqrt(
        Math.pow(point.x - position[0], 2) +
        Math.pow(point.y - position[1], 2) +
        Math.pow(point.z - position[2], 2)
      );
      if (dist < minDist) {
        minDist = dist;
        closestIndex = i;
      }
    }
    return closestIndex;
  }, [orbitPoints, position]);

  return (
    <group>
      {/* Advanced Orbital Path with markers */}
      {showOrbit && orbitPoints && (
        <>
          <AdvancedOrbitPath
            points={orbitPoints}
            color={getOrbitColor()}
            currentPositionIndex={currentOrbitIndex}
            isSelected={isSelected || hovered}
            objectType="planet"
            showMarkers={isSelected}
            orbitalElements={orbitalElements}
          />
          
          {/* Orbit Path Label (TheSkyLive.com style) */}
          {showLabel && (
            <OrbitPathLabel
              planetName={planetName}
              orbitPoints={orbitPoints}
              color={getOrbitColor()}
            />
          )}
        </>
      )}

      {/* Planet Group (with tilt) */}
      <group position={position} rotation={[tiltRadians, 0, 0]}>
        {/* Main Planet Mesh */}
        <mesh
          ref={meshRef}
          onClick={handleClick}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <sphereGeometry args={[planetSize, 64, 64]} />
          {textures?.color ? (
            <meshPhongMaterial
              map={textures.color}
              bumpMap={textures.bump}
              bumpScale={0.02}
              specularMap={textures.specular}
              specular={new THREE.Color(planetName === 'earth' ? 0x333333 : 0x111111)}
              shininess={planetName === 'earth' ? 10 : 5}
              emissive={new THREE.Color(config.color)}
              emissiveIntensity={hovered ? 0.5 : 0.3}
              opacity={dimmed ? 0.4 : 1.0}
              transparent={dimmed}
            />
          ) : (
            // Fallback to simple material if texture fails
            <meshPhongMaterial
              color={config.color}
              emissive={config.color}
              emissiveIntensity={hovered ? 0.5 : 0.3}
              shininess={5}
              opacity={dimmed ? 0.4 : 1.0}
              transparent={dimmed}
            />
          )}
        </mesh>

        {/* Earth Clouds Layer */}
        {planetName === 'earth' && textures?.clouds && (
          <mesh ref={cloudsRef}>
            <sphereGeometry args={[planetSize * 1.01, 64, 64]} />
            <meshPhongMaterial
              map={textures.clouds}
              transparent
              opacity={0.4}
              depthWrite={false}
            />
          </mesh>
        )}

        {/* Earth Night Lights */}
        {planetName === 'earth' && textures?.night && (
          <mesh>
            <sphereGeometry args={[planetSize * 1.002, 64, 64]} />
            <meshBasicMaterial
              map={textures.night}
              transparent
              opacity={0.6}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        )}

        {/* Atmosphere Glow (Fresnel Effect) */}
        {textureConfig?.hasAtmosphere && (
          <mesh ref={atmosphereRef}>
            <sphereGeometry args={[planetSize * 1.15, 64, 64]} />
            <shaderMaterial
              vertexShader={atmosphereVertexShader}
              fragmentShader={atmosphereFragmentShader}
              uniforms={{
                glowColor: { value: new THREE.Color(textureConfig.atmosphereColor || '#4169E1') },
                coefficient: { value: 0.5 },
                power: { value: 3.5 },
              }}
              side={THREE.BackSide}
              blending={THREE.AdditiveBlending}
              transparent
            />
          </mesh>
        )}

        {/* Saturn's Rings */}
        {planetName === 'saturn' && textureConfig.ring && (
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[planetSize * 1.2, planetSize * 2.2, 128]} />
            <meshBasicMaterial
              map={textureLoader.load(textureConfig.ring)}
              side={THREE.DoubleSide}
              transparent
              opacity={0.9}
            />
          </mesh>
        )}
      </group>

      {/* Directional Line to Label (TheSkyLive.com style) */}
      {(showLabel || hovered) && (
        <>
          {/* Line from planet to label position */}
          <Line
            points={[
              position,
              [position[0], position[1] + planetSize * 3, position[2]],
            ]}
            color={hovered ? '#60A5FA' : '#FFFFFF'}
            lineWidth={1}
            transparent
            opacity={hovered ? 0.8 : 0.5}
          />
          
          {/* Label (HTML overlay with distance-based scaling) */}
          <Html 
            position={[position[0], position[1] + planetSize * 3, position[2]]}
            distanceFactor={15}
            zIndexRange={[100, 0]} 
            center
            className="transition-all duration-200 ease-out pointer-events-none"
          >
            <div 
              className={`whitespace-nowrap rounded px-2 py-1 text-xs shadow-lg backdrop-blur-sm border transition-all duration-200 select-none ${
                hovered
                  ? 'bg-blue-900/95 border-blue-400 text-blue-50 scale-110'
                  : 'bg-black/80 border-white/30 text-white'
              }`}
            >
              <div className={`font-medium text-center ${hovered ? 'text-sm' : ''}`}>
                {config.name}
              </div>
              {!texturesLoaded && (
                <div className="text-zinc-400 text-xs mt-0.5 text-center animate-pulse">
                  Loading...
                </div>
              )}
              {ephemeris && hovered && (
                <div className="mt-1 space-y-0.5 border-t border-white/20 pt-1">
                  <div className="text-zinc-200 text-center text-[10px]">
                    {formatDistance(ephemeris.distance_from_sun_au)} from Sun
                  </div>
                  <div className="text-zinc-200 text-center text-[10px]">
                    {formatDistance(ephemeris.distance_from_earth_au)} from Earth
                  </div>
                </div>
              )}
            </div>
          </Html>
        </>
      )}
    </group>
  );
}

// ============================================================================
// NEO/ASTEROID COMPONENT
// ============================================================================

interface NEOProps {
  approach: CloseApproach;
  orbitalElements?: OrbitalElements;
  speedMultiplier: number;
  onSelect?: (approach: CloseApproach) => void;
}

function NEO({ approach, orbitalElements, speedMultiplier, onSelect }: NEOProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [orbitPosition, setOrbitPosition] = useState(0);
  const config = getNEOConfig(approach);

  // Calculate orbit if available
  const orbitPoints = useMemo(() => {
    if (orbitalElements) {
      return calculateEllipticalOrbit(orbitalElements, 64);
    }
    return null;
  }, [orbitalElements]);

  // Calculate position
  const position = useMemo(() => {
    if (orbitalElements) {
      const pos = getPositionFromOrbit(orbitalElements, orbitPosition);
      return [pos.x, pos.y, pos.z] as [number, number, number];
    }
    // Fallback: use miss distance
    const dist = approach.miss_distance_au * 10;
    return [dist, 0, 0] as [number, number, number];
  }, [orbitalElements, orbitPosition, approach]);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.position.set(position[0], position[1], position[2]);
      meshRef.current.rotation.y += 0.02 * speedMultiplier;

      if (orbitalElements) {
        setOrbitPosition((prev) => prev + delta * speedMultiplier * 0.2);
      }
    }
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect(approach);
    }
  };

  return (
    <group>
      {/* Orbit path */}
      {orbitPoints && (
        <Line
          points={orbitPoints}
          color={config.isDangerous ? '#FF6B6B' : '#666666'}
          lineWidth={1}
          transparent
          opacity={0.4}
          dashed
          dashSize={0.5}
          gapSize={0.5}
        />
      )}

      {/* NEO Mesh */}
      <mesh
        ref={meshRef}
        position={position}
        onClick={handleClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <octahedronGeometry args={[config.size, 0]} />
        <meshStandardMaterial
          color={config.color}
          emissive={config.isDangerous ? '#FF0000' : '#000000'}
          emissiveIntensity={config.isDangerous ? 0.5 : 0}
          metalness={0.8}
          roughness={0.2}
        />

        {/* Danger glow */}
        {config.isDangerous && (
          <pointLight color="#FF0000" intensity={2} distance={5} />
        )}

        {/* Label */}
        {hovered && (
          <Html distanceFactor={15} zIndexRange={[100, 0]}>
            <div className="pointer-events-none rounded-lg bg-red-900/95 px-3 py-2 text-xs text-zinc-50 shadow-lg backdrop-blur-sm border border-red-700">
              <div className="font-semibold">{config.name}</div>
              <div className="mt-1 text-red-200">
                Approach: {formatApproachDate(approach.approach_date)}
              </div>
              <div className="text-red-200">
                Miss: {formatDistance(approach.miss_distance_au)}
              </div>
              <div className="text-red-200">
                Velocity: {approach.relative_velocity_km_s.toFixed(2)} km/s
              </div>
            </div>
          </Html>
        )}
      </mesh>
    </group>
  );
}

// ============================================================================
// SUN COMPONENT WITH PROFESSIONAL LENS FLARE (TheSkyLive.com Style)
// ============================================================================

function Sun() {
  const meshRef = useRef<THREE.Mesh>(null);
  const coronaRef = useRef<THREE.Mesh>(null);
  const surfaceRef = useRef<THREE.Mesh>(null);
  const flareGroupRef = useRef<THREE.Group>(null);

  // Dynamic rotation with realistic speed
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.004; // Visible dynamic rotation
    }
    
    // Subtle surface animation
    if (surfaceRef.current) {
      surfaceRef.current.rotation.y += 0.005; // Slightly faster for depth
      surfaceRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.05;
    }
    
    // Animate corona with gentle pulsing effect
    if (coronaRef.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.08;
      coronaRef.current.scale.setScalar(pulse);
    }

    // Animate lens flare elements
    if (flareGroupRef.current) {
      flareGroupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.3) * 0.05;
    }
  });

  const sunRadius = 3.5; // Impressive scale

  return (
    <group>
      {/* Core Sun sphere with ultra-high resolution */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[sunRadius, 128, 128]} />
        <meshBasicMaterial
          color="#FFD700"
          toneMapped={false}
        />

        {/* Primary light source - bright white for realistic planet illumination */}
        <pointLight 
          intensity={22} 
          distance={1500} 
          decay={1.5} 
          color="#FFFFFF"
          castShadow={false}
        />
        {/* Secondary warm glow */}
        <pointLight 
          intensity={16} 
          distance={1000} 
          decay={1.5} 
          color="#FFDD88" 
        />
        {/* Tertiary orange glow */}
        <pointLight 
          intensity={12} 
          distance={600} 
          decay={1.3} 
          color="#FFB855" 
        />
      </mesh>

      {/* Dynamic surface texture layer (animated) */}
      <mesh ref={surfaceRef}>
        <sphereGeometry args={[sunRadius * 1.01, 128, 128]} />
        <meshBasicMaterial
          color="#FF8800"
          transparent
          opacity={0.5}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Inner corona layer with pulsing animation */}
      <mesh ref={coronaRef}>
        <sphereGeometry args={[sunRadius * 1.4, 64, 64]} />
        <meshBasicMaterial
          color="#FDB813"
          transparent
          opacity={0.45}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Middle corona layer - bright yellow-orange */}
      <mesh>
        <sphereGeometry args={[sunRadius * 1.8, 64, 64]} />
        <meshBasicMaterial
          color="#FF9933"
          transparent
          opacity={0.25}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Outer corona layer - solar atmosphere */}
      <mesh>
        <sphereGeometry args={[sunRadius * 2.3, 64, 64]} />
        <meshBasicMaterial
          color="#FFAA55"
          transparent
          opacity={0.15}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Far corona halo - subtle glow */}
      <mesh>
        <sphereGeometry args={[sunRadius * 3, 64, 64]} />
        <meshBasicMaterial
          color="#FFD700"
          transparent
          opacity={0.05}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Ultra-far halo for depth */}
      <mesh>
        <sphereGeometry args={[sunRadius * 4, 32, 32]} />
        <meshBasicMaterial
          color="#FFF4E6"
          transparent
          opacity={0.02}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Professional Lens Flare Effects (TheSkyLive.com style) */}
      <group ref={flareGroupRef}>
        {/* Primary flare - large center glow */}
        <mesh position={[0, 0, 0]}>
          <circleGeometry args={[sunRadius * 1.5, 32]} />
          <meshBasicMaterial
            color="#FFFFFF"
            transparent
            opacity={0.15}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        {/* Secondary flare rings */}
        {[1.8, 2.2, 2.6].map((scale, i) => (
          <mesh key={i} position={[0, 0, 0]}>
            <ringGeometry args={[sunRadius * scale * 0.9, sunRadius * scale, 32]} />
            <meshBasicMaterial
              color="#FFE680"
              transparent
              opacity={0.08 - i * 0.02}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}

        {/* Lens flare streaks (4 directional) */}
        {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((angle, i) => (
          <mesh
            key={`streak-${i}`}
            position={[
              Math.cos(angle) * sunRadius * 0.3,
              Math.sin(angle) * sunRadius * 0.3,
              0,
            ]}
            rotation={[0, 0, angle]}
          >
            <planeGeometry args={[sunRadius * 0.15, sunRadius * 3]} />
            <meshBasicMaterial
              color="#FFEEAA"
              transparent
              opacity={0.12}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}

// ============================================================================
// MAIN SOLAR SYSTEM CANVAS
// ============================================================================

const PLANET_NAMES = [
  'Mercury',
  'Venus',
  'Earth',
  'Mars',
  'Jupiter',
  'Saturn',
  'Uranus',
  'Neptune',
];

interface EnhancedSolarSystemCanvasProps {
  speedMultiplier?: number;
  ephemerisData?: Ephemeris[];
  orbitalElementsData?: OrbitalElements[];
  closeApproachesData?: CloseApproach[];
  onPlanetSelect?: (ephemeris: Ephemeris | null) => void;
  onNEOSelect?: (approach: CloseApproach) => void;
  showGrid?: boolean;
  showOrbits?: boolean;
  showLabels?: boolean;
  showNEOs?: boolean;
}

export default function EnhancedSolarSystemCanvas({
  speedMultiplier = 1,
  ephemerisData = [],
  orbitalElementsData = [],
  closeApproachesData = [],
  onPlanetSelect,
  onNEOSelect,
  showGrid = true,
  showOrbits = true,
  showLabels = true,
  showNEOs = true,
}: EnhancedSolarSystemCanvasProps) {
  const [selectedObject, setSelectedObject] = useState<SelectedObject | null>(null);
  const [cameraPosition, setCameraPosition] = useState(new THREE.Vector3(0, 50, 80));
  
  // Time simulation state
  const [simulationDate, setSimulationDate] = useState(new Date());
  const [isLiveMode, setIsLiveMode] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [simulationPaused, setSimulationPaused] = useState(false);
  const lastUpdateTime = useRef(Date.now());

  // Update simulation time
  useEffect(() => {
    if (isLiveMode) {
      // In live mode, sync to real-world time
      const interval = setInterval(() => {
        setSimulationDate(new Date());
      }, 1000);
      return () => clearInterval(interval);
    } else if (!simulationPaused) {
      // In simulation mode, advance time based on playback speed
      const interval = setInterval(() => {
        setSimulationDate((prev) => {
          const now = Date.now();
          const deltaSeconds = (now - lastUpdateTime.current) / 1000;
          lastUpdateTime.current = now;
          
          // playbackSpeed is in days per second
          const deltaDays = deltaSeconds * playbackSpeed;
          const newDate = new Date(prev);
          newDate.setDate(newDate.getDate() + deltaDays);
          return newDate;
        });
      }, 50); // Update 20 times per second for smooth animation
      
      return () => clearInterval(interval);
    }
  }, [isLiveMode, simulationPaused, playbackSpeed]);

  // Time control handlers
  const handlePlayPauseToggle = () => {
    setSimulationPaused(!simulationPaused);
    lastUpdateTime.current = Date.now();
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    lastUpdateTime.current = Date.now();
  };

  const handleStepBackward = useCallback((amount: 'day' | 'month' | 'year') => {
    setSimulationDate((prev) => {
      const newDate = new Date(prev);
      if (amount === 'day') newDate.setDate(newDate.getDate() - 1);
      else if (amount === 'month') newDate.setMonth(newDate.getMonth() - 1);
      else if (amount === 'year') newDate.setFullYear(newDate.getFullYear() - 1);
      return newDate;
    });
  }, []);

  const handleStepForward = useCallback((amount: 'day' | 'month' | 'year') => {
    setSimulationDate((prev) => {
      const newDate = new Date(prev);
      if (amount === 'day') newDate.setDate(newDate.getDate() + 1);
      else if (amount === 'month') newDate.setMonth(newDate.getMonth() + 1);
      else if (amount === 'year') newDate.setFullYear(newDate.getFullYear() + 1);
      return newDate;
    });
  }, []);

  const handleLiveModeToggle = () => {
    if (!isLiveMode) {
      setSimulationDate(new Date());
    }
    setIsLiveMode(!isLiveMode);
    setSimulationPaused(false);
    lastUpdateTime.current = Date.now();
  };

  const handleDateChange = (date: Date) => {
    setSimulationDate(date);
    setIsLiveMode(false);
    lastUpdateTime.current = Date.now();
  };

  // Calculate interpolated positions based on simulation time
  const interpolatedPositions = useMemo(() => {
    const julianDate = dateToJulianDate(simulationDate);
    return interpolateEphemeris(ephemerisData, julianDate);
  }, [simulationDate, ephemerisData]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return; // Don't trigger when typing
      
      switch (e.code) {
        case 'Space':
          e.preventDefault();
          setSimulationPaused(p => !p);
          lastUpdateTime.current = Date.now();
          break;
        case 'Equal': // + key
        case 'NumpadAdd':
          e.preventDefault();
          setPlaybackSpeed((prev) => Math.min(prev * 2, 1000));
          break;
        case 'Minus':
        case 'NumpadSubtract':
          e.preventDefault();
          setPlaybackSpeed((prev) => Math.max(prev / 2, 0.1));
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handleStepBackward('day');
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleStepForward('day');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleStepBackward, handleStepForward]);

  const isPaused = speedMultiplier === 0;

  // Handle planet selection
  const handlePlanetSelect = (ephemeris: Ephemeris | null) => {
    if (ephemeris) {
      const position = new THREE.Vector3(
        ephemeris.x_au * 10,
        ephemeris.y_au * 10,
        ephemeris.z_au * 10
      );
      const planetName = ephemeris.object_name.toLowerCase();
      const textureConfig = PLANET_TEXTURES[planetName];
      
      setSelectedObject({
        type: 'planet',
        name: ephemeris.object_name,
        position,
        ephemeris,
        radius: textureConfig?.size || 0.3,
      });
    } else {
      setSelectedObject(null);
    }
    
    if (onPlanetSelect) {
      onPlanetSelect(ephemeris);
    }
  };

  // Handle NEO selection
  const handleNEOSelect = (approach: CloseApproach) => {
    const orbitalElements = orbitalElementsData.find(
      (oe) => oe.object_name === approach.object_name
    );
    
    if (orbitalElements) {
      const pos = getPositionFromOrbit(orbitalElements, 0);
      const position = new THREE.Vector3(pos.x, pos.y, pos.z);
      
      setSelectedObject({
        type: 'neo',
        name: approach.object_name,
        position,
        approach,
        radius: 0.05,
      });
    }
    
    if (onNEOSelect) {
      onNEOSelect(approach);
    }
  };

  // Reset camera to default view
  const handleResetCamera = () => {
    setSelectedObject(null);
    if (onPlanetSelect) {
      onPlanetSelect(null);
    }
  };

  // Camera position tracker component
  const CameraPositionTracker = () => {
    const { camera } = useThree();
    
    useFrame(() => {
      setCameraPosition(camera.position.clone());
    });
    
    return null;
  };

  return (
    <div className="relative h-full w-full">
      <Canvas camera={{ position: [0, 50, 80], fov: 75 }}>
        {/* Enhanced Lighting */}
        <ambientLight intensity={0.8} />
        <hemisphereLight intensity={1.2} color="#ffffff" groundColor="#888888" />

        {/* Realistic Starfield (12,000 stars with true color temperatures) */}
        <RealisticStarfield />

        {/* Milky Way Background Glow */}
        <MilkyWayGlow />

        {/* Constellation Lines (TheSkyLive.com style) */}
        <ConstellationLines />

        {/* Ecliptic Grid (TheSkyLive.com style) */}
        {showGrid && <EclipticGrid />}

        {/* Coordinate Grid */}
        {showGrid && <CoordinateGrid />}

        {/* Enhanced Sun with Multi-layer Corona */}
        <Sun />

        {/* Planets with elliptical orbits and focus mode */}
        {PLANET_NAMES.map((planetName) => {
          const ephemeris = ephemerisData.find(
            (e) => e.object_name.toLowerCase() === planetName.toLowerCase()
          );
          const orbitalElements = orbitalElementsData.find(
            (oe) => oe.object_name.toLowerCase() === planetName.toLowerCase()
          );
          const isPlanetSelected = selectedObject?.type === 'planet' && 
                                  selectedObject.name.toLowerCase() === planetName.toLowerCase();
          const isDimmed = selectedObject !== null && !isPlanetSelected;
          
          return (
            <Planet
              key={planetName}
              name={planetName}
              ephemeris={ephemeris}
              orbitalElements={orbitalElements}
              speedMultiplier={speedMultiplier}
              onSelect={handlePlanetSelect}
              showOrbit={showOrbits}
              showLabel={showLabels}
              isSelected={isPlanetSelected}
              dimmed={isDimmed}
            />
          );
        })}

        {/* NEOs and Asteroids */}
        {showNEOs &&
          closeApproachesData.slice(0, 20).map((approach) => {
            const orbitalElements = orbitalElementsData.find(
              (oe) => oe.object_name === approach.object_name
            );
            return (
              <NEO
                key={approach.id}
                approach={approach}
                orbitalElements={orbitalElements}
                speedMultiplier={speedMultiplier}
                onSelect={handleNEOSelect}
              />
            );
          })}

        {/* Camera Controller (locks to selected object) */}
        <CameraController 
          selectedObject={selectedObject}
          onResetCamera={handleResetCamera}
        />

        {/* Camera Position Tracker */}
        <CameraPositionTracker />

        {/* Enhanced Camera controls with distance limits */}
        <OrbitControls
          enablePan
          enableZoom
          enableRotate
          minDistance={5}   // 0.5 AU minimum
          maxDistance={1000} // 100 AU maximum
          autoRotate={false}
          autoRotateSpeed={0.5}
          enableDamping
          dampingFactor={0.05}
        />
      </Canvas>

      {/* Reset Camera Button (fixed position outside Canvas) */}
      {selectedObject && (
        <button
          onClick={handleResetCamera}
          className="absolute bottom-20 right-6 rounded-lg bg-blue-600/95 backdrop-blur-md px-4 py-2 text-sm font-semibold text-white shadow-xl transition-all hover:bg-blue-500 hover:scale-105 active:scale-95 border border-blue-400"
        >
          🎯 Reset Camera
        </button>
      )}

      {/* Bottom Toolbar - TheSkyLive.com style */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full bg-black/70 backdrop-blur-md px-4 py-2 border border-white/20">
        <button 
          className="text-yellow-400 hover:text-yellow-300 transition-colors p-1.5"
          title="Home"
        >
          🏠
        </button>
        <div className="w-px h-5 bg-white/20" />
        <button 
          className="text-yellow-400 hover:text-yellow-300 transition-colors p-1.5"
          title="Play/Pause"
          onClick={() => {
            // This would connect to parent component's pause toggle
          }}
        >
          {isPaused ? '▶️' : '⏸️'}
        </button>
        <div className="w-px h-5 bg-white/20" />
        <button 
          className="text-yellow-400 hover:text-yellow-300 transition-colors p-1.5"
          title="Settings"
        >
          ⚙️
        </button>
        <div className="w-px h-5 bg-white/20" />
        <button 
          className="text-yellow-400 hover:text-yellow-300 transition-colors p-1.5"
          title="Zoom In"
        >
          🔍
        </button>
        <div className="w-px h-5 bg-white/20" />
        <button 
          className="text-yellow-400 hover:text-yellow-300 transition-colors p-1.5"
          title="Time Controls"
        >
          🕐
        </button>
        <div className="w-px h-5 bg-white/20" />
        <button 
          className="text-yellow-400 hover:text-yellow-300 transition-colors p-1.5"
          title="Screenshot"
        >
          📷
        </button>
        <div className="w-px h-5 bg-white/20" />
        <button 
          className="text-yellow-400 hover:text-yellow-300 transition-colors p-1.5"
          title="Help"
        >
          ❓
        </button>
      </div>

      {/* About Footer - TheSkyLive.com style */}
      <div className="absolute bottom-4 left-4 text-xs text-white/50">
        Phobetron Solar System Explorer
      </div>
    </div>
  );
}
