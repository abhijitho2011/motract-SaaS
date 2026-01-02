$ErrorActionPreference = "Stop"
$BaseUrl = "https://motract-backend-5sct.onrender.com"
$LogFile = "d:/Motract-SaaS/backend/verification_log.txt"

function Log-Result {
    param([string]$Message, [string]$Type = "INFO")
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $Line = "[$Timestamp] [$Type] $Message"
    Write-Host $Line -ForegroundColor (Switch ($Type) { "SUCCESS" { "Green" } "ERROR" { "Red" } "INFO" { "Cyan" } Default { "White" } })
    Add-Content -Path $LogFile -Value $Line
}

Log-Result "Starting Final Verification for Motract Backend..."

try {
    # 1. Database & Seed Data Check (Vehicle Models)
    Log-Result "1. Checking Database Connectivity & Seed Data (Vehicle Models)..."
    $Models = Invoke-RestMethod -Uri "$BaseUrl/vehicle/masters/models" -Method Get
    if ($Models.Count -gt 0) {
        Log-Result "Database Connected & Seeded. Found $($Models.Count) Models." "SUCCESS"
        Log-Result "Sample: $($Models[0].make.name) - $($Models[0].name)" "INFO"
    }
    else {
        throw "Database appears empty or not seeded."
    }

    # 2. Authentication Flow
    Log-Result "2. Testing Authentication (Register & Login)..."
    $Rand = Get-Random -Minimum 1000 -Maximum 9999
    $Mobile = "987654$Rand"
    $UserPayload = @{
        mobile   = $Mobile
        password = "password123"
        role     = "WORKSHOP_ADMIN"
        name     = "Verification Admin $Rand"
    } | ConvertTo-Json

    Log-Result "Registering User: $Mobile..." "INFO"
    $RegisterRes = Invoke-RestMethod -Uri "$BaseUrl/auth/register" -Method Post -Body $UserPayload -ContentType "application/json"
    Log-Result "User Registered. ID: $($RegisterRes.id)" "SUCCESS"

    $LoginPayload = @{
        mobile   = $Mobile
        password = "password123"
    } | ConvertTo-Json

    Log-Result "Logging In..." "INFO"
    $LoginRes = Invoke-RestMethod -Uri "$BaseUrl/auth/login" -Method Post -Body $LoginPayload -ContentType "application/json"
    $Token = $LoginRes.access_token

    if ($Token) {
        Log-Result "Login Successful. Token received." "SUCCESS"
    }
    else {
        throw "Login failed. No token received."
    }

    # 3. Dashboard Module
    Log-Result "3. Testing Dashboard Module..."
    $Kpis = Invoke-RestMethod -Uri "$BaseUrl/dashboard/kpis?workshopId=test-workshop" -Method Get
    if ($null -ne $Kpis) {
        Log-Result "Dashboard KPIs retrieved." "SUCCESS"
    }
    else {
        throw "Failed to retrieve Dashboard KPIs."
    }

    # 4. Inventory Module
    Log-Result "4. Testing Inventory Module..."
    $Inventory = Invoke-RestMethod -Uri "$BaseUrl/inventory/items?workshopId=test-workshop" -Method Get
    Log-Result "Inventory Endpoint Accessible. Count: $($Inventory.Count)" "SUCCESS"

    # 5. Purchase Module (Previously problematic)
    Log-Result "5. Testing Purchase Module..."
    $Suppliers = Invoke-RestMethod -Uri "$BaseUrl/purchase/suppliers?workshopId=test-workshop" -Method Get
    Log-Result "Purchase Suppliers Endpoint Accessible. Count: $($Suppliers.Count)" "SUCCESS"

    Log-Result "==========================================" "INFO"
    Log-Result "ALL CHECKS PASSED. BACKEND IS FULLY OPERATIONAL." "SUCCESS"
    Log-Result "==========================================" "INFO"

}
catch {
    Log-Result "Verification Failed: $($_.Exception.Message)" "ERROR"
    if ($_.Exception.Response) {
        $Stream = $_.Exception.Response.GetResponseStream()
        $Reader = New-Object System.IO.StreamReader($Stream)
        $Body = $Reader.ReadToEnd()
        Log-Result "Server Response: $Body" "ERROR"
    }
}
