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
  type: 'tetrad' | 'triple_conjunction' | 'cluster'
  name?: string // Optional for backward compatibility
  description: string
  events: (CelestialEvent | EarthEvent)[]
  startDate: Date
  endDate: Date
  significance: number // 0-1 score
  correlationStrength?: number // Optional for backward compatibility
  biblicalReferences: string[]
  feastAlignments?: string[]
  historicalParallels?: string[]
  detectedAt?: Date // Optional for backward compatibility
  confidence?: number // Optional for backward compatibility
  propheticTheme?: string // Optional for backward compatibility
  periodicity?: number
}

export interface EventPrediction {
  eventId: string
  confidence: number // ML model confidence (0-1)
  significance: number // Prophetic significance score (0-1)
  category: 'low' | 'medium' | 'high' | 'critical'
  predictedSignificance?: 'low' | 'medium' | 'high' | 'critical' // Deprecated - use category
  confidenceScore?: number // Deprecated - use confidence
  factors: Array<{
    name: string
    weight: number
    value: number
  }>
  recommendations: string[]
  relatedPatterns?: string[]
  modelInfo?: {
    name: string
    version: string
    accuracy: number
  }
  reasoning?: string[] // Optional for backward compatibility
  historicalPrecedents?: Array<{
    event: CelestialEvent | EarthEvent
    similarity: number
    outcome: string
  }>
  prophecyCorrelations?: Array<{
    prophecy: BiblicalProphecy
    correlationProbability: number
    reasoning: string
  }>
  anomalyScore?: number
  isAnomaly?: boolean
  recommendedActions?: string[] // Deprecated - use recommendations
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
  relatedEvents: Array<{ id: string; type: 'celestial' | 'earth' }>
  biblicalReferences?: string[]
  prophecyReferences?: string[] // Deprecated - use biblicalReferences
  actionRequired: boolean
  confidence?: number // ML confidence score (0-1)
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
