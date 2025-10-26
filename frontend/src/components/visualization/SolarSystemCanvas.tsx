/**
 * Solar System Canvas Component
 * 
 * Three.js scene displaying the solar system with
 * real-time planetary positions from ephemeris data.
 */

'use client';

import { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame, ThreeEvent } from '@react-three/fiber';
import { OrbitControls, Stars, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Ephemeris } from '@/lib/types';
import { 
  auToThreeJS, 
  getPlanetConfig, 
  formatDistance,
  formatVelocity
} from '@/lib/utils/astronomy';

interface PlanetProps {
  name: string;
  ephemeris?: Ephemeris;
  speedMultiplier: number;
  onSelect?: (ephemeris: Ephemeris | null) => void;
}

function Planet({ name, ephemeris, speedMultiplier, onSelect }: PlanetProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const config = getPlanetConfig(name);

  // Get position from ephemeris data or use fallback
  const position = useMemo(() => {
    if (ephemeris) {
      return auToThreeJS(ephemeris.x_au, ephemeris.y_au, ephemeris.z_au);
    }
    // Fallback: approximate positions for visualization when no data
    const fallbackDistances: Record<string, number> = {
      mercury: 0.4, venus: 0.7, earth: 1.0, mars: 1.5,
      jupiter: 5.2, saturn: 9.5, uranus: 19.2, neptune: 30.1
    };
    const distance = fallbackDistances[name.toLowerCase()] || 1.0;
    return [distance * 10, 0, 0] as [number, number, number];
  }, [ephemeris, name]);

  // Create orbit line based on current distance
  const orbitRadius = useMemo(() => {
    return Math.sqrt(position[0] ** 2 + position[1] ** 2 + position[2] ** 2);
  }, [position]);

  const orbitPoints = useMemo(() => {
    const points = [];
    for (let i = 0; i <= 64; i++) {
      const angle = (i / 64) * Math.PI * 2;
      points.push(
        new THREE.Vector3(
          Math.cos(angle) * orbitRadius,
          0,
          Math.sin(angle) * orbitRadius
        )
      );
    }
    return points;
  }, [orbitRadius]);

  const orbitGeometry = useMemo(() => 
    new THREE.BufferGeometry().setFromPoints(orbitPoints),
    [orbitPoints]
  );

  // Update position if ephemeris data changes
  useFrame(() => {
    if (meshRef.current && ephemeris) {
      const [x, y, z] = auToThreeJS(ephemeris.x_au, ephemeris.y_au, ephemeris.z_au);
      meshRef.current.position.set(x, y, z);
      
      // Rotate planet on its axis
      meshRef.current.rotation.y += 0.01 * speedMultiplier;
    }
  });

  const planetSize = config.size * 0.5; // Scale down for visibility

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect(ephemeris || null);
    }
  };

  return (
    <group>
      {/* Orbit line */}
      <primitive 
        object={new THREE.Line(
          orbitGeometry, 
          new THREE.LineBasicMaterial({ 
            color: hovered ? '#888888' : '#444444', 
            opacity: hovered ? 0.5 : 0.3, 
            transparent: true 
          })
        )} 
      />
      
      {/* Planet */}
      <mesh 
        ref={meshRef} 
        position={position}
        onClick={handleClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[planetSize, 32, 32]} />
        <meshStandardMaterial 
          color={config.color} 
          emissive={hovered ? config.color : '#000000'}
          emissiveIntensity={hovered ? 0.3 : 0}
        />
        
        {/* Label */}
        {hovered && (
          <Html distanceFactor={20}>
            <div className="pointer-events-none rounded-lg bg-zinc-900/95 px-3 py-2 text-xs text-zinc-50 shadow-lg backdrop-blur-sm">
              <div className="font-semibold">{config.name}</div>
              {ephemeris && (
                <>
                  <div className="mt-1 text-zinc-400">
                    {formatDistance(ephemeris.distance_from_sun_au)} from Sun
                  </div>
                  <div className="text-zinc-400">
                    {formatVelocity(Math.sqrt(
                      ephemeris.vx_au_per_day ** 2 + 
                      ephemeris.vy_au_per_day ** 2 + 
                      ephemeris.vz_au_per_day ** 2
                    ))}
                  </div>
                </>
              )}
            </div>
          </Html>
        )}
      </mesh>

      {/* Saturn's rings */}
      {config.hasRings && (
        <mesh position={position} rotation={[Math.PI / 2.2, 0, 0]}>
          <ringGeometry args={[planetSize * 1.5, planetSize * 2.5, 64]} />
          <meshStandardMaterial 
            color={config.ringColor || '#DAA520'} 
            side={THREE.DoubleSide}
            opacity={0.7}
            transparent
          />
        </mesh>
      )}
    </group>
  );
}

function Sun() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.001;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[5, 32, 32]} />
      <meshBasicMaterial color="#FDB813" />
      {/* Sun glow */}
      <pointLight intensity={2} distance={500} decay={2} />
    </mesh>
  );
}

// List of planets to render
const PLANET_NAMES = ['Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune'];

interface SolarSystemCanvasProps {
  speedMultiplier?: number;
  ephemerisData?: Ephemeris[];
  onPlanetSelect?: (ephemeris: Ephemeris | null) => void;
}

export default function SolarSystemCanvas({ 
  speedMultiplier = 1,
  ephemerisData = [],
  onPlanetSelect
}: SolarSystemCanvasProps) {
  return (
    <div className="h-full w-full">
      <Canvas camera={{ position: [0, 50, 100], fov: 60 }}>
        {/* Lighting */}
        <ambientLight intensity={0.2} />
        <pointLight position={[0, 0, 0]} intensity={1.5} />

        {/* Background stars */}
        <Stars radius={300} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

        {/* Sun */}
        <Sun />

        {/* Planets */}
        {PLANET_NAMES.map((planetName) => {
          const ephemeris = ephemerisData.find(
            e => e.object_name.toLowerCase() === planetName.toLowerCase()
          );
          return (
            <Planet 
              key={planetName} 
              name={planetName} 
              ephemeris={ephemeris}
              speedMultiplier={speedMultiplier}
              onSelect={onPlanetSelect}
            />
          );
        })}

        {/* Camera controls */}
        <OrbitControls
          enablePan
          enableZoom
          enableRotate
          minDistance={20}
          maxDistance={500}
        />
      </Canvas>
    </div>
  );
}

