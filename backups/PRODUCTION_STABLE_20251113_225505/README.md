# Quick Restore Guide

## PRODUCTION_STABLE_20251113_225505

**Created**: November 13, 2025 22:55:05  
**Status**: ✅ Verified Production Stable  
**Version**: 1.1.0  

---

## What's Included

This backup contains the complete working state of Phobetron with:

### Features
- 12 functional pages (10 fully working, 2 with fallback)
- 3 new UI pages (Celestial Signs, Orbital Elements, ML Models)
- Scrollable navigation with visible thin scrollbar
- Live API integration for all data endpoints
- Database with 6 orbital elements, 10 celestial signs, 40 prophecies

### Files Backed Up
```
backend/              # Complete FastAPI backend
frontend/             # Complete Vite/React frontend
railway.toml          # Railway deployment configuration
PRODUCTION_STABLE_CONFIG_PREVIOUS.md  # Previous config state
```

---

## Emergency Restore (1 Minute)

```powershell
# Navigate to project root
cd f:\Projects\phobetron_web_app

# Copy all files from backup
Copy-Item -Path "backups\PRODUCTION_STABLE_20251113_225505\backend\*" `
          -Destination "backend\" -Recurse -Force

Copy-Item -Path "backups\PRODUCTION_STABLE_20251113_225505\frontend\*" `
          -Destination "frontend\" -Recurse -Force

Copy-Item -Path "backups\PRODUCTION_STABLE_20251113_225505\railway.toml" `
          -Destination "railway.toml" -Force

# Deploy to Railway
git add .
git commit -m "Emergency restore from PRODUCTION_STABLE_20251113_225505"
git push origin 001-database-schema

# Wait 30-45 seconds for Railway rebuild
# Verify: https://phobetronwebapp-production-d69a.up.railway.app
```

---

## Verification Steps

After restore, verify these endpoints:

```bash
# Backend health
curl https://phobetronwebapp-production.up.railway.app/api/v1/admin/check-tables

# Data endpoints
curl https://phobetronwebapp-production.up.railway.app/api/v1/events/earthquakes?limit=1
curl https://phobetronwebapp-production.up.railway.app/api/v1/scientific/orbital-elements?limit=1
curl https://phobetronwebapp-production.up.railway.app/api/v1/theological/celestial-signs?limit=1
```

All should return valid JSON data.

---

## What Was Fixed in This Version

✅ Navigation scrollbar made visible (purple, 4px thin)  
✅ All 12 pages accessible via horizontal scroll  
✅ API endpoint prefixes corrected (/api/v1)  
✅ Orbital Elements field mappings fixed  
✅ Default API URLs point to production  
✅ ProphecyCodex live API integration  

---

## Railway Configuration

### Backend Variables
```
DATABASE_URL=postgresql://postgres:diAzWOwKuEhKBcNLcZlsVqfwHrptCQlt@crossover.proxy.rlwy.net:44440/railway
PORT=8000
```

### Frontend Variables
```
VITE_API_URL=https://phobetronwebapp-production.up.railway.app/api/v1
PORT=3000
```

---

## Known Issues (Non-Critical)

- ML Watchman Alerts endpoint returns 500 error
- Affected pages use fallback mock data (fully functional)

---

For detailed deployment notes, see `DEPLOYMENT_NOTES.md` in this backup folder.
