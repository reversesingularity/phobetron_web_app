# Phobetron Production Build & Deploy Script
# This script builds and deploys the production containers to Docker Desktop

param(
    [switch]$Build = $false,
    [switch]$Deploy = $false,
    [switch]$Stop = $false,
    [switch]$Clean = $false,
    [switch]$Logs = $false
)

$ErrorActionPreference = "Stop"

Write-Host "`n╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║        🚀 PHOBETRON PRODUCTION DEPLOYMENT                    ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

$dockerPath = "F:\Projects\phobetron_web_app\docker"
$envFile = "$dockerPath\.env"

# Check if .env exists, if not copy from example
if (-not (Test-Path $envFile)) {
    Write-Host "⚠️  .env file not found. Creating from example..." -ForegroundColor Yellow
    Copy-Item "$dockerPath\.env.production.example" $envFile
    Write-Host "✅ Created .env file. Please update with your production values!" -ForegroundColor Green
    Write-Host "   Edit: $envFile`n" -ForegroundColor Gray
    Read-Host "Press Enter to continue after updating .env"
}

# Change to docker directory
Set-Location $dockerPath

if ($Stop) {
    Write-Host "🛑 Stopping all containers..." -ForegroundColor Yellow
    docker-compose -f docker-compose.production.yml down
    Write-Host "✅ All containers stopped`n" -ForegroundColor Green
    exit 0
}

if ($Clean) {
    Write-Host "🧹 Cleaning up containers, volumes, and images..." -ForegroundColor Yellow
    docker-compose -f docker-compose.production.yml down -v
    docker rmi phobetron/backend:latest -f 2>$null
    docker rmi phobetron/frontend:latest -f 2>$null
    Write-Host "✅ Cleanup complete`n" -ForegroundColor Green
    exit 0
}

if ($Logs) {
    Write-Host "📋 Showing logs (Ctrl+C to exit)..." -ForegroundColor Cyan
    docker-compose -f docker-compose.production.yml logs -f
    exit 0
}

if ($Build -or $Deploy) {
    Write-Host "🔨 Building Docker images..." -ForegroundColor Cyan
    Write-Host "   This may take 5-10 minutes for the first build...`n" -ForegroundColor Gray
    
    # Build images
    docker-compose -f docker-compose.production.yml build --no-cache
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Build failed!" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "`n✅ Build complete!`n" -ForegroundColor Green
}

if ($Deploy) {
    Write-Host "🚀 Deploying containers..." -ForegroundColor Cyan
    
    # Stop existing containers
    docker-compose -f docker-compose.production.yml down
    
    # Start new containers
    docker-compose -f docker-compose.production.yml up -d
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Deployment failed!" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "`n✅ Deployment complete!`n" -ForegroundColor Green
    
    # Wait for services to be healthy
    Write-Host "⏳ Waiting for services to be ready..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
    
    # Check service status
    Write-Host "`n📊 Service Status:" -ForegroundColor Cyan
    docker-compose -f docker-compose.production.yml ps
    
    Write-Host "`n🌐 Access URLs:" -ForegroundColor Green
    Write-Host "   Frontend:  http://localhost:3000" -ForegroundColor White
    Write-Host "   Backend:   http://localhost:8020" -ForegroundColor White
    Write-Host "   API Docs:  http://localhost:8020/docs" -ForegroundColor White
    Write-Host "   Database:  localhost:5432" -ForegroundColor White
    
    Write-Host "`n📝 Useful Commands:" -ForegroundColor Cyan
    Write-Host "   View logs:    .\deploy-production.ps1 -Logs" -ForegroundColor Gray
    Write-Host "   Stop:         .\deploy-production.ps1 -Stop" -ForegroundColor Gray
    Write-Host "   Rebuild:      .\deploy-production.ps1 -Build -Deploy" -ForegroundColor Gray
    Write-Host "   Clean all:    .\deploy-production.ps1 -Clean`n" -ForegroundColor Gray
}

if (-not $Build -and -not $Deploy -and -not $Stop -and -not $Clean -and -not $Logs) {
    Write-Host "Usage:" -ForegroundColor Yellow
    Write-Host "  .\deploy-production.ps1 -Build          # Build Docker images" -ForegroundColor White
    Write-Host "  .\deploy-production.ps1 -Deploy         # Deploy containers" -ForegroundColor White
    Write-Host "  .\deploy-production.ps1 -Build -Deploy  # Build and deploy" -ForegroundColor White
    Write-Host "  .\deploy-production.ps1 -Stop           # Stop all containers" -ForegroundColor White
    Write-Host "  .\deploy-production.ps1 -Clean          # Remove all containers & images" -ForegroundColor White
    Write-Host "  .\deploy-production.ps1 -Logs           # View container logs`n" -ForegroundColor White
}
