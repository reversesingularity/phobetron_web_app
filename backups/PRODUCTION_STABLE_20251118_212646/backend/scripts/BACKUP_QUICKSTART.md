# Quick Backup/Restore Commands

## 🔧 Daily Operations

### Create Backup
```powershell
cd F:\Projects\phobetron_web_app\backend
.\scripts\backup_database.ps1
```

### Restore Latest Backup
```powershell
cd F:\Projects\phobetron_web_app\backend
.\scripts\restore_database.ps1 -UseLatest -Force
```

---

## 🚨 Emergency Recovery

### If Database Corrupted
```powershell
# 1. Stop application
# 2. Restore
.\scripts\restore_database.ps1 -UseLatest -Force
# 3. Verify
cd backend
pytest tests/test_models/ -v
```

### If Migration Failed
```powershell
# 1. Restore pre-migration backup
.\scripts\restore_database.ps1
# 2. Fix migration file
# 3. Test: alembic upgrade head
```

---

## 📅 Before Important Operations

### Before Alembic Migration
```powershell
.\scripts\backup_database.ps1
alembic upgrade head
```

### Before Seed Data Import
```powershell
.\scripts\backup_database.ps1
python seed_theological_data.py
```

### Before Major Changes
```powershell
.\scripts\backup_database.ps1
# Make changes
# Test thoroughly
```

---

## 🔍 Verification Commands

### Check Database Status
```powershell
psql -h localhost -U celestial_app -d celestial_signs -c "\dt"
```

### Check Migration Version
```powershell
cd backend
alembic current
```

### List All Backups
```powershell
Get-ChildItem F:\Projects\phobetron_web_app\backend\backups -Filter "*.sql" | Sort-Object LastWriteTime -Descending | Format-Table Name, LastWriteTime, Length
```

---

## 📖 Full Documentation
See: `backend/scripts/README_BACKUP.md`
