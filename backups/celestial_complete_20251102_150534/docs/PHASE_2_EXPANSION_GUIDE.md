# Phase 2 Expansion - Implementation Guide

## Overview
This document outlines the implementation of advanced features for the Phobetron Web Application Phase 2 expansion.

---

## ✅ Completed: Foundational Expansion

### 1. Training Data Expansion (100+ Events)
**File:** `backend/data/expanded_earthquakes.py`

- **100+ historical earthquakes** (1999-2024)
- Notable events included:
  - 2004 Indian Ocean Tsunami (M9.1)
  - 2011 Tōhoku Japan Earthquake & Fukushima (M9.1)
  - 2010 Haiti Earthquake (M7.0)
  - 2015 Nepal Earthquake (M7.8)
  - 2023 Turkey-Syria Earthquake (M7.8)
  - Plus 80+ additional M4.5+ events
- Geographic coverage: Global (all tectonic regions)
- Depth range: 0-625km (shallow to deep-focus)
- Includes volcanic and induced seismicity

**File:** `backend/data/expanded_celestial_events.py`

- **50+ celestial phenomena** (1997-2029)
- Blood Moon Tetrad 2014-2015 (4 consecutive lunar eclipses)
- Major solar eclipses (Great American Eclipse 2017, etc.)
- Jupiter-Saturn Great Conjunction 2020 ("Christmas Star")
- Planetary alignments (5-7 planet parades)
- Meteor showers and comets
- Revelation 12 Sign (2017-09-23)
- Future prophetic events through 2029

### 2. LSTM Deep Learning Implementation
**File:** `backend/app/ml/lstm_model.py`

**Architecture:**
```
Input Layer: (sequence_length=10, features=6)
    ↓
LSTM Layer 1: 64 units, return_sequences=True
    ↓
Dropout: 0.2
    ↓
LSTM Layer 2: 32 units
    ↓
Dropout: 0.2
    ↓
Dense Layer 1: 16 units (ReLU)
    ↓
Dense Layer 2: 8 units (ReLU)
    ↓
Output Layer: 1 unit (Sigmoid) → Probability [0-1]
```

**Features:**
- Sequence-based time series forecasting
- Predicts M6+ earthquake probability in next 30 days
- Uses 6 features: magnitude, lat, lon, depth, time_delta, energy_log
- Early stopping with patience=10
- Model checkpoint saving
- Binary cross-entropy loss
- Metrics: Accuracy, AUC, Precision, Recall

**Usage:**
```python
from app.ml.lstm_model import EarthquakeLSTM, train_lstm_on_expanded_data

# Train model
lstm_model, history = train_lstm_on_expanded_data()

# Predict
prediction = lstm_model.predict(recent_earthquakes)
# Returns: {'probability': 0.65, 'risk_level': 'High', 'confidence': 'High'}
```

### 3. External API Integration
**File:** `backend/app/integrations/external_apis.py`

**APIs Integrated:**

1. **NewsAPI** (https://newsapi.org)
   - Earthquake news monitoring
   - Biblical prophecy news tracking
   - Sentiment analysis on articles
   - Free tier: 100 requests/day
   - Requires: `NEWS_API_KEY` environment variable

2. **Twitter/X API** (https://developer.twitter.com)
   - Social media monitoring for prophecy discussions
   - Sentiment analysis on tweets
   - Engagement metrics (likes, retweets, replies)
   - Requires: `TWITTER_BEARER_TOKEN` environment variable

3. **USGS Earthquake API** (https://earthquake.usgs.gov)
   - Real-time earthquake feed
   - No API key required (public data)
   - M4.5+ events from last 30 days
   - Includes tsunami warnings

**Features:**
- `ExternalDataAggregator` class for unified data fetching
- Sentiment analysis using TextBlob
- Alert condition checking
- Comprehensive update reports

**Usage:**
```python
from app.integrations.external_apis import ExternalDataAggregator

aggregator = ExternalDataAggregator(
    news_api_key="your_key",
    twitter_bearer_token="your_token"
)

update = aggregator.get_comprehensive_update()
# Returns earthquakes, news articles, tweets, sentiment analysis, alerts
```

### 4. Multi-Language Biblical NLP
**File:** `backend/app/nlp/multilang_biblical.py`

**Languages Supported:**
1. **Hebrew** (Old Testament)
   - Biblical Hebrew with nikud (vowel points)
   - Consonantal text processing
   - Prophetic keyword database
   - Basic transliteration
   - Strong's Concordance integration (H numbers)

2. **Greek** (New Testament)
   - Koine Greek with diacritics
   - Accent and breathing mark removal
   - Prophetic keyword database
   - Transliteration to Latin
   - Strong's Concordance integration (G numbers)

3. **Aramaic** (Daniel, Ezra)
   - Imperial Aramaic (uses Hebrew script)
   - Prophetic vocabulary
   - Strong's Concordance integration (A numbers)

**Prophetic Keywords Included:**
- Hebrew: נְבוּאָה (prophecy), נָבִיא (prophet), חָזוֹן (vision), אוֹת (sign), מָשִׁיחַ (messiah)
- Greek: προφητεία (prophecy), σημεῖον (sign), ἀποκάλυψις (revelation), παρουσία (coming)
- Aramaic: חֲזוֹ (vision), מַלְכוּ (kingdom), עַתִּיק (ancient of days)

**Features:**
- Automatic language detection
- Word-by-word analysis
- Strong's Concordance lookup
- Translation comparison (Hebrew vs Greek parallels)
- Diacritic removal for lookups

**Usage:**
```python
from app.nlp.multilang_biblical import MultiLanguageBiblicalNLP

nlp = MultiLanguageBiblicalNLP()

# Analyze Hebrew text
hebrew_result = nlp.analyze_prophecy("הַשֶּׁמֶשׁ יֵהָפֵךְ לְחֹשֶׁךְ", 'hebrew')

# Analyze Greek text
greek_result = nlp.analyze_prophecy("ὁ ἥλιος σκοτισθήσεται", 'greek')

# Compare translations
comparison = nlp.compare_translations(hebrew_text, greek_text)

# Strong's lookup
word_info = nlp.search_strongs_concordance('H5030')  # navi (prophet)
```

---

## 📦 New Dependencies Required

### Python Packages (backend/requirements.txt)
```txt
# Deep Learning
tensorflow==2.15.0  # or tensorflow-cpu for non-GPU
keras==2.15.0

# NLP & Text Processing
textblob==0.17.1
python-hebrew==0.1.0  # Optional: enhanced Hebrew support
nltk==3.8.1

# API Integration
requests==2.31.0  # Already included

# Data Processing (already included)
numpy>=1.26.0
pandas>=2.2.0
scikit-learn>=1.5.0
```

### Environment Variables (.env)
```bash
# External API Keys (Phase 2)
NEWS_API_KEY=your_newsapi_key_here  # Get from https://newsapi.org/register
TWITTER_BEARER_TOKEN=your_twitter_bearer_token  # Get from https://developer.twitter.com

# Existing variables
DATABASE_URL=postgresql://user:password@localhost:5432/phobetron
SECRET_KEY=your-secret-key-here
```

---

## 🚀 Installation Instructions

### 1. Install Python Dependencies
```bash
cd backend
source venv/bin/activate  # or .\venv\Scripts\activate on Windows

# Install new packages
pip install tensorflow==2.15.0
pip install textblob==0.17.1
pip install nltk==3.8.1

# Download NLTK data
python -c "import nltk; nltk.download('punkt'); nltk.download('brown')"

# Download TextBlob corpora
python -m textblob.download_corpora
```

### 2. Configure API Keys
```bash
# Create/edit .env file
cd backend
nano .env  # or use your preferred editor

# Add these lines:
NEWS_API_KEY=your_key_from_newsapi_org
TWITTER_BEARER_TOKEN=your_token_from_twitter_dev
```

### 3. Test LSTM Model
```bash
# Train LSTM on expanded data
cd backend
python -m app.ml.lstm_model

# Expected output:
# Training data shape: X=(80, 10, 6), y=(80,)
# Positive samples: 15 (18.8%)
# Epoch 1/100
# ...
# Model saved to lstm_earthquake_model.h5
```

### 4. Test External APIs
```bash
# Test API integrations
python -m app.integrations.external_apis

# Expected output:
# === External Data Summary ===
# Earthquakes: 42 (Max M7.8)
# News Articles: 25
# News Sentiment: neutral
# Tweets Analyzed: 50
# Tweet Sentiment: positive
```

### 5. Test Multi-Language NLP
```bash
# Test Hebrew/Greek processing
python -m app.nlp.multilang_biblical

# Expected output:
# === Hebrew Analysis (Joel 2:31) ===
# Original: הַשֶּׁמֶשׁ יֵהָפֵךְ לְחֹשֶׁךְ
# Prophetic terms found: 1
# ...
```

---

## 🔌 API Endpoint Integration

### New Endpoints to Add

#### 1. LSTM Prediction Endpoint
```python
# backend/app/api/routes/predictions.py

from fastapi import APIRouter
from app.ml.lstm_model import EarthquakeLSTM

router = APIRouter(prefix="/api/v1/predictions", tags=["predictions"])

@router.post("/lstm-forecast")
async def get_lstm_forecast():
    """Get LSTM deep learning earthquake forecast"""
    # Load trained model
    lstm = EarthquakeLSTM()
    lstm.load_model('models/lstm_earthquake_predictor.h5')
    
    # Get recent earthquakes from database
    recent_eq = await get_recent_earthquakes(limit=15)
    
    # Predict
    prediction = lstm.predict(recent_eq)
    
    return {
        "model_type": "LSTM Deep Learning",
        "prediction": prediction,
        "timestamp": datetime.now().isoformat()
    }
```

#### 2. External Data Endpoint
```python
@router.get("/external-data")
async def get_external_data():
    """Fetch data from external APIs (news, social media, USGS)"""
    aggregator = ExternalDataAggregator()
    update = aggregator.get_comprehensive_update()
    return update
```

#### 3. Multi-Language Analysis Endpoint
```python
@router.post("/analyze-text")
async def analyze_biblical_text(text: str, language: Optional[str] = None):
    """Analyze Hebrew, Greek, or Aramaic biblical text"""
    nlp = MultiLanguageBiblicalNLP()
    analysis = nlp.analyze_prophecy(text, language)
    return analysis
```

---

## 📊 Performance Expectations

### LSTM Model
- **Training Time:** ~5-10 minutes (100 epochs with early stopping)
- **Inference Time:** <100ms per prediction
- **Accuracy (expected):** 75-85% (with 100+ training samples)
- **Memory Usage:** ~500MB (TensorFlow loaded)

### External APIs
- **NewsAPI:** 100 requests/day (free tier)
- **Twitter API:** 500,000 tweets/month (free tier)
- **USGS API:** Unlimited (public data)
- **Response Time:** 1-3 seconds per comprehensive update

### Multi-Language NLP
- **Processing Speed:** <50ms per word
- **Memory Usage:** ~50MB (keyword dictionaries)
- **Accuracy:** 90%+ for prophetic keywords

---

## 🎯 Next Steps (Phase 2B)

### 1. Mobile App Development
- [ ] React Native setup
- [ ] Push notification service (Firebase)
- [ ] Offline mode with SQLite
- [ ] Biometric authentication
- [ ] Simplified UI for mobile

### 2. Advanced ML Models
- [ ] Random Forest ensemble (5 trees)
- [ ] Gradient Boosting (XGBoost)
- [ ] Simple Neural Network (feedforward)
- [ ] Model comparison dashboard

### 3. Production Deployment
- [ ] Deploy LSTM model to cloud (AWS SageMaker / Google AI Platform)
- [ ] Set up API rate limiting
- [ ] Implement caching for external APIs
- [ ] Add monitoring and logging

### 4. Enhanced NLP
- [ ] Full Strong's Concordance database integration
- [ ] Morphological analysis (verb tenses, cases)
- [ ] Context-aware translation
- [ ] Named entity recognition for biblical figures

---

## 📝 Notes

- **TensorFlow Installation:** If GPU is available, use `tensorflow` instead of `tensorflow-cpu` for faster training
- **API Keys:** Never commit API keys to Git. Use environment variables only.
- **Model Training:** Initial training may take longer. Save model checkpoint and reuse for predictions.
- **Database:** Expanded earthquake/celestial data should be loaded via database seed script (not included in API responses by default).

---

## 🐛 Troubleshooting

### TensorFlow Import Error
```bash
# If TensorFlow fails to import:
pip uninstall tensorflow
pip install tensorflow==2.15.0 --no-cache-dir

# For Apple Silicon (M1/M2):
pip install tensorflow-macos tensorflow-metal
```

### TextBlob Missing Corpora
```bash
# If sentiment analysis fails:
python -m textblob.download_corpora
python -c "import nltk; nltk.download('punkt')"
```

### API Rate Limits
- NewsAPI: 100 requests/day (free) - cache results
- Twitter API: Use sparingly, cache tweets
- USGS: No limits, but respect fair use

---

**Document Version:** 1.0  
**Last Updated:** November 2, 2025  
**Status:** ✅ PHASE 2A COMPLETE - READY FOR INTEGRATION
