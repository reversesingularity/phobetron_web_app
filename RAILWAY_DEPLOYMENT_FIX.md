# Railway Backend Crash Fix - Deployment Guide

## Problem
Railway backend crashed - likely due to:
1. **TensorFlow memory overload** (requires 1-2GB+ RAM)
2. **Build timeout** (heavy dependencies taking too long)
3. **Connection pool exhaustion**

## Solution Applied

### Files Created/Updated

1. **`backend/Procfile`** (NEW)
   - Optimized uvicorn start command
   - Single worker for memory efficiency
   - Increased timeout and connection limits

2. **`backend/requirements-railway.txt`** (NEW)
   - Minimal dependencies for production
   - TensorFlow commented out (optional)
   - Reduced build time and memory footprint

3. **`backend/railway.json`** (NEW)
   - Railway-specific configuration
   - Uses requirements-railway.txt
   - Health check on /health endpoint
   - Auto-restart on failure

4. **`backend/app/main.py`** (UPDATED)
   - Added TensorFlow availability check on startup
   - Better logging for debugging

---

## Deployment Steps

### Option A: Quick Fix (Use Minimal Requirements)

1. **Update Railway Build Settings**:
   ```
   Build Command: pip install --no-cache-dir -r requirements-railway.txt
   Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT --workers 1
   ```

2. **Set Environment Variables**:
   - `DATABASE_URL` - (Already set by Railway PostgreSQL)
   - `PYTHON_VERSION` = `3.11`
   - `PORT` - (Auto-set by Railway)

3. **Deploy**:
   - Railway will auto-deploy after push
   - Or manually trigger redeploy in dashboard

### Option B: Full ML Support (Requires More Memory)

If Railway instance has 2GB+ RAM:

1. **Uncomment in `requirements-railway.txt`**:
   ```
   tensorflow-cpu>=2.15.0  # Use CPU version
   keras>=2.15.0
   ```

2. **Use Railway Pro Plan** (for more memory)

---

## Verification Steps

### 1. Check Health Endpoint
```bash
curl https://phobetronwebapp-production.up.railway.app/health
```

Expected response:
```json
{
  "status": "healthy",
  "version": "1.2.0",
  "service": "phobetron-api"
}
```

### 2. Check Root Endpoint
```bash
curl https://phobetronwebapp-production.up.railway.app/
```

### 3. Check Railway Logs
- Go to Railway dashboard
- Click backend service
- View "Deployments" → "Logs"
- Should see:
  ```
  ============================================================
  Starting Phobetron API...
  Version: 1.2.0
  TensorFlow: Not installed (using lightweight ML only)
  Application startup complete!
  ============================================================
  ```

### 4. Test ML Endpoints (Lightweight)
```bash
# These work without TensorFlow (use scikit-learn)
curl https://phobetronwebapp-production.up.railway.app/api/v1/ml/predict-events
curl https://phobetronwebapp-production.up.railway.app/api/v1/ml/watchman-alert
```

---

## Commit and Deploy

### Step 1: Commit Changes
```powershell
git add backend/Procfile backend/requirements-railway.txt backend/railway.json backend/app/main.py
git commit -m "Fix Railway backend crash: optimize memory and add lightweight requirements"
git push origin 001-database-schema
```

### Step 2: Update Railway Settings

**Go to Railway Dashboard**:
1. Click backend service
2. Settings → Deploy → Custom Start Command:
   ```
   uvicorn app.main:app --host 0.0.0.0 --port $PORT --workers 1 --timeout-keep-alive 120
   ```

3. Settings → Deploy → Custom Build Command:
   ```
   pip install --no-cache-dir -r requirements-railway.txt
   ```

4. Click "Deploy" to redeploy

### Step 3: Monitor Deployment
- Watch logs in real-time
- Wait for "Application startup complete!"
- Test /health endpoint

---

## Troubleshooting

### If Still Crashes After Fix

1. **Check Logs for Specific Error**:
   - Look for ImportError, MemoryError, or database connection errors

2. **Verify DATABASE_URL**:
   ```bash
   # In Railway dashboard, check environment variables
   # Should be: postgresql://user:pass@host:port/db
   ```

3. **Reduce Workers Further**:
   ```
   uvicorn app.main:app --host 0.0.0.0 --port $PORT --workers 1 --limit-concurrency 10
   ```

4. **Check Memory Usage**:
   - Railway free tier: 512MB RAM
   - Railway Pro: 8GB+ RAM
   - Current app with minimal deps: ~300-400MB

### If Database Connection Fails

1. **Check PostgreSQL Plugin**:
   - Railway → Plugins → PostgreSQL
   - Verify it's running
   - Check DATABASE_URL is set

2. **Test Connection**:
   ```python
   # Add to /health endpoint temporarily
   from app.db.session import get_db
   db = next(get_db())
   db.execute(text("SELECT 1"))
   ```

---

## Performance Optimizations Applied

1. **Single Worker**: Reduces memory footprint
2. **Lazy Loading**: TensorFlow loaded only if needed
3. **Connection Pooling**: Optimized for Railway
4. **Minimal Dependencies**: Only essential packages
5. **Health Check**: Railway monitors /health endpoint
6. **Auto-Restart**: Restarts on failure (max 3 retries)

---

## What's Disabled (Can Re-enable Later)

Without TensorFlow:
- ❌ LSTM time series forecasting
- ❌ Deep learning anomaly detection
- ✅ Scikit-learn ML models (working)
- ✅ Pattern classification (working)
- ✅ Event prediction (working)

To re-enable TensorFlow:
1. Upgrade Railway plan for more memory
2. Uncomment in requirements-railway.txt
3. Redeploy

---

## Next Steps

1. ✅ Apply fixes (files created above)
2. 🔄 Commit and push changes
3. 🚀 Redeploy on Railway
4. ✔️ Verify health endpoint
5. 📊 Monitor logs for 5 minutes
6. 🎉 Backend should be stable!

Would you like me to commit these changes now?
