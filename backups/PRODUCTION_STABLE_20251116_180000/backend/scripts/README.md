# 🚀 Phobetron Data Collection Scripts

Complete automation suite for populating and maintaining the Phobetron database.

---

## 📋 Quick Start

### **Populate Everything (One Command)**

```powershell
# Windows PowerShell
cd backend
.\scripts\populate_all_data.ps1
```

This will:
1. ✅ Populate 50+ celestial objects (planets, NEOs, interstellar)
2. ✅ Fetch NEO data from NASA JPL
3. ✅ Add volcanic eruption data
4. ✅ Add hurricane data
5. ✅ Add tsunami data
6. ✅ Seed sample earthquake data

### **Verify Database**

```powershell
# Test all endpoints
.\scripts\test_verification.ps1

# Or check via API
curl http://localhost:8020/api/v1/verify/database-status
```

---

## 📂 Script Directory

### **Data Population Scripts**

| Script | Purpose | Data Source | Run Time |
|--------|---------|-------------|----------|
| `populate_database.py` | Celestial objects (planets, NEOs, interstellar) | Static dataset | ~5 sec |
| `collect_neo_data.py` | Real-time NEO data | NASA JPL SBDB | ~30 sec |
| `fetch_volcanic_data.py` | Volcanic eruptions | Smithsonian GVP + samples | ~15 sec |
| `fetch_hurricane_data.py` | Hurricane data | NOAA NHC + samples | ~10 sec |
| `fetch_tsunami_data.py` | Tsunami events | NOAA NGDC + samples | ~10 sec |
| `seed_events_data.py` | Earthquake sample data | Static dataset | ~5 sec |

### **Automation Scripts**

| Script | Purpose |
|--------|---------|
| `populate_all_data.ps1` | **Master script** - Runs all population scripts |
| `test_verification.ps1` | Tests all verification API endpoints |
| `AUTOMATED_SCHEDULE.txt` | Cron/Task Scheduler configuration guide |
| `sample_inserts.sql` | Manual SQL inserts for testing |

### **Utility Scripts**

| Script | Purpose |
|--------|---------|
| `backup_database.ps1` | PostgreSQL backup |
| `restore_database.ps1` | PostgreSQL restore |
| `train_ml_models.py` | Train correlation ML models |
| `collect_tetrad_data.py` | Blood moon tetrad data |

---

## 🎯 Individual Script Usage

### **1. Celestial Objects (Interstellar + Planets)**

```bash
python populate_database.py
```

**Populates:**
- 8 planets (Mercury → Neptune)
- Comets (C/2025 A6 Lemmon, C/2025 R2 SWAN)
- NEOs (Apophis, Ryugu, Bennu)
- **Interstellar objects** (1I/'Oumuamua, 2I/Borisov, C/2025 V1)

**Output:**
```
Added 54 orbital elements
Skipped 0 duplicates
```

---

### **2. NEO Impact Risks (NASA JPL)**

```bash
python scripts/collect_neo_data.py
```

**Fetches from NASA APIs:**
- JPL SBDB (Small-Body Database)
- CAD (Close Approach Data)

**Targets:**
- 99942 Apophis
- 162173 Ryugu
- 101955 Bennu
- 1999 AN10
- 2023 DW
- 4179 Toutatis
- 4660 Nereus
- 433 Eros

**Output:**
```
Fetching orbital data for 99942 Apophis...
  ✓ Apophis: a=0.922 AU, e=0.191, MOID=0.0003 AU
Added 8 NEO records
```

---

### **3. Volcanic Eruptions**

```bash
python scripts/fetch_volcanic_data.py
```

**Data sources:**
- Smithsonian Global Volcanism Program API
- Curated sample dataset (Mount St. Helens, Pinatubo, Krakatoa, etc.)

**Sample data includes:**
- VEI 5-7 eruptions
- Historical events (Vesuvius, Tambora, Krakatoa)
- Recent eruptions (Kilauea 2018, Eyjafjallajökull 2010)

**Output:**
```
Added 7 sample volcanic records
Fetching volcanic data from Smithsonian GVP...
  ✅ Fetched 42 volcanic records
```

---

### **4. Hurricanes**

```bash
python scripts/fetch_hurricane_data.py
```

**Sample data includes:**
- Category 5 hurricanes (Katrina, Patricia, Maria, Haiyan)
- Atlantic, Pacific, and Indian Ocean basins
- Historical deadly storms (Mitch, Andrew, Dorian)

**Output:**
```
Added 8 sample hurricane records
```

---

### **5. Tsunamis**

```bash
python scripts/fetch_tsunami_data.py
```

**Sample data includes:**
- 2011 Tōhoku tsunami (Japan)
- 2004 Indian Ocean tsunami
- 1958 Lituya Bay megatsunami (tallest wave: 524m)
- Historical events (1755 Lisbon, 1883 Krakatoa)

**Output:**
```
Added 10 sample tsunami records
```

---

## 🔄 Automated Data Updates

### **Windows Task Scheduler**

```powershell
# Set up automated daily updates
schtasks /create /tn "Phobetron NEO Collection" `
  /tr "python f:\Projects\phobetron_web_app\backend\scripts\collect_neo_data.py" `
  /sc daily /st 02:00
```

See `AUTOMATED_SCHEDULE.txt` for complete setup guide.

### **Recommended Schedule**

| Time | Task | Frequency |
|------|------|-----------|
| 1:00 AM | Database backup | Daily |
| 2:00 AM | NEO data collection | Daily |
| 3:00 AM | Volcanic data | Daily |
| 3:30 AM | Hurricane data | Daily |
| 4:00 AM | Tsunami data | Daily |
| 5:00 AM | ML model training | Weekly (Sunday) |

---

## 🧪 API Verification Endpoints

### **Database Status**
```bash
GET http://localhost:8020/api/v1/verify/database-status
```

**Response:**
```json
{
  "orbital_elements": {
    "total": 54,
    "interstellar": 3
  },
  "neo_impact_risks": {
    "total": 8,
    "high_risk": 2
  },
  "volcanic_activity": {
    "total": 49
  },
  "hurricanes": {
    "total": 8
  },
  "tsunamis": {
    "total": 10
  }
}
```

### **Interstellar Objects**
```bash
GET http://localhost:8020/api/v1/verify/interstellar-objects?limit=5
```

### **NEO Risks**
```bash
GET http://localhost:8020/api/v1/verify/neo-risks?limit=10
```

### **Volcanic Activity**
```bash
GET http://localhost:8020/api/v1/verify/volcanic-activity?min_vei=5&limit=10
```

### **Hurricanes**
```bash
GET http://localhost:8020/api/v1/verify/hurricanes?min_category=4&limit=10
```

### **Tsunamis**
```bash
GET http://localhost:8020/api/v1/verify/tsunamis?min_intensity=8&limit=10
```

---

## 📊 Manual SQL Inserts

If you prefer manual database population:

```bash
psql -U postgres -d phobetron -f scripts/sample_inserts.sql
```

See `sample_inserts.sql` for complete SQL examples.

---

## 🐛 Troubleshooting

### **No data appears in dashboard**

1. **Check backend is running:**
   ```powershell
   curl http://localhost:8020/health
   ```

2. **Verify database connection:**
   ```powershell
   curl http://localhost:8020/api/v1/verify/health
   ```

3. **Run population script:**
   ```powershell
   .\scripts\populate_all_data.ps1
   ```

4. **Check verification:**
   ```powershell
   .\scripts\test_verification.ps1
   ```

### **API returns empty arrays**

**Cause:** Database tables are empty

**Fix:**
```powershell
cd backend
python populate_database.py
python scripts/fetch_volcanic_data.py
python scripts/fetch_hurricane_data.py
python scripts/fetch_tsunami_data.py
```

### **NASA API errors**

**Cause:** Rate limiting or network issues

**Fix:**
- Wait 5 minutes and retry
- Check internet connection
- Verify NASA API status: https://api.nasa.gov/

### **PostGIS errors (volcanic/hurricane/tsunami)**

**Cause:** PostGIS extension not enabled

**Fix:**
```sql
-- Connect to database
psql -U postgres -d phobetron

-- Enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;
```

---

## 📈 Data Sources

| Type | Source | URL |
|------|--------|-----|
| **Interstellar** | JPL Horizons, MPC | https://ssd.jpl.nasa.gov/horizons/ |
| **NEOs** | JPL Sentry | https://cneos.jpl.nasa.gov/sentry/ |
| **Volcanic** | Smithsonian GVP | https://volcano.si.edu/ |
| **Hurricanes** | NOAA NHC | https://www.nhc.noaa.gov/ |
| **Tsunamis** | NOAA NGDC | https://www.ngdc.noaa.gov/hazel/ |
| **Earthquakes** | USGS | https://earthquake.usgs.gov/ |

---

## 🎉 Success Criteria

After running `populate_all_data.ps1`, you should see:

✅ **Interstellar Objects:** 3+ (1I/'Oumuamua, 2I/Borisov, C/2025 V1)  
✅ **NEO Impact Risks:** 8+ (Apophis, Bennu, Ryugu, etc.)  
✅ **Volcanic Eruptions:** 40+ (VEI 4-7)  
✅ **Hurricanes:** 8+ (Category 4-5)  
✅ **Tsunamis:** 10+ (Intensity 7-12)  

Dashboard should display:
- **Watchman Intelligence** cards populated
- **Interstellar Objects** showing hyperbolic orbits
- **NEOs** showing impact probabilities
- **Seismos Events** showing volcanic/hurricane/tsunami data

---

## 🚀 Next Steps

1. **Run initial population:**
   ```powershell
   .\scripts\populate_all_data.ps1
   ```

2. **Verify data:**
   ```powershell
   .\scripts\test_verification.ps1
   ```

3. **Set up automation:**
   - Review `AUTOMATED_SCHEDULE.txt`
   - Configure Windows Task Scheduler

4. **Monitor API:**
   - View docs: http://localhost:8020/docs
   - Check status: http://localhost:8020/api/v1/verify/database-status

5. **Refresh dashboard:**
   - Open: http://localhost:3000
   - View Watchman Command Center
   - Check all 3 intelligence cards

---

**Happy Data Collecting!** 🌍✨
