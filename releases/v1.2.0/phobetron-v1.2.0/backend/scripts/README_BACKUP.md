# Database Backup and Recovery Documentation

## Overview

This directory contains PowerShell scripts for backing up and restoring the Celestial Signs PostgreSQL database. These scripts provide a safety net for disaster recovery and data protection.

---

## Files

- **`backup_database.ps1`** - Creates timestamped database backups with automatic rotation
- **`restore_database.ps1`** - Restores database from backup files
- **`README_BACKUP.md`** - This documentation

---

## Quick Start

### Create a Backup

```powershell
# Basic backup (prompts for password)
.\scripts\backup_database.ps1

# With password in environment variable
$env:PGPASSWORD = "your_password"
.\scripts\backup_database.ps1
```

### Restore Latest Backup

```powershell
# Interactive: Lists backups and prompts for selection
.\scripts\restore_database.ps1

# Automatic: Restores latest backup without prompting
.\scripts\restore_database.ps1 -UseLatest -Force

# Specific backup file
.\scripts\restore_database.ps1 -BackupFile "F:\Projects\phobetron_web_app\backend\backups\celestial_signs_backup_20251025_220000.sql"
```

---

## Backup Script Details

### Features

✅ **Timestamped backups** - Each backup has format: `celestial_signs_backup_YYYYMMDD_HHMMSS.sql`  
✅ **Automatic rotation** - Keeps backups for 7 days by default (configurable)  
✅ **Migration history** - Backs up Alembic version table separately  
✅ **Full schema + data** - Includes all tables, indexes, constraints, and data  
✅ **Clean format** - Uses `--clean --if-exists` for safe restores  
✅ **Logging** - Creates log file for each backup operation  
✅ **Size reporting** - Shows backup file size and duration  

### Parameters

```powershell
-BackupDir       # Directory for backups (default: backend/backups)
-RetentionDays   # Days to keep old backups (default: 7)
-PgHost          # PostgreSQL host (default: localhost)
-PgPort          # PostgreSQL port (default: 5432)
-PgUser          # Database user (default: celestial_app)
-PgDatabase      # Database name (default: celestial_signs)
```

### Example with Custom Parameters

```powershell
.\scripts\backup_database.ps1 `
    -BackupDir "D:\DatabaseBackups" `
    -RetentionDays 30 `
    -PgHost "prod-db-server.local" `
    -PgPort "5432"
```

### What Gets Backed Up

1. **All database objects:**
   - Tables (15 total: scientific, events, theological, alerts, correlations)
   - Indexes (60+ indexes)
   - Constraints (CHECK, FOREIGN KEY, UNIQUE)
   - Sequences (SERIAL primary keys)
   - PostGIS Geography columns

2. **All data:**
   - Scientific data (ephemeris, orbital elements, impact risks, close approaches)
   - Geophysical events (earthquakes, solar events, meteor showers, volcanic activity)
   - Theological data (prophecies, celestial signs, relationships)
   - Alert system data (triggers, alerts)
   - Correlation data (rules, detected correlations)

3. **Migration history:**
   - Alembic version table (current migration state)

---

## Restore Script Details

### Features

✅ **Interactive mode** - Lists available backups and prompts for selection  
✅ **Latest backup** - Can automatically restore most recent backup  
✅ **Safety confirmation** - Warns before destructive operations  
✅ **Force mode** - Skip confirmation for automated scripts  
✅ **Verification** - Checks migration version and table count after restore  
✅ **Clean restore** - Drops existing database and recreates from backup  

### Parameters

```powershell
-BackupFile      # Specific backup file to restore
-UseLatest       # Automatically use latest backup
-Force           # Skip confirmation prompt
-BackupDir       # Directory containing backups (default: backend/backups)
-PgHost          # PostgreSQL host (default: localhost)
-PgPort          # PostgreSQL port (default: 5432)
-PgUser          # Database user (default: celestial_app)
-PgDatabase      # Database name (default: celestial_signs)
```

### Example Restore Scenarios

**Interactive restore (recommended for manual recovery):**
```powershell
# Lists all backups and prompts for selection
.\scripts\restore_database.ps1
```

**Automated restore (for scripts):**
```powershell
# Restores latest backup without prompting
.\scripts\restore_database.ps1 -UseLatest -Force
```

**Restore specific backup:**
```powershell
# Restore from specific file
.\scripts\restore_database.ps1 `
    -BackupFile "F:\Projects\phobetron_web_app\backend\backups\celestial_signs_backup_20251025_143000.sql"
```

### Restore Process

1. **Connects to `postgres` database** (not target database)
2. **Drops existing database** (if exists)
3. **Creates new database**
4. **Restores all objects and data**
5. **Verifies migration version**
6. **Reports table count**

---

## Scheduled Backups (Windows Task Scheduler)

### Create Scheduled Task

1. Open **Task Scheduler** (taskschd.msc)
2. **Action → Create Basic Task**
3. **Name:** Celestial Signs DB Backup
4. **Trigger:** Daily at 2:00 AM
5. **Action:** Start a program
   - Program: `powershell.exe`
   - Arguments: `-ExecutionPolicy Bypass -File "F:\Projects\phobetron_web_app\backend\scripts\backup_database.ps1"`
6. **Run with highest privileges**

### Example Task XML

Save as `celestial_signs_backup_task.xml` and import:

```xml
<?xml version="1.0" encoding="UTF-16"?>
<Task version="1.2" xmlns="http://schemas.microsoft.com/windows/2004/02/mit/task">
  <Triggers>
    <CalendarTrigger>
      <StartBoundary>2025-10-26T02:00:00</StartBoundary>
      <ScheduleByDay>
        <DaysInterval>1</DaysInterval>
      </ScheduleByDay>
    </CalendarTrigger>
  </Triggers>
  <Actions>
    <Exec>
      <Command>powershell.exe</Command>
      <Arguments>-ExecutionPolicy Bypass -File "F:\Projects\phobetron_web_app\backend\scripts\backup_database.ps1"</Arguments>
    </Exec>
  </Actions>
  <Settings>
    <Enabled>true</Enabled>
    <RunOnlyIfNetworkAvailable>false</RunOnlyIfNetworkAvailable>
  </Settings>
</Task>
```

---

## Disaster Recovery Procedures

### Scenario 1: Data Corruption
**Problem:** Database tables corrupted or data lost

**Solution:**
```powershell
# 1. Stop application
# 2. Restore latest backup
.\scripts\restore_database.ps1 -UseLatest -Force

# 3. Verify restoration
psql -h localhost -U celestial_app -d celestial_signs -c "\dt"

# 4. Run tests
cd backend
pytest tests/test_models/ -v

# 5. Restart application
```

### Scenario 2: Failed Migration
**Problem:** Alembic migration failed, database in inconsistent state

**Solution:**
```powershell
# 1. Restore pre-migration backup
.\scripts\restore_database.ps1

# 2. Fix migration script
# Edit: backend/alembic/versions/[migration_file].py

# 3. Test migration on test database
cd backend
alembic -x test=true upgrade head

# 4. If successful, apply to production
alembic upgrade head
```

### Scenario 3: Complete Database Loss
**Problem:** PostgreSQL server failure or database deleted

**Solution:**
```powershell
# 1. Restore PostgreSQL server
# 2. Recreate celestial_app user
psql -U postgres -c "CREATE USER celestial_app WITH PASSWORD 'your_password';"
psql -U postgres -c "ALTER USER celestial_app CREATEDB;"

# 3. Restore from backup (database will be created)
.\scripts\restore_database.ps1 -UseLatest -Force

# 4. Verify extensions
psql -h localhost -U celestial_app -d celestial_signs -c "\dx"
# Should show: postgis, postgis_topology, uuid-ossp

# 5. Run full test suite
cd backend
pytest tests/test_models/ -v
```

### Scenario 4: Rollback to Specific Point in Time
**Problem:** Need to restore database to specific date/time

**Solution:**
```powershell
# 1. List available backups
Get-ChildItem F:\Projects\phobetron_web_app\backend\backups -Filter "celestial_signs_backup_*.sql" | 
    Sort-Object LastWriteTime | 
    Format-Table Name, LastWriteTime, @{Name="Size(MB)";Expression={[math]::Round($_.Length/1MB,2)}}

# 2. Identify backup closest to desired time
# Example: celestial_signs_backup_20251024_220000.sql

# 3. Restore specific backup
.\scripts\restore_database.ps1 -BackupFile "F:\Projects\phobetron_web_app\backend\backups\celestial_signs_backup_20251024_220000.sql"

# 4. Verify data
psql -h localhost -U celestial_app -d celestial_signs
```

---

## Backup Strategy Best Practices

### Daily Backups
✅ **Automated:** Run backup_database.ps1 via Task Scheduler  
✅ **Time:** 2:00 AM when system load is low  
✅ **Retention:** Keep 7 days of daily backups  

### Weekly Backups (Optional)
✅ **Archive:** Copy Sunday backup to long-term storage  
✅ **Location:** External drive or cloud storage (OneDrive, S3)  
✅ **Retention:** Keep 4 weeks of weekly backups  

### Pre-Deployment Backups
✅ **Before migrations:** Always backup before `alembic upgrade`  
✅ **Before major changes:** Backup before schema modifications  
✅ **Before data imports:** Backup before bulk data operations  

### Testing Backups
✅ **Monthly:** Restore backup to test database  
✅ **Verify:** Run full test suite on restored database  
✅ **Document:** Record any restore issues or improvements  

---

## Backup Storage Recommendations

### Local Storage (Current)
📁 **Location:** `F:\Projects\phobetron_web_app\backend\backups`  
⏱️ **Retention:** 7 days  
💾 **Estimated Size:** ~50-100 MB per backup (grows with data)  

### External Storage (Recommended)
☁️ **Cloud:** OneDrive, Google Drive, AWS S3, Azure Blob Storage  
💿 **External Drive:** USB drive or NAS  
🔐 **Encryption:** Use BitLocker or cloud encryption  

### Example: Copy to OneDrive
```powershell
# Add to backup_database.ps1 (after backup completes)
$OneDriveBackup = "C:\Users\YourUser\OneDrive\DatabaseBackups"
Copy-Item $BackupFile -Destination $OneDriveBackup -Force
```

---

## Troubleshooting

### Error: "pg_dump not found"
**Solution:** Add PostgreSQL bin to PATH
```powershell
$env:PATH += ";C:\Program Files\PostgreSQL\17\bin"
# Or add permanently via System Environment Variables
```

### Error: "password authentication failed"
**Solution:** Set PGPASSWORD environment variable
```powershell
$env:PGPASSWORD = "your_password"
.\scripts\backup_database.ps1
```

### Error: "database does not exist"
**Solution:** Create database before restore
```powershell
psql -U postgres -c "CREATE DATABASE celestial_signs;"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE celestial_signs TO celestial_app;"
```

### Warning: "role already exists" during restore
**Status:** Normal - Can be ignored  
**Reason:** Backup includes CREATE ROLE commands  
**Action:** None required if other objects restored successfully  

### Error: "disk space" during backup
**Solution:** Clean up old backups or increase retention
```powershell
# Manually remove old backups
Remove-Item F:\Projects\phobetron_web_app\backend\backups\celestial_signs_backup_202510*.sql

# Or reduce retention days
.\scripts\backup_database.ps1 -RetentionDays 3
```

---

## Integration with Development Workflow

### Before Migration
```powershell
# 1. Backup current state
.\scripts\backup_database.ps1

# 2. Apply migration
cd backend
alembic upgrade head

# 3. If migration fails, restore
.\scripts\restore_database.ps1 -UseLatest -Force
```

### Before Seed Data Import
```powershell
# 1. Backup current state
.\scripts\backup_database.ps1

# 2. Run seed script
cd backend
python seed_theological_data.py

# 3. Verify data
psql -h localhost -U celestial_app -d celestial_signs -c "SELECT COUNT(*) FROM prophecies;"
```

### After Major Development Session
```powershell
# Create backup before committing code
.\scripts\backup_database.ps1

# Commit code and backup together
git add .
git commit -m "Feature: Added correlation models with backup"
```

---

## Security Considerations

🔐 **Password Storage**
- ⚠️ Never commit PGPASSWORD to git
- ✅ Use `.env` files (excluded from git)
- ✅ Use Windows Credential Manager for passwords

🔒 **Backup Files**
- ⚠️ Backups contain sensitive data
- ✅ Encrypt backup directory (BitLocker)
- ✅ Restrict file permissions (NTFS ACLs)
- ✅ Never commit backup files to git

☁️ **Cloud Storage**
- ⚠️ Use encrypted cloud storage
- ✅ Enable 2FA on cloud accounts
- ✅ Use private/encrypted folders
- ✅ Regularly audit access logs

---

## Maintenance Schedule

### Daily
- [x] Automated backup via Task Scheduler (2:00 AM)

### Weekly
- [ ] Verify backup files exist and are not corrupted
- [ ] Check backup directory disk space
- [ ] Copy weekly backup to external storage

### Monthly
- [ ] Test restore procedure on test database
- [ ] Run full test suite on restored database
- [ ] Review and update retention policy if needed
- [ ] Archive old backups to long-term storage

### Quarterly
- [ ] Review disaster recovery procedures
- [ ] Update scripts if database schema changes significantly
- [ ] Test complete disaster recovery scenario
- [ ] Document any lessons learned

---

## Additional Resources

### PostgreSQL Documentation
- [pg_dump](https://www.postgresql.org/docs/current/app-pgdump.html)
- [pg_restore](https://www.postgresql.org/docs/current/app-pgrestore.html)
- [Backup and Restore](https://www.postgresql.org/docs/current/backup.html)

### Alembic Documentation
- [Migration Management](https://alembic.sqlalchemy.org/en/latest/)
- [Downgrade/Upgrade](https://alembic.sqlalchemy.org/en/latest/tutorial.html#downgrading)

### Project Documentation
- [Database Schema Spec](../../specs/001-database-schema/spec.md)
- [Phases 5-6-7 Complete](../../docs/PHASES_5_6_7_COMPLETE.md)
- [Docker Deployment](../../docs/DOCKER_DEPLOYMENT_COMPLETE.md)

---

## Quick Reference Commands

```powershell
# Create backup
.\scripts\backup_database.ps1

# Restore latest backup (interactive)
.\scripts\restore_database.ps1

# Restore latest backup (automated)
.\scripts\restore_database.ps1 -UseLatest -Force

# List all backups
Get-ChildItem F:\Projects\phobetron_web_app\backend\backups -Filter "*.sql" | Format-Table

# Check database size
psql -h localhost -U celestial_app -d celestial_signs -c "SELECT pg_size_pretty(pg_database_size('celestial_signs'));"

# Verify backup integrity (quick check)
psql -h localhost -U celestial_app -d postgres -c "\i F:\Projects\phobetron_web_app\backend\backups\celestial_signs_backup_20251025_220000.sql" --single-transaction --set ON_ERROR_STOP=on

# Create manual backup with custom name
pg_dump -h localhost -U celestial_app -d celestial_signs > manual_backup_pre_feature_xyz.sql
```

---

**Last Updated:** October 25, 2025  
**PostgreSQL Version:** 17rc1  
**Database:** celestial_signs  
**Schema Version:** 6cdf0b06a3e9 (Migration 004)
