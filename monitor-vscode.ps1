# VS Code Performance Monitor
Write-Host "=== VS Code Performance Monitor ===" -ForegroundColor Green
$codeProcesses = Get-Process | Where-Object { $_.Name -like "*code*" }
$totalMemory = ($codeProcesses | Measure-Object -Property WorkingSet -Sum).Sum
Write-Host "Total VS Code Memory: $([math]::Round($totalMemory / 1MB, 2)) MB" -ForegroundColor Yellow
Write-Host "Active Processes: $($codeProcesses.Count)" -ForegroundColor Yellow
Write-Host ""
Write-Host "Top Memory Users:" -ForegroundColor Cyan
$codeProcesses | Sort-Object WorkingSet -Descending | Select-Object -First 5 | ForEach-Object {
    Write-Host "  $($_.Name): $([math]::Round($_.WorkingSet / 1MB, 2)) MB"
}
