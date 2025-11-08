#!/usr/bin/env pwsh
# Celestial Signs - Development Server Startup Script
# This script starts both the backend (FastAPI) and frontend (Next.js) servers

Write-Host "`n╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║        🌌 Celestial Signs - Starting Dev Servers...        ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Get the script's directory
$ProjectRoot = $PSScriptRoot

# Backend configuration
$BackendPath = Join-Path $ProjectRoot "backend"
$VenvPython = Join-Path $BackendPath "venv\Scripts\python.exe"
$BackendPort = 8020

# Frontend configuration
$FrontendPath = Join-Path $ProjectRoot "frontend"
$FrontendPort = 3000

# Check if Python venv exists
if (-not (Test-Path $VenvPython)) {
    Write-Host "❌ Python virtual environment not found at: $VenvPython" -ForegroundColor Red
    Write-Host "Please create a virtual environment in the backend directory." -ForegroundColor Yellow
    exit 1
}

# Function to stop existing servers
function Stop-ExistingServers {
    Write-Host "🔍 Checking for existing servers..." -ForegroundColor Yellow
    
    # Stop existing Node.js processes
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { 
        $_.CommandLine -like "*next dev*" 
    } | ForEach-Object {
        Write-Host "  ⏹️  Stopping existing Next.js server (PID: $($_.Id))" -ForegroundColor Yellow
        Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
    }
    
    # Stop existing Python/Uvicorn processes
    Get-Process -Name "python","uvicorn" -ErrorAction SilentlyContinue | Where-Object {
        $_.CommandLine -like "*8020*" -or $_.CommandLine -like "*main:app*"
    } | ForEach-Object {
        Write-Host "  ⏹️  Stopping existing backend server (PID: $($_.Id))" -ForegroundColor Yellow
        Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
    }
    
    Start-Sleep -Seconds 2
    Write-Host "✅ Cleanup complete`n" -ForegroundColor Green
}

# Stop any existing servers
Stop-ExistingServers

# Start Backend Server
Write-Host "🚀 Starting Backend API Server..." -ForegroundColor Magenta
Write-Host "   📍 Path: $BackendPath" -ForegroundColor Gray
Write-Host "   🔌 Port: $BackendPort" -ForegroundColor Gray
Write-Host "   🐍 Python: $VenvPython`n" -ForegroundColor Gray

$BackendJob = Start-Job -ScriptBlock {
    param($VenvPython, $BackendPath, $BackendPort)
    Set-Location $BackendPath
    & $VenvPython -m uvicorn app.main:app --reload --port $BackendPort
} -ArgumentList $VenvPython, $BackendPath, $BackendPort

# Wait a moment for backend to start
Start-Sleep -Seconds 3

# Check if backend started successfully
$BackendHealthy = $false
try {
    $response = Invoke-WebRequest -Uri "http://localhost:$BackendPort/api/v1/health" -TimeoutSec 5 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        $BackendHealthy = $true
        Write-Host "✅ Backend API is healthy!" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  Backend health check failed (it may still be starting...)" -ForegroundColor Yellow
}

Write-Host ""

# Start Frontend Server
Write-Host "🚀 Starting Frontend Next.js Server..." -ForegroundColor Cyan
Write-Host "   📍 Path: $FrontendPath" -ForegroundColor Gray
Write-Host "   🔌 Port: $FrontendPort`n" -ForegroundColor Gray

$FrontendJob = Start-Job -ScriptBlock {
    param($FrontendPath)
    Set-Location $FrontendPath
    npm run dev:frontend
} -ArgumentList $FrontendPath

# Wait for frontend to start
Start-Sleep -Seconds 5

# Display status
Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║        ✨ Development Servers Running!                       ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Frontend:  " -NoNewline -ForegroundColor Cyan
Write-Host "http://localhost:$FrontendPort" -ForegroundColor White -BackgroundColor DarkBlue
Write-Host "🔌 Backend:   " -NoNewline -ForegroundColor Magenta
Write-Host "http://localhost:$BackendPort" -ForegroundColor White -BackgroundColor DarkBlue
Write-Host "📖 API Docs:  " -NoNewline -ForegroundColor Yellow
Write-Host "http://localhost:$BackendPort/docs" -ForegroundColor White -BackgroundColor DarkBlue
Write-Host ""
Write-Host "Press Ctrl+C to stop all servers" -ForegroundColor Gray
Write-Host ""

# Keep script running and monitor jobs
try {
    while ($true) {
        # Check if jobs are still running
        if ($BackendJob.State -eq "Failed" -or $BackendJob.State -eq "Stopped") {
            Write-Host "❌ Backend server stopped unexpectedly!" -ForegroundColor Red
            break
        }
        if ($FrontendJob.State -eq "Failed" -or $FrontendJob.State -eq "Stopped") {
            Write-Host "❌ Frontend server stopped unexpectedly!" -ForegroundColor Red
            break
        }
        
        # Display job output periodically
        Receive-Job -Job $BackendJob -ErrorAction SilentlyContinue | ForEach-Object {
            Write-Host "[API] $_" -ForegroundColor Magenta
        }
        Receive-Job -Job $FrontendJob -ErrorAction SilentlyContinue | ForEach-Object {
            Write-Host "[NEXT] $_" -ForegroundColor Cyan
        }
        
        Start-Sleep -Seconds 1
    }
} finally {
    # Cleanup on exit
    Write-Host "`n🛑 Stopping servers..." -ForegroundColor Yellow
    Stop-Job -Job $BackendJob, $FrontendJob -ErrorAction SilentlyContinue
    Remove-Job -Job $BackendJob, $FrontendJob -Force -ErrorAction SilentlyContinue
    Stop-ExistingServers
    Write-Host "✅ All servers stopped.`n" -ForegroundColor Green
}
