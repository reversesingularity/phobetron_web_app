/**
 * Earth Events Monitoring Service
 * 
 * Tracks significant Earth events with potential prophetic significance:
 * - Earthquakes (magnitude 5.0+)
 * - Volcanic eruptions
 * - Geomagnetic storms
 * - Solar flares
 * - Major meteor events
 * - Aurora displays
 * 
 * Correlates events with Hebrew calendar feast days for watchman monitoring.
 */

import type { EarthEvent } from '@/lib/utils/feastCorrelation';

// Re-export the EarthEvent type for convenience
export type { EarthEvent } from '@/lib/utils/feastCorrelation';

/**
 * Mock Earth events data
 * In production, these would come from:
 * - USGS Earthquake API
 * - NOAA Space Weather API
 * - NASA Solar Dynamics Observatory
 * - Smithsonian Global Volcanism Program
 */

export function getRecentEarthquakes(startDate: Date, endDate: Date): EarthEvent[] {
  const events: EarthEvent[] = [];
  
  // Example significant earthquakes
  const earthquakeData = [
    {
      date: new Date('2024-01-01T06:10:00Z'),
      location: 'Japan, Noto Peninsula',
      magnitude: 7.6,
      description: 'Major earthquake strikes Ishikawa Prefecture'
    },
    {
      date: new Date('2024-04-03T07:58:00Z'),
      location: 'Taiwan',
      magnitude: 7.4,
      description: 'Powerful earthquake off east coast of Taiwan'
    },
    {
      date: new Date('2024-09-26T12:27:00Z'),
      location: 'Indonesia, Sumatra',
      magnitude: 6.8,
      description: 'Significant earthquake in Sumatra region'
    }
  ];
  
  for (const eq of earthquakeData) {
    if (eq.date >= startDate && eq.date <= endDate) {
      const severity = eq.magnitude >= 7.5 ? 'critical' : 
                      eq.magnitude >= 7.0 ? 'high' : 
                      eq.magnitude >= 6.0 ? 'medium' : 'low';
      
      events.push({
        id: `earthquake-${eq.date.getTime()}`,
        type: 'earthquake',
        eventDate: eq.date,
        location: eq.location,
        magnitude: eq.magnitude,
        severity,
        description: eq.description,
        propheticSignificance: severity
      });
    }
  }
  
  return events;
}

export function getVolcanicEvents(startDate: Date, endDate: Date): EarthEvent[] {
  const events: EarthEvent[] = [];
  
  // Example volcanic eruptions
  const volcanicData = [
    {
      date: new Date('2024-03-16T00:00:00Z'),
      location: 'Iceland, Reykjanes Peninsula',
      magnitude: 4.5,
      description: 'Major eruption near Grindavík, lava flows threaten infrastructure'
    },
    {
      date: new Date('2024-08-09T00:00:00Z'),
      location: 'Italy, Mount Etna',
      magnitude: 3.8,
      description: 'Significant eruptive activity with ash emissions'
    }
  ];
  
  for (const volcano of volcanicData) {
    if (volcano.date >= startDate && volcano.date <= endDate) {
      const severity = volcano.magnitude >= 5.0 ? 'critical' : 
                      volcano.magnitude >= 4.0 ? 'high' : 
                      volcano.magnitude >= 3.0 ? 'medium' : 'low';
      
      events.push({
        id: `volcanic-${volcano.date.getTime()}`,
        type: 'volcanic',
        eventDate: volcano.date,
        location: volcano.location,
        magnitude: volcano.magnitude,
        severity,
        description: volcano.description,
        propheticSignificance: severity
      });
    }
  }
  
  return events;
}

export function getGeomagneticStorms(startDate: Date, endDate: Date): EarthEvent[] {
  const events: EarthEvent[] = [];
  
  // Example geomagnetic storms (Kp index events)
  const stormData = [
    {
      date: new Date('2024-05-10T00:00:00Z'),
      magnitude: 8.7,
      description: 'Extreme G5 geomagnetic storm - strongest in 20 years, aurora visible at low latitudes'
    },
    {
      date: new Date('2024-10-10T00:00:00Z'),
      magnitude: 7.2,
      description: 'Severe G4 geomagnetic storm causes radio blackouts'
    }
  ];
  
  for (const storm of stormData) {
    if (storm.date >= startDate && storm.date <= endDate) {
      // Kp index scale: 0-9 (5+ = storm)
      const severity = storm.magnitude >= 8.0 ? 'critical' : 
                      storm.magnitude >= 7.0 ? 'high' : 
                      storm.magnitude >= 6.0 ? 'medium' : 'low';
      
      events.push({
        id: `geomagnetic-${storm.date.getTime()}`,
        type: 'geomagnetic_storm',
        eventDate: storm.date,
        location: 'Global',
        magnitude: storm.magnitude,
        severity,
        description: storm.description,
        propheticSignificance: severity
      });
    }
  }
  
  return events;
}

export function getSolarFlares(startDate: Date, endDate: Date): EarthEvent[] {
  const events: EarthEvent[] = [];
  
  // Example major solar flares (X-class flares)
  const flareData = [
    {
      date: new Date('2024-05-14T00:00:00Z'),
      magnitude: 8.7,
      description: 'X8.7-class solar flare - largest of Solar Cycle 25, causes radio blackouts'
    },
    {
      date: new Date('2024-02-22T00:00:00Z'),
      magnitude: 6.3,
      description: 'X6.3-class solar flare erupts from sunspot AR3590'
    },
    {
      date: new Date('2024-10-03T00:00:00Z'),
      magnitude: 9.0,
      description: 'X9.0-class solar flare - major eruption with CME directed at Earth'
    }
  ];
  
  for (const flare of flareData) {
    if (flare.date >= startDate && flare.date <= endDate) {
      // X-class scale (X1.0 to X20+)
      const severity = flare.magnitude >= 10.0 ? 'critical' : 
                      flare.magnitude >= 5.0 ? 'high' : 
                      flare.magnitude >= 2.0 ? 'medium' : 'low';
      
      events.push({
        id: `solar-flare-${flare.date.getTime()}`,
        type: 'solar_flare',
        eventDate: flare.date,
        location: 'Sun',
        magnitude: flare.magnitude,
        severity,
        description: flare.description,
        propheticSignificance: severity
      });
    }
  }
  
  return events;
}

export function getMeteorEvents(startDate: Date, endDate: Date): EarthEvent[] {
  const events: EarthEvent[] = [];
  
  // Example significant meteor events
  const meteorData = [
    {
      date: new Date('2024-08-12T00:00:00Z'),
      location: 'Perseids Peak',
      magnitude: 4.5,
      description: 'Perseids meteor shower peak - 100+ meteors per hour'
    },
    {
      date: new Date('2024-12-13T00:00:00Z'),
      location: 'Geminids Peak',
      magnitude: 5.0,
      description: 'Geminids meteor shower peak - 120+ meteors per hour, brightest shower of year'
    }
  ];
  
  for (const meteor of meteorData) {
    if (meteor.date >= startDate && meteor.date <= endDate) {
      const severity = meteor.magnitude >= 5.0 ? 'high' : 
                      meteor.magnitude >= 4.0 ? 'medium' : 'low';
      
      events.push({
        id: `meteor-${meteor.date.getTime()}`,
        type: 'meteor_event',
        eventDate: meteor.date,
        location: meteor.location,
        magnitude: meteor.magnitude,
        severity,
        description: meteor.description,
        propheticSignificance: severity
      });
    }
  }
  
  return events;
}

/**
 * Get all Earth events in a date range
 */
export function getAllEarthEvents(startDate: Date, endDate: Date): EarthEvent[] {
  const allEvents: EarthEvent[] = [
    ...getRecentEarthquakes(startDate, endDate),
    ...getVolcanicEvents(startDate, endDate),
    ...getGeomagneticStorms(startDate, endDate),
    ...getSolarFlares(startDate, endDate),
    ...getMeteorEvents(startDate, endDate)
  ];
  
  // Sort by date (most recent first)
  return allEvents.sort((a, b) => b.eventDate.getTime() - a.eventDate.getTime());
}

/**
 * Filter events by severity
 */
export function filterBySeverity(
  events: EarthEvent[],
  minSeverity: 'low' | 'medium' | 'high' | 'critical'
): EarthEvent[] {
  const severityOrder = ['low', 'medium', 'high', 'critical'];
  const minIndex = severityOrder.indexOf(minSeverity);
  
  return events.filter(event => {
    const eventIndex = severityOrder.indexOf(event.severity || 'low');
    return eventIndex >= minIndex;
  });
}

/**
 * Filter events by type
 */
export function filterByType(
  events: EarthEvent[],
  types: EarthEvent['type'][]
): EarthEvent[] {
  return events.filter(event => types.includes(event.type));
}

/**
 * Get event statistics
 */
export interface EarthEventStats {
  totalEvents: number;
  criticalEvents: number;
  highSeverityEvents: number;
  earthquakes: number;
  volcanic: number;
  geomagneticStorms: number;
  solarFlares: number;
  averageMagnitude: number;
}

export function getEarthEventStats(events: EarthEvent[]): EarthEventStats {
  let totalMagnitude = 0;
  let magnitudeCount = 0;
  
  const stats: EarthEventStats = {
    totalEvents: events.length,
    criticalEvents: 0,
    highSeverityEvents: 0,
    earthquakes: 0,
    volcanic: 0,
    geomagneticStorms: 0,
    solarFlares: 0,
    averageMagnitude: 0
  };
  
  for (const event of events) {
    if (event.severity === 'critical') stats.criticalEvents++;
    if (event.severity === 'high') stats.highSeverityEvents++;
    
    switch (event.type) {
      case 'earthquake':
        stats.earthquakes++;
        break;
      case 'volcanic':
        stats.volcanic++;
        break;
      case 'geomagnetic_storm':
        stats.geomagneticStorms++;
        break;
      case 'solar_flare':
        stats.solarFlares++;
        break;
    }
    
    if (event.magnitude) {
      totalMagnitude += event.magnitude;
      magnitudeCount++;
    }
  }
  
  stats.averageMagnitude = magnitudeCount > 0 
    ? Math.round((totalMagnitude / magnitudeCount) * 10) / 10 
    : 0;
  
  return stats;
}

/**
 * Get event type display name
 */
export function getEventTypeDisplayName(type: EarthEvent['type']): string {
  const names: Record<EarthEvent['type'], string> = {
    earthquake: 'Earthquake',
    volcanic: 'Volcanic Eruption',
    geomagnetic_storm: 'Geomagnetic Storm',
    solar_flare: 'Solar Flare',
    meteor_event: 'Meteor Event',
    aurora: 'Aurora Display'
  };
  
  return names[type] || type;
}

/**
 * Get severity color for UI badges
 */
export function getSeverityColor(severity: EarthEvent['severity']): string {
  switch (severity) {
    case 'critical':
      return 'red';
    case 'high':
      return 'orange';
    case 'medium':
      return 'yellow';
    case 'low':
      return 'blue';
    default:
      return 'gray';
  }
}
