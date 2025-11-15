# Production Deployment Script for Railway
# Run this script to prepare and deploy to Railway

Write-Host "🚀 Starting Production Deployment to Railway" -ForegroundColor Green
Write-Host "==============================================" -ForegroundColor Green

# Step 1: Verify backup files are copied
Write-Host "Step 1: Verifying production files..." -ForegroundColor Yellow
$files = @(
    "backend\app\api\routes\ml.py",
    "backend\app\core\config.py",
    "frontend\src\pages\AdvancedPatternDetectionPage.tsx"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "✅ $file - OK" -ForegroundColor Green
    } else {
        Write-Host "❌ $file - MISSING" -ForegroundColor Red
        exit 1
    }
}

# Step 2: Check Railway configuration
Write-Host "`nStep 2: Checking Railway configuration..." -ForegroundColor Yellow
if (Test-Path "railway.toml") {
    Write-Host "✅ railway.toml - OK" -ForegroundColor Green
} else {
    Write-Host "❌ railway.toml - MISSING" -ForegroundColor Red
    exit 1
}

if (Test-Path "backend\Dockerfile") {
    Write-Host "✅ backend\Dockerfile - OK" -ForegroundColor Green
} else {
    Write-Host "❌ backend\Dockerfile - MISSING" -ForegroundColor Red
    exit 1
}

# Step 3: Test backend locally (optional)
Write-Host "`nStep 3: Testing backend functionality..." -ForegroundColor Yellow
Write-Host "Note: Make sure PostgreSQL is running locally for testing" -ForegroundColor Cyan

# Step 4: Git commit and push
Write-Host "`nStep 4: Preparing for Railway deployment..." -ForegroundColor Yellow
Write-Host "Please ensure you have:" -ForegroundColor Cyan
Write-Host "  - Connected your GitHub repo to Railway" -ForegroundColor White
Write-Host "  - Set environment variables in Railway dashboard:" -ForegroundColor White
Write-Host "    * BACKEND_CORS_ORIGINS=[\"https://your-railway-app-url.up.railway.app\"]" -ForegroundColor White
Write-Host "  - Railway will auto-deploy on git push" -ForegroundColor White

Write-Host "`n🎯 Deployment Checklist:" -ForegroundColor Green
Write-Host "□ Push these changes to GitHub" -ForegroundColor White
Write-Host "□ Railway auto-deploys from GitHub" -ForegroundColor White
Write-Host "□ Monitor Railway logs for successful deployment" -ForegroundColor White
Write-Host "□ Test pattern detection endpoint in production" -ForegroundColor White
Write-Host "□ Verify frontend loads without CORS errors" -ForegroundColor White

Write-Host "`n✅ Production files are ready for deployment!" -ForegroundColor Green
Write-Host "Push to GitHub to trigger Railway deployment." -ForegroundColor Green