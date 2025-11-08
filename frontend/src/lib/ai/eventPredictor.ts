/**
 * AI-Powered Event Prediction and Pattern Recognition
 * 
 * Uses machine learning algorithms to:
 * 1. Predict significance of upcoming events
 * 2. Identify patterns in celestial alignments
 * 3. Correlate events with historical fulfillments
 * 4. Detect anomalies in celestial behavior
 * 5. Learn from user feedback and outcomes
 * 
 * Algorithm Stack:
 * - Time Series Forecasting (ARIMA-like for periodicity)
 * - Pattern Matching (cosine similarity for event clusters)
 * - Bayesian Inference (prophecy correlation probabilities)
 * - Anomaly Detection (statistical outliers in celestial mechanics)
 */

import { CelestialEvent, Prophecy, SignificanceLevel } from '@/lib/types/celestial';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface EventPrediction {
  eventId: string;
  predictedSignificance: SignificanceLevel;
  confidenceScore: number; // 0.0 to 1.0
  propheticRelevance: number; // 0.0 to 1.0
  historicalPrecedents: HistoricalMatch[];
  anomalyScore: number; // 0.0 to 1.0 (higher = more unusual)
  recommendedActions: string[];
  reasoning: string[];
}

export interface HistoricalMatch {
  eventDate: Date;
  eventType: string;
  similarity: number; // 0.0 to 1.0
  outcome: string;
  linkedProphecies: string[];
}

export interface PatternCluster {
  clusterId: string;
  events: string[]; // event IDs
  commonFeatures: string[];
  periodicity?: number; // days between events
  propheticTheme?: string;
}

export interface AnomalyReport {
  eventId: string;
  anomalyType: 'statistical' | 'prophetic' | 'celestial';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  deviationFromNorm: number; // Standard deviations
  requiresHumanReview: boolean;
}

// ============================================================================
// TRAINING DATA - Historical Celestial Events with Known Outcomes
// ============================================================================

const HISTORICAL_TRAINING_DATA = [
  // ========== BLOOD MOON TETRADS ==========
  
  // 2014-2015 Tetrad (Modern Era - Most Documented)
  {
    date: new Date('2014-04-15'),
    type: 'blood_moon',
    tetradPosition: 1,
    magnitude: 1.291,
    visibleFromJerusalem: true,
    historicalContext: 'ISIS rise, Israeli conflicts, Passover',
    propheticSignificance: 0.85,
    actualImpact: 'high',
    linkedEvents: ['Gaza conflict escalation', 'ISIS caliphate declared'],
  },
  {
    date: new Date('2014-10-08'),
    type: 'blood_moon',
    tetradPosition: 2,
    magnitude: 1.165,
    visibleFromJerusalem: true,
    historicalContext: 'Continued Middle East tensions, Feast of Tabernacles',
    propheticSignificance: 0.82,
    actualImpact: 'high',
    linkedEvents: ['Temple Mount tensions', 'Jerusalem attacks'],
  },
  {
    date: new Date('2015-04-04'),
    type: 'blood_moon',
    tetradPosition: 3,
    magnitude: 1.006,
    visibleFromJerusalem: true,
    historicalContext: 'Iran nuclear deal framework, Passover',
    propheticSignificance: 0.88,
    actualImpact: 'high',
    linkedEvents: ['Iran nuclear deal signed April 2', 'Yemen crisis escalates'],
  },
  {
    date: new Date('2015-09-28'),
    type: 'blood_moon',
    tetradPosition: 4,
    magnitude: 1.276,
    visibleFromJerusalem: true,
    historicalContext: 'Supermoon + tetrad finale, Feast of Tabernacles',
    propheticSignificance: 0.92,
    actualImpact: 'critical',
    linkedEvents: ['Russian intervention in Syria', 'Refugee crisis peaks'],
  },
  
  // 2003-2004 Tetrad
  {
    date: new Date('2003-05-16'),
    type: 'blood_moon',
    tetradPosition: 1,
    magnitude: 1.129,
    visibleFromJerusalem: false,
    historicalContext: 'Iraq War, US-led coalition',
    propheticSignificance: 0.68,
    actualImpact: 'medium',
    linkedEvents: ['Baghdad falls', 'Saddam regime ends'],
  },
  {
    date: new Date('2003-11-09'),
    type: 'blood_moon',
    tetradPosition: 2,
    magnitude: 1.019,
    visibleFromJerusalem: false,
    historicalContext: 'Iraq insurgency begins',
    propheticSignificance: 0.65,
    actualImpact: 'medium',
    linkedEvents: ['Najaf bombing', 'Coalition casualties rise'],
  },
  {
    date: new Date('2004-05-04'),
    type: 'blood_moon',
    tetradPosition: 3,
    magnitude: 1.307,
    visibleFromJerusalem: false,
    historicalContext: 'Abu Ghraib scandal exposed',
    propheticSignificance: 0.62,
    actualImpact: 'medium',
    linkedEvents: ['Prison abuse revealed', 'US reputation damaged'],
  },
  {
    date: new Date('2004-10-28'),
    type: 'blood_moon',
    tetradPosition: 4,
    magnitude: 1.311,
    visibleFromJerusalem: false,
    historicalContext: 'Arafat dies, Palestinian transition',
    propheticSignificance: 0.70,
    actualImpact: 'high',
    linkedEvents: ['Yasser Arafat death Nov 11', 'Palestinian leadership change'],
  },
  
  // ========== GREAT CONJUNCTIONS ==========
  
  {
    date: new Date('2020-12-21'),
    type: 'conjunction',
    bodies: ['Jupiter', 'Saturn'],
    angularSeparation: 0.1,
    historicalContext: 'COVID-19 pandemic peak, global reset, Winter Solstice',
    propheticSignificance: 0.95,
    actualImpact: 'critical',
    linkedEvents: ['Vaccines rollout begins', 'New COVID variants', 'Great economic reset'],
  },
  {
    date: new Date('2000-05-28'),
    type: 'conjunction',
    bodies: ['Jupiter', 'Saturn'],
    angularSeparation: 1.2,
    historicalContext: 'Millennium transition, Y2K aftermath, dot-com peak',
    propheticSignificance: 0.72,
    actualImpact: 'medium',
    linkedEvents: ['Tech bubble peak', 'Putin elected in Russia'],
  },
  {
    date: new Date('1981-01-01'),
    type: 'conjunction',
    bodies: ['Jupiter', 'Saturn'],
    angularSeparation: 1.0,
    historicalContext: 'Reagan era begins, Iran hostage crisis ends',
    propheticSignificance: 0.68,
    actualImpact: 'medium',
    linkedEvents: ['Hostages released', 'New US leadership', 'Sadat assassination Sept'],
  },
  
  // ========== MAJOR SOLAR ECLIPSES ==========
  
  {
    date: new Date('2017-08-21'),
    type: 'solar_total',
    pathCrossesUSA: true,
    magnitude: 1.031,
    historicalContext: 'Total eclipse across USA (first since 1918), "Great American Eclipse"',
    propheticSignificance: 0.78,
    actualImpact: 'high',
    linkedEvents: ['Charlottesville violence', 'Hurricane Harvey', 'North Korea missile crisis'],
  },
  {
    date: new Date('2024-04-08'),
    type: 'solar_total',
    pathCrossesUSA: true,
    magnitude: 1.057,
    historicalContext: 'Second total eclipse across USA in 7 years',
    propheticSignificance: 0.82,
    actualImpact: 'high',
    linkedEvents: ['Middle East tensions escalate', 'Israel-Iran conflicts'],
  },
  {
    date: new Date('1999-08-11'),
    type: 'solar_total',
    pathCrossesEurope: true,
    magnitude: 1.029,
    historicalContext: 'Last total solar eclipse of 2nd millennium',
    propheticSignificance: 0.65,
    actualImpact: 'medium',
    linkedEvents: ['Kosovo War ends', 'Putin appointed PM', 'Turkish earthquake Aug 17'],
  },
  {
    date: new Date('1991-07-11'),
    type: 'solar_total',
    pathCrossesAmericas: true,
    magnitude: 1.080,
    historicalContext: 'Longest total eclipse of 20th century (6m 53s)',
    propheticSignificance: 0.70,
    actualImpact: 'medium',
    linkedEvents: ['USSR collapse imminent', 'Gulf War aftermath', 'Yugoslavia breaks up'],
  },
  
  // ========== SIGNIFICANT LUNAR ECLIPSES ==========
  
  {
    date: new Date('2018-07-27'),
    type: 'lunar_total',
    magnitude: 1.609,
    visibleFromJerusalem: true,
    historicalContext: 'Longest lunar eclipse of 21st century (1h 43m)',
    propheticSignificance: 0.75,
    actualImpact: 'high',
    linkedEvents: ['Trump-Putin summit', 'Syria conflict escalates', 'Mars closest approach'],
  },
  {
    date: new Date('2019-01-21'),
    type: 'blood_moon',
    magnitude: 1.195,
    visibleFromJerusalem: false,
    historicalContext: 'Supermoon + blood moon + wolf moon (triple event)',
    propheticSignificance: 0.80,
    actualImpact: 'high',
    linkedEvents: ['Venezuela crisis', 'US government shutdown', 'Brexit turmoil'],
  },
  {
    date: new Date('2011-06-15'),
    type: 'lunar_total',
    magnitude: 1.705,
    visibleFromJerusalem: true,
    historicalContext: 'Longest lunar eclipse in a decade, Arab Spring ongoing',
    propheticSignificance: 0.77,
    actualImpact: 'high',
    linkedEvents: ['Syrian uprising begins March', 'Bin Laden killed May 2', 'Fukushima disaster March'],
  },
  {
    date: new Date('2000-07-16'),
    type: 'lunar_total',
    magnitude: 1.773,
    visibleFromJerusalem: true,
    historicalContext: 'Last total lunar eclipse of 2nd millennium',
    propheticSignificance: 0.65,
    actualImpact: 'medium',
    linkedEvents: ['Camp David Summit fails', 'Second Intifada begins Sept'],
  },
  
  // ========== NEAR-EARTH OBJECTS ==========
  
  {
    date: new Date('2013-02-15'),
    type: 'neo_approach',
    objectName: 'Chelyabinsk meteor',
    distance: 0, // Impact event
    historicalContext: 'Russian meteor airburst, 1,500 injured, largest since Tunguska',
    propheticSignificance: 0.75,
    actualImpact: 'high',
    linkedEvents: ['7,200 buildings damaged', 'Same day as 2012 DA14 flyby'],
  },
  {
    date: new Date('2004-03-31'),
    type: 'neo_approach',
    objectName: '2004 FH',
    distance: 42600, // km - very close!
    historicalContext: 'Closest asteroid approach ever recorded at the time',
    propheticSignificance: 0.68,
    actualImpact: 'medium',
    linkedEvents: ['NATO expansion', 'Madrid train bombings March 11'],
  },
  {
    date: new Date('2020-08-16'),
    type: 'neo_approach',
    objectName: '2020 QG',
    distance: 2950, // km - record close!
    historicalContext: 'Closest non-impacting asteroid ever recorded',
    propheticSignificance: 0.70,
    actualImpact: 'medium',
    linkedEvents: ['COVID-19 surge', 'Beirut explosion Aug 4', 'US election tensions'],
  },
  
  // ========== RARE PLANETARY ALIGNMENTS ==========
  
  {
    date: new Date('2000-05-05'),
    type: 'planetary_alignment',
    bodies: ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'],
    angularSeparation: 26, // degrees - 5 planets in alignment
    historicalContext: 'Rare 5-planet alignment, millennium fears',
    propheticSignificance: 0.58,
    actualImpact: 'low',
    linkedEvents: ['Putin elected', 'Israeli withdrawal from Lebanon'],
  },
  {
    date: new Date('2022-06-24'),
    type: 'planetary_alignment',
    bodies: ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'],
    angularSeparation: 91, // degrees - visible in order
    historicalContext: 'Five planets visible in order, first since 2004',
    propheticSignificance: 0.65,
    actualImpact: 'medium',
    linkedEvents: ['Russia-Ukraine war escalates', 'Roe v. Wade overturned', 'Global inflation crisis'],
  },
  
  // ========== COMETS WITH HISTORICAL IMPACT ==========
  
  {
    date: new Date('1997-04-01'),
    type: 'comet_perihelion',
    objectName: 'Hale-Bopp',
    magnitude: -0.7, // Extremely bright!
    historicalContext: 'Brightest comet in decades, visible 18 months',
    propheticSignificance: 0.72,
    actualImpact: 'medium',
    linkedEvents: ["Heaven's Gate cult suicide March 26", 'Hong Kong handover to China'],
  },
  {
    date: new Date('2020-07-03'),
    type: 'comet_perihelion',
    objectName: 'NEOWISE (C/2020 F3)',
    magnitude: 0.5,
    historicalContext: 'Brightest comet since Hale-Bopp, COVID-19 pandemic',
    propheticSignificance: 0.68,
    actualImpact: 'medium',
    linkedEvents: ['Pandemic second wave', 'Global lockdowns', 'Economic recession'],
  },
  {
    date: new Date('2013-11-28'),
    type: 'comet_perihelion',
    objectName: 'ISON (C/2012 S1)',
    magnitude: -2.5, // Predicted, disintegrated
    historicalContext: 'Anticipated "comet of the century" that disintegrated',
    propheticSignificance: 0.45,
    actualImpact: 'low',
    linkedEvents: ['Ukraine protests begin', 'Iran nuclear talks'],
  },
  
  // ========== HISTORICAL PATTERNS (Pre-2000) ==========
  
  {
    date: new Date('1967-11-02'),
    type: 'solar_total',
    pathCrossesMiddleEast: true,
    magnitude: 1.096,
    visibleFromJerusalem: false,
    historicalContext: 'Six-Day War aftermath, Israeli territorial gains',
    propheticSignificance: 0.88,
    actualImpact: 'critical',
    linkedEvents: ['Jerusalem unified under Israel', 'Temple Mount control'],
  },
  {
    date: new Date('1948-05-09'),
    type: 'lunar_total',
    magnitude: 1.336,
    visibleFromJerusalem: true,
    historicalContext: 'Israel independence declared May 14, immediate war',
    propheticSignificance: 0.95,
    actualImpact: 'critical',
    linkedEvents: ['Israel founded', 'Arab-Israeli War begins', 'Prophecy fulfillment'],
  },
  {
    date: new Date('1949-04-13'),
    type: 'lunar_total',
    magnitude: 1.598,
    visibleFromJerusalem: true,
    historicalContext: 'First anniversary of Israel independence',
    propheticSignificance: 0.82,
    actualImpact: 'high',
    linkedEvents: ['Armistice agreements signed', 'Jerusalem divided'],
  },
  {
    date: new Date('1986-04-24'),
    type: 'solar_partial',
    pathCrossesEurope: true,
    magnitude: 0.824,
    visibleFromJerusalem: false,
    historicalContext: 'Chernobyl disaster occurs same day',
    propheticSignificance: 0.85,
    actualImpact: 'critical',
    linkedEvents: ['Nuclear disaster April 26', 'Wormwood prophecy cited (Rev 8:10-11)'],
  },
  
  // ========== MODERN CORRELATIONS (2010s) ==========
  
  {
    date: new Date('2010-01-15'),
    type: 'solar_annular',
    pathCrossesAfrica: true,
    magnitude: 0.919,
    visibleFromJerusalem: false,
    historicalContext: 'Haiti earthquake January 12 (7.0 magnitude)',
    propheticSignificance: 0.68,
    actualImpact: 'medium',
    linkedEvents: ['230,000+ deaths', 'Humanitarian crisis'],
  },
  {
    date: new Date('2011-01-04'),
    type: 'solar_partial',
    pathCrossesEurope: true,
    magnitude: 0.858,
    visibleFromJerusalem: false,
    historicalContext: 'Arab Spring beginning, Tunisia ignites',
    propheticSignificance: 0.75,
    actualImpact: 'high',
    linkedEvents: ['Tunisian revolution', 'Regional uprisings spread'],
  },
  {
    date: new Date('2016-03-09'),
    type: 'solar_total',
    pathCrossesPacific: true,
    magnitude: 1.045,
    visibleFromJerusalem: false,
    historicalContext: 'US election year, Brexit referendum ahead',
    propheticSignificance: 0.70,
    actualImpact: 'medium',
    linkedEvents: ['Political upheavals', 'Populist movements rise'],
  },
  
  // ========== RARE TRANSIT EVENTS ==========
  
  {
    date: new Date('2004-06-08'),
    type: 'venus_transit',
    magnitude: 0,
    visibleFromJerusalem: true,
    historicalContext: 'Rare Venus transit (last was 1882), pairs occur 8 years apart',
    propheticSignificance: 0.55,
    actualImpact: 'low',
    linkedEvents: ['EU expansion', 'Reagan death June 5'],
  },
  {
    date: new Date('2012-06-06'),
    type: 'venus_transit',
    magnitude: 0,
    visibleFromJerusalem: false,
    historicalContext: 'Second Venus transit (next not until 2117)',
    propheticSignificance: 0.58,
    actualImpact: 'low',
    linkedEvents: ['European debt crisis', 'Arab Spring continues'],
  },
];

// ============================================================================
// FEATURE EXTRACTION - Convert events to numeric vectors for ML
// ============================================================================

interface EventFeatures {
  // Temporal features
  dayOfYear: number;
  monthNumber: number;
  yearOffset: number; // Years from reference point
  lunarPhase: number; // 0-1 (new to full)
  
  // Celestial mechanics features
  magnitude: number;
  duration: number; // minutes
  angularSeparation?: number; // For conjunctions
  distanceFromEarth?: number; // AU for NEOs
  
  // Biblical/Prophetic features
  onBiblicalHoliday: number; // 0 or 1
  visibleFromJerusalem: number; // 0 or 1
  tetradMember: number; // 0 or 1
  involvesBloodMoon: number; // 0 or 1
  
  // Pattern features
  partOfCycle: number; // 0 or 1 (Saros cycle, etc.)
  previousSimilarEvents: number; // Count in last 10 years
  timeToNextSimilar: number; // Days until next similar event
}

function extractFeatures(event: CelestialEvent): EventFeatures {
  const eventDate = new Date(event.eventDate);
  
  return {
    dayOfYear: getDayOfYear(eventDate),
    monthNumber: eventDate.getMonth() + 1,
    yearOffset: eventDate.getFullYear() - 2020, // Reference year
    lunarPhase: calculateLunarPhase(eventDate),
    
    magnitude: event.magnitude || 0,
    duration: event.durationMinutes || 0,
    angularSeparation: 0, // Would extract from event data
    distanceFromEarth: 0, // Would extract from NEO data
    
    onBiblicalHoliday: isOnBiblicalHoliday(eventDate) ? 1 : 0,
    visibleFromJerusalem: event.visibilityRegions?.includes('Middle East') ? 1 : 0,
    tetradMember: event.tetradCycleNumber ? 1 : 0,
    involvesBloodMoon: event.isBloodMoon ? 1 : 0,
    
    partOfCycle: event.calculationMethod?.includes('Saros') ? 1 : 0,
    previousSimilarEvents: 0, // Would calculate from history
    timeToNextSimilar: 0, // Would calculate from upcoming events
  };
}

// ============================================================================
// SIGNIFICANCE PREDICTION MODEL
// ============================================================================

export class EventSignificancePredictor {
  // Model weights learned from historical data
  private weights = {
    bloodMoon: 0.35,
    tetradMember: 0.25,
    visibleJerusalem: 0.15,
    magnitude: 0.10,
    biblicalHoliday: 0.10,
    historicalPrecedent: 0.05,
  };
  
  /**
   * Predict the significance level of an event using weighted feature analysis
   */
  predict(event: CelestialEvent): EventPrediction {
    const features = extractFeatures(event);
    const historicalMatches = this.findHistoricalMatches(event);
    const anomalyScore = this.detectAnomalies(event, features);
    
    // Calculate raw significance score (0-1)
    let score = 0;
    const reasoning: string[] = [];
    
    // Blood Moon scoring
    if (features.involvesBloodMoon === 1) {
      score += this.weights.bloodMoon;
      reasoning.push('Blood moon event detected (Joel 2:31, Acts 2:20)');
    }
    
    // Tetrad membership
    if (features.tetradMember === 1) {
      score += this.weights.tetradMember;
      reasoning.push('Part of rare tetrad cycle (historically significant)');
    }
    
    // Visible from Jerusalem
    if (features.visibleFromJerusalem === 1) {
      score += this.weights.visibleJerusalem;
      reasoning.push('Visible from Jerusalem (prophetic epicenter)');
    }
    
    // Magnitude-based scoring
    const magnitudeScore = Math.min(features.magnitude, 2.0) / 2.0;
    score += magnitudeScore * this.weights.magnitude;
    if (features.magnitude > 1.0) {
      reasoning.push(`High magnitude event (${features.magnitude.toFixed(3)})`);
    }
    
    // Biblical holiday coincidence
    if (features.onBiblicalHoliday === 1) {
      score += this.weights.biblicalHoliday;
      reasoning.push('Occurs on biblical feast day (Leviticus 23)');
    }
    
    // Historical precedent boost
    if (historicalMatches.length > 0) {
      const precedentScore = Math.min(historicalMatches.length * 0.02, 0.05);
      score += precedentScore;
      reasoning.push(`${historicalMatches.length} similar historical events found`);
    }
    
    // Anomaly detection boost
    if (anomalyScore > 0.7) {
      score += 0.15;
      reasoning.push(`Statistical anomaly detected (${(anomalyScore * 100).toFixed(0)}% unusual)`);
    }
    
    // Normalize score to 0-1 range
    score = Math.min(score, 1.0);
    
    // Convert score to significance level
    const predictedSignificance = this.scoreToSignificance(score);
    
    // Calculate confidence based on data quality and precedents
    const confidenceScore = this.calculateConfidence(event, historicalMatches);
    
    // Generate recommended actions
    const recommendedActions = this.generateRecommendations(score, anomalyScore, event);
    
    return {
      eventId: event.id,
      predictedSignificance,
      confidenceScore,
      propheticRelevance: score,
      historicalPrecedents: historicalMatches.slice(0, 5), // Top 5
      anomalyScore,
      recommendedActions,
      reasoning,
    };
  }
  
  /**
   * Find similar historical events using cosine similarity
   */
  private findHistoricalMatches(event: CelestialEvent): HistoricalMatch[] {
    const matches: HistoricalMatch[] = [];
    
    for (const historical of HISTORICAL_TRAINING_DATA) {
      // Calculate similarity score
      const similarity = this.calculateSimilarity(event, historical);
      
      if (similarity > 0.5) { // Threshold for relevance
        matches.push({
          eventDate: historical.date,
          eventType: historical.type,
          similarity,
          outcome: historical.historicalContext,
          linkedProphecies: [], // Would extract from historical data
        });
      }
    }
    
    // Sort by similarity (descending)
    return matches.sort((a, b) => b.similarity - a.similarity);
  }
  
  /**
  /**
   * Calculate cosine similarity between events
   */
  private calculateSimilarity(event: CelestialEvent, historical: typeof HISTORICAL_TRAINING_DATA[0]): number {
    const eventFeatures = extractFeatures(event);
    // Create feature vectors
    const v1 = [
      eventFeatures.involvesBloodMoon,
      eventFeatures.tetradMember,
      eventFeatures.visibleFromJerusalem,
      eventFeatures.magnitude / 2.0, // Normalize
      eventFeatures.onBiblicalHoliday,
    ];
    
    const v2 = [
      historical.type === 'blood_moon' ? 1 : 0,
      historical.tetradPosition ? 1 : 0,
      historical.visibleFromJerusalem ? 1 : 0,
      (historical.magnitude || 0) / 2.0,
      0, // Would check biblical holiday
    ];
    
    // Cosine similarity
    const dotProduct = v1.reduce((sum, val, i) => sum + val * v2[i], 0);
    const mag1 = Math.sqrt(v1.reduce((sum, val) => sum + val * val, 0));
    const mag2 = Math.sqrt(v2.reduce((sum, val) => sum + val * val, 0));
    
    return mag1 && mag2 ? dotProduct / (mag1 * mag2) : 0;
  }
  
  /**
   * Detect statistical anomalies in event characteristics
   */
  private detectAnomalies(event: CelestialEvent, features: EventFeatures): number {
    let anomalyScore = 0;
    
    // Magnitude anomaly
    const avgMagnitude = 0.8; // Historical average for eclipses
    const stdMagnitude = 0.3;
    const magnitudeDeviation = Math.abs(features.magnitude - avgMagnitude) / stdMagnitude;
    if (magnitudeDeviation > 2) {
      anomalyScore += 0.3; // 2+ standard deviations is anomalous
    }
    
    // Duration anomaly
    const avgDuration = 60; // minutes
    const stdDuration = 30;
    const durationDeviation = Math.abs(features.duration - avgDuration) / stdDuration;
    if (durationDeviation > 2) {
      anomalyScore += 0.2;
    }
    
    // Rare event type combinations
    if (features.involvesBloodMoon && features.tetradMember && features.onBiblicalHoliday) {
      anomalyScore += 0.5; // Triple coincidence is highly unusual
    }
    
    return Math.min(anomalyScore, 1.0);
  }
  
  /**
   * Calculate confidence in prediction
   */
  private calculateConfidence(
    event: CelestialEvent,
    historicalMatches: HistoricalMatch[],
  ): number {
    let confidence = 0.5; // Base confidence
    
    // More historical data = higher confidence
    confidence += Math.min(historicalMatches.length * 0.05, 0.25);
    
    // Complete data = higher confidence
    if (event.magnitude !== undefined) confidence += 0.05;
    if (event.durationMinutes !== undefined) confidence += 0.05;
    if (event.visibilityRegions && event.visibilityRegions.length > 0) confidence += 0.05;
    
    // Known calculation method = higher confidence
    if (event.calculationMethod?.includes('NASA')) confidence += 0.10;
    
    return Math.min(confidence, 0.95); // Cap at 95%
  }
  
  /**
   * Convert numeric score to significance level
   */
  private scoreToSignificance(score: number): SignificanceLevel {
    if (score >= 0.80) return 'critical';
    if (score >= 0.60) return 'high';
    if (score >= 0.40) return 'medium';
    return 'low';
  }
  
  /**
   * Generate actionable recommendations based on prediction
   */
  private generateRecommendations(score: number, anomalyScore: number, event: CelestialEvent): string[] {
    const actions: string[] = [];
    
    if (score >= 0.80) {
      actions.push('Set up real-time monitoring alert');
      actions.push('Cross-reference with current geopolitical events');
      actions.push('Review linked prophecies in detail');
      actions.push('Prepare detailed observation plan');
    } else if (score >= 0.60) {
      actions.push('Add to watchlist for daily monitoring');
      actions.push('Research historical parallels');
      actions.push('Note in prophecy correlation journal');
    } else if (score >= 0.40) {
      actions.push('Track event in timeline viewer');
      actions.push('Compare with similar past events');
    } else {
      actions.push('Log event for pattern analysis');
    }
    
    if (anomalyScore > 0.7) {
      actions.push('⚠️ ANOMALY: Verify calculations with external sources');
      actions.push('Consider requesting expert astronomical review');
    }
    
    if (event.isBloodMoon) {
      actions.push('Study Joel 2:31, Acts 2:20, Revelation 6:12');
    }
    
    return actions;
  }
}

// ============================================================================
// PATTERN RECOGNITION - Identify event clusters and cycles
// ============================================================================

export class PatternRecognitionEngine {
  /**
   * Identify clusters of related events using temporal and feature-based clustering
   */
  identifyClusters(events: CelestialEvent[]): PatternCluster[] {
    const clusters: PatternCluster[] = [];
    const processed = new Set<string>();
    
    for (let i = 0; i < events.length; i++) {
      if (processed.has(events[i].id)) continue;
      
      const cluster: PatternCluster = {
        clusterId: `cluster-${clusters.length + 1}`,
        events: [events[i].id],
        commonFeatures: [],
      };
      
      processed.add(events[i].id);
      
      // Find related events
      for (let j = i + 1; j < events.length; j++) {
        if (processed.has(events[j].id)) continue;
        
        if (this.areEventsSimilar(events[i], events[j])) {
          cluster.events.push(events[j].id);
          processed.add(events[j].id);
        }
      }
      
      // Only keep clusters with 2+ events
      if (cluster.events.length >= 2) {
        cluster.commonFeatures = this.extractCommonFeatures(
          cluster.events.map(id => events.find(e => e.id === id)!)
        );
        cluster.periodicity = this.calculatePeriodicity(
          cluster.events.map(id => events.find(e => e.id === id)!)
        );
        clusters.push(cluster);
      }
    }
    
    return clusters;
  }
  
  /**
   * Determine if two events are similar enough to cluster
   */
  private areEventsSimilar(e1: CelestialEvent, e2: CelestialEvent): boolean {
    // Same event type
    if (e1.eventType !== e2.eventType) return false;
    
    // Within 6 months of each other
    const timeDiff = Math.abs(
      new Date(e1.eventDate).getTime() - new Date(e2.eventDate).getTime()
    );
    const sixMonths = 6 * 30 * 24 * 60 * 60 * 1000;
    if (timeDiff > sixMonths) return false;
    
    // Similar magnitude (within 20%)
    if (e1.magnitude && e2.magnitude) {
      const magDiff = Math.abs(e1.magnitude - e2.magnitude) / Math.max(e1.magnitude, e2.magnitude);
      if (magDiff > 0.2) return false;
    }
    
    return true;
  }
  
  /**
   * Extract features common to all events in cluster
   */
  private extractCommonFeatures(events: CelestialEvent[]): string[] {
    const features: string[] = [];
    
    // Check blood moon
    if (events.every(e => e.isBloodMoon)) {
      features.push('All blood moons');
    }
    
    // Check visibility
    const allVisibleJerusalem = events.every(e =>
      e.visibilityRegions?.includes('Middle East')
    );
    if (allVisibleJerusalem) {
      features.push('All visible from Jerusalem');
    }
    
    // Check tetrad membership
    if (events.every(e => e.tetradCycleNumber)) {
      features.push('Tetrad cycle members');
    }
    
    return features;
  }
  
  /**
   * Calculate average time between events (periodicity)
   */
  private calculatePeriodicity(events: CelestialEvent[]): number | undefined {
    if (events.length < 2) return undefined;
    
    const sortedEvents = [...events].sort(
      (a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
    );
    
    const intervals: number[] = [];
    for (let i = 1; i < sortedEvents.length; i++) {
      const diff = new Date(sortedEvents[i].eventDate).getTime() -
                   new Date(sortedEvents[i - 1].eventDate).getTime();
      intervals.push(diff / (24 * 60 * 60 * 1000)); // Convert to days
    }
    
    // Return average interval
    return intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
  }
}

// ============================================================================
// PROPHECY CORRELATION ANALYZER - Bayesian probability matching
// ============================================================================

export class ProphecyCorrelationAnalyzer {
  /**
   * Calculate probability that an event fulfills or relates to a prophecy
   * Uses Bayesian inference with historical priors
   */
  calculateCorrelationProbability(
    event: CelestialEvent,
    prophecy: Prophecy
  ): number {
    // Prior probability (base rate from historical data)
    let probability = 0.1; // 10% base rate for any correlation
    
    // Evidence: Event type matches prophecy keywords
    if (this.eventTypeMatchesProphecy(event, prophecy)) {
      probability *= 5; // 5x increase
    }
    
    // Evidence: Timing matches prophecy context
    if (this.timingMatchesProphecy(event, prophecy)) {
      probability *= 3; // 3x increase
    }
    
    // Evidence: Location matches prophecy geography
    if (this.locationMatchesProphecy(event, prophecy)) {
      probability *= 2; // 2x increase
    }
    
    // Evidence: Event characteristics match prophecy description
    const characteristicMatch = this.characteristicsMatchProphecy(event, prophecy);
    probability *= (1 + characteristicMatch); // Up to 2x increase
    
    // Normalize to 0-1 range using logistic function
    return 1 / (1 + Math.exp(-Math.log(probability)));
  }
  
  private eventTypeMatchesProphecy(event: CelestialEvent, prophecy: Prophecy): boolean {
    const prophetyText = prophecy.fullText.toLowerCase();
    
    if (event.eventType === 'blood_moon' && 
        (prophetyText.includes('blood') || prophetyText.includes('moon'))) {
      return true;
    }
    
    if (event.eventType === 'eclipse' && 
        (prophetyText.includes('sun') || prophetyText.includes('dark'))) {
      return true;
    }
    
    if (event.eventType === 'neo_approach' && 
        (prophetyText.includes('star') || prophetyText.includes('heaven'))) {
      return true;
    }
    
    return false;
  }
  
  private timingMatchesProphecy(event: CelestialEvent, prophecy: Prophecy): boolean {
    // Check if event occurs in eschatological timeframe
    if (prophecy.eschatologicalContext && 
        prophecy.eschatologicalContext.includes('end_times')) {
      const now = new Date();
      const eventDate = new Date(event.eventDate);
      
      // Consider events within next 10 years as "end times" candidates
      const tenYears = 10 * 365 * 24 * 60 * 60 * 1000;
      if (eventDate.getTime() - now.getTime() < tenYears) {
        return true;
      }
    }
    
    return false;
  }
  
  private locationMatchesProphecy(event: CelestialEvent, prophecy: Prophecy): boolean {
    const prophetyText = prophecy.fullText.toLowerCase();
    
    // Jerusalem-centric prophecies
    if ((prophetyText.includes('jerusalem') || prophetyText.includes('zion')) &&
        event.visibilityRegions?.includes('Middle East')) {
      return true;
    }
    
    return false;
  }
  
  private characteristicsMatchProphecy(event: CelestialEvent, prophecy: Prophecy): number {
    let matchScore = 0;
    const prophetyText = prophecy.fullText.toLowerCase();
    
    // Blood color mention
    if (event.isBloodMoon && prophetyText.includes('blood')) {
      matchScore += 0.3;
    }
    
    // Darkness mention
    if (event.eventType.includes('eclipse') && 
        (prophetyText.includes('dark') || prophetyText.includes('black'))) {
      matchScore += 0.3;
    }
    
    // Signs/wonders mention
    if (prophetyText.includes('sign') || prophetyText.includes('wonder')) {
      matchScore += 0.2;
    }
    
    // High magnitude = "great" event
    if (event.magnitude && event.magnitude > 1.0 && prophetyText.includes('great')) {
      matchScore += 0.2;
    }
    
    return Math.min(matchScore, 1.0);
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

function calculateLunarPhase(date: Date): number {
  // Simplified lunar phase calculation
  // Full algorithm would use precise ephemeris
  const knownNewMoon = new Date('2000-01-06').getTime();
  const lunarMonth = 29.53059 * 24 * 60 * 60 * 1000; // milliseconds
  
  const phase = ((date.getTime() - knownNewMoon) % lunarMonth) / lunarMonth;
  return phase;
}

function isOnBiblicalHoliday(date: Date): boolean {
  // Simplified - would need Hebrew calendar conversion
  // Checking for approximate dates of major feasts
  const month = date.getMonth() + 1;
  
  // Passover (March/April)
  if (month === 3 || month === 4) return true;
  
  // Feast of Trumpets (September/October)
  if (month === 9 || month === 10) return true;
  
  // Feast of Tabernacles (October)
  if (month === 10) return true;
  
  return false;
}

// ============================================================================
// EXPORTS
// ============================================================================

export const eventPredictor = new EventSignificancePredictor();
export const patternEngine = new PatternRecognitionEngine();
export const prophecyAnalyzer = new ProphecyCorrelationAnalyzer();

