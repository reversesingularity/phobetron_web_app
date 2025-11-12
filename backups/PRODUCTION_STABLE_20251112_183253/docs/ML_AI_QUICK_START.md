# Enhanced ML/AI Features - Quick Start Guide

## 🎯 Accessing the New Features

### 1. Enhanced Watchman's View
**URL:** `http://localhost:3001/watchmans-view-enhanced`

**What You'll See:**
- 4 Statistics Cards: Total Events, Critical Alerts, High Significance, Patterns Found
- Time Range Filters: 7 Days, 30 Days, 1 Year
- Severity Filters: All, High, Medium, Low
- Pattern Detection Dashboard with detected tetrads/conjunctions
- Enhanced Alert Cards with ML-powered severity and prophetic significance

**How to Use:**
1. Select a time range (7 days, 30 days, or 1 year)
2. Filter by severity (all, high, medium, low)
3. Toggle pattern detection on/off
4. Click "View Details" on any alert card for more information
5. Scroll through patterns to see biblical feast alignments

---

## 🚀 API Endpoints Reference

### NEO Risk Assessment
```bash
curl -X POST http://localhost:8020/api/v1/ml/neo-risk-assessment \
  -H "Content-Type: application/json" \
  -d '{
    "name": "99942 Apophis",
    "semi_major_axis_au": 0.922,
    "eccentricity": 0.191,
    "inclination_deg": 3.33,
    "absolute_magnitude": 19.7,
    "diameter_km": 0.37,
    "velocity_km_s": 7.4,
    "closest_approach_date": "2029-04-13",
    "closest_approach_au": 0.000211
  }'
```

**Response:**
```json
{
  "neo_name": "99942 Apophis",
  "collision_probability": 0.000001,
  "impact_energy_megatons": 1151.2,
  "torino_scale": 4,
  "palermo_scale": -3.2,
  "orbital_stability": "PERTURBED",
  "recommendations": [
    "Continue radar observations during 2029 approach",
    "Update orbital parameters with radar ranging data"
  ],
  "closest_approach_km": 31600.0,
  "years_until_approach": 4.5
}
```

---

### Watchman Alerts
```bash
curl http://localhost:8020/api/v1/ml/watchman-alerts?min_severity=70&min_significance=0.5
```

**Response:**
```json
[
  {
    "alert_id": "eclipse_2024_04_08",
    "event_type": "solar_eclipse",
    "event_date": "2024-04-08T00:00:00",
    "description": "Total Solar Eclipse visible across North America",
    "severity_score": 75.5,
    "prophetic_significance": 0.82,
    "cluster_id": 1,
    "pattern_type": "tetrad_related",
    "biblical_references": [
      "Joel 2:31 - The sun will be turned to darkness...",
      "Matthew 24:29 - The sun will be darkened..."
    ],
    "recommendations": [
      "Monitor for associated seismic activity",
      "Check alignment with biblical feast days"
    ],
    "related_events": [
      "lunar_eclipse_2024_03_25",
      "neo_approach_2024_04_10"
    ]
  }
]
```

---

### Pattern Detection
```bash
curl "http://localhost:8020/api/v1/ml/pattern-detection?start_date=2014-01-01&end_date=2015-12-31"
```

**Response:**
```json
[
  {
    "pattern_type": "blood_moon_tetrad",
    "start_date": "2014-04-15",
    "end_date": "2015-09-28",
    "significance_score": 0.95,
    "event_count": 4,
    "description": "Blood moon tetrad spanning 2014-2015",
    "feast_alignments": ["Passover 2014", "Tabernacles 2014", "Passover 2015", "Tabernacles 2015"],
    "biblical_references": [
      "Joel 2:31 - The sun will be turned to darkness and the moon to blood...",
      "Acts 2:20 - The sun will be turned to darkness and the moon to blood..."
    ],
    "historical_note": "Coincided with Gaza conflict and ISIS rise (2014-2015)"
  }
]
```

---

### Interstellar Anomaly Detection
```bash
curl -X POST http://localhost:8020/api/v1/ml/interstellar-anomaly \
  -H "Content-Type: application/json" \
  -d '{
    "name": "1I/Oumuamua",
    "semi_major_axis_au": -1.28,
    "eccentricity": 1.20,
    "velocity_km_s": 26.33,
    "absolute_magnitude": 22.2,
    "albedo": 0.1,
    "rotation_period_hours": 8.1,
    "acceleration_exists": true,
    "outgassing_detected": false,
    "elongation_ratio": 10.0
  }'
```

**Response:**
```json
{
  "object_name": "1I/Oumuamua",
  "is_interstellar": true,
  "anomaly_score": 0.92,
  "detected_anomalies": [
    "Hyperbolic trajectory detected (e = 1.20)",
    "Non-gravitational acceleration without outgassing",
    "Extreme elongation ratio (10:1)"
  ],
  "requires_investigation": true,
  "recommendations": [
    "Long-term monitoring recommended",
    "Search for similar objects with LSST",
    "Consider panspermia implications"
  ],
  "confidence": 0.88
}
```

---

## 🎨 React Component Usage

### Using NEO Risk Badge
```tsx
import { NEORiskBadge, NEORiskPanel } from '@/components/solar-system/NEORiskBadge';

// Compact badge (just Torino scale)
<NEORiskBadge neoName="99942 Apophis" />

// Detailed view with full assessment
<NEORiskBadge neoName="99942 Apophis" showDetails />

// Full panel with multiple NEOs
<NEORiskPanel neoNames={['99942 Apophis', '101955 Bennu', '162173 Ryugu']} />
```

---

### Using Interstellar Anomaly Panel
```tsx
import { InterstellarAnomalyPanel } from '@/components/solar-system/InterstellarAnomalyPanel';

<InterstellarAnomalyPanel 
  objectNames={[
    "1I/'Oumuamua", 
    "2I/Borisov",
    "3I/ATLAS"
  ]} 
/>
```

---

### Using Enhanced Alert Card
```tsx
import { EnhancedAlertCard } from '@/components/watchman/EnhancedAlertCard';

<EnhancedAlertCard 
  alert={alertData}
  onViewDetails={(id) => {
    console.log('View details for alert:', id);
    // Navigate to detailed view
  }}
/>
```

---

### Using Pattern Detection Dashboard
```tsx
import { PatternDetectionDashboard } from '@/components/watchman/PatternDetectionDashboard';

<PatternDetectionDashboard 
  patterns={patternData}
  loading={false}
/>
```

---

### Using ML Prediction Hooks
```tsx
import { 
  useNEORiskAssessment, 
  useEnhancedAlerts,
  usePatternDetection,
  useInterstellarAnomalies 
} from '@/lib/hooks/useMLPredictions';

function MyComponent() {
  // Fetch NEO risk
  const { data: neoRisk, loading: neoLoading } = useNEORiskAssessment('99942 Apophis');
  
  // Fetch enhanced alerts (all)
  const { alerts, loading: alertsLoading } = useEnhancedAlerts();
  
  // Fetch enhanced alerts (filtered)
  const { alerts: highAlerts } = useEnhancedAlerts('eclipse', 70, 0.7);
  
  // Fetch patterns in date range
  const { patterns } = usePatternDetection(
    new Date('2014-01-01'),
    new Date('2015-12-31')
  );
  
  // Fetch interstellar anomalies
  const { data: anomaly } = useInterstellarAnomalies("1I/'Oumuamua");
  
  return (
    <div>
      {neoLoading ? 'Loading...' : (
        <div>Torino Scale: {neoRisk?.torino_scale}</div>
      )}
    </div>
  );
}
```

---

## 🔍 Understanding the Scales

### Torino Scale (0-10)
**Purpose:** Public communication of NEO impact hazard

| Scale | Color  | Meaning |
|-------|--------|---------|
| 0     | White  | No hazard (routine discovery) |
| 1     | Green  | Normal (pass near Earth) |
| 2-4   | Yellow | Merits attention by astronomers |
| 5-7   | Orange | Threatening (close encounter, regional damage possible) |
| 8-10  | Red    | Certain collision (local to global catastrophe) |

**Example:** 99942 Apophis was rated Torino 4 in 2004 (highest ever for any object), later downgraded to 0.

---

### Palermo Technical Scale
**Purpose:** Technical assessment for researchers

| Scale | Meaning |
|-------|---------|
| < -2  | No consequence (far below background rate) |
| -2 to 0 | Warrants monitoring |
| 0 to +2 | Warrants concern |
| > +2  | Certain collision hazard |

**Calculation:** Compares collision probability to background impact rate, normalized by time until impact.

---

## 📖 Biblical References Explained

### Blood Moon Prophecies
- **Joel 2:31** - "The sun will be turned to darkness and the moon to blood before the coming of the great and dreadful day of the Lord."
- **Acts 2:20** - Peter quotes Joel on the Day of Pentecost
- **Revelation 6:12** - "The sun turned black... the whole moon turned blood red"

### Celestial Signs
- **Genesis 1:14** - "Let there be lights in the vault of the sky... let them serve as signs"
- **Matthew 24:29** - "The sun will be darkened, and the moon will not give its light; the stars will fall from the sky"
- **Matthew 2:2** - "We saw his star when it rose and have come to worship him" (Bethlehem Star)

### Biblical Feast Days
- **Passover** (Pesach) - March/April, 14th of Nisan
- **Tabernacles** (Sukkot) - September/October, 15th of Tishrei

**Why Important:** Blood moon tetrads aligning with these feasts are considered prophetically significant (occurred 1493-1494, 1949-1950, 1967-1968, 2014-2015).

---

## 🧪 Testing the System

### 1. Check Backend Health
```bash
curl http://localhost:8020/api/v1/ml/health
```

Expected:
```json
{
  "status": "operational",
  "models": {
    "neo_predictor": "loaded",
    "watchman_system": "loaded"
  },
  "version": "1.0.0"
}
```

---

### 2. Test NEO Assessment (Apophis)
```bash
curl -X POST http://localhost:8020/api/v1/ml/neo-risk-assessment \
  -H "Content-Type: application/json" \
  -d '{
    "name": "99942 Apophis",
    "semi_major_axis_au": 0.922,
    "eccentricity": 0.191,
    "inclination_deg": 3.33,
    "absolute_magnitude": 19.7,
    "velocity_km_s": 7.4,
    "closest_approach_date": "2029-04-13",
    "closest_approach_au": 0.000211
  }'
```

Should return Torino scale 4, collision probability ~0.0001%, impact energy ~1,151 MT.

---

### 3. Test Interstellar Detection ('Oumuamua)
```bash
curl -X POST http://localhost:8020/api/v1/ml/interstellar-anomaly \
  -H "Content-Type: application/json" \
  -d '{
    "name": "1I/Oumuamua",
    "eccentricity": 1.20,
    "velocity_km_s": 26.33,
    "elongation_ratio": 10.0,
    "acceleration_exists": true,
    "outgassing_detected": false
  }'
```

Should return anomaly_score > 0.9, is_interstellar: true, detected_anomalies including hyperbolic trajectory.

---

### 4. Open Enhanced Watchman's View
```
http://localhost:3001/watchmans-view-enhanced
```

Should see:
- 4 statistics cards
- Time range and severity filters
- Pattern detection dashboard
- Enhanced alert cards with severity bars

---

## 🐛 Troubleshooting

### Backend Not Responding
```bash
# Check if backend is running
curl http://localhost:8020/health

# If not, restart:
cd backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8020
```

---

### Frontend Not Loading
```bash
# Check if frontend is running
curl http://localhost:3001

# If not, restart:
cd frontend
npm run dev
```

---

### CORS Errors
Make sure `settings.BACKEND_CORS_ORIGINS` in `backend/app/core/config.py` includes:
```python
BACKEND_CORS_ORIGINS = ["http://localhost:3000", "http://localhost:3001"]
```

---

### ML Models Not Loading
Check Python path in `backend/app/api/routes/ml.py`:
```python
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent.parent))
```

---

## 📚 Additional Resources

### NASA Data Sources
- **NEO Database:** https://ssd.jpl.nasa.gov/tools/sbdb_query.html
- **Close Approach Data:** https://cneos.jpl.nasa.gov/ca/
- **Eclipse Predictions:** https://eclipse.gsfc.nasa.gov/
- **Horizons System:** https://ssd.jpl.nasa.gov/horizons/

### Biblical Resources
- **Blue Letter Bible:** https://www.blueletterbible.org/
- **Bible Gateway:** https://www.biblegateway.com/
- **Feast Day Calculator:** https://www.hebcal.com/

### ML/AI Learning
- **scikit-learn Docs:** https://scikit-learn.org/
- **Random Forest Guide:** https://scikit-learn.org/stable/modules/ensemble.html#forest
- **DBSCAN Clustering:** https://scikit-learn.org/stable/modules/clustering.html#dbscan

---

## ✅ Quick Checklist

Before using the ML features:

- [ ] Backend running on port 8020
- [ ] Frontend running on port 3001
- [ ] ML routes responding (`/api/v1/ml/health`)
- [ ] NEO assessment endpoint tested
- [ ] Watchman alerts endpoint tested
- [ ] Pattern detection endpoint tested
- [ ] Enhanced Watchman's View loads
- [ ] Components render without errors

**All green?** You're ready to explore the ML-powered features! 🚀
