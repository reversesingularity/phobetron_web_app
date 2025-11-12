/**
 * Planet Data Repository
 * Comprehensive information about all 8 planets in our solar system
 */

export interface PlanetInfo {
  name: string;
  type: 'Terrestrial' | 'Gas Giant' | 'Ice Giant';
  diameter: string; // in km
  mass: string; // relative to Earth
  distanceFromSun: string; // in AU or million km
  orbitalPeriod: string; // in Earth days/years
  rotationPeriod: string; // in Earth days/hours
  moons: number;
  temperature: string; // average surface/cloud temperature
  composition: string;
  imageUrl?: string;
  color: string; // hex color for UI theming
  facts: string[];
}

export const PLANET_DATA: Record<string, PlanetInfo> = {
  Mercury: {
    name: 'Mercury',
    type: 'Terrestrial',
    diameter: '4,879 km',
    mass: '0.055 Earths',
    distanceFromSun: '0.39 AU (58 million km)',
    orbitalPeriod: '88 Earth days',
    rotationPeriod: '59 Earth days',
    moons: 0,
    temperature: '167°C (day), -183°C (night)',
    composition: 'Iron core (70%), rocky mantle',
    color: '#8C7853',
    facts: [
      'Smallest planet in the Solar System',
      'Has no atmosphere to retain heat',
      'Surface heavily cratered like the Moon',
      'Experiences extreme temperature variations',
      'Has a large iron core relative to its size'
    ]
  },
  Venus: {
    name: 'Venus',
    type: 'Terrestrial',
    diameter: '12,104 km',
    mass: '0.815 Earths',
    distanceFromSun: '0.72 AU (108 million km)',
    orbitalPeriod: '225 Earth days',
    rotationPeriod: '243 Earth days (retrograde)',
    moons: 0,
    temperature: '464°C (surface)',
    composition: 'Rocky with thick CO₂ atmosphere',
    color: '#FFC649',
    facts: [
      'Hottest planet in the Solar System',
      'Rotates backwards (retrograde rotation)',
      'Day longer than its year',
      'Thick atmosphere creates runaway greenhouse effect',
      'Often called Earth\'s "twin" due to similar size'
    ]
  },
  Earth: {
    name: 'Earth',
    type: 'Terrestrial',
    diameter: '12,742 km',
    mass: '1.0 Earth (5.97 × 10²⁴ kg)',
    distanceFromSun: '1.0 AU (150 million km)',
    orbitalPeriod: '365.25 days',
    rotationPeriod: '24 hours',
    moons: 1,
    temperature: '15°C (average)',
    composition: 'Rocky with 71% water surface',
    color: '#4A90E2',
    facts: [
      'Only known planet with life',
      'Liquid water covers 71% of surface',
      '78% nitrogen, 21% oxygen atmosphere',
      'Magnetic field protects from solar wind',
      'Largest terrestrial planet'
    ]
  },
  Mars: {
    name: 'Mars',
    type: 'Terrestrial',
    diameter: '6,779 km',
    mass: '0.107 Earths',
    distanceFromSun: '1.52 AU (228 million km)',
    orbitalPeriod: '687 Earth days',
    rotationPeriod: '24.6 hours',
    moons: 2,
    temperature: '-65°C (average)',
    composition: 'Rocky with iron oxide surface',
    color: '#CD5C5C',
    facts: [
      'Known as the "Red Planet"',
      'Has polar ice caps of water and CO₂',
      'Home to Olympus Mons, largest volcano in Solar System',
      'Thin atmosphere, mostly carbon dioxide',
      'Target for future human colonization'
    ]
  },
  Jupiter: {
    name: 'Jupiter',
    type: 'Gas Giant',
    diameter: '139,820 km',
    mass: '317.8 Earths',
    distanceFromSun: '5.2 AU (778 million km)',
    orbitalPeriod: '11.86 Earth years',
    rotationPeriod: '9.9 hours',
    moons: 95,
    temperature: '-110°C (cloud tops)',
    composition: 'Hydrogen (90%), Helium (10%)',
    color: '#C88B3A',
    facts: [
      'Largest planet in the Solar System',
      'Great Red Spot: storm larger than Earth',
      'Has faint ring system',
      'Strong magnetic field, 20,000x Earth\'s',
      'Galilean moons: Io, Europa, Ganymede, Callisto'
    ]
  },
  Saturn: {
    name: 'Saturn',
    type: 'Gas Giant',
    diameter: '116,460 km',
    mass: '95.2 Earths',
    distanceFromSun: '9.5 AU (1.4 billion km)',
    orbitalPeriod: '29.46 Earth years',
    rotationPeriod: '10.7 hours',
    moons: 146,
    temperature: '-140°C (cloud tops)',
    composition: 'Hydrogen (96%), Helium (3%)',
    color: '#FAD5A5',
    facts: [
      'Famous for spectacular ring system',
      'Rings made of ice particles and rock',
      'Least dense planet (would float in water)',
      'Titan: largest moon with thick atmosphere',
      'Hexagonal storm at north pole'
    ]
  },
  Uranus: {
    name: 'Uranus',
    type: 'Ice Giant',
    diameter: '50,724 km',
    mass: '14.5 Earths',
    distanceFromSun: '19.2 AU (2.9 billion km)',
    orbitalPeriod: '84 Earth years',
    rotationPeriod: '17.2 hours (retrograde)',
    moons: 27,
    temperature: '-195°C (cloud tops)',
    composition: 'Hydrogen, Helium, Methane ice',
    color: '#4FD0E7',
    facts: [
      'Rotates on its side (98° axial tilt)',
      'Blue-green color from methane atmosphere',
      'Coldest planetary atmosphere in Solar System',
      'Has faint ring system (13 rings)',
      'Discovered in 1781 by William Herschel'
    ]
  },
  Neptune: {
    name: 'Neptune',
    type: 'Ice Giant',
    diameter: '49,244 km',
    mass: '17.1 Earths',
    distanceFromSun: '30.1 AU (4.5 billion km)',
    orbitalPeriod: '164.8 Earth years',
    rotationPeriod: '16.1 hours',
    moons: 14,
    temperature: '-200°C (cloud tops)',
    composition: 'Hydrogen, Helium, Methane ice',
    color: '#4169E1',
    facts: [
      'Farthest planet from the Sun',
      'Deep blue color from methane',
      'Fastest winds in Solar System (2,100 km/h)',
      'Great Dark Spot: massive storm system',
      'Discovered mathematically before observation (1846)'
    ]
  }
};

/**
 * Get planet information by name
 */
export function getPlanetInfo(planetName: string): PlanetInfo | null {
  return PLANET_DATA[planetName] || null;
}

/**
 * Get all planet names
 */
export function getAllPlanetNames(): string[] {
  return Object.keys(PLANET_DATA);
}
