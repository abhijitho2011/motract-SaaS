$workshopId = "162b12df-4d9c-4e4c-98e8-969071af2d8b"

Write-Host "`n=== Testing Backend Endpoints ===" -ForegroundColor Cyan

# Test 1: Dashboard (should work)
Write-Host "`n1. Testing Dashboard..." -ForegroundColor Yellow
try {
    $dashResponse = Invoke-RestMethod -Uri "https://motract-backend-5sct.onrender.com/dashboard?workshopId=$workshopId" -Method GET
    Write-Host "✅ Dashboard works!" -ForegroundColor Green
    $dashResponse | ConvertTo-Json -Depth 3
}
catch {
    Write-Host "❌ Dashboard failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}

# Test 2: Create Bay
Write-Host "`n2. Testing Bay Creation..." -ForegroundColor Yellow
$bayBody = @{
    workshopId = $workshopId
    name       = "Test Bay 1"
    type       = "GENERAL"
} | ConvertTo-Json

try {
    $bayResponse = Invoke-RestMethod -Uri "https://motract-backend-5sct.onrender.com/slots/bays" -Method POST -Body $bayBody -ContentType "application/json"
    Write-Host "✅ Bay created!" -ForegroundColor Green
    $bayResponse | ConvertTo-Json
}
catch {
    Write-Host "❌ Bay creation failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}

# Test 3: Get Bays
Write-Host "`n3. Testing Get Bays..." -ForegroundColor Yellow
try {
    $baysResponse = Invoke-RestMethod -Uri "https://motract-backend-5sct.onrender.com/slots/bays?workshopId=$workshopId" -Method GET
    Write-Host "✅ Get bays works!" -ForegroundColor Green
    Write-Host "Bays count: $($baysResponse.Count)"
}
catch {
    Write-Host "❌ Get bays failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Tests Complete ===" -ForegroundColor Cyan
