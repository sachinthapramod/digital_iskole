# Vercel Backend Logger Fix

**Issue:** Backend crashes on Vercel with error:
```
Error: ENOENT: no such file or directory, mkdir '/var/task/logs'
```

**Root Cause:** Logger tries to create a `logs` directory and write files, but Vercel serverless functions have a read-only filesystem.

**Solution:** Updated logger to detect serverless environments and skip file logging.

---

## ✅ Fix Applied

Updated `backend/src/utils/logger.ts` to:

1. **Detect serverless environments:**
   - Checks for `VERCEL === '1'` or `VERCEL_ENV` or `AWS_LAMBDA_FUNCTION_NAME`

2. **Skip file logging on serverless:**
   - Only creates logs directory in non-serverless environments
   - Only adds file transports (error.log, combined.log) if NOT serverless
   - Always uses console transport (Vercel captures console logs)

3. **Error handling:**
   - Wrapped file operations in try-catch
   - Falls back to console-only logging if file operations fail

---

## 🔧 Changes Made

**Before:**
- Always created `logs` directory
- Always added file transports
- Crashed on Vercel (read-only filesystem)

**After:**
- Checks if running on serverless
- Skips file operations on serverless
- Uses console transport only on serverless
- Works on both local and Vercel

---

## ✅ Next Steps

1. **Commit the fix:**
   ```bash
   git add backend/src/utils/logger.ts
   git commit -m "Fix logger for Vercel serverless deployment"
   git push
   ```

2. **Redeploy on Vercel:**
   - Vercel will auto-deploy (if GitHub integration is set up)
   - Or manually redeploy from Vercel Dashboard

3. **Verify:**
   - Check Vercel logs - should no longer see the mkdir error
   - Test backend endpoints - should work correctly
   - Logs will appear in Vercel's console (not in files)

---

## 📝 Notes

- **Console logs on Vercel:** Vercel captures console.log output and shows it in the Function Logs
- **File logs:** Only available in local/non-serverless environments
- **Production:** All logs still appear, just in console instead of files

---

## ✅ Verification

After redeploy, test:

```bash
# Health check
curl https://digital-iskole-backend-xxx.vercel.app/health

# Should return: {"status":"ok",...}
```

The backend should now work correctly on Vercel! 🎉
