// Shared types for celestial events and prophecies

export type EventType = 
  | 'eclipse' 
  | 'conjunction' 
  | 'blood_moon' 
  | 'neo_approach' 
  | 'comet_perihelion'
  | 'planetary_alignment'
  | 'meteor_shower';

export type SignificanceLevel = 'low' | 'medium' | 'high' | 'critical';

export type FulfillmentStatus = 'unfulfilled' | 'partially_fulfilled' | 'fulfilled';

export type EventCategory = 'celestial_sign' | 'terrestrial_event' | 'spiritual_event';

export interface CelestialEvent {
  id: string;
  title: string;
  eventType: EventType;
  eventDate: Date;
  durationMinutes?: number;
  description: string;
  celestialObjects: string[];
  magnitude?: number;
  visibilityRegions: string[];
  isBloodMoon?: boolean;
  tetradCycleNumber?: number;
  propheticSignificance: SignificanceLevel;
  linkedProphecies: string[]; // Scripture references
  calculationMethod?: string;
  accuracy?: 'approximate' | 'precise';
  observationRequirements?: string;
}

export interface Prophecy {
  id: string;
  title: string;
  scriptureReference: string;
  book: string;
  chapter: number;
  verseStart: number;
  verseEnd?: number;
  fullText: string;
  category: EventCategory;
  propheticContext?: string;
  interpretation?: string;
  fulfillmentStatus: FulfillmentStatus;
  significanceLevel: SignificanceLevel;
  tags?: string[];
  eschatologicalContext?: string;
  linkedEvents: string[]; // Event IDs
  dateRange?: {
    start?: Date;
    end?: Date;
  };
}

export interface EventProphecyCorrelation {
  id: string;
  eventId: string;
  prophecyId: string;
  correlationStrength: number; // 0-1
  correlationType: 'direct' | 'symbolic' | 'temporal' | 'typological';
  notes?: string;
  verifiedBy?: string;
  dateCorrelated: Date;
}

export interface TimelineEvent {
  id: string;
  date: Date;
  type: 'celestial' | 'prophecy' | 'correlation';
  title: string;
  description: string;
  significance: SignificanceLevel;
  relatedEventIds: string[];
  relatedProphecyIds: string[];
}

export interface UserAlert {
  id: string;
  userId: string;
  eventId?: string;
  prophecyId?: string;
  alertType: 'event_approaching' | 'prophecy_fulfilled' | 'correlation_found' | 'custom';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  triggerDate: Date;
  notificationSent: boolean;
  dismissed: boolean;
  createdAt: Date;
}

// Helper type for event calculations
export interface EventCalculation {
  eventType: EventType;
  date: Date;
  celestialObjects: string[];
  parameters: Record<string, number | string | boolean>;
  confidence: number; // 0-1
  source: 'nasa_horizons' | 'skyfield' | 'manual' | 'estimated';
}

// Eclipse-specific types
export interface EclipseData {
  eclipseType: 'solar_total' | 'solar_partial' | 'solar_annular' | 'lunar_total' | 'lunar_partial' | 'lunar_penumbral';
  sarosCycle?: number;
  magnitude: number; // 0-1 for solar, can be >1 for lunar
  obscuration?: number; // percentage of Sun covered
  pathOfTotality?: {
    centerline: [number, number][]; // lat, lon pairs
    width: number; // km
  };
  contacts: {
    P1?: Date; // Penumbral eclipse begins
    U1?: Date; // Partial eclipse begins
    U2?: Date; // Total eclipse begins
    Greatest?: Date; // Maximum eclipse
    U3?: Date; // Total eclipse ends
    U4?: Date; // Partial eclipse ends
    P4?: Date; // Penumbral eclipse ends
  };
  visibleFrom: string[];
}

// Conjunction-specific types
export interface ConjunctionData {
  body1: string;
  body2: string;
  body3?: string; // for triple conjunctions
  angularSeparation: number; // degrees
  closestApproachDate: Date;
  constellation?: string;
  visualMagnitude1: number;
  visualMagnitude2: number;
  isGreatConjunction?: boolean; // Jupiter-Saturn
}

// NEO-specific types
export interface NEOApproachData {
  neoName: string;
  neoId?: string; // JPL SPK-ID
  approachDate: Date;
  minimumDistance: number; // km
  relativeVelocity: number; // km/s
  estimatedDiameter: {
    min: number; // meters
    max: number;
  };
  isPotentiallyHazardous: boolean;
  missDistance: {
    astronomical: number; // AU
    lunar: number; // LD (lunar distance)
    kilometers: number;
  };
  orbitingBody: string;
}

// Blood Moon (Tetrad) specific data
export interface BloodMoonData {
  tetradNumber?: number;
  tetradSequence?: 1 | 2 | 3 | 4; // which eclipse in the tetrad
  tetradYear?: number;
  visibleFromJerusalem: boolean;
  biblicalSignificance?: string;
  umbralMagnitude: number;
  totalityDuration?: number; // minutes
  moonColor: 'light_orange' | 'orange' | 'deep_orange' | 'blood_red' | 'dark_red';
}
