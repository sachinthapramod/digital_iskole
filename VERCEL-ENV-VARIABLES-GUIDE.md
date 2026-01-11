# Vercel Environment Variables - Quick Guide

**Important:** Frontend and Backend need SEPARATE Vercel projects!

---

## 🎯 Current Situation

You're deploying the **Frontend** right now. This project should ONLY have frontend environment variables.

---

## ✅ Frontend Project (What You're Doing Now)

**Project Name:** `digital-iskole`  
**Root Directory:** `./` (root)  
**Framework:** Next.js

### Frontend Environment Variables (✅ Correct - You have these):

```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_API_URL=http://localhost:3001/api  ⚠️ UPDATE THIS LATER
```

**⚠️ Important Note:** 
- `NEXT_PUBLIC_API_URL` is currently `http://localhost:3001/api`
- You need to **UPDATE THIS** after deploying the backend
- Change it to: `https://your-backend.vercel.app/api` (after backend is deployed)

---

## ❌ DO NOT Add Backend Variables Here!

**Backend variables (like these) should NOT be in the frontend project:**
```
PORT=3001
NODE_ENV=production
FIREBASE_PRIVATE_KEY=...
JWT_SECRET=...
etc.
```

---

## 🔧 Backend Project (Separate Deployment)

You need to create a **SECOND Vercel project** for the backend:

1. **After frontend deployment completes:**
   - Go back to Vercel Dashboard
   - Click "Add New Project" again
   - Import the SAME GitHub repository
   - **IMPORTANT:** Set **Root Directory** to `backend` (not `./`)
   - Project Name: `digital-iskole-backend`
   - Framework: "Other" (not Next.js)

2. **Then add backend environment variables in that project:**
   ```
   PORT=3001
   NODE_ENV=production
   API_BASE_URL=https://digital-iskole-backend-xxx.vercel.app/api
   CORS_ORIGIN=https://digital-iskole-xxx.vercel.app
   FIREBASE_PROJECT_ID=...
   FIREBASE_CLIENT_EMAIL=...
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   FIREBASE_STORAGE_BUCKET=...
   FIREBASE_WEB_API_KEY=...
   JWT_SECRET=...
   JWT_EXPIRES_IN=24h
   JWT_REFRESH_EXPIRES_IN=7d
   ```

---

## 📋 Step-by-Step: What to Do Now

### Step 1: Deploy Frontend (What You're Doing)

1. ✅ **Keep the frontend variables you have** (they're correct)
2. ⚠️ **Temporarily leave `NEXT_PUBLIC_API_URL` as `http://localhost:3001/api`** (you'll update it after backend is deployed)
3. Click "Deploy"
4. Wait for deployment
5. Get your frontend URL: `https://digital-iskole-xxx.vercel.app`

### Step 2: Deploy Backend (Next)

1. Go to Vercel Dashboard → "Add New Project"
2. Import the SAME repository
3. **Configure:**
   - Project Name: `digital-iskole-backend`
   - Framework: "Other" (or leave blank)
   - **Root Directory:** `backend` ⚠️ **IMPORTANT!**
   - Build Command: `npm install && npm run build`
   - Install Command: `npm install`
4. Add backend environment variables (from your `backend/.env` file)
5. Click "Deploy"
6. Get your backend URL: `https://digital-iskole-backend-xxx.vercel.app`

### Step 3: Update URLs

1. **Update Frontend:**
   - Go to Frontend Project → Settings → Environment Variables
   - Change `NEXT_PUBLIC_API_URL` from `http://localhost:3001/api` to `https://digital-iskole-backend-xxx.vercel.app/api`
   - Save and Redeploy

2. **Update Backend:**
   - Go to Backend Project → Settings → Environment Variables
   - Update `CORS_ORIGIN` to your frontend URL: `https://digital-iskole-xxx.vercel.app`
   - Update `API_BASE_URL` to your backend URL: `https://digital-iskole-backend-xxx.vercel.app/api`
   - Save and Redeploy

---

## ✅ Summary

| Project | Variables | Where |
|---------|-----------|-------|
| **Frontend** | `NEXT_PUBLIC_*` variables | Current project you're deploying |
| **Backend** | `PORT`, `FIREBASE_PRIVATE_KEY`, `JWT_SECRET`, etc. | Separate project (deploy after frontend) |

**Answer to your question:** 
- ❌ **NO**, do not add backend `.env` variables to the frontend project
- ✅ **YES**, but add them to a SEPARATE backend Vercel project
- ✅ **YES**, the frontend variables you have are correct (just update `NEXT_PUBLIC_API_URL` later)

---

## 🎯 Right Now: Click "Deploy"!

Your frontend configuration is correct. Just:
1. Click "Deploy" button
2. Wait for deployment
3. Then create the backend project separately

---

## 📝 Quick Checklist

**Frontend Project (Current):**
- [x] Frontend variables added (all `NEXT_PUBLIC_*`)
- [ ] Click "Deploy"
- [ ] Wait for deployment
- [ ] Get frontend URL
- [ ] (Later) Update `NEXT_PUBLIC_API_URL` after backend is deployed

**Backend Project (Next Step):**
- [ ] Create new Vercel project
- [ ] Set Root Directory to `backend`
- [ ] Add backend environment variables
- [ ] Deploy backend
- [ ] Update `NEXT_PUBLIC_API_URL` in frontend
- [ ] Update `CORS_ORIGIN` in backend
