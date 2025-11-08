/**
 * Feast Correlation Service
 * 
 * Detects when celestial or Earth events coincide with Hebrew calendar feast days.
 * Calculates significance scores based on:
 * - Feast importance (high/medium/low)
 * - Event proximity to feast (0-3 days)
 * - Event type and severity
 */

import { CelestialEvent } from '@/lib/types/celestial';
import { 
  HebrewFeast, 
  getFeastProximity, 
  FeastProximity 
} from '@/lib/utils/hebrewCalendar';

export interface FeastCorrelation {
  event: CelestialEvent | EarthEvent;
  feastProximity: FeastProximity;
  correlationScore: number; // 0-100
  significance: 'critical' | 'high' | 'medium' | 'low';
  analysis: string;
}

export interface EarthEvent {
  id: string;
  type: 'earthquake' | 'volcanic' | 'geomagnetic' | 'solar_flare' | 'meteor' | 'aurora';
  date: Date;  // Changed from eventDate to date
  location: string;
  magnitude: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  propheticSignificance?: 'critical' | 'high' | 'medium' | 'low';
}

/**
 * Calculate correlation score between an event and a feast
 * 
 * Scoring factors:
 * - Feast significance: high=40pts, medium=25pts, low=10pts
 * - Proximity: 0 days=40pts, 1 day=30pts, 2 days=20pts, 3 days=10pts
 * - Event significance: critical=20pts, high=15pts, medium=10pts, low=5pts
 */
function calculateCorrelationScore(
  feastProximity: FeastProximity,
  eventSignificance: 'critical' | 'high' | 'medium' | 'low' | undefined
): number {
  let score = 0;
  
  // Feast significance score (40 points max)
  switch (feastProximity.feast.significance) {
    case 'high':
      score += 40;
      break;
    case 'medium':
      score += 25;
      break;
    case 'low':
      score += 10;
      break;
  }
  
  // Proximity score (40 points max)
  if (feastProximity.proximityDays === 0) {
    score += 40;
  } else if (feastProximity.proximityDays === 1) {
    score += 30;
  } else if (feastProximity.proximityDays === 2) {
    score += 20;
  } else if (feastProximity.proximityDays === 3) {
    score += 10;
  }
  
  // Event significance score (20 points max)
  switch (eventSignificance) {
    case 'critical':
      score += 20;
      break;
    case 'high':
      score += 15;
      break;
    case 'medium':
      score += 10;
      break;
    case 'low':
      score += 5;
      break;
    default:
      score += 5;
  }
  
  return Math.min(score, 100);
}

/**
 * Determine overall significance based on correlation score
 */
function getSignificanceFromScore(score: number): 'critical' | 'high' | 'medium' | 'low' {
  if (score >= 85) return 'critical';
  if (score >= 70) return 'high';
  if (score >= 50) return 'medium';
  return 'low';
}

/**
 * Generate correlation analysis text
 */
function generateAnalysis(
  eventType: string,
  feastProximity: FeastProximity,
  score: number
): string {
  const feast = feastProximity.feast;
  const proximity = feastProximity.isDirectMatch 
    ? `occurs on ${feast.hebrewName}`
    : `occurs ${feastProximity.proximityDays} day${feastProximity.proximityDays !== 1 ? 's' : ''} ${
        feastProximity.proximityDays > 0 ? 'near' : 'from'
      } ${feast.hebrewName}`;
  
  let analysis = `This ${eventType} ${proximity}. `;
  
  if (score >= 85) {
    analysis += `This is a CRITICAL correlation with high prophetic significance. `;
    analysis += feast.description;
  } else if (score >= 70) {
    analysis += `This is a HIGH significance correlation. `;
    analysis += feast.description;
  } else if (score >= 50) {
    analysis += `This is a MODERATE correlation worth noting. `;
  } else {
    analysis += `This is a LOW significance correlation. `;
  }
  
  return analysis;
}

/**
 * Check if a celestial event correlates with Hebrew feasts
 */
export function checkCelestialFeastCorrelation(
  event: CelestialEvent,
  toleranceDays: number = 3
): FeastCorrelation | null {
  const feastProximity = getFeastProximity(event.eventDate, toleranceDays);
  
  if (!feastProximity) {
    return null;
  }
  
  const score = calculateCorrelationScore(
    feastProximity,
    event.propheticSignificance
  );
  
  const significance = getSignificanceFromScore(score);
  
  const eventTypeMap: Record<string, string> = {
    'blood_moon': 'Blood Moon eclipse',
    'eclipse': 'solar/lunar eclipse',
    'conjunction': 'planetary conjunction',
    'neo_approach': 'Near-Earth Object approach',
    'comet_perihelion': 'comet perihelion',
  };
  
  const eventType = eventTypeMap[event.eventType] || 'celestial event';
  
  return {
    event,
    feastProximity,
    correlationScore: score,
    significance,
    analysis: generateAnalysis(eventType, feastProximity, score)
  };
}

/**
 * Check if an Earth event correlates with Hebrew feasts
 */
export function checkEarthFeastCorrelation(
  event: EarthEvent,
  toleranceDays: number = 3
): FeastCorrelation | null {
  const feastProximity = getFeastProximity(event.eventDate, toleranceDays);
  
  if (!feastProximity) {
    return null;
  }
  
  const score = calculateCorrelationScore(
    feastProximity,
    event.propheticSignificance || event.severity
  );
  
  const significance = getSignificanceFromScore(score);
  
  const eventTypeMap: Record<string, string> = {
    'earthquake': 'earthquake',
    'volcanic': 'volcanic eruption',
    'geomagnetic_storm': 'geomagnetic storm',
    'solar_flare': 'solar flare',
    'meteor_event': 'meteor event',
    'aurora': 'aurora borealis/australis'
  };
  
  const eventType = eventTypeMap[event.type] || 'Earth event';
  
  return {
    event,
    feastProximity,
    correlationScore: score,
    significance,
    analysis: generateAnalysis(eventType, feastProximity, score)
  };
}

/**
 * Filter events that correlate with feasts
 */
export function filterEventsWithFeastCorrelations<T extends CelestialEvent | EarthEvent>(
  events: T[],
  toleranceDays: number = 3,
  minScore: number = 0
): FeastCorrelation[] {
  const correlations: FeastCorrelation[] = [];
  
  for (const event of events) {
    let correlation: FeastCorrelation | null = null;
    
    if ('eventType' in event) {
      // It's a CelestialEvent
      correlation = checkCelestialFeastCorrelation(event as CelestialEvent, toleranceDays);
    } else if ('type' in event) {
      // It's an EarthEvent
      correlation = checkEarthFeastCorrelation(event as EarthEvent, toleranceDays);
    }
    
    if (correlation && correlation.correlationScore >= minScore) {
      correlations.push(correlation);
    }
  }
  
  // Sort by correlation score (highest first)
  return correlations.sort((a, b) => b.correlationScore - a.correlationScore);
}

/**
 * Get statistics about feast correlations
 */
export interface CorrelationStats {
  totalEvents: number;
  eventsWithCorrelations: number;
  correlationRate: number;
  criticalCorrelations: number;
  highCorrelations: number;
  averageScore: number;
  feastBreakdown: Record<string, number>;
}

export function getCorrelationStats(correlations: FeastCorrelation[]): CorrelationStats {
  const feastBreakdown: Record<string, number> = {};
  let totalScore = 0;
  
  const stats: CorrelationStats = {
    totalEvents: correlations.length,
    eventsWithCorrelations: correlations.length,
    correlationRate: 100,
    criticalCorrelations: 0,
    highCorrelations: 0,
    averageScore: 0,
    feastBreakdown
  };
  
  for (const correlation of correlations) {
    totalScore += correlation.correlationScore;
    
    if (correlation.significance === 'critical') {
      stats.criticalCorrelations++;
    } else if (correlation.significance === 'high') {
      stats.highCorrelations++;
    }
    
    const feastName = correlation.feastProximity.feast.name;
    feastBreakdown[feastName] = (feastBreakdown[feastName] || 0) + 1;
  }
  
  stats.averageScore = correlations.length > 0 
    ? Math.round(totalScore / correlations.length) 
    : 0;
  
  return stats;
}

/**
 * Group correlations by feast
 */
export function groupCorrelationsByFeast(
  correlations: FeastCorrelation[]
): Record<string, FeastCorrelation[]> {
  const grouped: Record<string, FeastCorrelation[]> = {};
  
  for (const correlation of correlations) {
    const feastName = correlation.feastProximity.feast.name;
    
    if (!grouped[feastName]) {
      grouped[feastName] = [];
    }
    
    grouped[feastName].push(correlation);
  }
  
  return grouped;
}

/**
 * Get the most significant correlation from a list
 */
export function getMostSignificantCorrelation(
  correlations: FeastCorrelation[]
): FeastCorrelation | null {
  if (correlations.length === 0) return null;
  
  return correlations.reduce((mostSignificant, current) => 
    current.correlationScore > mostSignificant.correlationScore 
      ? current 
      : mostSignificant
  );
}
