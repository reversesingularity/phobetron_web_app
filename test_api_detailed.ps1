# Test API and get detailed error
Write-Host "Waiting for backend to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

try {
    Write-Host "Testing endpoint..." -ForegroundColor Cyan
    $uri = "http://localhost:8000/api/v1/ml/comprehensive-pattern-detection?start_date=2020-01-01&end_date=2025-12-31"
    
    $response = Invoke-WebRequest -Uri $uri -Method GET -UseBasicParsing -ErrorAction Stop
    
    Write-Host "`n✅ SUCCESS! Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "`nResponse (first 2000 chars):" -ForegroundColor Cyan
    $response.Content.Substring(0, [Math]::Min(2000, $response.Content.Length))
    
} catch {
    Write-Host "`n❌ ERROR!" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Yellow
    
    if ($_.ErrorDetails.Message) {
        Write-Host "`nError Details:" -ForegroundColor Yellow
        $_.ErrorDetails.Message
    }
    
    if ($_.Exception.Response) {
        try {
            $stream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($stream)
            $responseBody = $reader.ReadToEnd()
            Write-Host "`nResponse Body:" -ForegroundColor Yellow
            $responseBody
        } catch {
            Write-Host "Could not read response body: $_"
        }
    }
}
