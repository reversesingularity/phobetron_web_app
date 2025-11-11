# 🚀 Phobetron Development Server Quick Start

## Quick Start (Recommended)

Start both frontend and backend servers concurrently:

```powershell
.\start-dev.ps1
```

Or using npm:

```powershell
npm run dev
```

This will:
- ✅ Stop any existing servers
- ✅ Start Backend on **http://localhost:8000**
- ✅ Start Frontend on **http://localhost:3000**
- ✅ Display live output from both servers
- ✅ Health check the backend API

**Press `Ctrl+C` to stop all servers**

---

## Manual Start (Individual Servers)

### Backend Only
```powershell
npm run backend
# or
cd backend && python -m uvicorn app.main:app --reload --port 8000
```

### Frontend Only
```powershell
npm run frontend
# or
cd frontend && npm run dev
```

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both servers concurrently |
| `npm run backend` | Start backend only (port 8000) |
| `npm run frontend` | Start frontend only (port 3000) |
| `npm run install:all` | Install all dependencies |
| `npm run ml:train` | Train ML models |
| `npm run db:migrate` | Run database migrations |
| `npm run test:backend` | Run backend tests |
| `npm run test:frontend` | Run frontend tests |

---

## Server Endpoints

### Frontend (Vite + React)
- **URL**: http://localhost:3000
- **Pages**:
  - Dashboard: `/`
  - Map View: `/map`
  - Earthquakes: `/earthquakes`
  - Volcanic Activity: `/volcanic`
  - NEO Tracker: `/neo`
  - Solar System: `/solar-system`
  - Watchman's View: `/watchmans-view`
  - Alerts: `/alerts`
  - Prophecy Codex: `/prophecy-codex`

### Backend (FastAPI + TensorFlow)
- **API Base**: http://localhost:8000/api/v1
- **Health Check**: http://localhost:8000/health
- **API Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Key API Endpoints
- `GET /api/v1/events/earthquakes` - Earthquake data
- `GET /api/v1/events/volcanic-activity` - Volcanic eruptions
- `GET /api/v1/scientific/close-approaches` - NEO data
- `GET /api/v1/ml/watchman-alerts` - ML-powered alerts
- `POST /api/v1/ml/prophecy-lstm-prediction` - LSTM predictions
- `POST /api/v1/ml/seismos-correlation` - Seismos correlation

---

## Environment Configuration

### Frontend (.env.local)
```properties
VITE_API_URL=http://localhost:8000/api/v1
```

### Backend (.env)
```properties
DATABASE_URL=postgresql://celestial_admin:your_password@localhost:5432/celestial_signs
PYTHONPATH=.
```

---

## Troubleshooting

### Servers won't start
```powershell
# Kill all existing processes
Get-Process -Name "node","python","uvicorn" | Stop-Process -Force
# Restart
.\start-dev.ps1
```

### Frontend can't connect to backend
1. Check backend is running: http://localhost:8000/health
2. Verify `.env.local` has `VITE_API_URL=http://localhost:8000/api/v1`
3. Restart frontend server

### Database connection errors
```powershell
# Check PostgreSQL is running
Get-Service postgresql*
# Or check connection manually
psql -U celestial_admin -d celestial_signs
```

### ML models not found
```powershell
npm run ml:train
# or
cd backend && python app/ml/train_all_models.py
```

---

## Development Workflow

1. **Start servers**: `.\start-dev.ps1`
2. **Open browser**: http://localhost:3000
3. **Make changes**: Both servers auto-reload
4. **Check logs**: Terminal shows [BACKEND] and [VITE] output
5. **Stop servers**: `Ctrl+C`

---

## Tech Stack

### Backend
- FastAPI 0.115+
- PostgreSQL 16
- TensorFlow 2.20+ (LSTM deep learning)
- scikit-learn (Random Forest, Gradient Boosting)
- SQLAlchemy ORM
- Alembic migrations

### Frontend
- Vite 5.4+
- React 18
- TypeScript
- Tailwind CSS
- Framer Motion
- Three.js (Solar System visualization)

### ML/AI Models
- ProphecyLSTMModel (29,857 parameters)
- 4 Seismos Correlation Models
- NEO Trajectory Predictor
- Watchman Enhanced Alert System
- Pattern Detection (tetrads, conjunctions)

---

**Last Updated**: November 11, 2025
**Version**: 2.0.0
