# Solar System Visualization - Restore Script
# Created: November 10, 2025
# This script restores the stable Solar System Visualization backup

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Solar System Visualization - Restore Tool" -ForegroundColor Cyan
Write-Host "  Stable Backup: 20251110_211532" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

$backupDir = "F:\Projects\phobetron_web_app\backups\solar_system_stable_20251110_211532"
$projectRoot = "F:\Projects\phobetron_web_app"

# Confirm restoration
Write-Host "⚠️  WARNING: This will overwrite current files!" -ForegroundColor Yellow
Write-Host ""
$confirm = Read-Host "Continue with restoration? (yes/no)"

if ($confirm -ne "yes") {
    Write-Host "❌ Restoration cancelled." -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "Starting restoration..." -ForegroundColor Green
Write-Host ""

# Restore CelestialCanvas.tsx
try {
    Copy-Item -Path "$backupDir\CelestialCanvas.tsx" -Destination "$projectRoot\frontend\src\components\visualization\CelestialCanvas.tsx" -Force
    Write-Host "✅ Restored CelestialCanvas.tsx (137 KB)" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to restore CelestialCanvas.tsx: $_" -ForegroundColor Red
}

# Restore SolarSystemPage.tsx
try {
    Copy-Item -Path "$backupDir\SolarSystemPage.tsx" -Destination "$projectRoot\frontend\src\pages\SolarSystemPage.tsx" -Force
    Write-Host "✅ Restored SolarSystemPage.tsx (8.4 KB)" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to restore SolarSystemPage.tsx: $_" -ForegroundColor Red
}

# Restore CameraControlsPanel.tsx
try {
    Copy-Item -Path "$backupDir\CameraControlsPanel.tsx" -Destination "$projectRoot\frontend\src\components\visualization\CameraControlsPanel.tsx" -Force
    Write-Host "✅ Restored CameraControlsPanel.tsx (8.8 KB)" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to restore CameraControlsPanel.tsx: $_" -ForegroundColor Red
}

# Restore MapPage.tsx
try {
    Copy-Item -Path "$backupDir\MapPage.tsx" -Destination "$projectRoot\frontend\src\pages\MapPage.tsx" -Force
    Write-Host "✅ Restored MapPage.tsx (7.6 KB)" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to restore MapPage.tsx: $_" -ForegroundColor Red
}

# Restore constellations.ts (if exists)
if (Test-Path "$backupDir\constellations.ts") {
    try {
        Copy-Item -Path "$backupDir\constellations.ts" -Destination "$projectRoot\frontend\src\data\constellations.ts" -Force
        Write-Host "✅ Restored constellations.ts" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  constellation.ts not found in backup (skipped)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "✅ Restoration Complete!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Restored Components:" -ForegroundColor White
Write-Host "  • CelestialCanvas.tsx (Main 3D visualization)" -ForegroundColor Gray
Write-Host "  • SolarSystemPage.tsx (Page wrapper)" -ForegroundColor Gray
Write-Host "  • CameraControlsPanel.tsx (Camera controls)" -ForegroundColor Gray
Write-Host "  • MapPage.tsx (Dark theme map)" -ForegroundColor Gray
Write-Host ""
Write-Host "🚀 Next Steps:" -ForegroundColor White
Write-Host "  1. Restart Vite dev server (if running)" -ForegroundColor Gray
Write-Host "  2. Navigate to http://localhost:3000/solar-system" -ForegroundColor Gray
Write-Host "  3. Test camera controls and visualization" -ForegroundColor Gray
Write-Host ""
Write-Host "📖 See README.md for full feature list and documentation" -ForegroundColor Cyan
Write-Host ""
