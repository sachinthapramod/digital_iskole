# Digital Iskole – Deployment checklist

Use this before and after deploying to production (e.g. Vercel).

---

## 1. Pre-deploy verification

- [x] **Backend** – `cd backend && npx tsc --noEmit` (compiles)
- [x] **Frontend** – `npm run build` (Next.js build succeeds)
- [ ] **Env** – All required variables set in Vercel (see below)

---

## 2. Environment variables

### Frontend (Vercel project – Next.js)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | Backend API base URL, e.g. `https://digital-iskole-backend.vercel.app/api` |

### Backend (Vercel project – Node/Express)

| Variable | Required | Description |
|----------|----------|-------------|
| `FIREBASE_PROJECT_ID` | Yes | Firebase project ID |
| `FIREBASE_CLIENT_EMAIL` | Yes | Firebase service account client email |
| `FIREBASE_PRIVATE_KEY` | Yes | Firebase service account private key (with `\n` for newlines) |
| `FIREBASE_STORAGE_BUCKET` | Optional | Defaults to `{projectId}.appspot.com` |
| `API_BASE_URL` | Optional | Full API base URL, e.g. `https://digital-iskole-backend.vercel.app/api` (used to derive path) |
| `CORS_ORIGIN` | Yes (live) | Frontend origin(s), e.g. `https://your-app.vercel.app` (comma-separated for multiple) |
| `JWT_SECRET` | Yes | Secret for signing JWT tokens |
| `PORT` | Optional | Defaults to 3001 locally |

---

## 3. Key behaviour (double-check)

### Reports

- **Generate report (student/class/school)**  
  - Always returns **201** with the report.  
  - PDF is pre-generated in the background (fire-and-forget). If it completes, the report gets `pdfFilename` and download will work.

- **Download report**  
  - If the report has a cached PDF in Firebase Storage: returns **200** with `downloadUrl` and `filename` (no Puppeteer, so no 503).  
  - If no cached PDF: returns **503** with message *"PDF is not ready for this report. Please regenerate the report from the Reports page, then try downloading again."*  
  - Frontend shows that message when 503 is returned.

- **Old reports (created before PDF caching)**  
  - Have no `pdfFilename`. User must **regenerate** the report from the Reports page, then download again.

### API root (live)

- **GET /** and **GET /api** return a friendly JSON payload (no 404).
- **GET /health** returns `{ status: 'ok', ... }`.

### Firebase Storage

- Report PDFs are stored at `reports/{reportId}/{safeFilename}.pdf`.
- Backend needs Storage enabled and service account with write + signed URL permissions.

---

## 4. After deploy

1. **Frontend**  
   - Open the live app URL.  
   - Log in and confirm dashboard loads.

2. **Backend**  
   - Open `https://<backend-domain>/api` → expect JSON (Digital Iskole API).  
   - Open `https://<backend-domain>/health` → expect `{ "status": "ok" }`.

3. **CORS**  
   - From the live frontend, trigger any API call (e.g. reports list).  
   - If CORS is wrong, browser console will show CORS errors; fix by setting `CORS_ORIGIN` on the backend to the exact frontend origin.

4. **Reports**  
   - Create a **new** report (student/class/school).  
   - Wait a few seconds (for background PDF).  
   - Click **Download** → should open/download PDF (or show the “PDF not ready” message if background didn’t finish; try again or regenerate).  
   - For **old** reports, expect “PDF not ready” until the report is regenerated.

---

## 5. Optional

- **Vercel** – Backend `vercel.json` has `maxDuration: 60` and `memory: 3008`; these may require a Pro plan.  
- **Console noise** – `runtime.lastError` and mobx-state-tree errors in the console come from **browser extensions**, not the app. See `docs/CONSOLE-ERRORS-EXPLAINED.md`.
