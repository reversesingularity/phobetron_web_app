# Database Restore Script for Celestial Signs
# Restores PostgreSQL database from backup file

param(
    [Parameter(Mandatory=$false)]
    [string]$BackupFile,
    [string]$BackupDir = "F:\Projects\phobetron_web_app\backend\backups",
    [string]$PgHost = "localhost",
    [string]$PgPort = "5432",
    [string]$PgUser = "celestial_app",
    [string]$PgDatabase = "celestial_signs",
    [switch]$UseLatest,
    [switch]$Force
)

# Colors for output
function Write-Success { Write-Host $args -ForegroundColor Green }
function Write-Info { Write-Host $args -ForegroundColor Cyan }
function Write-Warning { Write-Host $args -ForegroundColor Yellow }
function Write-Error { Write-Host $args -ForegroundColor Red }

Write-Info "=========================================="
Write-Info "Celestial Signs Database Restore"
Write-Info "=========================================="
Write-Info "Started: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
Write-Info ""

# If UseLatest flag is set, find the most recent backup
if ($UseLatest) {
    Write-Info "Finding latest backup..."
    $LatestBackup = Get-ChildItem -Path $BackupDir -Filter "celestial_signs_backup_*.sql" | 
        Sort-Object LastWriteTime -Descending | 
        Select-Object -First 1
    
    if ($LatestBackup) {
        $BackupFile = $LatestBackup.FullName
        Write-Success "✓ Latest backup found: $($LatestBackup.Name)"
    } else {
        Write-Error "✗ No backups found in $BackupDir"
        exit 1
    }
}

# If no backup file specified, list available backups and prompt
if (-not $BackupFile) {
    Write-Info "Available backups:"
    $Backups = Get-ChildItem -Path $BackupDir -Filter "celestial_signs_backup_*.sql" | 
        Sort-Object LastWriteTime -Descending
    
    if ($Backups.Count -eq 0) {
        Write-Error "✗ No backups found in $BackupDir"
        Write-Info ""
        Write-Info "To create a backup, run:"
        Write-Info "  .\scripts\backup_database.ps1"
        exit 1
    }
    
    for ($i = 0; $i -lt $Backups.Count; $i++) {
        $backup = $Backups[$i]
        $size = $backup.Length / 1MB
        $age = ((Get-Date) - $backup.LastWriteTime).Days
        Write-Info "  [$($i+1)] $($backup.Name) - $([math]::Round($size, 2)) MB - $age day(s) old"
    }
    
    Write-Info ""
    $selection = Read-Host "Enter backup number to restore (or 'q' to quit)"
    
    if ($selection -eq 'q') {
        Write-Info "Restore cancelled"
        exit 0
    }
    
    try {
        $index = [int]$selection - 1
        if ($index -ge 0 -and $index -lt $Backups.Count) {
            $BackupFile = $Backups[$index].FullName
        } else {
            Write-Error "✗ Invalid selection"
            exit 1
        }
    } catch {
        Write-Error "✗ Invalid input"
        exit 1
    }
}

# Verify backup file exists
if (-not (Test-Path $BackupFile)) {
    Write-Error "✗ Backup file not found: $BackupFile"
    exit 1
}

$BackupFileInfo = Get-Item $BackupFile
$BackupSize = $BackupFileInfo.Length / 1MB

Write-Info ""
Write-Info "Restore configuration:"
Write-Info "  Backup file: $BackupFile"
Write-Info "  Backup size: $([math]::Round($BackupSize, 2)) MB"
Write-Info "  Backup date: $($BackupFileInfo.LastWriteTime)"
Write-Info "  Target host: $PgHost"
Write-Info "  Target port: $PgPort"
Write-Info "  Target database: $PgDatabase"
Write-Info "  Target user: $PgUser"
Write-Info ""

# Confirm restore (unless -Force flag is used)
if (-not $Force) {
    Write-Warning "⚠ WARNING: This will DROP and recreate the '$PgDatabase' database!"
    Write-Warning "⚠ All current data will be LOST!"
    Write-Warning ""
    $confirmation = Read-Host "Are you sure you want to continue? (type 'yes' to confirm)"
    
    if ($confirmation -ne 'yes') {
        Write-Info "Restore cancelled"
        exit 0
    }
}

# Check if psql is available
try {
    $psqlVersion = & psql --version 2>&1
    Write-Success "✓ PostgreSQL client found: $psqlVersion"
} catch {
    Write-Error "✗ psql not found in PATH"
    Write-Error "Please ensure PostgreSQL bin directory is in your PATH"
    Write-Error "Example: C:\Program Files\PostgreSQL\17\bin"
    exit 1
}

# Perform restore
Write-Info ""
Write-Info "Starting database restore..."

try {
    # Set password environment variable (prompt if not set)
    if (-not $env:PGPASSWORD) {
        Write-Warning "PGPASSWORD environment variable not set"
        $SecurePassword = Read-Host "Enter PostgreSQL password for user '$PgUser'" -AsSecureString
        $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($SecurePassword)
        $env:PGPASSWORD = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
    }

    $startTime = Get-Date
    
    # Restore database (connects to 'postgres' database to create target database)
    & psql `
        --host=$PgHost `
        --port=$PgPort `
        --username=$PgUser `
        --dbname=postgres `
        --file=$BackupFile `
        --echo-errors `
        2>&1
    
    $endTime = Get-Date
    $duration = ($endTime - $startTime).TotalSeconds

    if ($LASTEXITCODE -eq 0) {
        Write-Success ""
        Write-Success "✓ Database restored successfully!"
        Write-Success "  Duration: $([math]::Round($duration, 2)) seconds"
        Write-Success ""
        Write-Success "Database '$PgDatabase' has been restored from:"
        Write-Success "  $BackupFile"
    } else {
        Write-Error ""
        Write-Error "✗ Restore completed with warnings (exit code: $LASTEXITCODE)"
        Write-Warning "Some errors may be expected (e.g., role already exists)"
        Write-Warning "Please verify the database manually"
    }

} catch {
    Write-Error ""
    Write-Error "✗ Restore failed with error: $_"
    exit 1
} finally {
    # Clear password from environment
    $env:PGPASSWORD = $null
}

# Verify restore by checking migration version
Write-Info ""
Write-Info "Verifying database restore..."

try {
    $env:PGPASSWORD = Read-Host "Enter PostgreSQL password for user '$PgUser'" -AsSecureString | ConvertFrom-SecureString -AsPlainText
    
    $migrationVersion = & psql `
        --host=$PgHost `
        --port=$PgPort `
        --username=$PgUser `
        --dbname=$PgDatabase `
        --tuples-only `
        --no-align `
        --command="SELECT version_num FROM alembic_version;" `
        2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "✓ Alembic migration version: $migrationVersion"
    }
    
    $tableCount = & psql `
        --host=$PgHost `
        --port=$PgPort `
        --username=$PgUser `
        --dbname=$PgDatabase `
        --tuples-only `
        --no-align `
        --command="SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" `
        2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "✓ Tables restored: $tableCount"
    }
    
} catch {
    Write-Warning "⚠ Could not verify database: $_"
} finally {
    $env:PGPASSWORD = $null
}

Write-Info ""
Write-Info "=========================================="
Write-Success "Restore completed: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
Write-Info "=========================================="
Write-Info ""
Write-Info "Next steps:"
Write-Info "  1. Verify database: psql -h $PgHost -p $PgPort -U $PgUser -d $PgDatabase -c '\dt'"
Write-Info "  2. Check migration version: cd backend && alembic current"
Write-Info "  3. Run tests: cd backend && pytest tests/test_models/ -v"
Write-Info ""
