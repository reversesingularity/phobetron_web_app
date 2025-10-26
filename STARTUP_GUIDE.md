# 🚀 Phobetron Web App - Quick Start Guide

## Prerequisites
- Python 3.10+ installed
- Node.js 18+ installed
- PostgreSQL 14+ installed and running
- Git installed

## 🔧 Environment Setup

### 1. Backend Setup

```powershell
# Navigate to project root
cd F:\Projects\phobetron_web_app

# Activate Python virtual environment
.\backend\venv\Scripts\Activate.ps1

# Navigate to backend
cd backend

# Install dependencies (if not already done)
pip install -r requirements.txt

# Set environment variables (create .env file first)
# Copy from .env.example and fill in your PostgreSQL credentials

# Run database migrations
alembic upgrade head

# Start the backend server
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Backend should now be running at:** `http://localhost:8000`

### 2. Frontend Setup

Open a **NEW terminal** (keep backend running):

```powershell
# Navigate to frontend
cd F:\Projects\phobetron_web_app\frontend

# Install dependencies (if not already done)
npm install

# Start the development server
npm run dev
```

**Frontend should now be running at:** `http://localhost:3000` or `http://localhost:3001`

## 🧪 Verify Installation

### Check Backend API
Open browser to: `http://localhost:8000/docs`
- You should see the FastAPI Swagger UI
- Try the `/api/v1/health` endpoint

### Check Frontend
Open browser to: `http://localhost:3000`
- You should see the Celestial Signs dashboard
- Navigate to "Solar System" in the sidebar
- You should see the 3D visualization with planets

## 📊 Loading Data

### Sample Data Scripts

To populate the database with test data:

```powershell
# In backend directory with venv activated
python scripts/load_sample_ephemeris.py
python scripts/load_sample_earthquakes.py
python scripts/load_sample_prophecies.py
```

## 🐛 Troubleshooting

### Backend Issues

**Port 8000 already in use:**
```powershell
# Find process using port 8000
netstat -ano | findstr :8000

# Kill the process
taskkill /PID <PID> /F
```

**Database connection errors:**
- Check PostgreSQL is running: `services.msc` → Look for "postgresql"
- Verify credentials in `.env` file
- Test connection: `psql -U postgres -h localhost`

**Module import errors:**
```powershell
# Reinstall requirements
pip install -r requirements.txt --force-reinstall
```

### Frontend Issues

**Port 3000 already in use:**
```powershell
# Kill all node processes
taskkill /F /IM node.exe

# Or manually choose different port
# Frontend will auto-suggest 3001 if 3000 is busy
```

**Module not found errors:**
```powershell
# Clear node_modules and reinstall
rm -r node_modules
rm package-lock.json
npm install
```

**Build errors:**
```powershell
# Clear Next.js cache
rm -r .next
npm run dev
```

## 🌟 Features to Test

### 1. Solar System Visualization
- **Grid Toggle:** Show/hide coordinate grids
- **Orbit Toggle:** Show/hide planetary orbits
- **Labels Toggle:** Show/hide planet names
- **NEO Toggle:** Show/hide asteroids
- **Speed Control:** Adjust animation speed (0.1x - 10x)
- **Click Planets:** View detailed information
- **Click NEOs:** See close approach data

### 2. Dashboard
- Live earthquake feed (M4+)
- Correlation statistics
- Alert system
- Module navigation

### 3. Watchman's View
- Earth-centric event monitoring
- Seismic activity tracking
- Real-time updates

### 4. Prophecy Codex
- Browse biblical prophecies
- Category filtering
- Scripture references

## 📚 Datasets Used

### Primary Data Sources (Like SkyLive.com)

1. **JPL Horizons System** - Planetary ephemeris
   - Real-time position data (x, y, z AU)
   - Velocity vectors
   - Epoch timestamps

2. **Orbital Elements** - Keplerian parameters
   - Semi-major axis
   - Eccentricity
   - Inclination
   - Node longitude
   - Periapsis argument
   - Mean anomaly

3. **Close Approaches** - NEO tracking
   - Approach dates
   - Miss distances
   - Relative velocities
   - Object diameters

4. **USGS Earthquake Data** - Seismic events
   - Magnitude
   - Depth
   - Location (PostGIS)
   - Timestamps

5. **Custom Theological Data** - Biblical prophecies
   - Scripture references
   - Event correlations
   - Celestial sign links

## 🔄 Data Refresh Rates

- **Ephemeris:** 60 seconds (real-time positions)
- **Orbital Elements:** 5 minutes (semi-static)
- **Close Approaches:** 5 minutes (periodic updates)
- **Earthquakes:** Auto-refresh in dashboard
- **Alerts:** Real-time via API polling

## 🎨 Visual Features

### Enhancements Over SkyLive

✅ **3-Plane Grid System** - XZ/XY/YZ coordinate planes (SkyLive has 2D grid)
✅ **Danger Indicators** - Red glow for close NEOs < 0.05 AU (SkyLive lacks this)
✅ **Dual Detail Panels** - Separate planet/NEO info cards (SkyLive has basic popups)
✅ **15,000 Stars** - Enhanced starfield density (SkyLive ~8000)
✅ **Elliptical Orbits** - True Keplerian mechanics (SkyLive approximate)
✅ **Real-Time Updates** - Auto-refresh ephemeris (SkyLive static)
✅ **Advanced Controls** - Speed/pause/grid/orbit/label toggles
✅ **Camera Damping** - Smooth navigation (SkyLive basic controls)

## 📖 Next Steps

1. **Phase 11:** Implement Cesium.js Earth Dashboard
2. **Phase 12:** Enhance Prophecy Codex with correlations
3. **Optional:** Add comet tails, bloom effects, VR mode

## 🆘 Support

If you encounter issues:
1. Check the console for error messages (F12 in browser)
2. Verify both servers are running (backend + frontend)
3. Check database connection
4. Review the logs in terminal windows

**Happy Celestial Tracking! 🌌✨**
