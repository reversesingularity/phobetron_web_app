# Phobetron Prophetic Correlation System

## 🌟 Overview

The Prophetic Correlation System is a comprehensive AI-powered platform that correlates celestial phenomena and natural disasters with biblical prophecies. This implementation fulfills the vision outlined in the MASTERPIECE_ACHIEVEMENT_SUMMARY document.

## ✨ Key Features

### 1. **Watchman's View** (Main Prophetic Dashboard)
- **Hebrew Feast Correlation**: Automatically correlates events with 10 biblical feast days
- **AI Significance Prediction**: Machine learning predictions based on 42+ historical training events
- **100-Point Scoring System**: 
  - Feast Significance (40 points)
  - Proximity (40 points)
  - Event Significance (20 points)
- **Real-time Event Monitoring**: Live earthquake data + celestial event tracking
- **Theological Framework Display**: Literal premillennial eschatology

**Route**: `/watchmans-view`

### 2. **Alerts System** (Prophetic Signature Detection)
- **6 Alert Types**:
  - Critical Events (blood moons on feast days)
  - Pattern Detection (earthquake clusters)
  - Feast Alignments (planetary conjunctions)
  - Anomaly Detection (unusual solar activity)
  - Confidence Increases (AI prediction upgrades)
  - Prediction Changes (significance upgrades)
- **3 Severity Levels**: Critical, Warning, Info
- **Action Required Flagging**: Prioritizes events needing attention
- **Biblical References**: Automatic scripture linking

**Route**: `/alerts`

### 3. **Prophecy Codex** (Biblical Database)
- **10 Core Prophecies** with room for expansion
- **Multi-Language Support**:
  - Hebrew words (Strong's concordance)
  - Greek words (Strong's concordance)
  - Aramaic support ready
- **Categories**: Celestial, Seismic, Judgment, Deliverance, End Times, Restoration
- **Fulfillment Status**: Fulfilled, Partial, Future, Ongoing
- **Cross-References**: Related prophecy linking
- **Detailed Modal Views**: Full word-by-word analysis

**Route**: `/prophecy-codex`

## 📚 Core Libraries

### Hebrew Calendar System (`hebrewCalendar.ts`)
Calculates 10 biblical feasts using the Gauss Passover algorithm:

**Spring Feasts**:
1. Passover (Pesach) - Nissan 14
2. Unleavened Bread - Nissan 15-21
3. First Fruits - Day after Sabbath during Unleavened Bread
4. Pentecost (Shavuot) - 50 days after First Fruits

**Fall Feasts**:
5. Trumpets (Rosh Hashanah) - Tishrei 1
6. Day of Atonement (Yom Kippur) - Tishrei 10
7. Tabernacles (Sukkot) - Tishrei 15-21
8. Eighth Day (Shemini Atzeret) - Tishrei 22

**Other**:
9. Purim - Adar 14
10. Hanukkah - Kislev 25 - Tevet 2

**Key Functions**:
```typescript
calculatePassover(year: number): Date
getHebrewFeastsForYear(year: number): HebrewFeast[]
getFeastProximity(date: Date, toleranceDays?: number): FeastProximity | null
getFeastsInRange(startDate: Date, endDate: Date): HebrewFeast[]
```

### Feast Correlation Engine (`feastCorrelation.ts`)
Implements the 100-point scoring system:

**Scoring Breakdown**:
- **Feast Significance** (40 pts): High=40, Medium=25, Low=10
- **Proximity** (40 pts): 0 days=40, 1 day=30, 2 days=20, 3 days=10
- **Event Significance** (20 pts): Critical=20, High=15, Medium=10, Low=5

**Thresholds**:
- **Critical**: 85-100 (Immediate attention)
- **High**: 70-84 (Close monitoring)
- **Medium**: 50-69 (Track for patterns)
- **Low**: 0-49 (Background awareness)

**Key Functions**:
```typescript
calculateCorrelationScore(feastProximity, eventSignificance): number
checkCelestialFeastCorrelation(event, toleranceDays?): FeastCorrelation | null
checkEarthFeastCorrelation(event, toleranceDays?): FeastCorrelation | null
filterEventsWithFeastCorrelations(events, toleranceDays?, minScore?): FeastCorrelation[]
getCorrelationStats(correlations): Stats
```

### AI Event Predictor (`eventPredictor.ts`)
Machine learning predictions based on historical training data:

**Training Data**: 42 significant events (1948-2024)
- 8 Blood Moon Tetrad events
- 3 Great Conjunctions (including Dec 21, 2020 COVID conjunction)
- 11 Major Solar Eclipses
- 7 Lunar Eclipses
- 5 NEO Close Approaches
- 8 Rare Events (including Israel 1948 founding)

**Feature Extraction** (14-dimensional vector):
- **Temporal** (4): Day of year, lunar phase, biblical holiday proximity, Hebrew year
- **Celestial** (6): Type score, magnitude, duration, visibility, angular size, frequency
- **Prophetic** (4): Tetrad membership, Jerusalem visibility, historical precedent, keyword match

**Algorithms**:
- **Weighted Feature Analysis**: 35% blood moon, 25% tetrad, 15% Jerusalem, 10% magnitude, 10% biblical holiday, 5% historical
- **Cosine Similarity**: Pattern matching with historical events
- **Anomaly Detection**: Statistical outlier identification (2σ threshold)
- **Confidence Calculation**: 50% base + bonuses, capped at 95% (epistemic humility)

**Key Functions**:
```typescript
predictEventSignificance(event: CelestialEvent): EventPrediction
// Returns: predictedSignificance, confidenceScore, reasoning, precedents, anomalyScore
```

## 🎯 Theological Framework

### Eschatology
**Literal, Premillennial Interpretation**
- Physical return of Christ
- 1,000-year Millennial Kingdom
- Literal fulfillment of prophecy

### Key Scriptures
**Celestial Signs**:
- Matthew 24:29 - "Sun darkened, moon not give light, stars fall"
- Luke 21:25 - "Signs in sun, moon, stars"
- Joel 2:31 - "Sun turned to darkness, moon to blood"
- Acts 2:20 - "Sun to darkness, moon to blood"
- Revelation 6:12 - "Great earthquake, sun black, moon blood"

**Seismic Events (σεισμός - seismos)**:
- Matthew 24:7 - "Earthquakes in various places"
- Luke 21:11 - "Great earthquakes"
- Mark 13:8 - "Earthquakes in various places"
- Revelation 6:12 - "Great earthquake (σεισμός)"

### Correlation Focus
**Primary**: Celestial signs (sun, moon, stars) + Seismic activity (earthquakes, volcanic, geomagnetic)

**Secondary**: Solar events (flares, CMEs) + Temporal patterns (feast day alignments)

### Scholarly Approach
- Respectful of biblical text
- Evidence-based pattern analysis
- Transparent AI methodology
- Epistemic humility (95% max confidence)

## 🚀 Usage Examples

### Check if date is near a feast
```typescript
import { getFeastProximity } from '@/lib/utils/hebrewCalendar'

const proximity = getFeastProximity(new Date('2025-04-14'))
if (proximity) {
  console.log(`${proximity.daysAway} days from ${proximity.feast.name}`)
}
```

### Calculate feast correlation
```typescript
import { checkCelestialFeastCorrelation } from '@/lib/utils/feastCorrelation'

const event: CelestialEvent = {
  id: 'blood-moon-2025',
  type: 'blood_moon',
  date: new Date('2025-04-14'),
  name: 'Total Lunar Eclipse',
  // ... other fields
}

const correlation = checkCelestialFeastCorrelation(event)
if (correlation) {
  console.log(`Correlation score: ${correlation.correlationScore}/100`)
  console.log(`Significance: ${correlation.significance}`)
  console.log('Reasoning:', correlation.reasoning)
}
```

### Get AI prediction
```typescript
import { predictEventSignificance } from '@/lib/ai/eventPredictor'

const prediction = predictEventSignificance(event)
console.log(`Predicted significance: ${prediction.predictedSignificance}`)
console.log(`Confidence: ${(prediction.confidenceScore * 100).toFixed(0)}%`)
console.log(`Is anomaly: ${prediction.isAnomaly}`)
console.log('Historical precedents:', prediction.historicalPrecedents)
```

## 📊 Data Flow

```
1. USER VISITS WATCHMAN'S VIEW
   ↓
2. LOAD HEBREW FEASTS (hebrewCalendar.ts)
   getFeastsInRange(startDate, endDate) → HebrewFeast[]
   ↓
3. LOAD CELESTIAL EVENTS (mock data / API)
   generateMockCelestialEvents() → CelestialEvent[]
   ↓
4. LOAD EARTH EVENTS (API)
   earthquakesAPI.getAll() → Earthquake[] → EarthEvent[]
   ↓
5. CALCULATE FEAST CORRELATIONS (feastCorrelation.ts)
   filterEventsWithFeastCorrelations(allEvents) → FeastCorrelation[]
   ↓
6. GENERATE AI PREDICTIONS (eventPredictor.ts)
   predictEventSignificance(event) → EventPrediction
   ↓
7. DISPLAY CORRELATED DATA
   - Statistics grid (total, critical, high, feast count, avg score)
   - Hebrew feasts timeline with event counts
   - Events table with feast correlation + AI prediction columns
   - Critical alerts for 85+ correlation scores
```

## 🎨 UI Color Coding

### Severity Colors
- **Critical**: Red (`bg-red-500/10 text-red-300 border-red-500/30`)
- **High**: Orange (`bg-orange-500/10 text-orange-300 border-orange-500/30`)
- **Medium**: Yellow (`bg-yellow-500/10 text-yellow-300 border-yellow-500/30`)
- **Low**: Blue (`bg-blue-500/10 text-blue-300 border-blue-500/30`)

### Event Type Colors
- **Blood Moon**: Red
- **Solar Eclipse**: Orange
- **Lunar Eclipse**: Purple
- **Conjunction**: Blue
- **Earthquake**: Yellow
- **Volcanic**: Red
- **Geomagnetic**: Purple
- **Solar Flare**: Orange

## 🔧 Technical Stack

**Frontend**:
- React 18 + TypeScript
- Vite (dev server)
- Tailwind CSS (styling)
- React Router (navigation)
- Lucide React (icons)

**Libraries**:
- No external ML dependencies (pure TypeScript)
- localStorage for state persistence (future)
- Native Date API for calculations

**Type Safety**:
- Comprehensive TypeScript interfaces
- Strict type checking
- Exported types for external use

## 📈 Future Enhancements

### Phase 2A (Immediate)
- [ ] Real celestial event API integration (JPL Horizons)
- [ ] Real-time alert notifications (WebSocket)
- [ ] User feedback system for AI training
- [ ] localStorage persistence for alerts
- [ ] Export functionality (CSV, JSON, PDF)

### Phase 2B (Near-term)
- [ ] LSTM deep learning model integration
- [ ] Multi-language NLP (Hebrew, Greek, Aramaic)
- [ ] External API aggregation (NewsAPI, Twitter/X, USGS)
- [ ] Seismos correlation training (100+ earthquakes)
- [ ] Mobile app (React Native)

### Phase 3 (Long-term)
- [ ] Full Strong's Concordance database (8,000+ entries)
- [ ] Morphological analysis (verb tenses, noun cases)
- [ ] Semantic similarity scoring
- [ ] Topic modeling (LDA for prophecy themes)
- [ ] Community collaboration features
- [ ] Academic publication readiness

## 📖 Biblical References Database

Currently includes 10 core prophecies with expansion capability:

**Celestial**: Joel 2:31, Matthew 24:29, Luke 21:25, Acts 2:20, Isaiah 13:10, Mark 13:24, Revelation 8:10

**Seismic**: Matthew 24:7, Luke 21:11, Revelation 6:12

**Categories**: Celestial (7), Seismic (3), Judgment (1)

**Fulfillment Status**:
- Fulfilled: 0
- Partial: 2 (Joel 2:31, Acts 2:20)
- Ongoing: 3 (Matthew 24:7, Luke 21:25, Luke 21:11)
- Future: 5 (Matthew 24:29, Revelation 6:12, Isaiah 13:10, Mark 13:24, Revelation 8:10)

## 🙏 Theological Note

This system is built on the foundation that celestial signs (sun, moon, stars) are given as indicators of earthly events, particularly in the context of end-times prophecy. The correlation models seek to quantify these patterns scientifically while maintaining theological integrity.

> "And there will be signs in the sun, in the moon, and in the stars; and on the earth distress of nations, with perplexity, the sea and the waves roaring." - Luke 21:25 (NKJV)

## 📞 Support

For questions or contributions, please refer to the main project documentation.

---

**Implementation Status**: ✅ **Phase 1 Complete**  
**Date**: November 11, 2025  
**Version**: 1.0.0  
**Pages Created**: 3 (Watchman's View, Alerts, Prophecy Codex)  
**Libraries Created**: 4 (hebrewCalendar, feastCorrelation, eventPredictor, types)  
**Training Events**: 42 historical events (1948-2024)  
**Biblical Prophecies**: 10 core prophecies with expansion capability
