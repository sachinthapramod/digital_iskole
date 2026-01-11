# Digital Iskole - Complete Setup & Deployment Guide

This guide will help you set up and run both the frontend (Next.js) and backend (Express/Node.js) locally, and deploy them to Vercel.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Structure](#project-structure)
3. [Local Development Setup](#local-development-setup)
   - [Frontend Setup](#frontend-setup)
   - [Backend Setup](#backend-setup)
   - [Running Both Services](#running-both-services)
4. [Vercel Deployment](#vercel-deployment)
   - [Frontend Deployment](#frontend-deployment)
   - [Backend Deployment](#backend-deployment)
5. [Environment Variables](#environment-variables)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have:

- **Node.js** 18.x or higher ([Download](https://nodejs.org/))
- **npm** or **pnpm** (comes with Node.js)
- **Firebase Account** ([Sign up](https://firebase.google.com/))
- **Git** installed
- **Vercel Account** ([Sign up](https://vercel.com/))

---

## Project Structure

```
digital_iskole/
├── app/                    # Next.js app directory (Frontend)
├── components/             # React components
├── lib/                    # Utilities, services, Firebase config
├── backend/                # Express API server (Backend)
│   ├── src/
│   │   ├── config/        # Firebase Admin SDK config
│   │   ├── controllers/   # Request handlers
│   │   ├── middleware/    # Express middleware
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   └── server.ts      # Server entry point
│   └── package.json
├── package.json           # Frontend dependencies
└── next.config.mjs        # Next.js configuration
```

---

## Local Development Setup

### Frontend Setup

#### Step 1: Install Dependencies

```bash
# Navigate to project root
cd digital_iskole

# Install frontend dependencies
npm install
# OR if using pnpm (recommended based on pnpm-lock.yaml)
pnpm install
```

#### Step 2: Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
# .env.local (Frontend)

# Firebase Configuration (Client-side)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Backend API URL (for local development)
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

**How to get Firebase config:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create a new one)
3. Click the gear icon ⚙️ > **Project Settings**
4. Scroll to **Your apps** section
5. Click **Add app** > **Web** (or select existing web app)
6. Copy the configuration values

#### Step 3: Run Frontend Development Server

```bash
npm run dev
# OR
pnpm dev
```

The frontend will be available at: **http://localhost:3000**

---

### Backend Setup

#### Step 1: Install Backend Dependencies

```bash
# Navigate to backend directory
cd backend

# Install backend dependencies
npm install
```

#### Step 2: Configure Backend Environment Variables

Create a `.env` file in the `backend/` directory:

```bash
# backend/.env

# Server Configuration
PORT=3001
NODE_ENV=development

# API Configuration
API_BASE_URL=http://localhost:3001/api
CORS_ORIGIN=http://localhost:3000

# Firebase Admin SDK Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
```

**How to get Firebase Admin SDK credentials:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click the gear icon ⚙️ > **Project Settings**
4. Go to **Service Accounts** tab
5. Click **Generate New Private Key**
6. Download the JSON file
7. Copy the following values:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY` (keep the `\n` newlines or use the format shown above)
   - `storageBucket` → `FIREBASE_STORAGE_BUCKET` (or use `{project-id}.appspot.com`)

**Generate JWT Secret:**
```bash
# On Linux/Mac
openssl rand -base64 32

# On Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

#### Step 3: Set Up Firebase Services

Enable the following in Firebase Console:

1. **Authentication**
   - Go to **Authentication** > **Sign-in method**
   - Enable **Email/Password** provider

2. **Firestore Database**
   - Go to **Firestore Database**
   - Click **Create database**
   - Start in **Production mode**
   - Select your preferred region

3. **Storage**
   - Go to **Storage**
   - Click **Get started**
   - Start in **Production mode**

#### Step 4: Create Initial Admin User

```bash
# From backend directory
npm run create-admin
```

Follow the prompts to create an admin user.

#### Step 5: Run Backend Development Server

```bash
# From backend directory
npm run dev
```

The backend API will be available at: **http://localhost:3001/api**

**Test the backend:**
```bash
# Health check
curl http://localhost:3001/health
```

---

### Running Both Services

You need to run both frontend and backend simultaneously:

#### Option 1: Two Terminal Windows

**Terminal 1 (Frontend):**
```bash
cd digital_iskole
npm run dev
```

**Terminal 2 (Backend):**
```bash
cd digital_iskole/backend
npm run dev
```

#### Option 2: Using npm-run-all (Recommended)

Install `npm-run-all` globally:
```bash
npm install -g npm-run-all
```

Create a script in root `package.json`:
```json
{
  "scripts": {
    "dev:frontend": "next dev",
    "dev:backend": "cd backend && npm run dev",
    "dev": "npm-run-all --parallel dev:frontend dev:backend"
  }
}
```

Then run:
```bash
npm run dev
```

---

## Vercel Deployment

### Frontend Deployment

#### Step 1: Prepare for Deployment

1. **Build the frontend locally to check for errors:**
   ```bash
   npm run build
   ```

2. **Ensure `.env.local` is NOT committed** (should be in `.gitignore`)

#### Step 2: Deploy to Vercel

**Option A: Using Vercel CLI**

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```
   
   Follow the prompts:
   - Link to existing project? **No** (first time) or **Yes** (updates)
   - Project name: `digital-iskole` (or your choice)
   - Directory: `./` (current directory)
   - Override settings? **No**

4. For production deployment:
   ```bash
   vercel --prod
   ```

**Option B: Using Vercel Dashboard**

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New Project**
3. Import your Git repository (GitHub/GitLab/Bitbucket)
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (root)
   - **Build Command**: `npm run build` (or `pnpm build`)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (or `pnpm install`)

#### Step 3: Configure Environment Variables in Vercel

1. Go to your project in Vercel Dashboard
2. Navigate to **Settings** > **Environment Variables**
3. Add all variables from `.env.local`:

   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
   NEXT_PUBLIC_FIREBASE_APP_ID=...
   NEXT_PUBLIC_API_URL=https://your-backend-url.vercel.app/api
   ```

   **Important:** Replace `NEXT_PUBLIC_API_URL` with your deployed backend URL (see Backend Deployment below).

4. Select **Production**, **Preview**, and **Development** environments
5. Click **Save**

#### Step 4: Redeploy

After adding environment variables, trigger a new deployment:
- Go to **Deployments** tab
- Click **Redeploy** on the latest deployment
- Or push a new commit to trigger automatic deployment

---

### Backend Deployment

**Important:** The backend is an Express.js server. For production, you have several deployment options:

#### Option 1: Deploy Backend to Railway (Recommended - Easiest)

[Railway](https://railway.app) is excellent for Node.js backends and offers a free tier.

1. **Sign up at [railway.app](https://railway.app)**

2. **Create a new project:**
   - Click **New Project**
   - Select **Deploy from GitHub repo** (connect your GitHub account)
   - Select your repository
   - Set **Root Directory** to `backend`

3. **Configure Environment Variables:**
   - Go to **Variables** tab
   - Add all variables from `backend/.env`:
     ```
     PORT=3001
     NODE_ENV=production
     API_BASE_URL=https://your-app.railway.app/api
     CORS_ORIGIN=https://your-frontend.vercel.app
     FIREBASE_PROJECT_ID=...
     FIREBASE_CLIENT_EMAIL=...
     FIREBASE_PRIVATE_KEY=...
     FIREBASE_STORAGE_BUCKET=...
     JWT_SECRET=...
     JWT_EXPIRES_IN=24h
     JWT_REFRESH_EXPIRES_IN=7d
     ```

4. **Deploy:**
   - Railway will automatically detect Node.js and deploy
   - Get your backend URL (e.g., `https://your-app.railway.app`)
   - Update `NEXT_PUBLIC_API_URL` in your frontend Vercel deployment

#### Option 2: Deploy Backend to Render

[Render](https://render.com) offers free tier for web services.

1. **Sign up at [render.com](https://render.com)**

2. **Create a new Web Service:**
   - Connect your GitHub repository
   - Set:
     - **Name**: `digital-iskole-backend`
     - **Environment**: `Node`
     - **Build Command**: `cd backend && npm install && npm run build`
     - **Start Command**: `cd backend && npm start`
     - **Root Directory**: `backend`

3. **Add Environment Variables** (same as Railway above)

4. **Deploy and get your backend URL**

#### Option 3: Deploy Backend to Vercel (Serverless)

Vercel can run Express apps as serverless functions, but requires some setup:

1. **Create a separate Vercel project for the backend**

2. **Create `backend/vercel.json`:**
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

3. **The server.ts is already updated** to export the app for Vercel

4. **Deploy:**
   ```bash
   cd backend
   vercel
   ```

5. **Add environment variables in Vercel dashboard**

#### Option 4: Deploy Backend to Other Services

- **Heroku**: Use Heroku CLI or GitHub integration
- **AWS EC2/Elastic Beanstalk**: Traditional server setup
- **Google Cloud Run**: Serverless container platform
- **DigitalOcean App Platform**: Simple PaaS

**After deploying the backend:**
1. Get your backend URL (e.g., `https://your-backend.railway.app`)
2. Update `NEXT_PUBLIC_API_URL` in your frontend Vercel project to point to this URL
3. Update `CORS_ORIGIN` in your backend to allow requests from your frontend URL

---

## Environment Variables Summary

### Frontend (.env.local)

```bash
# Firebase (Client)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:3001/api  # Local
# NEXT_PUBLIC_API_URL=https://your-backend.vercel.app/api  # Production
```

### Backend (backend/.env)

```bash
# Server
PORT=3001
NODE_ENV=development

# API
API_BASE_URL=http://localhost:3001/api
CORS_ORIGIN=http://localhost:3000

# Firebase Admin
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
FIREBASE_STORAGE_BUCKET=

# JWT
JWT_SECRET=
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
```

---

## Troubleshooting

### Frontend Issues

**Issue: "Firebase: Error (auth/configuration-not-found)"**
- ✅ Check all `NEXT_PUBLIC_*` environment variables are set
- ✅ Ensure `.env.local` is in the project root (not in `app/` or `lib/`)
- ✅ Restart the dev server after changing `.env.local`

**Issue: "Cannot connect to API"**
- ✅ Ensure backend is running on port 3001
- ✅ Check `NEXT_PUBLIC_API_URL` is correct
- ✅ Verify CORS is configured in backend

**Issue: Build fails on Vercel**
- ✅ Check Node.js version (should be 18+)
- ✅ Ensure all dependencies are in `package.json`
- ✅ Check build logs in Vercel dashboard

### Backend Issues

**Issue: "Missing Firebase Admin SDK configuration"**
- ✅ Check all Firebase environment variables in `backend/.env`
- ✅ Ensure `FIREBASE_PRIVATE_KEY` includes `\n` newlines
- ✅ Verify service account has proper permissions

**Issue: "CORS errors"**
- ✅ Update `CORS_ORIGIN` in backend `.env` to match frontend URL
- ✅ For production, use your Vercel frontend URL

**Issue: "Port already in use"**
- ✅ Change `PORT` in `backend/.env`
- ✅ Or kill the process: `lsof -ti:3001 | xargs kill` (Mac/Linux)

**Issue: Backend doesn't work on Vercel**
- ✅ Ensure `vercel.json` is configured correctly
- ✅ Check that server exports the app for serverless
- ✅ Verify all environment variables are set in Vercel
- ✅ Check Vercel function logs for errors

### General Issues

**Issue: "Module not found"**
- ✅ Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- ✅ Clear Next.js cache: `rm -rf .next`

**Issue: TypeScript errors**
- ✅ Run `npm run build` to see all errors
- ✅ Check `tsconfig.json` configuration

---

## Next Steps

1. ✅ Set up Firebase Authentication
2. ✅ Configure Firestore security rules (see `docs/BACKEND-SETUP.md`)
3. ✅ Create initial admin user
4. ✅ Test API endpoints
5. ✅ Deploy to Vercel
6. ✅ Set up custom domain (optional)

---

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Express.js Documentation](https://expressjs.com/)

---

## Support

For issues or questions:
1. Check the logs in Vercel dashboard
2. Review Firebase Console for errors
3. Check `docs/` folder for detailed documentation
4. Review `backend/RUNBOOK.md` for backend-specific issues

---

**Last Updated:** January 2025
