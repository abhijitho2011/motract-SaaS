$body = @{
    apiToken  = "0ff76688c1f913c6bac93e75fda2f01965c96c84"
    expiresAt = "2026-01-04T23:23:00Z"
} | ConvertTo-Json

$response = Invoke-WebRequest `
    -Uri "https://motract-backend-5sct.onrender.com/super-admin/map-settings" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"

Write-Output $response.Content
