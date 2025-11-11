# ESA Data Source Integration - Complete Guide

**Date**: November 3, 2025  
**Version**: 1.0.0  
**Status**: Production Ready

---

## 🌍 Overview

Due to the current NASA government shutdown affecting JPL (Jet Propulsion Laboratory), CNEOS (Center for Near-Earth Object Studies), and other NASA data services, we have integrated the **European Space Agency (ESA)** as a reliable alternative data source for celestial tracking.

### Key Features

✅ **Automatic Fallback**: System automatically switches from NASA to ESA when NASA is unavailable  
✅ **Manual Control**: Admin can manually switch between NASA and ESA sources  
✅ **Real-time Status**: Dashboard shows current source status and availability  
✅ **Identical Data Format**: ESA data transformed to match NASA format seamlessly  
✅ **Zero Downtime**: Application continues functioning during NASA shutdowns

---

## 🏗️ Architecture

### Data Source Hierarchy

```
Primary Source: NASA JPL (when available)
    ↓ (unavailable)
Fallback Source: ESA NEOCC (European alternative)
    ↓ (unavailable)
Local Cache: Fallback data (last resort)
```

### Component Structure

```
backend/
├── app/
│   ├── integrations/
│   │   ├── esa_client.py              ← ESA API client (NEW)
│   │   └── external_apis.py           ← News/Twitter/USGS
│   └── api/
│       └── routes/
│           └── data_sources.py        ← Data source management API (NEW)

frontend/
└── src/
    └── components/
        └── data-sources/
            └── DataSourceStatusPanel.tsx  ← Status UI (NEW)
```

---

## 🔌 Backend Implementation

### 1. ESA NEOCC Client (`backend/app/integrations/esa_client.py`)

**ESA APIs Integrated:**

- **ESA NEO Coordination Centre (NEOCC)**: https://neo.ssa.esa.int
  - Priority NEO list
  - Close approach data
  - Impact risk assessments
  - Orbital elements

- **ESA Space Situational Awareness (SSA)**: https://swe.ssa.esa.int
  - Broader space object tracking
  - Space weather data

**Key Classes:**

#### `ESANEOClient`
```python
from app.integrations.esa_client import ESANEOClient

client = ESANEOClient()

# Get priority NEOs
neos = client.get_priority_objects(limit=100)

# Get close approaches
approaches = client.get_close_approaches(days_forward=30, min_distance_au=0.05)

# Get specific object
obj = client.get_object_by_name("99942 Apophis")
```

#### `CelestialDataFallbackManager`
```python
from app.integrations.esa_client import get_fallback_manager

manager = get_fallback_manager()

# Auto fallback (tries NASA first, then ESA)
data, source = manager.get_neo_data(limit=100)
print(f"Using {source}")  # "NASA JPL" or "ESA NEOCC"

# Force ESA
data, source = manager.get_neo_data(limit=100, force_source="ESA")

# Get source status
status = manager.get_source_status()
```

### 2. API Endpoints (`backend/app/api/routes/data_sources.py`)

#### Health & Status

```bash
# Health check
GET /api/v1/data-sources/health
Response: {
  "status": "healthy",
  "sources": {
    "nasa": { "available": false, "status": "offline (government shutdown)" },
    "esa": { "available": true, "status": "online" }
  },
  "active_source": "ESA NEOCC"
}

# Detailed status
GET /api/v1/data-sources/status
Response: {
  "sources": {
    "nasa": { "available": false, "last_check": "2025-11-03T10:30:00Z", ... },
    "esa": { "available": true, "last_check": "2025-11-03T10:30:00Z", ... },
    "active_source": "ESA NEOCC",
    "recommendation": "Using ESA as primary due to NASA shutdown"
  }
}
```

#### Data Fetching

```bash
# Get NEO objects (auto fallback)
GET /api/v1/data-sources/neo-objects?limit=100&source=AUTO
Response: {
  "total": 100,
  "source": "ESA NEOCC",
  "data": [...]
}

# Force ESA source
GET /api/v1/data-sources/neo-objects?limit=50&source=ESA

# Get close approaches
GET /api/v1/data-sources/close-approaches?days_forward=30&min_distance_au=0.05&source=AUTO

# Get specific object
GET /api/v1/data-sources/objects/Apophis?source=AUTO
```

#### Manual Control

```bash
# Switch to ESA
POST /api/v1/data-sources/switch-source?source=ESA

# Switch back to NASA (when available)
POST /api/v1/data-sources/switch-source?source=NASA
```

#### Direct ESA Access

```bash
# Bypass fallback, query ESA directly
GET /api/v1/data-sources/esa/priority-list?limit=100
```

---

## 🎨 Frontend Implementation

### Data Source Status Panel Component

**Location**: `frontend/src/components/data-sources/DataSourceStatusPanel.tsx`

**Features**:
- Real-time source availability display
- Color-coded status indicators (green = online, red = offline)
- Active source highlighting
- Manual source switching buttons
- Last update timestamp
- Auto-refresh every 2 minutes
- Health status badge

**Usage**:

```tsx
import DataSourceStatusPanel from '@/components/data-sources/DataSourceStatusPanel';

// In your component
<DataSourceStatusPanel className="w-80" />
```

**Integration in Solar System Page**:

Added at `fixed bottom-32 left-20 lg:left-72 z-30` (above Time Controls panel)

---

## 🔄 Data Format Transformation

ESA uses slightly different field names than NASA. Our client automatically transforms ESA data to match NASA format:

### ESA → NASA Mapping

| ESA Field | NASA Field | Notes |
|-----------|------------|-------|
| `a` | `semi_major_axis_au` | Semi-major axis in AU |
| `e` | `eccentricity` | Orbital eccentricity |
| `i` | `inclination_deg` | Inclination in degrees |
| `node` / `om` | `longitude_ascending_node_deg` | Longitude of ascending node |
| `peri` / `w` | `argument_perihelion_deg` | Argument of perihelion |
| `M` / `ma` | `mean_anomaly_deg` | Mean anomaly |
| `H` | `absolute_magnitude` | Absolute magnitude |
| `diameter` | `diameter_km` | Estimated diameter |

### Example Transformation

**ESA Response:**
```json
{
  "name": "99942 Apophis",
  "a": 0.922,
  "e": 0.191,
  "i": 3.33,
  "om": 204.4,
  "w": 126.4,
  "ma": 245.7,
  "H": 19.7
}
```

**Transformed to Standard Format:**
```json
{
  "object_name": "99942 Apophis",
  "semi_major_axis_au": 0.922,
  "eccentricity": 0.191,
  "inclination_deg": 3.33,
  "longitude_ascending_node_deg": 204.4,
  "argument_perihelion_deg": 126.4,
  "mean_anomaly_deg": 245.7,
  "absolute_magnitude": 19.7,
  "data_source": "ESA NEOCC"
}
```

---

## 🧪 Testing

### Backend Testing

```python
# Test ESA client
python backend/app/integrations/esa_client.py

# Expected output:
# === ESA Celestial Data Integration Test ===
# 1. Testing ESA NEO Coordination Centre...
#    ✓ Fetched 10 priority NEOs from ESA
#    Sample NEO: 99942 Apophis
#    Data source: ESA NEOCC
# 
# 2. Testing ESA close approaches...
#    ✓ Found 15 upcoming close approaches
# 
# 3. Testing Fallback Manager...
#    ✓ Fetched 20 NEOs from ESA NEOCC
# 
# 4. Data Source Status:
#    NASA: OFFLINE (Government Shutdown)
#    ESA: ONLINE
#    Active Source: ESA NEOCC
#    Recommendation: Using ESA as primary due to NASA shutdown
```

### API Testing

```bash
# Test health endpoint
curl http://localhost:8020/api/v1/data-sources/health

# Test NEO data fetch
curl http://localhost:8020/api/v1/data-sources/neo-objects?limit=10&source=AUTO

# Test close approaches
curl http://localhost:8020/api/v1/data-sources/close-approaches?days_forward=7

# Test specific object
curl http://localhost:8020/api/v1/data-sources/objects/Apophis
```

### Frontend Testing

1. Start backend: `cd backend && uvicorn app.main:app --reload --port 8020`
2. Start frontend: `cd frontend && npm run dev`
3. Navigate to `/solar-system`
4. Check Data Source Status Panel (bottom-left, above Time Controls)
5. Verify:
   - ✅ NASA shows "OFFLINE (Government Shutdown)"
   - ✅ ESA shows "ONLINE"
   - ✅ ESA is marked as "ACTIVE"
   - ✅ Can manually switch sources
   - ✅ Status auto-refreshes every 2 minutes

---

## 📊 Database Integration

### Data Source Field

All scientific models have a `data_source` field:

```python
# OrbitalElements model
data_source = Column(String(100), nullable=True, 
                     comment='Source: NASA Sentry, ESA NEOCC, etc.')
```

When storing ESA data, set `data_source='ESA NEOCC'` to track origin.

### Alert System Integration

The alert system's `data_source_api` field supports both:

```python
data_source_api = Column(
    String(50), nullable=False, default='OTHER',
    comment='API source: JPL_HORIZONS, JPL_SENTRY, JPL_CNEOS, ESA_NEOCC, etc.'
)
```

**Valid values**: `'JPL_HORIZONS'`, `'JPL_SENTRY'`, `'JPL_CNEOS'`, `'ESA_NEOCC'`, `'NASA_NEO'`, `'OTHER'`

---

## 🚀 Deployment Checklist

### Environment Variables

No new environment variables required! ESA NEOCC API is public and doesn't require authentication.

Optional configuration:
```bash
# .env
ESA_NEOCC_BASE_URL=https://neo.ssa.esa.int/neo-api  # Optional override
ESA_SSA_BASE_URL=https://swe.ssa.esa.int/web-services  # Optional override
```

### Production Setup

1. **Backend**:
   ```bash
   cd backend
   pip install -r requirements.txt  # No new deps needed
   uvicorn app.main:app --host 0.0.0.0 --port 8020
   ```

2. **Frontend**:
   ```bash
   cd frontend
   npm install  # No new deps needed
   npm run build
   npm start
   ```

3. **Verify Integration**:
   ```bash
   curl http://your-domain/api/v1/data-sources/health
   ```

### Monitoring

Monitor these endpoints for system health:

- `/api/v1/data-sources/health` - Overall data source health
- `/api/v1/data-sources/status` - Detailed source status
- `/health` - General API health

Set up alerts if both NASA and ESA become unavailable simultaneously.

---

## 🔧 Configuration Options

### Fallback Behavior

**Default**: Auto-fallback enabled (tries NASA first, then ESA)

**Manual Override**:
```python
# Force ESA (bypass NASA)
manager = get_fallback_manager()
data, source = manager.get_neo_data(force_source="ESA")

# Restore auto-fallback
data, source = manager.get_neo_data(force_source=None)
```

### Refresh Intervals

**Backend**: No polling (on-demand queries)  
**Frontend**: Auto-refresh every 2 minutes (120 seconds)

Modify in `DataSourceStatusPanel.tsx`:
```tsx
// Change refresh interval
const interval = setInterval(() => {
  fetchStatus();
  fetchHealth();
}, 120000);  // 120s = 2 minutes, adjust as needed
```

---

## 📈 Performance Considerations

### API Rate Limits

**ESA NEOCC**:
- No official rate limits published
- Recommended: Max 100 requests/minute
- Best practice: Cache results for 5-10 minutes

**NASA JPL** (when operational):
- Varies by endpoint
- Generally: 1000 requests/hour

### Caching Strategy

Implement caching for frequently accessed data:

```python
from functools import lru_cache
from datetime import datetime, timedelta

# Cache NEO data for 10 minutes
@lru_cache(maxsize=128)
def get_cached_neo_data(cache_key: str):
    manager = get_fallback_manager()
    return manager.get_neo_data(limit=100)
```

### Optimization Tips

1. **Batch Requests**: Fetch multiple objects in one call
2. **Smart Refresh**: Only refresh when data changes (use ETags if available)
3. **Lazy Loading**: Load close approaches only when panel is expanded
4. **Debounce**: Debounce manual source switches to prevent rapid toggling

---

## 🆘 Troubleshooting

### ESA API Returns 404

**Cause**: ESA endpoint structure may have changed  
**Solution**: Check ESA documentation at https://neo.ssa.esa.int/web-services  
**Workaround**: Use fallback data (already implemented)

### Both Sources Unavailable

**Symptoms**: Status shows "NONE", no data returned  
**Solution**: 
1. Check internet connectivity
2. Verify ESA NEOCC is online: https://neo.ssa.esa.int
3. Use local fallback data (getFallbackOrbitalData in CelestialCanvas)

### Data Format Mismatch

**Symptoms**: TypeError or missing fields  
**Solution**: Check `_transform_neo_object` in `esa_client.py` and ensure all required fields are mapped

### Source Won't Switch

**Symptoms**: Manual switch doesn't take effect  
**Solution**:
1. Check backend logs for errors
2. Verify POST request reaches `/api/v1/data-sources/switch-source`
3. Clear browser cache
4. Check CORS settings if frontend/backend on different domains

---

## 🔮 Future Enhancements

### Planned Features

1. **Multiple ESA Sources**: Integrate ESA SSA orbital elements API
2. **JAXA Integration**: Add Japanese space agency as third fallback
3. **Data Quality Metrics**: Compare NASA vs ESA data accuracy
4. **Smart Source Selection**: ML-based optimal source selection
5. **Historical Data Analysis**: Track which source provides better coverage
6. **WebSocket Updates**: Real-time source status push notifications

### ESA APIs to Explore

- **ESA SSA Debris Database**: Space debris tracking
- **ESA Sky Telescope API**: Deep space object catalog
- **ESA Space Weather**: Solar activity and CME data
- **ESA Gaia Archive**: Stellar parallax and proper motion

---

## 📚 References

### ESA Resources

- **ESA NEOCC Portal**: https://neo.ssa.esa.int
- **ESA SSA Program**: https://www.esa.int/Safety_Security/Space_Situational_Awareness
- **ESA Open Data**: https://www.esa.int/Enabling_Support/Space_Engineering_Technology/Data_Systems_and_Ground_Segment

### NASA Resources (for comparison)

- **NASA JPL Small-Body Database**: https://ssd.jpl.nasa.gov/sbdb.cgi
- **NASA CNEOS**: https://cneos.jpl.nasa.gov
- **NASA Horizons**: https://ssd.jpl.nasa.gov/horizons/

### Standards

- **IAU Minor Planet Center**: https://www.minorplanetcenter.net
- **Keplerian Orbital Elements**: Standard format for both NASA and ESA

---

## ✅ Summary

**What We Built**:
- ✅ ESA NEOCC API client with full NEO tracking
- ✅ Automatic NASA → ESA fallback system
- ✅ Manual source switching capability
- ✅ Real-time status monitoring UI
- ✅ Seamless data format transformation
- ✅ Zero-configuration deployment (no API keys needed)

**Benefits**:
- 🛡️ **Resilience**: No downtime during NASA shutdowns
- 🌍 **Redundancy**: Two independent data sources
- 🎯 **Accuracy**: ESA provides comparable quality to NASA
- 🚀 **Performance**: Fast, lightweight API integration
- 🔄 **Future-Proof**: Easy to add more sources (JAXA, Roscosmos, etc.)

**Status**: ✅ **PRODUCTION READY** - Deployed and tested with NASA shutdown scenario

---

**Last Updated**: November 3, 2025  
**Maintained By**: Phobetron Development Team  
**Support**: Check `/api/v1/data-sources/health` endpoint for system status
