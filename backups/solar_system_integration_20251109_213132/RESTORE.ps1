# Solar System Integration - Quick Restore Script
# Run this script to restore the complete Solar System visualization configuration

param(
    [switch]$SkipInstall = $false
)

Write-Host "🔄 Restoring Solar System Integration..." -ForegroundColor Cyan
Write-Host ""

$backupPath = "f:\Projects\phobetron_web_app\backups\solar_system_integration_20251109_213132"
$frontendPath = "f:\Projects\phobetron_web_app\frontend"

# Check if backup exists
if (!(Test-Path $backupPath)) {
    Write-Host "❌ Backup directory not found: $backupPath" -ForegroundColor Red
    exit 1
}

Write-Host "📁 Backup directory found" -ForegroundColor Green

# Step 1: Restore source code
Write-Host ""
Write-Host "1️⃣ Restoring source code..." -ForegroundColor Yellow
try {
    Copy-Item -Path "$backupPath\src" -Destination "$frontendPath\src" -Recurse -Force
    Write-Host "   ✅ Source code restored" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Failed to restore source code: $_" -ForegroundColor Red
    exit 1
}

# Step 2: Restore configuration files
Write-Host ""
Write-Host "2️⃣ Restoring configuration files..." -ForegroundColor Yellow

$configFiles = @(
    "package.json",
    "package-lock.json",
    "vite.config.ts",
    "tsconfig.json",
    "tsconfig.node.json",
    "tailwind.config.js",
    ".env",
    "index.html"
)

foreach ($file in $configFiles) {
    try {
        Copy-Item "$backupPath\$file" "$frontendPath\$file" -Force
        Write-Host "   ✅ $file" -ForegroundColor Green
    } catch {
        Write-Host "   ⚠️  Warning: Could not restore $file" -ForegroundColor Yellow
    }
}

# Step 3: Restore documentation
Write-Host ""
Write-Host "3️⃣ Restoring documentation..." -ForegroundColor Yellow
try {
    Copy-Item "$backupPath\CELESTIAL_CANVAS_INTEGRATION.md" "f:\Projects\phobetron_web_app\docs\" -Force
    Write-Host "   ✅ Documentation restored" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️  Warning: Could not restore documentation" -ForegroundColor Yellow
}

# Step 4: Install dependencies
if (-not $SkipInstall) {
    Write-Host ""
    Write-Host "4️⃣ Installing dependencies..." -ForegroundColor Yellow
    Write-Host "   This may take a minute..." -ForegroundColor Gray
    
    Push-Location $frontendPath
    try {
        # Delete node_modules and reinstall
        if (Test-Path "node_modules") {
            Write-Host "   🗑️  Removing old node_modules..." -ForegroundColor Gray
            Remove-Item -Path "node_modules" -Recurse -Force
        }
        
        Write-Host "   📦 Running npm install..." -ForegroundColor Gray
        npm install 2>&1 | Out-Null
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   ✅ Dependencies installed (317 packages)" -ForegroundColor Green
        } else {
            Write-Host "   ❌ npm install failed" -ForegroundColor Red
            Pop-Location
            exit 1
        }
    } catch {
        Write-Host "   ❌ Failed to install dependencies: $_" -ForegroundColor Red
        Pop-Location
        exit 1
    }
    Pop-Location
} else {
    Write-Host ""
    Write-Host "4️⃣ Skipping dependency installation (--SkipInstall flag)" -ForegroundColor Yellow
}

# Summary
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ RESTORE COMPLETE!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 What was restored:" -ForegroundColor White
Write-Host "   • CelestialCanvas.tsx (3,309 lines)" -ForegroundColor Gray
Write-Host "   • PlanetInfoPanel.tsx (151 lines)" -ForegroundColor Gray
Write-Host "   • SolarSystemPage.tsx (171 lines)" -ForegroundColor Gray
Write-Host "   • constellations.ts library" -ForegroundColor Gray
Write-Host "   • planetData.ts library" -ForegroundColor Gray
Write-Host "   • All configuration files" -ForegroundColor Gray
Write-Host "   • Documentation" -ForegroundColor Gray
if (-not $SkipInstall) {
    Write-Host "   • Node modules (317 packages)" -ForegroundColor Gray
}
Write-Host ""
Write-Host "🚀 Next steps:" -ForegroundColor White
Write-Host "   1. cd f:\Projects\phobetron_web_app\frontend" -ForegroundColor Cyan
if ($SkipInstall) {
    Write-Host "   2. npm install" -ForegroundColor Cyan
    Write-Host "   3. npm run dev" -ForegroundColor Cyan
} else {
    Write-Host "   2. npm run dev" -ForegroundColor Cyan
}
Write-Host "   3. Open http://localhost:3000/solar-system" -ForegroundColor Cyan
Write-Host ""
Write-Host "📚 Documentation: docs\CELESTIAL_CANVAS_INTEGRATION.md" -ForegroundColor Gray
Write-Host ""
