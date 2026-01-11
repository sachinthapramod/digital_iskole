# Vercel Deployment Error Troubleshooting

**Error:** `500: INTERNAL_SERVER_ERROR`  
**Code:** `FUNCTION_INVOCATION_FAILED`

---

## 🔍 How to Check Logs

### Step 1: View Deployment Logs

1. **Go to Vercel Dashboard**
2. **Click on your project**
3. **Go to "Deployments" tab**
4. **Click on the latest deployment** (the one that shows the error)
5. **Click "View Function Logs"** or **"Runtime Logs"**

This will show you the actual error message!

---

## 🔧 Common Causes & Fixes

### Issue 1: Missing Environment Variables

**Symptoms:**
- Build succeeds but function crashes
- Error mentions `undefined` or missing config

**Fix:**
1. Go to **Settings → Environment Variables**
2. Verify all required variables are set:
   - All `NEXT_PUBLIC_*` variables for frontend
   - All backend variables (if backend is deployed)
3. Make sure variables are set for **Production** environment
4. **Redeploy** after adding variables

---

### Issue 2: Frontend Trying to Call Backend (Before Backend is Deployed)

**Symptoms:**
- Frontend deployed successfully
- Error appears when accessing the site
- `NEXT_PUBLIC_API_URL` points to `localhost` or missing backend

**Fix:**
- If backend is not deployed yet, this is expected
- The frontend will work, but API calls will fail
- Deploy backend first, then update `NEXT_PUBLIC_API_URL`

---

### Issue 3: TypeScript/Build Errors at Runtime

**Symptoms:**
- Build shows warnings or errors
- Function crashes on first request

**Fix:**
1. **Test build locally:**
   ```bash
   npm run build
   ```
2. **Fix any TypeScript errors**
3. **Check `next.config.mjs`** - ensure `ignoreBuildErrors: true` if needed
4. **Commit and push fixes**
5. **Redeploy**

---

### Issue 4: Firebase Configuration Issues

**Symptoms:**
- Error mentions Firebase
- Firebase initialization fails

**Fix:**
1. **Verify all Firebase variables are set:**
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`

2. **Check variable values are correct** (no extra spaces, correct format)

3. **Redeploy after fixing**

---

### Issue 5: Backend Deployment Crash (If Backend is on Vercel)

**Symptoms:**
- Backend deployed but `/api/*` routes fail
- Health endpoint fails

**Common Causes:**
- Missing `FIREBASE_PRIVATE_KEY` or incorrect format
- Missing `JWT_SECRET`
- TypeScript compilation errors
- Missing `@vercel/node` package

**Fix:**
1. **Check backend logs** (same process as above)
2. **Verify `backend/vercel.json` exists**
3. **Check all backend environment variables are set**
4. **Ensure `FIREBASE_PRIVATE_KEY` includes `\n` newlines**

---

## 📋 Quick Diagnostic Steps

### Step 1: Check What Deployed

**Question:** Is this the frontend or backend deployment?

- **Frontend:** URL looks like `https://digital-iskole-xxx.vercel.app`
- **Backend:** URL looks like `https://digital-iskole-backend-xxx.vercel.app`

### Step 2: Check Logs

1. Vercel Dashboard → Your Project → Deployments
2. Click latest deployment
3. Click "View Function Logs"
4. Look for error messages

### Step 3: Common Error Messages

| Error Message | Likely Cause | Fix |
|--------------|--------------|-----|
| `Cannot find module` | Missing dependency | Check `package.json` |
| `Environment variable not found` | Missing env var | Add to Vercel settings |
| `Firebase: Error` | Firebase config issue | Check Firebase variables |
| `CORS` error | Backend CORS config | Update `CORS_ORIGIN` |
| `TypeError: Cannot read property` | Runtime error | Check logs for specific line |
| `FUNCTION_INVOCATION_FAILED` | Generic runtime error | Check logs for details |

---

## 🎯 Immediate Action

**Right now, do this:**

1. **Go to Vercel Dashboard**
2. **Click your project**
3. **Deployments → Latest deployment**
4. **Click "View Function Logs" or "Runtime Logs"**
5. **Copy the error message**
6. **Share it here or check against common errors above**

---

## ✅ Quick Fixes to Try

### Fix 1: Redeploy

Sometimes a simple redeploy fixes issues:

1. **Deployments tab**
2. **Click "⋯" (three dots) on latest deployment**
3. **Click "Redeploy"**
4. **Select "Use existing Build Cache" (uncheck)**
5. **Click "Redeploy"**

### Fix 2: Check Environment Variables

1. **Settings → Environment Variables**
2. **Verify all variables are there**
3. **Check they're set for Production environment**
4. **Redeploy**

### Fix 3: Test Locally First

```bash
# Test frontend build
npm run build

# Test frontend locally
npm run dev

# Check for errors
```

If it works locally but not on Vercel:
- Check environment variables
- Check build logs on Vercel
- Check for platform-specific issues

---

## 🔍 What Information to Share

If you need help, share:

1. **Which project is failing?** (Frontend or Backend)
2. **Error from logs:** (Copy the actual error from Function Logs)
3. **Build logs:** (Any errors during build phase)
4. **Environment variables:** (List of variables set - without values)
5. **Local test:** (Does `npm run build` work locally?)

---

## 📞 Next Steps

1. ✅ **Check the logs** (most important!)
2. ✅ **Identify the specific error**
3. ✅ **Try quick fixes above**
4. ✅ **If still failing, share the log error message**

The logs will tell us exactly what's wrong! 🎯
