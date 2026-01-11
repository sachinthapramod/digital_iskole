# Comprehensive API Endpoint Testing Script
# Run this script to test all backend endpoints

$baseUrl = "http://localhost:3001/api"
$results = @()

Write-Host "=== Backend API Endpoint Testing ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Test Health Check
Write-Host "1. Testing Health Check..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/health" -UseBasicParsing -ErrorAction Stop
    $results += @{Endpoint="GET /health"; Status="✅ PASS"; Code=$response.StatusCode; Note="Working"}
    Write-Host "   ✅ PASS - Status: $($response.StatusCode)" -ForegroundColor Green
} catch {
    $results += @{Endpoint="GET /health"; Status="❌ FAIL"; Code=$_.Exception.Response.StatusCode; Note=$_.Exception.Message}
    Write-Host "   ❌ FAIL - $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Step 2: Login to get token
Write-Host "2. Testing Login..." -ForegroundColor Yellow
$token = $null
try {
    $loginBody = @{
        email = "admin@digitaliskole.lk"
        password = "Admin@123456"
    } | ConvertTo-Json

    $loginResponse = Invoke-WebRequest -Uri "$baseUrl/auth/login" -Method POST -Body $loginBody -ContentType "application/json" -ErrorAction Stop
    $loginData = $loginResponse.Content | ConvertFrom-Json
    
    if ($loginData.success) {
        $token = $loginData.data.token
        $results += @{Endpoint="POST /api/auth/login"; Status="✅ PASS"; Code=$loginResponse.StatusCode; Note="Working"}
        Write-Host "   ✅ PASS - Token received" -ForegroundColor Green
    } else {
        $results += @{Endpoint="POST /api/auth/login"; Status="❌ FAIL"; Code=$loginResponse.StatusCode; Note="Login failed"}
        Write-Host "   ❌ FAIL - Login unsuccessful" -ForegroundColor Red
    }
} catch {
    $results += @{Endpoint="POST /api/auth/login"; Status="❌ FAIL"; Code=$_.Exception.Response.StatusCode.value__; Note=$_.Exception.Message}
    Write-Host "   ❌ FAIL - $($_.Exception.Message)" -ForegroundColor Red
}

if (-not $token) {
    Write-Host ""
    Write-Host "⚠️  Cannot continue testing protected endpoints without token" -ForegroundColor Yellow
    Write-Host "   Please check your login credentials" -ForegroundColor Yellow
    exit
}

Write-Host ""
Write-Host "3. Testing Protected Endpoints..." -ForegroundColor Yellow
Write-Host ""

$headers = @{
    Authorization = "Bearer $token"
    ContentType = "application/json"
}

# Test Auth Endpoints
$authEndpoints = @(
    @{Method="GET"; Path="/auth/me"; Name="Get Current User"},
    @{Method="POST"; Path="/auth/logout"; Name="Logout"; Body=$null}
)

foreach ($endpoint in $authEndpoints) {
    try {
        $params = @{
            Uri = "$baseUrl$($endpoint.Path)"
            Method = $endpoint.Method
            Headers = $headers
            ErrorAction = "Stop"
        }
        
        if ($endpoint.Body) {
            $params.Body = $endpoint.Body
        }
        
        $response = Invoke-WebRequest @params -UseBasicParsing
        $data = $response.Content | ConvertFrom-Json
        
        if ($data.message -like "*to be implemented*") {
            $results += @{Endpoint="$($endpoint.Method) $($endpoint.Path)"; Status="⚠️  PLACEHOLDER"; Code=$response.StatusCode; Note="Returns placeholder message"}
            Write-Host "   ⚠️  $($endpoint.Name) - Placeholder" -ForegroundColor Yellow
        } else {
            $results += @{Endpoint="$($endpoint.Method) $($endpoint.Path)"; Status="✅ PASS"; Code=$response.StatusCode; Note="Working"}
            Write-Host "   ✅ $($endpoint.Name) - OK" -ForegroundColor Green
        }
    } catch {
        $statusCode = if ($_.Exception.Response) { $_.Exception.Response.StatusCode.value__ } else { "N/A" }
        $results += @{Endpoint="$($endpoint.Method) $($endpoint.Path)"; Status="❌ FAIL"; Code=$statusCode; Note=$_.Exception.Message}
        Write-Host "   ❌ $($endpoint.Name) - FAILED: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "4. Testing Placeholder Endpoints (Sample)..." -ForegroundColor Yellow
Write-Host ""

# Test sample placeholder endpoints
$placeholderEndpoints = @(
    @{Method="GET"; Path="/users/teachers"; Name="Teachers List"},
    @{Method="GET"; Path="/users/students"; Name="Students List"},
    @{Method="GET"; Path="/users/parents"; Name="Parents List"},
    @{Method="GET"; Path="/academic/classes"; Name="Classes List"},
    @{Method="GET"; Path="/attendance"; Name="Attendance"},
    @{Method="GET"; Path="/exams"; Name="Exams List"},
    @{Method="GET"; Path="/notices"; Name="Notices List"},
    @{Method="GET"; Path="/notifications"; Name="Notifications List"}
)

foreach ($endpoint in $placeholderEndpoints) {
    try {
        $response = Invoke-WebRequest -Uri "$baseUrl$($endpoint.Path)" -Method GET -Headers $headers -UseBasicParsing -ErrorAction Stop
        $data = $response.Content | ConvertFrom-Json
        
        if ($data.message -like "*to be implemented*") {
            $results += @{Endpoint="$($endpoint.Method) $($endpoint.Path)"; Status="⚠️  PLACEHOLDER"; Code=$response.StatusCode; Note="Returns placeholder message"}
            Write-Host "   ⚠️  $($endpoint.Name) - Placeholder" -ForegroundColor Yellow
        } else {
            $results += @{Endpoint="$($endpoint.Method) $($endpoint.Path)"; Status="✅ IMPLEMENTED"; Code=$response.StatusCode; Note="Has implementation"}
            Write-Host "   ✅ $($endpoint.Name) - Implemented" -ForegroundColor Green
        }
    } catch {
        $statusCode = if ($_.Exception.Response) { $_.Exception.Response.StatusCode.value__ } else { "N/A" }
        $results += @{Endpoint="$($endpoint.Method) $($endpoint.Path)"; Status="❌ FAIL"; Code=$statusCode; Note=$_.Exception.Message}
        Write-Host "   ❌ $($endpoint.Name) - FAILED: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=== Test Summary ===" -ForegroundColor Cyan
Write-Host ""

$passed = ($results | Where-Object { $_.Status -eq "✅ PASS" }).Count
$placeholder = ($results | Where-Object { $_.Status -eq "⚠️  PLACEHOLDER" }).Count
$failed = ($results | Where-Object { $_.Status -eq "❌ FAIL" }).Count

Write-Host "✅ Working: $passed" -ForegroundColor Green
Write-Host "⚠️  Placeholder: $placeholder" -ForegroundColor Yellow
Write-Host "❌ Failed: $failed" -ForegroundColor Red
Write-Host ""

# Detailed results table
Write-Host "Detailed Results:" -ForegroundColor Cyan
$results | Format-Table -AutoSize

Write-Host ""
Write-Host "=== Frontend Integration Check ===" -ForegroundColor Cyan
Write-Host ""

# Check frontend services
$frontendServices = @(
    @{File="lib/services/students.ts"; Uses="Firebase Direct"},
    @{File="lib/services/notices.ts"; Uses="Firebase Direct"},
    @{File="lib/services/appointments.ts"; Uses="Firebase Direct"},
    @{File="lib/services/attendance.ts"; Uses="Firebase Direct"},
    @{File="lib/services/marks.ts"; Uses="Firebase Direct"},
    @{File="lib/services/notifications.ts"; Uses="Firebase Direct"},
    @{File="lib/auth/context.tsx"; Uses="Backend API ✅"}
)

Write-Host "Frontend Service Integration Status:" -ForegroundColor Yellow
foreach ($service in $frontendServices) {
    Write-Host "   $($service.File): $($service.Uses)" -ForegroundColor $(if ($service.Uses -like "*Backend*") { "Green" } else { "Red" })
}

Write-Host ""
Write-Host "⚠️  ISSUE FOUND: Most frontend services use Firebase directly instead of backend API" -ForegroundColor Red
Write-Host "   See API-INTEGRATION-CHECK.md for details and recommendations" -ForegroundColor Yellow
