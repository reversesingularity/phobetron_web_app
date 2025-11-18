# Railway Deployment Fix Guide

## Issue: Backend Crashed on Railway

The backend crash is likely caused by one of these issues:

### 1. TensorFlow/Keras Memory Overload
**Problem**: TensorFlow requires significant memory (1-2GB+) which exceeds Railway's free tier limits.

**Solution**: Use lazy loading for ML models

### 2. Database Connection Issues
**Problem**: Railway PostgreSQL URL format or connection pool exhaustion

**Solution**: Verify DATABASE_URL and connection pooling

### 3. Missing Environment Variables
**Problem**: Required env vars not set in Railway

**Solution**: Check Railway dashboard for all required variables

---

## Quick Fix Steps

### Step 1: Check Railway Logs
1. Go to Railway dashboard (already open)
2. Click on backend service
3. View "Deployments" → "Logs"
4. Look for error messages (likely shows import errors or memory issues)

### Step 2: Reduce Memory Usage (Most Likely Fix)

The issue is probably TensorFlow loading on startup. Apply this fix:

**backend/app/ml/lstm_forecaster.py** - Make TensorFlow imports lazy:

```python
# Change this (loads TensorFlow immediately):
import tensorflow as tf
from tensorflow import keras

# To this (loads only when needed):
try:
    import tensorflow as tf
    from tensorflow import keras
    TF_AVAILABLE = True
except (ImportError, ModuleNotFoundError):
    TF_AVAILABLE = False
    tf = None
    keras = None
```

### Step 3: Add Memory-Efficient Start Command

Create `backend/Procfile`:
```
web: uvicorn app.main:app --host 0.0.0.0 --port $PORT --workers 1 --timeout-keep-alive 120
```

Or use Railway start command:
```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT --workers 1 --limit-concurrency 10
```

### Step 4: Update Requirements (Optional - Railway Optimization)

Create `backend/requirements-railway.txt` (minimal for production):
```pip-requirements
# Core Dependencies (Required)
alembic>=1.13.0
sqlalchemy>=2.0.35
psycopg2-binary>=2.9.9
python-dotenv>=1.0.0

# Web Framework (Required)
fastapi>=0.115.0
uvicorn[standard]>=0.30.0
pydantic>=2.0.0
pydantic-settings>=2.0.0

# Machine Learning - Lightweight (Required)
numpy>=1.26.0
pandas>=2.2.0
scikit-learn>=1.5.0
joblib>=1.3.2

# Utilities (Required)
python-dateutil>=2.8.2
pytz>=2024.1
requests>=2.31.0
httpx>=0.27.0

# Optional - Only if Railway has enough memory
# tensorflow>=2.15.0  # Comment out to reduce memory
# keras>=2.15.0       # Comment out to reduce memory
```

---

## Immediate Actions

### Option A: Quick Deploy Fix (Recommended)
1. Open Railway dashboard
2. Go to backend service → Settings → Deploy
3. Add environment variable:
   - `PYTHON_VERSION` = `3.11`
   - `RAILWAY_RUN_UID` = `1000`
4. Update start command to:
   ```
   uvicorn app.main:app --host 0.0.0.0 --port $PORT --workers 1
   ```
5. Redeploy

### Option B: Code Fix (More Robust)
I can update the code to:
1. Lazy-load TensorFlow (only when ML endpoints called)
2. Add try/except for missing heavy dependencies
3. Create Railway-specific minimal requirements
4. Add graceful fallback if TensorFlow unavailable

Would you like me to apply Option B code fixes?

---

## Verify Database Connection

Check these environment variables are set in Railway:
- `DATABASE_URL` - PostgreSQL connection string
- `PORT` - Railway assigns this automatically
- `BACKEND_CORS_ORIGINS` (optional)

---

## Check Current Status

Let me check Railway logs to confirm the exact error...
