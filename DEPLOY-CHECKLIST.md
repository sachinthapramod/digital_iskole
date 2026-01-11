# Quick Deployment Checklist

**Use this checklist when deploying to Vercel**

---

## 📋 Pre-Deployment Checklist

### Code Preparation
- [ ] All code committed to Git
- [ ] Code pushed to GitHub
- [ ] Build works locally: `npm run build`
- [ ] Frontend runs locally: `npm run dev`
- [ ] Backend runs locally: `cd backend && npm run dev`
- [ ] No TypeScript errors
- [ ] No linter errors

### Firebase Configuration
- [ ] Firebase project created
- [ ] Authentication enabled (Email/Password)
- [ ] Firestore Database created
- [ ] Storage enabled
- [ ] Firebase Web API Key obtained
- [ ] Firebase Admin SDK credentials obtained (service account JSON)

### Environment Variables Ready
- [ ] Frontend `.env.local` file created with all variables
- [ ] Backend `.env` file created with all variables
- [ ] All Firebase credentials available
- [ ] JWT_SECRET generated (min 32 characters)

---

## 🚀 Deployment Steps

### Step 1: Deploy Frontend to Vercel

#### Via Dashboard (Recommended)
- [ ] Go to [vercel.com/dashboard](https://vercel.com/dashboard)
- [ ] Click "Add New Project"
- [ ] Import GitHub repository
- [ ] Configure:
  - Framework: Next.js
  - Root Directory: `./`
  - Build Command: `npm run build`
  - Output Directory: `.next`
- [ ] Click "Deploy" (don't add env vars yet)
- [ ] Wait for deployment to complete
- [ ] Get deployment URL: `https://your-app.vercel.app`
- [ ] ✅ **Frontend deployed!**

#### Via CLI (Alternative)
- [ ] Install Vercel CLI: `npm i -g vercel`
- [ ] Login: `vercel login`
- [ ] Deploy: `vercel`
- [ ] Production: `vercel --prod`
- [ ] ✅ **Frontend deployed!**

### Step 2: Deploy Backend to Railway (Recommended)

- [ ] Go to [railway.app](https://railway.app)
- [ ] Sign in with GitHub
- [ ] Click "New Project"
- [ ] Select "Deploy from GitHub repo"
- [ ] Choose your repository
- [ ] Add service → GitHub Repo
- [ ] Configure:
  - Root Directory: `backend`
  - Build Command: `npm install`
  - Start Command: `npm start`
- [ ] Wait for initial deployment
- [ ] Get backend URL: `https://your-app.up.railway.app`
- [ ] ✅ **Backend deployed!**

### Step 3: Configure Environment Variables

#### Frontend (Vercel)
- [ ] Go to Vercel Dashboard → Your Project → Settings → Environment Variables
- [ ] Add all `NEXT_PUBLIC_*` variables:
  ```
  NEXT_PUBLIC_FIREBASE_API_KEY=...
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
  NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
  NEXT_PUBLIC_FIREBASE_APP_ID=...
  NEXT_PUBLIC_API_URL=https://your-backend.up.railway.app/api
  ```
- [ ] Select: Production, Preview, Development
- [ ] Click "Save"
- [ ] Redeploy frontend

#### Backend (Railway)
- [ ] Go to Railway Dashboard → Your Service → Variables
- [ ] Add all backend variables:
  ```
  PORT=3001
  NODE_ENV=production
  API_BASE_URL=https://your-app.up.railway.app/api
  CORS_ORIGIN=https://your-frontend.vercel.app
  FIREBASE_PROJECT_ID=...
  FIREBASE_CLIENT_EMAIL=...
  FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
  FIREBASE_STORAGE_BUCKET=...
  FIREBASE_WEB_API_KEY=...
  JWT_SECRET=...
  JWT_EXPIRES_IN=24h
  JWT_REFRESH_EXPIRES_IN=7d
  ```
- [ ] Save variables (Railway will auto-redeploy)

### Step 4: Final Configuration

- [ ] Update `CORS_ORIGIN` in backend to match frontend URL exactly
- [ ] Update `NEXT_PUBLIC_API_URL` in frontend to match backend URL + `/api`
- [ ] Redeploy both services
- [ ] ✅ **Configuration complete!**

---

## ✅ Post-Deployment Testing

### Frontend Tests
- [ ] Visit frontend URL: `https://your-app.vercel.app`
- [ ] Page loads without errors
- [ ] No console errors (F12 → Console)
- [ ] Firebase connection working
- [ ] UI renders correctly

### Backend Tests
- [ ] Health check: `curl https://your-backend.up.railway.app/health`
  - Should return: `{"status":"ok",...}`
- [ ] API accessible: `curl https://your-backend.up.railway.app/api/auth/login`
  - Should return JSON (even if error, means API is accessible)

### Integration Tests
- [ ] Open frontend URL
- [ ] Try to login with valid credentials
- [ ] Check Network tab (F12 → Network) for API calls
- [ ] Verify API calls go to backend URL
- [ ] Login should work end-to-end
- [ ] Profile page should load
- [ ] No CORS errors in console

### Error Checks
- [ ] Check Vercel deployment logs (no errors)
- [ ] Check Railway deployment logs (no errors)
- [ ] Check browser console (no errors)
- [ ] Check Network tab (API calls successful)

---

## 🐛 Common Issues & Fixes

### Issue: Frontend shows "Cannot connect to API"
- ✅ Check `NEXT_PUBLIC_API_URL` is set correctly
- ✅ Verify backend URL is correct (include `/api`)
- ✅ Check backend is deployed and running
- ✅ Check CORS configuration

### Issue: CORS errors
- ✅ Update `CORS_ORIGIN` in backend to match frontend URL exactly
- ✅ Include protocol: `https://your-app.vercel.app` (not just domain)
- ✅ Redeploy backend after updating CORS

### Issue: Firebase errors
- ✅ Check all `NEXT_PUBLIC_FIREBASE_*` variables are set
- ✅ Verify Firebase project is configured correctly
- ✅ Check Firebase Console for errors

### Issue: Login not working
- ✅ Check backend logs for errors
- ✅ Verify `FIREBASE_WEB_API_KEY` is set in backend
- ✅ Check admin user exists in Firebase
- ✅ Verify credentials are correct

### Issue: Build fails on Vercel
- ✅ Check build logs in Vercel dashboard
- ✅ Ensure all dependencies in `package.json`
- ✅ Check Node.js version (should be 18+)
- ✅ Try building locally first

---

## 📝 Quick Command Reference

### Local Testing
```bash
# Test frontend build
npm run build

# Test frontend locally
npm run dev

# Test backend locally
cd backend && npm run dev

# Check environment variables (backend)
cd backend && npm run check-env
```

### Deployment
```bash
# Deploy frontend (Vercel CLI)
vercel
vercel --prod

# Deploy backend (Vercel CLI - if using Vercel for backend)
cd backend
vercel
vercel --prod
```

### Testing Production
```bash
# Test backend health
curl https://your-backend.up.railway.app/health

# Test backend API
curl https://your-backend.up.railway.app/api/auth/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@digitaliskole.lk","password":"password"}'
```

---

## 🎯 URLs to Remember

After deployment, save these URLs:

- **Frontend URL:** `https://your-app.vercel.app`
- **Backend URL:** `https://your-app.up.railway.app`
- **Backend API URL:** `https://your-app.up.railway.app/api`

Use these for:
- `CORS_ORIGIN` in backend = Frontend URL
- `NEXT_PUBLIC_API_URL` in frontend = Backend API URL

---

## ✅ Deployment Complete!

Once all checkboxes are marked:
- ✅ Frontend is live on Vercel
- ✅ Backend is live on Railway
- ✅ Environment variables configured
- ✅ CORS configured
- ✅ Integration tested
- ✅ No errors

**🎉 Your Digital Iskole application is now deployed and live!**

---

## 📚 Next Steps

After successful deployment:
- [ ] Set up custom domain (optional)
- [ ] Configure analytics
- [ ] Set up monitoring/alerts
- [ ] Create backup strategy
- [ ] Set up CI/CD for auto-deployment
- [ ] Review security settings

---

**For detailed instructions, see:** `VERCEL-DEPLOYMENT-GUIDE.md`
