# Digital Iskole - Backend Development Documentation

## Complete Technical Guide for Node.js + Firebase Backend

---

## Table of Contents

1. [System Architecture](#1-system-architecture)
2. [Technology Stack](#2-technology-stack)
3. [Project Structure](#3-project-structure)
4. [Firebase Setup Guide](#4-firebase-setup-guide)
5. [Database Schema](#5-database-schema)
6. [Authentication System](#6-authentication-system)
7. [API Endpoints Specification](#7-api-endpoints-specification)
8. [Service Layer Implementation](#8-service-layer-implementation)
9. [Security Rules](#9-security-rules)
10. [File Storage System](#10-file-storage-system)
11. [Push Notifications](#11-push-notifications)
12. [Report Generation](#12-report-generation)
13. [Error Handling](#13-error-handling)
14. [Environment Configuration](#14-environment-configuration)
15. [Deployment Guide](#15-deployment-guide)
16. [Testing Strategy](#16-testing-strategy)

---

## 1. System Architecture

### 1.1 High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Admin     │  │   Teacher   │  │   Parent    │  │   Mobile    │        │
│  │  Dashboard  │  │  Dashboard  │  │  Dashboard  │  │    App      │        │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘        │
└─────────┼────────────────┼────────────────┼────────────────┼────────────────┘
          │                │                │                │
          └────────────────┴────────────────┴────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              API LAYER                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     Node.js + Express Server                         │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │   │
│  │  │   Auth   │ │  Users   │ │ Academic │ │Attendance│ │  Marks   │  │   │
│  │  │  Routes  │ │  Routes  │ │  Routes  │ │  Routes  │ │  Routes  │  │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘  │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │   │
│  │  │Appointmt │ │ Notices  │ │  Notifs  │ │ Reports  │ │ Settings │  │   │
│  │  │  Routes  │ │  Routes  │ │  Routes  │ │  Routes  │ │  Routes  │  │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SERVICE LAYER                                      │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │    Auth     │ │    User     │ │  Academic   │ │  Attendance │           │
│  │   Service   │ │   Service   │ │   Service   │ │   Service   │           │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘           │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │    Marks    │ │ Appointment │ │   Notice    │ │   Report    │           │
│  │   Service   │ │   Service   │ │   Service   │ │   Service   │           │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘           │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FIREBASE LAYER                                     │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐               │
│  │    Firestore    │ │  Authentication │ │     Storage     │               │
│  │    Database     │ │                 │ │                 │               │
│  │  ┌───────────┐  │ │  ┌───────────┐  │ │  ┌───────────┐  │               │
│  │  │   users   │  │ │  │   Email   │  │ │  │   Exam    │  │               │
│  │  │  students │  │ │  │  Password │  │ │  │  Papers   │  │               │
│  │  │  teachers │  │ │  │   Auth    │  │ │  │  Reports  │  │               │
│  │  │  classes  │  │ │  └───────────┘  │ │  │  Avatars  │  │               │
│  │  │  marks    │  │ │                 │ │  └───────────┘  │               │
│  │  │  etc...   │  │ │                 │ │                 │               │
│  │  └───────────┘  │ │                 │ │                 │               │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘               │
│                                                                              │
│  ┌─────────────────┐                                                        │
│  │ Cloud Messaging │ ← Push Notifications                                   │
│  │      (FCM)      │                                                        │
│  └─────────────────┘                                                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Request Flow Diagram

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Client  │────▶│   Auth   │────▶│  Route   │────▶│ Service  │────▶│ Firebase │
│ Request  │     │Middleware│     │ Handler  │     │  Layer   │     │    DB    │
└──────────┘     └──────────┘     └──────────┘     └──────────┘     └──────────┘
                      │                                                    │
                      │           ┌──────────┐                            │
                      └──────────▶│  Role    │                            │
                                  │  Check   │                            │
                                  └──────────┘                            │
                                                                          │
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐          │
│  Client  │◀────│ Response │◀────│  Format  │◀────│  Data    │◀─────────┘
│ Response │     │          │     │  Output  │     │ Process  │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
```

---

## 2. Technology Stack

### 2.1 Core Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18.x LTS | Runtime environment |
| Express.js | 4.18.x | Web framework |
| TypeScript | 5.x | Type safety |
| Firebase Admin SDK | 11.x | Backend Firebase access |
| Firebase Auth | 9.x | Authentication |
| Cloud Firestore | 9.x | NoSQL database |
| Firebase Storage | 9.x | File storage |
| Firebase Cloud Messaging | 9.x | Push notifications |

### 2.2 Supporting Libraries

| Library | Purpose |
|---------|---------|
| cors | Cross-origin resource sharing |
| helmet | Security headers |
| express-validator | Input validation |
| express-rate-limit | Rate limiting |
| bcryptjs | Password hashing |
| jsonwebtoken | JWT handling |
| multer | File upload handling |
| puppeteer | PDF generation |
| nodemailer | Email sending |
| winston | Logging |
| dotenv | Environment variables |

### 2.3 Development Tools

| Tool | Purpose |
|------|---------|
| Jest | Unit testing |
| Supertest | API testing |
| ESLint | Code linting |
| Prettier | Code formatting |
| nodemon | Development hot reload |
| ts-node | TypeScript execution |

---

## 3. Project Structure

```
digital-iskole-backend/
├── src/
│   ├── config/
│   │   ├── firebase.ts              # Firebase Admin SDK initialization
│   │   ├── database.ts              # Firestore configuration
│   │   ├── storage.ts               # Storage bucket configuration
│   │   └── constants.ts             # App constants
│   │
│   ├── middleware/
│   │   ├── auth.middleware.ts       # JWT/Firebase token verification
│   │   ├── role.middleware.ts       # Role-based access control
│   │   ├── validate.middleware.ts   # Request validation
│   │   ├── upload.middleware.ts     # File upload handling
│   │   ├── rateLimit.middleware.ts  # Rate limiting
│   │   └── error.middleware.ts      # Error handling
│   │
│   ├── routes/
│   │   ├── index.ts                 # Route aggregator
│   │   ├── auth.routes.ts           # Authentication routes
│   │   ├── users.routes.ts          # User management routes
│   │   ├── students.routes.ts       # Student-specific routes
│   │   ├── teachers.routes.ts       # Teacher-specific routes
│   │   ├── parents.routes.ts        # Parent-specific routes
│   │   ├── classes.routes.ts        # Class management routes
│   │   ├── subjects.routes.ts       # Subject management routes
│   │   ├── attendance.routes.ts     # Attendance routes
│   │   ├── exams.routes.ts          # Exam management routes
│   │   ├── marks.routes.ts          # Marks entry routes
│   │   ├── appointments.routes.ts   # Appointment routes
│   │   ├── notices.routes.ts        # Notice routes
│   │   ├── notifications.routes.ts  # Notification routes
│   │   ├── reports.routes.ts        # Report generation routes
│   │   └── settings.routes.ts       # Settings routes
│   │
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── users.controller.ts
│   │   ├── students.controller.ts
│   │   ├── teachers.controller.ts
│   │   ├── parents.controller.ts
│   │   ├── classes.controller.ts
│   │   ├── subjects.controller.ts
│   │   ├── attendance.controller.ts
│   │   ├── exams.controller.ts
│   │   ├── marks.controller.ts
│   │   ├── appointments.controller.ts
│   │   ├── notices.controller.ts
│   │   ├── notifications.controller.ts
│   │   ├── reports.controller.ts
│   │   └── settings.controller.ts
│   │
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── users.service.ts
│   │   ├── students.service.ts
│   │   ├── teachers.service.ts
│   │   ├── parents.service.ts
│   │   ├── classes.service.ts
│   │   ├── subjects.service.ts
│   │   ├── attendance.service.ts
│   │   ├── exams.service.ts
│   │   ├── marks.service.ts
│   │   ├── appointments.service.ts
│   │   ├── notices.service.ts
│   │   ├── notifications.service.ts
│   │   ├── reports.service.ts
│   │   ├── pdf.service.ts
│   │   ├── email.service.ts
│   │   ├── fcm.service.ts
│   │   └── settings.service.ts
│   │
│   ├── models/
│   │   ├── user.model.ts
│   │   ├── student.model.ts
│   │   ├── teacher.model.ts
│   │   ├── parent.model.ts
│   │   ├── class.model.ts
│   │   ├── subject.model.ts
│   │   ├── attendance.model.ts
│   │   ├── exam.model.ts
│   │   ├── mark.model.ts
│   │   ├── appointment.model.ts
│   │   ├── notice.model.ts
│   │   ├── notification.model.ts
│   │   ├── report.model.ts
│   │   └── settings.model.ts
│   │
│   ├── validators/
│   │   ├── auth.validator.ts
│   │   ├── users.validator.ts
│   │   ├── students.validator.ts
│   │   ├── attendance.validator.ts
│   │   ├── marks.validator.ts
│   │   ├── appointments.validator.ts
│   │   └── notices.validator.ts
│   │
│   ├── utils/
│   │   ├── response.util.ts         # Standardized API responses
│   │   ├── pagination.util.ts       # Pagination helpers
│   │   ├── date.util.ts             # Date formatting
│   │   ├── grade.util.ts            # Grade calculation
│   │   ├── validation.util.ts       # Custom validators
│   │   └── logger.util.ts           # Winston logger setup
│   │
│   ├── types/
│   │   ├── index.ts                 # Type exports
│   │   ├── user.types.ts
│   │   ├── student.types.ts
│   │   ├── attendance.types.ts
│   │   ├── marks.types.ts
│   │   ├── appointment.types.ts
│   │   ├── notice.types.ts
│   │   ├── report.types.ts
│   │   └── api.types.ts
│   │
│   └── app.ts                       # Express app setup
│
├── tests/
│   ├── unit/
│   │   ├── services/
│   │   └── utils/
│   ├── integration/
│   │   └── routes/
│   └── setup.ts
│
├── scripts/
│   ├── seed-database.ts             # Initial data seeding
│   ├── create-admin.ts              # Create admin user
│   └── migrate.ts                   # Database migrations
│
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
├── jest.config.js
├── nodemon.json
└── server.ts                        # Entry point
```

---

## 4. Firebase Setup Guide

### 4.1 Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project"
3. Enter project name: `digital-iskole`
4. Disable Google Analytics (optional)
5. Click "Create Project"

### 4.2 Enable Services

#### Authentication
1. Go to Authentication > Sign-in method
2. Enable "Email/Password" provider
3. Configure password requirements

#### Firestore Database
1. Go to Firestore Database
2. Click "Create database"
3. Choose "Start in production mode"
4. Select region: `asia-south1` (Mumbai) for Sri Lanka

#### Storage
1. Go to Storage
2. Click "Get started"
3. Choose production rules
4. Select same region as Firestore

#### Cloud Messaging
1. Go to Project Settings > Cloud Messaging
2. Enable Cloud Messaging API

### 4.3 Generate Service Account Key

1. Go to Project Settings > Service Accounts
2. Click "Generate new private key"
3. Save as `serviceAccountKey.json`
4. **NEVER commit this file to version control**

### 4.4 Firebase Admin SDK Initialization

```typescript
// src/config/firebase.ts
import * as admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';
import { getMessaging } from 'firebase-admin/messaging';

// Initialize with service account
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`,
  });
}

export const db = getFirestore();
export const auth = getAuth();
export const storage = getStorage();
export const messaging = getMessaging();

// Firestore settings
db.settings({
  ignoreUndefinedProperties: true,
});

export default admin;
```

---

## 5. Database Schema

### 5.1 Collections Overview

```
Firestore Database
├── users/                    # Authentication & role data
├── teachers/                 # Teacher profiles
├── students/                 # Student profiles
├── parents/                  # Parent profiles
├── classes/                  # Class definitions
├── subjects/                 # Subject definitions
├── class_subjects/           # Class-subject assignments
├── attendance/               # Daily attendance records
├── exams/                    # Exam schedules
├── marks/                    # Student marks
├── exam_papers/              # Uploaded exam paper references
├── appointments/             # Parent-teacher appointments
├── notices/                  # School announcements
├── notifications/            # User notifications
├── reports/                  # Generated report metadata
├── academic_years/           # Academic year settings
├── grading_system/           # Grade scale configuration
└── settings/                 # System settings
```

### 5.2 Collection Schemas

#### 5.2.1 Users Collection

```typescript
// Collection: users
// Document ID: Firebase Auth UID

interface User {
  uid: string;                    // Firebase Auth UID
  email: string;                  // User email
  role: 'admin' | 'teacher' | 'parent';
  profileId: string;              // Reference to role-specific profile
  displayName: string;            // Full name
  photoURL?: string;              // Profile picture URL
  phone?: string;                 // Contact number
  language: 'en' | 'si' | 'ta';   // Preferred language
  theme: 'light' | 'dark';        // Preferred theme
  fcmTokens: string[];            // Push notification tokens
  isActive: boolean;              // Account status
  lastLogin: Timestamp;           // Last login time
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Example Document
{
  "uid": "abc123xyz",
  "email": "admin@digitaliskole.lk",
  "role": "admin",
  "profileId": "admin_001",
  "displayName": "System Administrator",
  "phone": "+94771234567",
  "language": "en",
  "theme": "light",
  "fcmTokens": ["token1", "token2"],
  "isActive": true,
  "lastLogin": "2025-01-03T10:30:00Z",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2025-01-03T10:30:00Z"
}
```

#### 5.2.2 Teachers Collection

```typescript
// Collection: teachers
// Document ID: Auto-generated

interface Teacher {
  id: string;
  userId: string;                 // Reference to users collection
  employeeId: string;             // School employee ID
  fullName: string;
  nameWithInitials: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: Timestamp;
  gender: 'male' | 'female';
  nic: string;                    // National ID
  qualifications: string[];
  subjects: string[];             // Subject IDs they can teach
  assignedClass?: string;         // Class ID (if class teacher)
  isClassTeacher: boolean;
  joinDate: Timestamp;
  status: 'active' | 'inactive' | 'on_leave';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Example Document
{
  "id": "teacher_001",
  "userId": "auth_uid_123",
  "employeeId": "TCH-2024-001",
  "fullName": "Kamal Perera",
  "nameWithInitials": "K. Perera",
  "email": "kamal.perera@school.lk",
  "phone": "+94771234567",
  "address": "123, Main Street, Colombo",
  "dateOfBirth": "1985-05-15T00:00:00Z",
  "gender": "male",
  "nic": "198512345678",
  "qualifications": ["B.Ed", "M.Ed"],
  "subjects": ["sub_math", "sub_science"],
  "assignedClass": "class_10a",
  "isClassTeacher": true,
  "joinDate": "2020-01-15T00:00:00Z",
  "status": "active",
  "createdAt": "2020-01-15T00:00:00Z",
  "updatedAt": "2025-01-03T00:00:00Z"
}
```

#### 5.2.3 Students Collection

```typescript
// Collection: students
// Document ID: Auto-generated

interface Student {
  id: string;
  admissionNumber: string;        // School admission number
  fullName: string;
  nameWithInitials: string;
  dateOfBirth: Timestamp;
  gender: 'male' | 'female';
  address: string;
  classId: string;                // Reference to classes collection
  className: string;              // Denormalized for quick access
  rollNumber: number;
  parentId: string;               // Reference to parents collection
  bloodGroup?: string;
  medicalNotes?: string;
  admissionDate: Timestamp;
  previousSchool?: string;
  photoURL?: string;
  status: 'active' | 'inactive' | 'transferred' | 'graduated';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Example Document
{
  "id": "student_001",
  "admissionNumber": "ADM-2024-0001",
  "fullName": "Kasun Jayawardena",
  "nameWithInitials": "K. Jayawardena",
  "dateOfBirth": "2010-03-20T00:00:00Z",
  "gender": "male",
  "address": "456, School Lane, Kandy",
  "classId": "class_10a",
  "className": "Grade 10 - A",
  "rollNumber": 15,
  "parentId": "parent_001",
  "bloodGroup": "O+",
  "admissionDate": "2020-01-10T00:00:00Z",
  "photoURL": "https://storage.../students/student_001.jpg",
  "status": "active",
  "createdAt": "2020-01-10T00:00:00Z",
  "updatedAt": "2025-01-03T00:00:00Z"
}
```

#### 5.2.4 Parents Collection

```typescript
// Collection: parents
// Document ID: Auto-generated

interface Parent {
  id: string;
  userId: string;                 // Reference to users collection
  fullName: string;
  email: string;
  phone: string;
  secondaryPhone?: string;
  address: string;
  nic: string;
  occupation?: string;
  relationship: 'father' | 'mother' | 'guardian';
  childrenIds: string[];          // References to students collection
  emergencyContact: boolean;
  status: 'active' | 'inactive';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Example Document
{
  "id": "parent_001",
  "userId": "auth_uid_456",
  "fullName": "Nimal Jayawardena",
  "email": "nimal.j@gmail.com",
  "phone": "+94777654321",
  "secondaryPhone": "+94112345678",
  "address": "456, School Lane, Kandy",
  "nic": "197512345678",
  "occupation": "Engineer",
  "relationship": "father",
  "childrenIds": ["student_001", "student_002"],
  "emergencyContact": true,
  "status": "active",
  "createdAt": "2020-01-10T00:00:00Z",
  "updatedAt": "2025-01-03T00:00:00Z"
}
```

#### 5.2.5 Classes Collection

```typescript
// Collection: classes
// Document ID: Auto-generated

interface Class {
  id: string;
  name: string;                   // e.g., "Grade 10 - A"
  grade: number;                  // 1-13
  section: string;                // A, B, C
  academicYear: string;           // e.g., "2024/2025"
  classTeacherId?: string;        // Reference to teachers
  classTeacherName?: string;      // Denormalized
  studentCount: number;
  maxCapacity: number;
  roomNumber?: string;
  subjects: string[];             // Subject IDs assigned to class
  status: 'active' | 'inactive';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Example Document
{
  "id": "class_10a",
  "name": "Grade 10 - A",
  "grade": 10,
  "section": "A",
  "academicYear": "2024/2025",
  "classTeacherId": "teacher_001",
  "classTeacherName": "K. Perera",
  "studentCount": 35,
  "maxCapacity": 40,
  "roomNumber": "Room 10A",
  "subjects": ["sub_math", "sub_science", "sub_english"],
  "status": "active",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2025-01-03T00:00:00Z"
}
```

#### 5.2.6 Subjects Collection

```typescript
// Collection: subjects
// Document ID: Auto-generated

interface Subject {
  id: string;
  code: string;                   // e.g., "MATH", "SCI"
  name: string;
  nameInSinhala?: string;
  nameInTamil?: string;
  description?: string;
  grades: number[];               // Applicable grades [6, 7, 8, 9, 10, 11]
  type: 'core' | 'optional';
  passMarks: number;
  maxMarks: number;
  creditHours?: number;
  status: 'active' | 'inactive';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Example Document
{
  "id": "sub_math",
  "code": "MATH",
  "name": "Mathematics",
  "nameInSinhala": "ගණිතය",
  "nameInTamil": "கணிதம்",
  "description": "Core mathematics subject",
  "grades": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
  "type": "core",
  "passMarks": 35,
  "maxMarks": 100,
  "status": "active",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

#### 5.2.7 Attendance Collection

```typescript
// Collection: attendance
// Document ID: Auto-generated (classId_date format recommended)

interface AttendanceRecord {
  id: string;
  date: Timestamp;
  classId: string;
  className: string;
  academicYear: string;
  term: 'first' | 'second' | 'third';
  markedBy: string;               // Teacher ID
  markedByName: string;
  markedAt: Timestamp;
  records: AttendanceEntry[];
  summary: {
    total: number;
    present: number;
    absent: number;
    late: number;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface AttendanceEntry {
  studentId: string;
  studentName: string;
  rollNumber: number;
  status: 'present' | 'absent' | 'late' | 'excused';
  remarks?: string;
  lateMinutes?: number;
}

// Example Document
{
  "id": "att_class10a_20250103",
  "date": "2025-01-03T00:00:00Z",
  "classId": "class_10a",
  "className": "Grade 10 - A",
  "academicYear": "2024/2025",
  "term": "third",
  "markedBy": "teacher_001",
  "markedByName": "K. Perera",
  "markedAt": "2025-01-03T08:30:00Z",
  "records": [
    {
      "studentId": "student_001",
      "studentName": "Kasun Jayawardena",
      "rollNumber": 15,
      "status": "present"
    },
    {
      "studentId": "student_002",
      "studentName": "Nimali Silva",
      "rollNumber": 16,
      "status": "late",
      "lateMinutes": 15,
      "remarks": "Bus delay"
    }
  ],
  "summary": {
    "total": 35,
    "present": 32,
    "absent": 2,
    "late": 1
  },
  "createdAt": "2025-01-03T08:30:00Z",
  "updatedAt": "2025-01-03T08:30:00Z"
}
```

#### 5.2.8 Exams Collection

```typescript
// Collection: exams
// Document ID: Auto-generated

interface Exam {
  id: string;
  name: string;                   // e.g., "First Term Examination 2025"
  type: 'first_term' | 'second_term' | 'third_term' | 'monthly_test' | 'quiz' | 'assignment';
  academicYear: string;
  term: 'first' | 'second' | 'third';
  startDate: Timestamp;
  endDate: Timestamp;
  classes: string[];              // Class IDs
  subjects: ExamSubject[];
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  createdBy: string;
  createdByName: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface ExamSubject {
  subjectId: string;
  subjectName: string;
  examDate: Timestamp;
  startTime: string;              // "09:00"
  endTime: string;                // "12:00"
  maxMarks: number;
  passMarks: number;
  venue?: string;
}

// Example Document
{
  "id": "exam_001",
  "name": "First Term Examination 2025",
  "type": "first_term",
  "academicYear": "2024/2025",
  "term": "first",
  "startDate": "2025-03-15T00:00:00Z",
  "endDate": "2025-03-30T00:00:00Z",
  "classes": ["class_10a", "class_10b", "class_10c"],
  "subjects": [
    {
      "subjectId": "sub_math",
      "subjectName": "Mathematics",
      "examDate": "2025-03-15T00:00:00Z",
      "startTime": "09:00",
      "endTime": "12:00",
      "maxMarks": 100,
      "passMarks": 35,
      "venue": "Main Hall"
    }
  ],
  "status": "scheduled",
  "createdBy": "admin_001",
  "createdByName": "System Administrator",
  "createdAt": "2025-01-03T00:00:00Z",
  "updatedAt": "2025-01-03T00:00:00Z"
}
```

#### 5.2.9 Marks Collection

```typescript
// Collection: marks
// Document ID: Auto-generated

interface MarkEntry {
  id: string;
  examId: string;
  examName: string;
  examType: string;
  academicYear: string;
  term: string;
  classId: string;
  className: string;
  subjectId: string;
  subjectName: string;
  studentId: string;
  studentName: string;
  admissionNumber: string;
  marksObtained: number;
  maxMarks: number;
  percentage: number;
  grade: string;
  gradePoint: number;
  isPassed: boolean;
  rank?: number;                  // Class rank for this subject
  remarks?: string;
  examPaperUrl?: string;          // Uploaded exam paper
  enteredBy: string;              // Teacher ID
  enteredByName: string;
  enteredAt: Timestamp;
  verifiedBy?: string;
  verifiedAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Example Document
{
  "id": "mark_001",
  "examId": "exam_001",
  "examName": "First Term Examination 2025",
  "examType": "first_term",
  "academicYear": "2024/2025",
  "term": "first",
  "classId": "class_10a",
  "className": "Grade 10 - A",
  "subjectId": "sub_math",
  "subjectName": "Mathematics",
  "studentId": "student_001",
  "studentName": "Kasun Jayawardena",
  "admissionNumber": "ADM-2024-0001",
  "marksObtained": 85,
  "maxMarks": 100,
  "percentage": 85,
  "grade": "A",
  "gradePoint": 4.0,
  "isPassed": true,
  "rank": 3,
  "examPaperUrl": "https://storage.../exam_papers/mark_001.pdf",
  "enteredBy": "teacher_001",
  "enteredByName": "K. Perera",
  "enteredAt": "2025-04-01T10:00:00Z",
  "createdAt": "2025-04-01T10:00:00Z",
  "updatedAt": "2025-04-01T10:00:00Z"
}
```

#### 5.2.10 Appointments Collection

```typescript
// Collection: appointments
// Document ID: Auto-generated

interface Appointment {
  id: string;
  parentId: string;
  parentName: string;
  parentPhone: string;
  teacherId: string;
  teacherName: string;
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  requestedDate: Timestamp;
  requestedTime: string;          // "14:00"
  confirmedDate?: Timestamp;
  confirmedTime?: string;
  duration: number;               // Minutes
  reason: string;
  notes?: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
  rejectionReason?: string;
  completionNotes?: string;
  requestedAt: Timestamp;
  respondedAt?: Timestamp;
  respondedBy?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Example Document
{
  "id": "appt_001",
  "parentId": "parent_001",
  "parentName": "Nimal Jayawardena",
  "parentPhone": "+94777654321",
  "teacherId": "teacher_001",
  "teacherName": "K. Perera",
  "studentId": "student_001",
  "studentName": "Kasun Jayawardena",
  "classId": "class_10a",
  "className": "Grade 10 - A",
  "requestedDate": "2025-01-10T00:00:00Z",
  "requestedTime": "14:00",
  "duration": 30,
  "reason": "Discuss academic progress",
  "status": "pending",
  "requestedAt": "2025-01-03T10:00:00Z",
  "createdAt": "2025-01-03T10:00:00Z",
  "updatedAt": "2025-01-03T10:00:00Z"
}
```

#### 5.2.11 Notices Collection

```typescript
// Collection: notices
// Document ID: Auto-generated

interface Notice {
  id: string;
  title: string;
  content: string;
  priority: 'high' | 'medium' | 'normal';
  type: 'general' | 'academic' | 'event' | 'holiday' | 'emergency';
  targetAudience: ('all' | 'teachers' | 'parents' | 'students')[];
  targetClasses?: string[];       // Specific class IDs (optional)
  attachments?: Attachment[];
  publishDate: Timestamp;
  expiryDate?: Timestamp;
  isPinned: boolean;
  isPublished: boolean;
  viewCount: number;
  authorId: string;
  authorName: string;
  authorRole: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface Attachment {
  name: string;
  url: string;
  type: string;
  size: number;
}

// Example Document
{
  "id": "notice_001",
  "title": "Annual Sports Day 2025",
  "content": "We are pleased to announce that the Annual Sports Day...",
  "priority": "high",
  "type": "event",
  "targetAudience": ["all"],
  "attachments": [
    {
      "name": "sports_day_schedule.pdf",
      "url": "https://storage.../notices/sports_day_schedule.pdf",
      "type": "application/pdf",
      "size": 245678
    }
  ],
  "publishDate": "2025-01-03T00:00:00Z",
  "expiryDate": "2025-02-15T00:00:00Z",
  "isPinned": true,
  "isPublished": true,
  "viewCount": 156,
  "authorId": "admin_001",
  "authorName": "System Administrator",
  "authorRole": "admin",
  "createdAt": "2025-01-03T00:00:00Z",
  "updatedAt": "2025-01-03T00:00:00Z"
}
```

#### 5.2.12 Notifications Collection

```typescript
// Collection: notifications
// Document ID: Auto-generated

interface Notification {
  id: string;
  userId: string;                 // Recipient user ID
  type: 'notice' | 'appointment' | 'marks' | 'attendance' | 'exam' | 'system';
  title: string;
  message: string;
  data?: Record<string, any>;     // Additional data for navigation
  link?: string;                  // Deep link to relevant page
  isRead: boolean;
  readAt?: Timestamp;
  priority: 'high' | 'normal' | 'low';
  expiresAt?: Timestamp;
  createdAt: Timestamp;
}

// Example Document
{
  "id": "notif_001",
  "userId": "auth_uid_456",
  "type": "marks",
  "title": "New Marks Published",
  "message": "Mathematics marks for First Term Examination have been published.",
  "data": {
    "examId": "exam_001",
    "subjectId": "sub_math",
    "studentId": "student_001"
  },
  "link": "/dashboard/marks",
  "isRead": false,
  "priority": "normal",
  "createdAt": "2025-01-03T10:00:00Z"
}
```

#### 5.2.13 Reports Collection

```typescript
// Collection: reports
// Document ID: Auto-generated

interface Report {
  id: string;
  type: 'term_report' | 'progress_report' | 'attendance_report' | 'full_academic' | 'class_report' | 'school_report';
  name: string;
  generatedFor: {
    type: 'student' | 'class' | 'school';
    id?: string;
    name: string;
  };
  academicYear: string;
  term?: string;
  reportData: Record<string, any>; // Snapshot of report data
  pdfUrl?: string;                 // Generated PDF URL
  fileSize?: number;
  generatedBy: string;
  generatedByName: string;
  generatedByRole: string;
  status: 'generating' | 'completed' | 'failed';
  errorMessage?: string;
  downloadCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Example Document
{
  "id": "report_001",
  "type": "term_report",
  "name": "First Term Report - Kasun Jayawardena",
  "generatedFor": {
    "type": "student",
    "id": "student_001",
    "name": "Kasun Jayawardena"
  },
  "academicYear": "2024/2025",
  "term": "first",
  "reportData": {
    "studentInfo": { ... },
    "marks": [ ... ],
    "attendance": { ... },
    "ranking": { ... }
  },
  "pdfUrl": "https://storage.../reports/report_001.pdf",
  "fileSize": 156789,
  "generatedBy": "parent_001",
  "generatedByName": "Nimal Jayawardena",
  "generatedByRole": "parent",
  "status": "completed",
  "downloadCount": 2,
  "createdAt": "2025-01-03T10:00:00Z",
  "updatedAt": "2025-01-03T10:05:00Z"
}
```

#### 5.2.14 Academic Years Collection

```typescript
// Collection: academic_years
// Document ID: Auto-generated

interface AcademicYear {
  id: string;
  name: string;                   // "2024/2025"
  startDate: Timestamp;
  endDate: Timestamp;
  terms: Term[];
  isCurrent: boolean;
  status: 'upcoming' | 'active' | 'completed';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface Term {
  name: 'first' | 'second' | 'third';
  startDate: Timestamp;
  endDate: Timestamp;
  holidays: Holiday[];
}

interface Holiday {
  name: string;
  date: Timestamp;
  type: 'public' | 'school';
}

// Example Document
{
  "id": "ay_2024_2025",
  "name": "2024/2025",
  "startDate": "2024-01-08T00:00:00Z",
  "endDate": "2024-12-15T00:00:00Z",
  "terms": [
    {
      "name": "first",
      "startDate": "2024-01-08T00:00:00Z",
      "endDate": "2024-04-05T00:00:00Z",
      "holidays": [
        {
          "name": "Sinhala and Tamil New Year",
          "date": "2024-04-14T00:00:00Z",
          "type": "public"
        }
      ]
    }
  ],
  "isCurrent": true,
  "status": "active",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

#### 5.2.15 Grading System Collection

```typescript
// Collection: grading_system
// Document ID: "default" or academic year ID

interface GradingSystem {
  id: string;
  academicYear?: string;
  grades: GradeScale[];
  isDefault: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface GradeScale {
  grade: string;                  // "A", "B", "C", etc.
  minMarks: number;
  maxMarks: number;
  gradePoint: number;
  description: string;
  color?: string;                 // For UI display
}

// Example Document
{
  "id": "default",
  "grades": [
    { "grade": "A+", "minMarks": 90, "maxMarks": 100, "gradePoint": 4.0, "description": "Excellent" },
    { "grade": "A", "minMarks": 80, "maxMarks": 89, "gradePoint": 4.0, "description": "Very Good" },
    { "grade": "B+", "minMarks": 70, "maxMarks": 79, "gradePoint": 3.5, "description": "Good" },
    { "grade": "B", "minMarks": 60, "maxMarks": 69, "gradePoint": 3.0, "description": "Above Average" },
    { "grade": "C+", "minMarks": 50, "maxMarks": 59, "gradePoint": 2.5, "description": "Average" },
    { "grade": "C", "minMarks": 40, "maxMarks": 49, "gradePoint": 2.0, "description": "Below Average" },
    { "grade": "D", "minMarks": 35, "maxMarks": 39, "gradePoint": 1.5, "description": "Pass" },
    { "grade": "F", "minMarks": 0, "maxMarks": 34, "gradePoint": 0, "description": "Fail" }
  ],
  "isDefault": true,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

---

## 6. Authentication System

### 6.1 Authentication Flow

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         AUTHENTICATION FLOW                               │
└──────────────────────────────────────────────────────────────────────────┘

┌─────────┐   1. Login Request    ┌─────────┐   2. Verify Credentials    ┌─────────┐
│ Client  │ ───────────────────▶ │   API   │ ─────────────────────────▶ │Firebase │
│         │   (email, password)   │ Server  │                            │  Auth   │
└─────────┘                       └─────────┘                            └─────────┘
     ▲                                 │                                      │
     │                                 │         3. Return Auth Token         │
     │                                 │ ◀────────────────────────────────────┘
     │                                 │
     │                                 ▼
     │                           ┌─────────┐
     │                           │Firestore│
     │                           │ (users) │
     │                           └─────────┘
     │                                 │
     │    5. Return Token + User       │ 4. Fetch User Role & Profile
     │ ◀───────────────────────────────┘
     │
     │   6. Store Token (localStorage)
     │   7. Redirect to Dashboard
     ▼
┌─────────┐
│Dashboard│
└─────────┘
```

### 6.2 Authentication Middleware

```typescript
// src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { auth } from '../config/firebase';
import { ApiError } from '../utils/errors';

export interface AuthRequest extends Request {
  user?: {
    uid: string;
    email: string;
    role: 'admin' | 'teacher' | 'parent';
    profileId: string;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'No authentication token provided');
    }

    const token = authHeader.split('Bearer ')[1];

    // Verify Firebase ID token
    const decodedToken = await auth.verifyIdToken(token);

    // Get user data from Firestore
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();

    if (!userDoc.exists) {
      throw new ApiError(401, 'User not found');
    }

    const userData = userDoc.data();

    if (!userData?.isActive) {
      throw new ApiError(403, 'Account is deactivated');
    }

    // Attach user info to request
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email!,
      role: userData.role,
      profileId: userData.profileId,
    };

    next();
  } catch (error: any) {
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.',
      });
    }

    next(error);
  }
};
```

### 6.3 Role-Based Access Middleware

```typescript
// src/middleware/role.middleware.ts
import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { ApiError } from '../utils/errors';

type Role = 'admin' | 'teacher' | 'parent';

export const authorize = (...allowedRoles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new ApiError(401, 'Authentication required');
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ApiError(403, 'You do not have permission to perform this action');
    }

    next();
  };
};

// Usage examples:
// router.get('/admin-only', authenticate, authorize('admin'), controller);
// router.get('/teachers-and-admin', authenticate, authorize('admin', 'teacher'), controller);
```

### 6.4 Auth Controller

```typescript
// src/controllers/auth.controller.ts
import { Request, Response } from 'express';
import { auth, db } from '../config/firebase';
import { AuthRequest } from '../middleware/auth.middleware';

export const authController = {
  // Login
  async login(req: Request, res: Response) {
    const { email, password } = req.body;

    try {
      // Firebase client SDK handles actual authentication
      // Backend just validates and returns user data
      
      // Get user by email
      const userRecord = await auth.getUserByEmail(email);
      const userDoc = await db.collection('users').doc(userRecord.uid).get();

      if (!userDoc.exists) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials',
        });
      }

      const userData = userDoc.data();

      if (!userData?.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Account is deactivated. Please contact administrator.',
        });
      }

      // Update last login
      await userDoc.ref.update({
        lastLogin: new Date(),
      });

      // Get role-specific profile
      let profile = null;
      if (userData.role === 'teacher') {
        const teacherDoc = await db.collection('teachers').doc(userData.profileId).get();
        profile = teacherDoc.data();
      } else if (userData.role === 'parent') {
        const parentDoc = await db.collection('parents').doc(userData.profileId).get();
        profile = parentDoc.data();
      }

      return res.json({
        success: true,
        data: {
          user: {
            uid: userRecord.uid,
            email: userData.email,
            role: userData.role,
            displayName: userData.displayName,
            photoURL: userData.photoURL,
            language: userData.language,
            theme: userData.theme,
          },
          profile,
        },
      });
    } catch (error: any) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }
  },

  // Get current user
  async getCurrentUser(req: AuthRequest, res: Response) {
    try {
      const userDoc = await db.collection('users').doc(req.user!.uid).get();
      const userData = userDoc.data();

      let profile = null;
      if (userData?.role === 'teacher') {
        const teacherDoc = await db.collection('teachers').doc(userData.profileId).get();
        profile = teacherDoc.data();
      } else if (userData?.role === 'parent') {
        const parentDoc = await db.collection('parents').doc(userData.profileId).get();
        profile = parentDoc.data();
        
        // Get children data
        if (profile?.childrenIds?.length) {
          const childrenDocs = await Promise.all(
            profile.childrenIds.map((id: string) =>
              db.collection('students').doc(id).get()
            )
          );
          profile.children = childrenDocs.map(doc => ({ id: doc.id, ...doc.data() }));
        }
      }

      return res.json({
        success: true,
        data: {
          user: userData,
          profile,
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch user data',
      });
    }
  },

  // Change password
  async changePassword(req: AuthRequest, res: Response) {
    const { currentPassword, newPassword } = req.body;

    try {
      // Password change is handled by Firebase client SDK
      // This endpoint can be used for additional validation

      return res.json({
        success: true,
        message: 'Password changed successfully',
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Failed to change password',
      });
    }
  },

  // Reset password request
  async requestPasswordReset(req: Request, res: Response) {
    const { email } = req.body;

    try {
      // Generate password reset link
      const link = await auth.generatePasswordResetLink(email);

      // Send email (implement email service)
      // await emailService.sendPasswordReset(email, link);

      return res.json({
        success: true,
        message: 'Password reset email sent',
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Failed to send password reset email',
      });
    }
  },

  // Logout (invalidate FCM token)
  async logout(req: AuthRequest, res: Response) {
    const { fcmToken } = req.body;

    try {
      if (fcmToken) {
        // Remove FCM token from user
        await db.collection('users').doc(req.user!.uid).update({
          fcmTokens: admin.firestore.FieldValue.arrayRemove(fcmToken),
        });
      }

      return res.json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Logout failed',
      });
    }
  },
};
```

### 6.5 User Creation (Admin)

```typescript
// src/services/users.service.ts
import { auth, db } from '../config/firebase';

export const usersService = {
  // Create teacher account
  async createTeacher(data: CreateTeacherDto) {
    const batch = db.batch();

    // Create Firebase Auth user
    const userRecord = await auth.createUser({
      email: data.email,
      password: data.temporaryPassword,
      displayName: data.fullName,
    });

    // Create user document
    const userRef = db.collection('users').doc(userRecord.uid);
    batch.set(userRef, {
      uid: userRecord.uid,
      email: data.email,
      role: 'teacher',
      profileId: '', // Will update after teacher doc created
      displayName: data.fullName,
      language: 'en',
      theme: 'light',
      fcmTokens: [],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Create teacher profile
    const teacherRef = db.collection('teachers').doc();
    batch.set(teacherRef, {
      id: teacherRef.id,
      userId: userRecord.uid,
      employeeId: data.employeeId,
      fullName: data.fullName,
      nameWithInitials: data.nameWithInitials,
      email: data.email,
      phone: data.phone,
      address: data.address,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      nic: data.nic,
      qualifications: data.qualifications || [],
      subjects: data.subjects || [],
      isClassTeacher: false,
      joinDate: data.joinDate || new Date(),
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Update user with profile ID
    batch.update(userRef, { profileId: teacherRef.id });

    await batch.commit();

    // Send welcome email with temporary password
    // await emailService.sendWelcomeEmail(data.email, data.temporaryPassword);

    return {
      userId: userRecord.uid,
      teacherId: teacherRef.id,
    };
  },

  // Create student with parent account
  async createStudentWithParent(data: CreateStudentDto) {
    const batch = db.batch();

    // Check if parent exists
    let parentId = data.parentId;
    let parentUserId: string | null = null;

    if (!parentId && data.parentData) {
      // Create parent user
      const parentUserRecord = await auth.createUser({
        email: data.parentData.email,
        password: data.parentData.temporaryPassword,
        displayName: data.parentData.fullName,
      });

      parentUserId = parentUserRecord.uid;

      // Create parent user document
      const parentUserRef = db.collection('users').doc(parentUserRecord.uid);
      batch.set(parentUserRef, {
        uid: parentUserRecord.uid,
        email: data.parentData.email,
        role: 'parent',
        profileId: '',
        displayName: data.parentData.fullName,
        language: 'en',
        theme: 'light',
        fcmTokens: [],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Create parent profile
      const parentRef = db.collection('parents').doc();
      parentId = parentRef.id;

      batch.set(parentRef, {
        id: parentRef.id,
        userId: parentUserRecord.uid,
        fullName: data.parentData.fullName,
        email: data.parentData.email,
        phone: data.parentData.phone,
        address: data.parentData.address,
        nic: data.parentData.nic,
        relationship: data.parentData.relationship,
        childrenIds: [],
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      batch.update(parentUserRef, { profileId: parentRef.id });
    }

    // Create student
    const studentRef = db.collection('students').doc();
    batch.set(studentRef, {
      id: studentRef.id,
      admissionNumber: data.admissionNumber,
      fullName: data.fullName,
      nameWithInitials: data.nameWithInitials,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      address: data.address,
      classId: data.classId,
      className: data.className,
      rollNumber: data.rollNumber,
      parentId: parentId,
      admissionDate: data.admissionDate || new Date(),
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Update parent's children list
    const parentRef = db.collection('parents').doc(parentId!);
    batch.update(parentRef, {
      childrenIds: admin.firestore.FieldValue.arrayUnion(studentRef.id),
      updatedAt: new Date(),
    });

    // Update class student count
    const classRef = db.collection('classes').doc(data.classId);
    batch.update(classRef, {
      studentCount: admin.firestore.FieldValue.increment(1),
      updatedAt: new Date(),
    });

    await batch.commit();

    return {
      studentId: studentRef.id,
      parentId: parentId,
    };
  },
};
```

---

## 7. API Endpoints Specification

### 7.1 Authentication Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/login` | Public | User login |
| POST | `/api/auth/logout` | All | User logout |
| GET | `/api/auth/me` | All | Get current user |
| POST | `/api/auth/change-password` | All | Change password |
| POST | `/api/auth/forgot-password` | Public | Request password reset |
| POST | `/api/auth/reset-password` | Public | Reset password with token |
| POST | `/api/auth/refresh-token` | All | Refresh auth token |

### 7.2 User Management Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/users` | Admin | List all users |
| GET | `/api/users/:id` | Admin | Get user by ID |
| PUT | `/api/users/:id` | Admin | Update user |
| DELETE | `/api/users/:id` | Admin | Delete user |
| PATCH | `/api/users/:id/status` | Admin | Toggle user status |

### 7.3 Teacher Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/teachers` | Admin | List all teachers |
| GET | `/api/teachers/:id` | Admin, Teacher (self) | Get teacher details |
| POST | `/api/teachers` | Admin | Create teacher |
| PUT | `/api/teachers/:id` | Admin | Update teacher |
| DELETE | `/api/teachers/:id` | Admin | Delete teacher |
| GET | `/api/teachers/:id/classes` | Admin, Teacher | Get teacher's classes |
| GET | `/api/teachers/:id/students` | Teacher | Get class students |
| PATCH | `/api/teachers/:id/assign-class` | Admin | Assign class to teacher |

### 7.4 Student Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/students` | Admin, Teacher | List students |
| GET | `/api/students/:id` | Admin, Teacher, Parent (own) | Get student details |
| POST | `/api/students` | Admin | Create student |
| PUT | `/api/students/:id` | Admin | Update student |
| DELETE | `/api/students/:id` | Admin | Delete student |
| GET | `/api/students/:id/attendance` | All | Get student attendance |
| GET | `/api/students/:id/marks` | All | Get student marks |
| GET | `/api/students/:id/report` | All | Get student report |
| GET | `/api/students/class/:classId` | Admin, Teacher | Get students by class |

### 7.5 Parent Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/parents` | Admin | List all parents |
| GET | `/api/parents/:id` | Admin, Parent (self) | Get parent details |
| POST | `/api/parents` | Admin | Create parent |
| PUT | `/api/parents/:id` | Admin, Parent (self) | Update parent |
| DELETE | `/api/parents/:id` | Admin | Delete parent |
| GET | `/api/parents/:id/children` | Parent | Get parent's children |
| POST | `/api/parents/:id/link-child` | Admin | Link child to parent |

### 7.6 Class Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/classes` | Admin, Teacher | List all classes |
| GET | `/api/classes/:id` | Admin, Teacher | Get class details |
| POST | `/api/classes` | Admin | Create class |
| PUT | `/api/classes/:id` | Admin | Update class |
| DELETE | `/api/classes/:id` | Admin | Delete class |
| GET | `/api/classes/:id/students` | Admin, Teacher | Get class students |
| GET | `/api/classes/:id/attendance` | Admin, Teacher | Get class attendance |
| GET | `/api/classes/:id/marks` | Admin, Teacher | Get class marks |
| PATCH | `/api/classes/:id/teacher` | Admin | Assign class teacher |

### 7.7 Subject Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/subjects` | All | List all subjects |
| GET | `/api/subjects/:id` | All | Get subject details |
| POST | `/api/subjects` | Admin | Create subject |
| PUT | `/api/subjects/:id` | Admin | Update subject |
| DELETE | `/api/subjects/:id` | Admin | Delete subject |
| GET | `/api/subjects/grade/:grade` | All | Get subjects by grade |

### 7.8 Attendance Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/attendance` | Admin, Teacher | List attendance records |
| GET | `/api/attendance/:id` | Admin, Teacher | Get attendance record |
| POST | `/api/attendance` | Teacher | Mark attendance |
| PUT | `/api/attendance/:id` | Teacher | Update attendance |
| GET | `/api/attendance/class/:classId` | Admin, Teacher | Get class attendance |
| GET | `/api/attendance/class/:classId/date/:date` | Admin, Teacher | Get attendance by date |
| GET | `/api/attendance/student/:studentId` | All | Get student attendance |
| GET | `/api/attendance/report/:classId` | Admin, Teacher | Get attendance report |

### 7.9 Exam Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/exams` | All | List exams |
| GET | `/api/exams/:id` | All | Get exam details |
| POST | `/api/exams` | Admin, Teacher | Create exam |
| PUT | `/api/exams/:id` | Admin, Teacher | Update exam |
| DELETE | `/api/exams/:id` | Admin | Delete exam |
| GET | `/api/exams/upcoming` | All | Get upcoming exams |
| PATCH | `/api/exams/:id/status` | Admin | Update exam status |

### 7.10 Marks Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/marks` | Admin, Teacher | List marks |
| GET | `/api/marks/:id` | All | Get mark entry |
| POST | `/api/marks` | Teacher | Enter marks |
| POST | `/api/marks/bulk` | Teacher | Bulk enter marks |
| PUT | `/api/marks/:id` | Teacher | Update mark |
| DELETE | `/api/marks/:id` | Admin, Teacher | Delete mark |
| GET | `/api/marks/exam/:examId` | Admin, Teacher | Get marks by exam |
| GET | `/api/marks/student/:studentId` | All | Get student marks |
| GET | `/api/marks/class/:classId/exam/:examId` | Admin, Teacher | Get class marks for exam |
| POST | `/api/marks/:id/upload-paper` | Teacher | Upload exam paper |
| GET | `/api/marks/:id/paper` | All | Get exam paper |

### 7.11 Appointment Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/appointments` | All | List appointments |
| GET | `/api/appointments/:id` | All | Get appointment details |
| POST | `/api/appointments` | Parent | Request appointment |
| PUT | `/api/appointments/:id` | Teacher, Parent | Update appointment |
| DELETE | `/api/appointments/:id` | Admin, Parent | Cancel appointment |
| PATCH | `/api/appointments/:id/approve` | Teacher | Approve appointment |
| PATCH | `/api/appointments/:id/reject` | Teacher | Reject appointment |
| PATCH | `/api/appointments/:id/complete` | Teacher | Mark as completed |
| GET | `/api/appointments/teacher/:teacherId` | Admin, Teacher | Get teacher appointments |
| GET | `/api/appointments/parent/:parentId` | Parent | Get parent appointments |
| GET | `/api/appointments/pending` | Admin, Teacher | Get pending appointments |

### 7.12 Notice Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/notices` | All | List notices |
| GET | `/api/notices/:id` | All | Get notice details |
| POST | `/api/notices` | Admin, Teacher | Create notice |
| PUT | `/api/notices/:id` | Admin, Teacher (own) | Update notice |
| DELETE | `/api/notices/:id` | Admin, Teacher (own) | Delete notice |
| PATCH | `/api/notices/:id/publish` | Admin, Teacher | Publish notice |
| PATCH | `/api/notices/:id/pin` | Admin | Pin/unpin notice |
| GET | `/api/notices/pinned` | All | Get pinned notices |

### 7.13 Notification Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/notifications` | All | Get user notifications |
| GET | `/api/notifications/unread` | All | Get unread count |
| PATCH | `/api/notifications/:id/read` | All | Mark as read |
| PATCH | `/api/notifications/read-all` | All | Mark all as read |
| DELETE | `/api/notifications/:id` | All | Delete notification |
| DELETE | `/api/notifications/clear` | All | Clear all notifications |
| POST | `/api/notifications/subscribe` | All | Subscribe to FCM |
| POST | `/api/notifications/unsubscribe` | All | Unsubscribe from FCM |

### 7.14 Report Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/reports` | All | List user's reports |
| GET | `/api/reports/:id` | All | Get report details |
| POST | `/api/reports/generate` | All | Generate new report |
| DELETE | `/api/reports/:id` | All | Delete report |
| GET | `/api/reports/:id/download` | All | Download report PDF |
| GET | `/api/reports/student/:studentId` | All | Get student reports |
| GET | `/api/reports/class/:classId` | Admin, Teacher | Get class reports |
| POST | `/api/reports/school` | Admin | Generate school report |

### 7.15 Settings Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/settings/grading` | All | Get grading system |
| PUT | `/api/settings/grading` | Admin | Update grading system |
| GET | `/api/settings/academic-years` | All | List academic years |
| GET | `/api/settings/academic-years/current` | All | Get current academic year |
| POST | `/api/settings/academic-years` | Admin | Create academic year |
| PUT | `/api/settings/academic-years/:id` | Admin | Update academic year |
| PATCH | `/api/settings/academic-years/:id/current` | Admin | Set as current year |
| DELETE | `/api/settings/academic-years/:id` | Admin | Delete academic year |
| GET | `/api/settings/profile` | All | Get user preferences |
| PUT | `/api/settings/profile` | All | Update user preferences |

---

## 8. Service Layer Implementation

### 8.1 Base Service Pattern

```typescript
// src/services/base.service.ts
import { db } from '../config/firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  DocumentData,
  QueryConstraint
} from 'firebase-admin/firestore';

export class BaseService<T extends DocumentData> {
  protected collection: string;

  constructor(collectionName: string) {
    this.collection = collectionName;
  }

  protected getCollectionRef() {
    return db.collection(this.collection);
  }

  protected getDocRef(id: string) {
    return this.getCollectionRef().doc(id);
  }

  async findById(id: string): Promise<T | null> {
    const docSnap = await this.getDocRef(id).get();
    if (!docSnap.exists) return null;
    return { id: docSnap.id, ...docSnap.data() } as T;
  }

  async findAll(options?: {
    where?: Array<{ field: string; operator: FirebaseFirestore.WhereFilterOp; value: any }>;
    orderBy?: { field: string; direction: 'asc' | 'desc' };
    limit?: number;
    startAfter?: any;
  }): Promise<T[]> {
    let q = this.getCollectionRef();

    if (options?.where) {
      for (const condition of options.where) {
        q = q.where(condition.field, condition.operator, condition.value) as any;
      }
    }

    if (options?.orderBy) {
      q = q.orderBy(options.orderBy.field, options.orderBy.direction) as any;
    }

    if (options?.limit) {
      q = q.limit(options.limit) as any;
    }

    if (options?.startAfter) {
      q = q.startAfter(options.startAfter) as any;
    }

    const snapshot = await q.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
  }

  async create(data: Omit<T, 'id'>): Promise<T> {
    const docRef = await this.getCollectionRef().add({
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    const newDoc = await docRef.get();
    return { id: newDoc.id, ...newDoc.data() } as T;
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    const docRef = this.getDocRef(id);
    await docRef.update({
      ...data,
      updatedAt: Timestamp.now(),
    });

    const updatedDoc = await docRef.get();
    return { id: updatedDoc.id, ...updatedDoc.data() } as T;
  }

  async delete(id: string): Promise<void> {
    await this.getDocRef(id).delete();
  }

  async exists(id: string): Promise<boolean> {
    const docSnap = await this.getDocRef(id).get();
    return docSnap.exists;
  }

  async count(conditions?: Array<{ field: string; operator: FirebaseFirestore.WhereFilterOp; value: any }>): Promise<number> {
    let q = this.getCollectionRef();

    if (conditions) {
      for (const condition of conditions) {
        q = q.where(condition.field, condition.operator, condition.value) as any;
      }
    }

    const snapshot = await q.count().get();
    return snapshot.data().count;
  }
}
```

### 8.2 Attendance Service

```typescript
// src/services/attendance.service.ts
import { BaseService } from './base.service';
import { db } from '../config/firebase';
import { AttendanceRecord, AttendanceEntry } from '../types';

class AttendanceService extends BaseService<AttendanceRecord> {
  constructor() {
    super('attendance');
  }

  async markAttendance(data: {
    classId: string;
    className: string;
    date: Date;
    records: AttendanceEntry[];
    markedBy: string;
    markedByName: string;
    academicYear: string;
    term: string;
  }): Promise<AttendanceRecord> {
    // Check if attendance already marked for this date
    const existingRecords = await this.findAll({
      where: [
        { field: 'classId', operator: '==', value: data.classId },
        { field: 'date', operator: '==', value: data.date },
      ],
    });

    if (existingRecords.length > 0) {
      // Update existing record
      return this.update(existingRecords[0].id, {
        records: data.records,
        markedBy: data.markedBy,
        markedByName: data.markedByName,
        markedAt: new Date(),
        summary: this.calculateSummary(data.records),
      });
    }

    // Create new record
    return this.create({
      ...data,
      markedAt: new Date(),
      summary: this.calculateSummary(data.records),
    });
  }

  private calculateSummary(records: AttendanceEntry[]) {
    return {
      total: records.length,
      present: records.filter(r => r.status === 'present').length,
      absent: records.filter(r => r.status === 'absent').length,
      late: records.filter(r => r.status === 'late').length,
    };
  }

  async getStudentAttendance(studentId: string, options?: {
    startDate?: Date;
    endDate?: Date;
    academicYear?: string;
    term?: string;
  }): Promise<{
    records: Array<{ date: Date; status: string; remarks?: string }>;
    summary: { total: number; present: number; absent: number; late: number; percentage: number };
  }> {
    let q = this.getCollectionRef();

    if (options?.academicYear) {
      q = q.where('academicYear', '==', options.academicYear) as any;
    }

    if (options?.term) {
      q = q.where('term', '==', options.term) as any;
    }

    if (options?.startDate) {
      q = q.where('date', '>=', options.startDate) as any;
    }

    if (options?.endDate) {
      q = q.where('date', '<=', options.endDate) as any;
    }

    q = q.orderBy('date', 'desc') as any;

    const snapshot = await q.get();
    const records: Array<{ date: Date; status: string; remarks?: string }> = [];

    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const studentRecord = data.records.find((r: AttendanceEntry) => r.studentId === studentId);
      if (studentRecord) {
        records.push({
          date: data.date.toDate(),
          status: studentRecord.status,
          remarks: studentRecord.remarks,
        });
      }
    });

    const summary = {
      total: records.length,
      present: records.filter(r => r.status === 'present').length,
      absent: records.filter(r => r.status === 'absent').length,
      late: records.filter(r => r.status === 'late').length,
      percentage: 0,
    };

    summary.percentage = summary.total > 0 
      ? Math.round(((summary.present + summary.late) / summary.total) * 100) 
      : 0;

    return { records, summary };
  }

  async getClassAttendanceReport(classId: string, academicYear: string, term?: string) {
    const conditions = [
      { field: 'classId', operator: '==' as const, value: classId },
      { field: 'academicYear', operator: '==' as const, value: academicYear },
    ];

    if (term) {
      conditions.push({ field: 'term', operator: '==' as const, value: term });
    }

    const records = await this.findAll({ where: conditions });

    // Calculate class-wide statistics
    const totalDays = records.length;
    const studentStats: Record<string, { present: number; absent: number; late: number }> = {};

    records.forEach(record => {
      record.records.forEach(entry => {
        if (!studentStats[entry.studentId]) {
          studentStats[entry.studentId] = { present: 0, absent: 0, late: 0 };
        }
        studentStats[entry.studentId][entry.status as 'present' | 'absent' | 'late']++;
      });
    });

    return {
      totalDays,
      records,
      studentStats,
      averageAttendance: this.calculateAverageAttendance(studentStats, totalDays),
    };
  }

  private calculateAverageAttendance(
    stats: Record<string, { present: number; absent: number; late: number }>,
    totalDays: number
  ): number {
    if (totalDays === 0) return 0;

    const students = Object.values(stats);
    if (students.length === 0) return 0;

    const totalPercentage = students.reduce((sum, student) => {
      return sum + ((student.present + student.late) / totalDays) * 100;
    }, 0);

    return Math.round(totalPercentage / students.length);
  }
}

export const attendanceService = new AttendanceService();
```

### 8.3 Marks Service

```typescript
// src/services/marks.service.ts
import { BaseService } from './base.service';
import { db, storage } from '../config/firebase';
import { MarkEntry } from '../types';
import { gradingService } from './grading.service';

class MarksService extends BaseService<MarkEntry> {
  constructor() {
    super('marks');
  }

  async enterMarks(data: {
    examId: string;
    examName: string;
    examType: string;
    academicYear: string;
    term: string;
    classId: string;
    className: string;
    subjectId: string;
    subjectName: string;
    studentId: string;
    studentName: string;
    admissionNumber: string;
    marksObtained: number;
    maxMarks: number;
    enteredBy: string;
    enteredByName: string;
  }): Promise<MarkEntry> {
    // Calculate grade
    const percentage = (data.marksObtained / data.maxMarks) * 100;
    const gradeInfo = await gradingService.calculateGrade(percentage);

    // Check if entry exists
    const existing = await this.findAll({
      where: [
        { field: 'examId', operator: '==', value: data.examId },
        { field: 'subjectId', operator: '==', value: data.subjectId },
        { field: 'studentId', operator: '==', value: data.studentId },
      ],
    });

    const markData = {
      ...data,
      percentage: Math.round(percentage * 100) / 100,
      grade: gradeInfo.grade,
      gradePoint: gradeInfo.gradePoint,
      isPassed: percentage >= 35, // Or use subject pass marks
      enteredAt: new Date(),
    };

    if (existing.length > 0) {
      return this.update(existing[0].id, markData);
    }

    return this.create(markData);
  }

  async bulkEnterMarks(entries: Array<{
    studentId: string;
    studentName: string;
    admissionNumber: string;
    marksObtained: number;
  }>, commonData: {
    examId: string;
    examName: string;
    examType: string;
    academicYear: string;
    term: string;
    classId: string;
    className: string;
    subjectId: string;
    subjectName: string;
    maxMarks: number;
    enteredBy: string;
    enteredByName: string;
  }): Promise<MarkEntry[]> {
    const results: MarkEntry[] = [];

    for (const entry of entries) {
      const result = await this.enterMarks({
        ...commonData,
        ...entry,
      });
      results.push(result);
    }

    // Calculate and update ranks
    await this.updateRanks(commonData.examId, commonData.subjectId, commonData.classId);

    // Send notifications to parents
    await this.notifyParents(results);

    return results;
  }

  private async updateRanks(examId: string, subjectId: string, classId: string) {
    const marks = await this.findAll({
      where: [
        { field: 'examId', operator: '==', value: examId },
        { field: 'subjectId', operator: '==', value: subjectId },
        { field: 'classId', operator: '==', value: classId },
      ],
      orderBy: { field: 'marksObtained', direction: 'desc' },
    });

    const batch = db.batch();
    marks.forEach((mark, index) => {
      const docRef = this.getDocRef(mark.id);
      batch.update(docRef, { rank: index + 1 });
    });

    await batch.commit();
  }

  private async notifyParents(marks: MarkEntry[]) {
    // Get unique student IDs
    const studentIds = [...new Set(marks.map(m => m.studentId))];

    // Get parent IDs for these students
    const studentsSnapshot = await db.collection('students')
      .where('__name__', 'in', studentIds)
      .get();

    const notifications: any[] = [];

    studentsSnapshot.docs.forEach(doc => {
      const student = doc.data();
      const mark = marks.find(m => m.studentId === doc.id);

      if (student.parentId && mark) {
        notifications.push({
          userId: student.parentId,
          type: 'marks',
          title: 'New Marks Published',
          message: `${mark.subjectName} marks for ${mark.examName} have been published. ${student.fullName} scored ${mark.marksObtained}/${mark.maxMarks} (${mark.grade})`,
          data: {
            examId: mark.examId,
            subjectId: mark.subjectId,
            studentId: mark.studentId,
          },
          link: '/dashboard/marks',
          isRead: false,
          priority: 'normal',
          createdAt: new Date(),
        });
      }
    });

    // Bulk create notifications
    const batch = db.batch();
    notifications.forEach(notif => {
      const ref = db.collection('notifications').doc();
      batch.set(ref, notif);
    });

    await batch.commit();

    // Send FCM notifications
    // await fcmService.sendBulkNotifications(notifications);
  }

  async uploadExamPaper(markId: string, file: Express.Multer.File): Promise<string> {
    const mark = await this.findById(markId);
    if (!mark) throw new Error('Mark entry not found');

    // Upload to Firebase Storage
    const bucket = storage.bucket();
    const fileName = `exam_papers/${mark.examId}/${mark.studentId}_${Date.now()}.pdf`;
    const fileRef = bucket.file(fileName);

    await fileRef.save(file.buffer, {
      metadata: {
        contentType: file.mimetype,
      },
    });

    // Get download URL
    const [url] = await fileRef.getSignedUrl({
      action: 'read',
      expires: '03-01-2500', // Long expiry
    });

    // Update mark entry
    await this.update(markId, { examPaperUrl: url });

    return url;
  }

  async getStudentMarks(studentId: string, options?: {
    academicYear?: string;
    term?: string;
    examId?: string;
  }) {
    const conditions = [
      { field: 'studentId', operator: '==' as const, value: studentId },
    ];

    if (options?.academicYear) {
      conditions.push({ field: 'academicYear', operator: '==' as const, value: options.academicYear });
    }

    if (options?.term) {
      conditions.push({ field: 'term', operator: '==' as const, value: options.term });
    }

    if (options?.examId) {
      conditions.push({ field: 'examId', operator: '==' as const, value: options.examId });
    }

    const marks = await this.findAll({ 
      where: conditions,
      orderBy: { field: 'enteredAt', direction: 'desc' },
    });

    // Calculate summary
    const summary = {
      totalSubjects: marks.length,
      averagePercentage: 0,
      averageGradePoint: 0,
      passed: 0,
      failed: 0,
    };

    if (marks.length > 0) {
      summary.averagePercentage = Math.round(
        marks.reduce((sum, m) => sum + m.percentage, 0) / marks.length
      );
      summary.averageGradePoint = Math.round(
        (marks.reduce((sum, m) => sum + m.gradePoint, 0) / marks.length) * 100
      ) / 100;
      summary.passed = marks.filter(m => m.isPassed).length;
      summary.failed = marks.filter(m => !m.isPassed).length;
    }

    return { marks, summary };
  }
}

export const marksService = new MarksService();
```

### 8.4 Appointments Service

```typescript
// src/services/appointments.service.ts
import { BaseService } from './base.service';
import { db } from '../config/firebase';
import { Appointment } from '../types';
import { notificationService } from './notifications.service';

class AppointmentsService extends BaseService<Appointment> {
  constructor() {
    super('appointments');
  }

  async requestAppointment(data: {
    parentId: string;
    parentName: string;
    parentPhone: string;
    studentId: string;
    studentName: string;
    classId: string;
    className: string;
    requestedDate: Date;
    requestedTime: string;
    reason: string;
  }): Promise<Appointment> {
    // Get class teacher
    const classDoc = await db.collection('classes').doc(data.classId).get();
    const classData = classDoc.data();

    if (!classData?.classTeacherId) {
      throw new Error('No class teacher assigned to this class');
    }

    const teacherDoc = await db.collection('teachers').doc(classData.classTeacherId).get();
    const teacherData = teacherDoc.data();

    const appointment = await this.create({
      ...data,
      teacherId: classData.classTeacherId,
      teacherName: teacherData?.nameWithInitials || teacherData?.fullName,
      duration: 30,
      status: 'pending',
      requestedAt: new Date(),
    });

    // Notify teacher
    await notificationService.create({
      userId: teacherData?.userId,
      type: 'appointment',
      title: 'New Appointment Request',
      message: `${data.parentName} has requested an appointment regarding ${data.studentName}`,
      data: { appointmentId: appointment.id },
      link: '/dashboard/appointments',
      isRead: false,
      priority: 'normal',
    });

    return appointment;
  }

  async approveAppointment(appointmentId: string, teacherId: string, confirmedDate?: Date, confirmedTime?: string): Promise<Appointment> {
    const appointment = await this.findById(appointmentId);
    if (!appointment) throw new Error('Appointment not found');

    if (appointment.teacherId !== teacherId) {
      throw new Error('You can only manage your own appointments');
    }

    const updated = await this.update(appointmentId, {
      status: 'approved',
      confirmedDate: confirmedDate || appointment.requestedDate,
      confirmedTime: confirmedTime || appointment.requestedTime,
      respondedAt: new Date(),
      respondedBy: teacherId,
    });

    // Get parent user ID
    const parentDoc = await db.collection('parents').doc(appointment.parentId).get();
    const parentData = parentDoc.data();

    // Notify parent
    await notificationService.create({
      userId: parentData?.userId,
      type: 'appointment',
      title: 'Appointment Approved',
      message: `Your appointment with ${appointment.teacherName} has been approved for ${confirmedTime || appointment.requestedTime}`,
      data: { appointmentId },
      link: '/dashboard/appointments',
      isRead: false,
      priority: 'high',
    });

    return updated;
  }

  async rejectAppointment(appointmentId: string, teacherId: string, reason: string): Promise<Appointment> {
    const appointment = await this.findById(appointmentId);
    if (!appointment) throw new Error('Appointment not found');

    if (appointment.teacherId !== teacherId) {
      throw new Error('You can only manage your own appointments');
    }

    const updated = await this.update(appointmentId, {
      status: 'rejected',
      rejectionReason: reason,
      respondedAt: new Date(),
      respondedBy: teacherId,
    });

    // Get parent user ID
    const parentDoc = await db.collection('parents').doc(appointment.parentId).get();
    const parentData = parentDoc.data();

    // Notify parent
    await notificationService.create({
      userId: parentData?.userId,
      type: 'appointment',
      title: 'Appointment Rejected',
      message: `Your appointment request has been declined. Reason: ${reason}`,
      data: { appointmentId },
      link: '/dashboard/appointments',
      isRead: false,
      priority: 'normal',
    });

    return updated;
  }

  async completeAppointment(appointmentId: string, teacherId: string, notes?: string): Promise<Appointment> {
    const appointment = await this.findById(appointmentId);
    if (!appointment) throw new Error('Appointment not found');

    if (appointment.teacherId !== teacherId) {
      throw new Error('You can only manage your own appointments');
    }

    return this.update(appointmentId, {
      status: 'completed',
      completionNotes: notes,
    });
  }

  async getTeacherAppointments(teacherId: string, status?: string) {
    const conditions = [
      { field: 'teacherId', operator: '==' as const, value: teacherId },
    ];

    if (status) {
      conditions.push({ field: 'status', operator: '==' as const, value: status });
    }

    return this.findAll({
      where: conditions,
      orderBy: { field: 'requestedDate', direction: 'asc' },
    });
  }

  async getParentAppointments(parentId: string) {
    return this.findAll({
      where: [{ field: 'parentId', operator: '==', value: parentId }],
      orderBy: { field: 'requestedDate', direction: 'desc' },
    });
  }
}

export const appointmentsService = new AppointmentsService();
```

---

## 9. Security Rules

### 9.1 Firestore Security Rules

```javascript
// firestore.rules
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
    
    function getTeacherProfile() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.profileId;
    }
    
    function getParentProfile() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.profileId;
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated() && (isOwner(userId) || isAdmin());
      allow create: if isAdmin();
      allow update: if isOwner(userId) || isAdmin();
      allow delete: if isAdmin();
    }
    
    // Teachers collection
    match /teachers/{teacherId} {
      allow read: if isAuthenticated();
      allow create, update, delete: if isAdmin();
    }
    
    // Students collection
    match /students/{studentId} {
      allow read: if isAuthenticated() && (
        isAdmin() || 
        isTeacher() ||
        // Parent can read their own children
        (isParent() && resource.data.parentId == getParentProfile())
      );
      allow create, update, delete: if isAdmin();
    }
    
    // Parents collection
    match /parents/{parentId} {
      allow read: if isAuthenticated() && (
        isAdmin() || 
        isTeacher() ||
        parentId == getParentProfile()
      );
      allow create, delete: if isAdmin();
      allow update: if isAdmin() || parentId == getParentProfile();
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
      allow create, update: if isAdmin() || isTeacher();
      allow delete: if isAdmin();
    }
    
    // Marks collection
    match /marks/{markId} {
      allow read: if isAuthenticated() && (
        isAdmin() || 
        isTeacher() ||
        // Parent can read their children's marks
        (isParent() && isParentOfStudent(resource.data.studentId))
      );
      allow create, update: if isAdmin() || isTeacher();
      allow delete: if isAdmin();
      
      function isParentOfStudent(studentId) {
        let student = get(/databases/$(database)/documents/students/$(studentId)).data;
        return student.parentId == getParentProfile();
      }
    }
    
    // Appointments collection
    match /appointments/{appointmentId} {
      allow read: if isAuthenticated() && (
        isAdmin() ||
        resource.data.teacherId == getTeacherProfile() ||
        resource.data.parentId == getParentProfile()
      );
      allow create: if isParent();
      allow update: if isTeacher() && resource.data.teacherId == getTeacherProfile();
      allow delete: if isAdmin() || (isParent() && resource.data.parentId == getParentProfile());
    }
    
    // Notices collection
    match /notices/{noticeId} {
      allow read: if isAuthenticated();
      allow create: if isAdmin() || isTeacher();
      allow update, delete: if isAdmin() || 
        (isTeacher() && resource.data.authorId == getTeacherProfile());
    }
    
    // Notifications collection
    match /notifications/{notificationId} {
      allow read, update, delete: if isAuthenticated() && 
        resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated();
    }
    
    // Reports collection
    match /reports/{reportId} {
      allow read, delete: if isAuthenticated() && (
        isAdmin() ||
        resource.data.generatedBy == request.auth.uid
      );
      allow create: if isAuthenticated();
    }
    
    // Settings collections
    match /academic_years/{yearId} {
      allow read: if isAuthenticated();
      allow create, update, delete: if isAdmin();
    }
    
    match /grading_system/{gradingId} {
      allow read: if isAuthenticated();
      allow create, update, delete: if isAdmin();
    }
  }
}
```

### 9.2 Firebase Storage Security Rules

```javascript
// storage.rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return request.auth.token.role == 'admin';
    }
    
    function isTeacher() {
      return request.auth.token.role == 'teacher';
    }
    
    // Profile pictures
    match /profiles/{userId}/{fileName} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && request.auth.uid == userId;
    }
    
    // Exam papers
    match /exam_papers/{examId}/{fileName} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && (isAdmin() || isTeacher());
    }
    
    // Notice attachments
    match /notices/{noticeId}/{fileName} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && (isAdmin() || isTeacher());
    }
    
    // Generated reports
    match /reports/{userId}/{fileName} {
      allow read: if isAuthenticated() && request.auth.uid == userId;
      allow write: if isAuthenticated() && request.auth.uid == userId;
      allow delete: if isAuthenticated() && request.auth.uid == userId;
    }
  }
}
```

---

## 10. File Storage System

### 10.1 Storage Service

```typescript
// src/services/storage.service.ts
import { storage } from '../config/firebase';
import { v4 as uuidv4 } from 'uuid';

class StorageService {
  private bucket = storage.bucket();

  async uploadFile(
    file: Express.Multer.File,
    path: string,
    options?: {
      contentType?: string;
      metadata?: Record<string, string>;
    }
  ): Promise<{ url: string; path: string }> {
    const fileName = `${path}/${uuidv4()}_${file.originalname}`;
    const fileRef = this.bucket.file(fileName);

    await fileRef.save(file.buffer, {
      metadata: {
        contentType: options?.contentType || file.mimetype,
        metadata: options?.metadata,
      },
    });

    // Make file public or get signed URL
    const [url] = await fileRef.getSignedUrl({
      action: 'read',
      expires: '03-01-2500',
    });

    return { url, path: fileName };
  }

  async uploadProfilePicture(userId: string, file: Express.Multer.File): Promise<string> {
    const { url } = await this.uploadFile(file, `profiles/${userId}`, {
      contentType: file.mimetype,
      metadata: { uploadedBy: userId },
    });
    return url;
  }

  async uploadExamPaper(examId: string, studentId: string, file: Express.Multer.File): Promise<string> {
    const { url } = await this.uploadFile(file, `exam_papers/${examId}`, {
      contentType: 'application/pdf',
      metadata: { studentId, examId },
    });
    return url;
  }

  async uploadNoticeAttachment(noticeId: string, file: Express.Multer.File): Promise<{ url: string; name: string; size: number; type: string }> {
    const { url } = await this.uploadFile(file, `notices/${noticeId}`);
    return {
      url,
      name: file.originalname,
      size: file.size,
      type: file.mimetype,
    };
  }

  async uploadReport(userId: string, reportId: string, pdfBuffer: Buffer): Promise<string> {
    const fileName = `reports/${userId}/${reportId}.pdf`;
    const fileRef = this.bucket.file(fileName);

    await fileRef.save(pdfBuffer, {
      metadata: {
        contentType: 'application/pdf',
      },
    });

    const [url] = await fileRef.getSignedUrl({
      action: 'read',
      expires: '03-01-2500',
    });

    return url;
  }

  async deleteFile(path: string): Promise<void> {
    const fileRef = this.bucket.file(path);
    await fileRef.delete();
  }

  async getSignedUrl(path: string, expiresIn: number = 3600): Promise<string> {
    const fileRef = this.bucket.file(path);
    const [url] = await fileRef.getSignedUrl({
      action: 'read',
      expires: Date.now() + expiresIn * 1000,
    });
    return url;
  }
}

export const storageService = new StorageService();
```

### 10.2 Upload Middleware

```typescript
// src/middleware/upload.middleware.ts
import multer from 'multer';
import { Request } from 'express';
import { ApiError } from '../utils/errors';

// Memory storage for Firebase upload
const storage = multer.memoryStorage();

// File filter
const fileFilter = (allowedTypes: string[]) => {
  return (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new ApiError(400, `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`));
    }
  };
};

// Profile picture upload
export const uploadProfilePicture = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: fileFilter(['image/jpeg', 'image/png', 'image/webp']),
}).single('profilePicture');

// Exam paper upload
export const uploadExamPaper = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: fileFilter(['application/pdf', 'image/jpeg', 'image/png']),
}).single('examPaper');

// Notice attachment upload
export const uploadNoticeAttachment = multer({
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB
  },
  fileFilter: fileFilter([
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
  ]),
}).array('attachments', 5);
```

---

## 11. Push Notifications

### 11.1 FCM Service

```typescript
// src/services/fcm.service.ts
import { messaging, db } from '../config/firebase';

interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
  imageUrl?: string;
}

class FCMService {
  // Send to single user
  async sendToUser(userId: string, payload: NotificationPayload): Promise<void> {
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();

    if (!userData?.fcmTokens?.length) {
      console.log(`No FCM tokens for user ${userId}`);
      return;
    }

    const message = {
      notification: {
        title: payload.title,
        body: payload.body,
        imageUrl: payload.imageUrl,
      },
      data: payload.data || {},
      tokens: userData.fcmTokens,
    };

    try {
      const response = await messaging.sendEachForMulticast(message);
      
      // Remove invalid tokens
      if (response.failureCount > 0) {
        const invalidTokens: string[] = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            invalidTokens.push(userData.fcmTokens[idx]);
          }
        });

        if (invalidTokens.length > 0) {
          await db.collection('users').doc(userId).update({
            fcmTokens: userData.fcmTokens.filter((t: string) => !invalidTokens.includes(t)),
          });
        }
      }
    } catch (error) {
      console.error('FCM send error:', error);
    }
  }

  // Send to multiple users
  async sendToUsers(userIds: string[], payload: NotificationPayload): Promise<void> {
    await Promise.all(userIds.map(userId => this.sendToUser(userId, payload)));
  }

  // Send to topic (e.g., all teachers, all parents of a class)
  async sendToTopic(topic: string, payload: NotificationPayload): Promise<void> {
    const message = {
      notification: {
        title: payload.title,
        body: payload.body,
        imageUrl: payload.imageUrl,
      },
      data: payload.data || {},
      topic,
    };

    try {
      await messaging.send(message);
    } catch (error) {
      console.error('FCM topic send error:', error);
    }
  }

  // Subscribe user to topic
  async subscribeToTopic(tokens: string[], topic: string): Promise<void> {
    try {
      await messaging.subscribeToTopic(tokens, topic);
    } catch (error) {
      console.error('FCM subscribe error:', error);
    }
  }

  // Unsubscribe user from topic
  async unsubscribeFromTopic(tokens: string[], topic: string): Promise<void> {
    try {
      await messaging.unsubscribeFromTopic(tokens, topic);
    } catch (error) {
      console.error('FCM unsubscribe error:', error);
    }
  }
}

export const fcmService = new FCMService();
```

### 11.2 Notification Triggers

```typescript
// src/services/notification-triggers.service.ts
import { db } from '../config/firebase';
import { notificationService } from './notifications.service';
import { fcmService } from './fcm.service';

class NotificationTriggersService {
  // When marks are published
  async onMarksPublished(markData: {
    studentId: string;
    studentName: string;
    subjectName: string;
    examName: string;
    marksObtained: number;
    maxMarks: number;
    grade: string;
  }) {
    // Get student's parent
    const studentDoc = await db.collection('students').doc(markData.studentId).get();
    const student = studentDoc.data();

    if (!student?.parentId) return;

    const parentDoc = await db.collection('parents').doc(student.parentId).get();
    const parent = parentDoc.data();

    if (!parent?.userId) return;

    // Create in-app notification
    await notificationService.create({
      userId: parent.userId,
      type: 'marks',
      title: 'New Marks Published',
      message: `${markData.studentName} scored ${markData.marksObtained}/${markData.maxMarks} (${markData.grade}) in ${markData.subjectName}`,
      data: { studentId: markData.studentId },
      link: '/dashboard/marks',
      isRead: false,
      priority: 'normal',
    });

    // Send push notification
    await fcmService.sendToUser(parent.userId, {
      title: 'New Marks Published',
      body: `${markData.studentName} scored ${markData.marksObtained}/${markData.maxMarks} in ${markData.subjectName}`,
      data: { type: 'marks', studentId: markData.studentId },
    });
  }

  // When attendance is marked as absent
  async onStudentAbsent(data: {
    studentId: string;
    studentName: string;
    date: string;
    className: string;
  }) {
    const studentDoc = await db.collection('students').doc(data.studentId).get();
    const student = studentDoc.data();

    if (!student?.parentId) return;

    const parentDoc = await db.collection('parents').doc(student.parentId).get();
    const parent = parentDoc.data();

    if (!parent?.userId) return;

    await notificationService.create({
      userId: parent.userId,
      type: 'attendance',
      title: 'Absence Notification',
      message: `${data.studentName} was marked absent on ${data.date}`,
      data: { studentId: data.studentId },
      link: '/dashboard/attendance',
      isRead: false,
      priority: 'high',
    });

    await fcmService.sendToUser(parent.userId, {
      title: 'Absence Notification',
      body: `${data.studentName} was marked absent today`,
      data: { type: 'attendance', studentId: data.studentId },
    });
  }

  // When appointment status changes
  async onAppointmentStatusChange(data: {
    parentUserId: string;
    teacherName: string;
    status: 'approved' | 'rejected' | 'completed';
    date?: string;
    time?: string;
    reason?: string;
  }) {
    let title = '';
    let message = '';

    switch (data.status) {
      case 'approved':
        title = 'Appointment Approved';
        message = `Your appointment with ${data.teacherName} has been approved for ${data.date} at ${data.time}`;
        break;
      case 'rejected':
        title = 'Appointment Rejected';
        message = `Your appointment with ${data.teacherName} has been rejected. Reason: ${data.reason}`;
        break;
      case 'completed':
        title = 'Appointment Completed';
        message = `Your appointment with ${data.teacherName} has been marked as completed`;
        break;
    }

    await notificationService.create({
      userId: data.parentUserId,
      type: 'appointment',
      title,
      message,
      link: '/dashboard/appointments',
      isRead: false,
      priority: data.status === 'approved' ? 'high' : 'normal',
    });

    await fcmService.sendToUser(data.parentUserId, {
      title,
      body: message,
      data: { type: 'appointment' },
    });
  }

  // When new notice is published
  async onNoticePublished(notice: {
    id: string;
    title: string;
    targetAudience: string[];
    priority: string;
  }) {
    // Get target users based on audience
    let userIds: string[] = [];

    if (notice.targetAudience.includes('all')) {
      const usersSnapshot = await db.collection('users').where('isActive', '==', true).get();
      userIds = usersSnapshot.docs.map(doc => doc.id);
    } else {
      const conditions = notice.targetAudience.map(role => role === 'students' ? 'parent' : role.slice(0, -1));
      const usersSnapshot = await db.collection('users')
        .where('role', 'in', conditions)
        .where('isActive', '==', true)
        .get();
      userIds = usersSnapshot.docs.map(doc => doc.id);
    }

    // Create bulk notifications
    const batch = db.batch();
    userIds.forEach(userId => {
      const ref = db.collection('notifications').doc();
      batch.set(ref, {
        userId,
        type: 'notice',
        title: 'New Notice',
        message: notice.title,
        data: { noticeId: notice.id },
        link: '/dashboard/notices',
        isRead: false,
        priority: notice.priority === 'high' ? 'high' : 'normal',
        createdAt: new Date(),
      });
    });

    await batch.commit();

    // Send FCM to topic or individual users
    await fcmService.sendToTopic('all_users', {
      title: 'New Notice',
      body: notice.title,
      data: { type: 'notice', noticeId: notice.id },
    });
  }

  // When exam is scheduled
  async onExamScheduled(exam: {
    id: string;
    name: string;
    startDate: string;
    classes: string[];
  }) {
    // Get all parents of students in these classes
    const studentsSnapshot = await db.collection('students')
      .where('classId', 'in', exam.classes)
      .get();

    const parentIds = [...new Set(studentsSnapshot.docs.map(doc => doc.data().parentId))];

    // Get parent user IDs
    const parentsSnapshot = await db.collection('parents')
      .where('__name__', 'in', parentIds)
      .get();

    const userIds = parentsSnapshot.docs.map(doc => doc.data().userId).filter(Boolean);

    // Create notifications
    const batch = db.batch();
    userIds.forEach(userId => {
      const ref = db.collection('notifications').doc();
      batch.set(ref, {
        userId,
        type: 'exam',
        title: 'Exam Scheduled',
        message: `${exam.name} has been scheduled starting ${exam.startDate}`,
        data: { examId: exam.id },
        link: '/dashboard/exams',
        isRead: false,
        priority: 'high',
        createdAt: new Date(),
      });
    });

    await batch.commit();
  }
}

export const notificationTriggersService = new NotificationTriggersService();
```

---

## 12. Report Generation

### 12.1 PDF Service

```typescript
// src/services/pdf.service.ts
import puppeteer from 'puppeteer';
import { storageService } from './storage.service';

interface StudentReportData {
  student: {
    name: string;
    admissionNumber: string;
    class: string;
    rollNumber: number;
  };
  term: string;
  academicYear: string;
  marks: Array<{
    subject: string;
    marks: number;
    maxMarks: number;
    grade: string;
    rank: number;
  }>;
  attendance: {
    totalDays: number;
    present: number;
    absent: number;
    late: number;
    percentage: number;
  };
  summary: {
    totalMarks: number;
    maxMarks: number;
    percentage: number;
    grade: string;
    classRank: number;
    classSize: number;
  };
}

class PDFService {
  private browser: puppeteer.Browser | null = null;

  private async getBrowser(): Promise<puppeteer.Browser> {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
    }
    return this.browser;
  }

  async generateStudentReport(data: StudentReportData, userId: string, reportId: string): Promise<string> {
    const html = this.generateStudentReportHTML(data);
    const pdfBuffer = await this.htmlToPDF(html);
    const url = await storageService.uploadReport(userId, reportId, pdfBuffer);
    return url;
  }

  private generateStudentReportHTML(data: StudentReportData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Segoe UI', Arial, sans-serif; 
            padding: 40px;
            color: #1a1a1a;
          }
          .header { 
            text-align: center; 
            border-bottom: 3px solid #0d9488; 
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 { 
            color: #0d9488; 
            font-size: 28px;
            margin-bottom: 5px;
          }
          .header h2 {
            font-size: 18px;
            color: #666;
            font-weight: normal;
          }
          .student-info {
            background: #f0fdfa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
          }
          .student-info p {
            margin: 5px 0;
          }
          .student-info strong {
            color: #0d9488;
          }
          .section {
            margin-bottom: 30px;
          }
          .section h3 {
            color: #0d9488;
            border-bottom: 2px solid #0d9488;
            padding-bottom: 8px;
            margin-bottom: 15px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
          }
          th {
            background: #0d9488;
            color: white;
          }
          tr:nth-child(even) {
            background: #f9f9f9;
          }
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
            margin-top: 20px;
          }
          .summary-card {
            background: #f0fdfa;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
          }
          .summary-card .value {
            font-size: 28px;
            font-weight: bold;
            color: #0d9488;
          }
          .summary-card .label {
            color: #666;
            margin-top: 5px;
          }
          .grade-a { color: #059669; }
          .grade-b { color: #0891b2; }
          .grade-c { color: #ca8a04; }
          .grade-d { color: #ea580c; }
          .grade-f { color: #dc2626; }
          .footer {
            margin-top: 50px;
            text-align: center;
            color: #666;
            font-size: 12px;
          }
          .signature-section {
            margin-top: 60px;
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 40px;
          }
          .signature-box {
            text-align: center;
          }
          .signature-line {
            border-top: 1px solid #333;
            margin-top: 50px;
            padding-top: 10px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Digital Iskole</h1>
          <h2>${data.term} Report Card - ${data.academicYear}</h2>
        </div>

        <div class="student-info">
          <p><strong>Student Name:</strong> ${data.student.name}</p>
          <p><strong>Admission No:</strong> ${data.student.admissionNumber}</p>
          <p><strong>Class:</strong> ${data.student.class}</p>
          <p><strong>Roll Number:</strong> ${data.student.rollNumber}</p>
        </div>

        <div class="section">
          <h3>Academic Performance</h3>
          <table>
            <thead>
              <tr>
                <th>Subject</th>
                <th>Marks Obtained</th>
                <th>Max Marks</th>
                <th>Percentage</th>
                <th>Grade</th>
                <th>Class Rank</th>
              </tr>
            </thead>
            <tbody>
              ${data.marks.map(m => `
                <tr>
                  <td>${m.subject}</td>
                  <td>${m.marks}</td>
                  <td>${m.maxMarks}</td>
                  <td>${((m.marks / m.maxMarks) * 100).toFixed(1)}%</td>
                  <td class="grade-${m.grade.toLowerCase()}">${m.grade}</td>
                  <td>${m.rank}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="section">
          <h3>Attendance Summary</h3>
          <div class="summary-grid">
            <div class="summary-card">
              <div class="value">${data.attendance.totalDays}</div>
              <div class="label">Total Days</div>
            </div>
            <div class="summary-card">
              <div class="value">${data.attendance.present}</div>
              <div class="label">Present</div>
            </div>
            <div class="summary-card">
              <div class="value">${data.attendance.absent}</div>
              <div class="label">Absent</div>
            </div>
            <div class="summary-card">
              <div class="value">${data.attendance.percentage}%</div>
              <div class="label">Attendance Rate</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h3>Overall Summary</h3>
          <div class="summary-grid">
            <div class="summary-card">
              <div class="value">${data.summary.totalMarks}/${data.summary.maxMarks}</div>
              <div class="label">Total Marks</div>
            </div>
            <div class="summary-card">
              <div class="value">${data.summary.percentage}%</div>
              <div class="label">Percentage</div>
            </div>
            <div class="summary-card">
              <div class="value grade-${data.summary.grade.toLowerCase()}">${data.summary.grade}</div>
              <div class="label">Overall Grade</div>
            </div>
            <div class="summary-card">
              <div class="value">${data.summary.classRank}/${data.summary.classSize}</div>
              <div class="label">Class Rank</div>
            </div>
          </div>
        </div>

        <div class="signature-section">
          <div class="signature-box">
            <div class="signature-line">Class Teacher</div>
          </div>
          <div class="signature-box">
            <div class="signature-line">Principal</div>
          </div>
          <div class="signature-box">
            <div class="signature-line">Parent/Guardian</div>
          </div>
        </div>

        <div class="footer">
          <p>Generated by Digital Iskole on ${new Date().toLocaleDateString()}</p>
          <p>This is a computer-generated document.</p>
        </div>
      </body>
      </html>
    `;
  }

  private async htmlToPDF(html: string): Promise<Buffer> {
    const browser = await this.getBrowser();
    const page = await browser.newPage();

    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        bottom: '20mm',
        left: '15mm',
        right: '15mm',
      },
    });

    await page.close();

    return Buffer.from(pdfBuffer);
  }

  async closeBrowser(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

export const pdfService = new PDFService();
```

### 12.2 Reports Service

```typescript
// src/services/reports.service.ts
import { BaseService } from './base.service';
import { db } from '../config/firebase';
import { Report } from '../types';
import { pdfService } from './pdf.service';
import { marksService } from './marks.service';
import { attendanceService } from './attendance.service';

class ReportsService extends BaseService<Report> {
  constructor() {
    super('reports');
  }

  async generateStudentReport(options: {
    studentId: string;
    type: 'term_report' | 'progress_report' | 'attendance_report' | 'full_academic';
    academicYear: string;
    term?: string;
    generatedBy: string;
    generatedByName: string;
    generatedByRole: string;
  }): Promise<Report> {
    // Get student data
    const studentDoc = await db.collection('students').doc(options.studentId).get();
    const student = studentDoc.data();

    if (!student) throw new Error('Student not found');

    // Get marks
    const { marks, summary: marksSummary } = await marksService.getStudentMarks(options.studentId, {
      academicYear: options.academicYear,
      term: options.term,
    });

    // Get attendance
    const { records: attendanceRecords, summary: attendanceSummary } = 
      await attendanceService.getStudentAttendance(options.studentId, {
        academicYear: options.academicYear,
        term: options.term,
      });

    // Create report document
    const report = await this.create({
      type: options.type,
      name: `${options.type.replace('_', ' ')} - ${student.fullName}`,
      generatedFor: {
        type: 'student',
        id: options.studentId,
        name: student.fullName,
      },
      academicYear: options.academicYear,
      term: options.term,
      reportData: {
        student: {
          name: student.fullName,
          admissionNumber: student.admissionNumber,
          class: student.className,
          rollNumber: student.rollNumber,
        },
        marks,
        marksSummary,
        attendance: attendanceSummary,
      },
      generatedBy: options.generatedBy,
      generatedByName: options.generatedByName,
      generatedByRole: options.generatedByRole,
      status: 'generating',
      downloadCount: 0,
    });

    try {
      // Generate PDF
      const pdfUrl = await pdfService.generateStudentReport(
        {
          student: {
            name: student.fullName,
            admissionNumber: student.admissionNumber,
            class: student.className,
            rollNumber: student.rollNumber,
          },
          term: options.term || 'Annual',
          academicYear: options.academicYear,
          marks: marks.map(m => ({
            subject: m.subjectName,
            marks: m.marksObtained,
            maxMarks: m.maxMarks,
            grade: m.grade,
            rank: m.rank || 0,
          })),
          attendance: attendanceSummary,
          summary: {
            totalMarks: marks.reduce((sum, m) => sum + m.marksObtained, 0),
            maxMarks: marks.reduce((sum, m) => sum + m.maxMarks, 0),
            percentage: marksSummary.averagePercentage,
            grade: this.calculateOverallGrade(marksSummary.averagePercentage),
            classRank: 1, // Calculate actual rank
            classSize: 35, // Get actual class size
          },
        },
        options.generatedBy,
        report.id
      );

      // Update report with PDF URL
      return this.update(report.id, {
        pdfUrl,
        status: 'completed',
      });
    } catch (error) {
      await this.update(report.id, {
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'PDF generation failed',
      });
      throw error;
    }
  }

  private calculateOverallGrade(percentage: number): string {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C+';
    if (percentage >= 40) return 'C';
    if (percentage >= 35) return 'D';
    return 'F';
  }

  async getUserReports(userId: string, role: string) {
    if (role === 'admin') {
      return this.findAll({
        orderBy: { field: 'createdAt', direction: 'desc' },
        limit: 50,
      });
    }

    return this.findAll({
      where: [{ field: 'generatedBy', operator: '==', value: userId }],
      orderBy: { field: 'createdAt', direction: 'desc' },
    });
  }

  async incrementDownloadCount(reportId: string): Promise<void> {
    const reportRef = this.getDocRef(reportId);
    await reportRef.update({
      downloadCount: admin.firestore.FieldValue.increment(1),
    });
  }
}

export const reportsService = new ReportsService();
```

---

## 13. Error Handling

### 13.1 Custom Error Classes

```typescript
// src/utils/errors.ts
export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends ApiError {
  constructor(resource: string) {
    super(404, `${resource} not found`);
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = 'Unauthorized access') {
    super(401, message);
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = 'You do not have permission to perform this action') {
    super(403, message);
  }
}

export class ValidationError extends ApiError {
  errors: any[];

  constructor(errors: any[]) {
    super(400, 'Validation failed');
    this.errors = errors;
  }
}

export class ConflictError extends ApiError {
  constructor(message: string) {
    super(409, message);
  }
}
```

### 13.2 Error Handling Middleware

```typescript
// src/middleware/error.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { ApiError, ValidationError } from '../utils/errors';
import { logger } from '../utils/logger';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log error
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body,
    user: (req as any).user?.uid,
  });

  // API Errors
  if (err instanceof ApiError) {
    const response: any = {
      success: false,
      message: err.message,
    };

    if (err instanceof ValidationError) {
      response.errors = err.errors;
    }

    return res.status(err.statusCode).json(response);
  }

  // Firebase Auth Errors
  if (err.name === 'FirebaseAuthError') {
    return res.status(401).json({
      success: false,
      message: 'Authentication failed',
    });
  }

  // Firebase Firestore Errors
  if (err.name === 'FirestoreError') {
    return res.status(500).json({
      success: false,
      message: 'Database operation failed',
    });
  }

  // Multer Errors (file upload)
  if (err.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  // Unknown errors
  return res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
  });
};

// 404 handler
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
  });
};
```

### 13.3 Logger Setup

```typescript
// src/utils/logger.ts
import winston from 'winston';

const { combine, timestamp, printf, colorize, errors } = winston.format;

const logFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
  let log = `${timestamp} [${level}]: ${message}`;
  
  if (Object.keys(meta).length) {
    log += ` ${JSON.stringify(meta)}`;
  }
  
  if (stack) {
    log += `\n${stack}`;
  }
  
  return log;
});

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    logFormat
  ),
  transports: [
    new winston.transports.Console({
      format: combine(colorize(), logFormat),
    }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
    }),
  ],
});
```

---

## 14. Environment Configuration

### 14.1 Environment Variables

```bash
# .env.example

# Server Configuration
NODE_ENV=development
PORT=5000
API_VERSION=v1

# Firebase Configuration
FIREBASE_PROJECT_ID=digital-iskole
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@digital-iskole.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET=digital-iskole.appspot.com

# JWT Configuration (if using custom tokens)
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Email Configuration (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM="Digital Iskole <noreply@digitaliskole.lk>"

# Frontend URL (for CORS and email links)
FRONTEND_URL=https://digitaliskole.vercel.app

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# File Upload Limits
MAX_FILE_SIZE=10485760

# Logging
LOG_LEVEL=info
```

### 14.2 Configuration Validation

```typescript
// src/config/env.ts
import Joi from 'joi';

const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').required(),
  PORT: Joi.number().default(5000),
  API_VERSION: Joi.string().default('v1'),

  FIREBASE_PROJECT_ID: Joi.string().required(),
  FIREBASE_CLIENT_EMAIL: Joi.string().email().required(),
  FIREBASE_PRIVATE_KEY: Joi.string().required(),
  FIREBASE_STORAGE_BUCKET: Joi.string().required(),

  JWT_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRES_IN: Joi.string().default('7d'),

  SMTP_HOST: Joi.string(),
  SMTP_PORT: Joi.number(),
  SMTP_USER: Joi.string(),
  SMTP_PASS: Joi.string(),
  EMAIL_FROM: Joi.string(),

  FRONTEND_URL: Joi.string().uri().required(),

  RATE_LIMIT_WINDOW_MS: Joi.number().default(900000),
  RATE_LIMIT_MAX: Joi.number().default(100),

  MAX_FILE_SIZE: Joi.number().default(10485760),

  LOG_LEVEL: Joi.string().valid('error', 'warn', 'info', 'debug').default('info'),
}).unknown();

const { error, value: envVars } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Environment validation error: ${error.message}`);
}

export const config = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  apiVersion: envVars.API_VERSION,

  firebase: {
    projectId: envVars.FIREBASE_PROJECT_ID,
    clientEmail: envVars.FIREBASE_CLIENT_EMAIL,
    privateKey: envVars.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    storageBucket: envVars.FIREBASE_STORAGE_BUCKET,
  },

  jwt: {
    secret: envVars.JWT_SECRET,
    expiresIn: envVars.JWT_EXPIRES_IN,
  },

  email: {
    host: envVars.SMTP_HOST,
    port: envVars.SMTP_PORT,
    user: envVars.SMTP_USER,
    pass: envVars.SMTP_PASS,
    from: envVars.EMAIL_FROM,
  },

  frontendUrl: envVars.FRONTEND_URL,

  rateLimit: {
    windowMs: envVars.RATE_LIMIT_WINDOW_MS,
    max: envVars.RATE_LIMIT_MAX,
  },

  maxFileSize: envVars.MAX_FILE_SIZE,

  logLevel: envVars.LOG_LEVEL,
};
```

---

## 15. Deployment Guide

### 15.1 Vercel Deployment

```json
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "server.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "server.ts"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### 15.2 Firebase Deployment (Cloud Functions)

```typescript
// functions/src/index.ts
import * as functions from 'firebase-functions';
import app from './app';

export const api = functions.https.onRequest(app);
```

```json
// firebase.json
{
  "functions": {
    "source": "functions",
    "runtime": "nodejs18",
    "predeploy": ["npm --prefix functions run build"]
  },
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "storage": {
    "rules": "storage.rules"
  }
}
```

### 15.3 Deployment Checklist

```markdown
## Pre-Deployment Checklist

### Environment
- [ ] All environment variables are set
- [ ] Firebase service account key is configured
- [ ] CORS origins are configured for production URLs

### Security
- [ ] Firestore security rules are deployed
- [ ] Storage security rules are deployed
- [ ] Rate limiting is enabled
- [ ] Helmet security headers are configured

### Database
- [ ] Initial admin user is created
- [ ] Grading system is configured
- [ ] Academic year is set up
- [ ] Required collections exist

### Testing
- [ ] All API endpoints are tested
- [ ] Authentication flow is verified
- [ ] File uploads work correctly
- [ ] Notifications are sending

### Monitoring
- [ ] Error logging is configured
- [ ] Firebase Analytics is enabled
- [ ] Performance monitoring is set up
```

---

## 16. Testing Strategy

### 16.1 Unit Tests

```typescript
// tests/unit/services/attendance.service.test.ts
import { attendanceService } from '../../../src/services/attendance.service';

describe('AttendanceService', () => {
  describe('calculateSummary', () => {
    it('should calculate correct summary', () => {
      const records = [
        { studentId: '1', status: 'present' },
        { studentId: '2', status: 'present' },
        { studentId: '3', status: 'absent' },
        { studentId: '4', status: 'late' },
      ];

      const summary = attendanceService['calculateSummary'](records as any);

      expect(summary.total).toBe(4);
      expect(summary.present).toBe(2);
      expect(summary.absent).toBe(1);
      expect(summary.late).toBe(1);
    });
  });
});
```

### 16.2 Integration Tests

```typescript
// tests/integration/routes/auth.test.ts
import request from 'supertest';
import app from '../../../src/app';

describe('Auth Routes', () => {
  describe('POST /api/v1/auth/login', () => {
    it('should return 401 for invalid credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'invalid@test.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should return user data for valid credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'admin@digitaliskole.lk',
          password: 'admin123',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
    });
  });
});
```

### 16.3 Test Configuration

```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/types/**',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
};
```

---

## Appendix A: API Response Formats

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [ ... ]  // For validation errors
}
```

### Paginated Response
```json
{
  "success": true,
  "data": {
    "items": [ ... ],
    "pagination": {
      "total": 100,
      "page": 1,
      "limit": 10,
      "totalPages": 10,
      "hasMore": true
    }
  }
}
```

---

## Appendix B: Common Firebase Queries

### Get documents with pagination
```typescript
const query = db.collection('students')
  .where('classId', '==', classId)
  .orderBy('rollNumber')
  .limit(20)
  .startAfter(lastDoc);
```

### Batch write operations
```typescript
const batch = db.batch();
items.forEach(item => {
  const ref = db.collection('items').doc();
  batch.set(ref, item);
});
await batch.commit();
```

### Real-time listener
```typescript
const unsubscribe = db.collection('notifications')
  .where('userId', '==', userId)
  .where('isRead', '==', false)
  .onSnapshot(snapshot => {
    const notifications = snapshot.docs.map(doc => doc.data());
    // Update UI
  });
```

---

This documentation provides a complete guide for developing the backend for Digital Iskole. Follow these specifications to ensure seamless integration with the frontend.
