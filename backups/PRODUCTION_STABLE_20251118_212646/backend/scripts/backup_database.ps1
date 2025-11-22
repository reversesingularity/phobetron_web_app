# Database Backup Script for Celestial Signs
# Backs up PostgreSQL database with timestamp and rotation

param(
    [string]$BackupDir = "F:\Projects\phobetron_web_app\backend\backups",
    [int]$RetentionDays = 7,
    [string]$PgHost = "localhost",
    [string]$PgPort = "5432",
    [string]$PgUser = "celestial_app",
    [string]$PgDatabase = "celestial_signs"
)

# Colors for output
function Write-Success { Write-Host $args -ForegroundColor Green }
function Write-Info { Write-Host $args -ForegroundColor Cyan }
function Write-Warning { Write-Host $args -ForegroundColor Yellow }
function Write-Error { Write-Host $args -ForegroundColor Red }

Write-Info "=========================================="
Write-Info "Celestial Signs Database Backup"
Write-Info "=========================================="
Write-Info "Started: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
Write-Info ""

# Create backup directory if it doesn't exist
if (-not (Test-Path $BackupDir)) {
    Write-Info "Creating backup directory: $BackupDir"
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
}

# Generate timestamp for backup filename
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$BackupFile = Join-Path $BackupDir "celestial_signs_backup_$Timestamp.sql"
$BackupLogFile = Join-Path $BackupDir "celestial_signs_backup_$Timestamp.log"

Write-Info "Backup location: $BackupFile"
Write-Info ""

# Check if pg_dump is available
try {
    $pgDumpVersion = & pg_dump --version 2>&1
    Write-Success "✓ PostgreSQL tools found: $pgDumpVersion"
} catch {
    Write-Error "✗ pg_dump not found in PATH"
    Write-Error "Please ensure PostgreSQL bin directory is in your PATH"
    Write-Error "Example: C:\Program Files\PostgreSQL\17\bin"
    exit 1
}

# Perform backup
Write-Info ""
Write-Info "Backing up database..."
Write-Info "  Host: $PgHost"
Write-Info "  Port: $PgPort"
Write-Info "  Database: $PgDatabase"
Write-Info "  User: $PgUser"
Write-Info ""

try {
    # Set password environment variable (prompt if not set)
    if (-not $env:PGPASSWORD) {
        Write-Warning "PGPASSWORD environment variable not set"
        $SecurePassword = Read-Host "Enter PostgreSQL password for user '$PgUser'" -AsSecureString
        $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($SecurePassword)
        $env:PGPASSWORD = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
    }

    # Execute pg_dump with full schema and data
    $startTime = Get-Date
    
    & pg_dump `
        --host=$PgHost `
        --port=$PgPort `
        --username=$PgUser `
        --dbname=$PgDatabase `
        --verbose `
        --clean `
        --if-exists `
        --create `
        --format=plain `
        --file=$BackupFile `
        2>&1 | Tee-Object -FilePath $BackupLogFile
    
    $endTime = Get-Date
    $duration = ($endTime - $startTime).TotalSeconds

    if ($LASTEXITCODE -eq 0) {
        $backupSize = (Get-Item $BackupFile).Length / 1MB
        Write-Success ""
        Write-Success "✓ Backup completed successfully!"
        Write-Success "  File: $BackupFile"
        Write-Success "  Size: $([math]::Round($backupSize, 2)) MB"
        Write-Success "  Duration: $([math]::Round($duration, 2)) seconds"
        Write-Success "  Log: $BackupLogFile"
    } else {
        Write-Error ""
        Write-Error "✗ Backup failed with exit code: $LASTEXITCODE"
        Write-Error "Check log file for details: $BackupLogFile"
        exit 1
    }

} catch {
    Write-Error ""
    Write-Error "✗ Backup failed with error: $_"
    exit 1
} finally {
    # Clear password from environment
    $env:PGPASSWORD = $null
}

# Backup migration history
Write-Info ""
Write-Info "Backing up Alembic migration history..."
$MigrationBackupFile = Join-Path $BackupDir "alembic_version_$Timestamp.txt"

try {
    & pg_dump `
        --host=$PgHost `
        --port=$PgPort `
        --username=$PgUser `
        --dbname=$PgDatabase `
        --table=alembic_version `
        --data-only `
        --inserts `
        --file=$MigrationBackupFile `
        2>&1 | Out-Null
    
    Write-Success "✓ Migration history backed up: $MigrationBackupFile"
} catch {
    Write-Warning "⚠ Could not backup migration history: $_"
}

# Clean up old backups
Write-Info ""
Write-Info "Cleaning up old backups (retention: $RetentionDays days)..."

$CutoffDate = (Get-Date).AddDays(-$RetentionDays)
$OldBackups = Get-ChildItem -Path $BackupDir -Filter "celestial_signs_backup_*.sql" | 
    Where-Object { $_.LastWriteTime -lt $CutoffDate }

if ($OldBackups.Count -gt 0) {
    Write-Info "Found $($OldBackups.Count) old backup(s) to remove:"
    foreach ($oldBackup in $OldBackups) {
        Write-Info "  Removing: $($oldBackup.Name)"
        Remove-Item $oldBackup.FullName -Force
        
        # Also remove associated log file
        $logFile = $oldBackup.FullName -replace '\.sql$', '.log'
        if (Test-Path $logFile) {
            Remove-Item $logFile -Force
        }
        
        # Also remove associated migration backup
        $migrationFile = $oldBackup.FullName -replace 'celestial_signs_backup_', 'alembic_version_' -replace '\.sql$', '.txt'
        if (Test-Path $migrationFile) {
            Remove-Item $migrationFile -Force
        }
    }
    Write-Success "✓ Cleaned up $($OldBackups.Count) old backup(s)"
} else {
    Write-Info "No old backups to remove"
}

# List current backups
Write-Info ""
Write-Info "Current backups:"
$CurrentBackups = Get-ChildItem -Path $BackupDir -Filter "celestial_signs_backup_*.sql" | 
    Sort-Object LastWriteTime -Descending

if ($CurrentBackups.Count -gt 0) {
    foreach ($backup in $CurrentBackups) {
        $size = $backup.Length / 1MB
        $age = ((Get-Date) - $backup.LastWriteTime).Days
        Write-Info "  $($backup.Name) - $([math]::Round($size, 2)) MB - $age day(s) old"
    }
} else {
    Write-Info "  No backups found"
}

Write-Info ""
Write-Info "=========================================="
Write-Success "Backup completed: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
Write-Info "=========================================="
Write-Info ""
Write-Info "To restore this backup, run:"
Write-Info "  psql -h $PgHost -p $PgPort -U $PgUser -d postgres -f `"$BackupFile`""
Write-Info ""
