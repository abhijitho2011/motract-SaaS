$random = Get-Random -Minimum 1000 -Maximum 9999
$mobile = "987654$random"
$password = "testPass$random"

Write-Host "--- 1. Registering User ($mobile) ---"
$regBody = @{
    mobile   = $mobile
    password = $password
    role     = "WORKSHOP_ADMIN"
    name     = "Test User $random"
} | ConvertTo-Json

try {
    $regResponse = Invoke-WebRequest -Uri "https://motract-backend-5sct.onrender.com/auth/register" -Method POST -Body $regBody -ContentType "application/json"
    Write-Host "Registration Success: $($regResponse.StatusCode)"
}
catch {
    Write-Host "Registration Failed: $_"
    exit
}

Write-Host "`n--- 2. Logging In ---"
$loginBody = @{
    mobile   = $mobile
    password = $password
} | ConvertTo-Json

try {
    $loginResponse = Invoke-WebRequest -Uri "https://motract-backend-5sct.onrender.com/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    $tokenData = $loginResponse.Content | ConvertFrom-Json
    $token = $tokenData.access_token
    Write-Host "Login Success. Token length: $($token.Length)"
}
catch {
    Write-Host "Login Failed: $_"
    exit
}

Write-Host "`n--- 3. Testing /purchase/orders (Authenticated) ---"
try {
    $headers = @{ Authorization = "Bearer $token" }
    $poResponse = Invoke-WebRequest -Uri "https://motract-backend-5sct.onrender.com/purchase/orders" -Method GET -Headers $headers
    Write-Host "Purchase Orders Response: $($poResponse.StatusCode)"
    Write-Host "Data: $($poResponse.Content)"
}
catch {
    Write-Host "Purchase Orders Failed: $_"
    if ($_.Exception.Response) {
        Write-Host "Status: $($_.Exception.Response.StatusCode)"
    }
}
