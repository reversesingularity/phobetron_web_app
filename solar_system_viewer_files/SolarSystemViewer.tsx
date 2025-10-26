'use client';

import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Planet data with orbital parameters
const PLANET_DATA = {
  mercury: { name: 'Mercury', radius: 0.15, color: 0x8c7853, distance: 5, speed: 0.04 },
  venus: { name: 'Venus', radius: 0.25, color: 0xffc649, distance: 8, speed: 0.015 },
  earth: { name: 'Earth', radius: 0.25, color: 0x4a90e2, distance: 12, speed: 0.01 },
  mars: { name: 'Mars', radius: 0.2, color: 0xe27b58, distance: 16, speed: 0.008 },
  jupiter: { name: 'Jupiter', radius: 0.9, color: 0xc88b3a, distance: 25, speed: 0.002 },
  saturn: { name: 'Saturn', radius: 0.8, color: 0xfad5a5, distance: 35, speed: 0.0009 },
  uranus: { name: 'Uranus', radius: 0.4, color: 0x4fd0e7, distance: 45, speed: 0.0004 },
  neptune: { name: 'Neptune', radius: 0.4, color: 0x4166f5, distance: 55, speed: 0.0001 }
};

interface Planet {
  mesh: THREE.Mesh;
  orbit: THREE.Line;
  data: typeof PLANET_DATA[keyof typeof PLANET_DATA];
  angle: number;
  marker: THREE.Mesh;
}

export default function SolarSystemViewer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const planetsRef = useRef<Planet[]>([]);
  const animationFrameRef = useRef<number>();
  
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 30, 50);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 1;
    controls.maxDistance = 150;
    controls.enablePan = true;
    controlsRef.current = controls;

    // === LIGHTING ===
    // Sun light - the key to making planets visible!
    const sunLight = new THREE.PointLight(0xffffff, 2.5, 100, 2);
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);

    // Ambient light - subtle fill light so dark sides aren't completely black
    const ambientLight = new THREE.AmbientLight(0x404040, 0.15);
    scene.add(ambientLight);

    // === STARFIELD ===
    createStarfield(scene);

    // === CONSTELLATION GRID ===
    createConstellationGrid(scene);

    // === SUN ===
    const sunGeometry = new THREE.SphereGeometry(2.5, 32, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xfdb813,
      emissive: 0xfdb813,
      emissiveIntensity: 1
    });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sun);

    // Add sun glow
    const glowGeometry = new THREE.SphereGeometry(3.5, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0xfdb813,
      transparent: true,
      opacity: 0.3
    });
    const sunGlow = new THREE.Mesh(glowGeometry, glowMaterial);
    scene.add(sunGlow);

    // === PLANETS ===
    const planets: Planet[] = [];
    Object.entries(PLANET_DATA).forEach(([key, data]) => {
      // Planet sphere
      const geometry = new THREE.SphereGeometry(data.radius, 32, 32);
      const material = new THREE.MeshStandardMaterial({
        color: data.color,
        emissive: data.color,
        emissiveIntensity: 0.2,
        roughness: 0.7,
        metalness: 0.3
      });
      const planet = new THREE.Mesh(geometry, material);
      scene.add(planet);

      // Orbital path
      const orbitCurve = new THREE.EllipseCurve(
        0, 0,                    // center
        data.distance, data.distance,  // xRadius, yRadius
        0, 2 * Math.PI,          // start angle, end angle
        false,                   // clockwise
        0                        // rotation
      );
      const orbitPoints = orbitCurve.getPoints(360);
      const orbitGeometry = new THREE.BufferGeometry().setFromPoints(
        orbitPoints.map(p => new THREE.Vector3(p.x, 0, p.y))
      );
      const orbitMaterial = new THREE.LineBasicMaterial({
        color: 0xffffff,
        opacity: 0.5,
        transparent: true
      });
      const orbit = new THREE.Line(orbitGeometry, orbitMaterial);
      scene.add(orbit);

      // Current position marker (glowing sphere on orbit)
      const markerGeometry = new THREE.SphereGeometry(0.1, 16, 16);
      const markerMaterial = new THREE.MeshBasicMaterial({
        color: 0x00d4ff,
        emissive: 0x00d4ff,
        emissiveIntensity: 1
      });
      const marker = new THREE.Mesh(markerGeometry, markerMaterial);
      scene.add(marker);

      planets.push({
        mesh: planet,
        orbit,
        data,
        angle: Math.random() * Math.PI * 2, // Random starting position
        marker
      });
    });
    planetsRef.current = planets;

    // === ANIMATION LOOP ===
    let lastTime = Date.now();
    const animate = () => {
      const currentTime = Date.now();
      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      // Update planets
      if (isPlaying) {
        planets.forEach(planet => {
          planet.angle += planet.data.speed * playbackSpeed * deltaTime;
          const x = Math.cos(planet.angle) * planet.data.distance;
          const z = Math.sin(planet.angle) * planet.data.distance;
          planet.mesh.position.set(x, 0, z);
          
          // Update marker position
          planet.marker.position.copy(planet.mesh.position);
          
          // Marker pulsing animation
          const pulseScale = 0.8 + Math.sin(currentTime * 0.003) * 0.2;
          planet.marker.scale.setScalar(pulseScale);
        });

        // Update date (1 day per second at 1x speed)
        setCurrentDate(prev => {
          const newDate = new Date(prev);
          newDate.setDate(newDate.getDate() + deltaTime * playbackSpeed);
          return newDate;
        });
      }

      controls.update();
      renderer.render(scene, camera);
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current || !camera || !renderer) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Raycaster for planet selection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (event: MouseEvent) => {
      if (!containerRef.current || !camera) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(planets.map(p => p.mesh));

      if (intersects.length > 0) {
        const clickedPlanet = planets.find(p => p.mesh === intersects[0].object);
        if (clickedPlanet) {
          setSelectedPlanet(clickedPlanet.data.name);
          
          // Focus camera on planet
          const targetPos = clickedPlanet.mesh.position.clone();
          const distance = clickedPlanet.data.radius * 5;
          const newCameraPos = targetPos.clone().add(new THREE.Vector3(distance, distance, distance));
          
          // Smooth camera transition
          const startPos = camera.position.clone();
          const startTime = Date.now();
          const duration = 1000;

          const animateCamera = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic

            camera.position.lerpVectors(startPos, newCameraPos, eased);
            controls.target.lerp(targetPos, eased);

            if (progress < 1) {
              requestAnimationFrame(animateCamera);
            }
          };
          animateCamera();
        }
      } else {
        setSelectedPlanet(null);
      }
    };
    renderer.domElement.addEventListener('click', handleClick);

    // Keyboard shortcuts
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        event.preventDefault();
        setIsPlaying(prev => !prev);
      } else if (event.code === 'KeyR') {
        resetCamera();
      }
    };
    window.addEventListener('keydown', handleKeyPress);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyPress);
      renderer.domElement.removeEventListener('click', handleClick);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (containerRef.current && renderer.domElement && containerRef.current.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [isPlaying, playbackSpeed]);

  // Update planet orbit highlighting based on selection
  useEffect(() => {
    planetsRef.current.forEach(planet => {
      if (planet.data.name === selectedPlanet) {
        (planet.orbit.material as THREE.LineBasicMaterial).opacity = 1.0;
      } else {
        (planet.orbit.material as THREE.LineBasicMaterial).opacity = selectedPlanet ? 0.2 : 0.5;
      }
    });
  }, [selectedPlanet]);

  const resetCamera = () => {
    if (cameraRef.current && controlsRef.current) {
      const camera = cameraRef.current;
      const controls = controlsRef.current;
      
      const startPos = camera.position.clone();
      const targetPos = new THREE.Vector3(0, 30, 50);
      const startTarget = controls.target.clone();
      const targetTarget = new THREE.Vector3(0, 0, 0);
      const startTime = Date.now();
      const duration = 1000;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);

        camera.position.lerpVectors(startPos, targetPos, eased);
        controls.target.lerpVectors(startTarget, targetTarget, eased);

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      animate();
      setSelectedPlanet(null);
    }
  };

  return (
    <div className="relative w-full h-screen bg-black">
      {/* 3D Canvas Container */}
      <div ref={containerRef} className="w-full h-full" />

      {/* UI Overlays - OUTSIDE the Canvas */}
      
      {/* Top-Right Info Panel */}
      <div className="fixed top-4 right-4 bg-black/80 backdrop-blur-sm text-white p-4 rounded-lg border border-cyan-500/30 z-10 min-w-[250px]">
        <div className="space-y-2">
          <div className="text-sm text-cyan-400 font-mono">
            {currentDate.toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
          <div className="text-xs text-gray-400">
            {currentDate.toLocaleTimeString('en-US')}
          </div>
          
          {selectedPlanet && (
            <>
              <div className="border-t border-cyan-500/30 pt-2 mt-2">
                <div className="text-lg font-bold text-cyan-300">{selectedPlanet}</div>
                <div className="text-xs text-gray-400 mt-1">
                  Distance from Sun: {planetsRef.current.find(p => p.data.name === selectedPlanet)?.data.distance.toFixed(1)} AU
                </div>
              </div>
            </>
          )}
        </div>

        <button
          onClick={resetCamera}
          className="mt-4 w-full bg-cyan-600 hover:bg-cyan-700 text-white text-sm py-2 px-4 rounded transition-colors"
        >
          Reset Camera
        </button>
      </div>

      {/* Bottom-Left Time Controls */}
      <div className="fixed bottom-4 left-4 bg-black/80 backdrop-blur-sm text-white p-4 rounded-lg border border-cyan-500/30 z-10">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded transition-colors"
            >
              {isPlaying ? '⏸ Pause' : '▶ Play'}
            </button>
          </div>
          
          <div className="space-y-1">
            <label className="text-xs text-gray-400">Playback Speed</label>
            <select
              value={playbackSpeed}
              onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
              className="w-full bg-gray-900 border border-cyan-500/30 text-white px-3 py-2 rounded text-sm"
            >
              <option value={0.1}>0.1x (Slow)</option>
              <option value={1}>1x (Real-time)</option>
              <option value={10}>10x</option>
              <option value={100}>100x</option>
              <option value={1000}>1000x (Fast)</option>
            </select>
          </div>

          <div className="text-xs text-gray-400 pt-2 border-t border-cyan-500/30">
            <div><strong>Controls:</strong></div>
            <div>• Click planet to focus</div>
            <div>• Drag to rotate view</div>
            <div>• Scroll to zoom</div>
            <div>• Right-drag to pan</div>
          </div>
        </div>
      </div>

      {/* Bottom-Right Instructions */}
      <div className="fixed bottom-4 right-4 bg-black/80 backdrop-blur-sm text-white p-3 rounded-lg border border-cyan-500/30 z-10 text-xs">
        <div className="text-cyan-400 font-semibold mb-1">Keyboard Shortcuts</div>
        <div className="text-gray-400 space-y-0.5">
          <div><kbd className="bg-gray-700 px-1 rounded">Space</kbd> Play/Pause</div>
          <div><kbd className="bg-gray-700 px-1 rounded">R</kbd> Reset Camera</div>
        </div>
      </div>
    </div>
  );
}

// === HELPER FUNCTIONS ===

function createStarfield(scene: THREE.Scene) {
  const starCount = 10000;
  const starGeometry = new THREE.BufferGeometry();
  const starPositions = new Float32Array(starCount * 3);
  const starColors = new Float32Array(starCount * 3);
  const starSizes = new Float32Array(starCount);

  for (let i = 0; i < starCount; i++) {
    // Random position in sphere
    const radius = 100;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    
    starPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    starPositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    starPositions[i * 3 + 2] = radius * Math.cos(phi);

    // Star colors based on temperature
    const rand = Math.random();
    if (rand < 0.6) {
      // White stars
      starColors[i * 3] = 1;
      starColors[i * 3 + 1] = 1;
      starColors[i * 3 + 2] = 1;
    } else if (rand < 0.8) {
      // Blue-white stars
      starColors[i * 3] = 0.7;
      starColors[i * 3 + 1] = 0.8;
      starColors[i * 3 + 2] = 1;
    } else if (rand < 0.95) {
      // Yellow stars
      starColors[i * 3] = 1;
      starColors[i * 3 + 1] = 1;
      starColors[i * 3 + 2] = 0.7;
    } else {
      // Orange/red stars
      starColors[i * 3] = 1;
      starColors[i * 3 + 1] = 0.5;
      starColors[i * 3 + 2] = 0.2;
    }

    // Random star sizes
    starSizes[i] = Math.random() * 2 + 0.5;
  }

  starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
  starGeometry.setAttribute('size', new THREE.BufferAttribute(starSizes, 1));

  const starMaterial = new THREE.PointsMaterial({
    size: 1.5,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    sizeAttenuation: true
  });

  const stars = new THREE.Points(starGeometry, starMaterial);
  scene.add(stars);
}

function createConstellationGrid(scene: THREE.Scene) {
  const gridSize = 50;
  const gridDivisions = 10;
  const gridColor = new THREE.Color(0x00d4ff);

  // Ecliptic plane grid
  const gridHelper = new THREE.GridHelper(gridSize * 2, gridDivisions, gridColor, gridColor);
  (gridHelper.material as THREE.Material).opacity = 0.15;
  (gridHelper.material as THREE.Material).transparent = true;
  scene.add(gridHelper);

  // Concentric circles at 10, 25, 50 AU
  [10, 25, 50].forEach(radius => {
    const circleGeometry = new THREE.BufferGeometry();
    const circlePoints = [];
    const segments = 128;
    
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      circlePoints.push(
        new THREE.Vector3(
          Math.cos(theta) * radius,
          0,
          Math.sin(theta) * radius
        )
      );
    }
    
    circleGeometry.setFromPoints(circlePoints);
    const circleMaterial = new THREE.LineBasicMaterial({
      color: gridColor,
      opacity: 0.2,
      transparent: true
    });
    const circle = new THREE.Line(circleGeometry, circleMaterial);
    scene.add(circle);
  });
}
