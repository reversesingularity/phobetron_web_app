/**
 * Celestial Signs - Solar System Visualization Canvas
 * 
 * A comprehensive 3D solar system simulation using Keplerian orbital mechanics.
 * Built with THREE.js for accurate planetary positions and orbital dynamics.
 * 
 * Features:
 * - Pure THREE.js with OrbitControls for camera manipulation
 * - Planet click selection with detail panels
 * - CSS2DRenderer for planet name labels
 * - Time simulation controls (speed, pause, date picker)
 * - Toggle controls (grid, orbits, labels, moons)
 * - Planet hover effects with size increase
 * - Keyboard shortcuts (Space pause, arrows time step)
 * - Real-time planet position updates
 * - Dynamic orbital data from backend API
 * - Enhanced moon mechanics (eccentricity, inclination, phases)
 * - Debris trails for fragmenting comets (3I/ATLAS)
 * - Magnitude-based object visibility
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

// Import constellation data
import { constellationBoundaries, constellationConnections, celestialToCartesian, constellationNames } from '../../lib/constellations';

// Import planet data and info panel
import { getPlanetInfo, type PlanetInfo } from '../../lib/planetData';
import PlanetInfoPanel from './PlanetInfoPanel';

// Scale factor: Convert AU to THREE.js units (10 units = 1 AU for better visibility)
const AU_SCALE = 10;

// API base URL - Updated to match backend server port
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8020';

// Orbital element data structure from API
interface OrbitalElementData {
  id: string;
  object_name: string;
  epoch_iso: string;
  semi_major_axis_au: number;
  eccentricity: number;
  inclination_deg: number;
  longitude_ascending_node_deg: number;
  argument_perihelion_deg: number;
  mean_anomaly_deg: number;
  is_interstellar?: boolean;
  data_source?: string;
  created_at: string;
}

// API response structure
interface OrbitalElementsResponse {
  total: number;
  skip: number;
  limit: number;
  data: OrbitalElementData[];
}

// Celestial object type for internal use
interface CelestialObject {
  name: string;
  a0: number; // semi-major axis
  e0: number; // eccentricity
  i0: number; // inclination
  ml0: number; // mean longitude
  lp0: number; // longitude of perihelion
  o0: number; // longitude of ascending node
  ad: number; // semi-major axis derivative
  ed: number; // eccentricity derivative
  id: number; // inclination derivative
  mld: number; // mean longitude derivative
  lpd: number; // longitude of perihelion derivative
  od: number; // longitude of ascending node derivative
  type: 'planet' | 'asteroid' | 'comet' | 'neo' | 'interstellar';
  hyperbolic?: boolean;
  hasAnomalousTail?: boolean; // For fragmenting objects with sunward tails
}

// Color schemes for different object types
const PLANET_COLORS = {
  Mercury: 0xF0C050,
  Venus: 0xF5E3C3,
  Earth: 0x6BB8FF, // Brighter blue for Earth's oceans
  Mars: 0xFF0000,
  Jupiter: 0xFF9900,
  Saturn: 0xFFCC00,
  Uranus: 0x2EC0AA,
  Neptune: 0x416FE1,
  Sun: 0xFFFFFF
};

const ASTEROID_COLORS = {
  Ceres: 0x8B7355,    // Brownish
  Vesta: 0xA0522D,    // Sienna
  Pallas: 0x696969,   // Dim gray
  Hygiea: 0x8B4513,   // Saddle brown
  Eunomia: 0x708090,  // Slate gray
  Juno: 0x2F4F4F,     // Dark slate gray
  default: 0x696969   // Default asteroid gray
};

const COMET_COLORS = {
  "Halley's Comet": 0xE6E6FA,   // Lavender (icy blue-white)
  "Hale-Bopp": 0xF0F8FF, // Alice blue
  "1I/'Oumuamua": 0xFFD700, // Gold (metallic)
  "2I/Borisov": 0xFFE4B5,  // Moccasin
  "3I/ATLAS": 0xFF6B35,    // Red-orange (distinct interstellar color)
  "C/2025 A6 (Lemmon)": 0x87CEEB,   // Sky blue (bright comet)
  "C/2025 R2 (SWAN)": 0x98FB98,     // Pale green (bright comet)
  default: 0xE6E6FA   // Default comet color
};

const NEO_COLORS = {
  Apophis: 0xFF4500,  // Orange red (hazardous)
  Ryugu: 0x8B4513,    // Saddle brown
  default: 0xFF6347   // Tomato (warning red)
};

const INTERSTELLAR_COLORS = {
  "1I/'Oumuamua": 0xFFD700, // Gold (metallic)
  "2I/Borisov": 0xFFE4B5,  // Moccasin
  "3I/ATLAS": 0xFF6B35,    // Red-orange (distinct interstellar color)
  default: 0xFFD700   // Default interstellar color
};

// Planet texture URLs (NASA/Solar System Scope - public domain)
const PLANET_TEXTURES = {
  Mercury: 'https://www.solarsystemscope.com/textures/download/2k_mercury.jpg',
  Venus: 'https://www.solarsystemscope.com/textures/download/2k_venus_surface.jpg',
  Earth: 'https://www.solarsystemscope.com/textures/download/2k_earth_daymap.jpg',
  Mars: 'https://www.solarsystemscope.com/textures/download/2k_mars.jpg',
  Jupiter: 'https://www.solarsystemscope.com/textures/download/2k_jupiter.jpg',
  Saturn: 'https://www.solarsystemscope.com/textures/download/2k_saturn.jpg',
  Uranus: 'https://www.solarsystemscope.com/textures/download/2k_uranus.jpg',
  Neptune: 'https://www.solarsystemscope.com/textures/download/2k_neptune.jpg'
};

const ORBIT_COLORS = {
  ...PLANET_COLORS,
  ...ASTEROID_COLORS,
  ...COMET_COLORS,
  ...NEO_COLORS,
  ...INTERSTELLAR_COLORS
};

// Fetch orbital elements from API
async function fetchOrbitalElements(): Promise<CelestialObject[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/scientific/orbital-elements?limit=1000`);
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    const data: OrbitalElementsResponse = await response.json();
    
    // If API returns data, use it, otherwise fall back to full dataset
    if (data.data && data.data.length > 0) {
      // Transform API data to internal format
      const apiObjects = data.data.map(apiObj => {
        // Convert API format to internal Keplerian elements format
        // API: semi_major_axis_au, eccentricity, inclination_deg, longitude_ascending_node_deg, argument_perihelion_deg, mean_anomaly_deg
        // Internal: a0, e0, i0, ml0 (mean longitude), lp0 (longitude of perihelion), o0 (longitude of ascending node)
        
        // Calculate mean longitude: argument_perihelion + mean_anomaly
        const meanLongitude = apiObj.argument_perihelion_deg + apiObj.mean_anomaly_deg;
        // Longitude of perihelion: longitude_ascending_node + argument_perihelion
        const longitudePerihelion = apiObj.longitude_ascending_node_deg + apiObj.argument_perihelion_deg;
        
        // Determine object type
        let objectType: CelestialObject['type'] = 'asteroid';
        if (apiObj.is_interstellar) {
          objectType = 'interstellar';
        } else if (apiObj.object_name.toLowerCase().includes('comet') || apiObj.object_name.startsWith('C/') || apiObj.object_name.startsWith('P/')) {
          objectType = 'comet';
        } else if (['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'].includes(apiObj.object_name.toLowerCase())) {
          objectType = 'planet';
        } else if (apiObj.object_name.toLowerCase().includes('neo') || apiObj.object_name.match(/^\d+$/)) {
          objectType = 'neo';
        }
        
        return {
          name: apiObj.object_name,
          a0: apiObj.semi_major_axis_au,
          e0: apiObj.eccentricity,
          i0: apiObj.inclination_deg,
          ml0: meanLongitude,
          lp0: longitudePerihelion,
          o0: apiObj.longitude_ascending_node_deg,
          // Set derivatives based on object type
          // For planets, use approximate values for orbital motion
          ad: objectType === 'planet' ? 0.0 : 0.0, // Semi-major axis drift (very small for planets)
          ed: objectType === 'planet' ? 0.0 : 0.0, // Eccentricity change (very small)
          id: objectType === 'planet' ? 0.0 : 0.0, // Inclination change (very small)
          // Mean longitude derivative (degrees per day, converted to arcseconds per century)
          mld: objectType === 'planet' ? getPlanetMeanMotion(apiObj.object_name) : 0.0,
          lpd: objectType === 'planet' ? 0.0 : 0.0, // Longitude of perihelion change
          od: objectType === 'planet' ? 0.0 : 0.0, // Longitude of node change
          type: objectType,
          hyperbolic: apiObj.eccentricity >= 1.0
        };
      });
      
      // If API has fewer than expected objects, supplement with fallback data
      if (apiObjects.length < 10) {
        console.log(`API returned ${apiObjects.length} objects, supplementing with fallback data`);
        const fallbackData = getFallbackOrbitalData();
        // Merge API data with fallback, preferring API data for duplicates
        const apiNames = new Set(apiObjects.map(obj => obj.name));
        const supplementalData = fallbackData.filter(obj => !apiNames.has(obj.name));
        return [...apiObjects, ...supplementalData];
      }
      
      return apiObjects;
    } else {
      throw new Error('No data returned from API');
    }
  } catch (error) {
    console.error('Failed to fetch orbital elements from API, using fallback data:', error);
    // Return full fallback data for development
    return getFallbackOrbitalData();
  }
}// Fallback data in case API is unavailable
function getFallbackOrbitalData(): CelestialObject[] {
  return [
    // Planets
    {
      name: "Mercury", a0: 0.38709927, e0: 0.20563593, i0: 7.00497902,
      ml0: 252.2503235, lp0: 77.45779628, o0: 48.33076593,
      ad: 0.00000037, ed: 0.00001906, id: -0.00594749,
      mld: 149472.67411175, lpd: 0.16047689, od: -0.12534081,
      type: 'planet'
    },
    {
      name: "Venus", a0: 0.72333566, e0: 0.00677672, i0: 3.39467605,
      ml0: 181.9790995, lp0: 131.60246718, o0: 76.67984255,
      ad: 0.00000039, ed: -0.00004107, id: -0.00007889,
      mld: 58517.81538729, lpd: 0.00268329, od: -0.27769418,
      type: 'planet'
    },
    {
      name: "Earth", a0: 1.00000261, e0: 0.01671123, i0: -0.00001531,
      ml0: 100.46457166, lp0: 102.93768193, o0: 0,
      ad: 0.00000562, ed: -0.00004392, id: -0.01294668,
      mld: 35999.37244981, lpd: 0.32327364, od: 0,
      type: 'planet'
    },
    {
      name: "Mars", a0: 1.52371034, e0: 0.09339410, i0: 1.84969142,
      ml0: -4.55343205, lp0: -23.94362959, o0: 49.55953891,
      ad: 0.00001847, ed: 0.00007882, id: -0.00813131,
      mld: 19140.30268499, lpd: 0.44441088, od: -0.29257343,
      type: 'planet'
    },
    {
      name: "Jupiter", a0: 5.20288700, e0: 0.04838624, i0: 1.30439695,
      ml0: 34.39644051, lp0: 14.72847983, o0: 100.47390909,
      ad: -0.00011607, ed: -0.00013253, id: -0.00183714,
      mld: 3034.74612775, lpd: 0.21252668, od: 0.20469106,
      type: 'planet'
    },
    {
      name: "Saturn", a0: 9.53667594, e0: 0.05386179, i0: 2.48599187,
      ml0: 49.95424423, lp0: 92.59887831, o0: 113.66242448,
      ad: -0.00125060, ed: -0.00050991, id: 0.00193609,
      mld: 1222.49362201, lpd: -0.41897216, od: -0.28867794,
      type: 'planet'
    },
    {
      name: "Uranus", a0: 19.18916464, e0: 0.04725744, i0: 0.77263783,
      ml0: 313.23810451, lp0: 170.95427630, o0: 74.01692503,
      ad: -0.00196176, ed: -0.00004397, id: -0.00242939,
      mld: 428.48202785, lpd: 0.40805281, od: 0.04240589,
      type: 'planet'
    },
    {
      name: "Neptune", a0: 30.06992276, e0: 0.00859048, i0: 1.77004347,
      ml0: -55.12002969, lp0: 44.96476227, o0: 131.78422574,
      ad: 0.00026291, ed: 0.00005105, id: 0.00035372,
      mld: 218.45945325, lpd: -0.32241464, od: -0.00508664,
      type: 'planet'
    },
    // Asteroids
    {
      name: "Ceres", a0: 2.7691653, e0: 0.07600903, i0: 10.5940674,
      ml0: 113.410635, lp0: 73.5976941, o0: 80.3055316,
      ad: 0.0, ed: 0.0, id: 0.0, 
      mld: 213.9, // Mean motion: 360°/sqrt(2.7691653³) * 36525 ≈ 213.9°/century
      lpd: 0.0, od: 0.0,
      type: 'asteroid'
    },
    {
      name: "Vesta", a0: 2.3614180, e0: 0.08874015, i0: 7.1404270,
      ml0: 69.641693, lp0: 151.198527, o0: 103.85136,
      ad: 0.0, ed: 0.0, id: 0.0, 
      mld: 271.5, // Mean motion: 360°/sqrt(2.3614180³) * 36525 ≈ 271.5°/century
      lpd: 0.0, od: 0.0,
      type: 'asteroid'
    },
    {
      name: "Pallas", a0: 2.7724660, e0: 0.2307265, i0: 34.836234,
      ml0: 78.228143, lp0: 310.202392, o0: 173.096247,
      ad: 0.0, ed: 0.0, id: 0.0, 
      mld: 213.6, // Mean motion: 360°/sqrt(2.7724660³) * 36525 ≈ 213.6°/century
      lpd: 0.0, od: 0.0,
      type: 'asteroid'
    },
    {
      name: "Hygiea", a0: 3.1416, e0: 0.1125, i0: 3.8317,
      ml0: 283.202, lp0: 312.315, o0: 283.202,
      ad: 0.0, ed: 0.0, id: 0.0, 
      mld: 180.2, // Mean motion: 360°/sqrt(3.1416³) * 36525 ≈ 180.2°/century
      lpd: 0.0, od: 0.0,
      type: 'asteroid'
    },
    {
      name: "Eunomia", a0: 2.6435, e0: 0.1862, i0: 11.747,
      ml0: 98.482, lp0: 293.058, o0: 98.482,
      ad: 0.0, ed: 0.0, id: 0.0, 
      mld: 226.1, // Mean motion: 360°/sqrt(2.6435³) * 36525 ≈ 226.1°/century
      lpd: 0.0, od: 0.0,
      type: 'asteroid'
    },
    {
      name: "Juno", a0: 2.6709, e0: 0.2569, i0: 12.981,
      ml0: 245.194, lp0: 170.132, o0: 245.194,
      ad: 0.0, ed: 0.0, id: 0.0, 
      mld: 223.8, // Mean motion: 360°/sqrt(2.6709³) * 36525 ≈ 223.8°/century
      lpd: 0.0, od: 0.0,
      type: 'asteroid'
    },
    // Comets
    {
      name: "Halley's Comet", a0: 17.834, e0: 0.9671, i0: 162.26,
      ml0: 38.38, lp0: 111.33, o0: 58.42,
      ad: 0.0, ed: 0.0, id: 0.0, 
      mld: 130.0, // ~76 year orbital period: 360°/76y * 36525d/100y ≈ 130°/century
      lpd: 0.0, od: 0.0,
      type: 'comet'
    },
    {
      name: "Hale-Bopp", a0: 186.0, e0: 0.9951, i0: 89.43,
      ml0: 130.59, lp0: 282.47, o0: 130.59,
      ad: 0.0, ed: 0.0, id: 0.0, 
      mld: 4.2, // ~2500 year orbital period: 360°/2500y * 36525d/100y ≈ 4.2°/century
      lpd: 0.0, od: 0.0,
      type: 'comet'
    },
    {
      name: "C/2025 A6 (Lemmon)", a0: 45.0, e0: 0.98, i0: 45.0,
      ml0: 95.0, lp0: 180.0, o0: 270.0,
      ad: 0.0, ed: 0.0, id: 0.0, 
      mld: 43558.6, // Mean motion: 360°/sqrt(45³) * 36525 ≈ 43558.6°/century (302 year period)
      lpd: 0.0, od: 0.0,
      type: 'comet'
    },
    {
      name: "C/2025 R2 (SWAN)", a0: 50.0, e0: 0.99, i0: 40.0,
      ml0: 150.0, lp0: 225.0, o0: 315.0,
      ad: 0.0, ed: 0.0, id: 0.0, 
      mld: 20.0, // ~350 year estimated period: 360°/350y * 36525d/100y ≈ 20°/century
      lpd: 0.0, od: 0.0,
      type: 'comet'
    },
    // NEOs
    {
      name: "Apophis", a0: 0.922, e0: 0.191, i0: 3.33,
      ml0: 286.0, lp0: 126.0, o0: 204.0,
      ad: 0.0, ed: 0.0, id: 0.0, 
      mld: 1232.5, // Mean motion: 360°/sqrt(0.922³) * 36525 ≈ 1232.5°/century
      lpd: 0.0, od: 0.0,
      type: 'neo'
    },
    {
      name: "Ryugu", a0: 1.19, e0: 0.190, i0: 5.88,
      ml0: 211.0, lp0: 251.0, o0: 211.0,
      ad: 0.0, ed: 0.0, id: 0.0, 
      mld: 859.8, // Mean motion: 360°/sqrt(1.19³) * 36525 ≈ 859.8°/century
      lpd: 0.0, od: 0.0,
      type: 'neo'
    },
    // Interstellar objects
    {
      name: "1I/'Oumuamua", a0: 1.2016, e0: 1.1995, i0: 122.69,
      ml0: 24.62, lp0: 241.64, o0: 24.62,
      ad: 0.0, ed: 0.0, id: 0.0, 
      mld: 0.2559, // Hyperbolic - fast passage
      lpd: 0.0, od: 0.0,
      type: 'interstellar', hyperbolic: true, hasAnomalousTail: false // Not a comet, no tail
    },
    {
      name: "2I/Borisov", a0: 3.156, e0: 3.357, i0: 44.05,
      ml0: 209.13, lp0: 308.01, o0: 209.13,
      ad: 0.0, ed: 0.0, id: 0.0, 
      mld: 0.1558, // Hyperbolic - fast passage
      lpd: 0.0, od: 0.0,
      type: 'interstellar', hyperbolic: true
    },
    {
      name: "3I/ATLAS", a0: -0.26396, e0: 6.1374, i0: 175.11,
      ml0: 450.16, lp0: 450.16, o0: 322.15,
      ad: 0.0, ed: 0.0, id: 0.0, 
      mld: 3.85, // Hyperbolic mean motion: sqrt(GM_sun/|a|³) * (180/π) * 36525 ≈ 3.85°/century
      lpd: 0.0, od: 0.0,
      type: 'interstellar', hyperbolic: true, hasAnomalousTail: true // Observed sunward tail - likely fragmenting
    }
  ];
}

// Get approximate mean motion derivative for planets (degrees per Julian century)
function getPlanetMeanMotion(planetName: string): number {
  const meanMotions: { [key: string]: number } = {
    'Mercury': 149472.67411175,
    'Venus': 58517.81538729,
    'Earth': 35999.37244981,
    'Mars': 19140.30268499,
    'Jupiter': 3034.74612775,
    'Saturn': 1222.49362201,
    'Uranus': 428.48202785,
    'Neptune': 218.45945325
  };
  
  return meanMotions[planetName] || 0.0;
}

// Test data from API for development
function getTestOrbitalData(): CelestialObject[] {
  // This represents the actual API response data
  const apiData = [
    {
      "id": "345b57e6-4e2b-4fd1-b112-dd493b02577e",
      "object_name": "Mercury",
      "epoch_iso": "2024-01-01T00:00:00",
      "semi_major_axis_au": 0.38709927,
      "eccentricity": 0.20563593,
      "inclination_deg": 7.00497902,
      "longitude_ascending_node_deg": 48.33076593,
      "argument_perihelion_deg": 77.45779628,
      "mean_anomaly_deg": 252.2503235,
      "is_interstellar": false,
      "data_source": "JPL",
      "created_at": "2025-10-26T10:40:07.123373"
    },
    {
      "id": "2ef4eb74-b3cd-46e7-a341-f891c979c87b",
      "object_name": "Venus",
      "epoch_iso": "2024-01-01T00:00:00",
      "semi_major_axis_au": 0.72333566,
      "eccentricity": 0.00677672,
      "inclination_deg": 3.39467605,
      "longitude_ascending_node_deg": 76.67984255,
      "argument_perihelion_deg": 131.60246718,
      "mean_anomaly_deg": 181.9790995,
      "is_interstellar": false,
      "data_source": "JPL",
      "created_at": "2025-10-26T10:40:07.123381"
    },
    {
      "id": "188c67c0-918b-40cb-be91-4ec3e28a35b3",
      "object_name": "Earth",
      "epoch_iso": "2024-01-01T00:00:00",
      "semi_major_axis_au": 1.00000261,
      "eccentricity": 0.01671123,
      "inclination_deg": 1.531e-05,
      "longitude_ascending_node_deg": 0.0,
      "argument_perihelion_deg": 102.93768193,
      "mean_anomaly_deg": 100.46457166,
      "is_interstellar": false,
      "data_source": "JPL",
      "created_at": "2025-10-26T10:40:07.123386"
    },
    {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "object_name": "Mars",
      "epoch_iso": "2024-01-01T00:00:00",
      "semi_major_axis_au": 1.52371034,
      "eccentricity": 0.09339410,
      "inclination_deg": 1.84969142,
      "longitude_ascending_node_deg": 49.55953891,
      "argument_perihelion_deg": 286.53758759,
      "mean_anomaly_deg": 355.433,
      "is_interstellar": false,
      "data_source": "JPL",
      "created_at": "2025-10-26T10:40:07.123390"
    },
    {
      "id": "b2c3d4e5-f6a7-8901-bcde-f23456789012",
      "object_name": "Jupiter",
      "epoch_iso": "2024-01-01T00:00:00",
      "semi_major_axis_au": 5.20288700,
      "eccentricity": 0.04838624,
      "inclination_deg": 1.30439695,
      "longitude_ascending_node_deg": 100.47390909,
      "argument_perihelion_deg": 273.86784663,
      "mean_anomaly_deg": 18.47719,
      "is_interstellar": false,
      "data_source": "JPL",
      "created_at": "2025-10-26T10:40:07.123394"
    },
    {
      "id": "c3d4e5f6-a7b8-9012-cdef-345678901234",
      "object_name": "Saturn",
      "epoch_iso": "2024-01-01T00:00:00",
      "semi_major_axis_au": 9.53667594,
      "eccentricity": 0.05386179,
      "inclination_deg": 2.48599187,
      "longitude_ascending_node_deg": 113.66242448,
      "argument_perihelion_deg": 339.39266053,
      "mean_anomaly_deg": 316.635,
      "is_interstellar": false,
      "data_source": "JPL",
      "created_at": "2025-10-26T10:40:07.123398"
    }
  ];

  return apiData.map(apiObj => {
    const meanLongitude = apiObj.argument_perihelion_deg + apiObj.mean_anomaly_deg;
    const longitudePerihelion = apiObj.longitude_ascending_node_deg + apiObj.argument_perihelion_deg;
    
    let objectType: CelestialObject['type'] = 'planet';
    
    return {
      name: apiObj.object_name,
      a0: apiObj.semi_major_axis_au,
      e0: apiObj.eccentricity,
      i0: apiObj.inclination_deg,
      ml0: meanLongitude,
      lp0: longitudePerihelion,
      o0: apiObj.longitude_ascending_node_deg,
      ad: 0.0,
      ed: 0.0,
      id: 0.0,
      mld: 0.0,
      lpd: 0.0,
      od: 0.0,
      type: objectType,
      hyperbolic: apiObj.eccentricity >= 1.0
    };
  });
}

// Props interface for canvas controls
interface CelestialCanvasProps {
  showGrid?: boolean;
  showOrbits?: boolean;
  showLabels?: boolean;
  showConstellations?: boolean;
  showAsteroidBelt?: boolean;
  showMoons?: boolean;
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
    startRecording: () => void;
    stopRecording: () => void;
  }) => void;
}

// Main Celestial Canvas component
export default function CelestialCanvas({
  showGrid = true,
  showOrbits = true,
  showLabels = true,
  showConstellations = false,
  showAsteroidBelt = true,
  showMoons = true,
  speedMultiplier = 1,
  isPaused = false,
  onPlanetSelect,
  onTimeUpdate,
  onCameraControlsReady
}: CelestialCanvasProps = {}) {
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
  const constellationsRef = useRef<Map<string, THREE.Group>>(new Map());
  const asteroidBeltRef = useRef<THREE.Points | null>(null);
  const moonsRef = useRef<Map<string, THREE.Mesh[]>>(new Map());
  const textureLoaderRef = useRef<THREE.TextureLoader | null>(null);
  const timeRef = useRef<number>(0); // Will be initialized in useEffect
  const recordingFrames = useRef<string[]>([]);
  const isRecording = useRef<boolean>(false);
  const [hoveredPlanet, setHoveredPlanet] = useState<string | null>(null);
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetInfo | null>(null);
  const [orbitalData, setOrbitalData] = useState<CelestialObject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch orbital data on component mount
  useEffect(() => {
    const loadOrbitalData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchOrbitalElements();
        setOrbitalData(data);
        console.log(`✅ Loaded ${data.length} celestial objects from API`);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        console.error('Failed to load orbital data:', err);
        // Fallback data will be used
        const fallbackData = getFallbackOrbitalData();
        setOrbitalData(fallbackData);
        console.log(`⚠️ Using fallback data: ${fallbackData.length} celestial objects`);
      } finally {
        setIsLoading(false);
      }
    };

    loadOrbitalData();
  }, []);

  useEffect(() => {
    if (!containerRef.current || orbitalData.length === 0) return;

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
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
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

    // Initialize texture loader
    const textureLoader = new THREE.TextureLoader();
    textureLoaderRef.current = textureLoader;

    // Add sky background
    addSky(scene);

    // Add Sun with enhanced glow
    addSun(scene);

    // Add planets with orbits and labels (use synchronized time)
    addPlanets(scene, showLabels, timeRef.current, planetsRef, orbitsRef, labelsRef, orbitalData, textureLoaderRef.current);

    // Add moon systems for major planets
    addMoonSystems(scene, showMoons, moonsRef, planetsRef, timeRef.current);

    // Add asteroid belt between Mars and Jupiter
    addAsteroidBelt(scene, showAsteroidBelt, asteroidBeltRef);

    // Add constellations
    addConstellations(scene, showConstellations, constellationsRef);

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
      const intersects = raycaster.intersectObjects(Array.from(planetsRef.current.values()), true); // true = recursive check children

      if (intersects.length > 0) {
        let planetMesh = intersects[0].object;
        
        // If we hit a child mesh (glow, atmosphere, etc.), traverse up to find the parent planet
        while (planetMesh.parent && !planetsRef.current.has(planetMesh.name)) {
          planetMesh = planetMesh.parent as THREE.Object3D;
        }
        
        const planetName = planetMesh.name;
        
        // Get planet info and display panel
        const planetInfo = getPlanetInfo(planetName);
        if (planetInfo) {
          setSelectedPlanet(planetInfo);
        } else {
          console.warn(`No planet info found for: ${planetName}`);
        }
        
        // Also call the optional callback
        if (onPlanetSelect) {
          onPlanetSelect(planetName);
        }
      } else {
        // Clicked on empty space - close panel
        setSelectedPlanet(null);
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(Array.from(planetsRef.current.values()), true); // true = recursive check children

      if (intersects.length > 0) {
        let planetMesh = intersects[0].object;
        
        // If we hit a child mesh (glow, atmosphere, etc.), traverse up to find the parent planet
        while (planetMesh.parent && !planetsRef.current.has(planetMesh.name)) {
          planetMesh = planetMesh.parent as THREE.Object3D;
        }
        
        const planetName = planetMesh.name;
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
    let lastFrameTime = 0; // Will be set on first frame
    
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      
      const currentTime = performance.now();
      
      // Initialize lastFrameTime on first frame
      if (lastFrameTime === 0) {
        lastFrameTime = currentTime;
      }
      
      const deltaTime = currentTime - lastFrameTime; // milliseconds since last frame
      lastFrameTime = currentTime;
      
      // Update camera controls
      controls.update();

      // Update time (only if not paused)
      // Realtime at 1x: simulation time advances at same rate as real time
      // speedMultiplier allows acceleration (e.g., 24x = 1 day per real hour)
      if (!isPaused && deltaTime > 0 && deltaTime < 1000) { // Safeguard: ignore first frame and large gaps
        timeRef.current += deltaTime * speedMultiplier; // deltaTime in ms, speedMultiplier is acceleration factor
        
        // Notify parent of time updates (throttled to avoid excessive calls)
        if (onTimeUpdate && Math.random() < 0.1) { // Update ~10% of frames
          onTimeUpdate(timeRef.current);
        }
      }

      // Update planet positions
      updatePlanetPositions(timeRef.current, planetsRef, orbitalData);
      
      // Apply planetary perturbations (N-body effects)
      // Only apply every 10th frame to reduce computational cost
      if (Math.random() < 0.1 && deltaTime > 0 && deltaTime < 1000) {
        const timeStepDays = (deltaTime * speedMultiplier) / 86400000; // Convert ms to days
        applyPlanetaryPerturbations(planetsRef, timeStepDays);
      }

      // Update moon positions around their parent planets
      updateMoonPositions(timeRef.current, moonsRef, planetsRef);

      // Update object magnitudes based on distance from Earth
      const earthPlanet = planetsRef.current.get('Earth');
      if (earthPlanet) {
        const earthPos = earthPlanet.position;
        
        // Update asteroid, comet, and NEO magnitudes
        planetsRef.current.forEach((object, name) => {
          // Skip planets (they're bright enough)
          const objectData = orbitalData.find(od => od.name === name);
          if (objectData && (objectData.type === 'asteroid' || objectData.type === 'comet' || objectData.type === 'neo' || objectData.type === 'interstellar')) {
            const objectPos = object.position;
            const objectSize = (object.geometry as THREE.SphereGeometry).parameters?.radius || 0.5;
            const magnitude = calculateApparentMagnitude(objectPos, objectSize, objectData.type, earthPos);
            applyMagnitudeBasedVisibility(object, magnitude);
          }
        });
      }

      // Update planet hover effects (scale spheres on hover)
      planetsRef.current.forEach((planet, name) => {
        if (hoveredPlanet === name) {
          planet.scale.setScalar(1.3); // Enlarge on hover
        } else {
          planet.scale.setScalar(1.0); // Normal size
        }
      });
      
      // Render both scenes with error handling for NaN geometries
      try {
        renderer.render(scene, camera);
        labelRenderer.render(scene, camera);
      } catch (error) {
        // Suppress Three.js bounding sphere NaN warnings during initial load
        if (error instanceof Error && !error.message.includes('computeBoundingSphere')) {
          console.error('Render error:', error);
        }
      }
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
        updatePlanetPositions(timeRef.current, planetsRef, orbitalData);
        if (onTimeUpdate) {
          onTimeUpdate(timeRef.current);
        }
      },
      resetToToday: () => {
        timeRef.current = Date.now();
        updatePlanetPositions(timeRef.current, planetsRef, orbitalData);
        if (onTimeUpdate) {
          onTimeUpdate(timeRef.current);
        }
      },
      startRecording: () => {
        isRecording.current = true;
        recordingFrames.current = [];
        console.log('🎬 Started recording time-lapse');
      },
      stopRecording: () => {
        isRecording.current = false;
        console.log(`🎬 Stopped recording - captured ${recordingFrames.current.length} frames`);
        // TODO: Compile frames into video/GIF
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
  }, [showGrid, showOrbits, showLabels, showConstellations, showAsteroidBelt, showMoons, speedMultiplier, isPaused, hoveredPlanet, onPlanetSelect, onTimeUpdate, onCameraControlsReady, orbitalData]);

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
    constellationsRef.current.forEach((constellation) => {
      constellation.visible = showConstellations;
    });
  }, [showGrid, showOrbits, showLabels, showConstellations]);

  return (
    <div ref={containerRef} className="w-full h-full bg-black relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 z-10">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>Loading celestial objects...</p>
          </div>
        </div>
      )}
      {error && (
        <div className="absolute top-4 left-4 bg-red-600 text-white p-4 rounded-lg z-10 max-w-md">
          <h3 className="font-bold mb-2">Error Loading Data</h3>
          <p className="text-sm">{error}</p>
          <p className="text-sm mt-2 opacity-75">Using fallback orbital data</p>
        </div>
      )}
      {selectedPlanet && (
        <PlanetInfoPanel
          planet={selectedPlanet}
          onClose={() => setSelectedPlanet(null)}
        />
      )}
    </div>
  );
}

// ============================================================================
// ============================================================================
// Celestial Mechanics Helper Functions
// ============================================================================
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
  light.castShadow = true;
  light.shadow.mapSize.width = 2048;
  light.shadow.mapSize.height = 2048;
  light.shadow.camera.near = 0.1;
  light.shadow.camera.far = 1000;
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

  // Enhanced inner glow with multiple layers
  const glowGeometry1 = new THREE.SphereGeometry(2.2, 32, 32);
  const glowMaterial1 = new THREE.MeshBasicMaterial({
    color: 0xFFFF00,
    transparent: true,
    opacity: 0.4,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide
  });
  const glow1 = new THREE.Mesh(glowGeometry1, glowMaterial1);
  sunMesh.add(glow1);

  const glowGeometry2 = new THREE.SphereGeometry(2.5, 32, 32);
  const glowMaterial2 = new THREE.MeshBasicMaterial({
    color: 0xFFA500,
    transparent: true,
    opacity: 0.2,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide
  });
  const glow2 = new THREE.Mesh(glowGeometry2, glowMaterial2);
  sunMesh.add(glow2);
  
  console.log('✅ Enhanced Sun created with shadow casting and multi-layer glow');
}

function addPlanets(
  scene: THREE.Scene, 
  showLabels: boolean,
  currentTime: number, // Added parameter for synchronized time
  planetsRef: React.MutableRefObject<Map<string, THREE.Mesh>>, // Changed to Mesh
  orbitsRef: React.MutableRefObject<Map<string, THREE.LineSegments>>,
  labelsRef: React.MutableRefObject<Map<string, CSS2DObject>>,
  orbitalData: CelestialObject[],
  textureLoader: THREE.TextureLoader | null
) {
  // Validate orbital data before proceeding
  if (!orbitalData || orbitalData.length === 0) {
    console.warn('⚠️ Orbital data not loaded yet, skipping planet creation');
    return;
  }

  // Removed: const currentTime = Date.now(); - now using parameter
  
  // Planet size scaling (relative sizes for visual effect)
  const planetSizes: { [key: string]: number } = {
    Mercury: 0.15,
    Venus: 0.35,
    Earth: 0.38,
    Mars: 0.20,
    Jupiter: 1.2,
    Saturn: 1.0,
    Uranus: 1.5,  // Increased from 0.6 for better visibility
    Neptune: 1.4  // Increased from 0.58 for better visibility
  };
  
  // Asteroid sizes (much smaller, scaled by diameter)
  const asteroidSizes: { [key: string]: number } = {
    Ceres: 0.08,    // Largest asteroid
    Vesta: 0.06,
    Pallas: 0.05,
    Hygiea: 0.04,
    Eunomia: 0.03,
    Juno: 0.03,
    default: 0.02   // Small asteroids
  };
  
  // Comet sizes (variable, often elongated)
  const cometSizes: { [key: string]: number } = {
    "Halley's Comet": 0.04,
    "Hale-Bopp": 0.06,
    "1I/'Oumuamua": 0.02,
    "2I/Borisov": 0.03,
    "3I/ATLAS": 0.025,    // 3I/ATLAS size
    "C/2025 A6 (Lemmon)": 0.035,   // C/2025 A6 (Lemmon) - bright comet
    "C/2025 R2 (SWAN)": 0.035,     // C/2025 R2 (SWAN) - bright comet
    default: 0.03
  };
  
  // NEO sizes (small but potentially hazardous)
  const neoSizes: { [key: string]: number } = {
    Apophis: 0.025,
    Ryugu: 0.030,
    default: 0.020
  };

  // Interstellar object sizes (increased for better visibility)
  const interstellarSizes: { [key: string]: number } = {
    "1I/'Oumuamua": 0.15, // Much larger for visibility
    "2I/Borisov": 0.18,   // Much larger for visibility
    "3I/ATLAS": 0.20,     // Much larger for visibility - most unusual
    default: 0.15
  };
  
  // Combine all celestial objects from API data
  const allObjects = orbitalData;
  
  allObjects.forEach((objectData) => {
    // Update orbital elements for current time
    const elements = updateMeanElements(currentTime, objectData);
    
    // Create orbit
    const orbitGeometry = getEllipticalOrbitGeometry(elements.a, elements.e);
    const orbitMaterial = new THREE.LineBasicMaterial({
      color: ORBIT_COLORS[objectData.name as keyof typeof ORBIT_COLORS] || 0x666666,
      opacity: 0.6,
      transparent: true,
      linewidth: objectData.type === 'planet' ? 2 : 1
    });
    const orbit = new THREE.LineSegments(orbitGeometry, orbitMaterial);
    
    // Apply Keplerian orbital rotations
    // 1. Rotate by longitude of ascending node (Ω)
    // 2. Rotate by inclination (i)
    // 3. Rotate by argument of perihelion (ω)
    orbit.rotateY(deg2rad(elements.o));
    orbit.rotateOnAxis(new THREE.Vector3(1, 0, 0), deg2rad(elements.i));
    orbit.rotateOnAxis(new THREE.Vector3(0, 1, 0), deg2rad(elements.lp - elements.o));
    
    scene.add(orbit);
    orbitsRef.current.set(objectData.name, orbit);
    
    // Determine size based on object type
    let objectSize = 0.1; // default
    let objectColor = 0xFFFFFF; // default white
    
    switch (objectData.type) {
      case 'planet':
        objectSize = planetSizes[objectData.name] || 0.3;
        objectColor = PLANET_COLORS[objectData.name as keyof typeof PLANET_COLORS] || 0xFFFFFF;
        break;
      case 'asteroid':
        objectSize = asteroidSizes[objectData.name] || asteroidSizes.default;
        objectColor = ASTEROID_COLORS[objectData.name as keyof typeof ASTEROID_COLORS] || ASTEROID_COLORS.default;
        break;
      case 'comet':
        objectSize = cometSizes[objectData.name] || cometSizes.default;
        objectColor = COMET_COLORS[objectData.name as keyof typeof COMET_COLORS] || COMET_COLORS.default;
        break;
      case 'neo':
        objectSize = neoSizes[objectData.name] || neoSizes.default;
        objectColor = NEO_COLORS[objectData.name as keyof typeof NEO_COLORS] || NEO_COLORS.default;
        break;
      case 'interstellar':
        objectSize = interstellarSizes[objectData.name] || interstellarSizes.default;
        objectColor = INTERSTELLAR_COLORS[objectData.name as keyof typeof INTERSTELLAR_COLORS] || INTERSTELLAR_COLORS.default;
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
      
      if (objectData.type === 'planet' && textureLoader) {
        // Load planet texture
        const textureUrl = PLANET_TEXTURES[objectData.name as keyof typeof PLANET_TEXTURES];
        if (textureUrl) {
          const texture = textureLoader.load(textureUrl);
          // Special handling for Earth to make it bright and beautiful
          if (objectData.name === 'Earth') {
            objectMaterial = new THREE.MeshStandardMaterial({
              map: texture,
              color: 0x4A90E2, // Vibrant blue tint to enhance ocean colors
              emissive: 0x0066FF, // Deep blue emissive instead of sky blue
              emissiveIntensity: 0.5, // Moderate intensity - not too bright
              metalness: 0.2,
              roughness: 0.3, // Some roughness for natural look
              transparent: false,
              opacity: 1.0
            });
            
            // Log Earth texture loading for debugging
            console.log('🌍 Earth material created with vibrant blue ocean colors');
          } else if (objectData.name === 'Uranus') {
            // Make Uranus bright cyan-blue and highly visible with BasicMaterial (self-illuminating)
            objectMaterial = new THREE.MeshBasicMaterial({
              map: texture,
              color: 0x00FFFF, // Bright cyan - fully visible
              transparent: false
            });
            console.log('🔵 Uranus material created with self-illuminating cyan');
          } else if (objectData.name === 'Neptune') {
            // Make Neptune bright deep blue and highly visible with BasicMaterial (self-illuminating)
            objectMaterial = new THREE.MeshBasicMaterial({
              map: texture,
              color: 0x4169E1, // Bright royal blue - fully visible
              transparent: false
            });
            console.log('🔵 Neptune material created with self-illuminating blue');
          } else {
            objectMaterial = new THREE.MeshStandardMaterial({
              map: texture,
              emissive: objectColor,
              emissiveIntensity: 0.2,
              metalness: 0.1,
              roughness: 0.8
            });
          }
        } else {
          // Fallback to solid color if no texture
          // Make Uranus and Neptune extra bright since they're far away
          if (objectData.name === 'Uranus') {
            objectMaterial = new THREE.MeshBasicMaterial({
              color: 0x00FFFF, // Bright cyan - self-illuminating
              transparent: false
            });
          } else if (objectData.name === 'Neptune') {
            objectMaterial = new THREE.MeshBasicMaterial({
              color: 0x4169E1, // Bright blue - self-illuminating
              transparent: false
            });
          } else {
            objectMaterial = new THREE.MeshStandardMaterial({
              color: objectColor,
              emissive: objectColor,
              emissiveIntensity: 0.2,
              metalness: 0.1,
              roughness: 0.8
            });
          }
        }
      } else {
        // Non-planet objects or planets without textures
        // Special handling for Uranus and Neptune
        if (objectData.name === 'Uranus') {
          objectMaterial = new THREE.MeshBasicMaterial({
            color: 0x00FFFF, // Bright cyan - self-illuminating
            transparent: false
          });
        } else if (objectData.name === 'Neptune') {
          objectMaterial = new THREE.MeshBasicMaterial({
            color: 0x4169E1, // Bright blue - self-illuminating
            transparent: false
          });
        } else if (objectData.type === 'interstellar') {
          // Make interstellar objects VERY bright and glowing
          objectMaterial = new THREE.MeshBasicMaterial({
            color: objectColor,
            transparent: false
          });
        } else {
          objectMaterial = new THREE.MeshStandardMaterial({
            color: objectColor,
            emissive: objectColor,
            emissiveIntensity: objectData.type === 'planet' ? 0.5 : 0.2,
            metalness: objectData.type === 'asteroid' ? 0.3 : 0.1,
            roughness: objectData.type === 'asteroid' ? 0.7 : 0.8
          });
        }
      }
    }
    
    const objectMesh = new THREE.Mesh(objectGeometry, objectMaterial);
    objectMesh.name = objectData.name;
    objectMesh.castShadow = true;
    objectMesh.receiveShadow = true;
    
    // Calculate initial position
    const position = getPlanetPosition(currentTime, elements);
    objectMesh.position.set(position.x, position.y, position.z);
    
    // Debug logging for interstellar objects
    if (objectData.type === 'interstellar') {
      console.log(`🌌 Interstellar object: ${objectData.name}`);
      console.log(`   Position: (${position.x.toFixed(2)}, ${position.y.toFixed(2)}, ${position.z.toFixed(2)})`);
      console.log(`   Distance from Sun: ${Math.sqrt(position.x**2 + position.y**2 + position.z**2).toFixed(2)} units`);
      console.log(`   Eccentricity: ${elements.e.toFixed(4)}, Semi-major axis: ${elements.a.toFixed(4)}`);
    }
    
    scene.add(objectMesh);
    planetsRef.current.set(objectData.name, objectMesh);

    // Add special features for specific planets
    if (objectData.name === 'Saturn' && objectSize > 0 && !isNaN(objectSize)) {
      // Add Saturn's rings
      addSaturnRings(objectMesh, objectSize);
    }
    
    if (objectData.name === 'Jupiter' && objectSize > 0 && !isNaN(objectSize)) {
      // Add Jupiter's stripes and Great Red Spot
      addJupiterFeatures(objectMesh, objectSize);
    }

    if (objectData.name === 'Mars' && objectSize > 0 && !isNaN(objectSize)) {
      // Add Mars' polar ice caps
      addMarsIceCaps(objectMesh, objectSize);
    }

    if (objectData.name === 'Venus' && objectSize > 0 && !isNaN(objectSize)) {
      // Add Venus' thick cloud layer
      addVenusClouds(objectMesh, objectSize);
    }

    if (objectData.name === 'Uranus' && objectSize > 0 && !isNaN(objectSize)) {
      // Add Uranus' extreme axial tilt
      addUranusTilt(objectMesh);
    }

    if (objectData.name === 'Neptune' && objectSize > 0 && !isNaN(objectSize)) {
      // Add Neptune's deep blue color and atmospheric bands
      addNeptuneFeatures(objectMesh, objectSize);
    }

    if (objectData.name === 'Earth' && objectSize > 0 && !isNaN(objectSize)) {
      // Add Earth's distinctive features: oceans, continents, clouds, and ice caps
      addEarthFeatures(objectMesh, objectSize);
    }

    if (objectData.name === 'Mercury' && objectSize > 0 && !isNaN(objectSize)) {
      // Add Mercury's cratered surface
      addMercuryFeatures(objectMesh, objectSize);
    }

    // Add bright glow for interstellar objects
    if (objectData.type === 'interstellar' && objectSize > 0 && !isNaN(objectSize)) {
      // Add multiple glow layers for high visibility
      const glowRadius1 = objectSize * 2.0;
      const glowGeometry1 = new THREE.SphereGeometry(glowRadius1, 32, 32);
      const glowMaterial1 = new THREE.MeshBasicMaterial({
        color: objectColor,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide
      });
      const glow1 = new THREE.Mesh(glowGeometry1, glowMaterial1);
      objectMesh.add(glow1);

      const glowRadius2 = objectSize * 3.0;
      const glowGeometry2 = new THREE.SphereGeometry(glowRadius2, 32, 32);
      const glowMaterial2 = new THREE.MeshBasicMaterial({
        color: objectColor,
        transparent: true,
        opacity: 0.4,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide
      });
      const glow2 = new THREE.Mesh(glowGeometry2, glowMaterial2);
      objectMesh.add(glow2);
      
      console.log(`✨ Added glow effect to ${objectData.name}`);
    }

    // Add comet tails for comets and interstellar objects
    // Skip 'Oumuamua (not a comet, doesn't outgas)
    if ((objectData.type === 'comet' || objectData.type === 'interstellar') && 
        objectSize > 0 && 
        !isNaN(objectSize) &&
        objectData.name !== "1I/'Oumuamua") {
      // Add comet tail that points away from the Sun
      addCometTail(objectMesh, objectSize, objectColor, objectData.name);
      
      // Add debris trail for fragmenting objects (3I/ATLAS)
      if (objectData.hasAnomalousTail && objectData.name === '3I/ATLAS') {
        addDebrisTrail(objectMesh, objectSize);
      }
    }

    // Create CSS2D label (only for planets and notable objects)
    const shouldShowLabel = objectData.type === 'planet' || 
                           ['Ceres', 'Vesta', "Halley's Comet", 'Apophis', "1I/'Oumuamua", '3I/ATLAS', 'C/2025 A6 (Lemmon)', 'C/2025 R2 (SWAN)'].includes(objectData.name);
    
    if (shouldShowLabel) {
      const labelDiv = document.createElement('div');
      labelDiv.className = 'celestial-label';
      
      // Add warning symbol for objects with high uncertainty or anomalous behavior
      let labelText = objectData.name;
      if (objectData.name === '3I/ATLAS') {
        labelText = '⚠️ ' + objectData.name + ' (fragmenting?)';
      }
      
      // Add time-to-perihelion for active comets
      if (objectData.type === 'comet' && !objectData.hyperbolic) {
        const perihelionInfo = calculateTimeToPerihelion(objectData, currentTime);
        if (perihelionInfo) {
          const days = Math.abs(Math.round(perihelionInfo.daysToPerihelion));
          const years = (days / 365.25).toFixed(1);
          
          if (days < 365) {
            // Less than 1 year - show in days
            labelText += `\n${perihelionInfo.isApproaching ? '→' : '←'} ${days}d to perihelion`;
          } else if (days < 3650) {
            // 1-10 years - show in years
            labelText += `\n${perihelionInfo.isApproaching ? '→' : '←'} ${years}y to perihelion`;
          }
          // Don't show for very long periods (>10 years)
        }
      }
      
      labelDiv.textContent = labelText;
      labelDiv.style.whiteSpace = 'pre'; // Allow newlines to work
      
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
      const labelOffset = (objectSize > 0 && !isNaN(objectSize)) ? objectSize + 0.5 : 1.0;
      label.position.set(0, labelOffset, 0);
      label.visible = showLabels;
      objectMesh.add(label);
      labelsRef.current.set(objectData.name, label);
    }
  });
}

function getEllipticalOrbitGeometry(a: number, e: number): THREE.BufferGeometry {
  // Validate input parameters
  if (!a || isNaN(a) || a <= 0) {
    console.warn('Invalid semi-major axis for orbit:', a);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0], 3));
    return geometry;
  }
  
  if (isNaN(e) || e < 0 || e >= 1) {
    console.warn('Invalid eccentricity for orbit:', e);
    e = 0; // Default to circular orbit
  }
  
  const numSegments = e > 0.8 ? 4000 : 2000;
  const vertices: number[] = [];
  const b = a * Math.sqrt(1 - e * e);
  
  // Apply AU scale for visibility
  const scaledA = a * AU_SCALE;
  const scaledB = b * AU_SCALE;
  
  // Validate scaled values
  if (isNaN(scaledA) || isNaN(scaledB)) {
    console.warn('NaN detected in orbit scaling:', { a, e, scaledA, scaledB });
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0], 3));
    return geometry;
  }
  
  let prevX = 0;
  let prevZ = 0;
  
  for (let i = 0; i <= numSegments; i++) {
    const E = (i / numSegments) * 2 * Math.PI;
    const x = scaledA * (Math.cos(E) - e);
    const z = scaledB * Math.sin(E);
    
    // Validate calculated positions
    if (isNaN(x) || isNaN(z)) {
      continue; // Skip invalid vertices
    }
    
    if (i > 0) {
      vertices.push(prevX, 0, prevZ);
      vertices.push(x, 0, z);
    }
    
    prevX = x;
    prevZ = z;
  }
  
  const geometry = new THREE.BufferGeometry();
  if (vertices.length > 0) {
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  } else {
    // Fallback to a single point if no valid vertices
    geometry.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0], 3));
  }
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
  const anomaly = solveKepler(elements.e, M);

  let r, cos_f, sin_f;

  if (elements.e > 1) {
    // Hyperbolic orbit
    const H = anomaly; // Hyperbolic eccentric anomaly
    const cosh_H = Math.cosh(H);
    const sinh_H = Math.sinh(H);

    // Distance from focus (Sun)
    r = elements.a * (elements.e * cosh_H - 1);

    // True anomaly components
    cos_f = (cosh_H - elements.e) / (1 - elements.e * cosh_H);
    sin_f = Math.sqrt(elements.e*elements.e - 1) * sinh_H / (1 - elements.e * cosh_H);
  } else {
    // Elliptical orbit
    const E = anomaly; // Eccentric anomaly
    const cos_E = Math.cos(E);
    const sin_E = Math.sin(E);

    // Distance from focus (Sun)
    r = elements.a * (1 - elements.e * cos_E);

    // True anomaly
    cos_f = (cos_E - elements.e) / (1 - elements.e * cos_E);
    sin_f = Math.sqrt(1 - elements.e*elements.e) * sin_E / (1 - elements.e * cos_E);
  }

  // Position in orbital plane (perifocal coordinates)
  const x = r * cos_f;
  const y = r * sin_f;

  const xEcl = (Math.cos(omega) * Math.cos(elements.o) - Math.sin(omega) * Math.sin(elements.o) * Math.cos(elements.i)) * x +
               (-Math.sin(omega) * Math.cos(elements.o) - Math.cos(omega) * Math.sin(elements.o) * Math.cos(elements.i)) * y;

  const yEcl = (Math.cos(omega) * Math.sin(elements.o) + Math.sin(omega) * Math.cos(elements.o) * Math.cos(elements.i)) * x +
               (-Math.sin(omega) * Math.sin(elements.o) + Math.cos(omega) * Math.cos(elements.o) * Math.cos(elements.i)) * y;

  const zEcl = Math.sin(omega) * Math.sin(elements.i) * x + Math.cos(omega) * Math.sin(elements.i) * y;

  // Apply AU scale for visibility - correct coordinate mapping for THREE.js
  const scaledX = xEcl * AU_SCALE;
  const scaledY = zEcl * AU_SCALE;  // Z becomes Y (up/down)
  const scaledZ = -yEcl * AU_SCALE;  // Y becomes -Z (forward/back)

  // Validate coordinates - return safe defaults if NaN
  if (isNaN(scaledX) || isNaN(scaledY) || isNaN(scaledZ)) {
    console.warn('NaN detected in planet position calculation for:', elements.name, { xEcl, yEcl, zEcl, r, cos_f, sin_f });
    return { x: 0, y: 0, z: 0 }; // Safe fallback position
  }

  return {
    x: scaledX,
    y: scaledY,
    z: scaledZ
  };
}

// Update planet positions in real-time
function updatePlanetPositions(
  currentTime: number,
  planetsRef: React.MutableRefObject<Map<string, THREE.Mesh>>, // Changed to Mesh
  orbitalData: CelestialObject[]
) {
  // Validate orbital data before proceeding
  if (!orbitalData || orbitalData.length === 0) {
    return; // Silently skip if data not loaded yet
  }

  // Use orbital data from API
  orbitalData.forEach((objectData) => {
    const object = planetsRef.current.get(objectData.name);
    if (!object) return;

    // Recalculate orbital elements for current time
    const elements = updateMeanElements(currentTime, objectData);
    
    // Get new position
    const position = getPlanetPosition(currentTime, elements);
    
    // Update object position
    object.position.set(position.x, position.y, position.z);
    
    // Update comet tail direction to point away from Sun
    if (objectData.type === 'comet' || objectData.type === 'interstellar') {
      // Check if this object has an anomalous tail (fragmenting)
      const hasAnomalousTail = (objectData as CelestialObject).hasAnomalousTail || false;
      updateCometTailDirection(object, hasAnomalousTail);
    }
    
    // Update label position if it exists (for labeled objects)
    const shouldHaveLabel = objectData.type === 'planet' || 
                           ['Ceres', 'Vesta', "Halley's Comet", 'Apophis', "1I/'Oumuamua", '3I/ATLAS', 'C/2025 A6 (Lemmon)', 'C/2025 R2 (SWAN)'].includes(objectData.name);
    if (shouldHaveLabel) {
      // Get size for label offset
      let objectSize = 0.1;
      switch (objectData.type) {
        case 'planet':
          const planetSizes: { [key: string]: number } = { Mercury: 0.15, Venus: 0.35, Earth: 0.38, Mars: 0.20, Jupiter: 1.2, Saturn: 1.0, Uranus: 1.5, Neptune: 1.4 };
          objectSize = planetSizes[objectData.name] || 0.3;
          break;
        case 'asteroid':
          const asteroidSizes: { [key: string]: number } = { Ceres: 0.08, Vesta: 0.06, Pallas: 0.05, Hygiea: 0.04, Eunomia: 0.03, Juno: 0.03, default: 0.02 };
          objectSize = asteroidSizes[objectData.name] || asteroidSizes.default;
          break;
        case 'comet':
          const cometSizes: { [key: string]: number } = { "Halley's Comet": 0.04, "Hale-Bopp": 0.06, "1I/'Oumuamua": 0.02, "2I/Borisov": 0.03, "3I/ATLAS": 0.025, "C/2025 A6 (Lemmon)": 0.035, "C/2025 R2 (SWAN)": 0.035, default: 0.03 };
          objectSize = cometSizes[objectData.name] || cometSizes.default;
          break;
        case 'neo':
        case 'interstellar':
          const neoSizes: { [key: string]: number } = { Apophis: 0.025, Ryugu: 0.030, default: 0.020 };
          objectSize = neoSizes[objectData.name] || neoSizes.default;
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
  // Handle hyperbolic orbits (e > 1)
  if (e > 1) {
    // For hyperbolic orbits, solve M = e * sinh(H) - H
    let H: number;
    if (Math.abs(M) < 1e-8) {
      H = 0; // When M is very close to 0, H should be 0
    } else if (M > 0) {
      H = Math.log(2 * M / e + 1.8); // Better initial guess for positive M
    } else {
      H = -Math.log(-2 * M / e + 1.8); // Better initial guess for negative M
    }
    
    const threshold = 1e-8;
    
    for (let i = 0; i < 100; i++) {
      const f = e * Math.sinh(H) - H - M;
      const df = e * Math.cosh(H) - 1;
      
      if (Math.abs(df) < 1e-10) break;
      
      const dH = -f / df;
      H += dH;
      
      if (Math.abs(dH) <= threshold) break;
    }
    
    return H; // Return hyperbolic eccentric anomaly
  } else {
    // Elliptical orbit case (e < 1)
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

// ============================================================================
// Special Planet Features
// ============================================================================

function addSaturnRings(saturnMesh: THREE.Mesh, planetSize: number) {
  // Validate planetSize
  if (!planetSize || planetSize <= 0 || isNaN(planetSize)) {
    console.warn('Invalid planetSize for Saturn rings:', planetSize);
    return;
  }

  // Create multiple ring layers for realistic appearance
  const ringData = [
    { innerRadius: planetSize * 1.2, outerRadius: planetSize * 1.8, color: 0xD4AF37, opacity: 0.9 }, // Main bright ring
    { innerRadius: planetSize * 1.8, outerRadius: planetSize * 2.2, color: 0xC0C0C0, opacity: 0.7 }, // Middle ring
    { innerRadius: planetSize * 2.2, outerRadius: planetSize * 2.5, color: 0x8B7355, opacity: 0.5 }, // Outer faint ring
  ];

  ringData.forEach((ring, index) => {
    // Ensure valid ring dimensions
    if (ring.innerRadius >= ring.outerRadius || ring.innerRadius <= 0) {
      console.warn('Invalid ring dimensions for Saturn:', ring);
      return;
    }

    const ringGeometry = new THREE.RingGeometry(ring.innerRadius, ring.outerRadius, 64);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: ring.color,
      transparent: true,
      opacity: ring.opacity,
      side: THREE.DoubleSide,
      blending: THREE.NormalBlending
    });

    const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);

    // Tilt the rings at Saturn's axial tilt (about 27 degrees)
    ringMesh.rotation.x = Math.PI / 2; // Lay flat
    ringMesh.rotation.z = deg2rad(27); // Saturn's ring tilt

    saturnMesh.add(ringMesh);
  });

  console.log('✅ Added Saturn\'s ring system');
}

function addJupiterFeatures(jupiterMesh: THREE.Mesh, planetSize: number) {
  // Validate planetSize
  if (!planetSize || planetSize <= 0 || isNaN(planetSize)) {
    console.warn('Invalid planetSize for Jupiter features:', planetSize);
    return;
  }

  // Add Jupiter's Great Red Spot
  const spotRadius = planetSize * 0.15;
  if (spotRadius <= 0) {
    console.warn('Invalid spot radius for Jupiter:', spotRadius);
    return;
  }

  const spotGeometry = new THREE.SphereGeometry(spotRadius, 16, 16);
  const spotMaterial = new THREE.MeshBasicMaterial({
    color: 0x8B0000, // Dark red
    transparent: true,
    opacity: 0.8
  });

  const redSpot = new THREE.Mesh(spotGeometry, spotMaterial);
  // Position the Great Red Spot at Jupiter's southern hemisphere
  redSpot.position.set(planetSize * 0.7, -planetSize * 0.3, planetSize * 0.5);
  jupiterMesh.add(redSpot);

  // Add equatorial stripe pattern (simplified)
  const stripeMajorRadius = planetSize * 1.01;
  const stripeMinorRadius = planetSize * 0.05;

  if (stripeMajorRadius <= 0 || stripeMinorRadius <= 0) {
    console.warn('Invalid stripe dimensions for Jupiter:', { stripeMajorRadius, stripeMinorRadius });
    return;
  }

  const stripeGeometry = new THREE.TorusGeometry(stripeMajorRadius, stripeMinorRadius, 8, 64);
  const stripeMaterial = new THREE.MeshBasicMaterial({
    color: 0x8B4513, // Saddle brown for darker stripes
    transparent: true,
    opacity: 0.6
  });

  const stripe = new THREE.Mesh(stripeGeometry, stripeMaterial);
  stripe.rotation.x = Math.PI / 2; // Rotate to be equatorial
  jupiterMesh.add(stripe);

  // Add another stripe
  const stripe2 = new THREE.Mesh(stripeGeometry, stripeMaterial.clone());
  stripe2.rotation.x = Math.PI / 2;
  stripe2.position.y = planetSize * 0.2; // Offset for multiple stripes
  stripe2.material.opacity = 0.4;
  jupiterMesh.add(stripe2);

  console.log('✅ Added Jupiter\'s Great Red Spot and equatorial stripes');
}

function addMarsIceCaps(marsMesh: THREE.Mesh, planetSize: number) {
  // Validate planetSize
  if (!planetSize || planetSize <= 0 || isNaN(planetSize)) {
    console.warn('Invalid planetSize for Mars ice caps:', planetSize);
    return;
  }

  // Add polar ice caps at north and south poles
  const iceCapRadius = planetSize * 0.3;
  if (iceCapRadius <= 0) {
    console.warn('Invalid ice cap radius for Mars:', iceCapRadius);
    return;
  }

  const iceCapGeometry = new THREE.SphereGeometry(iceCapRadius, 16, 16);
  const iceCapMaterial = new THREE.MeshBasicMaterial({
    color: 0xFFFFFF, // White ice
    transparent: true,
    opacity: 0.9
  });

  // North pole ice cap
  const northIce = new THREE.Mesh(iceCapGeometry, iceCapMaterial);
  northIce.position.set(0, planetSize * 0.8, 0);
  northIce.scale.set(1, 0.3, 1); // Flatten it
  marsMesh.add(northIce);

  // South pole ice cap
  const southIce = new THREE.Mesh(iceCapGeometry, iceCapMaterial.clone());
  southIce.position.set(0, -planetSize * 0.8, 0);
  southIce.scale.set(1, 0.3, 1); // Flatten it
  marsMesh.add(southIce);

  console.log('✅ Added Mars\' polar ice caps');
}

function addVenusClouds(venusMesh: THREE.Mesh, planetSize: number) {
  // Validate planetSize
  if (!planetSize || planetSize <= 0 || isNaN(planetSize)) {
    console.warn('Invalid planetSize for Venus clouds:', planetSize);
    return;
  }

  // Add thick cloud layer completely obscuring the surface
  const cloudRadius = planetSize * 1.05;
  if (cloudRadius <= 0) {
    console.warn('Invalid cloud radius for Venus:', cloudRadius);
    return;
  }

  const cloudGeometry = new THREE.SphereGeometry(cloudRadius, 32, 32);
  const cloudMaterial = new THREE.MeshStandardMaterial({
    color: 0xFFFACD, // Lemon chiffon (yellowish clouds)
    transparent: true,
    opacity: 0.95,
    roughness: 1.0,
    metalness: 0.0
  });

  const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
  venusMesh.add(clouds);

  // Add swirling cloud patterns
  const swirlMajorRadius = planetSize * 1.02;
  const swirlMinorRadius = planetSize * 0.1;

  if (swirlMajorRadius <= 0 || swirlMinorRadius <= 0) {
    console.warn('Invalid swirl dimensions for Venus:', { swirlMajorRadius, swirlMinorRadius });
    return;
  }

  const swirlGeometry = new THREE.TorusGeometry(swirlMajorRadius, swirlMinorRadius, 8, 32);
  const swirlMaterial = new THREE.MeshBasicMaterial({
    color: 0xF0E68C, // Khaki
    transparent: true,
    opacity: 0.6
  });

  const swirl1 = new THREE.Mesh(swirlGeometry, swirlMaterial);
  swirl1.rotation.x = Math.PI / 3;
  venusMesh.add(swirl1);

  const swirl2 = new THREE.Mesh(swirlGeometry, swirlMaterial.clone());
  swirl2.rotation.x = -Math.PI / 4;
  swirl2.rotation.y = Math.PI / 2;
  venusMesh.add(swirl2);

  console.log('✅ Added Venus\' thick cloud layer and swirling patterns');
}

function addNeptuneFeatures(neptuneMesh: THREE.Mesh, planetSize: number) {
  // Validate planetSize
  if (!planetSize || planetSize <= 0 || isNaN(planetSize)) {
    console.warn('Invalid planetSize for Neptune features:', planetSize);
    return;
  }

  // Add bright outer glow for visibility
  const glowRadius = planetSize * 1.15;
  const glowGeometry = new THREE.SphereGeometry(glowRadius, 32, 32);
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: 0x416FE1, // Bright deep blue
    transparent: true,
    opacity: 0.9, // Almost fully opaque!
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide
  });
  const outerGlow = new THREE.Mesh(glowGeometry, glowMaterial);
  neptuneMesh.add(outerGlow);

  // Add a second even brighter glow layer
  const glowRadius2 = planetSize * 1.25;
  const glowGeometry2 = new THREE.SphereGeometry(glowRadius2, 32, 32);
  const glowMaterial2 = new THREE.MeshBasicMaterial({
    color: 0x5B8FE8, // Even brighter blue
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide
  });
  const outerGlow2 = new THREE.Mesh(glowGeometry2, glowMaterial2);
  neptuneMesh.add(outerGlow2);

  // Make Neptune's atmosphere deeper blue
  const atmosphereRadius = planetSize * 1.08;
  if (atmosphereRadius <= 0) {
    console.warn('Invalid atmosphere radius for Neptune:', atmosphereRadius);
    return;
  }

  const atmosphereGeometry = new THREE.SphereGeometry(atmosphereRadius, 32, 32);
  const atmosphereMaterial = new THREE.MeshBasicMaterial({
    color: 0x4169E1, // Royal blue
    transparent: true,
    opacity: 0.8, // Increased from 0.6
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide
  });

  const deepAtmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
  neptuneMesh.add(deepAtmosphere);

  // Add atmospheric bands
  const bandMajorRadius = planetSize * 1.01;
  const bandMinorRadius = planetSize * 0.03;

  if (bandMajorRadius <= 0 || bandMinorRadius <= 0) {
    console.warn('Invalid band dimensions for Neptune:', { bandMajorRadius, bandMinorRadius });
    return;
  }

  const bandGeometry = new THREE.TorusGeometry(bandMajorRadius, bandMinorRadius, 6, 32);
  const bandMaterial = new THREE.MeshBasicMaterial({
    color: 0x5B8FE8, // Bright royal blue
    transparent: true,
    opacity: 0.7
  });

  const band1 = new THREE.Mesh(bandGeometry, bandMaterial);
  band1.rotation.x = Math.PI / 2;
  neptuneMesh.add(band1);

  const band2 = new THREE.Mesh(bandGeometry, bandMaterial.clone());
  band2.rotation.x = Math.PI / 2;
  band2.position.y = planetSize * 0.15;
  band2.material.opacity = 0.5;
  neptuneMesh.add(band2);

  console.log('✅ Added Neptune\'s bright blue atmosphere and glowing aura');
}

function addUranusTilt(uranusMesh: THREE.Mesh) {
  // Uranus has extreme axial tilt of about 98 degrees
  uranusMesh.rotation.z = deg2rad(98); // Extreme sideways tilt

  // Get planet size from geometry
  const geometry = uranusMesh.geometry as THREE.SphereGeometry;
  const planetSize = geometry.parameters?.radius || 0.6;

  // Add bright outer glow for visibility
  const glowRadius = planetSize * 1.15;
  const glowGeometry = new THREE.SphereGeometry(glowRadius, 32, 32);
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: 0x00FFFF, // Bright cyan
    transparent: true,
    opacity: 0.9, // Almost fully opaque!
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide
  });
  const outerGlow = new THREE.Mesh(glowGeometry, glowMaterial);
  uranusMesh.add(outerGlow);

  // Add a second even brighter glow layer
  const glowRadius2 = planetSize * 1.25;
  const glowGeometry2 = new THREE.SphereGeometry(glowRadius2, 32, 32);
  const glowMaterial2 = new THREE.MeshBasicMaterial({
    color: 0x4FD8EB, // Bright cyan-blue
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide
  });
  const outerGlow2 = new THREE.Mesh(glowGeometry2, glowMaterial2);
  uranusMesh.add(outerGlow2);

  // Add inner atmospheric glow
  const atmosphereRadius = planetSize * 1.08;
  const atmosphereGeometry = new THREE.SphereGeometry(atmosphereRadius, 32, 32);
  const atmosphereMaterial = new THREE.MeshBasicMaterial({
    color: 0x4FD8EB, // Bright cyan
    transparent: true,
    opacity: 0.8, // Increased from 0.6
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide
  });
  const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
  uranusMesh.add(atmosphere);

  console.log('✅ Added Uranus\' extreme axial tilt and bright cyan glow');
}

function addEarthFeatures(earthMesh: THREE.Mesh, planetSize: number) {
  // Validate planetSize
  if (!planetSize || planetSize <= 0 || isNaN(planetSize)) {
    console.warn('Invalid planetSize for Earth features:', planetSize);
    return;
  }

  // Load texture loader for overlays
  const textureLoader = new THREE.TextureLoader();
  
  // Add subtle overlay using Earth.png for enhanced detail only
  const overlayRadius = planetSize * 1.003; // Very close to surface
  if (overlayRadius > 0) {
    const overlayGeometry = new THREE.SphereGeometry(overlayRadius, 32, 32);
    textureLoader.load(
      '/Earth.png',
      (texture) => {
        const overlayMaterial = new THREE.MeshStandardMaterial({
          map: texture,
          transparent: true,
          opacity: 0.15, // Very subtle overlay - just for detail enhancement
          blending: THREE.NormalBlending, // Normal blending instead of additive
          side: THREE.FrontSide,
          depthWrite: false
        });
        const overlay = new THREE.Mesh(overlayGeometry, overlayMaterial);
        earthMesh.add(overlay);
        console.log('🌍 Earth detail overlay (Earth.png) applied - subtle enhancement');
      },
      undefined,
      (error) => {
        console.warn('Failed to load Earth.png overlay:', error);
      }
    );
  }

  // Add polar ice caps with bright white material
  const iceCapRadius = planetSize * 0.25;
  if (iceCapRadius <= 0) {
    console.warn('Invalid ice cap radius for Earth:', iceCapRadius);
    return;
  }

  const iceCapGeometry = new THREE.SphereGeometry(iceCapRadius, 16, 16);
  const iceCapMaterial = new THREE.MeshBasicMaterial({
    color: 0xFFFFFF, // White ice
    transparent: true,
    opacity: 0.6, // More subtle ice caps
    blending: THREE.NormalBlending
  });

  // North pole ice cap
  const northIce = new THREE.Mesh(iceCapGeometry, iceCapMaterial);
  northIce.position.set(0, planetSize * 0.85, 0);
  northIce.scale.set(1, 0.4, 1); // Flatten it
  earthMesh.add(northIce);

  // South pole ice cap
  const southIce = new THREE.Mesh(iceCapGeometry, iceCapMaterial.clone());
  southIce.position.set(0, -planetSize * 0.85, 0);
  southIce.scale.set(1, 0.4, 1); // Flatten it
  earthMesh.add(southIce);

  // Add cloud layer with subtle white material
  const cloudRadius = planetSize * 1.015;
  if (cloudRadius <= 0) {
    console.warn('Invalid cloud radius for Earth:', cloudRadius);
    return;
  }

  const cloudGeometry = new THREE.SphereGeometry(cloudRadius, 32, 32);
  const cloudMaterial = new THREE.MeshBasicMaterial({
    color: 0xFFFFFF, // Bright white clouds
    transparent: true,
    opacity: 0.15, // Very subtle clouds
    blending: THREE.NormalBlending
  });

  const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
  earthMesh.add(clouds);

  // Add atmospheric glow with deep blue color
  const atmosphereRadius = planetSize * 1.08;
  if (atmosphereRadius <= 0) {
    console.warn('Invalid atmosphere radius for Earth:', atmosphereRadius);
    return;
  }

  const atmosphereGeometry = new THREE.SphereGeometry(atmosphereRadius, 32, 32);
  const atmosphereMaterial = new THREE.MeshBasicMaterial({
    color: 0x1E90FF, // Deep dodger blue atmosphere
    transparent: true,
    opacity: 0.25, // Subtle atmospheric glow
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide
  });

  const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
  earthMesh.add(atmosphere);

  console.log('✅ Added Earth\'s features: vibrant blue oceans, white polar ice caps, subtle clouds, and deep blue atmospheric glow');
}

function addMercuryFeatures(mercuryMesh: THREE.Mesh, planetSize: number) {
  // Validate planetSize
  if (!planetSize || planetSize <= 0 || isNaN(planetSize)) {
    console.warn('Invalid planetSize for Mercury features:', planetSize);
    return;
  }

  // Add large impact craters to Mercury's surface
  const craterData = [
    { radius: planetSize * 0.15, depth: 0.1, position: { x: planetSize * 0.6, y: planetSize * 0.3, z: 0 } },
    { radius: planetSize * 0.12, depth: 0.08, position: { x: -planetSize * 0.5, y: planetSize * 0.4, z: planetSize * 0.2 } },
    { radius: planetSize * 0.1, depth: 0.06, position: { x: planetSize * 0.2, y: -planetSize * 0.5, z: planetSize * 0.3 } },
    { radius: planetSize * 0.08, depth: 0.05, position: { x: -planetSize * 0.3, y: -planetSize * 0.2, z: -planetSize * 0.4 } },
    { radius: planetSize * 0.06, depth: 0.04, position: { x: 0, y: planetSize * 0.7, z: -planetSize * 0.1 } },
  ];

  craterData.forEach((crater, index) => {
    if (crater.radius <= 0) {
      console.warn('Invalid crater radius for Mercury:', crater);
      return;
    }

    // Create crater as a dark gray depression
    const craterGeometry = new THREE.SphereGeometry(crater.radius, 16, 16);
    const craterMaterial = new THREE.MeshBasicMaterial({
      color: 0x2F2F2F, // Dark gray for crater floor
      transparent: true,
      opacity: 0.9
    });

    const craterMesh = new THREE.Mesh(craterGeometry, craterMaterial);
    craterMesh.position.set(crater.position.x, crater.position.y, crater.position.z);
    craterMesh.scale.set(1, crater.depth, 1); // Flatten to create depression
    mercuryMesh.add(craterMesh);

    // Add crater rim (raised edge)
    const rimGeometry = new THREE.TorusGeometry(crater.radius * 1.2, crater.radius * 0.1, 8, 16);
    const rimMaterial = new THREE.MeshBasicMaterial({
      color: 0x696969, // Dim gray for rim
      transparent: true,
      opacity: 0.7
    });

    const rim = new THREE.Mesh(rimGeometry, rimMaterial);
    rim.position.set(crater.position.x, crater.position.y, crater.position.z);
    rim.rotation.x = Math.PI / 2;
    mercuryMesh.add(rim);
  });

  console.log('✅ Added Mercury\'s heavily cratered surface');
}

// ============================================================================
// Time to Perihelion Calculation
// ============================================================================

// Calculate time until comet reaches perihelion (closest approach to Sun)
function calculateTimeToPerihelion(
  objectData: CelestialObject,
  currentTime: number
): { daysToPerihelion: number; isApproaching: boolean } | null {
  // Only calculate for comets with elliptical orbits (not interstellar objects)
  if (objectData.type !== 'comet' || objectData.hyperbolic) {
    return null;
  }

  const T = currentTime; // milliseconds since epoch
  const JD = 2451545.0 + T / 86400000.0; // Convert to Julian Date
  const centuries = (JD - 2451545.0) / 36525.0; // Centuries since J2000

  // Calculate current orbital elements
  const a = objectData.a0 + objectData.ad * centuries; // AU
  const mld = objectData.mld; // Mean longitude derivative (degrees/century)
  
  // Calculate orbital period in days
  const orbitalPeriodDays = (360.0 / mld) * 36525.0; // days
  
  // Calculate mean anomaly at current time
  const ml0 = objectData.ml0; // Mean longitude at epoch
  const ml = ml0 + mld * centuries; // Current mean longitude
  const lp = objectData.lp0 + objectData.lpd * centuries; // Longitude of perihelion
  const M = ((ml - lp) % 360 + 360) % 360; // Mean anomaly (0-360)
  
  // Mean anomaly = 0 at perihelion, 180 at aphelion
  // Calculate days to next perihelion
  let daysToPerihelion: number;
  let isApproaching: boolean;
  
  if (M <= 180) {
    // Currently moving toward perihelion (first half of orbit)
    daysToPerihelion = (M / 360.0) * orbitalPeriodDays;
    isApproaching = true;
  } else {
    // Currently moving away from perihelion (second half of orbit)
    daysToPerihelion = ((360 - M) / 360.0) * orbitalPeriodDays;
    isApproaching = false;
  }
  
  // Actually, we want time TO perihelion from current position
  // M = 0 is at perihelion, so days to perihelion is:
  if (M <= 180) {
    // First half: approaching perihelion (from aphelion)
    daysToPerihelion = ((360 - M) / 360.0) * orbitalPeriodDays;
    isApproaching = true;
  } else {
    // Second half: moving away from perihelion (toward aphelion)
    daysToPerihelion = ((360 - M) / 360.0) * orbitalPeriodDays;
    isApproaching = false;
  }
  
  return { daysToPerihelion, isApproaching };
}

// ============================================================================
// Object Magnitude Calculation
// ============================================================================

// Calculate apparent magnitude from Earth based on distance, size, and albedo
function calculateApparentMagnitude(
  objectPos: THREE.Vector3,
  objectSize: number,
  objectType: CelestialObject['type'],
  earthPos: THREE.Vector3,
  sunPos: THREE.Vector3 = new THREE.Vector3(0, 0, 0)
): number {
  // Distance from Earth to object (in AU, THREE.js units are 10 = 1 AU)
  const distanceFromEarth = objectPos.distanceTo(earthPos) / AU_SCALE;
  
  // Distance from Sun to object (for phase angle calculation)
  const distanceFromSun = objectPos.distanceTo(sunPos) / AU_SCALE;
  
  // Albedo estimates by object type
  const albedoMap: { [key: string]: number } = {
    planet: 0.4,      // Average planetary albedo
    asteroid: 0.14,   // C-type asteroid
    comet: 0.04,      // Very dark, icy nucleus
    neo: 0.14,        // Similar to asteroids
    interstellar: 0.1 // Unknown, assume dark
  };
  
  const albedo = albedoMap[objectType] || 0.1;
  
  // Absolute magnitude calculation (H) - magnitude at 1 AU from both Sun and Earth
  // Using simplified formula: H = magnitude at 1 AU
  // Assume object size in THREE.js units relates to diameter
  const diameterKm = objectSize * 100; // Rough conversion for visualization
  const H = 5 * Math.log10(1329 / Math.sqrt(albedo * diameterKm));
  
  // Apparent magnitude calculation
  // m = H + 5*log10(distanceFromSun * distanceFromEarth)
  const apparentMagnitude = H + 5 * Math.log10(distanceFromSun * distanceFromEarth);
  
  return apparentMagnitude;
}

// Apply magnitude-based opacity to object material
function applyMagnitudeBasedVisibility(
  mesh: THREE.Mesh,
  magnitude: number
) {
  // Magnitude scale: lower = brighter
  // Visible to naked eye: ~6.5
  // Binoculars: ~10
  // Small telescope: ~13
  // We'll map this to opacity
  
  const material = mesh.material as THREE.MeshStandardMaterial;
  
  if (magnitude < 6.5) {
    // Bright - fully visible
    material.opacity = 1.0;
    material.transparent = false;
  } else if (magnitude < 10) {
    // Binocular range - reduce opacity
    const t = (magnitude - 6.5) / (10 - 6.5);
    material.opacity = 1.0 - (t * 0.3); // 1.0 to 0.7
    material.transparent = true;
  } else if (magnitude < 13) {
    // Telescope range - more faint
    const t = (magnitude - 10) / (13 - 10);
    material.opacity = 0.7 - (t * 0.4); // 0.7 to 0.3
    material.transparent = true;
  } else {
    // Very faint - barely visible
    material.opacity = 0.3;
    material.transparent = true;
  }
}

// ============================================================================
// Planetary Perturbations (N-Body Effects)
// ============================================================================

// Planetary masses in Earth masses (for gravitational calculations)
const PLANETARY_MASSES: { [key: string]: number } = {
  Mercury: 0.0553,
  Venus: 0.815,
  Earth: 1.0,
  Mars: 0.107,
  Jupiter: 317.8,
  Saturn: 95.2,
  Uranus: 14.5,
  Neptune: 17.1,
  Sun: 333000 // For reference, though Sun is at origin
};

// Calculate gravitational perturbation from one planet on another
function calculatePerturbation(
  targetPos: THREE.Vector3,
  targetMass: number,
  perturbingPos: THREE.Vector3,
  perturbingMass: number
): THREE.Vector3 {
  // Gravitational constant (scaled for our units)
  // In AU^3 / (Earth mass * day^2)
  const G = 0.0002959122; // Gaussian gravitational constant adjusted
  
  // Calculate distance vector from target to perturbing body
  const r = new THREE.Vector3().subVectors(perturbingPos, targetPos);
  const distance = r.length() / AU_SCALE; // Convert to AU
  
  // Avoid division by zero
  if (distance < 0.001) {
    return new THREE.Vector3(0, 0, 0);
  }
  
  // Calculate gravitational acceleration
  // a = G * M / r^2, direction toward perturbing body
  const acceleration = (G * perturbingMass) / (distance * distance);
  
  // Convert to vector (direction toward perturbing body)
  const perturbationVector = r.normalize().multiplyScalar(acceleration);
  
  // Scale back to THREE.js units
  perturbationVector.multiplyScalar(AU_SCALE);
  
  return perturbationVector;
}

// Apply N-body perturbations to planet positions
function applyPlanetaryPerturbations(
  planetsRef: React.MutableRefObject<Map<string, THREE.Mesh>>,
  timeStepDays: number = 1.0 / 24.0 // Default: 1 hour
) {
  // Calculate all perturbations
  const perturbations = new Map<string, THREE.Vector3>();
  
  // For each planet, calculate perturbations from all other planets
  planetsRef.current.forEach((targetPlanet, targetName) => {
    if (targetName === 'Sun') return; // Skip Sun
    
    const targetMass = PLANETARY_MASSES[targetName];
    if (!targetMass) return;
    
    let totalPerturbation = new THREE.Vector3(0, 0, 0);
    
    // Calculate perturbation from each other planet
    planetsRef.current.forEach((perturbingPlanet, perturbingName) => {
      if (perturbingName === targetName || perturbingName === 'Sun') return;
      
      const perturbingMass = PLANETARY_MASSES[perturbingName];
      if (!perturbingMass) return;
      
      const perturbation = calculatePerturbation(
        targetPlanet.position,
        targetMass,
        perturbingPlanet.position,
        perturbingMass
      );
      
      totalPerturbation.add(perturbation);
    });
    
    // Also include Sun's perturbation (most significant)
    const sunPos = new THREE.Vector3(0, 0, 0);
    const sunPerturbation = calculatePerturbation(
      targetPlanet.position,
      targetMass,
      sunPos,
      PLANETARY_MASSES.Sun
    );
    totalPerturbation.add(sunPerturbation);
    
    perturbations.set(targetName, totalPerturbation);
  });
  
  // Apply perturbations to planet positions
  // Using simple Euler integration: position += velocity * dt
  // velocity += acceleration * dt
  // For visualization, we apply a small correction directly to position
  const scaleFactor = timeStepDays * 0.0001; // Very small correction factor
  
  perturbations.forEach((perturbation, planetName) => {
    const planet = planetsRef.current.get(planetName);
    if (planet) {
      // Apply small positional correction
      planet.position.add(perturbation.multiplyScalar(scaleFactor));
    }
  });
}

// ============================================================================
// Comet Tail Rendering
// ============================================================================

function addCometTail(cometMesh: THREE.Mesh, cometSize: number, cometColor: number, cometName: string) {
  // Validate cometSize
  if (!cometSize || cometSize <= 0 || isNaN(cometSize)) {
    console.warn('Invalid cometSize for comet tail:', cometSize);
    return;
  }

  // Comet tail parameters - scale based on comet size
  const tailLength = cometSize * 15; // Tail length (very long, ~15x comet size)
  const tailWidth = cometSize * 0.8; // Tail width at base
  
  // Create tail geometry using a cone (points away from Sun)
  // The tail will be positioned and rotated dynamically to point away from Sun
  const tailGeometry = new THREE.ConeGeometry(tailWidth, tailLength, 16, 1, true);
  
  // Rotate cone to point in +X direction initially (will be rotated toward Sun direction)
  tailGeometry.rotateZ(-Math.PI / 2);
  
  // Create gradient material for realistic tail appearance
  const tailMaterial = new THREE.MeshBasicMaterial({
    color: cometColor,
    transparent: true,
    opacity: 0.4, // Semi-transparent for wispy appearance
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending, // Additive blending for glow effect
    depthWrite: false // Don't write to depth buffer for proper transparency
  });
  
  const tail = new THREE.Mesh(tailGeometry, tailMaterial);
  tail.name = 'cometTail';
  
  // Position tail to start at comet surface
  tail.position.set(cometSize * 0.5, 0, 0);
  
  cometMesh.add(tail);
  
  // Add ion tail (bluish, narrower, longer)
  const ionTailLength = tailLength * 1.5;
  const ionTailWidth = tailWidth * 0.4;
  const ionTailGeometry = new THREE.ConeGeometry(ionTailWidth, ionTailLength, 12, 1, true);
  ionTailGeometry.rotateZ(-Math.PI / 2);
  
  const ionTailMaterial = new THREE.MeshBasicMaterial({
    color: 0x87CEEB, // Sky blue for ion tail
    transparent: true,
    opacity: 0.3,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  
  const ionTail = new THREE.Mesh(ionTailGeometry, ionTailMaterial);
  ionTail.name = 'ionTail';
  ionTail.position.set(cometSize * 0.5, 0, 0);
  
  cometMesh.add(ionTail);
  
  console.log(`✅ Added comet tail for ${cometName}`);
}

// Update comet tail direction to point away from the Sun
function updateCometTailDirection(cometMesh: THREE.Mesh, hasAnomalousTail: boolean = false) {
  // Get comet position in world coordinates
  const cometWorldPos = new THREE.Vector3();
  cometMesh.getWorldPosition(cometWorldPos);
  
  // Sun is at origin (0, 0, 0)
  const sunPos = new THREE.Vector3(0, 0, 0);
  
  // Calculate direction from Sun to comet (tail points this way normally)
  const direction = new THREE.Vector3().subVectors(cometWorldPos, sunPos).normalize();
  
  // For objects with anomalous tails (like fragmenting 3I/ATLAS), reverse the direction
  if (hasAnomalousTail) {
    direction.negate(); // Point toward Sun instead (fragmentation debris trail)
  }
  
  // Find the comet tail mesh
  const tail = cometMesh.children.find(child => child.name === 'cometTail');
  const ionTail = cometMesh.children.find(child => child.name === 'ionTail');
  
  if (tail) {
    // Calculate rotation to point tail away from Sun (or toward for anomalous)
    // Tail points in +X direction by default, so we need to rotate it
    const quaternion = new THREE.Quaternion();
    const targetDirection = new THREE.Vector3(1, 0, 0); // Default direction
    quaternion.setFromUnitVectors(targetDirection, direction);
    tail.quaternion.copy(quaternion);
  }
  
  if (ionTail) {
    // Ion tail is slightly offset and more aligned with solar wind
    const quaternion = new THREE.Quaternion();
    const targetDirection = new THREE.Vector3(1, 0, 0);
    quaternion.setFromUnitVectors(targetDirection, direction);
    ionTail.quaternion.copy(quaternion);
  }
}

// Add debris trail for fragmenting objects (like 3I/ATLAS)
function addDebrisTrail(cometMesh: THREE.Mesh, cometSize: number) {
  // Validate cometSize
  if (!cometSize || cometSize <= 0 || isNaN(cometSize)) {
    console.warn('Invalid cometSize for debris trail:', cometSize);
    return;
  }

  // Debris trail parameters - smaller, more scattered particles
  const numParticles = 200; // Number of debris particles
  const trailLength = cometSize * 20; // Trail extends behind the comet
  const trailSpread = cometSize * 5; // Perpendicular spread (cone shape)
  
  // Create particle positions
  const positions: number[] = [];
  
  for (let i = 0; i < numParticles; i++) {
    // Position along the tail (behind the comet in +X direction initially)
    const alongTail = (Math.random() * trailLength) + (cometSize * 0.5);
    
    // Random spread perpendicular to tail direction
    const perpSpread = (Math.random() - 0.5) * trailSpread * (alongTail / trailLength);
    const perpSpread2 = (Math.random() - 0.5) * trailSpread * (alongTail / trailLength);
    
    positions.push(alongTail, perpSpread, perpSpread2);
  }
  
  // Create particle geometry
  const debrisGeometry = new THREE.BufferGeometry();
  debrisGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  
  // Create particle material (orange-red for hot debris)
  const debrisMaterial = new THREE.PointsMaterial({
    color: 0xFF4500, // Orange-red color
    size: cometSize * 0.1,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true
  });
  
  const debrisParticles = new THREE.Points(debrisGeometry, debrisMaterial);
  debrisParticles.name = 'debrisTrail';
  
  cometMesh.add(debrisParticles);
  
  console.log(`✅ Added debris trail for fragmenting object`);
}

// ============================================================================
// Moon Systems Rendering
// ============================================================================

// Moon data for major planets
interface MoonData {
  name: string;
  radius: number; // Relative size
  distance: number; // Semi-major axis: Distance from planet in planet radii
  color: number;
  orbitalPeriod: number; // Days for one orbit
  eccentricity?: number; // Orbital eccentricity (0 = circular, >0 = elliptical)
  inclination?: number; // Orbital inclination in degrees (relative to planet's equator)
}

const MOON_SYSTEMS: { [planet: string]: MoonData[] } = {
  Earth: [
    { name: 'Moon', radius: 0.27, distance: 5, color: 0xC0C0C0, orbitalPeriod: 27.3, eccentricity: 0.0549, inclination: 5.14 }
  ],
  Mars: [
    { name: 'Phobos', radius: 0.08, distance: 3, color: 0x8B7355, orbitalPeriod: 0.32, eccentricity: 0.0151, inclination: 1.08 },
    { name: 'Deimos', radius: 0.06, distance: 6, color: 0x8B7355, orbitalPeriod: 1.26, eccentricity: 0.00033, inclination: 0.93 }
  ],
  Jupiter: [
    { name: 'Io', radius: 0.29, distance: 4, color: 0xFFD700, orbitalPeriod: 1.77, eccentricity: 0.0041, inclination: 0.05 },
    { name: 'Europa', radius: 0.25, distance: 6, color: 0xF0E68C, orbitalPeriod: 3.55, eccentricity: 0.0094, inclination: 0.47 },
    { name: 'Ganymede', radius: 0.42, distance: 10, color: 0xC0C0C0, orbitalPeriod: 7.15, eccentricity: 0.0013, inclination: 0.20 },
    { name: 'Callisto', radius: 0.38, distance: 15, color: 0x696969, orbitalPeriod: 16.69, eccentricity: 0.0074, inclination: 0.19 }
  ],
  Saturn: [
    { name: 'Titan', radius: 0.40, distance: 12, color: 0xFFA500, orbitalPeriod: 15.95, eccentricity: 0.0288, inclination: 0.35 },
    { name: 'Rhea', radius: 0.12, distance: 8, color: 0xD3D3D3, orbitalPeriod: 4.52, eccentricity: 0.0012, inclination: 0.35 },
    { name: 'Iapetus', radius: 0.12, distance: 20, color: 0x696969, orbitalPeriod: 79.33, eccentricity: 0.0283, inclination: 15.47 },
    { name: 'Dione', radius: 0.09, distance: 7, color: 0xE0E0E0, orbitalPeriod: 2.74, eccentricity: 0.0022, inclination: 0.02 }
  ],
  Uranus: [
    { name: 'Titania', radius: 0.12, distance: 8, color: 0xADD8E6, orbitalPeriod: 8.71, eccentricity: 0.0011, inclination: 0.34 },
    { name: 'Oberon', radius: 0.12, distance: 11, color: 0xB0C4DE, orbitalPeriod: 13.46, eccentricity: 0.0014, inclination: 0.10 }
  ],
  Neptune: [
    { name: 'Triton', radius: 0.21, distance: 8, color: 0xE6E6FA, orbitalPeriod: -5.88, eccentricity: 0.000016, inclination: 156.83 } // Negative = retrograde orbit, high inclination
  ]
};

// Moon orbital speed divisor - slows down moon orbits relative to planet orbits
// Higher values = slower moon orbits (more realistic for viewing)
const MOON_SPEED_DIVISOR = 74; // Moons orbit 50x slower than real-time scale

function addMoonSystems(
  scene: THREE.Scene,
  showMoons: boolean,
  moonsRef: React.MutableRefObject<Map<string, THREE.Mesh[]>>,
  planetsRef: React.MutableRefObject<Map<string, THREE.Mesh>>,
  currentTime: number
) {
  // Clear existing moons
  moonsRef.current.forEach((moonArray) => {
    moonArray.forEach((moon) => {
      scene.remove(moon);
    });
  });
  moonsRef.current.clear();

  if (!showMoons) {
    console.log('🌙 Moon systems hidden');
    return;
  }

  // Validate that planets exist before creating moons
  if (planetsRef.current.size === 0) {
    console.warn('⚠️ No planets loaded yet, skipping moon creation');
    return;
  }

  let totalMoons = 0;

  // Add moons for each planet
  Object.entries(MOON_SYSTEMS).forEach(([planetName, moons]) => {
    const planet = planetsRef.current.get(planetName);
    if (!planet) return;

    // Validate planet position before creating moons
    if (isNaN(planet.position.x) || isNaN(planet.position.y) || isNaN(planet.position.z)) {
      console.warn(`⚠️ Planet ${planetName} has NaN position, skipping moon creation`);
      return;
    }

    const planetMoons: THREE.Mesh[] = [];

    moons.forEach((moonData) => {
      // Calculate moon size relative to planet
      const geometry = planet.geometry as THREE.SphereGeometry;
      const planetRadius = geometry.parameters?.radius || 0.3;
      
      // Validate planet radius
      if (isNaN(planetRadius) || planetRadius <= 0) {
        console.warn(`⚠️ Planet ${planetName} has invalid radius, skipping moon ${moonData.name}`);
        return;
      }
      
      const moonRadius = planetRadius * moonData.radius;

      // Create moon geometry
      const moonGeometry = new THREE.SphereGeometry(moonRadius, 16, 16);
      const moonMaterial = new THREE.MeshStandardMaterial({
        color: moonData.color,
        emissive: moonData.color,
        emissiveIntensity: 0.1,
        metalness: 0.1,
        roughness: 0.9
      });

      const moon = new THREE.Mesh(moonGeometry, moonMaterial);
      moon.name = moonData.name;
      moon.castShadow = true;
      moon.receiveShadow = true;

      // Get orbital parameters (defaults for backward compatibility)
      const eccentricity = moonData.eccentricity ?? 0.0;
      const inclination = (moonData.inclination ?? 0.0) * (Math.PI / 180); // Convert to radians
      
      // Calculate mean anomaly (angle increases with time)
      const meanAnomaly = (currentTime / (moonData.orbitalPeriod * 86400000 * MOON_SPEED_DIVISOR)) * Math.PI * 2;
      
      // Calculate semi-major axis
      const semiMajorAxis = planetRadius * moonData.distance;
      
      // Calculate true anomaly from mean anomaly (using Newton-Raphson for eccentric anomaly)
      let eccentricAnomaly = meanAnomaly;
      for (let iter = 0; iter < 5; iter++) {
        eccentricAnomaly = meanAnomaly + eccentricity * Math.sin(eccentricAnomaly);
      }
      
      // Convert eccentric anomaly to true anomaly
      const trueAnomaly = 2 * Math.atan2(
        Math.sqrt(1 + eccentricity) * Math.sin(eccentricAnomaly / 2),
        Math.sqrt(1 - eccentricity) * Math.cos(eccentricAnomaly / 2)
      );
      
      // Calculate distance from planet using elliptical orbit formula
      const radius = semiMajorAxis * (1 - eccentricity * eccentricity) / (1 + eccentricity * Math.cos(trueAnomaly));
      
      // Calculate position in orbital plane (XZ plane initially)
      let moonX = radius * Math.cos(trueAnomaly);
      let moonY = 0;
      let moonZ = radius * Math.sin(trueAnomaly);
      
      // Apply orbital inclination (rotation around X axis)
      if (inclination !== 0) {
        const cosInc = Math.cos(inclination);
        const sinInc = Math.sin(inclination);
        const newY = moonY * cosInc - moonZ * sinInc;
        const newZ = moonY * sinInc + moonZ * cosInc;
        moonY = newY;
        moonZ = newZ;
      }
      
      // Translate to planet position
      moonX += planet.position.x;
      moonY += planet.position.y;
      moonZ += planet.position.z;

      // Validate calculated positions
      if (isNaN(moonX) || isNaN(moonY) || isNaN(moonZ)) {
        console.warn(`⚠️ Calculated NaN position for moon ${moonData.name}, skipping`);
        return;
      }

      moon.position.set(moonX, moonY, moonZ);
      
      // Apply tidal locking - moon always shows same face to planet
      // Calculate direction from moon to planet
      const moonToplanet = new THREE.Vector3().subVectors(planet.position, moon.position).normalize();
      
      // Create quaternion to rotate moon to face planet
      // Default forward direction is +Z, we want to point toward planet
      const defaultForward = new THREE.Vector3(0, 0, 1);
      const quaternion = new THREE.Quaternion();
      quaternion.setFromUnitVectors(defaultForward, moonToplanet);
      moon.quaternion.copy(quaternion);
      
      // Calculate lunar phase for Earth's Moon (Sun-Moon-Earth geometry)
      if (planetName === 'Earth' && moonData.name === 'Moon') {
        // Sun is at origin (0, 0, 0)
        const sunPos = new THREE.Vector3(0, 0, 0);
        const moonPos = new THREE.Vector3(moonX, moonY, moonZ);
        const earthPos = planet.position.clone();
        
        // Calculate Sun-Moon and Earth-Moon vectors
        const sunToMoon = new THREE.Vector3().subVectors(moonPos, sunPos).normalize();
        const earthToMoon = new THREE.Vector3().subVectors(moonPos, earthPos).normalize();
        
        // Calculate phase angle (dot product gives cosine of angle)
        const phaseAngle = sunToMoon.dot(earthToMoon);
        
        // Map phase angle to brightness (0 = new moon, 1 = full moon)
        // phaseAngle: -1 (opposite Sun) = full moon, +1 (aligned with Sun) = new moon
        const phaseBrightness = (1 - phaseAngle) / 2; // Maps [-1,1] to [1,0]
        
        // Update Moon's emissive intensity based on phase
        const moonMat = moon.material as THREE.MeshStandardMaterial;
        moonMat.emissiveIntensity = 0.1 + (phaseBrightness * 0.3); // Range: 0.1 (new) to 0.4 (full)
      }

      scene.add(moon);
      planetMoons.push(moon);
      totalMoons++;

      // Add moon orbit path (elliptical with inclination)
      const orbitGeometry = new THREE.BufferGeometry();
      const orbitPoints: number[] = [];
      const numSegments = 64;

      for (let i = 0; i <= numSegments; i++) {
        const theta = (i / numSegments) * Math.PI * 2;
        
        // Calculate elliptical orbit position
        const r = semiMajorAxis * (1 - eccentricity * eccentricity) / (1 + eccentricity * Math.cos(theta));
        let x = r * Math.cos(theta);
        let y = 0;
        let z = r * Math.sin(theta);
        
        // Apply orbital inclination
        if (inclination !== 0) {
          const cosInc = Math.cos(inclination);
          const sinInc = Math.sin(inclination);
          const newY = y * cosInc - z * sinInc;
          const newZ = y * sinInc + z * cosInc;
          y = newY;
          z = newZ;
        }
        
        // Translate to planet position
        x += planet.position.x;
        y += planet.position.y;
        z += planet.position.z;
        
        // Validate orbit points before adding
        if (!isNaN(x) && !isNaN(y) && !isNaN(z)) {
          orbitPoints.push(x, y, z);
        }
      }

      // Only create orbit line if we have valid points
      if (orbitPoints.length > 0) {
        orbitGeometry.setAttribute('position', new THREE.Float32BufferAttribute(orbitPoints, 3));
        const orbitMaterial = new THREE.LineBasicMaterial({
          color: 0x666666,
          opacity: 0.3,
          transparent: true
        });

        const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
        scene.add(orbitLine);
        // Store orbit line reference for cleanup (typed as Mesh for array compatibility)
        planetMoons.push(orbitLine as unknown as THREE.Mesh);
      }
    });

    moonsRef.current.set(planetName, planetMoons);
  });

  console.log(`🌙 Added ${totalMoons} moons for ${Object.keys(MOON_SYSTEMS).length} planets`);
}

// Update moon positions based on orbital motion
function updateMoonPositions(
  currentTime: number,
  moonsRef: React.MutableRefObject<Map<string, THREE.Mesh[]>>,
  planetsRef: React.MutableRefObject<Map<string, THREE.Mesh>>
) {
  // Validate that planets exist before updating moons
  if (planetsRef.current.size === 0) {
    return; // Silently skip if planets not loaded yet
  }
  Object.entries(MOON_SYSTEMS).forEach(([planetName, moons]) => {
    const planet = planetsRef.current.get(planetName);
    if (!planet) return;

    // Validate planet position
    if (isNaN(planet.position.x) || isNaN(planet.position.y) || isNaN(planet.position.z)) {
      console.warn(`⚠️ Planet ${planetName} has NaN position, skipping moon update`);
      return;
    }

    const planetMoons = moonsRef.current.get(planetName);
    if (!planetMoons) return;

    const geometry = planet.geometry as THREE.SphereGeometry;
    const planetRadius = geometry.parameters?.radius || 0.3;

    moons.forEach((moonData, index) => {
      const moon = planetMoons[index];
      if (!moon || !(moon instanceof THREE.Mesh)) return;

      // Get orbital parameters (defaults for backward compatibility)
      const eccentricity = moonData.eccentricity ?? 0.0;
      const inclination = (moonData.inclination ?? 0.0) * (Math.PI / 180); // Convert to radians
      
      // Calculate mean anomaly (angle increases with time)
      const meanAnomaly = (currentTime / (moonData.orbitalPeriod * 86400000 * MOON_SPEED_DIVISOR)) * Math.PI * 2;
      
      // Calculate semi-major axis
      const semiMajorAxis = planetRadius * moonData.distance;
      
      // Calculate true anomaly from mean anomaly (using Newton-Raphson for eccentric anomaly)
      let eccentricAnomaly = meanAnomaly;
      for (let iter = 0; iter < 5; iter++) {
        eccentricAnomaly = meanAnomaly + eccentricity * Math.sin(eccentricAnomaly);
      }
      
      // Convert eccentric anomaly to true anomaly
      const trueAnomaly = 2 * Math.atan2(
        Math.sqrt(1 + eccentricity) * Math.sin(eccentricAnomaly / 2),
        Math.sqrt(1 - eccentricity) * Math.cos(eccentricAnomaly / 2)
      );
      
      // Calculate distance from planet using elliptical orbit formula
      const radius = semiMajorAxis * (1 - eccentricity * eccentricity) / (1 + eccentricity * Math.cos(trueAnomaly));
      
      // Calculate position in orbital plane (XZ plane initially)
      let moonX = radius * Math.cos(trueAnomaly);
      let moonY = 0;
      let moonZ = radius * Math.sin(trueAnomaly);
      
      // Apply orbital inclination (rotation around X axis)
      if (inclination !== 0) {
        const cosInc = Math.cos(inclination);
        const sinInc = Math.sin(inclination);
        const newY = moonY * cosInc - moonZ * sinInc;
        const newZ = moonY * sinInc + moonZ * cosInc;
        moonY = newY;
        moonZ = newZ;
      }
      
      // Translate to planet position
      moonX += planet.position.x;
      moonY += planet.position.y;
      moonZ += planet.position.z;

      // Validate calculated positions before assigning
      if (!isNaN(moonX) && !isNaN(moonY) && !isNaN(moonZ)) {
        moon.position.x = moonX;
        moon.position.y = moonY;
        moon.position.z = moonZ;
        
        // Apply tidal locking - moon always shows same face to planet
        const moonToplanet = new THREE.Vector3().subVectors(planet.position, moon.position).normalize();
        const defaultForward = new THREE.Vector3(0, 0, 1);
        const quaternion = new THREE.Quaternion();
        quaternion.setFromUnitVectors(defaultForward, moonToplanet);
        moon.quaternion.copy(quaternion);
        
        // Update lunar phase for Earth's Moon
        if (planetName === 'Earth' && moonData.name === 'Moon') {
          // Sun is at origin (0, 0, 0)
          const sunPos = new THREE.Vector3(0, 0, 0);
          const moonPos = new THREE.Vector3(moonX, moonY, moonZ);
          const earthPos = planet.position.clone();
          
          // Calculate Sun-Moon and Earth-Moon vectors
          const sunToMoon = new THREE.Vector3().subVectors(moonPos, sunPos).normalize();
          const earthToMoon = new THREE.Vector3().subVectors(moonPos, earthPos).normalize();
          
          // Calculate phase angle (dot product gives cosine of angle)
          const phaseAngle = sunToMoon.dot(earthToMoon);
          
          // Map phase angle to brightness (0 = new moon, 1 = full moon)
          const phaseBrightness = (1 - phaseAngle) / 2; // Maps [-1,1] to [1,0]
          
          // Update Moon's emissive intensity based on phase
          const moonMat = moon.material as THREE.MeshStandardMaterial;
          moonMat.emissiveIntensity = 0.1 + (phaseBrightness * 0.3); // Range: 0.1 (new) to 0.4 (full)
        }
      }
    });
  });
}

// ============================================================================
// Asteroid Belt Rendering
// ============================================================================

function addAsteroidBelt(
  scene: THREE.Scene,
  showAsteroidBelt: boolean,
  asteroidBeltRef: React.MutableRefObject<THREE.Points | null>
) {
  // Remove existing asteroid belt if present
  if (asteroidBeltRef.current) {
    scene.remove(asteroidBeltRef.current);
    asteroidBeltRef.current = null;
  }

  if (!showAsteroidBelt) {
    console.log('⚫ Asteroid belt hidden');
    return;
  }

  // Asteroid belt parameters
  const numAsteroids = 8000; // Large number for realistic density
  const innerRadius = 2.2 * AU_SCALE; // Inner edge at 2.2 AU (beyond Mars)
  const outerRadius = 3.2 * AU_SCALE; // Outer edge at 3.2 AU (before Jupiter)
  const beltThickness = 0.4 * AU_SCALE; // Vertical thickness of belt
  
  // Create geometry for instanced asteroids
  const positions = new Float32Array(numAsteroids * 3);
  const colors = new Float32Array(numAsteroids * 3);
  const sizes = new Float32Array(numAsteroids);
  
  // Generate random asteroids in the belt
  for (let i = 0; i < numAsteroids; i++) {
    // Random orbital radius between inner and outer edges
    const radius = innerRadius + Math.random() * (outerRadius - innerRadius);
    
    // Random angle around the Sun
    const theta = Math.random() * Math.PI * 2;
    
    // Random vertical offset (belt thickness)
    const y = (Math.random() - 0.5) * beltThickness;
    
    // Calculate position
    const x = radius * Math.cos(theta);
    const z = radius * Math.sin(theta);
    
    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
    
    // Asteroid colors (rocky brownish-gray)
    const colorVariation = 0.7 + Math.random() * 0.3;
    colors[i * 3] = 0.55 * colorVariation; // R
    colors[i * 3 + 1] = 0.45 * colorVariation; // G
    colors[i * 3 + 2] = 0.33 * colorVariation; // B
    
    // Size variation (most asteroids are tiny, few are larger)
    const sizeRoll = Math.random();
    if (sizeRoll > 0.99) {
      sizes[i] = 0.04 + Math.random() * 0.02; // Large asteroids (1%)
    } else if (sizeRoll > 0.95) {
      sizes[i] = 0.02 + Math.random() * 0.02; // Medium asteroids (4%)
    } else {
      sizes[i] = 0.005 + Math.random() * 0.015; // Small asteroids (95%)
    }
  }
  
  // Create BufferGeometry and set attributes
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  
  // Create material for asteroids
  const material = new THREE.PointsMaterial({
    size: 0.02,
    vertexColors: true,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.8,
    blending: THREE.NormalBlending
  });
  
  // Create Points object
  const asteroidBelt = new THREE.Points(geometry, material);
  asteroidBelt.name = 'asteroidBelt';
  
  scene.add(asteroidBelt);
  asteroidBeltRef.current = asteroidBelt;
  
  console.log(`✅ Added asteroid belt with ${numAsteroids.toLocaleString()} asteroids between ${(innerRadius / AU_SCALE).toFixed(1)} - ${(outerRadius / AU_SCALE).toFixed(1)} AU`);
}

// ============================================================================
// Constellation Rendering Functions
// ============================================================================

function addConstellations(
  scene: THREE.Scene,
  showConstellations: boolean,
  constellationsRef: React.MutableRefObject<Map<string, THREE.Group>>
) {
  // Clear existing constellations
  constellationsRef.current.forEach((constellation) => {
    scene.remove(constellation);
  });
  constellationsRef.current.clear();

  // Add constellation boundaries
  constellationBoundaries.forEach((boundary) => {
    const constellationGroup = new THREE.Group();
    constellationGroup.name = `constellation-${boundary.name}`;

    // Create boundary lines
    boundary.boundaries.forEach((boundaryData) => {
      const points: THREE.Vector3[] = [];

      // Convert RA/Dec to 3D positions
      for (let i = 0; i < boundaryData.ra.length; i++) {
        const [x, y, z] = celestialToCartesian(boundaryData.ra[i], boundaryData.dec[i], 100);
        points.push(new THREE.Vector3(x, y, z));
      }

      // Create geometry from points
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color: 0x4a90e2, // Light blue for boundaries
        opacity: 0.6,
        transparent: true,
        linewidth: 1
      });

      const boundaryLine = new THREE.Line(geometry, material);
      constellationGroup.add(boundaryLine);
    });

    constellationGroup.visible = showConstellations;
    scene.add(constellationGroup);
    constellationsRef.current.set(boundary.name, constellationGroup);
  });

  // Add constellation star connections
  constellationConnections.forEach((connection) => {
    const constellationGroup = constellationsRef.current.get(connection.name);
    if (!constellationGroup) return;

    // Create connection lines
    connection.connections.forEach((conn) => {
      const points: THREE.Vector3[] = [];

      // Convert star positions to 3D
      const [x1, y1, z1] = celestialToCartesian(conn.star1.ra, conn.star1.dec, 100);
      const [x2, y2, z2] = celestialToCartesian(conn.star2.ra, conn.star2.dec, 100);

      points.push(new THREE.Vector3(x1, y1, z1));
      points.push(new THREE.Vector3(x2, y2, z2));

      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color: 0xffffff, // White for star connections
        opacity: 0.8,
        transparent: true,
        linewidth: 1
      });

      const connectionLine = new THREE.Line(geometry, material);
      constellationGroup.add(connectionLine);
    });
  });

  console.log(`✅ Added ${constellationBoundaries.length} constellation boundaries and ${constellationConnections.length} star connection patterns`);
}
