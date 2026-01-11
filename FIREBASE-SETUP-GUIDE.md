# Firebase Setup Guide - Step by Step

This guide will walk you through setting up Firebase for the Digital Iskole project, including both frontend (client-side) and backend (server-side) configurations.

---

## 📋 Table of Contents

1. [Create Firebase Project](#step-1-create-firebase-project)
2. [Enable Authentication](#step-2-enable-authentication)
3. [Create Firestore Database](#step-3-create-firestore-database)
4. [Enable Storage](#step-4-enable-storage)
5. [Get Frontend Configuration](#step-5-get-frontend-configuration)
6. [Get Backend Service Account](#step-6-get-backend-service-account)
7. [Set Up Security Rules](#step-7-set-up-security-rules)
8. [Verify Setup](#step-8-verify-setup)

---

## Step 1: Create Firebase Project

### 1.1 Go to Firebase Console

1. Open your web browser
2. Go to [https://console.firebase.google.com/](https://console.firebase.google.com/)
3. Sign in with your Google account (or create one if needed)

### 1.2 Create a New Project

1. Click **"Add project"** or **"Create a project"** button
2. **Enter project name**: `digital-iskole` (or any name you prefer)
3. Click **"Continue"**

### 1.3 Configure Google Analytics (Optional)

1. You'll be asked if you want to enable Google Analytics
2. **For this project, you can choose either:**
   - ✅ **Enable** (recommended for production)
   - ❌ **Disable** (simpler for development)
3. If enabled, select or create an Analytics account
4. Click **"Create project"**

### 1.4 Wait for Project Creation

- Firebase will create your project (takes 30-60 seconds)
- Click **"Continue"** when done

---

## Step 2: Enable Authentication

### 2.1 Navigate to Authentication

1. In your Firebase project dashboard, look for the left sidebar
2. Click on **"Authentication"** (or the 🔐 icon)
3. Click **"Get started"** if you see it

### 2.2 Enable Email/Password Sign-in

1. Click on the **"Sign-in method"** tab (at the top)
2. You'll see a list of sign-in providers
3. Find **"Email/Password"** in the list
4. Click on **"Email/Password"**
5. **Enable** the toggle switch at the top
6. **Enable** "Email/Password" (first option)
7. Click **"Save"**

✅ **Done!** Email/Password authentication is now enabled.

---

## Step 3: Create Firestore Database

### 3.1 Navigate to Firestore

1. In the left sidebar, click on **"Firestore Database"** (or **"Build"** > **"Firestore Database"**)
2. Click **"Create database"** button

### 3.2 Choose Security Rules Mode

1. You'll see two options:
   - **Production mode** (recommended) - More secure, requires authentication
   - **Test mode** - Less secure, allows all reads/writes for 30 days
2. **Select "Start in production mode"** ✅
3. Click **"Next"**

### 3.3 Choose Location

1. Select a **Cloud Firestore location** (choose the closest to your users)
   - Example: `us-central`, `europe-west`, `asia-southeast1`
2. Click **"Enable"**
3. Wait for Firestore to be created (30-60 seconds)

✅ **Done!** Firestore database is now created.

---

## Step 4: Enable Storage

### 4.1 Navigate to Storage

1. In the left sidebar, click on **"Storage"** (or **"Build"** > **"Storage"**)
2. Click **"Get started"** button

### 4.2 Set Up Storage

1. You'll see security rules setup
2. **Select "Start in production mode"** ✅
3. Click **"Next"**

### 4.3 Choose Storage Location

1. Select a **Cloud Storage location** (should match your Firestore location)
2. Click **"Done"**
3. Wait for Storage to be enabled (30-60 seconds)

✅ **Done!** Storage is now enabled.

---

## Step 5: Get Frontend Configuration

This configuration is used in your Next.js frontend (`.env.local` file).

### 5.1 Go to Project Settings

1. Click on the **gear icon** ⚙️ (top left, next to "Project Overview")
2. Click **"Project settings"**

### 5.2 Add a Web App (if not already added)

1. Scroll down to **"Your apps"** section
2. If you see a web app already, skip to step 5.3
3. If not, click the **"</>" (Web)** icon to add a web app

### 5.3 Register Your App

1. **App nickname**: `Digital Iskole Web` (or any name)
2. **Firebase Hosting**: You can skip this for now (uncheck if checked)
3. Click **"Register app"**

### 5.4 Copy Configuration

You'll see a code snippet like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

**Copy these values** - you'll need them for your `.env.local` file:

- `apiKey` → `NEXT_PUBLIC_FIREBASE_API_KEY` (also needed as `FIREBASE_WEB_API_KEY` in backend `.env`)
- `authDomain` → `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `projectId` → `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `storageBucket` → `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `messagingSenderId` → `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `appId` → `NEXT_PUBLIC_FIREBASE_APP_ID`

**Important:** The `apiKey` value is the same as `FIREBASE_WEB_API_KEY` that you'll need for the backend `.env` file. This is used by the backend to verify passwords using Firebase Auth REST API.

**Or** you can find these values later in **Project Settings** > **Your apps** > **Web app** > **Config**

✅ **Save these values** - you'll add them to `.env.local` in the frontend setup and `FIREBASE_WEB_API_KEY` to backend `.env`.

---

## Step 6: Get Backend Service Account

This is for your Express backend server (`.env` file in `backend/` directory).

### 6.1 Go to Service Accounts

1. Still in **Project Settings** (gear icon ⚙️)
2. Click on the **"Service accounts"** tab (at the top)

### 6.2 Generate Private Key

1. You'll see a section titled **"Firebase Admin SDK"**
2. Click the **"Generate new private key"** button
3. A popup will appear warning you about security
4. Click **"Generate key"**

### 6.3 Download JSON File

1. A JSON file will be downloaded (e.g., `your-project-firebase-adminsdk-xxxxx.json`)
2. **⚠️ IMPORTANT:** Keep this file secure! It has admin access to your Firebase project.
3. **DO NOT** commit this file to Git

### 6.4 Extract Values from JSON

Open the downloaded JSON file. It will look like this:

```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
}
```

**Copy these values** for your `backend/.env` file:

- `project_id` → `FIREBASE_PROJECT_ID`
- `client_email` → `FIREBASE_CLIENT_EMAIL`
- `private_key` → `FIREBASE_PRIVATE_KEY` (keep the `\n` newlines!)
- `storageBucket` → `FIREBASE_STORAGE_BUCKET` (usually `{project_id}.appspot.com`)
- `apiKey` from Step 5.4 → `FIREBASE_WEB_API_KEY` (same as the web app's `apiKey`)

**Example format for `.env`:**

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
FIREBASE_WEB_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

**Note:** `FIREBASE_WEB_API_KEY` is required for password verification during login. It's the same `apiKey` you copied in Step 5.4.

**⚠️ Important Notes:**
- The `private_key` must be in quotes (`"..."`) in your `.env` file
- Keep the `\n` characters - they represent newlines
- The entire key should be on one line in the `.env` file (with `\n` characters)

✅ **Save these values** - you'll add them to `backend/.env`.

---

## Step 7: Set Up Security Rules

### 7.1 Firestore Security Rules

1. Go to **Firestore Database** in the left sidebar
2. Click on the **"Rules"** tab (at the top)
3. Replace the default rules with these:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isAuthenticated() && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    function isTeacher() {
      return isAuthenticated() && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'teacher';
    }
    
    function isParent() {
      return isAuthenticated() && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'parent';
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create: if isAdmin();
      allow update: if isAdmin() || isOwner(userId);
      allow delete: if isAdmin();
    }
    
    // Students collection
    match /students/{studentId} {
      allow read: if isAuthenticated();
      allow create, update, delete: if isAdmin();
    }
    
    // Classes collection
    match /classes/{classId} {
      allow read: if isAuthenticated();
      allow create, update, delete: if isAdmin();
    }
    
    // Subjects collection
    match /subjects/{subjectId} {
      allow read: if isAuthenticated();
      allow create, update, delete: if isAdmin();
    }
    
    // Attendance collection
    match /attendance/{attendanceId} {
      allow read: if isAuthenticated();
      allow create, update: if isAdmin() || isTeacher();
      allow delete: if isAdmin();
    }
    
    // Exams collection
    match /exams/{examId} {
      allow read: if isAuthenticated();
      allow create, update, delete: if isAdmin() || isTeacher();
    }
    
    // Marks collection
    match /marks/{markId} {
      allow read: if isAuthenticated();
      allow create, update: if isAdmin() || isTeacher();
      allow delete: if isAdmin();
    }
    
    // Appointments collection
    match /appointments/{appointmentId} {
      allow read: if isAuthenticated();
      allow create: if isParent();
      allow update: if isAdmin() || isTeacher() || 
        (isParent() && resource.data.parentId == request.auth.uid);
      allow delete: if isAdmin();
    }
    
    // Notices collection
    match /notices/{noticeId} {
      allow read: if isAuthenticated();
      allow create: if isAdmin() || isTeacher();
      allow update, delete: if isAdmin() || 
        (isTeacher() && resource.data.authorId == request.auth.uid);
    }
    
    // Notifications collection
    match /notifications/{notificationId} {
      allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow create: if isAdmin() || isTeacher();
      allow update, delete: if resource.data.userId == request.auth.uid;
    }
    
    // Reports collection
    match /reports/{reportId} {
      allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated();
      allow delete: if resource.data.userId == request.auth.uid;
    }
    
    // Settings collection
    match /settings/{settingId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
    
    // Academic Years collection
    match /academicYears/{yearId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
  }
}
```

4. Click **"Publish"** button

✅ **Done!** Firestore security rules are set.

### 7.2 Storage Security Rules

1. Go to **Storage** in the left sidebar
2. Click on the **"Rules"** tab (at the top)
3. Replace the default rules with these:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Profile pictures
    match /profile-pictures/{userId}/{fileName} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && request.auth.uid == userId;
    }
    
    // Exam papers
    match /exam-papers/{studentId}/{examId}/{fileName} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated();
    }
    
    // Reports
    match /reports/{userId}/{fileName} {
      allow read: if isAuthenticated() && request.auth.uid == userId;
      allow write: if isAuthenticated() && request.auth.uid == userId;
    }
    
    // General uploads
    match /uploads/{allPaths=**} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated();
    }
  }
}
```

4. Click **"Publish"** button

✅ **Done!** Storage security rules are set.

---

## Step 8: Verify Setup

### 8.1 Checklist

Make sure you have completed:

- ✅ Created Firebase project
- ✅ Enabled Email/Password authentication
- ✅ Created Firestore database (production mode)
- ✅ Enabled Storage (production mode)
- ✅ Copied frontend config values (6 values)
- ✅ Downloaded and extracted backend service account (4 values)
- ✅ Set up Firestore security rules
- ✅ Set up Storage security rules

### 8.2 Next Steps

Now you can:

1. **Set up Frontend:**
   - Create `.env.local` in project root
   - Add the 6 frontend config values (from Step 5)

2. **Set up Backend:**
   - Create `backend/.env`
   - Add the 4 backend service account values (from Step 6)
   - Add JWT secret and other config

3. **Create Admin User:**
   ```bash
   cd backend
   npm run create-admin
   ```

---

## 📝 Quick Reference

### Frontend Values (`.env.local`)

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abc...
```

### Backend Values (`backend/.env`)

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
```

---

## 🔒 Security Reminders

1. **Never commit** `.env` or `.env.local` files to Git
2. **Never share** your service account private key
3. **Keep** the downloaded JSON file secure
4. **Rotate** keys if they're ever exposed
5. **Use** production mode security rules (not test mode)

---

## 🆘 Troubleshooting

### "Permission denied" errors
- Check that security rules are published
- Verify user is authenticated
- Check user role in Firestore `users` collection

### "Invalid credentials" errors
- Verify all environment variables are set correctly
- Check that `FIREBASE_PRIVATE_KEY` includes `\n` newlines
- Ensure no extra spaces in `.env` file

### "Project not found" errors
- Verify `FIREBASE_PROJECT_ID` matches your Firebase project
- Check that the project exists in Firebase Console

---

**Need help?** Check the main [SETUP-AND-DEPLOYMENT.md](./SETUP-AND-DEPLOYMENT.md) guide for next steps.
