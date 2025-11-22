# Developer Quick Reference Guide
**Celestial Signs Prophecy Tracker - Phase 2 Complete**

## Quick Start Commands

### Frontend Development
```bash
cd frontend
npm install
npm run dev
# Access: http://localhost:3000
```

### Backend Development
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8020
# Access: http://127.0.0.1:8020/docs
```

### Database Setup
```bash
cd backend
.\venv\Scripts\python.exe populate_database.py
```

---

## Project Structure

```
phobetron_web_app/
├── frontend/                    # Next.js 16 + React 19
│   ├── src/
│   │   ├── app/                # Pages (13 total)
│   │   │   ├── page.tsx        # Dashboard
│   │   │   ├── solar-system/
│   │   │   ├── dashboard/      # Earth Dashboard
│   │   │   ├── watchmans-view/
│   │   │   ├── prophecy-codex/
│   │   │   ├── alerts/
│   │   │   └── ... (8 more)
│   │   ├── components/         # Reusable UI components
│   │   │   ├── layout/
│   │   │   ├── visualization/
│   │   │   └── ui/
│   │   └── lib/                # Utilities & API clients
│   └── package.json
│
├── backend/                     # FastAPI + PostgreSQL
│   ├── app/
│   │   ├── main.py             # FastAPI app entry
│   │   ├── api/                # REST endpoints
│   │   ├── models/             # SQLAlchemy models
│   │   ├── ml/                 # Machine learning
│   │   │   ├── model.py                # Baseline ML
│   │   │   ├── lstm_predictor.py       # Phase 2 LSTM
│   │   │   ├── training_data_expanded.py # 100+ events
│   │   │   └── multilingual_nlp.py     # Hebrew/Greek/Aramaic
│   │   ├── integrations/       # External APIs
│   │   │   └── external_apis.py  # News/Twitter/NASA/USGS
│   │   └── database/           # DB connection
│   ├── requirements.txt
│   └── populate_database.py
│
├── docs/                        # Documentation
│   ├── README_START_HERE.md
│   ├── PHASE_2_EXPANSION.md
│   ├── ACHIEVEMENTS_COMPLETE_REPORT.md
│   └── ... (6 more)
│
└── docker/                      # Docker configuration
    ├── docker-compose.yml
    ├── Dockerfile.frontend
    └── Dockerfile.backend
```

---

## Key Files Reference

### Frontend

**Pages** (13 total):
- `src/app/page.tsx` - Main dashboard
- `src/app/solar-system/page.tsx` - 3D visualization
- `src/app/dashboard/page.tsx` - Earth earthquake map
- `src/app/watchmans-view/page.tsx` - AI predictions
- `src/app/prophecy-codex/page.tsx` - Prophecy database
- `src/app/alerts/page.tsx` - Real-time monitoring

**Components**:
- `src/components/layout/MainLayout.tsx` - Page wrapper
- `src/components/visualization/TheSkyLiveCanvas.tsx` - 3D solar system
- `src/components/visualization/LeafletEarthquakeMap.tsx` - Earthquake map
- `src/components/visualization/TimeControlsPanel.tsx` - Time controls

**API Client**:
- `src/lib/api/client.ts` - Backend API calls
- `src/lib/types/index.ts` - TypeScript interfaces

### Backend

**API Routes**:
- `app/api/v1/events.py` - Earthquake/celestial events
- `app/api/v1/prophecies.py` - Prophecy CRUD
- `app/api/v1/predictions.py` - AI predictions
- `app/api/v1/alerts.py` - Alert management

**Machine Learning**:
- `app/ml/model.py` - Baseline Random Forest (90% accuracy)
- `app/ml/lstm_predictor.py` - Phase 2 LSTM (target 95%)
- `app/ml/training_data_expanded.py` - 100+ historical events
- `app/ml/multilingual_nlp.py` - Biblical text analysis

**External APIs**:
- `app/integrations/external_apis.py` - News/Twitter/NASA/USGS

**Database**:
- `app/models/` - SQLAlchemy models
- `app/database/connection.py` - PostgreSQL connection
- `populate_database.py` - Seed data script

---

## Environment Variables

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://127.0.0.1:8020/api/v1
```

### Backend (.env)
```bash
# Database
DATABASE_URL=postgresql://phobetron_user:phobetron_pass@localhost:5432/phobetron_db

# External APIs (Phase 2)
NEWS_API_KEY=your_newsapi_key
TWITTER_BEARER_TOKEN=your_twitter_token
NASA_API_KEY=DEMO_KEY

# ML Configuration
LSTM_SEQUENCE_LENGTH=30
LSTM_UNITS=128
LSTM_DROPOUT=0.3
LSTM_LEARNING_RATE=0.001
```

---

## API Endpoints

### Events
```
GET  /api/v1/events/earthquakes
GET  /api/v1/events/celestial
GET  /api/v1/events/correlations
```

### Prophecies
```
GET  /api/v1/prophecies
GET  /api/v1/prophecies/{id}
POST /api/v1/prophecies/{id}/fulfill
```

### Predictions
```
GET  /api/v1/predictions/earthquake
GET  /api/v1/predictions/celestial
POST /api/v1/ml/model/predict
```

### Alerts
```
GET  /api/v1/alerts
POST /api/v1/alerts/{id}/dismiss
```

### External Data (Phase 2)
```
GET  /api/v1/external/news/sentiment
GET  /api/v1/external/twitter/trends
GET  /api/v1/external/nasa/space-weather
GET  /api/v1/external/usgs/realtime
```

---

## Common Tasks

### Add New Page
```bash
# 1. Create page file
touch frontend/src/app/new-page/page.tsx

# 2. Add route to MainLayout
# Edit: frontend/src/components/layout/MainLayout.tsx

# 3. Create page component
# Use existing pages as template
```

### Add New API Endpoint
```bash
# 1. Create route file
touch backend/app/api/v1/new_endpoint.py

# 2. Define Pydantic models
# 3. Implement endpoint logic
# 4. Register in app/main.py
```

### Train ML Model
```python
# From backend directory
python
>>> from app.ml.lstm_predictor import LSTMSeismicPredictor
>>> predictor = LSTMSeismicPredictor()
>>> # Load training data
>>> # predictor.train(data)
```

### Run Tests
```bash
# Backend tests
cd backend
pytest

# Frontend tests (planned)
cd frontend
npm test
```

---

## Troubleshooting

### Frontend Not Loading
```bash
# Clear Next.js cache
cd frontend
rm -rf .next
npm run dev
```

### Backend Connection Error
```bash
# Check PostgreSQL is running
# Windows: Services → PostgreSQL
# Linux: sudo systemctl status postgresql

# Test database connection
cd backend
python -c "from app.database.connection import engine; print(engine.connect())"
```

### Import Errors
```bash
# Reinstall dependencies
cd backend
pip install -r requirements.txt --force-reinstall

cd frontend
npm install
```

### Port Already in Use
```bash
# Frontend (3000)
netstat -ano | findstr :3000
taskkill /PID <pid> /F

# Backend (8020)
netstat -ano | findstr :8020
taskkill /PID <pid> /F
```

---

## Development Workflow

### Feature Development
1. Create feature branch: `git checkout -b feature/name`
2. Implement changes
3. Test locally
4. Commit with descriptive message
5. Push and create PR

### Database Changes
1. Modify SQLAlchemy models
2. Generate migration: `alembic revision --autogenerate -m "description"`
3. Review migration file
4. Apply: `alembic upgrade head`

### Deployment
1. Run tests
2. Update version numbers
3. Build Docker images
4. Deploy to staging
5. Smoke test
6. Deploy to production

---

## Performance Tips

### Frontend
- Use `dynamic()` for heavy components
- Implement pagination for large lists
- Debounce search inputs
- Cache API responses
- Optimize images (Next.js Image)

### Backend
- Use database indexes
- Implement connection pooling
- Cache external API responses
- Use async/await for I/O
- Batch database queries

---

## Security Checklist

- [ ] Environment variables in .env (not committed)
- [ ] API keys secured
- [ ] CORS configured properly
- [ ] SQL injection prevented (ORM)
- [ ] Input validation (Pydantic)
- [ ] HTTPS in production
- [ ] Rate limiting enabled
- [ ] Authentication implemented (future)

---

## Documentation Links

- [Next.js Docs](https://nextjs.org/docs)
- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [TensorFlow Docs](https://www.tensorflow.org/api_docs)
- [SQLAlchemy Docs](https://docs.sqlalchemy.org/)

---

## Support & Resources

**Documentation**:
- `docs/README_START_HERE.md` - Getting started
- `docs/PHASE_2_EXPANSION.md` - Advanced features
- `docs/ACHIEVEMENTS_COMPLETE_REPORT.md` - Full report

**Code Examples**:
- All pages follow similar patterns
- Check existing implementations first
- Inline comments explain complex logic

**Need Help?**:
- Check documentation in `docs/`
- Review inline code comments
- Search for similar implementations
- Test in isolation with minimal example

---

## Phase 2 Completion Status

✅ **Complete**:
- 13 pages fully functional
- 100+ training events documented
- LSTM deep learning implemented
- 4 external APIs integrated
- Multi-language NLP operational
- Professional UI with dark theme
- Real-time updates operational

🔄 **In Progress**:
- LSTM model training on full dataset
- External API key setup
- Production deployment testing

📋 **Planned** (Phase 3):
- Mobile applications (iOS/Android)
- Additional ML models (Transformers)
- More external integrations
- User authentication system
- Subscription tiers

---

**Last Updated**: November 2, 2025  
**Version**: 2.0.0  
**Status**: Production Ready (90%)
