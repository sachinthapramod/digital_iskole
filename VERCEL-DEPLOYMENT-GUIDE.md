# Complete Vercel Deployment Guide

**Last Updated:** 2026-01-10  
**Status:** Step-by-step guide for deploying Digital Iskole to Vercel

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Prerequisites](#prerequisites)
3. [Frontend Deployment (Next.js)](#frontend-deployment-nextjs)
4. [Backend Deployment Options](#backend-deployment-options)
5. [Environment Variables Setup](#environment-variables-setup)
6. [Final Configuration](#final-configuration)
7. [Testing Deployment](#testing-deployment)
8. [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start

If you want to deploy quickly:

1. **Deploy Frontend to Vercel** (5 minutes)
2. **Deploy Backend to Railway** (5 minutes) - Recommended for easiest setup
3. **Configure Environment Variables** (5 minutes)
4. **Test & Verify** (5 minutes)

**Total Time: ~20 minutes**

---

## ✅ Prerequisites

Before deploying, make sure you have:

- ✅ **GitHub Account** (required for Vercel deployment)
- ✅ **Vercel Account** - [Sign up free](https://vercel.com/signup)
- ✅ **Railway Account** (for backend) - [Sign up free](https://railway.app) OR use Vercel for backend too
- ✅ **Firebase Project** configured with all credentials
- ✅ **Code pushed to GitHub** repository

---

## 🎨 Frontend Deployment (Next.js)

### Step 1: Prepare Your Code

1. **Ensure your code is committed and pushed to GitHub:**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Test build locally:**
   ```bash
   npm run build
   ```
   
   If build succeeds, you're ready to deploy!

### Step 2: Deploy via Vercel Dashboard (Recommended for First Time)

#### Option A: Deploy via Vercel Dashboard (Easiest)

1. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**
   - Sign in or create account (free)

2. **Click "Add New Project"**

3. **Import Git Repository:**
   - Connect your GitHub account if not already connected
   - Select your `digital_iskole` repository
   - Click "Import"

4. **Configure Project Settings:**
   - **Framework Preset**: `Next.js` (auto-detected)
   - **Root Directory**: `./` (leave as is)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)
   - **Node.js Version**: `18.x` or `20.x` (recommended)

5. **Click "Deploy"** (DO NOT add environment variables yet - we'll do that after deployment)

6. **Wait for deployment** (~2-3 minutes)

7. **Get your deployment URL**: `https://digital-iskole-xxx.vercel.app`

#### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel
   ```
   
   Follow the prompts:
   - Link to existing project? **No** (first time)
   - Project name: `digital-iskole`
   - Directory: `./` (current directory)
   - Override settings? **No**

4. **For production deployment:**
   ```bash
   vercel --prod
   ```

### Step 3: Configure Environment Variables

**Important:** Do this AFTER the first deployment succeeds.

1. **Go to your project in Vercel Dashboard**

2. **Navigate to:** Settings → Environment Variables

3. **Add these variables:**

   ```
   # Firebase Configuration (Client-side)
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   
   # Backend API URL (Update after backend deployment)
   NEXT_PUBLIC_API_URL=https://your-backend-url.com/api
   ```

4. **Select Environments:**
   - ✅ Production
   - ✅ Preview
   - ✅ Development

5. **Click "Save"**

6. **Redeploy:**
   - Go to **Deployments** tab
   - Click **⋯** (three dots) on latest deployment
   - Click **Redeploy**
   - Select **Use existing Build Cache**
   - Click **Redeploy**

### Step 4: Verify Frontend Deployment

1. Visit your deployment URL: `https://digital-iskole-xxx.vercel.app`
2. Check if the page loads correctly
3. Check browser console for errors

**✅ Frontend deployed!** Keep this URL handy for backend CORS configuration.

---

## 🔧 Backend Deployment Options

You have **3 options** for backend deployment. **Railway is recommended** for easiest setup.

### Option 1: Deploy Backend to Railway (⭐ Recommended - Easiest)

#### Why Railway?
- ✅ Free tier available
- ✅ Automatic HTTPS
- ✅ Easy environment variable management
- ✅ Auto-deploy from GitHub
- ✅ Perfect for Express.js/Node.js

#### Step-by-Step:

1. **Sign up at [railway.app](https://railway.app)**
   - Click "Start a New Project"
   - Sign in with GitHub

2. **Create New Project:**
   - Click **"New Project"**
   - Select **"Deploy from GitHub repo"**
   - Choose your `digital_iskole` repository

3. **Configure Service:**
   - Railway will auto-detect the root directory
   - Click **"Add Service"** → **"GitHub Repo"**
   - Select your repository
   - In **Settings**, set:
     - **Root Directory**: `backend`
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`

4. **Add Environment Variables:**
   - Go to **Variables** tab
   - Add all these variables:

     ```
     # Server Configuration
     PORT=3001
     NODE_ENV=production
     
     # API Configuration (Update after deployment)
     API_BASE_URL=https://your-app.up.railway.app/api
     CORS_ORIGIN=https://digital-iskole-xxx.vercel.app
     
     # Firebase Admin SDK
     FIREBASE_PROJECT_ID=your-project-id
     FIREBASE_CLIENT_EMAIL=firebase-adminsdk@xxx.iam.gserviceaccount.com
     FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----\n"
     FIREBASE_STORAGE_BUCKET=your-project.appspot.com
     FIREBASE_WEB_API_KEY=your-firebase-web-api-key
     
     # JWT Configuration
     JWT_SECRET=your-super-secret-jwt-key-min-32-chars
     JWT_EXPIRES_IN=24h
     JWT_REFRESH_EXPIRES_IN=7d
     ```

   **Important Notes:**
   - For `FIREBASE_PRIVATE_KEY`, keep the `\n` newlines or use the format shown
   - Replace `CORS_ORIGIN` with your actual Vercel frontend URL
   - Generate `JWT_SECRET` using: `openssl rand -base64 32` or use Railway's generator

5. **Deploy:**
   - Railway will automatically deploy
   - Wait for deployment to complete (~2-3 minutes)
   - Get your backend URL: `https://your-app.up.railway.app`

6. **Update Backend Environment Variables:**
   - Go back to **Variables** tab
   - Update `API_BASE_URL` with your actual Railway URL
   - Update `CORS_ORIGIN` with your Vercel frontend URL
   - Railway will auto-redeploy

7. **Update Frontend Environment Variable:**
   - Go back to Vercel Dashboard
   - Update `NEXT_PUBLIC_API_URL` to: `https://your-app.up.railway.app/api`
   - Redeploy frontend

**✅ Backend deployed on Railway!**

---

### Option 2: Deploy Backend to Vercel (Serverless)

**Note:** This requires modifying the backend structure. Only do this if you prefer everything on Vercel.

#### Step 1: Create Backend Vercel Configuration

Create `backend/vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/server.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "src/server.ts"
    },
    {
      "src": "/health",
      "dest": "src/server.ts"
    }
  ]
}
```

#### Step 2: Install Vercel Dependencies

```bash
cd backend
npm install @vercel/node --save-dev
```

#### Step 3: Update server.ts for Serverless

The server.ts is already configured to export the app for Vercel. Verify it exports the app:

```typescript
// backend/src/server.ts should export the app
export default app;
```

#### Step 4: Deploy Backend to Vercel

1. **Create a new Vercel project for backend:**
   ```bash
   cd backend
   vercel
   ```

2. **Configure:**
   - Link to existing project? **No**
   - Project name: `digital-iskole-backend`
   - Directory: `./` (backend directory)

3. **Add Environment Variables:**
   - Same as Railway above
   - But update URLs accordingly

4. **Production deployment:**
   ```bash
   vercel --prod
   ```

**⚠️ Note:** Serverless functions have timeout limits. For long-running operations, Railway is better.

---

### Option 3: Deploy Backend to Render

1. **Sign up at [render.com](https://render.com)**

2. **Create New Web Service:**
   - Connect GitHub repository
   - Configure:
     - **Name**: `digital-iskole-backend`
     - **Environment**: `Node`
     - **Build Command**: `cd backend && npm install && npm run build`
     - **Start Command**: `cd backend && npm start`
     - **Root Directory**: `backend`

3. **Add Environment Variables** (same as Railway)

4. **Deploy and get your URL**

---

## 🔐 Environment Variables Setup

### Frontend (Vercel) Environment Variables

Go to Vercel Dashboard → Your Project → Settings → Environment Variables:

```
# Firebase (Client-side)
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

# Backend API (Update after backend deployment)
NEXT_PUBLIC_API_URL=https://your-backend.up.railway.app/api
```

### Backend (Railway/Render/Vercel) Environment Variables

```
# Server
PORT=3001
NODE_ENV=production

# API
API_BASE_URL=https://your-backend.up.railway.app/api
CORS_ORIGIN=https://digital-iskole-xxx.vercel.app

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_WEB_API_KEY=AIza...

# JWT
JWT_SECRET=your-super-secret-key-minimum-32-characters-long
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
```

**⚠️ Important:**
- `CORS_ORIGIN` must match your Vercel frontend URL exactly
- `FIREBASE_PRIVATE_KEY` must include `\n` newlines
- `NEXT_PUBLIC_API_URL` must point to your deployed backend URL

---

## 🔄 Final Configuration

After both frontend and backend are deployed:

### 1. Update Backend CORS

In your backend environment variables (Railway/Render/Vercel):
- Update `CORS_ORIGIN` to: `https://your-frontend.vercel.app`

### 2. Update Frontend API URL

In your Vercel frontend environment variables:
- Update `NEXT_PUBLIC_API_URL` to: `https://your-backend.up.railway.app/api`

### 3. Redeploy Both

- **Frontend (Vercel):** Redeploy from dashboard
- **Backend (Railway):** Will auto-redeploy when env vars change

---

## ✅ Testing Deployment

### Test Frontend

1. Visit: `https://your-app.vercel.app`
2. Check browser console (F12) for errors
3. Try logging in (if backend is deployed)

### Test Backend

1. **Health Check:**
   ```bash
   curl https://your-backend.up.railway.app/health
   ```
   Should return: `{"status":"ok","timestamp":"...","uptime":...}`

2. **Test API Endpoint:**
   ```bash
   curl https://your-backend.up.railway.app/api/auth/login \
     -X POST \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@digitaliskole.lk","password":"your-password"}'
   ```

3. **Check Logs:**
   - **Railway:** Go to Deployments → Click deployment → View Logs
   - **Vercel:** Go to Deployments → Click deployment → View Logs

### Test Integration

1. Open frontend: `https://your-app.vercel.app`
2. Try to login with your credentials
3. Check Network tab (F12 → Network) for API calls
4. Verify API calls are going to your backend URL

---

## 🐛 Troubleshooting

### Frontend Issues

**Issue: "Firebase: Error (auth/configuration-not-found)"**
- ✅ Check all `NEXT_PUBLIC_*` environment variables are set in Vercel
- ✅ Ensure variables are set for Production environment
- ✅ Redeploy after adding environment variables

**Issue: "Cannot connect to API"**
- ✅ Check `NEXT_PUBLIC_API_URL` is correct (should be backend URL + `/api`)
- ✅ Verify backend is deployed and running
- ✅ Check CORS configuration in backend
- ✅ Check browser console for actual API call URL

**Issue: Build fails on Vercel**
- ✅ Check build logs in Vercel dashboard
- ✅ Ensure `package.json` has all dependencies
- ✅ Check Node.js version (should be 18+)
- ✅ Try building locally: `npm run build`

**Issue: "Module not found" errors**
- ✅ Check if all dependencies are in `package.json`
- ✅ Ensure `node_modules` is NOT committed to Git
- ✅ Try clearing build cache in Vercel settings

### Backend Issues (Railway)

**Issue: "Application failed to respond"**
- ✅ Check Railway logs for errors
- ✅ Verify `PORT` environment variable is set
- ✅ Ensure start command is correct: `npm start`
- ✅ Check if backend builds successfully

**Issue: "CORS errors"**
- ✅ Update `CORS_ORIGIN` in backend env vars to match frontend URL exactly
- ✅ Include protocol: `https://your-app.vercel.app` (not just domain)
- ✅ Redeploy backend after updating CORS

**Issue: "Firebase Admin SDK error"**
- ✅ Check all Firebase env vars are set correctly
- ✅ Verify `FIREBASE_PRIVATE_KEY` includes `\n` newlines
- ✅ Check service account has proper permissions in Firebase Console

**Issue: "JWT_SECRET error"**
- ✅ Ensure `JWT_SECRET` is set and is at least 32 characters
- ✅ Don't use simple passwords as JWT_SECRET

### General Issues

**Issue: Environment variables not working**
- ✅ Ensure variables are set for correct environment (Production/Preview/Development)
- ✅ Redeploy after adding/changing environment variables
- ✅ Check variable names are correct (case-sensitive)
- ✅ Verify no extra spaces in variable values

**Issue: API calls failing in production but work locally**
- ✅ Check CORS is configured correctly
- ✅ Verify API URLs are correct (use HTTPS in production)
- ✅ Check backend logs for actual errors
- ✅ Ensure backend is accessible from internet

**Issue: Login works locally but not in production**
- ✅ Check Firebase configuration matches production Firebase project
- ✅ Verify `FIREBASE_WEB_API_KEY` is set in backend
- ✅ Check backend logs for authentication errors
- ✅ Ensure admin user exists in Firebase

---

## 📊 Deployment Checklist

Before going live, verify:

- [ ] Frontend deployed to Vercel
- [ ] Backend deployed to Railway/Render/Vercel
- [ ] All environment variables configured
- [ ] CORS configured correctly
- [ ] API URL updated in frontend
- [ ] Health check endpoint working
- [ ] Login functionality working
- [ ] No console errors in browser
- [ ] All API endpoints accessible
- [ ] Firebase connection working
- [ ] Custom domain configured (optional)

---

## 🎯 Quick Reference

### URLs to Update After Deployment

1. **Frontend URL (Vercel):** `https://digital-iskole-xxx.vercel.app`
   - Use this for: `CORS_ORIGIN` in backend

2. **Backend URL (Railway):** `https://your-app.up.railway.app`
   - Use this for: `NEXT_PUBLIC_API_URL` in frontend (add `/api` suffix)
   - Use this for: `API_BASE_URL` in backend

### Important Files

- `vercel.json` - Frontend Vercel configuration
- `next.config.mjs` - Next.js configuration
- `backend/package.json` - Backend dependencies
- `.env.local` (local only) - Frontend environment variables
- `backend/.env` (local only) - Backend environment variables

### Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Firebase Setup Guide](./FIREBASE-SETUP-GUIDE.md)

---

## 🚀 Next Steps

After successful deployment:

1. ✅ Set up custom domain (optional)
2. ✅ Configure SSL (automatic with Vercel/Railway)
3. ✅ Set up monitoring/alerts
4. ✅ Configure backup strategy for database
5. ✅ Set up CI/CD for auto-deployment
6. ✅ Review security settings
7. ✅ Set up analytics

---

**🎉 Congratulations! Your Digital Iskole application is now deployed!**

For issues or questions, check the logs in Vercel/Railway dashboards and refer to the troubleshooting section above.
