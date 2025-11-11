/**
 * Celestial Event Types and Interfaces
 * Supporting AI Predictive Analytics and Hebrew Feast Correlation
 */

export interface HebrewFeast {
  name: string
  hebrewName: string
  date: Date
  endDate?: Date
  significance: 'high' | 'medium' | 'low'
  biblicalReference: string
  propheticImportance: string
  hebrewMonth: string
  hebrewDay: number
}

export interface FeastProximity {
  feast: HebrewFeast
  daysAway: number
  isExactMatch: boolean
  isWithinTolerance: boolean
}

export interface CelestialEvent {
  id: string
  type: 'blood_moon' | 'solar_eclipse' | 'lunar_eclipse' | 'conjunction' | 'alignment' | 'tetrad' | 'meteor' | 'neo'
  date: Date
  name: string
  description: string
  magnitude?: number
  duration?: number
  visibility: {
    jerusalem: boolean
    global: boolean
    regions: string[]
  }
  coordinates?: {
    ra: number
    dec: number
    alt?: number
    az?: number
  }
  // Feast Correlation Fields
  feastProximity?: FeastProximity
  feastCorrelationScore?: number
  coincidesWithFeastName?: string
  hebrewDate?: string
  // AI Prediction Fields
  predictedSignificance?: 'low' | 'medium' | 'high' | 'critical'
  confidenceScore?: number
  propheticSignificance?: 'low' | 'medium' | 'high' | 'critical'
}

export interface EarthEvent {
  id: string
  type: 'earthquake' | 'volcanic' | 'geomagnetic' | 'solar_flare' | 'meteor' | 'aurora' | 'tsunami'
  date: Date
  location: string
  coordinates?: {
    latitude: number
    longitude: number
  }
  magnitude: number
  severity: 'critical' | 'high' | 'medium' | 'low'
  description: string
  propheticSignificance?: 'critical' | 'high' | 'medium' | 'low'
  // Feast Correlation
  feastProximity?: FeastProximity
  feastCorrelationScore?: number
  // Seismos Correlation
  seismosScore?: number
  celestialCorrelations?: CelestialEvent[]
}

export interface FeastCorrelation {
  event: CelestialEvent | EarthEvent
  feast: HebrewFeast
  correlationScore: number
  significance: 'critical' | 'high' | 'medium' | 'low'
  proximityDays: number
  reasoning: string[]
}

export interface PropheticPattern {
  id: string
  name: string
  description: string
  events: (CelestialEvent | EarthEvent)[]
  correlationStrength: number
  biblicalReferences: string[]
  detectedAt: Date
  confidence: number
  propheticTheme: string
  periodicity?: number
}

export interface EventPrediction {
  eventId: string
  predictedSignificance: 'low' | 'medium' | 'high' | 'critical'
  confidenceScore: number
  reasoning: string[]
  historicalPrecedents: Array<{
    event: CelestialEvent | EarthEvent
    similarity: number
    outcome: string
  }>
  prophecyCorrelations: Array<{
    prophecy: BiblicalProphecy
    correlationProbability: number
    reasoning: string
  }>
  anomalyScore: number
  isAnomaly: boolean
  recommendedActions: string[]
}

export interface BiblicalProphecy {
  id: string
  reference: string
  text: string
  category: 'celestial' | 'seismic' | 'judgment' | 'deliverance' | 'end_times' | 'restoration'
  keywords: string[]
  hebrewWords?: Array<{
    word: string
    transliteration: string
    strongsNumber: string
    meaning: string
  }>
  greekWords?: Array<{
    word: string
    transliteration: string
    strongsNumber: string
    meaning: string
  }>
  eschatologicalContext: string
  fulfillmentStatus: 'fulfilled' | 'partial' | 'future' | 'ongoing'
  relatedProphecies: string[]
}

export interface Alert {
  id: string
  type: 'prediction_change' | 'pattern_detected' | 'feast_alignment' | 'anomaly_detected' | 'confidence_increase' | 'critical_event'
  severity: 'info' | 'warning' | 'critical'
  title: string
  message: string
  timestamp: Date
  relatedEvents: string[]
  prophecyReferences?: string[]
  actionRequired: boolean
  userRating?: 1 | 2 | 3 | 4 | 5
}

export interface SeismosCorrelation {
  celestialEvent: CelestialEvent
  earthEvents: EarthEvent[]
  correlationScore: number
  timeWindow: number
  biblicalFoundation: {
    matthew_24_7: string
    revelation_6_12: string
    luke_21_25: string
  }
  predictedProbability: number
  confidence: number
}
