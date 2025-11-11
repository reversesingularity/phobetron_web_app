# 🚂 Railway Deployment Guide - Full Stack
## Phobetron Web App: Frontend + Backend + Database

**Date**: November 11, 2025  
**Plan**: Railway Hobbyist  
**Target**: Public Release (v1.0.0 for Zenodo)

---

## 📊 Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│  Railway Project: phobetron-web-app                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────────┐  ┌──────────────────┐  ┌────────┐│
│  │   Frontend      │  │    Backend       │  │  DB    ││
│  │   (Vite/React)  │─→│  (FastAPI/ML)    │─→│ PgSQL  ││
│  │   Port: $PORT   │  │  Port: 8000      │  │ 5432   ││
│  └─────────────────┘  └──────────────────┘  └────────┘│
│         ↓                      ↓                        │
│  your-app.up.railway.app  backend.up.railway.app       │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Deployment Steps

### Step 1: Backend (Already Deployed ✅)

Your backend is already running at:
- **URL**: https://phobetronwebapp-production.up.railway.app
- **API**: https://phobetronwebapp-production.up.railway.app/api/v1
- **Status**: ✅ Operational

### Step 2: Deploy Frontend to Railway

#### Option A: Via Railway Dashboard (Recommended)

1. **Login to Railway**
   - Go to https://railway.app/
   - Sign in with your account

2. **Create New Service**
   - Open your existing project: `phobetron-web-app`
   - Click **"+ New"** → **"GitHub Repo"**
   - Select: `reversesingularity/phobetron_web_app`
   - **Root Directory**: `/frontend`

3. **Configure Service**
   - **Name**: `phobetron-frontend`
   - **Branch**: `001-database-schema` (or `main` when ready)
   - **Build Command**: Auto-detected from `railway.json`
   - **Start Command**: Auto-detected from `railway.json`

4. **Environment Variables**
   - Railway will automatically use `.env` file
   - `VITE_API_URL` is already set to Railway backend
   - **No additional config needed!**

5. **Deploy**
   - Click **"Deploy"**
   - Wait for build to complete (~2-3 minutes)
   - Railway will assign a URL: `phobetron-frontend-production.up.railway.app`

6. **Enable Public Domain**
   - Settings → Networking
   - Click **"Generate Domain"**
   - Copy the URL (this is your public frontend!)

#### Option B: Via Railway CLI

```powershell
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link to your project
cd F:\Projects\phobetron_web_app\frontend
railway link

# Deploy
railway up
```

---

## 🔧 Configuration Details

### Frontend (`railway.json`)
```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm ci && npm run build"
  },
  "deploy": {
    "startCommand": "npm run preview -- --host 0.0.0.0 --port $PORT",
    "healthcheckPath": "/"
  }
}
```

### Environment Variables

**Frontend** (`.env`):
```properties
VITE_API_URL=https://phobetronwebapp-production.up.railway.app/api/v1
```

**Backend** (Railway auto-provides):
```properties
DATABASE_URL=postgresql://...  # Auto-injected by Railway
PORT=8000
```

---

## 🌐 Your Public URLs (After Deployment)

| Service | URL | Status |
|---------|-----|--------|
| **Frontend** | `https://phobetron-frontend-production.up.railway.app` | 🔄 Deploy now |
| **Backend API** | `https://phobetronwebapp-production.up.railway.app` | ✅ Live |
| **API Docs** | `https://phobetronwebapp-production.up.railway.app/docs` | ✅ Live |
| **Database** | Internal (Railway network) | ✅ Live |

---

## 📋 Pre-Deployment Checklist

### Code Preparation
- [x] Backend deployed and tested
- [ ] Frontend builds successfully (`npm run build`)
- [ ] No TypeScript errors (`npm run build`)
- [ ] Environment variables correct (`.env` points to Railway backend)
- [ ] CORS configured in backend for frontend domain

### Backend CORS Update
Make sure backend allows frontend domain:

```python
# backend/app/core/config.py
BACKEND_CORS_ORIGINS = [
    "http://localhost:3000",
    "https://phobetron-frontend-production.up.railway.app",  # Add this
    "https://phobetronwebapp-production.up.railway.app"
]
```

### Database
- [x] PostgreSQL running on Railway
- [x] Database seeded with data
- [x] Migrations applied

---

## 🧪 Testing Your Deployment

### 1. Test Backend
```powershell
# Health check
Invoke-WebRequest -Uri https://phobetronwebapp-production.up.railway.app/health

# Get earthquakes
Invoke-WebRequest -Uri "https://phobetronwebapp-production.up.railway.app/api/v1/events/earthquakes?limit=5"
```

### 2. Test Frontend (After Deployment)
Visit: `https://phobetron-frontend-production.up.railway.app`

**Check**:
- [ ] Page loads without errors
- [ ] Dashboard displays data
- [ ] Map page shows markers
- [ ] Earthquakes page loads list
- [ ] API calls work (check browser Network tab)
- [ ] No CORS errors in console

---

## 💰 Railway Hobbyist Plan Limits

| Resource | Limit | Your Usage |
|----------|-------|------------|
| **Services** | 2 active | Backend (1) + Frontend (1) = 2 ✅ |
| **Databases** | 1 | PostgreSQL (1) ✅ |
| **Executions** | 500 hours/month | ~16 hours/day (plenty) |
| **Bandwidth** | 100 GB/month | Sufficient for public demo |
| **Build Minutes** | Unlimited | ✅ |

**You're good to go!** Your Hobbyist plan covers everything needed.

---

## 🔄 Deployment Workflow

### Initial Deployment
```bash
1. Push code to GitHub
2. Railway detects changes (if webhook enabled)
3. Builds frontend
4. Deploys to production URL
```

### Future Updates
```bash
git add .
git commit -m "Update: [description]"
git push origin 001-database-schema

# Railway auto-deploys within 2-3 minutes
```

### Manual Deployment (if needed)
```bash
railway up  # From frontend directory
```

---

## 🎯 For Zenodo Submission (v1.0.0)

### Update CITATION.cff

After frontend is deployed, update your citation file:

```yaml
url: "https://phobetron-frontend-production.up.railway.app"
repository-code: "https://github.com/reversesingularity/phobetron_web_app"
```

### Update README.md

Add badges and live demo link:

```markdown
# Phobetron

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://phobetron-frontend-production.up.railway.app)
[![API Docs](https://img.shields.io/badge/API-docs-blue)](https://phobetronwebapp-production.up.railway.app/docs)
[![Railway](https://img.shields.io/badge/Railway-deployed-blueviolet)](https://railway.app/)

🌐 **Live Demo**: [https://phobetron-frontend-production.up.railway.app](https://phobetron-frontend-production.up.railway.app)
```

### Update Zenodo Metadata

In your Zenodo submission:
- **Project URL**: `https://phobetron-frontend-production.up.railway.app`
- **Documentation**: `https://phobetronwebapp-production.up.railway.app/docs`
- **Repository**: `https://github.com/reversesingularity/phobetron_web_app`

---

## 🛠️ Troubleshooting

### Frontend won't build
```bash
# Test locally first
cd frontend
npm run build

# Check for errors
# Fix TypeScript issues
# Commit and push
```

### CORS errors
Update backend CORS settings to include frontend domain:
```python
BACKEND_CORS_ORIGINS = [
    "https://phobetron-frontend-production.up.railway.app"
]
```

### Environment variables not working
- Railway reads `.env` file automatically
- Verify `.env` has correct `VITE_API_URL`
- Redeploy after changes: `railway up`

### Deployment fails
Check Railway logs:
- Dashboard → Service → Deployments → View Logs
- Look for build errors or missing dependencies

---

## 📊 Cost Estimate

**Railway Hobbyist Plan**: $5/month

| Service | Estimated Usage | Cost |
|---------|----------------|------|
| Frontend | ~2 GB RAM, always on | Included |
| Backend | ~2 GB RAM, always on | Included |
| PostgreSQL | ~1 GB storage | Included |
| **Total** | | **$5/month** ✅ |

**Perfect for public demo and Zenodo submission!**

---

## 🎉 Success Criteria

Your deployment is successful when:

- ✅ Frontend loads at Railway URL
- ✅ Dashboard displays earthquake/volcanic data
- ✅ Map page shows markers
- ✅ API calls work (no CORS errors)
- ✅ ML endpoints respond
- ✅ No console errors
- ✅ Mobile responsive
- ✅ Fast load times (<3 seconds)

---

## 📝 Next Steps After Deployment

1. **Test thoroughly** - Click through all pages
2. **Share URL** - Get feedback from testers
3. **Update documentation** - Add live demo links
4. **Prepare for Zenodo** - Follow ZENODO_SUBMISSION_GUIDE.md
5. **Create v1.0.0 release** - Tag and publish on GitHub
6. **Submit to Zenodo** - Get your DOI!

---

## 🔗 Important Links

- **Railway Dashboard**: https://railway.app/dashboard
- **Frontend Service**: (After deployment)
- **Backend Service**: https://phobetronwebapp-production.up.railway.app
- **GitHub Repo**: https://github.com/reversesingularity/phobetron_web_app
- **Zenodo Guide**: `docs/ZENODO_SUBMISSION_GUIDE.md`

---

**Ready to deploy?** Follow these steps and your app will be live for public access! 🚀

**Questions?** Railway has excellent documentation: https://docs.railway.app/
