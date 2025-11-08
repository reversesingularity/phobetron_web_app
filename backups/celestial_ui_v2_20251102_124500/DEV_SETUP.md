# 🌌 Celestial Signs - Development Setup

## Quick Start (Automatic - Both Servers)

### Option 1: Using npm (Recommended)
```bash
cd frontend
npm run dev
```

This will automatically start:
- ✅ **Backend API** on `http://localhost:8020`
- ✅ **Frontend** on `http://localhost:3000`

### Option 2: Using PowerShell Script
```powershell
# From project root
pwsh -File start-dev.ps1
```

## Manual Start (Individual Servers)

### Backend Only
```bash
cd backend
.\venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8020
```

### Frontend Only
```bash
cd frontend
npm run dev:frontend
```

## Available URLs

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | Next.js Dashboard |
| **Backend API** | http://localhost:8020 | FastAPI Server |
| **API Docs** | http://localhost:8020/docs | Swagger/OpenAPI |
| **Alternative Docs** | http://localhost:8020/redoc | ReDoc |

## Troubleshooting

### Backend not starting?
1. Ensure Python virtual environment exists: `backend\venv\`
2. Activate venv and install dependencies:
   ```bash
   cd backend
   .\venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   ```

### Port already in use?
Stop existing processes:
```powershell
# Stop backend (port 8020)
Get-Process -Name "python","uvicorn" | Where-Object { $_.CommandLine -like "*8020*" } | Stop-Process -Force

# Stop frontend (port 3000)
Get-Process -Name "node" | Where-Object { $_.CommandLine -like "*next dev*" } | Stop-Process -Force
```

### Concurrently not installed?
```bash
cd frontend
npm install --save-dev concurrently
```

## Features

- 🔄 **Auto-reload** on code changes (both servers)
- 🎨 **Color-coded logs** (Cyan for NEXT, Magenta for API)
- 🛑 **Graceful shutdown** (Ctrl+C stops both)
- ⚡ **Fast startup** with parallel execution
- 🔍 **Health checks** for backend API

## Notes

- Backend runs with `--reload` flag for hot-reloading
- Frontend uses Turbopack for fast builds
- Both servers log to the same terminal with prefixes
- The `--kill-others-on-fail` flag ensures if one server crashes, the other stops too
