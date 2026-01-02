$body = @{
    mobile   = "9876543210"
    password = "admin123"
    name     = "Workshop Admin"
    role     = "WORKSHOP_ADMIN"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "https://motract-backend-5sct.onrender.com/auth/register" -Method POST -Body $body -ContentType "application/json"
$response | ConvertTo-Json
