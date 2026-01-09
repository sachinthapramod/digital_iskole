# Digital Iskole - Backend Setup Guide

## Prerequisites

- Node.js 18+ installed
- Firebase account
- Git

---

## Step 1: Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a project" or select existing project
3. Enable the following services:

### Authentication
- Go to Authentication > Sign-in method
- Enable "Email/Password" provider

### Firestore Database
- Go to Firestore Database > Create database
- Start in "production mode"
- Select your preferred region

### Storage
- Go to Storage > Get started
- Start in "production mode"

---

## Step 2: Get Firebase Configuration

1. Go to Project Settings (gear icon)
2. Scroll to "Your apps" section
3. Click "Add app" > Web
4. Register app and copy the configuration
5. Create `.env.local` file from `.env.example`
6. Fill in your Firebase configuration values

---

## Step 3: Firestore Security Rules

Go to Firestore > Rules and add:

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

---

## Step 4: Storage Security Rules

Go to Storage > Rules and add:

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
  }
}
```

---

## Step 5: Create Initial Admin User

1. Go to Firebase Console > Authentication
2. Click "Add user"
3. Enter admin email and password
4. Copy the User UID
5. Go to Firestore > users collection
6. Add document with ID = User UID:

```json
{
  "email": "admin@iskole.lk",
  "name": "System Administrator",
  "role": "admin",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

---

## Step 6: Initialize Collections

Create the following empty collections in Firestore:
- `users`
- `students`
- `classes`
- `subjects`
- `attendance`
- `exams`
- `marks`
- `appointments`
- `notices`
- `notifications`
- `reports`
- `settings`
- `academicYears`

---

## Step 7: Install Dependencies

```bash
npm install firebase swr
```

---

## Step 8: Switch from Mock to Firebase Auth

Replace the mock `AuthContext` with Firebase authentication:

```typescript
// In lib/auth/context.tsx
// Change the login function to use Firebase:

import { signIn, logOut, getUserProfile } from '../firebase/auth-service'

const login = async (email: string, password: string): Promise<boolean> => {
  try {
    const user = await signIn(email, password)
    setUser(user)
    return true
  } catch (error) {
    console.error('Login failed:', error)
    return false
  }
}

const logout = async () => {
  await logOut()
  setUser(null)
}
```

---

## Folder Structure

```
lib/
├── firebase/
│   ├── config.ts           # Firebase initialization
│   ├── auth-service.ts     # Authentication functions
│   ├── db-service.ts       # Firestore CRUD operations
│   └── storage-service.ts  # File upload/download
├── services/
│   ├── students.ts         # Student-specific operations
│   ├── attendance.ts       # Attendance operations
│   ├── marks.ts            # Marks & exams operations
│   ├── appointments.ts     # Appointment operations
│   ├── notices.ts          # Notice operations
│   └── notifications.ts    # Notification operations
├── hooks/
│   ├── use-students.ts     # SWR hook for students
│   ├── use-attendance.ts   # SWR hook for attendance
│   └── use-notifications.ts # SWR hook for notifications
└── types/
    └── index.ts            # TypeScript type definitions
```

---

## Testing the Integration

1. Start the development server: `npm run dev`
2. Open browser console for any Firebase errors
3. Test login with the admin user created in Step 5
4. Check Firestore for data being created

---

## Troubleshooting

### "Firebase: Error (auth/configuration-not-found)"
- Check that all environment variables are set correctly in `.env.local`

### "Missing or insufficient permissions"
- Review Firestore security rules
- Ensure user is authenticated before making requests

### "Cannot read properties of undefined"
- Check that Firebase is initialized before using services
- Ensure user profile exists in Firestore after authentication
