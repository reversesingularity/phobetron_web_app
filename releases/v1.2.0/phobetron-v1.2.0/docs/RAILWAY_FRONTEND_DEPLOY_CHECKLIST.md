# 🚀 Railway Frontend Deployment - Quick Checklist
## Phobetron v1.0.0 Public Release

**Date**: November 11, 2025  
**Status**: Ready to deploy ✅

---

## ✅ Pre-Deployment Checklist

### 1. Code Quality
- [x] Backend deployed on Railway
- [x] Frontend builds locally (`npm run build`)
- [x] No TypeScript errors
- [x] All pages load correctly
- [x] API integration working with Railway backend
- [x] Environment variables configured (`.env` → Railway)

### 2. Configuration Files
- [x] `railway.json` updated with production settings
- [x] `.env` points to Railway backend API
- [x] CORS configured in backend for Railway frontend domain
- [x] Package.json has correct scripts

### 3. Test Locally Against Railway Backend
```powershell
cd frontend
# Ensure .env has Railway URL
npm run dev
# Visit http://localhost:3000
# Verify all data loads from Railway backend
```

Expected:
- [ ] Dashboard shows earthquake/volcanic data
- [ ] Map displays markers
- [ ] No CORS errors in console
- [ ] API calls succeed (check Network tab)

---

## 🚂 Deployment Steps

### Option 1: Railway Dashboard (Easiest)

1. **Go to Railway Dashboard**
   - URL: https://railway.app/dashboard
   - Open project: `phobetron-web-app`

2. **Add New Service**
   - Click **"+ New"**
   - Select **"GitHub Repo"**
   - Choose: `reversesingularity/phobetron_web_app`
   - **Important**: Set **Root Directory** to `/frontend`

3. **Configure Service**
   - **Name**: `phobetron-frontend`
   - **Branch**: `001-database-schema`
   - Railway auto-detects `railway.json` ✅

4. **Generate Public Domain**
   - Settings → Networking
   - Click **"Generate Domain"**
   - You'll get: `phobetron-frontend-production.up.railway.app`

5. **Deploy**
   - Click **"Deploy"**
   - Wait 2-3 minutes
   - Check logs for success

### Option 2: Railway CLI

```powershell
# Install CLI
npm i -g @railway/cli

# Login
railway login

# Navigate to frontend
cd F:\Projects\phobetron_web_app\frontend

# Link to project
railway link

# Deploy
railway up
```

---

## 🧪 Post-Deployment Testing

### 1. Check Deployment Status
- Railway Dashboard → Frontend Service → Deployments
- Status should be: ✅ **Success**

### 2. Visit Frontend URL
```
https://phobetron-frontend-production.up.railway.app
```

### 3. Test All Pages
- [ ] `/` - Dashboard loads
- [ ] `/map` - Map displays markers
- [ ] `/earthquakes` - List shows data
- [ ] `/volcanic` - Volcanic activity displays
- [ ] `/neo` - NEO objects load
- [ ] `/solar-system` - 3D visualization works
- [ ] `/watchmans-view` - Prophetic correlations display
- [ ] `/alerts` - Alerts system functional

### 4. Check Browser Console
- No errors
- API calls succeed
- No CORS issues

### 5. Test API Endpoints (Backend)
```powershell
# Health check
Invoke-WebRequest https://phobetronwebapp-production.up.railway.app/health

# Earthquakes
Invoke-WebRequest "https://phobetronwebapp-production.up.railway.app/api/v1/events/earthquakes?limit=5"
```

---

## 📝 Update Documentation

After successful deployment:

### 1. Update README.md
```markdown
## 🌐 Live Demo

**Frontend**: [https://phobetron-frontend-production.up.railway.app](https://phobetron-frontend-production.up.railway.app)  
**API Docs**: [https://phobetronwebapp-production.up.railway.app/docs](https://phobetronwebapp-production.up.railway.app/docs)

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://phobetron-frontend-production.up.railway.app)
```

### 2. Update CITATION.cff
```yaml
url: "https://phobetron-frontend-production.up.railway.app"
```

### 3. Update Zenodo Submission Guide
- Add live demo URL
- Update access instructions
- Include screenshots

---

## 🎯 For Zenodo Submission

Once frontend is deployed and tested:

1. **Update all documentation** with live URLs
2. **Create GitHub release** v1.0.0
3. **Submit to Zenodo** with:
   - Live demo link
   - API documentation link
   - GitHub repository
4. **Get DOI** from Zenodo
5. **Update CITATION.cff** with DOI

---

## 🚨 Troubleshooting

### Build Fails
```bash
# Test build locally
npm run build

# Check for errors
# Fix TypeScript issues
# Push to GitHub
# Redeploy on Railway
```

### CORS Errors
- Backend already configured for `*.up.railway.app`
- If issues persist, check Railway backend logs
- Verify frontend domain matches CORS list

### Environment Variables
- Railway auto-reads `.env` file
- No manual config needed
- Verify `VITE_API_URL` is correct

### 500 Errors
- Check Railway backend logs
- Verify database is running
- Check API endpoint paths

---

## ✅ Success Criteria

Deployment is complete when:

- ✅ Frontend loads at Railway URL
- ✅ All pages functional
- ✅ Data displays from backend
- ✅ No console errors
- ✅ API calls succeed
- ✅ Mobile responsive
- ✅ Fast load times

---

## 📊 Railway Resources Used

| Service | Status | URL |
|---------|--------|-----|
| **Frontend** | 🔄 Deploy now | `https://phobetron-frontend-production.up.railway.app` |
| **Backend** | ✅ Live | `https://phobetronwebapp-production.up.railway.app` |
| **Database** | ✅ Live | Internal |

**Hobbyist Plan**: $5/month - All included ✅

---

## 🎉 Ready to Deploy!

Everything is configured and ready. Follow the deployment steps above to make Phobetron publicly accessible!

**Estimated Time**: 5-10 minutes  
**Difficulty**: Easy ⭐

---

**Next**: After deployment, proceed to Zenodo submission for v1.0.0 release! 🚀
