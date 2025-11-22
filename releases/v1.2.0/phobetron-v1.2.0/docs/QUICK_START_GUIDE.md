# 🚀 Quick Start Guide - Phobetron Web App

## For Developers: Get Running in 5 Minutes

### Prerequisites Check
```bash
# Check versions
node --version  # Should be 20.x
python --version  # Should be 3.11+
docker --version  # Should be 24.x+
psql --version  # Should be 16.x
```

### 1. Clone & Install (2 min)
```bash
cd f:\Projects\phobetron_web_app

# Frontend
cd frontend
npm install
# Installs: Next.js 16, React 19, Leaflet, THREE.js, Tailwind

# Backend
cd ../backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
# Installs: FastAPI, SQLAlchemy, TensorFlow, TextBlob, scikit-learn

# Download NLP data
python -m textblob.download_corpora
python -c "import nltk; nltk.download('punkt')"
```

### 2. Configure Environment (1 min)
```bash
# backend/.env
DATABASE_URL=postgresql://user:pass@localhost:5432/phobetron
SECRET_KEY=your-secret-key-change-in-production

# Phase 2 API Keys (optional for testing)
NEWS_API_KEY=get_from_newsapi.org
TWITTER_BEARER_TOKEN=get_from_developer.twitter.com
```

### 3. Start Database (30 sec)
```bash
# Option A: Docker
docker run -d -p 5432:5432 -e POSTGRES_DB=phobetron -e POSTGRES_PASSWORD=password postgres:16

# Option B: Local PostgreSQL
createdb phobetron
```

### 4. Initialize Database (1 min)
```bash
cd backend
.\venv\Scripts\activate
alembic upgrade head  # Run migrations
python populate_database.py  # Seed data (12 earthquakes, 39 prophecies)
```

### 5. Start Services (30 sec)
```bash
# Terminal 1: Backend
cd backend
.\venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8020

# Terminal 2: Frontend
cd frontend
npm run dev
```

### 6. Verify (1 min)
- **Frontend:** http://localhost:3000
- **Backend API Docs:** http://localhost:8020/docs
- **Database:** psql phobetron

---

## 🎯 Quick Test Checklist

### Frontend Pages (All should load)
- [ ] Dashboard (http://localhost:3000)
- [ ] Solar System (http://localhost:3000/solar-system)
- [ ] Earth Dashboard (http://localhost:3000/dashboard)
- [ ] Watchman's View (http://localhost:3000/watchmans-view)
- [ ] Prophecy Codex (http://localhost:3000/prophecy-codex)
- [ ] Alerts (http://localhost:3000/alerts)

### Backend API (Should return data)
```bash
# Test earthquakes endpoint
curl http://localhost:8020/api/v1/events/earthquakes

# Test prophecies endpoint
curl http://localhost:8020/api/v1/prophecies

# Test ML prediction
curl http://localhost:8020/api/v1/ml/predict
```

### Database (Should show records)
```bash
psql phobetron
SELECT COUNT(*) FROM earthquakes;  # Should return 12
SELECT COUNT(*) FROM prophecies;   # Should return 39
SELECT COUNT(*) FROM alerts;       # Should return 3
```

---

## 🐛 Common Issues & Fixes

### Issue 1: "Port 3000 already in use"
```bash
# Find and kill process
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force
```

### Issue 2: "Module 'tensorflow' not found"
```bash
pip uninstall tensorflow
pip install tensorflow==2.15.0 --no-cache-dir
```

### Issue 3: "Database connection failed"
```bash
# Check PostgreSQL is running
docker ps  # Should show postgres container

# Test connection
psql -h localhost -U postgres -d phobetron
```

### Issue 4: "Leaflet map not loading"
```bash
# Reinstall dependencies
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Issue 5: "Solar system stuck loading"
- Hard refresh browser: Ctrl + Shift + R
- Clear browser cache
- Check console for errors (F12)

---

## 📦 File Structure Overview

```
phobetron_web_app/
├── frontend/                    # Next.js 16 + React 19
│   ├── src/
│   │   ├── app/                # 13 pages (page.tsx files)
│   │   ├── components/         # Reusable UI components
│   │   │   ├── layout/        # MainLayout, Sidebar
│   │   │   └── visualization/ # TheSkyLive, Leaflet maps
│   │   └── lib/               # Types, API client, utilities
│   └── package.json           # Dependencies (leaflet, three.js)
│
├── backend/                    # FastAPI + Python
│   ├── app/
│   │   ├── api/               # REST API routes
│   │   ├── ml/                # ML models (LSTM, etc.)
│   │   ├── nlp/               # Multi-language NLP ⭐ NEW
│   │   ├── integrations/      # External APIs ⭐ NEW
│   │   └── models/            # SQLAlchemy models
│   ├── data/
│   │   ├── expanded_earthquakes.py  ⭐ NEW (100+ events)
│   │   └── expanded_celestial_events.py  ⭐ NEW (50+ events)
│   └── requirements.txt       # Dependencies (TensorFlow, TextBlob)
│
├── docs/                       # Documentation
│   ├── PROJECT_CONSTITUTION_V1.md  ⭐ NEW
│   ├── PHASE_2_EXPANSION_GUIDE.md  ⭐ NEW
│   ├── MASTERPIECE_ACHIEVEMENT_SUMMARY.md  ⭐ NEW
│   └── 12_MONTH_ROADMAP_DETAILED.md
│
└── docker/                     # Docker configuration
    └── docker-compose.yml     # Multi-container setup
```

---

## 🔑 Key Files to Know

### Frontend
- **Main Dashboard:** `frontend/src/app/page.tsx`
- **Solar System:** `frontend/src/app/solar-system/page.tsx`
- **Leaflet Map:** `frontend/src/components/visualization/LeafletEarthquakeMap.tsx`
- **API Client:** `frontend/src/lib/api/client.ts`

### Backend
- **Main App:** `backend/app/main.py`
- **LSTM Model:** `backend/app/ml/lstm_model.py` ⭐ NEW
- **Multi-Lang NLP:** `backend/app/nlp/multilang_biblical.py` ⭐ NEW
- **External APIs:** `backend/app/integrations/external_apis.py` ⭐ NEW
- **Database Models:** `backend/app/models/`

### Data
- **100+ Earthquakes:** `backend/data/expanded_earthquakes.py` ⭐ NEW
- **50+ Celestial:** `backend/data/expanded_celestial_events.py` ⭐ NEW
- **Database Seed:** `backend/populate_database.py`

---

## 🧪 Testing Phase 2 Features

### Test 1: LSTM Model
```bash
cd backend
python -m app.ml.lstm_model
# Expected: Training progress, model saved to .h5 file
```

### Test 2: External APIs
```bash
# Set API keys in .env first
python -m app.integrations.external_apis
# Expected: Earthquake count, news articles, tweets, sentiment analysis
```

### Test 3: Multi-Language NLP
```bash
python -m app.nlp.multilang_biblical
# Expected: Hebrew/Greek analysis with transliterations
```

---

## 🎨 UI Customization

### Change Color Scheme
Edit `frontend/tailwind.config.js`:
```javascript
theme: {
  extend: {
    colors: {
      'primary': '#your-color',
      'secondary': '#your-color'
    }
  }
}
```

### Adjust Map Styling
Edit `frontend/src/components/visualization/LeafletEarthquakeMap.tsx`:
```typescript
// Change marker colors
getMarkerStyle(magnitude) {
  if (magnitude >= 7.0) return { color: 'red', radius: 20 };
  // Add your custom logic
}
```

### Modify Solar System Speed
Edit `frontend/src/app/solar-system/page.tsx`:
```typescript
const [speedMultiplier, setSpeedMultiplier] = useState(1.0); // Change default
```

---

## 📚 Resources

### Official Documentation
- **Next.js:** https://nextjs.org/docs
- **FastAPI:** https://fastapi.tiangolo.com
- **TensorFlow:** https://www.tensorflow.org/api_docs
- **Leaflet:** https://leafletjs.com/reference.html
- **THREE.js:** https://threejs.org/docs

### API Documentation
- **NewsAPI:** https://newsapi.org/docs
- **Twitter API:** https://developer.twitter.com/en/docs
- **USGS Earthquakes:** https://earthquake.usgs.gov/fdsnws/event/1/

### Biblical Resources
- **Strong's Concordance:** https://www.blueletterbible.org/lexicons/
- **Hebrew/Greek Interlinear:** https://biblehub.com/interlinear/

---

## 🚀 Deployment

### Option 1: Docker Compose (Recommended)
```bash
docker-compose up -d
# Starts: PostgreSQL, Backend, Frontend, Nginx
```

### Option 2: Cloud Deployment
```bash
# AWS/Google Cloud
# See: docs/DOCKER_DEPLOYMENT_COMPLETE.md
```

---

## 📞 Get Help

### Check Logs
```bash
# Frontend (browser console)
Press F12 → Console tab

# Backend
cd backend
tail -f logs/app.log

# Database
docker logs postgres-container-id
```

### Debug Mode
```bash
# Frontend
npm run dev  # Already in debug mode

# Backend
uvicorn app.main:app --reload --log-level debug
```

---

## ✅ Success Indicators

You know it's working when:
- ✅ Dashboard shows 12 earthquakes
- ✅ Solar system rotates smoothly (60fps)
- ✅ Leaflet map displays with 12 markers
- ✅ Prophecy Codex shows 39 entries
- ✅ Alerts page shows 2-3 active alerts
- ✅ API docs accessible at /docs
- ✅ No console errors (F12)

---

**Version:** 1.0  
**Last Updated:** November 2, 2025  
**Next:** See `PHASE_2_EXPANSION_GUIDE.md` for advanced features

🎉 **Happy Coding!**
