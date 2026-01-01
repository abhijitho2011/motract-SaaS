$BASE_URL = "https://motract-backend.onrender.com"

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Motract API Test Suite" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Register User
Write-Host "1. Testing User Registration..." -ForegroundColor Yellow
$registerBody = @{
    mobile = "9123456789"
    password = "test123"
    role = "WORKSHOP_ADMIN"
    name = "Test Workshop Admin"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "$BASE_URL/auth/register" -Method POST -Body $registerBody -ContentType "application/json"
    Write-Host "✓ User registered successfully" -ForegroundColor Green
    $userId = $registerResponse.id
} catch {
    Write-Host "✗ Registration failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Login
Write-Host "`n2. Testing Login..." -ForegroundColor Yellow
$loginBody = @{
    mobile = "9123456789"
    password = "test123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$BASE_URL/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    Write-Host "✓ Login successful" -ForegroundColor Green
    $token = $loginResponse.access_token
    Write-Host "  Token: $($token.Substring(0, 30))..." -ForegroundColor Gray
} catch {
    Write-Host "✗ Login failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Get Vehicle Models
Write-Host "`n3. Testing Get Vehicle Models..." -ForegroundColor Yellow
try {
    $models = Invoke-RestMethod -Uri "$BASE_URL/vehicle/masters/models" -Method GET
    Write-Host "✓ Retrieved $($models.Count) models" -ForegroundColor Green
    if ($models.Count -gt 0) {
        $variantId = $models[0].variants[0].id
        Write-Host "  Sample: $($models[0].make.name) $($models[0].name) $($models[0].variants[0].name)" -ForegroundColor Gray
    }
} catch {
    Write-Host "✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Vehicle Lookup (non-existent)
Write-Host "`n4. Testing Vehicle Lookup (non-existent)..." -ForegroundColor Yellow
try {
    $vehicle = Invoke-RestMethod -Uri "$BASE_URL/vehicle/lookup/TEST123" -Method GET
    Write-Host "✗ Unexpected: Vehicle found" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 404) {
        Write-Host "✓ Correctly returned 404 for non-existent vehicle" -ForegroundColor Green
    } else {
        Write-Host "✗ Unexpected error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 5: Register Vehicle
Write-Host "`n5. Testing Vehicle Registration..." -ForegroundColor Yellow
if ($variantId) {
    $vehicleBody = @{
        regNumber = "KA01TEST123"
        variantId = $variantId
        mfgYear = 2020
    } | ConvertTo-Json

    try {
        $vehicleResponse = Invoke-RestMethod -Uri "$BASE_URL/vehicle/register" -Method POST -Body $vehicleBody -ContentType "application/json"
        Write-Host "✓ Vehicle registered: $($vehicleResponse.regNumber)" -ForegroundColor Green
    } catch {
        Write-Host "✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 6: Dashboard KPIs (with dummy workshopId)
Write-Host "`n6. Testing Dashboard KPIs..." -ForegroundColor Yellow
try {
    $kpis = Invoke-RestMethod -Uri "$BASE_URL/dashboard/kpis?workshopId=test-workshop-id" -Method GET
    Write-Host "✓ KPIs retrieved successfully" -ForegroundColor Green
    Write-Host "  Vehicles In: $($kpis.vehiclesIn)" -ForegroundColor Gray
    Write-Host "  Jobs In Progress: $($kpis.jobsInProgress)" -ForegroundColor Gray
    Write-Host "  Revenue: $($kpis.revenue)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 7: Job Funnel
Write-Host "`n7. Testing Job Status Funnel..." -ForegroundColor Yellow
try {
    $funnel = Invoke-RestMethod -Uri "$BASE_URL/dashboard/job-funnel?workshopId=test-workshop-id" -Method GET
    Write-Host "✓ Job funnel retrieved: $($funnel.Count) stages" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 8: Revenue Graph
Write-Host "`n8. Testing Revenue Graph..." -ForegroundColor Yellow
try {
    $revenue = Invoke-RestMethod -Uri "$BASE_URL/dashboard/revenue-graph?workshopId=test-workshop-id&days=7" -Method GET
    Write-Host "✓ Revenue graph retrieved: $($revenue.Count) days" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 9: Top Services
Write-Host "`n9. Testing Top Services..." -ForegroundColor Yellow
try {
    $services = Invoke-RestMethod -Uri "$BASE_URL/dashboard/top-services?workshopId=test-workshop-id&limit=5" -Method GET
    Write-Host "✓ Top services retrieved: $($services.Count) services" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 10: Get Inventory Items
Write-Host "`n10. Testing Get Inventory Items..." -ForegroundColor Yellow
try {
    $items = Invoke-RestMethod -Uri "$BASE_URL/inventory/items?workshopId=test-workshop-id" -Method GET
    Write-Host "✓ Inventory items retrieved: $($items.Count) items" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n==================================" -ForegroundColor Cyan
Write-Host "Test Suite Complete" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
