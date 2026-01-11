# How to Test Backend APIs with Frontend

This guide shows you multiple ways to verify that your backend APIs are working correctly with your frontend.

---

## Method 1: Browser DevTools (Easiest - Real-time)

### Steps:

1. **Open your frontend application** in the browser:
   ```
   http://localhost:3000
   ```

2. **Open Developer Tools**:
   - Press `F12` or `Ctrl+Shift+I` (Windows/Linux)
   - Or `Cmd+Option+I` (Mac)
   - Or right-click → Inspect

3. **Go to the Network tab**

4. **Perform actions in your app**:
   - Login
   - Navigate to different pages
   - Click buttons that trigger API calls

5. **Check the Network tab**:
   - You should see API requests to `http://localhost:3001/api/...`
   - Click on any request to see:
     - **Request**: Method, URL, Headers, Payload
     - **Response**: Status code, Response body, Headers, Timing

### What to Look For:

✅ **Success Indicators:**
- Status code: `200 OK` (green)
- Response body contains `success: true`
- Response has data (user info, tokens, etc.)

❌ **Error Indicators:**
- Status code: `400`, `401`, `403`, `500` (red)
- CORS errors (blocked by browser)
- Network errors (backend not running)

### Example - Login Request:

**Request:**
```
POST http://localhost:3001/api/auth/login
Content-Type: application/json

{
  "email": "admin@digitaliskole.lk",
  "password": "your-password"
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "email": "admin@digitaliskole.lk",
      "name": "Admin User",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "...",
    "expiresIn": 86400
  },
  "message": "Login successful",
  "timestamp": "2026-01-10T18:35:39.000Z"
}
```

---

## Method 2: Backend Server Logs

### Steps:

1. **Open the terminal where your backend server is running**
2. **Look for incoming requests** in the console output

### What to Look For:

✅ **Success Indicators:**
```
[info]: POST /api/auth/login
[info]: Status: 200
```

❌ **Error Indicators:**
```
[error]: POST /api/auth/login
[error]: Status: 401
[error]: Invalid email or password
```

### Enable Detailed Logging:

The backend already has logging enabled. You should see:
- Request method and path
- Request headers
- Response status
- Error messages (if any)

---

## Method 3: Test API Endpoints Directly (curl/Postman)

### Option A: Using curl (Command Line)

#### 1. Test Health Endpoint (No Auth Required):
```bash
curl http://localhost:3001/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-01-10T18:35:39.000Z",
  "uptime": 123.45
}
```

#### 2. Test Login Endpoint:
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@digitaliskole.lk\",\"password\":\"your-password\"}"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "user": {...},
    "token": "...",
    "refreshToken": "...",
    "expiresIn": 86400
  }
}
```

#### 3. Test Protected Endpoint (Requires Auth Token):

First, login and copy the token from the response, then:

```bash
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

#### 4. Test with PowerShell (Windows):

**Health Check:**
```powershell
Invoke-WebRequest -Uri http://localhost:3001/health -Method GET | Select-Object -ExpandProperty Content
```

**Login:**
```powershell
$body = @{
    email = "admin@digitaliskole.lk"
    password = "your-password"
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:3001/api/auth/login -Method POST -Body $body -ContentType "application/json" | Select-Object -ExpandProperty Content
```

**Protected Endpoint (Get Current User):**
```powershell
$token = "YOUR_TOKEN_HERE"
$headers = @{
    Authorization = "Bearer $token"
    ContentType = "application/json"
}

Invoke-WebRequest -Uri http://localhost:3001/api/auth/me -Method GET -Headers $headers | Select-Object -ExpandProperty Content
```

### Option B: Using Postman

1. **Download Postman**: https://www.postman.com/downloads/

2. **Create a new request**:
   - Method: `POST`
   - URL: `http://localhost:3001/api/auth/login`
   - Headers: `Content-Type: application/json`
   - Body (raw JSON):
     ```json
     {
       "email": "admin@digitaliskole.lk",
       "password": "your-password"
     }
     ```

3. **Send the request** and check the response

4. **For protected endpoints**, add Authorization header:
   - Type: `Bearer Token`
   - Token: (paste the token from login response)

---

## Method 4: Create a Test Page in Frontend

Create a simple test page to verify API connectivity:

### Create `app/test-api/page.tsx`:

```tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export default function TestAPIPage() {
  const [results, setResults] = useState<any>({})
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

  const testHealth = async () => {
    try {
      const response = await fetch('http://localhost:3001/health')
      const data = await response.json()
      setResults({ health: { success: true, data } })
    } catch (error: any) {
      setResults({ health: { success: false, error: error.message } })
    }
  }

  const testLogin = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@digitaliskole.lk',
          password: 'your-password'
        }),
      })
      const data = await response.json()
      setResults({ login: { success: response.ok, data } })
      
      if (response.ok && data.data?.token) {
        localStorage.setItem('digital-iskole-token', data.data.token)
      }
    } catch (error: any) {
      setResults({ login: { success: false, error: error.message } })
    }
  }

  const testMe = async () => {
    try {
      const token = localStorage.getItem('digital-iskole-token')
      if (!token) {
        setResults({ me: { success: false, error: 'No token found. Login first.' } })
        return
      }

      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      const data = await response.json()
      setResults({ me: { success: response.ok, data } })
    } catch (error: any) {
      setResults({ me: { success: false, error: error.message } })
    }
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">API Test Page</h1>
      
      <div className="space-y-4">
        <Button onClick={testHealth}>Test Health Endpoint</Button>
        <Button onClick={testLogin}>Test Login</Button>
        <Button onClick={testMe}>Test /auth/me (Protected)</Button>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Results:</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto">
          {JSON.stringify(results, null, 2)}
        </pre>
      </div>
    </div>
  )
}
```

Then visit: `http://localhost:3000/test-api`

---

## Method 5: Check CORS Configuration

### If you see CORS errors in the browser:

1. **Check backend CORS settings** in `backend/src/app.ts`
2. **Verify** `CORS_ORIGIN` in `backend/.env`:
   ```
   CORS_ORIGIN=http://localhost:3000
   ```
3. **Restart backend** after changing CORS settings

---

## Common Issues and Solutions

### Issue 1: "Network Error" or "Failed to fetch"
**Solution:**
- ✅ Check if backend is running on port 3001
- ✅ Check `NEXT_PUBLIC_API_URL` in frontend `.env.local`
- ✅ Check firewall/antivirus blocking connections

### Issue 2: "CORS Error"
**Solution:**
- ✅ Check `CORS_ORIGIN` in backend `.env`
- ✅ Restart backend server
- ✅ Verify frontend URL matches CORS_ORIGIN

### Issue 3: "401 Unauthorized"
**Solution:**
- ✅ Check if token is being sent in Authorization header
- ✅ Verify token is valid (not expired)
- ✅ Check if user is authenticated

### Issue 4: "500 Internal Server Error"
**Solution:**
- ✅ Check backend server logs for error details
- ✅ Verify environment variables are set correctly
- ✅ Check database/Firebase connectivity

---

## Quick Test Checklist

- [ ] Backend server is running (`http://localhost:3001`)
- [ ] Frontend is running (`http://localhost:3000`)
- [ ] Health endpoint works (`curl http://localhost:3001/health`)
- [ ] Login endpoint works (test in browser DevTools)
- [ ] Protected endpoint works with token (test `/api/auth/me`)
- [ ] No CORS errors in browser console
- [ ] API responses show `success: true` for successful requests

---

## Useful Commands

### Check if backend is running:
```bash
# Windows PowerShell
Invoke-WebRequest -Uri http://localhost:3001/health -UseBasicParsing

# Linux/Mac
curl http://localhost:3001/health
```

### Check backend logs:
```bash
# Look at the terminal where `npm run dev` is running in backend/
```

### Test login from command line:
```bash
# Windows PowerShell
$body = @{email="admin@digitaliskole.lk";password="your-password"} | ConvertTo-Json
Invoke-WebRequest -Uri http://localhost:3001/api/auth/login -Method POST -Body $body -ContentType "application/json"
```

---

## Next Steps

Once you've verified basic API connectivity:

1. ✅ Test all authentication endpoints (login, logout, refresh, me)
2. ✅ Test protected endpoints with authentication
3. ✅ Test different user roles (admin, teacher, parent)
4. ✅ Test error handling (invalid credentials, expired tokens)
5. ✅ Test rate limiting (make too many requests)
