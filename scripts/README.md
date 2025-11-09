# Data Population Scripts

Scripts for populating the Phobetron database with real astronomical and geophysical event data from various APIs.

## Overview

These scripts fetch data from public APIs and populate the PostgreSQL database with:
- **USGS Earthquakes** - Seismic events worldwide
- **Volcanic Activity** - Major volcanic eruptions and activity
- **NASA NEO** - Near-Earth Object close approaches

## Prerequisites

1. **Python 3.11+** installed
2. **Database access** - Either:
   - Local PostgreSQL database
   - Railway production database (use `DATABASE_URL` environment variable)
3. **API Keys** (optional but recommended):
   - NASA API Key (free): https://api.nasa.gov/

## Installation

Install required dependencies:

```bash
pip install requests sqlalchemy psycopg2-binary
```

Or from the backend requirements:

```bash
cd ../backend
pip install -r requirements.txt
```

## Environment Setup

Set your database connection string:

```bash
# For local development
export DATABASE_URL="postgresql://user:password@localhost:5432/phobetron"

# For Railway production
export DATABASE_URL="postgresql://postgres:***@crossover.proxy.rlwy.net:44440/railway"
```

## Usage

### 1. Populate Earthquake Data

Fetch earthquake data from USGS:

```bash
# Last 30 days (default)
python populate_earthquakes.py

# Last 7 days
python populate_earthquakes.py --days 7

# Specific date range
python populate_earthquakes.py --date-range 2024-01-01 2024-12-31

# Filter by magnitude
python populate_earthquakes.py --days 30 --min-magnitude 5.0
```

**Options:**
- `--days N` - Number of days back from today
- `--date-range START END` - Custom date range (YYYY-MM-DD format)
- `--min-magnitude X` - Minimum magnitude filter (default: 0.0)
- `--max-magnitude X` - Maximum magnitude filter (default: 10.0)
- `--batch-size N` - Batch size for inserts (default: 100)
- `--database-url URL` - Override DATABASE_URL environment variable

**Data Source:** USGS Earthquake Catalog API
**API Docs:** https://earthquake.usgs.gov/fdsnws/event/1/

### 2. Populate Volcanic Activity Data

Fetch volcanic activity data:

```bash
# Recent 4 weeks (default, sample data)
python populate_volcanic.py

# Recent 8 weeks
python populate_volcanic.py --recent-weeks 8
```

**Options:**
- `--recent-weeks N` - Number of recent weeks to include (default: 4)
- `--batch-size N` - Batch size for inserts (default: 50)
- `--database-url URL` - Override DATABASE_URL environment variable

**Note:** Currently uses sample data for major volcanic eruptions. For production, integrate with:
- Smithsonian Global Volcanism Program (GVP)
- USGS Volcano Hazards Program
- Regional volcano observatories

**Data Source:** Sample data (10 recent significant eruptions)

### 3. Populate NASA NEO Data

Fetch Near-Earth Object close approach data:

```bash
# Next 7 days (default)
python populate_neo.py

# Custom date range
python populate_neo.py --date-range 2024-11-01 2024-11-30

# With NASA API key (recommended for higher rate limits)
python populate_neo.py --api-key YOUR_NASA_API_KEY --days 30
```

**Options:**
- `--days N` - Number of days from today (default: 7)
- `--date-range START END` - Custom date range (YYYY-MM-DD format)
- `--api-key KEY` - NASA API key (uses DEMO_KEY if not provided)
- `--batch-size N` - Batch size for inserts (default: 100)
- `--database-url URL` - Override DATABASE_URL environment variable

**Get NASA API Key:** https://api.nasa.gov/ (free, instant approval)
**Data Source:** NASA NeoWs (Near Earth Object Web Service)
**API Docs:** https://api.nasa.gov/

### 4. Populate All Data

Run all population scripts sequentially:

```bash
python populate_all.py --nasa-api-key YOUR_KEY
```

## Database Schema

### Earthquakes Table
- `id` - UUID primary key
- `event_id` - USGS event ID (unique)
- `event_time` - Earthquake occurrence time
- `magnitude` - Magnitude value
- `magnitude_type` - Type (Mw, ML, Ms, etc.)
- `latitude` / `longitude` - Location coordinates
- `depth_km` - Depth below surface
- `region` - Geographic region description
- `data_source` - Data source (USGS)
- `created_at` - Record creation timestamp

### Volcanic Activity Table
- `id` - UUID primary key
- `volcano_name` - Volcano name
- `country` - Country
- `latitude` / `longitude` - Location coordinates
- `elevation_m` - Elevation in meters
- `event_type` - Event type (Eruption, etc.)
- `activity_level` - Activity level (Minor, Moderate, Major)
- `vei` - Volcanic Explosivity Index (0-8)
- `event_time` - Event occurrence time
- `description` - Event description
- `data_source` - Data source
- `created_at` - Record creation timestamp

### NEO Close Approaches Table
- `id` - UUID primary key
- `neo_id` - NASA NEO ID
- `name` - Object name
- `close_approach_date` - Closest approach date/time
- `miss_distance_km` - Miss distance in kilometers
- `relative_velocity_kmh` - Relative velocity in km/h
- `diameter_min_m` / `diameter_max_m` - Size estimates in meters
- `is_potentially_hazardous` - Hazard flag
- `orbiting_body` - Orbiting body (usually Earth)
- `absolute_magnitude_h` - Absolute magnitude
- `data_source` - Data source (NASA/JPL)
- `created_at` - Record creation timestamp

## Rate Limits

### USGS Earthquake API
- No official rate limit
- Be respectful: ~1 request per second recommended

### NASA API
- **DEMO_KEY:** 30 requests per hour, 50 requests per day
- **Personal API Key:** 1000 requests per hour (free)
- Get your key at: https://api.nasa.gov/

### Smithsonian GVP
- No direct API available
- Use weekly reports or manual data entry

## Error Handling

All scripts include:
- ✅ Automatic retry logic for API failures
- ✅ Duplicate detection (skips existing records)
- ✅ Batch processing for large datasets
- ✅ Transaction rollback on errors
- ✅ Progress reporting

## Examples

### Populate last week of significant earthquakes
```bash
python populate_earthquakes.py --days 7 --min-magnitude 6.0
```

### Populate NEO data for next month
```bash
python populate_neo.py --days 30 --api-key YOUR_KEY
```

### Populate all data for production
```bash
export DATABASE_URL="postgresql://postgres:***@crossover.proxy.rlwy.net:44440/railway"
python populate_all.py --earthquake-days 90 --neo-days 30 --nasa-api-key YOUR_KEY
```

## Verification

After running scripts, verify data in the API:

- **Earthquakes:** https://phobetronwebapp-production.up.railway.app/api/v1/events/earthquakes?limit=10
- **Volcanic:** https://phobetronwebapp-production.up.railway.app/api/v1/events/volcanic-activity?limit=10
- **NEO:** https://phobetronwebapp-production.up.railway.app/api/v1/scientific/close-approaches?limit=10

Or use the Swagger UI: https://phobetronwebapp-production.up.railway.app/docs

## Troubleshooting

### Database Connection Errors
```
Error: DATABASE_URL not set in environment
```
**Solution:** Set `DATABASE_URL` environment variable

### NASA API Rate Limit
```
WARNING: Using DEMO_KEY (limited to 30 requests/hour)
```
**Solution:** Get free API key at https://api.nasa.gov/

### Duplicate Records
```
Skipped: X records
```
**Explanation:** Script automatically skips duplicate records based on unique identifiers

## Scheduled Updates

For production, set up automated data updates:

### Using cron (Linux/Mac)
```bash
# Daily earthquake updates at 2 AM
0 2 * * * cd /path/to/scripts && python populate_earthquakes.py --days 1

# Weekly NEO updates on Mondays
0 3 * * 1 cd /path/to/scripts && python populate_neo.py --days 7
```

### Using Railway Cron Jobs
Configure Railway Cron service to run scripts on schedule.

### Using GitHub Actions
Create workflow to run scripts and update production database.

## Contributing

To add new data sources:

1. Create new population script: `populate_[source].py`
2. Follow the same pattern as existing scripts
3. Add error handling and batch processing
4. Update `populate_all.py` to include new source
5. Document in this README

## License

Part of the Phobetron Web Application project.
