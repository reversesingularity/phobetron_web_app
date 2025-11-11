/**
 * Feast Correlation Engine
 * Correlates celestial and Earth events with Hebrew feast days
 * Implements 100-point scoring system from HEBREW_FEAST_SYSTEM
 */

import type { 
  CelestialEvent, 
  EarthEvent, 
  FeastCorrelation, 
  FeastProximity,
  HebrewFeast 
} from '../types/celestial'
import { getFeastProximity } from './hebrewCalendar'

/**
 * Calculate correlation score (0-100) based on:
 * - Feast Significance (40 points): High=40, Medium=25, Low=10
 * - Proximity (40 points): 0 days=40, 1 day=30, 2 days=20, 3 days=10
 * - Event Significance (20 points): Critical=20, High=15, Medium=10, Low=5
 */
export function calculateCorrelationScore(
  feastProximity: FeastProximity,
  eventSignificance: 'critical' | 'high' | 'medium' | 'low' | undefined
): number {
  let score = 0
  
  // Feast Significance (40 points max)
  const feastSigPoints = {
    high: 40,
    medium: 25,
    low: 10,
  }
  score += feastSigPoints[feastProximity.feast.significance]
  
  // Proximity (40 points max)
  const daysDiff = Math.abs(feastProximity.daysAway)
  if (daysDiff === 0) {
    score += 40
  } else if (daysDiff === 1) {
    score += 30
  } else if (daysDiff === 2) {
    score += 20
  } else if (daysDiff === 3) {
    score += 10
  }
  
  // Event Significance (20 points max)
  const eventSigPoints = {
    critical: 20,
    high: 15,
    medium: 10,
    low: 5,
  }
  score += eventSigPoints[eventSignificance || 'low']
  
  return score
}

/**
 * Get significance level from correlation score
 */
function getSignificanceLevel(score: number): 'critical' | 'high' | 'medium' | 'low' {
  if (score >= 85) return 'critical'
  if (score >= 70) return 'high'
  if (score >= 50) return 'medium'
  return 'low'
}

/**
 * Generate reasoning for correlation
 */
function generateReasoning(
  feastProximity: FeastProximity,
  event: CelestialEvent | EarthEvent,
  score: number
): string[] {
  const reasoning: string[] = []
  
  // Proximity reasoning
  if (feastProximity.isExactMatch) {
    reasoning.push(`Event occurs exactly on ${feastProximity.feast.name} (${feastProximity.feast.hebrewName})`)
  } else {
    const direction = feastProximity.daysAway > 0 ? 'before' : 'after'
    reasoning.push(`Event occurs ${Math.abs(feastProximity.daysAway)} day(s) ${direction} ${feastProximity.feast.name}`)
  }
  
  // Feast significance
  reasoning.push(`${feastProximity.feast.name} is a ${feastProximity.feast.significance}-significance feast`)
  reasoning.push(`Biblical reference: ${feastProximity.feast.biblicalReference}`)
  
  // Prophetic importance
  reasoning.push(`Prophetic importance: ${feastProximity.feast.propheticImportance}`)
  
  // Event type specific reasoning
  if ('type' in event) {
    if (event.type === 'blood_moon' && feastProximity.feast.name === 'Passover') {
      reasoning.push('Blood moon on Passover has historical prophetic significance (Joel 2:31)')
    }
    if (event.type === 'solar_eclipse' && feastProximity.feast.significance === 'high') {
      reasoning.push('Solar eclipse during high feast aligns with celestial sign prophecies (Matthew 24:29)')
    }
  }
  
  // Score-based reasoning
  if (score >= 85) {
    reasoning.push('CRITICAL correlation - Highest prophetic importance, requires immediate attention')
  } else if (score >= 70) {
    reasoning.push('HIGH correlation - Significant prophetic pattern, close monitoring recommended')
  } else if (score >= 50) {
    reasoning.push('MEDIUM correlation - Moderate prophetic significance, track for patterns')
  }
  
  return reasoning
}

/**
 * Check celestial event for feast correlation
 */
export function checkCelestialFeastCorrelation(
  event: CelestialEvent,
  toleranceDays: number = 3
): FeastCorrelation | null {
  const feastProximity = getFeastProximity(event.date, toleranceDays)
  if (!feastProximity) return null
  
  const score = calculateCorrelationScore(feastProximity, event.propheticSignificance)
  const significance = getSignificanceLevel(score)
  const reasoning = generateReasoning(feastProximity, event, score)
  
  return {
    event,
    feast: feastProximity.feast,
    correlationScore: score,
    significance,
    proximityDays: feastProximity.daysAway,
    reasoning,
  }
}

/**
 * Check Earth event for feast correlation
 */
export function checkEarthFeastCorrelation(
  event: EarthEvent,
  toleranceDays: number = 3
): FeastCorrelation | null {
  const feastProximity = getFeastProximity(event.date, toleranceDays)
  if (!feastProximity) return null
  
  const score = calculateCorrelationScore(feastProximity, event.propheticSignificance)
  const significance = getSignificanceLevel(score)
  const reasoning = generateReasoning(feastProximity, event, score)
  
  return {
    event,
    feast: feastProximity.feast,
    correlationScore: score,
    significance,
    proximityDays: feastProximity.daysAway,
    reasoning,
  }
}

/**
 * Filter and sort events by feast correlation
 */
export function filterEventsWithFeastCorrelations<T extends CelestialEvent | EarthEvent>(
  events: T[],
  toleranceDays: number = 3,
  minScore: number = 50
): FeastCorrelation[] {
  const correlations: FeastCorrelation[] = []
  
  for (const event of events) {
    const isCelestial = 'type' in event && ['blood_moon', 'solar_eclipse', 'lunar_eclipse', 'conjunction', 'alignment'].includes(event.type)
    const correlation = isCelestial 
      ? checkCelestialFeastCorrelation(event as CelestialEvent, toleranceDays)
      : checkEarthFeastCorrelation(event as EarthEvent, toleranceDays)
    
    if (correlation && correlation.correlationScore >= minScore) {
      correlations.push(correlation)
    }
  }
  
  // Sort by correlation score (highest first)
  return correlations.sort((a, b) => b.correlationScore - a.correlationScore)
}

/**
 * Get correlation statistics
 */
export function getCorrelationStats(correlations: FeastCorrelation[]): {
  total: number
  critical: number
  high: number
  medium: number
  low: number
  averageScore: number
  feastBreakdown: Record<string, number>
} {
  const stats = {
    total: correlations.length,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    averageScore: 0,
    feastBreakdown: {} as Record<string, number>,
  }
  
  let totalScore = 0
  
  for (const correlation of correlations) {
    totalScore += correlation.correlationScore
    
    // Count by significance
    stats[correlation.significance]++
    
    // Count by feast
    const feastName = correlation.feast.name
    stats.feastBreakdown[feastName] = (stats.feastBreakdown[feastName] || 0) + 1
  }
  
  stats.averageScore = correlations.length > 0 ? totalScore / correlations.length : 0
  
  return stats
}

/**
 * Group correlations by feast
 */
export function groupCorrelationsByFeast(
  correlations: FeastCorrelation[]
): Record<string, FeastCorrelation[]> {
  const grouped: Record<string, FeastCorrelation[]> = {}
  
  for (const correlation of correlations) {
    const feastName = correlation.feast.name
    if (!grouped[feastName]) {
      grouped[feastName] = []
    }
    grouped[feastName].push(correlation)
  }
  
  return grouped
}

/**
 * Find highest-scoring correlation
 */
export function getMostSignificantCorrelation(
  correlations: FeastCorrelation[]
): FeastCorrelation | null {
  if (correlations.length === 0) return null
  
  return correlations.reduce((highest, current) => 
    current.correlationScore > highest.correlationScore ? current : highest
  )
}
