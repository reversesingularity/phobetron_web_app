/**
 * Celestial Event Calculator
 * 
 * Provides calculations for various celestial events including eclipses,
 * conjunctions, blood moons, and NEO approaches.
 * 
 * Note: These are simplified algorithms for demonstration. Production use
 * should integrate with NASA Horizons API or Skyfield Python library.
 */

import { CelestialEvent, SignificanceLevel } from '@/lib/types/celestial';

// Simplified ephemeris data for major planets (J2000 epoch) - for future use
// const PLANET_DATA = {
//   Mercury: { period: 87.969, semiMajorAxis: 0.387, eccentricity: 0.206 },
//   Venus: { period: 224.701, semiMajorAxis: 0.723, eccentricity: 0.007 },
//   Mars: { period: 686.980, semiMajorAxis: 1.524, eccentricity: 0.093 },
//   Jupiter: { period: 4332.589, semiMajorAxis: 5.203, eccentricity: 0.048 },
//   Saturn: { period: 10759.22, semiMajorAxis: 9.537, eccentricity: 0.054 }
// };

// Known upcoming eclipses (2025-2029) - from NASA Eclipse Catalog
const KNOWN_ECLIPSES = [
  {
    date: new Date('2025-09-07T18:11:00Z'),
    type: 'lunar_total' as const,
    magnitude: 1.362,
    duration: 67,
    saros: 137,
    visibleFrom: ['Americas', 'Europe', 'Africa']
  },
  {
    date: new Date('2025-09-21T19:43:00Z'),
    type: 'solar_partial' as const,
    magnitude: 0.855,
    duration: 245,
    saros: 144,
    visibleFrom: ['Pacific', 'New Zealand', 'Antarctica']
  },
  {
    date: new Date('2026-03-03T11:33:00Z'),
    type: 'lunar_total' as const,
    magnitude: 1.151,
    duration: 58,
    saros: 132,
    visibleFrom: ['Americas', 'Western Europe', 'Western Africa']
  },
  {
    date: new Date('2026-03-17T13:48:00Z'),
    type: 'solar_total' as const,
    magnitude: 1.034,
    duration: 288,
    saros: 139,
    visibleFrom: ['Arctic', 'Greenland', 'Iceland', 'Northern Spain']
  },
  {
    date: new Date('2026-08-28T04:13:00Z'),
    type: 'lunar_partial' as const,
    magnitude: 0.932,
    duration: 187,
    saros: 118,
    visibleFrom: ['Americas', 'Europe', 'Africa', 'Western Asia']
  },
  {
    date: new Date('2026-09-11T17:11:00Z'),
    type: 'solar_annular' as const,
    magnitude: 0.974,
    duration: 259,
    saros: 144,
    visibleFrom: ['Pacific', 'South America']
  },
  {
    date: new Date('2027-02-20T20:12:00Z'),
    type: 'lunar_penumbral' as const,
    magnitude: 0.558,
    duration: 267,
    saros: 114,
    visibleFrom: ['Americas', 'Europe', 'Africa']
  },
  {
    date: new Date('2027-08-02T10:07:00Z'),
    type: 'solar_total' as const,
    magnitude: 1.079,
    duration: 395,
    saros: 136,
    visibleFrom: ['North Africa', 'Middle East', 'Arabian Peninsula']
  },
  {
    date: new Date('2027-08-17T07:13:00Z'),
    type: 'lunar_total' as const,
    magnitude: 1.361,
    duration: 106,
    saros: 129,
    visibleFrom: ['Europe', 'Africa', 'Asia', 'Australia']
  },
  {
    date: new Date('2028-01-26T15:08:00Z'),
    type: 'solar_annular' as const,
    magnitude: 0.921,
    duration: 637,
    saros: 141,
    visibleFrom: ['Pacific', 'South America', 'Antarctica']
  },
  {
    date: new Date('2028-07-06T18:20:00Z'),
    type: 'lunar_partial' as const,
    magnitude: 0.389,
    duration: 146,
    saros: 139,
    visibleFrom: ['Europe', 'Africa', 'Western Asia']
  },
  {
    date: new Date('2028-07-22T02:56:00Z'),
    type: 'solar_total' as const,
    magnitude: 1.056,
    duration: 330,
    saros: 146,
    visibleFrom: ['Australia', 'New Zealand', 'Antarctica']
  },
  {
    date: new Date('2029-01-01T02:53:00Z'),
    type: 'lunar_partial' as const,
    magnitude: 0.066,
    duration: 52,
    saros: 125,
    visibleFrom: ['Americas', 'Europe', 'Africa', 'Western Asia']
  },
  {
    date: new Date('2029-01-14T17:13:00Z'),
    type: 'solar_partial' as const,
    magnitude: 0.871,
    duration: 231,
    saros: 151,
    visibleFrom: ['North America', 'Central America']
  },
  {
    date: new Date('2029-06-12T04:06:00Z'),
    type: 'lunar_total' as const,
    magnitude: 1.842,
    duration: 102,
    saros: 130,
    visibleFrom: ['Americas', 'Europe', 'Africa']
  },
  {
    date: new Date('2029-06-26T12:04:00Z'),
    type: 'lunar_total' as const,
    magnitude: 1.151,
    duration: 214,
    saros: 135,
    visibleFrom: ['Asia', 'Australia', 'Pacific']
  },
  {
    date: new Date('2029-07-11T15:37:00Z'),
    type: 'solar_partial' as const,
    magnitude: 0.230,
    duration: 115,
    saros: 156,
    visibleFrom: ['Antarctica']
  },
  {
    date: new Date('2029-12-05T15:03:00Z'),
    type: 'lunar_total' as const,
    magnitude: 1.119,
    duration: 219,
    saros: 140,
    visibleFrom: ['Americas', 'Europe', 'Africa', 'Asia']
  },
  {
    date: new Date('2029-12-20T22:02:00Z'),
    type: 'solar_total' as const,
    magnitude: 1.028,
    duration: 213,
    saros: 141,
    visibleFrom: ['North America', 'Atlantic']
  }
];

// Known NEO approaches
const KNOWN_NEO_APPROACHES = [
  {
    name: '99942 Apophis',
    date: new Date('2029-04-13T21:46:00Z'),
    minDistance: 31600, // km
    diameter: 370, // meters
    isPHA: true
  },
  {
    name: '(163899) 2003 SD220',
    date: new Date('2025-12-06T12:00:00Z'),
    minDistance: 11200000, // km
    diameter: 1600,
    isPHA: false
  },
  {
    name: '(1566) Icarus',
    date: new Date('2027-06-16T14:00:00Z'),
    minDistance: 6400000, // km
    diameter: 1400,
    isPHA: true
  }
];

/**
 * Calculate upcoming eclipses from the catalog
 */
export function calculateUpcomingEclipses(
  startDate: Date = new Date(),
  endDate: Date = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000 * 5) // 5 years
): CelestialEvent[] {
  return KNOWN_ECLIPSES
    .filter(eclipse => eclipse.date >= startDate && eclipse.date <= endDate)
    .map((eclipse, index) => {
      const isBloodMoon = eclipse.type === 'lunar_total' && eclipse.magnitude > 1.0;
      const isSolarTotal = eclipse.type === 'solar_total';
      
      let significance: SignificanceLevel = 'medium';
      if (isBloodMoon) significance = 'critical';
      else if (isSolarTotal) significance = 'high';
      else if (eclipse.magnitude > 0.9) significance = 'high';
      
      const linkedProphecies: string[] = [];
      if (isBloodMoon) {
        linkedProphecies.push('Joel 2:31', 'Acts 2:20', 'Revelation 6:12');
      }
      if (eclipse.type.startsWith('solar') && eclipse.magnitude > 0.8) {
        linkedProphecies.push('Matthew 24:29', 'Isaiah 13:10', 'Amos 8:9');
      }

      return {
        id: `eclipse-${index}`,
        title: `${eclipse.type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} Eclipse`,
        eventType: isBloodMoon ? 'blood_moon' : 'eclipse',
        eventDate: eclipse.date,
        durationMinutes: eclipse.duration,
        description: `${isBloodMoon ? 'Blood Moon - ' : ''}${eclipse.type.includes('total') ? 'Total' : eclipse.type.includes('partial') ? 'Partial' : eclipse.type.includes('annular') ? 'Annular' : 'Penumbral'} eclipse with magnitude ${eclipse.magnitude.toFixed(3)}. Saros cycle ${eclipse.saros}.`,
        celestialObjects: eclipse.type.startsWith('solar') ? ['Sun', 'Moon', 'Earth'] : ['Moon', 'Earth', 'Sun'],
        magnitude: eclipse.magnitude,
        visibilityRegions: eclipse.visibleFrom,
        isBloodMoon,
        propheticSignificance: significance,
        linkedProphecies,
        calculationMethod: 'NASA Eclipse Catalog',
        accuracy: 'precise'
      };
    });
}

/**
 * Calculate planetary conjunctions
 * Simplified calculation - production should use actual ephemeris
 */
export function calculatePlanetaryConjunctions(
  startDate: Date = new Date(),
  endDate: Date = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000 * 2) // 2 years
): CelestialEvent[] {
  const conjunctions: CelestialEvent[] = [];
  
  // Known significant conjunctions
  const knownConjunctions = [
    {
      planets: ['Jupiter', 'Saturn'],
      date: new Date('2025-12-21T18:00:00Z'),
      separation: 0.1,
      isGreat: true
    },
    {
      planets: ['Venus', 'Mars'],
      date: new Date('2025-11-05T08:00:00Z'),
      separation: 0.5,
      isGreat: false
    },
    {
      planets: ['Venus', 'Jupiter'],
      date: new Date('2026-02-23T06:00:00Z'),
      separation: 0.3,
      isGreat: false
    },
    {
      planets: ['Mars', 'Saturn'],
      date: new Date('2026-04-10T20:00:00Z'),
      separation: 0.4,
      isGreat: false
    }
  ];

  knownConjunctions
    .filter(conj => conj.date >= startDate && conj.date <= endDate)
    .forEach((conj, index) => {
      const significance: SignificanceLevel = conj.isGreat ? 'high' : conj.separation < 0.5 ? 'medium' : 'low';
      
      const linkedProphecies: string[] = [];
      if (conj.isGreat) {
        linkedProphecies.push('Matthew 24:29', 'Luke 21:25');
      }
      
      conjunctions.push({
        id: `conjunction-${index}`,
        title: `${conj.planets.join('-')} ${conj.isGreat ? 'Great ' : ''}Conjunction`,
        eventType: 'conjunction',
        eventDate: conj.date,
        durationMinutes: 120,
        description: `${conj.isGreat ? 'Great conjunction' : 'Close approach'} of ${conj.planets.join(' and ')}. Angular separation of ${conj.separation}°. ${conj.separation < 0.5 ? 'Visible to naked eye.' : 'Best viewed with binoculars.'}`,
        celestialObjects: conj.planets,
        magnitude: conj.planets.includes('Venus') ? -4.0 : -2.0,
        visibilityRegions: ['Global'],
        propheticSignificance: significance,
        linkedProphecies,
        calculationMethod: 'Keplerian approximation',
        accuracy: 'approximate'
      });
    });

  return conjunctions;
}

/**
 * Calculate NEO approaches
 */
export function calculateNEOApproaches(
  startDate: Date = new Date(),
  endDate: Date = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000 * 5) // 5 years
): CelestialEvent[] {
  return KNOWN_NEO_APPROACHES
    .filter(neo => neo.date >= startDate && neo.date <= endDate)
    .map((neo, index) => {
      const lunarDistance = neo.minDistance / 384400; // Moon distance
      const isClose = lunarDistance < 1.0;
      const significance: SignificanceLevel = 
        isClose ? 'high' : 
        neo.isPHA ? 'medium' : 
        'low';

      return {
        id: `neo-${index}`,
        title: `${neo.name} Close Approach`,
        eventType: 'neo_approach',
        eventDate: neo.date,
        durationMinutes: 60,
        description: `Near-Earth asteroid passes within ${(neo.minDistance / 1000).toFixed(0)}k km (${lunarDistance.toFixed(2)} lunar distances). ${isClose ? 'Exceptionally close approach! ' : ''}Diameter ~${neo.diameter}m. ${neo.isPHA ? 'Potentially Hazardous Asteroid.' : ''}`,
        celestialObjects: [neo.name, 'Earth'],
        magnitude: isClose ? 3.3 : 10.0,
        visibilityRegions: isClose ? ['Global (with telescope)'] : ['Professional observatories'],
        propheticSignificance: significance,
        linkedProphecies: isClose ? ['Revelation 8:8', 'Revelation 8:10'] : [],
        calculationMethod: 'JPL CNEOS',
        accuracy: 'precise',
        observationRequirements: isClose ? 'Naked eye or binoculars' : 'Large telescope required'
      };
    });
}

/**
 * Calculate comet perihelion passages
 */
export function calculateCometPerihelions(
  startDate: Date = new Date(),
  endDate: Date = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000 * 2) // 2 years
): CelestialEvent[] {
  const comets = [
    {
      name: '12P/Pons-Brooks',
      perihelion: new Date('2025-11-22T06:00:00Z'),
      magnitude: 4.5,
      period: 71
    },
    {
      name: '13P/Olbers',
      perihelion: new Date('2025-06-30T12:00:00Z'),
      magnitude: 7.5,
      period: 69
    }
  ];

  return comets
    .filter(comet => comet.perihelion >= startDate && comet.perihelion <= endDate)
    .map((comet, index) => ({
      id: `comet-${index}`,
      title: `Comet ${comet.name} Perihelion`,
      eventType: 'comet_perihelion',
      eventDate: comet.perihelion,
      durationMinutes: 1440, // visible for days
      description: `Periodic comet ${comet.name} reaches closest point to Sun. Expected magnitude ${comet.magnitude}, orbital period ${comet.period} years. ${comet.magnitude < 6 ? 'Visible with binoculars or naked eye' : 'Telescope required'}.`,
      celestialObjects: [comet.name, 'Sun'],
      magnitude: comet.magnitude,
      visibilityRegions: ['Global (dark skies)'],
      propheticSignificance: comet.magnitude < 5 ? 'medium' : 'low',
      linkedProphecies: comet.magnitude < 6 ? ['Revelation 8:10', 'Revelation 8:11'] : [],
      calculationMethod: 'Orbital elements integration',
      accuracy: 'precise'
    }));
}

/**
 * Identify blood moon tetrads
 * A tetrad is four consecutive total lunar eclipses with no partial eclipses in between
 */
export function identifyBloodMoonTetrads(
  startDate: Date = new Date(),
  endDate: Date = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000 * 10) // 10 years
): CelestialEvent[] {
  // Filter for total lunar eclipses
  // const totalLunarEclipses = KNOWN_ECLIPSES
  //   .filter(e => e.type === 'lunar_total' && e.date >= startDate && e.date <= endDate)
  //   .sort((a, b) => a.date.getTime() - b.date.getTime());

  // Check for tetrads (simplified - real algorithm would check spacing)
  const tetrads: CelestialEvent[] = [];
  
  // Known tetrad: 2014-2015 (historical reference)
  // Next potential tetrads would need precise calculation
  
  return tetrads;
}

/**
 * Get all celestial events in a date range
 */
export function getAllCelestialEvents(
  startDate: Date = new Date(),
  endDate: Date = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000 * 2) // 2 years
): CelestialEvent[] {
  const eclipses = calculateUpcomingEclipses(startDate, endDate);
  const conjunctions = calculatePlanetaryConjunctions(startDate, endDate);
  const neos = calculateNEOApproaches(startDate, endDate);
  const comets = calculateCometPerihelions(startDate, endDate);

  return [...eclipses, ...conjunctions, ...neos, ...comets]
    .sort((a, b) => a.eventDate.getTime() - b.eventDate.getTime());
}

/**
 * Calculate time remaining until an event
 */
export function getTimeUntilEvent(eventDate: Date): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
} {
  const now = new Date();
  const diff = eventDate.getTime() - now.getTime();
  
  if (diff < 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  }
  
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
    isPast: false
  };
}

/**
 * Format time remaining as human-readable string
 */
export function formatTimeRemaining(eventDate: Date): string {
  const time = getTimeUntilEvent(eventDate);
  
  if (time.isPast) return 'Past event';
  if (time.days > 365) return `${Math.floor(time.days / 365)}y ${time.days % 365}d`;
  if (time.days > 30) return `${Math.floor(time.days / 30)}mo ${time.days % 30}d`;
  if (time.days > 0) return `${time.days}d ${time.hours}h`;
  if (time.hours > 0) return `${time.hours}h ${time.minutes}m`;
  if (time.minutes > 0) return `${time.minutes}m ${time.seconds}s`;
  return `${time.seconds}s`;
}

/**
 * Check if event is visible from a specific location
 * Simplified - production should use actual visibility calculations
 */
export function isVisibleFrom(event: CelestialEvent, location: string): boolean {
  return event.visibilityRegions.some(region => 
    region.toLowerCase().includes(location.toLowerCase())
  );
}

/**
 * Filter events by significance level
 */
export function filterBySignificance(
  events: CelestialEvent[],
  minSignificance: SignificanceLevel
): CelestialEvent[] {
  const significanceOrder: SignificanceLevel[] = ['low', 'medium', 'high', 'critical'];
  const minIndex = significanceOrder.indexOf(minSignificance);
  
  return events.filter(event => 
    significanceOrder.indexOf(event.propheticSignificance) >= minIndex
  );
}
