# Console errors explained (live web)

## Not from your app (safe to ignore)

### 1. `Unchecked runtime.lastError: The page keeping the extension port is moved into back/forward cache, so the message channel is closed.`

- **Source:** A **browser extension** (e.g. React DevTools, Redux DevTools, password manager, ad blocker).
- **Cause:** When the page is put in the browser’s back/forward cache (bfcache), the extension’s message port is closed and it logs this.
- **Action:** Ignore it, or disable the extension on your site / use an incognito window without extensions to get a clean console.

### 2. `[mobx-state-tree] You are trying to read or write to an object that is no longer part of a state tree...` (in `sw.js`)

- **Source:** A **browser extension** (e.g. Cursor/IDE tools or another dev extension that injects into pages). The stack mentions `tabStates`, `injectionLifecycle`, `content-dom-snapshot`.
- **Cause:** The extension uses mobx-state-tree and touches objects after they’re removed from the tree (e.g. when the page is cached or navigated away).
- **Action:** Your app does **not** use mobx-state-tree. Ignore these or disable the extension to reduce console noise.

---

## From your app (needs backend fix)

### 3. `503` on `.../api/reports/.../download`

- **Source:** Your backend (Vercel serverless).
- **Cause:** The download endpoint runs Puppeteer/Chromium to generate the PDF. On Vercel this can hit timeout or memory limits and return 503.
- **Action:** Use PDF caching (return signed URL for an already-generated PDF when possible) and/or pre-generate the PDF when the report is created so the download endpoint never runs Puppeteer. See backend report download flow and pre-generation in the codebase.
