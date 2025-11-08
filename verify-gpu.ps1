# VS Code GPU Acceleration Verification Script
Write-Host "=== VERIFYING GPU ACCELERATION ===" -ForegroundColor Cyan
Write-Host ""

# Check argv.json
$argvPath = "$env:APPDATA\Code\User\argv.json"
if (Test-Path $argvPath) {
    Write-Host "✓ GPU config file exists" -ForegroundColor Green
    $config = Get-Content $argvPath | ConvertFrom-Json
    Write-Host "  • Hardware Acceleration: $(-not $config."disable-hardware-acceleration")" -ForegroundColor Yellow
    Write-Host "  • Vulkan: $($config."use-vulkan")" -ForegroundColor Yellow
    Write-Host "  • GPU Rasterization: $($config."enable-gpu-rasterization")" -ForegroundColor Yellow
} else {
    Write-Host "✗ GPU config file not found" -ForegroundColor Red
}

Write-Host ""
Write-Host "Run code --status to verify Vulkan is enabled" -ForegroundColor Cyan
