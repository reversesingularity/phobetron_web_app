# 🚀 QUICK START GUIDE - AI Pattern Detection

## Access the New Dashboard

**Local Development:**
- URL: http://localhost:3000/advanced-pattern-detection
- Navigation: Click "AI Pattern Detection" in the sidebar (Brain icon)

**Production (Railway):**
- URL: https://your-railway-app.railway.app/advanced-pattern-detection

---

## How to Use

### 1️⃣ Run AI Analysis
1. Set **Start Year** (e.g., 2024)
2. Set **End Year** (e.g., 2025)
3. Select **Forecast Days** (30, 90, 180, or 365)
4. Click **"Run AI Analysis"** button

### 2️⃣ View Results

**Overview Tab:**
- See total patterns detected
- Check if results are statistically significant
- View high-risk predictions count
- Browse detected patterns with anomaly highlights

**Predictions Tab:**
- See upcoming feast days with risk scores
- View probability breakdown by event type:
  * 🔴 Earthquake
  * 🟠 Volcanic
  * 🔵 Hurricane
  * 🟢 Tsunami
- Risk levels: High (red), Medium (orange), Low (blue)

**Statistics Tab:**
- Pearson correlation coefficient
- Spearman correlation coefficient
- P-value (statistical significance)
- 95% and 99% confidence intervals

**Visualizations Tab:**
- **Seasonal Chart:** Compare Spring/Summer/Fall/Winter patterns
- **Correlation Heatmap:** See which feast days correlate with which event types

---

## Understanding the ML Models

### 🧠 Isolation Forest
- **What it does:** Identifies unusual patterns (anomalies)
- **Look for:** Yellow-bordered patterns with ⚠️ icon
- **Meaning:** These feast days have exceptionally high or low correlations

### 🎯 Bayesian Inference
- **What it does:** Calculates probability of events occurring on feast days
- **Look for:** "Probability by Type" cards in Predictions tab
- **Meaning:** Higher percentages = higher likelihood of event

### 📊 Statistical Significance
- **What it does:** Tests if correlations are real or random chance
- **Look for:** P-value in Statistics tab
- **Meaning:** p < 0.05 = statistically significant (not random)

### 📈 Confidence Intervals
- **What it does:** Provides uncertainty range for predictions
- **Look for:** 95% and 99% CI in Statistics tab
- **Meaning:** Wider intervals = more uncertainty, narrower = more confident

---

## Interpreting Risk Scores

### Risk Score Scale (0-100)
- **0-30:** 🟢 Low Risk
- **31-70:** 🟠 Medium Risk
- **71-100:** 🔴 High Risk

### Risk Score Components
- **40%:** Historical correlation (past patterns)
- **60%:** Maximum probability (highest event type likelihood)

### Confidence Score (0-1)
- **0.0-0.5:** Low confidence (limited data)
- **0.5-0.8:** Medium confidence
- **0.8-1.0:** High confidence (strong historical data)

---

## Example Interpretation

**Prediction Card Shows:**
```
Feast Day: Passover
Date: April 13, 2025
Risk Score: 87
Confidence: 92%
Risk Level: High

Probability by Type:
- Earthquake: 68%
- Volcanic: 45%
- Hurricane: 23%
- Tsunami: 12%
```

**What This Means:**
- There's an **87/100 risk score** for events around Passover 2025
- The AI is **92% confident** in this prediction (strong historical data)
- **Earthquake** is the most likely event type (68% probability)
- **Volcanic activity** also has elevated probability (45%)
- This is a **High Risk** forecast (watch for seismic activity)

---

## Color Coding

### Event Types
- 🔴 **Earthquake** - Red
- 🟠 **Volcanic** - Orange
- 🔵 **Hurricane** - Cyan
- 🟢 **Tsunami** - Teal

### Risk Levels
- 🔴 **High** - Red border/badge
- 🟠 **Medium** - Orange border/badge
- 🔵 **Low** - Blue border/badge

### Anomalies
- 🟡 **Anomaly** - Yellow border with ⚠️ icon

---

## API Endpoint

**Endpoint:** `POST /api/v1/ml/advanced-pattern-analysis`

**Query Parameters:**
- `start_date` (required) - e.g., "2024-01-01"
- `end_date` (required) - e.g., "2025-12-31"
- `include_predictions` (optional) - default: true
- `forecast_horizon_days` (optional) - default: 90

**Example Request:**
```bash
POST http://localhost:8000/api/v1/ml/advanced-pattern-analysis?start_date=2024-01-01&end_date=2025-12-31&include_predictions=true&forecast_horizon_days=90
```

**Response Fields:**
- `patterns` - Historical feast-event correlations
- `statistical_analysis` - Pearson, Spearman, p-value, confidence intervals
- `correlation_matrix` - Feast × event type correlation grid
- `seasonal_patterns` - Spring/Summer/Fall/Winter analysis
- `predictions` - AI forecasts for upcoming feast days
- `metadata` - Analysis details and ML models used

---

## Troubleshooting

### "API error: 500"
- Check backend server is running: http://localhost:8000/docs
- Verify database connection
- Check logs for Python errors

### No predictions shown
- Increase `forecast_horizon_days` to 180 or 365
- Verify feast days exist in date range
- Check `include_predictions=true` parameter

### Charts not rendering
- Ensure Recharts is installed: `npm install recharts`
- Check browser console for errors
- Clear cache and refresh

### Low confidence scores
- Expand date range to get more historical data
- Check if feast day has enough historical events
- Sample size < 10 = low confidence

---

## Best Practices

1. **Date Range:** Use at least 2-3 years for statistical significance
2. **Forecast Horizon:** 90 days is optimal balance (30 too short, 365 may include too many feasts)
3. **Anomaly Investigation:** Pay special attention to yellow-bordered patterns
4. **Cross-Reference:** Compare predictions with current astronomical events
5. **Trend Analysis:** Use Seasonal Chart to identify high-correlation seasons

---

## Support & Feedback

**Documentation:** `docs/AI_PATTERN_DETECTION_IMPLEMENTATION_SUMMARY.md`  
**Specification:** `.specify/features/pattern-detection-ai/spec.md`  
**API Docs:** http://localhost:8000/docs  

**Need Help?** Check the comprehensive implementation summary for technical details.
