# Update Environment Variables - Step by Step

**Your URLs:**
- Frontend: `https://digital-iskole.vercel.app/`
- Backend: `https://digital-iskole-backend.vercel.app/`

---

## 📋 Frontend Project Updates

### Step 1: Go to Frontend Project Settings

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your project: **digital-iskole** (frontend)
3. Click **Settings** (in the top menu)
4. Click **Environment Variables** (in the left sidebar)

### Step 2: Update `NEXT_PUBLIC_API_URL`

1. Find the variable `NEXT_PUBLIC_API_URL` in the list
2. Click on it (or click the edit/pencil icon)
3. **Change the value from:**
   ```
   http://localhost:3001/api
   ```
   
   **To:**
   ```
   https://digital-iskole-backend.vercel.app/api
   ```
   
   ⚠️ **Important:** 
   - Use `https://` (not `http://`)
   - Add `/api` at the end
   - No trailing slash after `/api`

4. Make sure these are checked:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

5. Click **Save**

### Step 3: Redeploy Frontend

1. Go to **Deployments** tab (top menu)
2. Click on the latest deployment
3. Click **⋯** (three dots menu) on the right
4. Click **Redeploy**
5. Wait for deployment to complete (~2-3 minutes)

---

## 📋 Backend Project Updates

### Step 1: Go to Backend Project Settings

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your project: **digital-iskole-backend** (backend)
3. Click **Settings** (in the top menu)
4. Click **Environment Variables** (in the left sidebar)

### Step 2: Update `CORS_ORIGIN`

1. Find the variable `CORS_ORIGIN` in the list
2. Click on it (or click the edit/pencil icon)
3. **Change the value from:**
   ```
   http://localhost:3000
   ```
   
   **To:**
   ```
   https://digital-iskole.vercel.app
   ```
   
   ⚠️ **Important:** 
   - Use `https://` (not `http://`)
   - **NO trailing slash** (not `https://digital-iskole.vercel.app/`)
   - Must match your frontend URL exactly

4. Make sure these are checked:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

5. Click **Save**

### Step 3: Update `API_BASE_URL`

1. Find the variable `API_BASE_URL` in the list
2. Click on it (or click the edit/pencil icon)
3. **Change the value from:**
   ```
   http://localhost:3001/api
   ```
   
   **To:**
   ```
   https://digital-iskole-backend.vercel.app/api
   ```
   
   ⚠️ **Important:** 
   - Use `https://` (not `http://`)
   - Add `/api` at the end
   - No trailing slash after `/api`

4. Make sure these are checked:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

5. Click **Save**

### Step 4: Redeploy Backend

1. Go to **Deployments** tab (top menu)
2. Click on the latest deployment
3. Click **⋯** (three dots menu) on the right
4. Click **Redeploy**
5. Wait for deployment to complete (~2-3 minutes)

---

## ✅ Summary of Changes

| Project | Variable | New Value |
|---------|----------|-----------|
| **Frontend** | `NEXT_PUBLIC_API_URL` | `https://digital-iskole-backend.vercel.app/api` |
| **Backend** | `CORS_ORIGIN` | `https://digital-iskole.vercel.app` |
| **Backend** | `API_BASE_URL` | `https://digital-iskole-backend.vercel.app/api` |

---

## 🧪 Test After Updates

After both redeployments complete:

### Test 1: Backend Health Check
Open in browser:
```
https://digital-iskole-backend.vercel.app/health
```

Should return: `{"status":"ok",...}`

### Test 2: Frontend → Backend Connection
1. Open: `https://digital-iskole.vercel.app`
2. Open browser DevTools (F12) → Network tab
3. Try to login
4. Check Network tab - should see requests to `https://digital-iskole-backend.vercel.app/api/...`
5. Should NOT see CORS errors in console

---

## ✅ Checklist

- [ ] Updated `NEXT_PUBLIC_API_URL` in frontend project
- [ ] Redeployed frontend
- [ ] Updated `CORS_ORIGIN` in backend project
- [ ] Updated `API_BASE_URL` in backend project
- [ ] Redeployed backend
- [ ] Tested health endpoint
- [ ] Tested frontend → backend connection

---

**That's it! After these updates, your frontend and backend will be connected correctly.**
