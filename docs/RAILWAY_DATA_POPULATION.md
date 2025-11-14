# 🚀 Railway Production Data Population Guide

## Overview
This guide explains how to populate the production Railway database with feast days and natural disaster data required for the Pattern Detection Dashboard.

## Prerequisites
- Railway CLI installed: `npm install -g @railway/cli`
- Logged in to Railway: `railway login`
- Linked to the correct project: `railway link`

## Step 1: Verify Railway Deployment

Wait for the latest deployment to complete:
```bash
# Check deployment status
railway status
```

Expected output:
- Backend service: ✅ Deployed
- Frontend service: ✅ Deployed

## Step 2: Run Population Script

Execute the population script in the Railway backend environment:

```bash
railway run --service backend python scripts/populate_production_data.py
```

**Alternative method** (if Railway run doesn't work):
```bash
# Open Railway shell for backend service
railway shell backend

# Run the script
python scripts/populate_production_data.py

# Exit shell
exit
```

## Expected Output

```
============================================================
PRODUCTION DATA POPULATION SCRIPT
============================================================

============================================================
CHECKING EXISTING DATA IN PRODUCTION
============================================================

Feast Days: 0 records
Volcanic Activity: 0 records
Hurricanes: 0 records
Tsunamis: 0 records

============================================================
POPULATING MISSING DATA
============================================================

Populating feast days...
✅ Added 66 feast days

Populating volcanic activity data...
✅ Added 7 volcanic events

Populating hurricane data...
✅ Added 8 hurricanes

Populating tsunami data...
✅ Added 10 tsunamis

============================================================
POPULATION COMPLETE
============================================================

✅ Total feast days added: 66
✅ Total volcanic events added: 7
✅ Total hurricanes added: 8
✅ Total tsunamis added: 10

📊 Grand total: 91 new records

============================================================
CHECKING EXISTING DATA IN PRODUCTION
============================================================

Feast Days: 66 records
Volcanic Activity: 7 records
Hurricanes: 8 records
Tsunamis: 10 records

============================================================
READY FOR PATTERN DETECTION! 🎉
============================================================
```

## Step 3: Verify Data Population

Test the theological API endpoint:
```bash
curl https://phobetronwebapp-production.up.railway.app/api/v1/theological/feasts?year=2025
```

Expected: JSON response with 6 feast days for 2025:
- Passover
- Unleavened Bread
- Pentecost
- Trumpets
- Atonement
- Tabernacles

## Step 4: Test Pattern Detection Dashboard

Visit the Pattern Detection page:
```
https://phobetronwebapp-production-d69a.up.railway.app/pattern-detection
```

Expected behavior:
1. Page loads without errors
2. Click "Analyze Patterns" button
3. Statistics cards show:
   - Total Patterns: > 0
   - Event counts: 7 volcanic, 8 hurricanes, 10 tsunamis
4. Correlation patterns display feast days with nearby natural disasters

## Troubleshooting

### Issue: "DATABASE_URL environment variable not set"
**Solution**: Railway automatically sets this variable. Ensure you're using `railway run` or `railway shell` commands.

### Issue: ModuleNotFoundError
**Solution**: Ensure the latest deployment includes `backend/scripts/populate_production_data.py`. Check Railway logs.

### Issue: Script runs but adds 0 records
**Cause**: Data already populated (script is idempotent)
**Action**: No action needed - verify data exists via API endpoints

### Issue: Pattern Detection shows "No patterns found"
**Possible causes**:
1. Feast days not populated → Run population script
2. API endpoint error → Check Railway backend logs
3. Date range issue → Try different year range (2024-2025)

## Data Summary

After successful population, production database contains:

| Table | Records | Description |
|-------|---------|-------------|
| feast_days | 66 | Biblical feast days (2020-2030) |
| volcanic_activity | 7 | Major volcanic eruptions |
| hurricanes | 8 | Tropical storms (Category 3-5) |
| tsunamis | 10 | Tsunami events |
| earthquakes | ~93 | Already populated |
| neo_close_approaches | ~80 | Already populated |

## Next Steps After Population

1. **Test feast days API**:
   ```bash
   curl https://phobetronwebapp-production.up.railway.app/api/v1/theological/feasts?year=2024
   ```

2. **Test pattern detection** (requires POST):
   ```bash
   curl -X POST "https://phobetronwebapp-production.up.railway.app/api/v1/ml/comprehensive-pattern-detection?start_date=2024-01-01&end_date=2025-12-31"
   ```

3. **Visit Pattern Detection Dashboard**:
   - Navigate to `/pattern-detection`
   - Set year range: 2024-2025
   - Click "Analyze Patterns"
   - View correlations between feast days and natural disasters

## Notes

- **Idempotent**: Script can be run multiple times safely
- **No duplicates**: Checks for existing records before inserting
- **Production-safe**: Uses transactions with rollback on error
- **Progress reporting**: Detailed output shows what's being populated

---

**Script Location**: `backend/scripts/populate_production_data.py`  
**Railway Service**: `backend` (endearing-encouragement)  
**Database**: PostgreSQL 15 on Railway
