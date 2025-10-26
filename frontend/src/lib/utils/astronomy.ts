/**
 * Astronomy Utilities
 * 
 * Functions for converting astronomical data to Three.js coordinates
 * and handling celestial mechanics calculations.
 */

import { Ephemeris, OrbitalElements, CloseApproach } from '@/lib/types';
import * as THREE from 'three';

/**
 * Scale factor for converting AU to Three.js units
 * 1 AU = 10 Three.js units for better visualization
 */
export const AU_TO_THREEJS_SCALE = 10;

/**
 * Convert astronomical units (AU) to Three.js scene coordinates
 * 
 * @param x_au - X coordinate in AU
 * @param y_au - Y coordinate in AU  
 * @param z_au - Z coordinate in AU
 * @returns Three.js coordinates [x, y, z]
 */
export function auToThreeJS(x_au: number, y_au: number, z_au: number): [number, number, number] {
  return [
    x_au * AU_TO_THREEJS_SCALE,
    z_au * AU_TO_THREEJS_SCALE, // Map Z to Y (Three.js up axis)
    y_au * AU_TO_THREEJS_SCALE, // Map Y to Z (Three.js depth)
  ];
}

/**
 * Find ephemeris data for a specific planet/object by name
 * 
 * @param ephemeris - Array of ephemeris data
 * @param objectName - Name of the celestial object (case-insensitive)
 * @returns Ephemeris data or null if not found
 */
export function findEphemeris(ephemeris: Ephemeris[], objectName: string): Ephemeris | null {
  const normalizedName = objectName.toLowerCase();
  return ephemeris.find(e => e.object_name.toLowerCase() === normalizedName) || null;
}

/**
 * Calculate distance from Sun in Three.js units
 * 
 * @param ephemeris - Ephemeris data
 * @returns Distance in Three.js units
 */
export function calculateDistanceFromSun(ephemeris: Ephemeris): number {
  return ephemeris.distance_from_sun_au * AU_TO_THREEJS_SCALE;
}

/**
 * Calculate distance from Earth in Three.js units
 * 
 * @param ephemeris - Ephemeris data
 * @returns Distance in Three.js units
 */
export function calculateDistanceFromEarth(ephemeris: Ephemeris): number {
  return ephemeris.distance_from_earth_au * AU_TO_THREEJS_SCALE;
}

/**
 * Format Julian Date to human-readable date string
 * 
 * @param jd - Julian Date
 * @returns ISO date string
 */
export function julianDateToISO(jd: number): string {
  // Julian Date to Unix timestamp conversion
  const unixTime = (jd - 2440587.5) * 86400000;
  return new Date(unixTime).toISOString();
}

/**
 * Planet visual configuration
 */
export interface PlanetConfig {
  name: string;
  size: number; // Relative size for visualization
  color: string;
  ringColor?: string; // For Saturn
  hasRings?: boolean;
}

/**
 * Planet configurations for consistent rendering
 * Colors adopted from TheSkyLive.com for professional appearance
 */
export const PLANET_CONFIGS: Record<string, PlanetConfig> = {
  mercury: { name: 'Mercury', size: 0.38, color: '#F0C050' }, // TheSkyLive: 0xF0C050
  venus: { name: 'Venus', size: 0.95, color: '#F5E3C3' },     // TheSkyLive: 0xF5E3C3
  earth: { name: 'Earth', size: 1.0, color: '#339AFF' },      // TheSkyLive: 0x339AFF
  mars: { name: 'Mars', size: 0.53, color: '#FF0000' },       // TheSkyLive: 0xFF0000
  jupiter: { name: 'Jupiter', size: 11.2, color: '#FF9900' }, // TheSkyLive: 0xFF9900
  saturn: { name: 'Saturn', size: 9.45, color: '#FFCC00', hasRings: true, ringColor: '#DAA520' }, // TheSkyLive: 0xFFCC00
  uranus: { name: 'Uranus', size: 4.0, color: '#2EC0AA' },    // TheSkyLive: 0x2EC0AA
  neptune: { name: 'Neptune', size: 3.88, color: '#416FE1' }, // TheSkyLive: 0x416FE1
};

/**
 * Get planet configuration by name
 * 
 * @param name - Planet name (case-insensitive)
 * @returns Planet config or default config
 */
export function getPlanetConfig(name: string): PlanetConfig {
  const normalizedName = name.toLowerCase();
  return PLANET_CONFIGS[normalizedName] || {
    name,
    size: 0.5,
    color: '#CCCCCC',
  };
}

/**
 * Format distance for display
 * 
 * @param au - Distance in AU
 * @returns Formatted string
 */
export function formatDistance(au: number): string {
  if (au < 0.01) {
    return `${(au * 149597870.7).toFixed(0)} km`;
  }
  return `${au.toFixed(2)} AU`;
}

/**
 * Format velocity for display
 * 
 * @param auPerDay - Velocity in AU/day
 * @returns Formatted string
 */
export function formatVelocity(auPerDay: number): string {
  const kmPerSecond = (auPerDay * 149597870.7) / 86400;
  return `${kmPerSecond.toFixed(2)} km/s`;
}

/**
 * Calculate elliptical orbit points from orbital elements
 * 
 * @param elements - Orbital elements data
 * @param numPoints - Number of points to generate (default 128)
 * @returns Array of Vector3 positions
 */
export function calculateEllipticalOrbit(
  elements: OrbitalElements,
  numPoints: number = 128
): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];
  const a = elements.semi_major_axis_au * AU_TO_THREEJS_SCALE;
  const e = elements.eccentricity;
  const i = (elements.inclination_deg * Math.PI) / 180;
  const omega = (elements.longitude_of_ascending_node_deg * Math.PI) / 180;
  const w = (elements.argument_of_periapsis_deg * Math.PI) / 180;

  for (let j = 0; j <= numPoints; j++) {
    const M = (j / numPoints) * 2 * Math.PI; // Mean anomaly
    
    // Solve Kepler's equation for eccentric anomaly (simplified)
    let E = M;
    for (let iter = 0; iter < 10; iter++) {
      E = M + e * Math.sin(E);
    }

    // True anomaly
    const v = 2 * Math.atan2(
      Math.sqrt(1 + e) * Math.sin(E / 2),
      Math.sqrt(1 - e) * Math.cos(E / 2)
    );

    // Radius
    const r = (a * (1 - e * e)) / (1 + e * Math.cos(v));

    // Position in orbital plane
    const xOrbit = r * Math.cos(v);
    const yOrbit = r * Math.sin(v);

    // Rotate to 3D space
    const cosOmega = Math.cos(omega);
    const sinOmega = Math.sin(omega);
    const cosI = Math.cos(i);
    const sinI = Math.sin(i);
    const cosW = Math.cos(w);
    const sinW = Math.sin(w);

    const x =
      xOrbit * (cosOmega * cosW - sinOmega * sinW * cosI) -
      yOrbit * (cosOmega * sinW + sinOmega * cosW * cosI);
    const y =
      xOrbit * (sinOmega * cosW + cosOmega * sinW * cosI) -
      yOrbit * (sinOmega * sinW - cosOmega * cosW * cosI);
    const z = xOrbit * sinW * sinI + yOrbit * cosW * sinI;

    points.push(new THREE.Vector3(x, z, y)); // Map to Three.js coords (Y-up)
  }

  return points;
}

/**
 * Calculate position on elliptical orbit at specific mean anomaly
 * 
 * @param elements - Orbital elements
 * @param meanAnomaly - Mean anomaly in radians
 * @returns Position vector
 */
export function getPositionFromOrbit(
  elements: OrbitalElements,
  meanAnomaly: number
): THREE.Vector3 {
  const a = elements.semi_major_axis_au * AU_TO_THREEJS_SCALE;
  const e = elements.eccentricity;
  const i = (elements.inclination_deg * Math.PI) / 180;
  const omega = (elements.longitude_of_ascending_node_deg * Math.PI) / 180;
  const w = (elements.argument_of_periapsis_deg * Math.PI) / 180;

  // Solve Kepler's equation
  let E = meanAnomaly;
  for (let iter = 0; iter < 10; iter++) {
    E = meanAnomaly + e * Math.sin(E);
  }

  // True anomaly
  const v = 2 * Math.atan2(
    Math.sqrt(1 + e) * Math.sin(E / 2),
    Math.sqrt(1 - e) * Math.cos(E / 2)
  );

  // Radius
  const r = (a * (1 - e * e)) / (1 + e * Math.cos(v));

  // Position in orbital plane
  const xOrbit = r * Math.cos(v);
  const yOrbit = r * Math.sin(v);

  // Rotate to 3D space
  const cosOmega = Math.cos(omega);
  const sinOmega = Math.sin(omega);
  const cosI = Math.cos(i);
  const sinI = Math.sin(i);
  const cosW = Math.cos(w);
  const sinW = Math.sin(w);

  const x =
    xOrbit * (cosOmega * cosW - sinOmega * sinW * cosI) -
    yOrbit * (cosOmega * sinW + sinOmega * cosW * cosI);
  const y =
    xOrbit * (sinOmega * cosW + cosOmega * sinW * cosI) -
    yOrbit * (sinOmega * sinW - cosOmega * cosW * cosI);
  const z = xOrbit * sinW * sinI + yOrbit * cosW * sinI;

  return new THREE.Vector3(x, z, y); // Map to Three.js coords (Y-up)
}

/**
 * NEO/Asteroid visual configuration
 */
export interface NEOConfig {
  name: string;
  size: number;
  color: string;
  glowColor?: string;
  isDangerous?: boolean;
}

/**
 * Get NEO configuration based on approach distance and size
 * 
 * @param approach - Close approach data
 * @returns NEO config
 */
export function getNEOConfig(approach: CloseApproach): NEOConfig {
  const isDangerous = approach.miss_distance_au < 0.05; // Within 0.05 AU is concerning
  const size = approach.object_diameter_km ? Math.max(0.1, approach.object_diameter_km * 0.001) : 0.2;

  return {
    name: approach.object_name,
    size,
    color: isDangerous ? '#FF4444' : '#AAAAAA',
    glowColor: isDangerous ? '#FF0000' : undefined,
    isDangerous,
  };
}

/**
 * Format approach date for display
 * 
 * @param dateString - ISO date string
 * @returns Formatted date
 */
export function formatApproachDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
