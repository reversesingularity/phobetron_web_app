# 📊 Database Population Guide - Phobetron

Complete guide for populating databases with **Interstellar Objects**, **Near-Earth Objects (NEOs)**, and **Seismos Events** (volcanic eruptions, hurricanes, tsunamis).

---

## 📋 Overview

The dashboard shows three main intelligence sections that need data:
1. **☄️ Interstellar Objects** - Hyperbolic trajectory objects (e > 1)
2. **🌑 Near-Earth Objects (NEOs)** - Impact risk assessments from JPL Sentry
3. **⚡ Seismos Events** - Natural disasters (σεισμός)

---

## 🚀 Quick Start - Populate Everything

### **Option 1: Run All Seed Scripts** (Recommended for Development)

```bash
# Activate Python environment
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 1. Populate celestial objects (includes interstellar objects)
python populate_database.py

# 2. Seed earthquake data (sample data)
python seed_events_data.py

# 3. Seed orbital data (planets, asteroids, comets)
python seed_orbital_data.py

# 4. Seed theological/biblical data
python seed_theological_data.py
```

### **Option 2: Fetch Real-Time Data** (Recommended for Production)

```bash
cd backend/scripts

# Fetch NEO data from NASA JPL
python collect_neo_data.py

# Train ML correlation models
python train_ml_models.py
```

---

## 1️⃣ Interstellar Objects (☄️)

### **What You Need:**
- Objects with **eccentricity > 1** (hyperbolic orbits)
- Examples: 1I/2017 U1 ('Oumuamua), 2I/Borisov, C/2025 V1 (Borisov)

### **Method 1: Use Existing Script**

The `populate_database.py` already includes interstellar objects:

```python
# Interstellar Objects
{
    'object_name': '1I/2017 U1 (Oumuamua)',
    'semi_major_axis_au': -1.280,  # Negative for hyperbolic orbit
    'eccentricity': 1.201,          # > 1 for hyperbolic
    'inclination_deg': 122.7,
    'is_interstellar': True,        # Flag for filtering
    'data_source': 'JPL'
},
{
    'object_name': '2I/Borisov',
    'semi_major_axis_au': -0.851,
    'eccentricity': 3.357,
    'inclination_deg': 44.05,
    'is_interstellar': True,
    'data_source': 'JPL'
},
{
    'object_name': 'C/2025 V1 (Borisov)',  # Recently added
    'semi_major_axis_au': -1.500,
    'eccentricity': 2.800,
    'inclination_deg': 85.0,
    'is_interstellar': True,
    'data_source': 'MPC'
}
```

**Run:**
```bash
python populate_database.py
```

### **Method 2: Add New Interstellar Objects Manually**

```bash
# Open PostgreSQL CLI
psql -U postgres -d phobetron

# Insert new interstellar object
INSERT INTO orbital_elements (
    object_name, semi_major_axis_au, eccentricity, inclination_deg,
    longitude_ascending_node_deg, argument_perihelion_deg, mean_anomaly_deg,
    is_interstellar, data_source, created_at
) VALUES (
    '3I/ATLAS',  -- New interstellar object
    -2.500,      -- Negative semi-major axis
    1.400,       -- e > 1 (hyperbolic)
    135.0,
    300.0,
    180.0,
    0.0,
    TRUE,        -- Mark as interstellar
    'MPC',
    NOW()
);
```

### **Method 3: Fetch from NASA JPL Horizons API**

Create a script to fetch hyperbolic comets:

```python
# backend/scripts/fetch_interstellar.py
import requests

HORIZONS_API = "https://ssd.jpl.nasa.gov/api/horizons.api"

def fetch_interstellar_objects():
    """Fetch objects with e > 1 from JPL Horizons"""
    # Query for hyperbolic comets
    params = {
        'format': 'json',
        'COMMAND': 'MB',  # Multiple bodies
        'OBJ_DATA': 'YES',
        'MAKE_EPHEM': 'NO',
    }
    
    response = requests.get(HORIZONS_API, params=params)
    # Filter for e > 1
    # Insert into database
```

---

## 2️⃣ Near-Earth Objects (NEOs) 🌑

### **What You Need:**
- Impact risk assessments
- Torino Scale (0-10)
- Palermo Scale
- Impact probability
- Object diameter, velocity

### **Method 1: Use NASA JPL Sentry API** (Best for Real Data)

```bash
cd backend/scripts
python collect_neo_data.py
```

This script fetches data from:
- **NASA JPL Sentry System**: https://cneos.jpl.nasa.gov/sentry/
- **SBDB API**: https://ssd-api.jpl.nasa.gov/sbdb.api

**What it fetches:**
- Apophis (99942)
- Ryugu (162173)
- Bennu (101955)
- 1999 AN10
- 2023 DW
- Toutatis (4179)
- Nereus (4660)
- Eros (433)

### **Method 2: Manual Insert (Sample Data)**

```sql
-- Insert sample NEO impact risk data
INSERT INTO impact_risks (
    object_name, torino_scale, palermo_scale, impact_probability,
    estimated_diameter, relative_velocity, potential_impacts,
    last_observation_date, data_source
) VALUES
('99942 Apophis', 0, -3.2, 2.7e-5, 370, 7.42, 15, '2024-10-15', 'JPL Sentry'),
('2023 DW', 1, -2.8, 1.2e-4, 50, 18.5, 3, '2024-11-01', 'JPL Sentry'),
('1999 AN10', 0, -4.1, 5.3e-6, 800, 12.3, 8, '2024-09-20', 'JPL Sentry');
```

### **Method 3: Create Backend Endpoint for Real-Time Sync**

Add to `backend/app/api/routes/data_sources.py`:

```python
@router.post("/sync/neo-risks")
async def sync_neo_risks(db: Session = Depends(get_db)):
    """Fetch and sync NEO impact risks from JPL Sentry"""
    import requests
    
    # Fetch from NASA API
    response = requests.get("https://ssd-api.jpl.nasa.gov/sentry.api")
    data = response.json()
    
    # Insert into database
    for neo in data['data']:
        risk = ImpactRisks(
            object_name=neo['fullname'],
            torino_scale=neo.get('ts_max', 0),
            palermo_scale=neo.get('ps_max', -10),
            impact_probability=neo.get('ip', 0),
            # ... more fields
        )
        db.add(risk)
    
    db.commit()
    return {"synced": len(data['data'])}
```

**Run sync:**
```bash
curl -X POST http://localhost:8020/api/v1/data-sources/sync/neo-risks
```

---

## 3️⃣ Seismos Events (⚡ σεισμός)

### **A. Volcanic Eruptions 🌋**

#### **Method 1: Smithsonian Global Volcanism Program**

```python
# backend/scripts/fetch_volcanic_data.py
import requests
from datetime import datetime

GVP_API = "https://webservices.volcano.si.edu/geoserver/GVP-VOTW/ows"

def fetch_volcanic_eruptions():
    """Fetch volcanic eruptions from Smithsonian GVP"""
    params = {
        'service': 'WFS',
        'version': '1.0.0',
        'request': 'GetFeature',
        'typeName': 'GVP-VOTW:Smithsonian_VOTW_Holocene_Volcanoes',
        'outputFormat': 'json'
    }
    
    response = requests.get(GVP_API, params=params)
    data = response.json()
    
    for volcano in data['features']:
        props = volcano['properties']
        coords = volcano['geometry']['coordinates']
        
        # Insert into database
        volcanic_event = VolcanicActivity(
            volcano_name=props['Volcano_Name'],
            country=props['Country'],
            vei=props.get('VEI', 0),
            latitude=coords[1],
            longitude=coords[0],
            eruption_date=props.get('Eruption_Start_Date'),
            data_source='Smithsonian GVP'
        )
        db.add(volcanic_event)
```

#### **Method 2: Manual Insert (Sample Data)**

```sql
INSERT INTO volcanic_activity (
    volcano_name, country, vei, latitude, longitude, 
    eruption_date, data_source
) VALUES
('Mount St. Helens', 'USA', 5, 46.20, -122.18, '1980-05-18', 'USGS'),
('Eyjafjallajökull', 'Iceland', 4, 63.63, -19.62, '2010-04-14', 'IMO'),
('Pinatubo', 'Philippines', 6, 15.13, 120.35, '1991-06-15', 'PHIVOLCS'),
('Krakatoa', 'Indonesia', 6, -6.10, 105.42, '1883-08-27', 'Smithsonian'),
('Kilauea', 'USA', 4, 19.42, -155.29, '2018-05-03', 'USGS');
```

### **B. Hurricanes 🌀**

#### **Method 1: NOAA National Hurricane Center**

```python
# backend/scripts/fetch_hurricane_data.py
import requests

NOAA_API = "https://www.nhc.noaa.gov/gis/archive/"

def fetch_hurricane_data(year=2024):
    """Fetch hurricane data from NOAA NHC"""
    url = f"{NOAA_API}{year}/STORM_TRACKS_{year}.json"
    response = requests.get(url)
    data = response.json()
    
    for storm in data['features']:
        props = storm['properties']
        
        hurricane = Hurricane(
            name=props['STORMNAME'],
            basin=props['BASIN'],
            category=props['SSHWS'],  # Saffir-Simpson scale
            max_wind_speed=props['MAXWIND'],
            min_pressure=props['MINPRESSURE'],
            start_date=props['STARTDATE'],
            data_source='NOAA NHC'
        )
        db.add(hurricane)
```

#### **Method 2: Sample Data**

```sql
INSERT INTO hurricanes (
    name, basin, category, max_wind_speed, min_pressure,
    latitude, longitude, start_date, data_source
) VALUES
('Katrina', 'Atlantic', 5, 280, 902, 29.25, -89.60, '2005-08-23', 'NOAA'),
('Patricia', 'East Pacific', 5, 345, 872, 19.00, -105.00, '2015-10-20', 'NOAA'),
('Haiyan (Yolanda)', 'West Pacific', 5, 315, 895, 11.16, 125.23, '2013-11-03', 'JMA'),
('Maria', 'Atlantic', 5, 280, 908, 18.04, -66.62, '2017-09-16', 'NOAA');
```

### **C. Tsunamis 🌊**

#### **Method 1: NOAA NGDC Tsunami Database**

```python
# backend/scripts/fetch_tsunami_data.py
import requests

NGDC_API = "https://www.ngdc.noaa.gov/hazel/hazard-service/api/v1/tsunamis"

def fetch_tsunami_data():
    """Fetch tsunami events from NOAA NGDC"""
    params = {
        'minYear': 1900,
        'maxYear': 2024,
    }
    
    response = requests.get(NGDC_API, params=params)
    data = response.json()
    
    for event in data['items']:
        tsunami = Tsunami(
            cause=event['cause'],
            soloviev_intensity=event.get('intensity', 0),
            max_wave_height=event.get('maxWaterHeight'),
            latitude=event['latitude'],
            longitude=event['longitude'],
            event_date=event['eventDate'],
            deaths=event.get('deaths'),
            data_source='NOAA NGDC'
        )
        db.add(tsunami)
```

#### **Method 2: Sample Data**

```sql
INSERT INTO tsunamis (
    cause, soloviev_intensity, max_wave_height, latitude, longitude,
    event_date, deaths, data_source
) VALUES
('Earthquake', 10, 40.5, 38.32, 142.37, '2011-03-11', 15894, 'NOAA NGDC'),
('Earthquake', 8, 15.0, 3.30, 95.78, '2004-12-26', 227898, 'NOAA NGDC'),
('Landslide', 7, 524.0, 58.65, -137.09, '1958-07-09', 5, 'USGS'),
('Earthquake', 9, 25.0, -3.30, -80.47, '1868-08-13', 25000, 'Historical');
```

---

## 🤖 Automated Data Collection (Production Setup)

### **Create Cron Jobs for Daily Updates**

```bash
# Edit crontab
crontab -e

# Add these lines:
# Update NEO data daily at 2 AM
0 2 * * * cd /path/to/phobetron/backend/scripts && python collect_neo_data.py

# Update seismos data daily at 3 AM
0 3 * * * cd /path/to/phobetron/backend/scripts && python fetch_volcanic_data.py
0 3 * * * cd /path/to/phobetron/backend/scripts && python fetch_hurricane_data.py
0 3 * * * cd /path/to/phobetron/backend/scripts && python fetch_tsunami_data.py

# Retrain ML models weekly (Sundays at 4 AM)
0 4 * * 0 cd /path/to/phobetron/backend/scripts && python train_ml_models.py
```

### **Or Use FastAPI Background Tasks**

Add to `backend/app/main.py`:

```python
from fastapi_utils.tasks import repeat_every

@app.on_event("startup")
@repeat_every(seconds=60 * 60 * 24)  # Every 24 hours
async def update_neo_data():
    """Background task to update NEO data daily"""
    import subprocess
    subprocess.run(["python", "scripts/collect_neo_data.py"])

@app.on_event("startup")
@repeat_every(seconds=60 * 60 * 24)
async def update_seismos_data():
    """Background task to update seismos data daily"""
    subprocess.run(["python", "scripts/fetch_volcanic_data.py"])
    subprocess.run(["python", "scripts/fetch_hurricane_data.py"])
    subprocess.run(["python", "scripts/fetch_tsunami_data.py"])
```

---

## 🔍 Verify Data Population

### **Check Database Counts**

```bash
# PostgreSQL CLI
psql -U postgres -d phobetron

-- Count interstellar objects
SELECT COUNT(*) FROM orbital_elements WHERE is_interstellar = TRUE;

-- Count NEOs
SELECT COUNT(*) FROM impact_risks;

-- Count seismos events
SELECT COUNT(*) FROM volcanic_activity;
SELECT COUNT(*) FROM hurricanes;
SELECT COUNT(*) FROM tsunamis;

-- View sample interstellar objects
SELECT object_name, eccentricity, is_interstellar 
FROM orbital_elements 
WHERE is_interstellar = TRUE;

-- View sample NEOs
SELECT object_name, torino_scale, palermo_scale, impact_probability
FROM impact_risks
ORDER BY torino_scale DESC, impact_probability DESC
LIMIT 10;
```

### **Test API Endpoints**

```bash
# Test interstellar objects
curl "http://localhost:8020/api/v1/scientific/orbital-elements?is_interstellar=true"

# Test NEOs
curl "http://localhost:8020/api/v1/scientific/impact-risks?limit=10"

# Test volcanic activity
curl "http://localhost:8020/api/v1/scientific/volcanic?min_vei=4&limit=10"

# Test hurricanes
curl "http://localhost:8020/api/v1/scientific/hurricanes?min_category=3&limit=10"

# Test tsunamis
curl "http://localhost:8020/api/v1/scientific/tsunamis?min_intensity=6&limit=10"
```

---

## 📦 Complete Setup Script

Create `backend/scripts/populate_all_data.sh`:

```bash
#!/bin/bash
echo "🌟 Populating Phobetron Database"
echo "=================================="

# Activate virtual environment
source ../venv/bin/activate

# 1. Celestial objects (includes interstellar)
echo "📡 Populating celestial objects..."
python ../populate_database.py

# 2. NEO data from NASA
echo "🌑 Fetching NEO data from NASA JPL..."
python collect_neo_data.py

# 3. Volcanic data
echo "🌋 Fetching volcanic eruption data..."
python fetch_volcanic_data.py

# 4. Hurricane data
echo "🌀 Fetching hurricane data..."
python fetch_hurricane_data.py

# 5. Tsunami data
echo "🌊 Fetching tsunami data..."
python fetch_tsunami_data.py

# 6. Seed sample events
echo "📊 Seeding sample events..."
python ../seed_events_data.py

# 7. Train ML models
echo "🤖 Training correlation models..."
python train_ml_models.py

echo ""
echo "✅ Database population complete!"
echo "🚀 Start the app: uvicorn app.main:app --reload --port 8020"
```

**Make executable and run:**
```bash
chmod +x backend/scripts/populate_all_data.sh
./backend/scripts/populate_all_data.sh
```

---

## 🎯 Summary

### **Quick Commands:**

```bash
# Development (Sample Data)
python backend/populate_database.py        # Interstellar + planets
python backend/seed_events_data.py         # Sample earthquakes

# Production (Real Data)
python backend/scripts/collect_neo_data.py # NEOs from NASA
# Create volcanic/hurricane/tsunami fetch scripts

# Verify
psql -U postgres -d phobetron -c "SELECT COUNT(*) FROM orbital_elements WHERE is_interstellar = TRUE;"
psql -U postgres -d phobetron -c "SELECT COUNT(*) FROM impact_risks;"
```

### **Data Sources:**

| Section | Data Source | API/URL |
|---------|-------------|---------|
| **Interstellar Objects** | JPL Horizons, MPC | https://ssd.jpl.nasa.gov/horizons/ |
| **NEOs** | JPL Sentry | https://cneos.jpl.nasa.gov/sentry/ |
| **Volcanic** | Smithsonian GVP | https://volcano.si.edu/ |
| **Hurricanes** | NOAA NHC | https://www.nhc.noaa.gov/ |
| **Tsunamis** | NOAA NGDC | https://www.ngdc.noaa.gov/hazel/view/hazards/tsunami |

---

**After populating, refresh your dashboard and watch the Watchman Intelligence come alive!** ✨🌍🚀
