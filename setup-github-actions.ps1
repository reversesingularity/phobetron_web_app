# GitHub Actions Setup Script
# This script helps you configure the monthly auto-update system

Write-Host "🚀 Monthly Auto-Update Setup for Phobetron" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Gray
Write-Host ""

Write-Host "📋 STEP 1: Get Railway Database URL" -ForegroundColor Yellow
Write-Host "   1. Open: https://railway.app/project" -ForegroundColor White
Write-Host "   2. Select your PostgreSQL service" -ForegroundColor White
Write-Host "   3. Go to 'Variables' tab" -ForegroundColor White
Write-Host "   4. Copy the 'DATABASE_URL' value" -ForegroundColor White
Write-Host ""
Write-Host "   It should look like:" -ForegroundColor Gray
Write-Host "   postgresql://postgres:xxx@xxx.railway.app:5432/railway" -ForegroundColor DarkGray
Write-Host ""

$dbUrl = Read-Host "Paste your DATABASE_URL here (or press Enter to skip)"

if ($dbUrl) {
    Write-Host ""
    Write-Host "✅ Database URL captured (length: $($dbUrl.Length) chars)" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 STEP 2: Add to GitHub Secrets" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   Now you need to:" -ForegroundColor White
    Write-Host "   1. Open: https://github.com/reversesingularity/phobetron_web_app/settings/secrets/actions" -ForegroundColor White
    Write-Host "   2. Click 'New repository secret'" -ForegroundColor White
    Write-Host "   3. Name: RAILWAY_DATABASE_URL" -ForegroundColor Cyan
    Write-Host "   4. Value: [Paste the URL you just entered]" -ForegroundColor White
    Write-Host "   5. Click 'Add secret'" -ForegroundColor White
    Write-Host ""
    
    # Copy to clipboard if available
    try {
        Set-Clipboard -Value $dbUrl
        Write-Host "   ✅ DATABASE_URL copied to clipboard!" -ForegroundColor Green
        Write-Host "   Just press Ctrl+V in the GitHub secret value field" -ForegroundColor Green
    } catch {
        Write-Host "   (Copy the URL manually)" -ForegroundColor Gray
    }
    
    Write-Host ""
    $continue = Read-Host "Press Enter when you've added the secret to GitHub..."
    Write-Host ""
}

Write-Host "📋 STEP 3: Enable GitHub Actions Workflow" -ForegroundColor Yellow
Write-Host ""
Write-Host "   1. Open: https://github.com/reversesingularity/phobetron_web_app/actions" -ForegroundColor White
Write-Host "   2. If prompted, click 'I understand my workflows, go ahead and enable them'" -ForegroundColor White
Write-Host "   3. Find 'Monthly Data Update' in the workflows list" -ForegroundColor White
Write-Host "   4. Click on it to view details" -ForegroundColor White
Write-Host ""
$continue = Read-Host "Press Enter when you've enabled actions..."
Write-Host ""

Write-Host "📋 STEP 4: Test Run (Optional but Recommended)" -ForegroundColor Yellow
Write-Host ""
Write-Host "   Don't wait for December 1st - test now:" -ForegroundColor White
Write-Host "   1. In the 'Monthly Data Update' workflow page" -ForegroundColor White
Write-Host "   2. Click 'Run workflow' dropdown (top right)" -ForegroundColor White
Write-Host "   3. Click green 'Run workflow' button" -ForegroundColor White
Write-Host "   4. Wait 10-15 minutes for completion" -ForegroundColor White
Write-Host "   5. Refresh page to see results" -ForegroundColor White
Write-Host ""

$testNow = Read-Host "Did you start a test run? (yes/no)"

if ($testNow -match "^y") {
    Write-Host ""
    Write-Host "⏳ Test run in progress..." -ForegroundColor Cyan
    Write-Host ""
    Write-Host "   Monitor at: https://github.com/reversesingularity/phobetron_web_app/actions" -ForegroundColor White
    Write-Host ""
    Write-Host "   Expected results:" -ForegroundColor Gray
    Write-Host "   ✅ Update earthquakes - ~2-3 min" -ForegroundColor DarkGray
    Write-Host "   ✅ Update volcanic data - ~2-3 min" -ForegroundColor DarkGray
    Write-Host "   ✅ Update NEO data - ~3-4 min" -ForegroundColor DarkGray
    Write-Host "   ✅ Update solar events - ~2-3 min" -ForegroundColor DarkGray
    Write-Host "   ✅ Recalculate correlations - ~3-5 min" -ForegroundColor DarkGray
    Write-Host ""
}

Write-Host ""
Write-Host "=" * 60 -ForegroundColor Gray
Write-Host "🎉 Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "What happens next:" -ForegroundColor Cyan
Write-Host "• Data updates automatically on 1st of every month at 2 AM UTC" -ForegroundColor White
Write-Host "• Zero cost (GitHub Actions free tier)" -ForegroundColor White
Write-Host "• Zero changes to Railway deployment" -ForegroundColor White
Write-Host "• Only adds NEW data (never modifies existing)" -ForegroundColor White
Write-Host "• View all runs: https://github.com/reversesingularity/phobetron_web_app/actions" -ForegroundColor White
Write-Host ""
Write-Host "Railway Safety Checklist:" -ForegroundColor Yellow
Write-Host "✅ No changes to Railway services" -ForegroundColor Green
Write-Host "✅ No changes to environment variables" -ForegroundColor Green
Write-Host "✅ No changes to deployment configuration" -ForegroundColor Green
Write-Host "✅ No changes to running application" -ForegroundColor Green
Write-Host "✅ Database only receives INSERT operations (safe)" -ForegroundColor Green
Write-Host ""
Write-Host "Documentation: docs/MONTHLY_AUTO_UPDATE_SETUP.md" -ForegroundColor Gray
Write-Host "=" * 60 -ForegroundColor Gray
Write-Host ""
