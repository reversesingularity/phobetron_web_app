/**
 * Unified Events Service
 * 
 * Central data source for all event monitoring across the application.
 * Synchronizes data between:
 * - Watchman's Dashboard
 * - Alerts Page (ML Event Monitor)
 * - Patterns Page (Timeline)
 * 
 * Ensures consistent data across all views.
 */

import { getAllCelestialEvents } from '@/lib/utils/celestialCalculations';
import { getAllEarthEvents, type EarthEvent } from '@/lib/services/earthEventsService';
import { checkCelestialFeastCorrelation, checkEarthFeastCorrelation } from '@/lib/utils/feastCorrelation';
import { eventPredictor } from '@/lib/ai/eventPredictor';
import type { CelestialEvent } from '@/lib/types/celestial';

export interface UnifiedEvent {
  id: string;
  type: 'celestial' | 'terrestrial';
  title: string;
  date: Date;
  eventDate: Date; // Alias for compatibility
  location: string;
  magnitude?: number;
  significance: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  
  // Celestial-specific
  eventType?: string;
  visibilityRegions?: string[];
  
  // Earth event specific
  earthEventType?: 'earthquake' | 'volcanic' | 'geomagnetic' | 'solar_flare' | 'meteor' | 'aurora';
  severity?: 'critical' | 'high' | 'medium' | 'low';
  
  // AI/ML
  aiPrediction?: {
    predictedSignificance: 'critical' | 'high' | 'medium' | 'low';
    confidenceScore: number;
    reasoning: string[];
    recommendedActions: string[];
  };
  
  // Feast correlation
  feastCorrelation?: {
    feastName: string;
    score: number;
    daysFromFeast: number;
    significance: 'critical' | 'high' | 'medium' | 'low';
  };
}

/**
 * Get all events (celestial + terrestrial) for a date range
 * with AI predictions and feast correlations
 */
export function getAllUnifiedEvents(
  startDate: Date,
  endDate: Date,
  options: {
    includePredictions?: boolean;
    includeFeastCorrelations?: boolean;
    minFeastCorrelationScore?: number;
  } = {}
): UnifiedEvent[] {
  const {
    includePredictions = true,
    includeFeastCorrelations = true,
    minFeastCorrelationScore = 0
  } = options;

  const unifiedEvents: UnifiedEvent[] = [];

  // Get celestial events
  const celestialEvents = getAllCelestialEvents(startDate, endDate);
  
  celestialEvents.forEach(event => {
    // Check feast correlation
    let feastCorrelation: UnifiedEvent['feastCorrelation'] | undefined;
    if (includeFeastCorrelations) {
      const correlation = checkCelestialFeastCorrelation(event, 3);
      if (correlation && correlation.correlationScore >= minFeastCorrelationScore) {
        feastCorrelation = {
          feastName: correlation.feastProximity.feast.name,
          score: correlation.correlationScore,
          daysFromFeast: correlation.feastProximity.daysFromFeast,
          significance: correlation.significance
        };
      }
    }

    // Get AI prediction
    let aiPrediction: UnifiedEvent['aiPrediction'] | undefined;
    if (includePredictions) {
      const prediction = eventPredictor.predict(event);
      aiPrediction = {
        predictedSignificance: prediction.predictedSignificance,
        confidenceScore: prediction.confidenceScore,
        reasoning: prediction.reasoning,
        recommendedActions: prediction.recommendedActions
      };
    }

    unifiedEvents.push({
      id: event.id,
      type: 'celestial',
      title: event.title,
      date: event.eventDate,
      eventDate: event.eventDate,
      location: event.visibilityRegions?.join(', ') || 'Global',
      magnitude: event.magnitude,
      significance: event.propheticSignificance,
      description: event.description,
      eventType: event.eventType,
      visibilityRegions: event.visibilityRegions,
      aiPrediction,
      feastCorrelation
    });
  });

  // Get terrestrial events
  const earthEvents = getAllEarthEvents(startDate, endDate);
  
  earthEvents.forEach(event => {
    // Check feast correlation
    let feastCorrelation: UnifiedEvent['feastCorrelation'] | undefined;
    if (includeFeastCorrelations) {
      const correlation = checkEarthFeastCorrelation(event, 3);
      if (correlation && correlation.correlationScore >= minFeastCorrelationScore) {
        feastCorrelation = {
          feastName: correlation.feastProximity.feast.name,
          score: correlation.correlationScore,
          daysFromFeast: correlation.feastProximity.daysFromFeast,
          significance: correlation.significance
        };
      }
    }

    // Create simplified AI prediction for earth events
    let aiPrediction: UnifiedEvent['aiPrediction'] | undefined;
    if (includePredictions) {
      aiPrediction = {
        predictedSignificance: event.severity,
        confidenceScore: event.severity === 'critical' ? 0.95 : event.severity === 'high' ? 0.85 : 0.75,
        reasoning: [
          `${event.type.charAt(0).toUpperCase() + event.type.slice(1)} event detected`,
          `Severity: ${event.severity.toUpperCase()}`,
          `Magnitude: ${event.magnitude}`,
          event.location ? `Location: ${event.location}` : 'Location: Multiple regions'
        ].filter(Boolean),
        recommendedActions: [
          'Monitor closely for developments',
          'Review feast day correlations',
          event.severity === 'critical' ? 'Alert watchman network' : 'Continue regular monitoring'
        ]
      };
    }

    unifiedEvents.push({
      id: event.id,
      type: 'terrestrial',
      title: `${event.type.charAt(0).toUpperCase() + event.type.slice(1)} ${event.magnitude ? `M${event.magnitude}` : ''}`,
      date: event.date,
      eventDate: event.date,
      location: event.location,
      magnitude: event.magnitude,
      significance: event.severity,
      description: event.description,
      earthEventType: event.type,
      severity: event.severity,
      aiPrediction,
      feastCorrelation
    });
  });

  // Sort by date
  unifiedEvents.sort((a, b) => a.date.getTime() - b.date.getTime());

  return unifiedEvents;
}

/**
 * Get statistics for unified events
 */
export function getUnifiedEventStats(events: UnifiedEvent[]) {
  const now = new Date();
  
  return {
    total: events.length,
    celestial: events.filter(e => e.type === 'celestial').length,
    terrestrial: events.filter(e => e.type === 'terrestrial').length,
    
    // By significance
    critical: events.filter(e => e.significance === 'critical').length,
    high: events.filter(e => e.significance === 'high').length,
    medium: events.filter(e => e.significance === 'medium').length,
    low: events.filter(e => e.significance === 'low').length,
    
    // Feast correlations
    feastAligned: events.filter(e => e.feastCorrelation).length,
    highFeastCorrelation: events.filter(e => 
      e.feastCorrelation && 
      (e.feastCorrelation.significance === 'critical' || e.feastCorrelation.significance === 'high')
    ).length,
    
    // Earth events by type
    earthquakes: events.filter(e => e.earthEventType === 'earthquake').length,
    volcanic: events.filter(e => e.earthEventType === 'volcanic').length,
    geomagnetic: events.filter(e => e.earthEventType === 'geomagnetic').length,
    solarFlares: events.filter(e => e.earthEventType === 'solar_flare').length,
    
    // Timing
    upcoming7Days: events.filter(e => {
      const days = (e.date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      return days >= 0 && days <= 7;
    }).length,
    upcoming30Days: events.filter(e => {
      const days = (e.date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      return days >= 0 && days <= 30;
    }).length,
    
    // AI predictions
    highConfidence: events.filter(e => 
      e.aiPrediction && e.aiPrediction.confidenceScore >= 0.8
    ).length,
    avgConfidence: events.reduce((sum, e) => 
      sum + (e.aiPrediction?.confidenceScore || 0), 0
    ) / events.length || 0
  };
}

/**
 * Filter events by criteria
 */
export function filterUnifiedEvents(
  events: UnifiedEvent[],
  filters: {
    type?: 'celestial' | 'terrestrial' | 'all';
    significance?: 'critical' | 'high' | 'medium' | 'low' | 'all';
    timeRange?: '7days' | '30days' | '1year' | 'all';
    feastOnly?: boolean;
    minConfidence?: number;
  }
): UnifiedEvent[] {
  const now = new Date();
  
  return events.filter(event => {
    // Type filter
    if (filters.type && filters.type !== 'all' && event.type !== filters.type) {
      return false;
    }
    
    // Significance filter
    if (filters.significance && filters.significance !== 'all' && event.significance !== filters.significance) {
      return false;
    }
    
    // Time range filter
    if (filters.timeRange && filters.timeRange !== 'all') {
      const days = (event.date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      if (filters.timeRange === '7days' && (days < 0 || days > 7)) return false;
      if (filters.timeRange === '30days' && (days < 0 || days > 30)) return false;
      if (filters.timeRange === '1year' && (days < 0 || days > 365)) return false;
    }
    
    // Feast filter
    if (filters.feastOnly && !event.feastCorrelation) {
      return false;
    }
    
    // Confidence filter
    if (filters.minConfidence && (!event.aiPrediction || event.aiPrediction.confidenceScore < filters.minConfidence)) {
      return false;
    }
    
    return true;
  });
}
