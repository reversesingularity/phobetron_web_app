# Test the comprehensive-pattern-detection endpoint
Write-Host "Testing API endpoint..." -ForegroundColor Cyan

try {
    $uri = "http://localhost:8000/api/v1/ml/comprehensive-pattern-detection?start_date=2020-01-01&end_date=2025-12-31"
    
    Write-Host "Calling: $uri" -ForegroundColor Yellow
    
    $response = Invoke-RestMethod -Uri $uri -Method POST -ContentType "application/json" -ErrorAction Stop
    
    Write-Host "`n✅ SUCCESS!" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 5
    
} catch {
    Write-Host "`n❌ ERROR!" -ForegroundColor Red
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Yellow
    
    if ($_.ErrorDetails.Message) {
        Write-Host "`nError Details:" -ForegroundColor Yellow
        $_.ErrorDetails.Message
    }
    
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $responseBody = $reader.ReadToEnd()
        Write-Host "`nResponse Body:" -ForegroundColor Yellow
        $responseBody
    }
}
