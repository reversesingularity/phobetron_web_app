/**
 * TheSkyLive.com Enhanced Implementation - Phase 10.1
 * 
 * Base: TheSkyLive proven approach with Keplerian mechanics
 * Enhancements: OrbitControls, planet selection, labels, time controls, interactivity
 * 
 * Features:
 * - Pure THREE.js with OrbitControls for camera manipulation
 * - Planet click selection with detail panels
 * - CSS2DRenderer for planet name labels
 * - Time simulation controls (speed, pause, date picker)
 * - Toggle controls (grid, orbits, labels)
 * - Planet hover effects with size increase
 * - Keyboard shortcuts (Space pause, arrows time step)
 * - Real-time planet position updates
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

// Scale factor: Convert AU to THREE.js units (10 units = 1 AU for better visibility)
const AU_SCALE = 10;

// TheSkyLive Keplerian orbital elements for planets
const PLANETS = {
  mercury: {
    name: "Mercury",
    a0: 0.38709927, e0: 0.20563593, i0: 7.00497902,
    ml0: 252.2503235, lp0: 77.45779628, o0: 48.33076593,
    ad: 0.00000037, ed: 0.00001906, id: -0.00594749,
    mld: 149472.67411175, lpd: 0.16047689, od: -0.12534081,
    type: 'planet' as const
  },
  venus: {
    name: "Venus",
    a0: 0.72333566, e0: 0.00677672, i0: 3.39467605,
    ml0: 181.9790995, lp0: 131.60246718, o0: 76.67984255,
    ad: 0.00000039, ed: -0.00004107, id: -0.00007889,
    mld: 58517.81538729, lpd: 0.00268329, od: -0.27769418,
    type: 'planet' as const
  },
  earth: {
    name: "Earth",
    a0: 1.00000261, e0: 0.01671123, i0: -0.00001531,
    ml0: 100.46457166, lp0: 102.93768193, o0: 0,
    ad: 0.00000562, ed: -0.00004392, id: -0.01294668,
    mld: 35999.37244981, lpd: 0.32327364, od: 0,
    type: 'planet' as const
  },
  mars: {
    name: "Mars",
    a0: 1.52371034, e0: 0.09339410, i0: 1.84969142,
    ml0: -4.55343205, lp0: -23.94362959, o0: 49.55953891,
    ad: 0.00001847, ed: 0.00007882, id: -0.00813131,
    mld: 19140.30268499, lpd: 0.44441088, od: -0.29257343,
    type: 'planet' as const
  },
  jupiter: {
    name: "Jupiter",
    a0: 5.20288700, e0: 0.04838624, i0: 1.30439695,
    ml0: 34.39644051, lp0: 14.72847983, o0: 100.47390909,
    ad: -0.00011607, ed: -0.00013253, id: -0.00183714,
    mld: 3034.74612775, lpd: 0.21252668, od: 0.20469106,
    type: 'planet' as const
  },
  saturn: {
    name: "Saturn",
    a0: 9.53667594, e0: 0.05386179, i0: 2.48599187,
    ml0: 49.95424423, lp0: 92.59887831, o0: 113.66242448,
    ad: -0.00125060, ed: -0.00050991, id: 0.00193609,
    mld: 1222.49362201, lpd: -0.41897216, od: -0.28867794,
    type: 'planet' as const
  },
  uranus: {
    name: "Uranus",
    a0: 19.18916464, e0: 0.04725744, i0: 0.77263783,
    ml0: 313.23810451, lp0: 170.95427630, o0: 74.01692503,
    ad: -0.00196176, ed: -0.00004397, id: -0.00242939,
    mld: 428.48202785, lpd: 0.40805281, od: 0.04240589,
    type: 'planet' as const
  },
  neptune: {
    name: "Neptune",
    a0: 30.06992276, e0: 0.00859048, i0: 1.77004347,
    ml0: -55.12002969, lp0: 44.96476227, o0: 131.78422574,
    ad: 0.00026291, ed: 0.00005105, id: 0.00035372,
    mld: 218.45945325, lpd: -0.32241464, od: -0.00508664,
    type: 'planet' as const
  }
};

// Notable asteroids in the main belt
const ASTEROIDS = {
  ceres: {
    name: "Ceres",
    a0: 2.7654, e0: 0.0785, i0: 10.5935,
    ml0: 113.4106, lp0: 73.1485, o0: 80.2679,
    ad: 0.0000, ed: 0.0000, id: 0.0000,
    mld: 0.2141, lpd: 0.0000, od: 0.0000,
    type: 'asteroid' as const,
    diameter: 939.4 // km
  },
  vesta: {
    name: "Vesta",
    a0: 2.3618, e0: 0.0887, i0: 7.1404,
    ml0: 151.1985, lp0: 103.8514, o0: 150.7287,
    ad: 0.0000, ed: 0.0000, id: 0.0000,
    mld: 0.2715, lpd: 0.0000, od: 0.0000,
    type: 'asteroid' as const,
    diameter: 525.4
  },
  pallas: {
    name: "Pallas",
    a0: 2.7725, e0: 0.2308, i0: 34.8362,
    ml0: 78.2280, lp0: 309.1073, o0: 173.0801,
    ad: 0.0000, ed: 0.0000, id: 0.0000,
    mld: 0.2135, lpd: 0.0000, od: 0.0000,
    type: 'asteroid' as const,
    diameter: 512.0
  },
  hygiea: {
    name: "Hygiea",
    a0: 3.1415, e0: 0.1125, i0: 3.8317,
    ml0: 283.2027, lp0: 312.3150, o0: 283.2027,
    ad: 0.0000, ed: 0.0000, id: 0.0000,
    mld: 0.1674, lpd: 0.0000, od: 0.0000,
    type: 'asteroid' as const,
    diameter: 407.1
  },
  eunomia: {
    name: "Eunomia",
    a0: 2.6436, e0: 0.1862, i0: 11.7397,
    ml0: 98.4822, lp0: 293.1407, o0: 98.4822,
    ad: 0.0000, ed: 0.0000, id: 0.0000,
    mld: 0.2260, lpd: 0.0000, od: 0.0000,
    type: 'asteroid' as const,
    diameter: 268.0
  },
  juno: {
    name: "Juno",
    a0: 2.6707, e0: 0.2569, i0: 12.9818,
    ml0: 33.0772, lp0: 169.8699, o0: 247.7824,
    ad: 0.0000, ed: 0.0000, id: 0.0000,
    mld: 0.2238, lpd: 0.0000, od: 0.0000,
    type: 'asteroid' as const,
    diameter: 233.0
  }
};

// Notable comets and interstellar objects
const COMETS = {
  halley: {
    name: "Halley's Comet",
    a0: 17.8341, e0: 0.9671, i0: 162.2627,
    ml0: 38.3843, lp0: 111.3325, o0: 58.4201,
    ad: 0.0000, ed: 0.0000, id: 0.0000,
    mld: 0.0291, lpd: 0.0000, od: 0.0000,
    type: 'comet' as const,
    period: 75.3 // years
  },
  hale_bopp: {
    name: "Hale-Bopp",
    a0: 186.36, e0: 0.9951, i0: 89.43,
    ml0: 130.59, lp0: 282.47, o0: 130.59,
    ad: 0.0000, ed: 0.0000, id: 0.0000,
    mld: 0.0027, lpd: 0.0000, od: 0.0000,
    type: 'comet' as const,
    period: 2380 // years
  },
  oumuamua: {
    name: "1I/'Oumuamua",
    a0: 1.2016, e0: 1.1995, i0: 122.69,
    ml0: 24.62, lp0: 241.64, o0: 24.62,
    ad: 0.0000, ed: 0.0000, id: 0.0000,
    mld: 0.2559, lpd: 0.0000, od: 0.0000,
    type: 'interstellar' as const,
    hyperbolic: true
  },
  borisov: {
    name: "2I/Borisov",
    a0: 3.156, e0: 3.357, i0: 44.05,
    ml0: 209.13, lp0: 308.01, o0: 209.13,
    ad: 0.0000, ed: 0.0000, id: 0.0000,
    mld: 0.1558, lpd: 0.0000, od: 0.0000,
    type: 'interstellar' as const,
    hyperbolic: true
  }
};

// Near-Earth Objects (sample)
const NEOS = {
  apophis: {
    name: "Apophis",
    a0: 0.9224, e0: 0.1911, i0: 3.3314,
    ml0: 286.029, lp0: 126.422, o0: 204.446,
    ad: 0.0000, ed: 0.0000, id: 0.0000,
    mld: 0.8870, lpd: 0.0000, od: 0.0000,
    type: 'neo' as const,
    pha: true, // Potentially Hazardous Asteroid
    diameter: 0.37
  },
  ryugu: {
    name: "Ryugu",
    a0: 1.190, e0: 0.190, i0: 5.884,
    ml0: 211.468, lp0: 211.468, o0: 211.468,
    ad: 0.0000, ed: 0.0000, id: 0.0000,
    mld: 0.5529, lpd: 0.0000, od: 0.0000,
    type: 'neo' as const,
    pha: false,
    diameter: 0.92
  }
};

// TheSkyLive color scheme
const PLANET_COLORS = {
  mercury: 0xF0C050,
  venus: 0xF5E3C3,
  earth: 0x339AFF,
  mars: 0xFF0000,
  jupiter: 0xFF9900,
  saturn: 0xFFCC00,
  uranus: 0x2EC0AA,
  neptune: 0x416FE1,
  sun: 0xFFFFFF
};

const ASTEROID_COLORS = {
  ceres: 0x8B7355,    // Brownish
  vesta: 0xA0522D,    // Sienna
  pallas: 0x696969,   // Dim gray
  hygiea: 0x8B4513,   // Saddle brown
  eunomia: 0x708090,  // Slate gray
  juno: 0x2F4F4F,     // Dark slate gray
  default: 0x696969   // Default asteroid gray
};

const COMET_COLORS = {
  halley: 0xE6E6FA,   // Lavender (icy blue-white)
  hale_bopp: 0xF0F8FF, // Alice blue
  oumuamua: 0xFFD700, // Gold (metallic)
  borisov: 0xFFE4B5,  // Moccasin
  default: 0xE6E6FA   // Default comet color
};

const NEO_COLORS = {
  apophis: 0xFF4500,  // Orange red (hazardous)
  ryugu: 0x8B4513,    // Saddle brown
  default: 0xFF6347   // Tomato (warning red)
};

const ORBIT_COLORS = {
  ...PLANET_COLORS,
  ...ASTEROID_COLORS,
  ...COMET_COLORS,
  ...NEO_COLORS
};

// Props interface for enhanced controls
interface TheSkyLiveCanvasProps {
  showGrid?: boolean;
  showOrbits?: boolean;
  showLabels?: boolean;
  speedMultiplier?: number;
  isPaused?: boolean;
  onPlanetSelect?: (planetName: string) => void;
  onTimeUpdate?: (time: number) => void;
  onCameraControlsReady?: (controls: {
    setTopView: () => void;
    setSideView: () => void;
    setEarthFocus: () => void;
    resetView: () => void;
    jumpTime: (milliseconds: number) => void;
    resetToToday: () => void;
  }) => void;
}

export default function TheSkyLiveCanvas({
  showGrid = true,
  showOrbits = true,
  showLabels = true,
  speedMultiplier = 1,
  isPaused = false,
  onPlanetSelect,
  onTimeUpdate,
  onCameraControlsReady
}: TheSkyLiveCanvasProps = {}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const labelRendererRef = useRef<CSS2DRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const planetsRef = useRef<Map<string, THREE.Mesh>>(new Map()); // Changed to Mesh for 3D spheres
  const orbitsRef = useRef<Map<string, THREE.LineSegments>>(new Map());
  const labelsRef = useRef<Map<string, CSS2DObject>>(new Map());
  const gridRef = useRef<THREE.GridHelper | null>(null);
  const timeRef = useRef<number>(0); // Will be initialized in useEffect
  const [hoveredPlanet, setHoveredPlanet] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize time ref
    timeRef.current = Date.now();

    const container = containerRef.current;
    const WIDTH = container.clientWidth;
    const HEIGHT = container.clientHeight;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(50, WIDTH / HEIGHT, 0.01, 20000);
    camera.position.set(0, 15, 30); // Position camera higher and further back
    camera.lookAt(0, 0, 0); // Look at the Sun (center of scene)
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(WIDTH, HEIGHT);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // CSS2D Label Renderer setup
    const labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(WIDTH, HEIGHT);
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = '0';
    labelRenderer.domElement.style.pointerEvents = 'none';
    container.appendChild(labelRenderer.domElement);
    labelRendererRef.current = labelRenderer;

    // OrbitControls setup
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 5;
    controls.maxDistance = 500;
    controls.enablePan = true;
    controlsRef.current = controls;

    // Add sky background
    addSky(scene);

    // Add Sun with enhanced glow
    addSun(scene);

    // Add planets with orbits and labels (use synchronized time)
    addPlanets(scene, showLabels, timeRef.current, planetsRef, orbitsRef, labelsRef);

    // Add grid (scaled to match orbital system: Neptune is ~30 AU * 10 = 300 units)
    const gridHelper = new THREE.GridHelper(400, 40, 0x0000FF, 0x333333);
    gridHelper.visible = showGrid;
    scene.add(gridHelper);
    gridRef.current = gridHelper;

    // Raycaster for planet selection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(Array.from(planetsRef.current.values()));

      if (intersects.length > 0) {
        const planetMesh = intersects[0].object;
        const planetName = planetMesh.name;
        if (onPlanetSelect) {
          onPlanetSelect(planetName);
        }
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(Array.from(planetsRef.current.values()));

      if (intersects.length > 0) {
        const planetName = intersects[0].object.name;
        setHoveredPlanet(planetName);
        container.style.cursor = 'pointer';
      } else {
        setHoveredPlanet(null);
        container.style.cursor = 'default';
      }
    };

    renderer.domElement.addEventListener('click', handleClick);
    renderer.domElement.addEventListener('mousemove', handleMouseMove);

    // Animation loop with time simulation
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      
      // Update camera controls
      controls.update();

      // Update time (only if not paused)
      // Much slower: 1 hour per frame at 1x speed (instead of 1 day)
      if (!isPaused) {
        timeRef.current += 3600000 * speedMultiplier; // 1 hour = 3600000ms
        
        // Notify parent of time updates (throttled to avoid excessive calls)
        if (onTimeUpdate && Math.random() < 0.1) { // Update ~10% of frames
          onTimeUpdate(timeRef.current);
        }
      }

      // Update planet positions
      updatePlanetPositions(timeRef.current, planetsRef);

      // Update planet hover effects (scale spheres on hover)
      planetsRef.current.forEach((planet, name) => {
        if (hoveredPlanet === name) {
          planet.scale.setScalar(1.3); // Enlarge on hover
        } else {
          planet.scale.setScalar(1.0); // Normal size
        }
      });
      
      // Render both scenes
      renderer.render(scene, camera);
      labelRenderer.render(scene, camera);
    };
    animate();

    // Camera control functions
    const cameraControls = {
      setTopView: () => {
        camera.position.set(0, 100, 0);
        camera.lookAt(0, 0, 0);
        controls.target.set(0, 0, 0);
        controls.update();
      },
      setSideView: () => {
        camera.position.set(100, 0, 0);
        camera.lookAt(0, 0, 0);
        controls.target.set(0, 0, 0);
        controls.update();
      },
      setEarthFocus: () => {
        const earthPlanet = planetsRef.current.get('earth');
        if (earthPlanet) {
          const earthPos = earthPlanet.position;
          camera.position.set(earthPos.x + 5, earthPos.y + 3, earthPos.z + 5);
          camera.lookAt(earthPos.x, earthPos.y, earthPos.z);
          controls.target.set(earthPos.x, earthPos.y, earthPos.z);
          controls.update();
        }
      },
      resetView: () => {
        camera.position.set(0, 15, 30);
        camera.lookAt(0, 0, 0);
        controls.target.set(0, 0, 0);
        controls.update();
      },
      jumpTime: (milliseconds: number) => {
        timeRef.current += milliseconds;
        updatePlanetPositions(timeRef.current, planetsRef);
        if (onTimeUpdate) {
          onTimeUpdate(timeRef.current);
        }
      },
      resetToToday: () => {
        timeRef.current = Date.now();
        updatePlanetPositions(timeRef.current, planetsRef);
        if (onTimeUpdate) {
          onTimeUpdate(timeRef.current);
        }
      }
    };

    // Notify parent that camera controls are ready
    if (onCameraControlsReady) {
      onCameraControlsReady(cameraControls);
    }

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      labelRenderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('click', handleClick);
      renderer.domElement.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationId);
      controls.dispose();
      renderer.dispose();
      container.removeChild(renderer.domElement);
      container.removeChild(labelRenderer.domElement);
    };
  }, [showGrid, showOrbits, showLabels, speedMultiplier, isPaused, hoveredPlanet, onPlanetSelect, onTimeUpdate, onCameraControlsReady]);

  // Update visibility when props change
  useEffect(() => {
    if (gridRef.current) {
      gridRef.current.visible = showGrid;
    }
    orbitsRef.current.forEach((orbit) => {
      orbit.visible = showOrbits;
    });
    labelsRef.current.forEach((label) => {
      label.visible = showLabels;
    });
  }, [showGrid, showOrbits, showLabels]);

  return (
    <div ref={containerRef} className="w-full h-full bg-black" />
  );
}

// ============================================================================
// TheSkyLive Helper Functions
// ============================================================================

function addSky(scene: THREE.Scene) {
  // Create procedural starfield as reliable alternative to external textures
  // This approach generates thousands of star particles for a stunning Milky Way effect
  
  const starsGeometry = new THREE.BufferGeometry();
  const starCount = 15000; // Increased for dense starfield
  
  const positions = new Float32Array(starCount * 3);
  const colors = new Float32Array(starCount * 3);
  const sizes = new Float32Array(starCount);
  
  // Generate stars in spherical distribution
  for (let i = 0; i < starCount; i++) {
    const i3 = i * 3;
    
    // Random position in sphere (distance 400-1000 units)
    const radius = 400 + Math.random() * 600;
    const theta = Math.random() * Math.PI * 2; // Longitude
    const phi = Math.acos(Math.random() * 2 - 1); // Latitude (uniform distribution)
    
    positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i3 + 2] = radius * Math.cos(phi);
    
    // Star colors: mix of white, blue-white, yellow-white for realism
    const colorChoice = Math.random();
    if (colorChoice < 0.7) {
      // White stars (70%)
      colors[i3] = 1.0;
      colors[i3 + 1] = 1.0;
      colors[i3 + 2] = 1.0;
    } else if (colorChoice < 0.85) {
      // Blue-white stars (15%)
      colors[i3] = 0.8;
      colors[i3 + 1] = 0.9;
      colors[i3 + 2] = 1.0;
    } else {
      // Yellow-white stars (15%)
      colors[i3] = 1.0;
      colors[i3 + 1] = 0.95;
      colors[i3 + 2] = 0.8;
    }
    
    // Vary star sizes for depth perception (0.5 to 3.0)
    sizes[i] = 0.5 + Math.random() * 2.5;
  }
  
  starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  starsGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  starsGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  
  // Star material with vertex colors
  const starsMaterial = new THREE.PointsMaterial({
    size: 2.0,
    sizeAttenuation: true,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending, // Makes stars glow
    depthWrite: false
  });
  
  const starField = new THREE.Points(starsGeometry, starsMaterial);
  scene.add(starField);
  
  // Add Milky Way band effect (denser concentration of stars)
  const milkyWayGeometry = new THREE.BufferGeometry();
  const milkyWayCount = 8000;
  
  const mwPositions = new Float32Array(milkyWayCount * 3);
  const mwColors = new Float32Array(milkyWayCount * 3);
  const mwSizes = new Float32Array(milkyWayCount);
  
  for (let i = 0; i < milkyWayCount; i++) {
    const i3 = i * 3;
    
    // Concentrate stars in a band (flattened distribution for Milky Way disk)
    const radius = 450 + Math.random() * 500;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.PI / 2 + (Math.random() - 0.5) * 0.3; // Narrow band around equator
    
    mwPositions[i3] = radius * Math.sin(phi) * Math.cos(theta);
    mwPositions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    mwPositions[i3 + 2] = radius * Math.cos(phi);
    
    // Milky Way colors: more yellowish/white
    mwColors[i3] = 0.9 + Math.random() * 0.1;
    mwColors[i3 + 1] = 0.85 + Math.random() * 0.15;
    mwColors[i3 + 2] = 0.7 + Math.random() * 0.3;
    
    mwSizes[i] = 0.3 + Math.random() * 1.5;
  }
  
  milkyWayGeometry.setAttribute('position', new THREE.BufferAttribute(mwPositions, 3));
  milkyWayGeometry.setAttribute('color', new THREE.BufferAttribute(mwColors, 3));
  milkyWayGeometry.setAttribute('size', new THREE.BufferAttribute(mwSizes, 1));
  
  const milkyWayMaterial = new THREE.PointsMaterial({
    size: 1.5,
    sizeAttenuation: true,
    vertexColors: true,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  
  const milkyWayBand = new THREE.Points(milkyWayGeometry, milkyWayMaterial);
  milkyWayBand.rotation.z = Math.PI / 4; // Tilt the Milky Way band
  scene.add(milkyWayBand);
  
  console.log('✅ Procedural starfield generated: 15,000 background stars + 8,000 Milky Way band stars');
}

function addSun(scene: THREE.Scene) {
  // Bright point light at the Sun's position
  const light = new THREE.PointLight(0xFFFFFF, 3.0, 2000);
  light.position.set(0, 0, 0);
  scene.add(light);

  // Main sun sphere - solid color, no texture
  const sunGeometry = new THREE.SphereGeometry(2.0, 64, 64);
  const sunMaterial = new THREE.MeshBasicMaterial({
    color: 0xFDB813, // Bright yellow-orange sun color
    side: THREE.FrontSide
  });
  
  const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
  sunMesh.name = 'sun';
  scene.add(sunMesh);

  // Subtle inner glow
  const glowGeometry = new THREE.SphereGeometry(2.4, 32, 32);
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: 0xFFFF00,
    transparent: true,
    opacity: 0.15,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    depthWrite: false
  });
  const glow = new THREE.Mesh(glowGeometry, glowMaterial);
  sunMesh.add(glow);
  
  console.log('✅ Procedural Sun created (no textures)');
}

function addPlanets(
  scene: THREE.Scene, 
  showLabels: boolean,
  currentTime: number, // Added parameter for synchronized time
  planetsRef: React.MutableRefObject<Map<string, THREE.Mesh>>, // Changed to Mesh
  orbitsRef: React.MutableRefObject<Map<string, THREE.LineSegments>>,
  labelsRef: React.MutableRefObject<Map<string, CSS2DObject>>
) {
  // Removed: const currentTime = Date.now(); - now using parameter
  
  // Planet size scaling (relative sizes for visual effect)
  const planetSizes: { [key: string]: number } = {
    mercury: 0.15,
    venus: 0.35,
    earth: 0.38,
    mars: 0.20,
    jupiter: 1.2,
    saturn: 1.0,
    uranus: 0.6,
    neptune: 0.58
  };
  
  // Asteroid sizes (much smaller, scaled by diameter)
  const asteroidSizes: { [key: string]: number } = {
    ceres: 0.08,    // Largest asteroid
    vesta: 0.06,
    pallas: 0.05,
    hygiea: 0.04,
    eunomia: 0.03,
    juno: 0.03,
    default: 0.02   // Small asteroids
  };
  
  // Comet sizes (variable, often elongated)
  const cometSizes: { [key: string]: number } = {
    halley: 0.04,
    hale_bopp: 0.06,
    oumuamua: 0.02,
    borisov: 0.03,
    default: 0.03
  };
  
  // NEO sizes (small but potentially hazardous)
  const neoSizes: { [key: string]: number } = {
    apophis: 0.025,
    ryugu: 0.030,
    default: 0.020
  };
  
  // Combine all celestial objects
  const allObjects = { ...PLANETS, ...ASTEROIDS, ...COMETS, ...NEOS };
  
  Object.entries(allObjects).forEach(([key, objectData]) => {
    // Update orbital elements for current time
    const elements = updateMeanElements(currentTime, objectData);
    
    // Create orbit
    const orbitGeometry = getEllipticalOrbitGeometry(elements.a, elements.e);
    const orbitMaterial = new THREE.LineBasicMaterial({
      color: ORBIT_COLORS[key as keyof typeof ORBIT_COLORS] || 0x666666,
      opacity: 0.6,
      transparent: true,
      linewidth: objectData.type === 'planet' ? 2 : 1
    });
    const orbit = new THREE.LineSegments(orbitGeometry, orbitMaterial);
    
    // Apply orbital rotations (TheSkyLive style)
    orbit.rotateY(deg2rad(elements.o));
    orbit.rotateOnAxis(new THREE.Vector3(1, 0, 0), deg2rad(elements.i));
    orbit.rotateOnAxis(new THREE.Vector3(0, 1, 0), deg2rad(elements.lp - elements.o));
    
    scene.add(orbit);
    orbitsRef.current.set(key, orbit);
    
    // Determine size based on object type
    let objectSize = 0.1; // default
    let objectColor = 0xFFFFFF; // default white
    
    switch (objectData.type) {
      case 'planet':
        objectSize = planetSizes[key] || 0.3;
        objectColor = PLANET_COLORS[key as keyof typeof PLANET_COLORS] || 0xFFFFFF;
        break;
      case 'asteroid':
        objectSize = asteroidSizes[key] || asteroidSizes.default;
        objectColor = ASTEROID_COLORS[key as keyof typeof ASTEROID_COLORS] || ASTEROID_COLORS.default;
        break;
      case 'comet':
        objectSize = cometSizes[key] || cometSizes.default;
        objectColor = COMET_COLORS[key as keyof typeof COMET_COLORS] || COMET_COLORS.default;
        break;
      case 'neo':
      case 'interstellar':
        objectSize = neoSizes[key] || neoSizes.default;
        objectColor = NEO_COLORS[key as keyof typeof NEO_COLORS] || NEO_COLORS.default;
        break;
    }
    
    // Create object as proper 3D mesh based on type
    let objectGeometry: THREE.BufferGeometry;
    let objectMaterial: THREE.Material;
    
    if (objectData.type === 'comet') {
      // Comets are elongated ellipsoids
      objectGeometry = new THREE.SphereGeometry(objectSize * 0.7, 16, 16);
      objectGeometry.scale(1, 2, 1); // Make it elongated
      objectMaterial = new THREE.MeshStandardMaterial({
        color: objectColor,
        emissive: objectColor,
        emissiveIntensity: 0.3,
        metalness: 0.1,
        roughness: 0.9
      });
    } else {
      // Planets, asteroids, NEOs are spheres
      objectGeometry = new THREE.SphereGeometry(objectSize, objectData.type === 'planet' ? 32 : 16, objectData.type === 'planet' ? 32 : 16);
      objectMaterial = new THREE.MeshStandardMaterial({
        color: objectColor,
        emissive: objectColor,
        emissiveIntensity: objectData.type === 'planet' ? 0.5 : 0.2,
        metalness: objectData.type === 'asteroid' ? 0.3 : 0.1,
        roughness: objectData.type === 'asteroid' ? 0.7 : 0.8
      });
    }
    
    const objectMesh = new THREE.Mesh(objectGeometry, objectMaterial);
    objectMesh.name = key;
    
    // Calculate initial position
    const position = getPlanetPosition(currentTime, elements);
    objectMesh.position.set(position.x, position.y, position.z);
    
    scene.add(objectMesh);
    planetsRef.current.set(key, objectMesh);

    // Add glow effect for planets and bright objects
    if (objectData.type === 'planet' || objectData.type === 'comet') {
      const glowGeometry = new THREE.SphereGeometry(objectSize * 1.3, 16, 16);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: objectColor,
        transparent: true,
        opacity: 0.15,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide
      });
      const glow = new THREE.Mesh(glowGeometry, glowMaterial);
      objectMesh.add(glow);
    }

    // Create CSS2D label (only for planets and notable objects)
    const shouldShowLabel = objectData.type === 'planet' || 
                           ['ceres', 'vesta', 'halley', 'apophis', 'oumuamua'].includes(key);
    
    if (shouldShowLabel) {
      const labelDiv = document.createElement('div');
      labelDiv.className = 'celestial-label';
      labelDiv.textContent = objectData.name;
      
      // Color code labels by type
      let labelColor = '#ffffff';
      switch (objectData.type) {
        case 'planet': labelColor = '#4a90e2'; break;
        case 'asteroid': labelColor = '#8b7355'; break;
        case 'comet': labelColor = '#e6e6fa'; break;
        case 'neo': labelColor = '#ff4500'; break;
        case 'interstellar': labelColor = '#ffd700'; break;
      }
      
      labelDiv.style.color = labelColor;
      labelDiv.style.fontFamily = 'Arial, sans-serif';
      labelDiv.style.fontSize = objectData.type === 'planet' ? '12px' : '10px';
      labelDiv.style.fontWeight = 'bold';
      labelDiv.style.padding = '2px 6px';
      labelDiv.style.background = 'rgba(0, 0, 0, 0.7)';
      labelDiv.style.borderRadius = '3px';
      labelDiv.style.pointerEvents = 'none';
      labelDiv.style.userSelect = 'none';

      const label = new CSS2DObject(labelDiv);
      label.position.set(0, objectSize + 0.5, 0);
      label.visible = showLabels;
      objectMesh.add(label);
      labelsRef.current.set(key, label);
    }
  });
}

function getEllipticalOrbitGeometry(a: number, e: number): THREE.BufferGeometry {
  const numSegments = e > 0.8 ? 4000 : 2000;
  const vertices: number[] = [];
  const b = a * Math.sqrt(1 - e * e);
  
  // Apply AU scale for visibility
  const scaledA = a * AU_SCALE;
  const scaledB = b * AU_SCALE;
  
  let prevX = 0;
  let prevZ = 0;
  
  for (let i = 0; i <= numSegments; i++) {
    const E = (i / numSegments) * 2 * Math.PI;
    const x = scaledA * (Math.cos(E) - e);
    const z = scaledB * Math.sin(E);
    
    if (i > 0) {
      vertices.push(prevX, 0, prevZ);
      vertices.push(x, 0, z);
    }
    
    prevX = x;
    prevZ = z;
  }
  
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  return geometry;
}

type PlanetData = {
  name: string;
  a0: number;
  e0: number;
  i0: number;
  ml0: number;
  lp0: number;
  o0: number;
  ad: number;
  ed: number;
  id: number;
  mld: number;
  lpd: number;
  od: number;
};

type OrbitalElements = {
  name: string;
  a0: number;
  e0: number;
  i0: number;
  ml0: number;
  lp0: number;
  o0: number;
  ad: number;
  ed: number;
  id: number;
  mld: number;
  lpd: number;
  od: number;
  a: number;
  e: number;
  i: number;
  ml: number;
  lp: number;
  o: number;
};

function updateMeanElements(utcMillis: number, elements: PlanetData): OrbitalElements {
  const tEph = getTEph(utcMillis);
  const t = (tEph - 2451545.0) / 36525.0;
  
  return {
    ...elements,
    a: elements.a0 + elements.ad * t,
    e: elements.e0 + elements.ed * t,
    i: deg2rad(elements.i0 + elements.id * t),
    ml: deg2rad(elements.ml0 + elements.mld * t),
    lp: deg2rad(elements.lp0 + elements.lpd * t),
    o: deg2rad(elements.o0 + elements.od * t)
  };
}

function getPlanetPosition(utcMillis: number, elements: OrbitalElements) {
  const omega = elements.lp - elements.o;
  const M = toNormalRange(elements.ml - elements.lp);
  const E = solveKepler(elements.e, M);
  
  const x = elements.a * (Math.cos(E) - elements.e);
  const y = elements.a * Math.sqrt(1 - elements.e * elements.e) * Math.sin(E);
  
  const xEcl = (Math.cos(omega) * Math.cos(elements.o) - Math.sin(omega) * Math.sin(elements.o) * Math.cos(elements.i)) * x +
               (-Math.sin(omega) * Math.cos(elements.o) - Math.cos(omega) * Math.sin(elements.o) * Math.cos(elements.i)) * y;
  
  const yEcl = (Math.cos(omega) * Math.sin(elements.o) + Math.sin(omega) * Math.cos(elements.o) * Math.cos(elements.i)) * x +
               (-Math.sin(omega) * Math.sin(elements.o) + Math.cos(omega) * Math.cos(elements.o) * Math.cos(elements.i)) * y;
  
  const zEcl = Math.sin(omega) * Math.sin(elements.i) * x + Math.cos(omega) * Math.sin(elements.i) * y;
  
  // Apply AU scale for visibility - correct coordinate mapping for THREE.js
  return { 
    x: xEcl * AU_SCALE, 
    y: zEcl * AU_SCALE,  // Z becomes Y (up/down)
    z: -yEcl * AU_SCALE  // Y becomes -Z (forward/back)
  };
}

// Update planet positions in real-time
function updatePlanetPositions(
  currentTime: number,
  planetsRef: React.MutableRefObject<Map<string, THREE.Mesh>> // Changed to Mesh
) {
  // Combine all celestial objects
  const allObjects = { ...PLANETS, ...ASTEROIDS, ...COMETS, ...NEOS };
  
  Object.entries(allObjects).forEach(([key, objectData]) => {
    const object = planetsRef.current.get(key);
    if (!object) return;

    // Recalculate orbital elements for current time
    const elements = updateMeanElements(currentTime, objectData);
    
    // Get new position
    const position = getPlanetPosition(currentTime, elements);
    
    // Update object position
    object.position.set(position.x, position.y, position.z);
    
    // Update label position if it exists (for labeled objects)
    const shouldHaveLabel = objectData.type === 'planet' || 
                           ['ceres', 'vesta', 'halley', 'apophis', 'oumuamua'].includes(key);
    if (shouldHaveLabel) {
      // Get size for label offset
      let objectSize = 0.1;
      switch (objectData.type) {
        case 'planet':
          const planetSizes = { mercury: 0.15, venus: 0.35, earth: 0.38, mars: 0.20, jupiter: 1.2, saturn: 1.0, uranus: 0.6, neptune: 0.58 };
          objectSize = planetSizes[key as keyof typeof planetSizes] || 0.3;
          break;
        case 'asteroid':
          const asteroidSizes = { ceres: 0.08, vesta: 0.06, pallas: 0.05, hygiea: 0.04, eunomia: 0.03, juno: 0.03, default: 0.02 };
          objectSize = asteroidSizes[key as keyof typeof asteroidSizes] || asteroidSizes.default;
          break;
        case 'comet':
          const cometSizes = { halley: 0.04, hale_bopp: 0.06, oumuamua: 0.02, borisov: 0.03, default: 0.03 };
          objectSize = cometSizes[key as keyof typeof cometSizes] || cometSizes.default;
          break;
        case 'neo':
        case 'interstellar':
          const neoSizes = { apophis: 0.025, ryugu: 0.030, default: 0.020 };
          objectSize = neoSizes[key as keyof typeof neoSizes] || neoSizes.default;
          break;
      }
      
      // Find and update label position
      object.children.forEach((child) => {
        if (child instanceof CSS2DObject) {
          child.position.set(0, objectSize + 0.5, 0);
        }
      });
    }
  });
}

function solveKepler(e: number, M: number): number {
  let E = e < 0.8 ? M : Math.PI;
  const threshold = 1e-8;
  
  for (let i = 0; i < 100; i++) {
    const f = E - e * Math.sin(E) - M;
    const df = 1 - e * Math.cos(E);
    
    if (Math.abs(df) < 1e-10) break;
    
    const dE = -f / df;
    E += dE;
    
    if (Math.abs(dE) <= threshold) break;
  }
  
  return E;
}

function getTEph(utcMillis: number): number {
  return utcMillis / 86400000.0 + 2440587.5;
}

function deg2rad(deg: number): number {
  return deg * Math.PI / 180;
}

function toNormalRange(angle: number): number {
  let result = angle - 2 * Math.floor(angle / (2 * Math.PI)) * Math.PI;
  if (result > Math.PI) result -= 2 * Math.PI;
  return result;
}
