#!/usr/bin/env pwsh
# Complete Database Population Script for Phobetron
# Populates all data: Interstellar Objects, NEOs, and Seismos Events

Write-Host "🌟 Populating Phobetron Database" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check if virtual environment exists
if (!(Test-Path "venv")) {
    Write-Host "❌ Virtual environment not found. Creating..." -ForegroundColor Red
    python -m venv venv
    Write-Host "✅ Virtual environment created" -ForegroundColor Green
}

# Activate virtual environment
Write-Host "🔌 Activating virtual environment..." -ForegroundColor Yellow
& "venv\Scripts\Activate.ps1"

# Install required packages if needed
Write-Host "📦 Checking dependencies..." -ForegroundColor Yellow
pip install -q requests sqlalchemy geoalchemy2 shapely psycopg2-binary

Write-Host ""
Write-Host "=" * 50 -ForegroundColor Cyan
Write-Host "STEP 1: Celestial Objects (Interstellar + Planets + NEOs)" -ForegroundColor Cyan
Write-Host "=" * 50 -ForegroundColor Cyan
Write-Host ""
python populate_database.py

Write-Host ""
Write-Host "=" * 50 -ForegroundColor Cyan
Write-Host "STEP 2: NEO Data from NASA JPL" -ForegroundColor Cyan
Write-Host "=" * 50 -ForegroundColor Cyan
Write-Host ""
python scripts\collect_neo_data.py

Write-Host ""
Write-Host "=" * 50 -ForegroundColor Cyan
Write-Host "STEP 3: Volcanic Eruption Data" -ForegroundColor Cyan
Write-Host "=" * 50 -ForegroundColor Cyan
Write-Host ""
python scripts\fetch_volcanic_data.py

Write-Host ""
Write-Host "=" * 50 -ForegroundColor Cyan
Write-Host "STEP 4: Hurricane Data" -ForegroundColor Cyan
Write-Host "=" * 50 -ForegroundColor Cyan
Write-Host ""
python scripts\fetch_hurricane_data.py

Write-Host ""
Write-Host "=" * 50 -ForegroundColor Cyan
Write-Host "STEP 5: Tsunami Data" -ForegroundColor Cyan
Write-Host "=" * 50 -ForegroundColor Cyan
Write-Host ""
python scripts\fetch_tsunami_data.py

Write-Host ""
Write-Host "=" * 50 -ForegroundColor Cyan
Write-Host "STEP 6: Sample Events Data" -ForegroundColor Cyan
Write-Host "=" * 50 -ForegroundColor Cyan
Write-Host ""
python seed_events_data.py

Write-Host ""
Write-Host "✅ Database population complete!" -ForegroundColor Green
Write-Host "🚀 Start the app: uvicorn app.main:app --reload --port 8020" -ForegroundColor Yellow
Write-Host ""

# Show summary
Write-Host "=" * 50 -ForegroundColor Cyan
Write-Host "DATABASE SUMMARY" -ForegroundColor Cyan
Write-Host "=" * 50 -ForegroundColor Cyan

# Count records using Python
python -c @"
from app.db.session import get_db
from app.models.scientific import OrbitalElements, ImpactRisks
from app.models.events import VolcanicActivity, Hurricane, Tsunami

db = next(get_db())

interstellar_count = db.query(OrbitalElements).filter(OrbitalElements.is_interstellar == True).count()
neo_count = db.query(ImpactRisks).count()
volcanic_count = db.query(VolcanicActivity).count()
hurricane_count = db.query(Hurricane).count()
tsunami_count = db.query(Tsunami).count()

print(f'☄️  Interstellar Objects: {interstellar_count}')
print(f'🌑 NEO Impact Risks: {neo_count}')
print(f'🌋 Volcanic Eruptions: {volcanic_count}')
print(f'🌀 Hurricanes: {hurricane_count}')
print(f'🌊 Tsunamis: {tsunami_count}')

db.close()
"@

Write-Host ""
Write-Host "🎉 All done! Refresh your dashboard to see the data." -ForegroundColor Green
