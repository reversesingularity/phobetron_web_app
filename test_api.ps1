# Test the Pattern Detection API
Write-Host "Testing Pattern Detection API..." -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/ml/comprehensive-pattern-detection?start_date=2020-01-01&end_date=2030-12-31" -Method POST
    
    Write-Host "`nAPI Response:" -ForegroundColor Green
    Write-Host "Success: $($response.success)"
    Write-Host "Total Patterns: $($response.statistics.total_patterns)"
    Write-Host "Feast Days in Range: $($response.statistics.feast_days_in_range)"
    Write-Host "Total Events Analyzed: $($response.statistics.total_events_analyzed)"
    Write-Host "`nEvent Counts:"
    Write-Host "  Earthquakes: $($response.event_counts.earthquakes)"
    Write-Host "  Volcanic: $($response.event_counts.volcanic)"
    Write-Host "  Hurricanes: $($response.event_counts.hurricanes)"
    Write-Host "  Tsunamis: $($response.event_counts.tsunamis)"
    
    if ($response.error) {
        Write-Host "`nError: $($response.error)" -ForegroundColor Red
        Write-Host "Message: $($response.message)" -ForegroundColor Red
    }
    
    if ($response.patterns -and $response.patterns.Count -gt 0) {
        Write-Host "`nFirst Pattern:" -ForegroundColor Yellow
        $response.patterns[0] | ConvertTo-Json -Depth 2
    }
} catch {
    Write-Host "`nFailed to call API:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}
