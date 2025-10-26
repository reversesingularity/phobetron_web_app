/**
 * TheSkyLive.com Original Implementation - BACKUP
 * 
 * Date: October 26, 2025
 * Purpose: Baseline backup before adding interactive enhancements
 * 
 * This is the proven TheSkyLive approach that works:
 * - Pure THREE.js (imperative)
 * - Keplerian orbital elements with time-dependent updates
 * - Battle-tested color schemes
 * - Newton-Raphson Kepler solver
 * - Simple sprite-based planets (18px PointsMaterial)
 * - Scene rotation animation
 * - 10:1 AU scaling (1 AU = 10 units)
 * - Grid system (400×400)
 * - Minimalist approach for performance
 * 
 * DO NOT MODIFY THIS FILE - Use as reference/rollback point
 */

'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

// Scale factor: Convert AU to THREE.js units (10 units = 1 AU for better visibility)
const AU_SCALE = 10;

// TheSkyLive Keplerian orbital elements for planets
const PLANETS = {
  mercury: {
    name: "Mercury",
    a0: 0.38709927, e0: 0.20563593, i0: 7.00497902,
    ml0: 252.2503235, lp0: 77.45779628, o0: 48.33076593,
    ad: 0.00000037, ed: 0.00001906, id: -0.00594749,
    mld: 149472.67411175, lpd: 0.16047689, od: -0.12534081
  },
  venus: {
    name: "Venus",
    a0: 0.72333566, e0: 0.00677672, i0: 3.39467605,
    ml0: 181.9790995, lp0: 131.60246718, o0: 76.67984255,
    ad: 0.00000039, ed: -0.00004107, id: -0.00007889,
    mld: 58517.81538729, lpd: 0.00268329, od: -0.27769418
  },
  earth: {
    name: "Earth",
    a0: 1.00000261, e0: 0.01671123, i0: -0.00001531,
    ml0: 100.46457166, lp0: 102.93768193, o0: 0,
    ad: 0.00000562, ed: -0.00004392, id: -0.01294668,
    mld: 35999.37244981, lpd: 0.32327364, od: 0
  },
  mars: {
    name: "Mars",
    a0: 1.52371034, e0: 0.09339410, i0: 1.84969142,
    ml0: -4.55343205, lp0: -23.94362959, o0: 49.55953891,
    ad: 0.00001847, ed: 0.00007882, id: -0.00813131,
    mld: 19140.30268499, lpd: 0.44441088, od: -0.29257343
  },
  jupiter: {
    name: "Jupiter",
    a0: 5.20288700, e0: 0.04838624, i0: 1.30439695,
    ml0: 34.39644051, lp0: 14.72847983, o0: 100.47390909,
    ad: -0.00011607, ed: -0.00013253, id: -0.00183714,
    mld: 3034.74612775, lpd: 0.21252668, od: 0.20469106
  },
  saturn: {
    name: "Saturn",
    a0: 9.53667594, e0: 0.05386179, i0: 2.48599187,
    ml0: 49.95424423, lp0: 92.59887831, o0: 113.66242448,
    ad: -0.00125060, ed: -0.00050991, id: 0.00193609,
    mld: 1222.49362201, lpd: -0.41897216, od: -0.28867794
  },
  uranus: {
    name: "Uranus",
    a0: 19.18916464, e0: 0.04725744, i0: 0.77263783,
    ml0: 313.23810451, lp0: 170.95427630, o0: 74.01692503,
    ad: -0.00196176, ed: -0.00004397, id: -0.00242939,
    mld: 428.48202785, lpd: 0.40805281, od: 0.04240589
  },
  neptune: {
    name: "Neptune",
    a0: 30.06992276, e0: 0.00859048, i0: 1.77004347,
    ml0: -55.12002969, lp0: 44.96476227, o0: 131.78422574,
    ad: 0.00026291, ed: 0.00005105, id: 0.00035372,
    mld: 218.45945325, lpd: -0.32241464, od: -0.00508664
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

const ORBIT_COLORS = {
  mercury: 0x967E76,
  venus: 0x9CD4C2,
  earth: 0x5B8CDF,
  mars: 0xD33826,
  jupiter: 0xB2B767,
  saturn: 0xDE7C72,
  uranus: 0xB7C0DF,
  neptune: 0x9A8BB3
};

export default function TheSkyLiveCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

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

    // Add sky background
    addSky(scene);

    // Add Sun with lens flare
    addSun(scene);

    // Add planets with orbits
    addPlanets(scene);

    // Add grid (scaled to match orbital system: Neptune is ~30 AU * 10 = 300 units)
    const gridHelper = new THREE.GridHelper(400, 40, 0x0000FF, 0x333333);
    scene.add(gridHelper);

    // Animation loop
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      
      // Slow rotation of entire scene (TheSkyLive style)
      scene.rotation.y += 0.0001;
      
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full bg-black" />
  );
}

// ============================================================================
// TheSkyLive Helper Functions
// ============================================================================

function addSky(scene: THREE.Scene) {
  const geometry = new THREE.SphereGeometry(1000, 60, 40);
  geometry.scale(-1, 1, 1); // Invert for skybox
  
  const textureLoader = new THREE.TextureLoader();
  const material = new THREE.MeshBasicMaterial({
    map: textureLoader.load('https://www.solarsystemscope.com/textures/download/2k_stars_milky_way.jpg')
  });
  
  const sky = new THREE.Mesh(geometry, material);
  
  // TheSkyLive rotations
  sky.rotateY(3 * Math.PI / 2);
  sky.rotateX(-1.099);
  sky.rotateY(Math.PI / 2);
  
  scene.add(sky);
}

function addSun(scene: THREE.Scene) {
  // Point light
  const light = new THREE.PointLight(0xFFFFFF, 1.5, 2000);
  light.position.set(0, 0, 0);
  scene.add(light);

  // Sun body (sprite style - TheSkyLive approach)
  const geometry = new THREE.BufferGeometry();
  const vertices = new Float32Array([0, 0, 0]);
  geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
  
  const material = new THREE.PointsMaterial({
    size: 15,
    sizeAttenuation: false,
    color: PLANET_COLORS.sun,
    transparent: true,
    alphaTest: 0.9
  });
  
  const sunBody = new THREE.Points(geometry, material);
  sunBody.name = 'sun';
  scene.add(sunBody);

  // Add simple glow effect
  const glowGeometry = new THREE.SphereGeometry(2, 32, 32);
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: 0xFFD700,
    transparent: true,
    opacity: 0.3,
    blending: THREE.AdditiveBlending
  });
  const glow = new THREE.Mesh(glowGeometry, glowMaterial);
  scene.add(glow);
}

function addPlanets(scene: THREE.Scene) {
  const currentTime = Date.now();
  
  Object.entries(PLANETS).forEach(([key, planet]) => {
    // Update orbital elements for current time
    const elements = updateMeanElements(currentTime, planet);
    
    // Create orbit
    const orbitGeometry = getEllipticalOrbitGeometry(elements.a, elements.e);
    const orbitMaterial = new THREE.LineBasicMaterial({
      color: ORBIT_COLORS[key as keyof typeof ORBIT_COLORS],
      opacity: 1,
      linewidth: 1
    });
    const orbit = new THREE.LineSegments(orbitGeometry, orbitMaterial);
    
    // Apply orbital rotations (TheSkyLive style)
    orbit.rotateY(deg2rad(elements.o));
    orbit.rotateOnAxis(new THREE.Vector3(1, 0, 0), deg2rad(elements.i));
    orbit.rotateOnAxis(new THREE.Vector3(0, 1, 0), deg2rad(elements.lp - elements.o));
    
    scene.add(orbit);
    
    // Create planet body
    const planetGeometry = new THREE.BufferGeometry();
    const vertices = new Float32Array([0, 0, 0]);
    planetGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    
    const planetMaterial = new THREE.PointsMaterial({
      size: 18,
      sizeAttenuation: false,
      color: PLANET_COLORS[key as keyof typeof PLANET_COLORS],
      transparent: true,
      alphaTest: 0.5
    });
    
    const planetBody = new THREE.Points(planetGeometry, planetMaterial);
    planetBody.name = key;
    
    // Calculate position
    const position = getPlanetPosition(currentTime, elements);
    planetBody.position.set(position.x, position.z, -position.y);
    
    scene.add(planetBody);
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
  
  // Apply AU scale for visibility
  return { x: xEcl * AU_SCALE, y: yEcl * AU_SCALE, z: zEcl * AU_SCALE };
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
