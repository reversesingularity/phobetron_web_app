#!/usr/bin/env pwsh
# Quick Test Script - Verifies Database Population
# Tests all API verification endpoints

Write-Host "🧪 Testing Phobetron Database Population" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:8020"

# Test if backend is running
Write-Host "🔍 Checking if backend is running..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$baseUrl/health" -Method Get
    Write-Host "  ✅ Backend is healthy: $($health.status)" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Backend is not running! Start it with: uvicorn app.main:app --reload --port 8020" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test database status
Write-Host "📊 Database Status:" -ForegroundColor Cyan
try {
    $status = Invoke-RestMethod -Uri "$baseUrl/api/v1/verify/database-status" -Method Get
    
    Write-Host "  ☄️  Interstellar Objects: $($status.orbital_elements.interstellar)" -ForegroundColor Magenta
    Write-Host "  🪐 Total Orbital Elements: $($status.orbital_elements.total)" -ForegroundColor Blue
    Write-Host "  🌑 NEO Impact Risks: $($status.neo_impact_risks.total)" -ForegroundColor DarkYellow
    Write-Host "  🌋 Volcanic Eruptions: $($status.volcanic_activity.total)" -ForegroundColor Red
    Write-Host "  🌀 Hurricanes: $($status.hurricanes.total)" -ForegroundColor Cyan
    Write-Host "  🌊 Tsunamis: $($status.tsunamis.total)" -ForegroundColor Blue
    Write-Host "  📈 Total Records: $($status.total_records)" -ForegroundColor Green
    
} catch {
    Write-Host "  ❌ Error fetching database status: $_" -ForegroundColor Red
}

Write-Host ""

# Test interstellar objects
Write-Host "☄️  Sample Interstellar Objects:" -ForegroundColor Magenta
try {
    $interstellar = Invoke-RestMethod -Uri "$baseUrl/api/v1/verify/interstellar-objects?limit=3" -Method Get
    
    if ($interstellar.count -eq 0) {
        Write-Host "  ⚠️  No interstellar objects found. Run: python populate_database.py" -ForegroundColor Yellow
    } else {
        foreach ($obj in $interstellar.objects) {
            Write-Host "    • $($obj.name) (e=$($obj.eccentricity))" -ForegroundColor White
        }
    }
} catch {
    Write-Host "  ❌ Error: $_" -ForegroundColor Red
}

Write-Host ""

# Test NEO risks
Write-Host "🌑 Sample NEO Impact Risks:" -ForegroundColor DarkYellow
try {
    $neos = Invoke-RestMethod -Uri "$baseUrl/api/v1/verify/neo-risks?limit=3" -Method Get
    
    if ($neos.count -eq 0) {
        Write-Host "  ⚠️  No NEO risks found. Run: python scripts/collect_neo_data.py" -ForegroundColor Yellow
    } else {
        foreach ($neo in $neos.objects) {
            Write-Host "    • $($neo.name) - Torino: $($neo.torino_scale), P: $($neo.probability)" -ForegroundColor White
        }
    }
} catch {
    Write-Host "  ❌ Error: $_" -ForegroundColor Red
}

Write-Host ""

# Test volcanic activity
Write-Host "🌋 Sample Volcanic Eruptions:" -ForegroundColor Red
try {
    $volcanic = Invoke-RestMethod -Uri "$baseUrl/api/v1/verify/volcanic-activity?min_vei=4&limit=3" -Method Get
    
    if ($volcanic.count -eq 0) {
        Write-Host "  ⚠️  No volcanic eruptions found. Run: python scripts/fetch_volcanic_data.py" -ForegroundColor Yellow
    } else {
        foreach ($eruption in $volcanic.eruptions) {
            Write-Host "    • $($eruption.volcano) (VEI $($eruption.vei)) - $($eruption.country)" -ForegroundColor White
        }
    }
} catch {
    Write-Host "  ❌ Error: $_" -ForegroundColor Red
}

Write-Host ""

# Test hurricanes
Write-Host "🌀 Sample Hurricanes:" -ForegroundColor Cyan
try {
    $hurricanes = Invoke-RestMethod -Uri "$baseUrl/api/v1/verify/hurricanes?min_category=4&limit=3" -Method Get
    
    if ($hurricanes.count -eq 0) {
        Write-Host "  ⚠️  No hurricanes found. Run: python scripts/fetch_hurricane_data.py" -ForegroundColor Yellow
    } else {
        foreach ($storm in $hurricanes.hurricanes) {
            Write-Host "    • $($storm.name) ($($storm.season)) - Cat $($storm.category), Winds: $($storm.max_winds_kph) km/h" -ForegroundColor White
        }
    }
} catch {
    Write-Host "  ❌ Error: $_" -ForegroundColor Red
}

Write-Host ""

# Test tsunamis
Write-Host "🌊 Sample Tsunamis:" -ForegroundColor Blue
try {
    $tsunamis = Invoke-RestMethod -Uri "$baseUrl/api/v1/verify/tsunamis?min_intensity=8&limit=3" -Method Get
    
    if ($tsunamis.count -eq 0) {
        Write-Host "  ⚠️  No tsunamis found. Run: python scripts/fetch_tsunami_data.py" -ForegroundColor Yellow
    } else {
        foreach ($tsunami in $tsunamis.tsunamis) {
            Write-Host "    • $($tsunami.date) - Wave: $($tsunami.max_wave_height_m)m, Intensity: $($tsunami.intensity_scale)" -ForegroundColor White
        }
    }
} catch {
    Write-Host "  ❌ Error: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "=" * 50 -ForegroundColor Cyan
Write-Host "✅ Verification Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. If any sections show 0 records, run: .\scripts\populate_all_data.ps1" -ForegroundColor White
Write-Host "  2. Open dashboard: http://localhost:3000" -ForegroundColor White
Write-Host "  3. View API docs: http://localhost:8020/docs" -ForegroundColor White
Write-Host ""
