# Quick Start Guide - Digital Iskole

## 🚀 Quick Setup (5 minutes)

### 1. Install Dependencies

```bash
# Frontend
npm install

# Backend
cd backend
npm install
cd ..
```

### 2. Set Up Firebase

**First, configure Firebase:**
- See **[FIREBASE-SETUP-GUIDE.md](./FIREBASE-SETUP-GUIDE.md)** for detailed step-by-step instructions
- Or use **[FIREBASE-QUICK-CHECKLIST.md](./FIREBASE-QUICK-CHECKLIST.md)** for a quick checklist

**Then create environment files:**

**Frontend** - Create `.env.local` in project root:
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

**Backend** - Create `backend/.env`:
```bash
PORT=3001
NODE_ENV=development
API_BASE_URL=http://localhost:3001/api
CORS_ORIGIN=http://localhost:3000
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
```

### 3. Run Development Servers

**Terminal 1 (Frontend):**
```bash
npm run dev
```
→ http://localhost:3000

**Terminal 2 (Backend):**
```bash
cd backend
npm run dev
```
→ http://localhost:3001/api

### 4. Create Admin User

```bash
cd backend
npm run create-admin
```

---

## 📦 Deploy to Vercel

### Frontend
1. Push code to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy ✅

### Backend
**Recommended: Railway**
1. Sign up at [railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. Set Root Directory: `backend`
4. Add environment variables
5. Deploy ✅

**Then:** Update `NEXT_PUBLIC_API_URL` in frontend Vercel project

---

## 📚 Full Documentation

See [SETUP-AND-DEPLOYMENT.md](./SETUP-AND-DEPLOYMENT.md) for detailed instructions.

---

## 🔧 Common Commands

```bash
# Frontend
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server

# Backend
cd backend
npm run dev          # Start dev server
npm run build        # Build TypeScript
npm start            # Start production server
npm run create-admin # Create admin user
```

---

## ⚠️ Troubleshooting

**Frontend won't start?**
- Check `.env.local` exists and has all variables
- Run `npm install` again

**Backend won't start?**
- Check `backend/.env` exists
- Verify Firebase credentials
- Check port 3001 is available

**CORS errors?**
- Ensure backend `CORS_ORIGIN` matches frontend URL
- Check both servers are running

---

**Need help?** Check [SETUP-AND-DEPLOYMENT.md](./SETUP-AND-DEPLOYMENT.md) for detailed troubleshooting.
