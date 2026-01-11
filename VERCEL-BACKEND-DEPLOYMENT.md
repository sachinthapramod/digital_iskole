# Deploy Backend to Vercel (Complete Guide)

**Last Updated:** 2026-01-10  
**Status:** Step-by-step guide for deploying Express backend to Vercel as serverless functions

---

## 📋 Overview

This guide will help you deploy your Express.js backend to Vercel as serverless functions. The backend is already configured to work with Vercel (server.ts exports the app), but we need to set up the Vercel configuration.

**⚠️ Important Notes:**
- Vercel serverless functions have a 10-second timeout on Hobby plan (60 seconds on Pro)
- For long-running operations, consider Railway or Render instead
- Database connections should use connection pooling for serverless
- Firebase Admin SDK works well with Vercel serverless functions

---

## ✅ Prerequisites

- ✅ Backend code is committed and pushed to GitHub
- ✅ Vercel account ([Sign up free](https://vercel.com/signup))
- ✅ Backend builds successfully: `cd backend && npm run build`
- ✅ All environment variables ready

---

## 🚀 Step-by-Step Deployment

### Step 1: Create Vercel Configuration File

The `backend/vercel.json` file should already be created with this content:

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
    },
    {
      "src": "/(.*)",
      "dest": "src/server.ts"
    }
  ]
}
```

**Verify the file exists:**
```bash
cat backend/vercel.json
```

If it doesn't exist, create it with the content above.

---

### Step 2: Install Vercel CLI (Optional but Recommended)

You can deploy via CLI or Dashboard. CLI is faster for updates:

```bash
npm i -g vercel
```

---

### Step 3: Configure Backend for Vercel

#### Option A: Deploy via Vercel Dashboard (Recommended for First Time)

1. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**

2. **Click "Add New Project"**

3. **Import Git Repository:**
   - Connect GitHub if not already connected
   - Select your `digital_iskole` repository
   - Click "Import"

4. **Configure Project Settings:**
   - **Framework Preset**: `Other` (or leave blank)
   - **Root Directory**: `backend` ⚠️ **IMPORTANT!**
   - **Build Command**: `npm install && npm run build`
   - **Output Directory**: `dist` (or leave blank for serverless)
   - **Install Command**: `npm install`
   - **Node.js Version**: `18.x` or `20.x` (recommended)

5. **Click "Deploy"** (Don't add environment variables yet)

6. **Wait for deployment** (~3-5 minutes)

7. **Get your backend URL**: `https://digital-iskole-backend-xxx.vercel.app`

#### Option B: Deploy via Vercel CLI

1. **Navigate to backend directory:**
   ```bash
   cd backend
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
   - Set up and deploy? **Yes**
   - Link to existing project? **No** (first time)
   - Project name: `digital-iskole-backend` (or your choice)
   - Directory: `./` (current directory)
   - Override settings? **No**

4. **For production deployment:**
   ```bash
   vercel --prod
   ```

---

### Step 4: Install Vercel Node.js Runtime (If Needed)

Vercel should automatically detect `@vercel/node`, but if you get build errors, you might need to add it:

```bash
cd backend
npm install @vercel/node --save-dev
```

Then verify it's in `package.json`:
```json
{
  "devDependencies": {
    "@vercel/node": "^3.x.x"
  }
}
```

---

### Step 5: Configure Environment Variables

**Important:** Do this AFTER the first deployment succeeds.

1. **Go to Vercel Dashboard** → Your Backend Project

2. **Navigate to:** Settings → Environment Variables

3. **Add all backend environment variables:**

   ```
   # Server Configuration
   PORT=3001
   NODE_ENV=production
   
   # API Configuration (Update after deployment)
   API_BASE_URL=https://digital-iskole-backend-xxx.vercel.app/api
   CORS_ORIGIN=https://your-frontend.vercel.app
   
   # Firebase Admin SDK
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
   FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   FIREBASE_WEB_API_KEY=your-firebase-web-api-key
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
   JWT_EXPIRES_IN=24h
   JWT_REFRESH_EXPIRES_IN=7d
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
   - Select **Use existing Build Cache** (optional)
   - Click **Redeploy**

---

### Step 6: Update Frontend Configuration

After backend is deployed:

1. **Get your backend URL:**
   - Vercel Dashboard → Your Backend Project → Settings → Domains
   - Or check deployment URL: `https://digital-iskole-backend-xxx.vercel.app`

2. **Update Frontend Environment Variable:**
   - Go to **Frontend Vercel Project** → Settings → Environment Variables
   - Update `NEXT_PUBLIC_API_URL` to: `https://digital-iskole-backend-xxx.vercel.app/api`
   - Save and redeploy frontend

3. **Update Backend CORS:**
   - Go to **Backend Vercel Project** → Settings → Environment Variables
   - Update `CORS_ORIGIN` to match your frontend URL exactly: `https://your-frontend.vercel.app`
   - Save and redeploy backend

---

## ✅ Verify Deployment

### Test Backend Health Endpoint

```bash
curl https://digital-iskole-backend-xxx.vercel.app/health
```

**Expected response:**
```json
{
  "status": "ok",
  "timestamp": "2026-01-10T...",
  "uptime": 123.45
}
```

### Test API Endpoint

```bash
curl https://digital-iskole-backend-xxx.vercel.app/api/auth/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@digitaliskole.lk","password":"your-password"}'
```

### Check Logs

1. **Vercel Dashboard** → Your Backend Project → Deployments
2. Click on latest deployment
3. Click **"View Function Logs"** or **"Runtime Logs"**
4. Check for any errors

---

## 🔧 Configuration Files Reference

### backend/vercel.json

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
    },
    {
      "src": "/(.*)",
      "dest": "src/server.ts"
    }
  ]
}
```

### backend/src/server.ts

The server.ts is already configured correctly:

```typescript
import app from './app';

// Export app for Vercel serverless functions
export default app;

// Only start HTTP server if not running on Vercel
if (process.env.VERCEL !== '1') {
  const server = app.listen(PORT, () => {
    // ... local development code
  });
}
```

✅ This configuration is already in place!

---

## 🐛 Troubleshooting

### Issue: "Cannot find module '@vercel/node'"

**Solution:**
```bash
cd backend
npm install @vercel/node --save-dev
git add package.json package-lock.json
git commit -m "Add @vercel/node for Vercel deployment"
git push
```

Then redeploy on Vercel.

---

### Issue: "Build failed" or "TypeScript errors"

**Solution:**
1. **Test build locally first:**
   ```bash
   cd backend
   npm run build
   ```

2. **Fix any TypeScript errors:**
   ```bash
   npx tsc --noEmit
   ```

3. **Ensure tsconfig.json is correct:**
   - Check `backend/tsconfig.json` exists
   - Verify `outDir` is set to `dist`
   - Verify `rootDir` is set to `src`

4. **Commit and push fixes, then redeploy**

---

### Issue: "Function timeout"

**Symptoms:**
- Requests timeout after 10 seconds (Hobby plan)
- API calls take longer than expected

**Solutions:**
1. **Upgrade to Pro plan** (60-second timeout)
2. **Optimize your code:**
   - Use connection pooling for databases
   - Cache Firebase Admin initialization
   - Optimize Firestore queries
3. **Consider Railway or Render** for longer-running operations

---

### Issue: "Environment variables not working"

**Solution:**
1. **Verify variables are set:**
   - Vercel Dashboard → Settings → Environment Variables
   - Check variables are set for correct environment (Production/Preview)

2. **Check variable names:**
   - Case-sensitive
   - No extra spaces
   - `FIREBASE_PRIVATE_KEY` includes `\n` newlines

3. **Redeploy after adding variables:**
   - Variables are only available after redeploy

4. **Check logs:**
   - View function logs to see actual variable values (be careful with secrets!)

---

### Issue: "CORS errors"

**Solution:**
1. **Update `CORS_ORIGIN` in backend environment variables:**
   - Must match frontend URL exactly
   - Include protocol: `https://your-app.vercel.app`
   - No trailing slash

2. **Redeploy backend after updating CORS**

3. **Check backend logs for CORS errors**

---

### Issue: "Firebase Admin SDK errors"

**Solution:**
1. **Check Firebase environment variables:**
   - All `FIREBASE_*` variables are set
   - `FIREBASE_PRIVATE_KEY` includes `\n` newlines
   - Service account has proper permissions

2. **Verify Firebase project is configured:**
   - Go to Firebase Console
   - Check service account exists
   - Verify permissions

3. **Check backend logs for specific Firebase errors**

---

### Issue: "Routes not working (404 errors)"

**Solution:**
1. **Check `vercel.json` routes configuration:**
   - Ensure routes are correct
   - Check `dest` points to `src/server.ts`

2. **Verify API endpoints:**
   - `/api/*` routes should work
   - `/health` route should work

3. **Check if routes are case-sensitive**

---

### Issue: "Cold start delays"

**Symptoms:**
- First request takes longer (5-10 seconds)
- Subsequent requests are faster

**Explanation:**
- This is normal for serverless functions
- Vercel keeps functions "warm" for active projects
- First request initializes the function
- Consider using Vercel Pro for better performance

**Solutions:**
1. **Use connection pooling** for databases
2. **Cache Firebase Admin initialization**
3. **Keep functions warm** (Pro plan feature)
4. **Optimize imports** (only import what's needed)

---

## 📊 Vercel vs Railway Comparison

| Feature | Vercel | Railway |
|---------|--------|---------|
| **Setup Complexity** | Medium | Easy |
| **Free Tier** | ✅ Yes | ✅ Yes |
| **Timeout Limit** | 10s (Hobby), 60s (Pro) | 5 minutes |
| **Cold Starts** | Yes (normal) | Minimal |
| **Best For** | API-first, serverless | Traditional Express apps |
| **Auto-scaling** | ✅ Automatic | ✅ Automatic |
| **HTTPS** | ✅ Automatic | ✅ Automatic |
| **Custom Domain** | ✅ Free | ✅ Free |
| **Logs** | ✅ Available | ✅ Available |

**Recommendation:**
- Use **Vercel** if you want everything in one place and don't need long timeouts
- Use **Railway** if you need longer timeouts or prefer traditional server setup

---

## 🔄 Update Deployment

### Update Code

1. **Make changes to backend code**
2. **Commit and push to GitHub:**
   ```bash
   git add .
   git commit -m "Update backend"
   git push origin main
   ```

3. **Vercel will auto-deploy** (if GitHub integration is set up)
   - Or manually redeploy from Vercel Dashboard

### Update Environment Variables

1. **Go to Vercel Dashboard** → Settings → Environment Variables
2. **Update variables**
3. **Save**
4. **Redeploy** from Deployments tab

---

## 📝 Environment Variables Checklist

Before deploying, ensure you have all these variables ready:

- [ ] `PORT=3001`
- [ ] `NODE_ENV=production`
- [ ] `API_BASE_URL` (update after deployment)
- [ ] `CORS_ORIGIN` (your frontend Vercel URL)
- [ ] `FIREBASE_PROJECT_ID`
- [ ] `FIREBASE_CLIENT_EMAIL`
- [ ] `FIREBASE_PRIVATE_KEY` (with `\n` newlines)
- [ ] `FIREBASE_STORAGE_BUCKET`
- [ ] `FIREBASE_WEB_API_KEY`
- [ ] `JWT_SECRET` (min 32 characters)
- [ ] `JWT_EXPIRES_IN=24h`
- [ ] `JWT_REFRESH_EXPIRES_IN=7d`

---

## ✅ Deployment Checklist

- [ ] `backend/vercel.json` exists and is configured correctly
- [ ] Code is committed and pushed to GitHub
- [ ] Backend builds successfully locally: `cd backend && npm run build`
- [ ] Backend deployed to Vercel
- [ ] Environment variables added in Vercel Dashboard
- [ ] Backend URL obtained
- [ ] Health endpoint working: `/health`
- [ ] API endpoints accessible: `/api/*`
- [ ] Frontend `NEXT_PUBLIC_API_URL` updated
- [ ] Backend `CORS_ORIGIN` updated
- [ ] Both services redeployed
- [ ] Integration tested (login works)
- [ ] Logs checked (no errors)

---

## 🎯 Quick Reference

### Backend URLs

After deployment, you'll have:
- **Backend URL:** `https://digital-iskole-backend-xxx.vercel.app`
- **API Base URL:** `https://digital-iskole-backend-xxx.vercel.app/api`
- **Health Check:** `https://digital-iskole-backend-xxx.vercel.app/health`

### Important Files

- `backend/vercel.json` - Vercel configuration
- `backend/src/server.ts` - Server entry point (already configured)
- `backend/package.json` - Dependencies
- `backend/tsconfig.json` - TypeScript configuration

### Key Commands

```bash
# Test build locally
cd backend
npm run build

# Deploy via CLI
cd backend
vercel
vercel --prod

# Check logs (in Vercel Dashboard)
# Deployments → Latest → View Function Logs
```

---

## 🚀 Next Steps

After successful deployment:

1. ✅ Test all API endpoints
2. ✅ Set up custom domain (optional)
3. ✅ Configure monitoring/alerts
4. ✅ Set up CI/CD for auto-deployment
5. ✅ Review function logs regularly
6. ✅ Monitor function execution times
7. ✅ Consider upgrading to Pro plan if hitting timeouts

---

**🎉 Your backend is now deployed to Vercel!**

For issues or questions, check the logs in Vercel Dashboard and refer to the troubleshooting section above.

---

## 📚 Additional Resources

- [Vercel Serverless Functions Docs](https://vercel.com/docs/functions)
- [Vercel Node.js Runtime](https://vercel.com/docs/functions/runtimes/node-js)
- [Express on Vercel](https://vercel.com/guides/express)
- [Environment Variables in Vercel](https://vercel.com/docs/concepts/projects/environment-variables)
