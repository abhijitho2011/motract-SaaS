$workshopId = "071af2d8b4e4c-98e8-9690"

# Test 1: Create a bay
Write-Host "`n=== Testing Bay Creation ===" -ForegroundColor Cyan
$bayBody = @{
    workshopId = $workshopId
    name       = "Bay 1"
    type       = "GENERAL"
} | ConvertTo-Json

try {
    $bayResponse = Invoke-RestMethod -Uri "https://motract-backend-5sct.onrender.com/slots/bays" -Method POST -Body $bayBody -ContentType "application/json"
    Write-Host "✅ Bay created successfully!" -ForegroundColor Green
    $bayResponse | ConvertTo-Json
}
catch {
    Write-Host "❌ Bay creation failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Test Complete ===" -ForegroundColor Cyan
