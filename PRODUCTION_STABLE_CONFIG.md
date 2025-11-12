# 🎯 PRODUCTION STABLE CONFIGURATION

**Status**: ✅ **PRODUCTION OPERATIONAL**  
**Verified**: November 12, 2025 04:55 UTC  
**Backup Location**: `backups/PRODUCTION_STABLE_20251112_183253/`  

---

## 🚀 QUICK ACCESS

### Live URLs
- **Backend API**: https://phobetronwebapp-production.up.railway.app
- **Frontend**: https://phobetronwebapp-production-d69a.up.railway.app
- **API Health**: https://phobetronwebapp-production.up.railway.app/api/v1/admin/check-tables

### Documentation
- **Deployment Guide**: `backups/PRODUCTION_STABLE_20251112_183253/DEPLOYMENT_NOTES.md`
- **Quick Restore**: `backups/PRODUCTION_STABLE_20251112_183253/README.md`
- **Constitution v1.4.0**: `.specify/memory/constitution.md`

---

## ⚡ EMERGENCY RESTORE

If production breaks, restore from backup:

```powershell
# 1. Copy backend files
Copy-Item -Path "backups\PRODUCTION_STABLE_20251112_183253\backend\*" `
          -Destination "backend\" -Recurse -Force

# 2. Copy railway.toml
Copy-Item -Path "backups\PRODUCTION_STABLE_20251112_183253\railway.toml" `
          -Destination "railway.toml" -Force

# 3. Copy frontend files  
Copy-Item -Path "backups\PRODUCTION_STABLE_20251112_183253\frontend\*" `
          -Destination "frontend\" -Recurse -Force

# 4. Commit and push
git add .
git commit -m "Restore from PRODUCTION_STABLE_20251112_183253"
git push origin 001-database-schema
```

### Railway Configuration

**Backend** (endearing-encouragement):
```
DATABASE_URL=postgresql://postgres:diAzWOwKuEhKBcNLcZlsVqfwHrptCQlt@crossover.proxy.rlwy.net:44440/railway
```

**Frontend** (humble-fascination):
```
VITE_API_URL=https://phobetronwebapp-production.up.railway.app/api/v1
```

---

## 🚨 CRITICAL DEPLOYMENT RULES

1. **Password Case Matters**: Use uppercase 'C' in `...CQlt` (not `...cQlt`)
2. **Cross-Project Database**: Use public proxy `crossover.proxy.rlwy.net:44440`
3. **No Variable References**: Hardcode DATABASE_URL (don't use `${{Postgres.DATABASE_URL}}`)
4. **railway.toml**: Must use `startCommand = "bash railway-start.sh"`
5. **Dockerfile COPY**: Use relative paths when Root Directory = `backend`
6. **Frontend API URL**: Include `/api/v1` suffix, don't duplicate

---

## ✅ VERIFICATION CHECKLIST

```bash
# Test database
curl https://phobetronwebapp-production.up.railway.app/api/v1/admin/check-tables

# Test data endpoints
curl https://phobetronwebapp-production.up.railway.app/api/v1/events/earthquakes?limit=5
curl https://phobetronwebapp-production.up.railway.app/api/v1/events/volcanic-activity?limit=5
curl https://phobetronwebapp-production.up.railway.app/api/v1/scientific/close-approaches?limit=5
```

All should return JSON with data (not errors).

---

## 📋 WHAT WAS FIXED

**15+ Hours of Debugging** resolved:
- ❌ Password case typo (lowercase 'c' → uppercase 'C')
- ❌ Cross-project Railway networking issues
- ❌ Dockerfile COPY path problems with Root Directory
- ❌ railway.toml startCommand bash execution
- ❌ Frontend duplicate /api/v1 prefix
- ❌ Variable references containing stale values

**Result**: All pages now fetching data successfully ✅

---

## 🎯 BACKUP HIERARCHY (NEWEST FIRST)

**USE THIS BACKUP** when restoring:
1. ✅ **PRODUCTION_STABLE_20251112_183253** ← **USE THIS**
2. solar_system_stable_20251110_211532
3. solar_system_stable_20251110_211522
4. solar_system_integration_20251109_213132
5. solar_system_integration_20251109_213119

The others are obsolete - this is the ONLY verified production stable config.

---

**Last Updated**: November 12, 2025 18:32:53  
**Constitution Version**: 1.4.0  
**Deployment Notes**: See `backups/PRODUCTION_STABLE_20251112_183253/DEPLOYMENT_NOTES.md`  
