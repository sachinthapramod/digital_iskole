# Environment Variables to Update After Deployment

**After deploying both frontend and backend, you need to update these environment variables to connect them together.**

---

## 📋 Step-by-Step: What to Update

### Step 1: Get Your Deployment URLs

After deploying, note these URLs:

1. **Frontend URL:** 
   - From Vercel Dashboard → Frontend Project
   - Example: `https://digital-iskole-xxx.vercel.app`

2. **Backend URL:**
   - From Vercel Dashboard → Backend Project
   - Example: `https://digital-iskole-backend-xxx.vercel.app`

---

## ✅ Environment Variables to Update

### 1. Frontend Project (Vercel)

**Go to:** Vercel Dashboard → Your Frontend Project → Settings → Environment Variables

**Update this variable:**

| Variable | Before | After |
|----------|--------|-------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001/api` | `https://digital-iskole-backend-xxx.vercel.app/api` |

**Steps:**
1. Find `NEXT_PUBLIC_API_URL` in the environment variables list
2. Click "Edit" or change the value
3. Update to: `https://your-backend-url.vercel.app/api` (replace with your actual backend URL)
4. Make sure it's set for **Production**, **Preview**, and **Development** environments
5. Click "Save"
6. **Redeploy** the frontend (Deployments → Latest → Redeploy)

---

### 2. Backend Project (Vercel)

**Go to:** Vercel Dashboard → Your Backend Project → Settings → Environment Variables

**Update these variables:**

| Variable | Before | After |
|----------|--------|-------|
| `CORS_ORIGIN` | `http://localhost:3000` | `https://digital-iskole-xxx.vercel.app` |
| `API_BASE_URL` | `http://localhost:3001/api` | `https://digital-iskole-backend-xxx.vercel.app/api` |

**Steps:**
1. Find `CORS_ORIGIN` in the environment variables list
2. Update to: `https://your-frontend-url.vercel.app` (replace with your actual frontend URL)
3. Find `API_BASE_URL` in the environment variables list
4. Update to: `https://your-backend-url.vercel.app/api` (replace with your actual backend URL)
5. Make sure both are set for **Production**, **Preview**, and **Development** environments
6. Click "Save"
7. **Redeploy** the backend (Deployments → Latest → Redeploy)

---

## 📝 Detailed Instructions

### Frontend: Update `NEXT_PUBLIC_API_URL`

**Why:** The frontend needs to know where the backend API is located.

**How:**
1. Go to Vercel Dashboard
2. Click your **Frontend Project** (e.g., `digital-iskole`)
3. Go to **Settings** → **Environment Variables**
4. Find `NEXT_PUBLIC_API_URL`
5. Click the value to edit it
6. Change from: `http://localhost:3001/api`
7. Change to: `https://digital-iskole-backend-xxx.vercel.app/api` (use your actual backend URL)
8. Make sure it's enabled for: ✅ Production, ✅ Preview, ✅ Development
9. Click **Save**
10. Go to **Deployments** tab
11. Click **⋯** (three dots) on latest deployment
12. Click **Redeploy**
13. Wait for deployment to complete

---

### Backend: Update `CORS_ORIGIN`

**Why:** The backend needs to allow requests from your frontend domain (security requirement).

**How:**
1. Go to Vercel Dashboard
2. Click your **Backend Project** (e.g., `digital-iskole-backend`)
3. Go to **Settings** → **Environment Variables**
4. Find `CORS_ORIGIN`
5. Click the value to edit it
6. Change from: `http://localhost:3000`
7. Change to: `https://digital-iskole-xxx.vercel.app` (use your actual frontend URL)
8. ⚠️ **Important:** 
   - Include `https://` (not `http://`)
   - No trailing slash (not `https://example.com/`)
   - Must match your frontend URL exactly
9. Make sure it's enabled for: ✅ Production, ✅ Preview, ✅ Development
10. Click **Save**
11. Go to **Deployments** tab
12. Click **⋯** (three dots) on latest deployment
13. Click **Redeploy**
14. Wait for deployment to complete

---

### Backend: Update `API_BASE_URL`

**Why:** The backend should know its own URL (used in some responses and logging).

**How:**
1. Go to Vercel Dashboard
2. Click your **Backend Project** (e.g., `digital-iskole-backend`)
3. Go to **Settings** → **Environment Variables**
4. Find `API_BASE_URL`
5. Click the value to edit it
6. Change from: `http://localhost:3001/api`
7. Change to: `https://digital-iskole-backend-xxx.vercel.app/api` (use your actual backend URL)
8. ⚠️ **Important:** Include `/api` at the end
9. Make sure it's enabled for: ✅ Production, ✅ Preview, ✅ Development
10. Click **Save**
11. Go to **Deployments** tab
12. Click **⋯** (three dots) on latest deployment
13. Click **Redeploy**
14. Wait for deployment to complete

---

## ✅ Complete Checklist

After both deployments:

- [ ] Got frontend URL: `https://digital-iskole-xxx.vercel.app`
- [ ] Got backend URL: `https://digital-iskole-backend-xxx.vercel.app`
- [ ] Updated `NEXT_PUBLIC_API_URL` in frontend project
- [ ] Updated `CORS_ORIGIN` in backend project
- [ ] Updated `API_BASE_URL` in backend project
- [ ] Redeployed frontend
- [ ] Redeployed backend
- [ ] Tested frontend → Backend connection

---

## 🧪 Testing After Updates

### Test 1: Backend Health Check

```bash
curl https://digital-iskole-backend-xxx.vercel.app/health
```

**Expected:** `{"status":"ok","timestamp":"...","uptime":...}`

### Test 2: Frontend → Backend Connection

1. Open your frontend URL: `https://digital-iskole-xxx.vercel.app`
2. Open browser DevTools (F12) → Network tab
3. Try to login or make any API call
4. Check Network tab for API requests
5. **Should see:** Requests going to `https://digital-iskole-backend-xxx.vercel.app/api/...`
6. **Should NOT see:** CORS errors in console

### Test 3: Login Test

1. Go to frontend: `https://digital-iskole-xxx.vercel.app/login`
2. Try to login with your credentials
3. Should work without CORS errors
4. Check browser console (F12) for any errors

---

## 🔍 How to Find Your URLs

### Frontend URL:
1. Vercel Dashboard → Your Frontend Project
2. Look at the top or in **Settings** → **Domains**
3. Usually: `https://digital-iskole-xxx.vercel.app` or your custom domain

### Backend URL:
1. Vercel Dashboard → Your Backend Project
2. Look at the top or in **Settings** → **Domains**
3. Usually: `https://digital-iskole-backend-xxx.vercel.app` or your custom domain

---

## ⚠️ Common Mistakes

### ❌ Wrong Format:
```
CORS_ORIGIN=https://example.com/          # Trailing slash
CORS_ORIGIN=example.com                   # Missing https://
NEXT_PUBLIC_API_URL=https://backend.com   # Missing /api
```

### ✅ Correct Format:
```
CORS_ORIGIN=https://example.com           # No trailing slash
CORS_ORIGIN=https://example.com           # Has https://
NEXT_PUBLIC_API_URL=https://backend.com/api  # Has /api
```

---

## 📋 Quick Reference Table

| Variable | Project | Value Format | Example |
|----------|---------|--------------|---------|
| `NEXT_PUBLIC_API_URL` | Frontend | `https://backend-url.vercel.app/api` | `https://digital-iskole-backend-xxx.vercel.app/api` |
| `CORS_ORIGIN` | Backend | `https://frontend-url.vercel.app` | `https://digital-iskole-xxx.vercel.app` |
| `API_BASE_URL` | Backend | `https://backend-url.vercel.app/api` | `https://digital-iskole-backend-xxx.vercel.app/api` |

---

## 🎯 Summary

**After deployment, update 3 environment variables:**

1. **Frontend:** `NEXT_PUBLIC_API_URL` → Backend URL + `/api`
2. **Backend:** `CORS_ORIGIN` → Frontend URL (no trailing slash)
3. **Backend:** `API_BASE_URL` → Backend URL + `/api`

**Then redeploy both projects!**

---

**Need help?** Check Vercel logs if something doesn't work after updating these variables.
