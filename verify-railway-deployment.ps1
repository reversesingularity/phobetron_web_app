# Railway Deployment Verification Script
# Run this after Railway deployment completes

Write-Host "🔍 Railway Deployment Verification" -ForegroundColor Green
Write-Host "===================================" -ForegroundColor Green

# Get Railway URL from user
$railwayUrl = Read-Host "Enter your Railway backend URL (e.g., https://phobetronwebapp-production.up.railway.app)"

if (-not $railwayUrl) {
    Write-Host "❌ No Railway URL provided" -ForegroundColor Red
    exit 1
}

Write-Host "`nTesting Railway deployment..." -ForegroundColor Yellow

# Test 1: Health check
Write-Host "`n1. Testing health endpoint..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "$railwayUrl/health" -Method GET -TimeoutSec 30
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Health check: OK (200)" -ForegroundColor Green
    } else {
        Write-Host "❌ Health check failed: $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Health check error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: API docs
Write-Host "`n2. Testing API documentation..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "$railwayUrl/docs" -Method GET -TimeoutSec 30
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ API docs: OK (200)" -ForegroundColor Green
    } else {
        Write-Host "❌ API docs failed: $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ API docs error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Pattern detection endpoint
Write-Host "`n3. Testing pattern detection endpoint..." -ForegroundColor Cyan
$testParams = "start_date=2020-01-01&end_date=2025-12-31&event_types=earthquake&event_types=hurricane"
try {
    $response = Invoke-WebRequest -Uri "$railwayUrl/api/v1/ml/comprehensive-pattern-detection?$testParams" -Method GET -TimeoutSec 60
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Pattern detection: OK (200)" -ForegroundColor Green
        $content = $response.Content | ConvertFrom-Json
        if ($content.patterns) {
            Write-Host "✅ Response contains pattern data" -ForegroundColor Green
            Write-Host "   Found $($content.patterns.Count) patterns" -ForegroundColor White
        } else {
            Write-Host "⚠️  Response OK but no patterns found" -ForegroundColor Yellow
        }
    } else {
        Write-Host "❌ Pattern detection failed: $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Pattern detection error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: CORS headers
Write-Host "`n4. Testing CORS configuration..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "$railwayUrl/api/v1/ml/comprehensive-pattern-detection?$testParams" -Method GET -TimeoutSec 30
    $corsHeader = $response.Headers["Access-Control-Allow-Origin"]
    if ($corsHeader) {
        Write-Host "✅ CORS configured: $corsHeader" -ForegroundColor Green
    } else {
        Write-Host "❌ CORS header missing" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ CORS test error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎯 Deployment Status:" -ForegroundColor Green
Write-Host "Monitor Railway dashboard for build/deployment status" -ForegroundColor White
Write-Host "Check application logs in Railway for any errors" -ForegroundColor White
Write-Host "Frontend should now work with production backend" -ForegroundColor White

Write-Host "`n📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Deploy frontend to Railway or Vercel" -ForegroundColor White
Write-Host "2. Update frontend API URLs to point to Railway backend" -ForegroundColor White
Write-Host "3. Test complete application flow" -ForegroundColor White
Write-Host "4. Monitor for any production issues" -ForegroundColor White