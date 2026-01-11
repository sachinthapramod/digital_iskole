# Firebase Setup - Quick Checklist

Use this checklist as you go through the Firebase setup process.

---

## ✅ Setup Steps

### 1. Create Project
- [ ] Go to [console.firebase.google.com](https://console.firebase.google.com)
- [ ] Click "Add project"
- [ ] Enter project name: `digital-iskole`
- [ ] Choose Analytics (optional)
- [ ] Wait for project creation

### 2. Enable Authentication
- [ ] Go to **Authentication** > **Sign-in method**
- [ ] Enable **Email/Password**
- [ ] Click **Save**

### 3. Create Firestore
- [ ] Go to **Firestore Database**
- [ ] Click **Create database**
- [ ] Select **Production mode**
- [ ] Choose location
- [ ] Click **Enable**

### 4. Enable Storage
- [ ] Go to **Storage**
- [ ] Click **Get started**
- [ ] Select **Production mode**
- [ ] Choose location
- [ ] Click **Done**

### 5. Get Frontend Config
- [ ] Go to **⚙️ Project Settings**
- [ ] Scroll to **Your apps**
- [ ] Click **</> Web** icon (or use existing app)
- [ ] Copy these 6 values:
  - [ ] `apiKey` → `NEXT_PUBLIC_FIREBASE_API_KEY`
  - [ ] `authDomain` → `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
  - [ ] `projectId` → `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
  - [ ] `storageBucket` → `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
  - [ ] `messagingSenderId` → `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
  - [ ] `appId` → `NEXT_PUBLIC_FIREBASE_APP_ID`

### 6. Get Backend Service Account
- [ ] Go to **⚙️ Project Settings** > **Service accounts** tab
- [ ] Click **Generate new private key**
- [ ] Click **Generate key** (downloads JSON file)
- [ ] Open JSON file and copy these 4 values:
  - [ ] `project_id` → `FIREBASE_PROJECT_ID`
  - [ ] `client_email` → `FIREBASE_CLIENT_EMAIL`
  - [ ] `private_key` → `FIREBASE_PRIVATE_KEY` (keep `\n`!)
  - [ ] Storage bucket → `FIREBASE_STORAGE_BUCKET` (usually `{project_id}.appspot.com`)

### 7. Set Security Rules
- [ ] Go to **Firestore Database** > **Rules** tab
- [ ] Copy rules from [FIREBASE-SETUP-GUIDE.md](./FIREBASE-SETUP-GUIDE.md) Step 7.1
- [ ] Click **Publish**
- [ ] Go to **Storage** > **Rules** tab
- [ ] Copy rules from [FIREBASE-SETUP-GUIDE.md](./FIREBASE-SETUP-GUIDE.md) Step 7.2
- [ ] Click **Publish**

---

## 📝 Where to Put Values

### Frontend (`.env.local` in project root)
```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### Backend (`backend/.env`)
```env
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET=...
JWT_SECRET=your-secret-key
```

---

## 🎯 Next Steps After Firebase Setup

1. [ ] Create `.env.local` with frontend values
2. [ ] Create `backend/.env` with backend values
3. [ ] Run `cd backend && npm run check-env` to verify
4. [ ] Run `cd backend && npm run create-admin` to create admin user
5. [ ] Start frontend: `npm run dev`
6. [ ] Start backend: `cd backend && npm run dev`

---

## 📚 Full Guide

For detailed step-by-step instructions with explanations, see:
**[FIREBASE-SETUP-GUIDE.md](./FIREBASE-SETUP-GUIDE.md)**

---

## ⚠️ Important Reminders

- ❌ **Never commit** `.env` or `.env.local` to Git
- 🔒 **Keep** service account JSON file secure
- ✅ **Use production mode** (not test mode)
- 📋 **Copy values carefully** - especially the private key with `\n`
