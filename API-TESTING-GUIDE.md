# Complete API Testing Guide

This guide lists **ALL** available APIs in the Digital Iskole backend and shows you how to test each one, step by step.

**Base URL:** `http://localhost:3001/api`  
**Health Check:** `http://localhost:3001/health` (No `/api` prefix)

---

## 🔐 Authentication Endpoints (✅ FULLY IMPLEMENTED)

These endpoints are **fully functional** and ready to use.

### 1. Health Check Endpoint

**Status:** ✅ Implemented  
**Endpoint:** `GET /health`  
**Auth Required:** ❌ No  
**Rate Limit:** ❌ No

**Test with PowerShell:**
```powershell
Invoke-WebRequest -Uri http://localhost:3001/health -UseBasicParsing | Select-Object -ExpandProperty Content
```

**Test with Browser:**
Open: `http://localhost:3001/health`

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-01-10T18:49:56.693Z",
  "uptime": 658.2971052
}
```

---

### 2. Login

**Status:** ✅ Fully Implemented  
**Endpoint:** `POST /api/auth/login`  
**Auth Required:** ❌ No  
**Rate Limit:** ✅ Yes (5 requests per 15 minutes)

**Test with PowerShell:**
```powershell
$body = @{
    email = "admin@digitaliskole.lk"
    password = "Admin@123456"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri http://localhost:3001/api/auth/login -Method POST -Body $body -ContentType "application/json"
$response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

**Test with Browser DevTools (Network Tab):**
1. Open `http://localhost:3000`
2. Press `F12` → Network tab
3. Log in with credentials
4. Find the request to `/api/auth/login`
5. Check Request Payload and Response

**Expected Response (Success):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-id-here",
      "email": "admin@digitaliskole.lk",
      "name": "Admin User",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 86400
  },
  "message": "Login successful",
  "timestamp": "2026-01-10T18:35:39.000Z"
}
```

**Test with Invalid Credentials:**
```powershell
$body = @{
    email = "wrong@email.com"
    password = "wrongpassword"
} | ConvertTo-Json

try {
    Invoke-WebRequest -Uri http://localhost:3001/api/auth/login -Method POST -Body $body -ContentType "application/json"
} catch {
    $_.Exception.Response.StatusCode
    $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
    $reader.ReadToEnd() | ConvertFrom-Json | ConvertTo-Json
}
```

**Expected Response (Error):**
```json
{
  "success": false,
  "error": {
    "code": "AUTH_INVALID_CREDENTIALS",
    "message": "Invalid email or password"
  },
  "timestamp": "2026-01-10T18:35:39.000Z"
}
```

**⚠️ Important:** Save the `token` from the response - you'll need it for protected endpoints!

---

### 3. Get Current User (Me)

**Status:** ✅ Fully Implemented  
**Endpoint:** `GET /api/auth/me`  
**Auth Required:** ✅ Yes (Bearer Token)  
**Rate Limit:** ✅ Yes

**First, get a token by logging in (see #2), then:**

**Test with PowerShell:**
```powershell
$token = "YOUR_TOKEN_FROM_LOGIN_RESPONSE"
$headers = @{
    Authorization = "Bearer $token"
    ContentType = "application/json"
}

Invoke-WebRequest -Uri http://localhost:3001/api/auth/me -Method GET -Headers $headers | Select-Object -ExpandProperty Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-id-here",
      "email": "admin@digitaliskole.lk",
      "name": "Admin User",
      "role": "admin",
      "phone": null,
      "profilePicture": null
    }
  },
  "message": "User retrieved successfully",
  "timestamp": "2026-01-10T18:35:39.000Z"
}
```

**Test without Token (Should Fail):**
```powershell
try {
    Invoke-WebRequest -Uri http://localhost:3001/api/auth/me -Method GET
} catch {
    Write-Output "Status: $($_.Exception.Response.StatusCode)"
    $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
    $reader.ReadToEnd() | ConvertFrom-Json | ConvertTo-Json
}
```

**Expected Response (Error - 401):**
```json
{
  "success": false,
  "error": {
    "code": "AUTH_TOKEN_INVALID",
    "message": "Authorization token required"
  },
  "timestamp": "2026-01-10T18:35:39.000Z"
}
```

---

### 4. Logout

**Status:** ✅ Fully Implemented  
**Endpoint:** `POST /api/auth/logout`  
**Auth Required:** ✅ Yes (Bearer Token)  
**Rate Limit:** ✅ Yes

**Test with PowerShell:**
```powershell
$token = "YOUR_TOKEN_FROM_LOGIN_RESPONSE"
$headers = @{
    Authorization = "Bearer $token"
    ContentType = "application/json"
}

Invoke-WebRequest -Uri http://localhost:3001/api/auth/logout -Method POST -Headers $headers | Select-Object -ExpandProperty Content | ConvertFrom-Json | ConvertTo-Json
```

**Expected Response:**
```json
{
  "success": true,
  "data": null,
  "message": "Logout successful",
  "timestamp": "2026-01-10T18:35:39.000Z"
}
```

---

### 5. Refresh Token

**Status:** ✅ Fully Implemented  
**Endpoint:** `POST /api/auth/refresh`  
**Auth Required:** ❌ No (but needs refreshToken)  
**Rate Limit:** ✅ Yes (5 requests per 15 minutes)

**Test with PowerShell:**
```powershell
# First, login to get refreshToken
$loginBody = @{
    email = "admin@digitaliskole.lk"
    password = "Admin@123456"
} | ConvertTo-Json

$loginResponse = Invoke-WebRequest -Uri http://localhost:3001/api/auth/login -Method POST -Body $loginBody -ContentType "application/json"
$loginData = $loginResponse.Content | ConvertFrom-Json
$refreshToken = $loginData.data.refreshToken

# Now refresh the token
$refreshBody = @{
    refreshToken = $refreshToken
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:3001/api/auth/refresh -Method POST -Body $refreshBody -ContentType "application/json" | Select-Object -ExpandProperty Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Token refreshed successfully",
  "timestamp": "2026-01-10T18:35:39.000Z"
}
```

---

### 6. Forgot Password

**Status:** ✅ Fully Implemented (Sends reset link)  
**Endpoint:** `POST /api/auth/forgot-password`  
**Auth Required:** ❌ No  
**Rate Limit:** ✅ Yes (5 requests per 15 minutes)

**Test with PowerShell:**
```powershell
$body = @{
    email = "admin@digitaliskole.lk"
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:3001/api/auth/forgot-password -Method POST -Body $body -ContentType "application/json" | Select-Object -ExpandProperty Content | ConvertFrom-Json | ConvertTo-Json
```

**Expected Response:**
```json
{
  "success": true,
  "data": null,
  "message": "If the email exists, a password reset link has been sent",
  "timestamp": "2026-01-10T18:35:39.000Z"
}
```

---

### 7. Reset Password

**Status:** ⚠️ Partially Implemented (Placeholder)  
**Endpoint:** `POST /api/auth/reset-password`  
**Auth Required:** ❌ No (needs reset token)  
**Rate Limit:** ✅ Yes

**Test with PowerShell:**
```powershell
$body = @{
    token = "reset-token-from-email"
    newPassword = "NewPassword@123"
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:3001/api/auth/reset-password -Method POST -Body $body -ContentType "application/json" | Select-Object -ExpandProperty Content | ConvertFrom-Json | ConvertTo-Json
```

**Note:** This endpoint is implemented but password reset flow needs email integration.

---

### 8. Change Password

**Status:** ✅ Fully Implemented  
**Endpoint:** `POST /api/auth/change-password`  
**Auth Required:** ✅ Yes (Bearer Token)  
**Rate Limit:** ✅ Yes

**Test with PowerShell:**
```powershell
$token = "YOUR_TOKEN_FROM_LOGIN_RESPONSE"
$headers = @{
    Authorization = "Bearer $token"
    ContentType = "application/json"
}

$body = @{
    currentPassword = "Admin@123456"
    newPassword = "NewPassword@123"
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:3001/api/auth/change-password -Method POST -Body $body -Headers $headers | Select-Object -ExpandProperty Content | ConvertFrom-Json | ConvertTo-Json
```

**Expected Response:**
```json
{
  "success": true,
  "data": null,
  "message": "Password changed successfully",
  "timestamp": "2026-01-10T18:35:39.000Z"
}
```

---

## 🚧 Placeholder Endpoints (⚠️ NOT YET IMPLEMENTED)

The following endpoints **exist** but return placeholder messages. They are **skeleton routes** ready for implementation.

### User Management Endpoints

All return: `{"message": "XXX - to be implemented"}`

#### Teachers
- `GET /api/users/teachers` - Teachers list
- `POST /api/users/teachers` - Create teacher
- `GET /api/users/teachers/:id` - Get teacher
- `PUT /api/users/teachers/:id` - Update teacher
- `DELETE /api/users/teachers/:id` - Delete teacher
- `GET /api/users/teachers/available` - Available teachers
- `GET /api/users/teachers/:id/students` - Teacher's students

**Test Example:**
```powershell
$token = "YOUR_TOKEN"
$headers = @{ Authorization = "Bearer $token" }

Invoke-WebRequest -Uri http://localhost:3001/api/users/teachers -Method GET -Headers $headers | Select-Object -ExpandProperty Content
# Returns: {"message": "Teachers list - to be implemented"}
```

#### Students
- `GET /api/users/students` - Students list
- `POST /api/users/students` - Create student
- `GET /api/users/students/:id` - Get student
- `PUT /api/users/students/:id` - Update student
- `DELETE /api/users/students/:id` - Delete student
- `GET /api/users/students/class/:classId` - Students by class
- `GET /api/users/students/:id/stats` - Student stats
- `GET /api/users/students/:id/attendance` - Student attendance
- `GET /api/users/students/:id/marks` - Student marks

#### Parents
- `GET /api/users/parents` - Parents list
- `POST /api/users/parents` - Create parent
- `GET /api/users/parents/:id` - Get parent
- `PUT /api/users/parents/:id` - Update parent
- `DELETE /api/users/parents/:id` - Delete parent
- `GET /api/users/parents/:id/children` - Parent's children
- `POST /api/users/parents/:id/children` - Link child
- `DELETE /api/users/parents/:id/children/:studentId` - Unlink child

---

### Academic Management Endpoints

#### Classes
- `GET /api/academic/classes` - Classes list
- `POST /api/academic/classes` - Create class
- `GET /api/academic/classes/:id` - Get class
- `PUT /api/academic/classes/:id` - Update class
- `DELETE /api/academic/classes/:id` - Delete class
- `GET /api/academic/classes/:id/students` - Class students
- `GET /api/academic/classes/:id/stats` - Class stats
- `POST /api/academic/classes/:id/assign-teacher` - Assign teacher

#### Subjects
- `GET /api/academic/subjects` - Subjects list
- `POST /api/academic/subjects` - Create subject
- `GET /api/academic/subjects/:id` - Get subject
- `PUT /api/academic/subjects/:id` - Update subject
- `DELETE /api/academic/subjects/:id` - Delete subject
- `GET /api/academic/subjects/grade/:grade` - Subjects by grade

---

### Attendance Endpoints

- `GET /api/attendance` - Get attendance
- `POST /api/attendance/mark` - Mark attendance
- `PUT /api/attendance/:studentId` - Update attendance
- `GET /api/attendance/student/:id` - Student attendance
- `GET /api/attendance/student/:id/stats` - Student attendance stats
- `GET /api/attendance/class/:id/summary` - Class attendance summary
- `GET /api/attendance/reports/daily` - Daily attendance report
- `GET /api/attendance/reports/monthly` - Monthly attendance report

---

### Exams Endpoints

- `GET /api/exams` - Exams list
- `POST /api/exams` - Create exam
- `GET /api/exams/:id` - Get exam
- `PUT /api/exams/:id` - Update exam
- `DELETE /api/exams/:id` - Delete exam
- `GET /api/exams/upcoming` - Upcoming exams
- `GET /api/exams/:id/results` - Exam results

---

### Marks Endpoints

- `GET /api/marks/exam/:examId` - Marks by exam
- `GET /api/marks/student/:id` - Student marks
- `POST /api/marks/enter` - Enter marks
- `PUT /api/marks/:id` - Update mark
- `POST /api/marks/upload-paper` - Upload exam paper
- `GET /api/marks/paper/:studentId/:examId` - Get exam paper
- `DELETE /api/marks/paper/:studentId/:examId` - Delete exam paper
- `GET /api/marks/class/:id/summary` - Class marks summary
- `GET /api/marks/report-card/:studentId` - Report card

---

### Appointments Endpoints

- `GET /api/appointments` - Appointments list
- `POST /api/appointments` - Create appointment
- `GET /api/appointments/:id` - Get appointment
- `PATCH /api/appointments/:id/status` - Update appointment status
- `PATCH /api/appointments/:id/cancel` - Cancel appointment
- `GET /api/appointments/teacher` - Teacher appointments
- `GET /api/appointments/parent` - Parent appointments
- `GET /api/appointments/pending/count` - Pending count
- `GET /api/appointments/available-slots` - Available slots

---

### Notices Endpoints

- `GET /api/notices` - Notices list
- `POST /api/notices` - Create notice
- `GET /api/notices/:id` - Get notice
- `PUT /api/notices/:id` - Update notice
- `DELETE /api/notices/:id` - Delete notice
- `GET /api/notices/recent` - Recent notices
- `GET /api/notices/user` - User notices

---

### Notifications Endpoints

- `GET /api/notifications` - Notifications list
- `GET /api/notifications/unread/count` - Unread count
- `PATCH /api/notifications/:id/read` - Mark as read
- `PATCH /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification
- `DELETE /api/notifications/all` - Delete all notifications
- `GET /api/notifications/recent` - Recent notifications
- `POST /api/notifications/subscribe` - Subscribe to push
- `POST /api/notifications/unsubscribe` - Unsubscribe from push

---

### Reports Endpoints

- `GET /api/reports` - Reports list
- `GET /api/reports/:id` - Get report
- `POST /api/reports/student` - Generate student report
- `POST /api/reports/class` - Generate class report
- `POST /api/reports/school` - Generate school report
- `GET /api/reports/:id/download` - Download report
- `DELETE /api/reports/:id` - Delete report
- `GET /api/reports/:id/status` - Report status
- `GET /api/reports/my` - My reports

---

### Settings Endpoints

- `GET /api/settings/grading` - Get grading scale
- `PUT /api/settings/grading` - Update grading scale
- `GET /api/settings/academic-years` - Academic years list
- `POST /api/settings/academic-years` - Create academic year
- `PUT /api/settings/academic-years/:id` - Update academic year
- `DELETE /api/settings/academic-years/:id` - Delete academic year
- `PATCH /api/settings/academic-years/:id/set-current` - Set current academic year
- `GET /api/settings/academic-years/current` - Get current academic year
- `GET /api/settings/preferences` - Get preferences
- `PUT /api/settings/preferences` - Update preferences

---

### Upload Endpoints

- `POST /api/upload/profile-picture` - Upload profile picture
- `POST /api/upload/exam-paper` - Upload exam paper
- `POST /api/upload/notice-attachment` - Upload notice attachment
- `DELETE /api/upload/:id` - Delete file
- `GET /api/upload/:id/signed-url` - Get signed URL

---

## 📊 Summary

### ✅ Fully Implemented (Ready to Use):
- Health Check
- Login
- Get Current User (Me)
- Logout
- Refresh Token
- Forgot Password
- Change Password
- Reset Password (Partial)

### ⚠️ Placeholders (Return "to be implemented"):
- **112+ endpoints** across all modules
- All routes exist and are accessible
- Authentication/Authorization middleware is in place
- Rate limiting is configured
- Validation middleware is set up
- But actual business logic is not implemented yet

---

## 🧪 Quick Test Script for All Placeholder Endpoints

Here's a PowerShell script to test all placeholder endpoints at once:

```powershell
# Set your token first
$token = "YOUR_TOKEN_FROM_LOGIN"
$headers = @{ Authorization = "Bearer $token" }
$baseUrl = "http://localhost:3001/api"

# Test all placeholder endpoints
$endpoints = @(
    "/users/teachers",
    "/users/students",
    "/users/parents",
    "/academic/classes",
    "/academic/subjects",
    "/attendance",
    "/exams",
    "/marks/exam/123",
    "/appointments",
    "/notices",
    "/notifications",
    "/reports",
    "/settings/grading"
)

foreach ($endpoint in $endpoints) {
    try {
        $response = Invoke-WebRequest -Uri "$baseUrl$endpoint" -Method GET -Headers $headers -ErrorAction Stop
        Write-Host "✅ $endpoint : OK" -ForegroundColor Green
        Write-Host "   Response: $($response.Content.Substring(0, [Math]::Min(100, $response.Content.Length)))" -ForegroundColor Gray
    } catch {
        Write-Host "❌ $endpoint : $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
}
```

---

## 📝 Notes

1. **Authentication:** Most endpoints require `Authorization: Bearer <token>` header
2. **Rate Limiting:** Some endpoints have rate limits (check response headers)
3. **Error Format:** All errors follow standard format with `success: false`
4. **CORS:** Configured for `http://localhost:3000`
5. **Validation:** Request validation is in place for implemented endpoints

---

## 🔄 Next Steps

To implement the placeholder endpoints:
1. Create service classes (e.g., `UsersService`, `ExamsService`)
2. Implement business logic
3. Update route handlers to call services
4. Add Firestore database operations
5. Test each endpoint thoroughly
