# Digital Iskole - API Integration Documentation

## Complete API Integration Guide for Frontend-Backend Connection

**Version:** 1.0.0  
**Last Updated:** January 2025  
**Project:** Digital Iskole School Management System

---

## Table of Contents

1. [Overview](#1-overview)
2. [API Configuration](#2-api-configuration)
3. [Authentication APIs](#3-authentication-apis)
4. [User Management APIs](#4-user-management-apis)
5. [Academic Management APIs](#5-academic-management-apis)
6. [Attendance APIs](#6-attendance-apis)
7. [Marks & Examination APIs](#7-marks--examination-apis)
8. [Appointment APIs](#8-appointment-apis)
9. [Notice APIs](#9-notice-apis)
10. [Notification APIs](#10-notification-apis)
11. [Report APIs](#11-report-apis)
12. [Settings APIs](#12-settings-apis)
13. [File Upload APIs](#13-file-upload-apis)
14. [Error Handling](#14-error-handling)
15. [SWR Integration](#15-swr-integration)
16. [Frontend Integration Examples](#16-frontend-integration-examples)
17. [API Response Codes](#17-api-response-codes)
18. [Rate Limiting](#18-rate-limiting)
19. [Testing APIs](#19-testing-apis)

---

## 1. Overview

### 1.1 API Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Next.js)                        │
├─────────────────────────────────────────────────────────────────┤
│  Components  │  Pages  │  Contexts  │  SWR Hooks  │  Services   │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼ HTTP/HTTPS
┌─────────────────────────────────────────────────────────────────┐
│                      API LAYER (REST)                            │
├─────────────────────────────────────────────────────────────────┤
│  /api/auth/*  │  /api/users/*  │  /api/academic/*  │  /api/*    │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Node.js/Express)                     │
├─────────────────────────────────────────────────────────────────┤
│  Controllers  │  Services  │  Middleware  │  Validators          │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                      FIREBASE SERVICES                           │
├─────────────────────────────────────────────────────────────────┤
│  Authentication  │  Firestore  │  Storage  │  Cloud Messaging   │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Base URL Configuration

```typescript
// Development
const API_BASE_URL = 'http://localhost:3001/api';

// Production
const API_BASE_URL = 'https://your-domain.com/api';

// Environment-based
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
```

### 1.3 API Versioning

```
Base URL: /api/v1/
Example: https://api.digitaliskole.com/api/v1/users/teachers
```

---

## 2. API Configuration

### 2.1 HTTP Client Setup

```typescript
// lib/api/client.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add language header
    const language = localStorage.getItem('language') || 'en';
    config.headers['Accept-Language'] = language;
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    
    // Handle 401 - Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Try to refresh token
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });
        
        const { token } = response.data;
        localStorage.setItem('authToken', token);
        
        // Retry original request
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Redirect to login
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
```

### 2.2 API Response Types

```typescript
// lib/api/types.ts

// Standard API Response
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

// Paginated Response
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
  timestamp: string;
}

// Error Response
export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
  timestamp: string;
}

// Common Request Params
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterParams {
  search?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}
```

### 2.3 Environment Variables

```bash
# .env.local

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_API_VERSION=v1

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Backend Firebase Admin (Server-side only)
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk@your_project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

---

## 3. Authentication APIs

### 3.1 Login

**Endpoint:** `POST /api/auth/login`

**Request:**
```typescript
interface LoginRequest {
  email: string;
  password: string;
}
```

**Response:**
```typescript
interface LoginResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      email: string;
      name: string;
      role: 'admin' | 'teacher' | 'parent';
      phone?: string;
      profilePicture?: string;
      // Role-specific fields
      assignedClass?: string;  // For teachers
      children?: string[];     // For parents
    };
    token: string;
    refreshToken: string;
    expiresIn: number;
  };
  message: string;
}
```

**Frontend Integration:**
```typescript
// lib/api/auth.ts
import apiClient from './client';

export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await apiClient.post('/auth/login', { email, password });
    
    // Store tokens
    localStorage.setItem('authToken', response.data.data.token);
    localStorage.setItem('refreshToken', response.data.data.refreshToken);
    
    return response.data;
  },
  
  logout: async () => {
    const response = await apiClient.post('/auth/logout');
    
    // Clear tokens
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    
    return response.data;
  },
  
  refreshToken: async (refreshToken: string) => {
    const response = await apiClient.post('/auth/refresh', { refreshToken });
    return response.data;
  },
  
  forgotPassword: async (email: string) => {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  },
  
  resetPassword: async (token: string, newPassword: string) => {
    const response = await apiClient.post('/auth/reset-password', {
      token,
      newPassword,
    });
    return response.data;
  },
  
  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await apiClient.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },
  
  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
};
```

### 3.2 Authentication Context Integration

```typescript
// lib/auth/context.tsx (Updated for API Integration)
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api/auth';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'teacher' | 'parent';
  phone?: string;
  profilePicture?: string;
  assignedClass?: string;
  children?: Array<{ id: string; name: string; class: string }>;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isTeacher: boolean;
  isParent: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const response = await authAPI.getCurrentUser();
          setUser(response.data.user);
        } catch (err) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
        }
      }
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authAPI.login(email, password);
      setUser(response.data.user);
      
      router.push('/dashboard');
      return true;
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      // Continue with logout even if API fails
    } finally {
      setUser(null);
      router.push('/login');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        logout,
        isAdmin: user?.role === 'admin',
        isTeacher: user?.role === 'teacher',
        isParent: user?.role === 'parent',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

### 3.3 All Authentication Endpoints

| Endpoint | Method | Description | Access |
|----------|--------|-------------|--------|
| `/api/auth/login` | POST | User login | Public |
| `/api/auth/logout` | POST | User logout | Authenticated |
| `/api/auth/refresh` | POST | Refresh access token | Public |
| `/api/auth/me` | GET | Get current user | Authenticated |
| `/api/auth/forgot-password` | POST | Request password reset | Public |
| `/api/auth/reset-password` | POST | Reset password with token | Public |
| `/api/auth/change-password` | POST | Change password | Authenticated |
| `/api/auth/verify-email` | POST | Verify email address | Public |

---

## 4. User Management APIs

### 4.1 Teachers API

```typescript
// lib/api/teachers.ts
import apiClient from './client';
import { PaginationParams, FilterParams } from './types';

export interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  assignedClass?: string;
  assignedClassName?: string;
  joinDate: string;
  status: 'active' | 'inactive';
  profilePicture?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTeacherRequest {
  name: string;
  email: string;
  phone: string;
  subject: string;
  assignedClass?: string;
  password: string;
}

export interface UpdateTeacherRequest {
  name?: string;
  phone?: string;
  subject?: string;
  assignedClass?: string;
  status?: 'active' | 'inactive';
}

export const teachersAPI = {
  // Get all teachers with pagination
  getAll: async (params?: PaginationParams & FilterParams) => {
    const response = await apiClient.get('/users/teachers', { params });
    return response.data;
  },
  
  // Get single teacher
  getById: async (id: string) => {
    const response = await apiClient.get(`/users/teachers/${id}`);
    return response.data;
  },
  
  // Create teacher
  create: async (data: CreateTeacherRequest) => {
    const response = await apiClient.post('/users/teachers', data);
    return response.data;
  },
  
  // Update teacher
  update: async (id: string, data: UpdateTeacherRequest) => {
    const response = await apiClient.put(`/users/teachers/${id}`, data);
    return response.data;
  },
  
  // Delete teacher
  delete: async (id: string) => {
    const response = await apiClient.delete(`/users/teachers/${id}`);
    return response.data;
  },
  
  // Get teacher's class students
  getClassStudents: async (teacherId: string) => {
    const response = await apiClient.get(`/users/teachers/${teacherId}/students`);
    return response.data;
  },
  
  // Get available teachers (not assigned to any class)
  getAvailable: async () => {
    const response = await apiClient.get('/users/teachers/available');
    return response.data;
  },
};
```

### 4.2 Students API

```typescript
// lib/api/students.ts
import apiClient from './client';
import { PaginationParams, FilterParams } from './types';

export interface Student {
  id: string;
  name: string;
  admissionNumber: string;
  classId: string;
  className: string;
  dateOfBirth: string;
  gender: 'male' | 'female';
  address: string;
  parentId: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  profilePicture?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface CreateStudentRequest {
  name: string;
  admissionNumber: string;
  classId: string;
  dateOfBirth: string;
  gender: 'male' | 'female';
  address: string;
  parentId: string;
}

export interface UpdateStudentRequest {
  name?: string;
  classId?: string;
  address?: string;
  parentId?: string;
  status?: 'active' | 'inactive';
}

export const studentsAPI = {
  // Get all students
  getAll: async (params?: PaginationParams & FilterParams & { classId?: string }) => {
    const response = await apiClient.get('/users/students', { params });
    return response.data;
  },
  
  // Get single student
  getById: async (id: string) => {
    const response = await apiClient.get(`/users/students/${id}`);
    return response.data;
  },
  
  // Create student
  create: async (data: CreateStudentRequest) => {
    const response = await apiClient.post('/users/students', data);
    return response.data;
  },
  
  // Update student
  update: async (id: string, data: UpdateStudentRequest) => {
    const response = await apiClient.put(`/users/students/${id}`, data);
    return response.data;
  },
  
  // Delete student
  delete: async (id: string) => {
    const response = await apiClient.delete(`/users/students/${id}`);
    return response.data;
  },
  
  // Get students by class
  getByClass: async (classId: string, params?: PaginationParams) => {
    const response = await apiClient.get(`/users/students/class/${classId}`, { params });
    return response.data;
  },
  
  // Get student stats
  getStats: async (id: string) => {
    const response = await apiClient.get(`/users/students/${id}/stats`);
    return response.data;
  },
  
  // Get student attendance history
  getAttendance: async (id: string, params?: { month?: number; year?: number }) => {
    const response = await apiClient.get(`/users/students/${id}/attendance`, { params });
    return response.data;
  },
  
  // Get student marks
  getMarks: async (id: string, params?: { examId?: string; term?: string }) => {
    const response = await apiClient.get(`/users/students/${id}/marks`, { params });
    return response.data;
  },
};
```

### 4.3 Parents API

```typescript
// lib/api/parents.ts
import apiClient from './client';
import { PaginationParams, FilterParams } from './types';

export interface Parent {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  children: Array<{
    id: string;
    name: string;
    classId: string;
    className: string;
  }>;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface CreateParentRequest {
  name: string;
  email: string;
  phone: string;
  address: string;
  password: string;
  childrenIds?: string[];
}

export interface UpdateParentRequest {
  name?: string;
  phone?: string;
  address?: string;
  status?: 'active' | 'inactive';
}

export const parentsAPI = {
  // Get all parents
  getAll: async (params?: PaginationParams & FilterParams) => {
    const response = await apiClient.get('/users/parents', { params });
    return response.data;
  },
  
  // Get single parent
  getById: async (id: string) => {
    const response = await apiClient.get(`/users/parents/${id}`);
    return response.data;
  },
  
  // Create parent
  create: async (data: CreateParentRequest) => {
    const response = await apiClient.post('/users/parents', data);
    return response.data;
  },
  
  // Update parent
  update: async (id: string, data: UpdateParentRequest) => {
    const response = await apiClient.put(`/users/parents/${id}`, data);
    return response.data;
  },
  
  // Delete parent
  delete: async (id: string) => {
    const response = await apiClient.delete(`/users/parents/${id}`);
    return response.data;
  },
  
  // Get parent's children
  getChildren: async (parentId: string) => {
    const response = await apiClient.get(`/users/parents/${parentId}/children`);
    return response.data;
  },
  
  // Link child to parent
  linkChild: async (parentId: string, studentId: string) => {
    const response = await apiClient.post(`/users/parents/${parentId}/children`, {
      studentId,
    });
    return response.data;
  },
  
  // Unlink child from parent
  unlinkChild: async (parentId: string, studentId: string) => {
    const response = await apiClient.delete(
      `/users/parents/${parentId}/children/${studentId}`
    );
    return response.data;
  },
};
```

### 4.4 User Management Endpoints Summary

| Endpoint | Method | Description | Access |
|----------|--------|-------------|--------|
| `/api/users/teachers` | GET | List all teachers | Admin |
| `/api/users/teachers` | POST | Create teacher | Admin |
| `/api/users/teachers/:id` | GET | Get teacher details | Admin |
| `/api/users/teachers/:id` | PUT | Update teacher | Admin |
| `/api/users/teachers/:id` | DELETE | Delete teacher | Admin |
| `/api/users/teachers/available` | GET | Get unassigned teachers | Admin |
| `/api/users/students` | GET | List all students | Admin |
| `/api/users/students` | POST | Create student | Admin |
| `/api/users/students/:id` | GET | Get student details | Admin, Teacher, Parent |
| `/api/users/students/:id` | PUT | Update student | Admin |
| `/api/users/students/:id` | DELETE | Delete student | Admin |
| `/api/users/students/class/:classId` | GET | Get students by class | Admin, Teacher |
| `/api/users/parents` | GET | List all parents | Admin |
| `/api/users/parents` | POST | Create parent | Admin |
| `/api/users/parents/:id` | GET | Get parent details | Admin |
| `/api/users/parents/:id` | PUT | Update parent | Admin |
| `/api/users/parents/:id` | DELETE | Delete parent | Admin |

---

## 5. Academic Management APIs

### 5.1 Classes API

```typescript
// lib/api/classes.ts
import apiClient from './client';

export interface Class {
  id: string;
  name: string;
  grade: number;
  section: string;
  classTeacherId?: string;
  classTeacherName?: string;
  studentCount: number;
  capacity: number;
  academicYear: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface CreateClassRequest {
  name: string;
  grade: number;
  section: string;
  classTeacherId?: string;
  capacity: number;
  academicYear: string;
}

export interface UpdateClassRequest {
  name?: string;
  classTeacherId?: string;
  capacity?: number;
  status?: 'active' | 'inactive';
}

export const classesAPI = {
  // Get all classes
  getAll: async (params?: { academicYear?: string; grade?: number }) => {
    const response = await apiClient.get('/academic/classes', { params });
    return response.data;
  },
  
  // Get single class
  getById: async (id: string) => {
    const response = await apiClient.get(`/academic/classes/${id}`);
    return response.data;
  },
  
  // Create class
  create: async (data: CreateClassRequest) => {
    const response = await apiClient.post('/academic/classes', data);
    return response.data;
  },
  
  // Update class
  update: async (id: string, data: UpdateClassRequest) => {
    const response = await apiClient.put(`/academic/classes/${id}`, data);
    return response.data;
  },
  
  // Delete class
  delete: async (id: string) => {
    const response = await apiClient.delete(`/academic/classes/${id}`);
    return response.data;
  },
  
  // Get class students
  getStudents: async (classId: string) => {
    const response = await apiClient.get(`/academic/classes/${classId}/students`);
    return response.data;
  },
  
  // Get class statistics
  getStats: async (classId: string) => {
    const response = await apiClient.get(`/academic/classes/${classId}/stats`);
    return response.data;
  },
  
  // Assign class teacher
  assignTeacher: async (classId: string, teacherId: string) => {
    const response = await apiClient.post(`/academic/classes/${classId}/assign-teacher`, {
      teacherId,
    });
    return response.data;
  },
};
```

### 5.2 Subjects API

```typescript
// lib/api/subjects.ts
import apiClient from './client';

export interface Subject {
  id: string;
  name: string;
  code: string;
  description?: string;
  grades: number[];
  isCore: boolean;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubjectRequest {
  name: string;
  code: string;
  description?: string;
  grades: number[];
  isCore: boolean;
}

export interface UpdateSubjectRequest {
  name?: string;
  description?: string;
  grades?: number[];
  isCore?: boolean;
  status?: 'active' | 'inactive';
}

export const subjectsAPI = {
  // Get all subjects
  getAll: async (params?: { grade?: number; isCore?: boolean }) => {
    const response = await apiClient.get('/academic/subjects', { params });
    return response.data;
  },
  
  // Get single subject
  getById: async (id: string) => {
    const response = await apiClient.get(`/academic/subjects/${id}`);
    return response.data;
  },
  
  // Create subject
  create: async (data: CreateSubjectRequest) => {
    const response = await apiClient.post('/academic/subjects', data);
    return response.data;
  },
  
  // Update subject
  update: async (id: string, data: UpdateSubjectRequest) => {
    const response = await apiClient.put(`/academic/subjects/${id}`, data);
    return response.data;
  },
  
  // Delete subject
  delete: async (id: string) => {
    const response = await apiClient.delete(`/academic/subjects/${id}`);
    return response.data;
  },
  
  // Get subjects by grade
  getByGrade: async (grade: number) => {
    const response = await apiClient.get(`/academic/subjects/grade/${grade}`);
    return response.data;
  },
};
```

### 5.3 Academic Endpoints Summary

| Endpoint | Method | Description | Access |
|----------|--------|-------------|--------|
| `/api/academic/classes` | GET | List all classes | Admin, Teacher |
| `/api/academic/classes` | POST | Create class | Admin |
| `/api/academic/classes/:id` | GET | Get class details | Admin, Teacher |
| `/api/academic/classes/:id` | PUT | Update class | Admin |
| `/api/academic/classes/:id` | DELETE | Delete class | Admin |
| `/api/academic/classes/:id/students` | GET | Get class students | Admin, Teacher |
| `/api/academic/classes/:id/stats` | GET | Get class statistics | Admin, Teacher |
| `/api/academic/subjects` | GET | List all subjects | Admin, Teacher |
| `/api/academic/subjects` | POST | Create subject | Admin |
| `/api/academic/subjects/:id` | GET | Get subject details | Admin, Teacher |
| `/api/academic/subjects/:id` | PUT | Update subject | Admin |
| `/api/academic/subjects/:id` | DELETE | Delete subject | Admin |

---

## 6. Attendance APIs

### 6.1 Attendance API

```typescript
// lib/api/attendance.ts
import apiClient from './client';

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  markedBy: string;
  markedByName: string;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MarkAttendanceRequest {
  classId: string;
  date: string;
  attendance: Array<{
    studentId: string;
    status: 'present' | 'absent' | 'late';
    remarks?: string;
  }>;
}

export interface AttendanceStats {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  attendanceRate: number;
}

export const attendanceAPI = {
  // Get attendance by class and date
  getByClassAndDate: async (classId: string, date: string) => {
    const response = await apiClient.get('/attendance', {
      params: { classId, date },
    });
    return response.data;
  },
  
  // Mark attendance for a class
  markAttendance: async (data: MarkAttendanceRequest) => {
    const response = await apiClient.post('/attendance/mark', data);
    return response.data;
  },
  
  // Update single student attendance
  updateStudentAttendance: async (
    studentId: string,
    date: string,
    status: 'present' | 'absent' | 'late',
    remarks?: string
  ) => {
    const response = await apiClient.put(`/attendance/${studentId}`, {
      date,
      status,
      remarks,
    });
    return response.data;
  },
  
  // Get student attendance history
  getStudentHistory: async (
    studentId: string,
    params?: { startDate?: string; endDate?: string; month?: number; year?: number }
  ) => {
    const response = await apiClient.get(`/attendance/student/${studentId}`, {
      params,
    });
    return response.data;
  },
  
  // Get class attendance summary
  getClassSummary: async (classId: string, params?: { month?: number; year?: number }) => {
    const response = await apiClient.get(`/attendance/class/${classId}/summary`, {
      params,
    });
    return response.data;
  },
  
  // Get student attendance stats
  getStudentStats: async (studentId: string, params?: { term?: string; year?: number }) => {
    const response = await apiClient.get(`/attendance/student/${studentId}/stats`, {
      params,
    });
    return response.data;
  },
  
  // Get daily attendance report
  getDailyReport: async (date: string) => {
    const response = await apiClient.get('/attendance/reports/daily', {
      params: { date },
    });
    return response.data;
  },
  
  // Get monthly attendance report
  getMonthlyReport: async (classId: string, month: number, year: number) => {
    const response = await apiClient.get('/attendance/reports/monthly', {
      params: { classId, month, year },
    });
    return response.data;
  },
};
```

### 6.2 Attendance Endpoints Summary

| Endpoint | Method | Description | Access |
|----------|--------|-------------|--------|
| `/api/attendance` | GET | Get attendance by class/date | Admin, Teacher |
| `/api/attendance/mark` | POST | Mark class attendance | Teacher |
| `/api/attendance/:studentId` | PUT | Update student attendance | Teacher |
| `/api/attendance/student/:id` | GET | Get student attendance history | Admin, Teacher, Parent |
| `/api/attendance/student/:id/stats` | GET | Get student attendance stats | Admin, Teacher, Parent |
| `/api/attendance/class/:id/summary` | GET | Get class attendance summary | Admin, Teacher |
| `/api/attendance/reports/daily` | GET | Get daily attendance report | Admin |
| `/api/attendance/reports/monthly` | GET | Get monthly attendance report | Admin, Teacher |

---

## 7. Marks & Examination APIs

### 7.1 Exams API

```typescript
// lib/api/exams.ts
import apiClient from './client';

export interface Exam {
  id: string;
  name: string;
  type: 'first_term' | 'second_term' | 'third_term' | 'monthly_test' | 'quiz' | 'assignment';
  classId: string;
  className: string;
  subjectId: string;
  subjectName: string;
  date: string;
  startTime: string;
  endTime: string;
  totalMarks: number;
  passingMarks: number;
  academicYear: string;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExamRequest {
  name: string;
  type: 'first_term' | 'second_term' | 'third_term' | 'monthly_test' | 'quiz' | 'assignment';
  classId: string;
  subjectId: string;
  date: string;
  startTime: string;
  endTime: string;
  totalMarks: number;
  passingMarks: number;
}

export interface UpdateExamRequest {
  name?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  totalMarks?: number;
  passingMarks?: number;
  status?: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
}

export const examsAPI = {
  // Get all exams
  getAll: async (params?: {
    classId?: string;
    subjectId?: string;
    type?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const response = await apiClient.get('/exams', { params });
    return response.data;
  },
  
  // Get single exam
  getById: async (id: string) => {
    const response = await apiClient.get(`/exams/${id}`);
    return response.data;
  },
  
  // Create exam
  create: async (data: CreateExamRequest) => {
    const response = await apiClient.post('/exams', data);
    return response.data;
  },
  
  // Update exam
  update: async (id: string, data: UpdateExamRequest) => {
    const response = await apiClient.put(`/exams/${id}`, data);
    return response.data;
  },
  
  // Delete exam
  delete: async (id: string) => {
    const response = await apiClient.delete(`/exams/${id}`);
    return response.data;
  },
  
  // Get upcoming exams
  getUpcoming: async (params?: { classId?: string; limit?: number }) => {
    const response = await apiClient.get('/exams/upcoming', { params });
    return response.data;
  },
  
  // Get exam results
  getResults: async (examId: string) => {
    const response = await apiClient.get(`/exams/${examId}/results`);
    return response.data;
  },
};
```

### 7.2 Marks API

```typescript
// lib/api/marks.ts
import apiClient from './client';

export interface Mark {
  id: string;
  studentId: string;
  studentName: string;
  examId: string;
  examName: string;
  subjectId: string;
  subjectName: string;
  classId: string;
  className: string;
  marks: number;
  totalMarks: number;
  grade: string;
  percentage: number;
  rank?: number;
  remarks?: string;
  examPaperUrl?: string;
  enteredBy: string;
  enteredByName: string;
  createdAt: string;
  updatedAt: string;
}

export interface EnterMarksRequest {
  examId: string;
  marks: Array<{
    studentId: string;
    marks: number;
    remarks?: string;
  }>;
}

export interface UpdateMarkRequest {
  marks?: number;
  remarks?: string;
}

export interface UploadExamPaperRequest {
  studentId: string;
  examId: string;
  file: File;
}

export const marksAPI = {
  // Get marks by exam
  getByExam: async (examId: string) => {
    const response = await apiClient.get(`/marks/exam/${examId}`);
    return response.data;
  },
  
  // Get student marks
  getByStudent: async (
    studentId: string,
    params?: { term?: string; subjectId?: string; academicYear?: string }
  ) => {
    const response = await apiClient.get(`/marks/student/${studentId}`, { params });
    return response.data;
  },
  
  // Enter marks for exam
  enterMarks: async (data: EnterMarksRequest) => {
    const response = await apiClient.post('/marks/enter', data);
    return response.data;
  },
  
  // Update single mark
  updateMark: async (markId: string, data: UpdateMarkRequest) => {
    const response = await apiClient.put(`/marks/${markId}`, data);
    return response.data;
  },
  
  // Upload exam paper
  uploadExamPaper: async (data: UploadExamPaperRequest) => {
    const formData = new FormData();
    formData.append('studentId', data.studentId);
    formData.append('examId', data.examId);
    formData.append('file', data.file);
    
    const response = await apiClient.post('/marks/upload-paper', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  
  // Get exam paper
  getExamPaper: async (studentId: string, examId: string) => {
    const response = await apiClient.get(`/marks/paper/${studentId}/${examId}`);
    return response.data;
  },
  
  // Delete exam paper
  deleteExamPaper: async (studentId: string, examId: string) => {
    const response = await apiClient.delete(`/marks/paper/${studentId}/${examId}`);
    return response.data;
  },
  
  // Get class marks summary
  getClassSummary: async (classId: string, params?: { term?: string; examId?: string }) => {
    const response = await apiClient.get(`/marks/class/${classId}/summary`, { params });
    return response.data;
  },
  
  // Get student report card
  getReportCard: async (studentId: string, term: string) => {
    const response = await apiClient.get(`/marks/report-card/${studentId}`, {
      params: { term },
    });
    return response.data;
  },
};
```

### 7.3 Marks & Exams Endpoints Summary

| Endpoint | Method | Description | Access |
|----------|--------|-------------|--------|
| `/api/exams` | GET | List all exams | Admin, Teacher, Parent |
| `/api/exams` | POST | Create exam | Admin, Teacher |
| `/api/exams/:id` | GET | Get exam details | Admin, Teacher, Parent |
| `/api/exams/:id` | PUT | Update exam | Admin, Teacher |
| `/api/exams/:id` | DELETE | Delete exam | Admin, Teacher |
| `/api/exams/upcoming` | GET | Get upcoming exams | All |
| `/api/exams/:id/results` | GET | Get exam results | Admin, Teacher |
| `/api/marks/exam/:examId` | GET | Get marks by exam | Admin, Teacher |
| `/api/marks/student/:id` | GET | Get student marks | Admin, Teacher, Parent |
| `/api/marks/enter` | POST | Enter marks | Teacher |
| `/api/marks/:id` | PUT | Update mark | Teacher |
| `/api/marks/upload-paper` | POST | Upload exam paper | Teacher |
| `/api/marks/paper/:studentId/:examId` | GET | Get exam paper | Admin, Teacher, Parent |
| `/api/marks/paper/:studentId/:examId` | DELETE | Delete exam paper | Teacher |
| `/api/marks/class/:id/summary` | GET | Get class marks summary | Admin, Teacher |
| `/api/marks/report-card/:studentId` | GET | Get student report card | Admin, Teacher, Parent |

---

## 8. Appointment APIs

### 8.1 Appointments API

```typescript
// lib/api/appointments.ts
import apiClient from './client';

export interface Appointment {
  id: string;
  parentId: string;
  parentName: string;
  teacherId: string;
  teacherName: string;
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  date: string;
  time: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
  rejectionReason?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppointmentRequest {
  studentId: string;
  date: string;
  time: string;
  reason: string;
}

export interface UpdateAppointmentStatusRequest {
  status: 'approved' | 'rejected' | 'completed' | 'cancelled';
  rejectionReason?: string;
  notes?: string;
}

export const appointmentsAPI = {
  // Get all appointments
  getAll: async (params?: {
    status?: string;
    startDate?: string;
    endDate?: string;
    teacherId?: string;
    parentId?: string;
  }) => {
    const response = await apiClient.get('/appointments', { params });
    return response.data;
  },
  
  // Get single appointment
  getById: async (id: string) => {
    const response = await apiClient.get(`/appointments/${id}`);
    return response.data;
  },
  
  // Create appointment (Parent)
  create: async (data: CreateAppointmentRequest) => {
    const response = await apiClient.post('/appointments', data);
    return response.data;
  },
  
  // Update appointment status (Teacher)
  updateStatus: async (id: string, data: UpdateAppointmentStatusRequest) => {
    const response = await apiClient.patch(`/appointments/${id}/status`, data);
    return response.data;
  },
  
  // Cancel appointment (Parent)
  cancel: async (id: string) => {
    const response = await apiClient.patch(`/appointments/${id}/cancel`);
    return response.data;
  },
  
  // Get appointments for teacher
  getForTeacher: async (params?: { status?: string; date?: string }) => {
    const response = await apiClient.get('/appointments/teacher', { params });
    return response.data;
  },
  
  // Get appointments for parent
  getForParent: async (params?: { status?: string }) => {
    const response = await apiClient.get('/appointments/parent', { params });
    return response.data;
  },
  
  // Get pending appointments count
  getPendingCount: async () => {
    const response = await apiClient.get('/appointments/pending/count');
    return response.data;
  },
  
  // Get available time slots
  getAvailableSlots: async (teacherId: string, date: string) => {
    const response = await apiClient.get('/appointments/available-slots', {
      params: { teacherId, date },
    });
    return response.data;
  },
};
```

### 8.2 Appointments Endpoints Summary

| Endpoint | Method | Description | Access |
|----------|--------|-------------|--------|
| `/api/appointments` | GET | List all appointments | Admin, Teacher, Parent |
| `/api/appointments` | POST | Create appointment | Parent |
| `/api/appointments/:id` | GET | Get appointment details | Admin, Teacher, Parent |
| `/api/appointments/:id/status` | PATCH | Update appointment status | Teacher |
| `/api/appointments/:id/cancel` | PATCH | Cancel appointment | Parent |
| `/api/appointments/teacher` | GET | Get teacher's appointments | Teacher |
| `/api/appointments/parent` | GET | Get parent's appointments | Parent |
| `/api/appointments/pending/count` | GET | Get pending count | Admin, Teacher |
| `/api/appointments/available-slots` | GET | Get available time slots | Parent |

---

## 9. Notice APIs

### 9.1 Notices API

```typescript
// lib/api/notices.ts
import apiClient from './client';

export interface Notice {
  id: string;
  title: string;
  content: string;
  priority: 'high' | 'medium' | 'normal';
  targetAudience: ('all' | 'teachers' | 'parents' | 'students')[];
  targetClasses?: string[];
  authorId: string;
  authorName: string;
  authorRole: 'admin' | 'teacher';
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
  }>;
  publishedAt: string;
  expiresAt?: string;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoticeRequest {
  title: string;
  content: string;
  priority: 'high' | 'medium' | 'normal';
  targetAudience: ('all' | 'teachers' | 'parents' | 'students')[];
  targetClasses?: string[];
  expiresAt?: string;
  attachments?: File[];
}

export interface UpdateNoticeRequest {
  title?: string;
  content?: string;
  priority?: 'high' | 'medium' | 'normal';
  targetAudience?: ('all' | 'teachers' | 'parents' | 'students')[];
  targetClasses?: string[];
  expiresAt?: string;
  status?: 'draft' | 'published' | 'archived';
}

export const noticesAPI = {
  // Get all notices
  getAll: async (params?: {
    priority?: string;
    status?: string;
    targetAudience?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const response = await apiClient.get('/notices', { params });
    return response.data;
  },
  
  // Get single notice
  getById: async (id: string) => {
    const response = await apiClient.get(`/notices/${id}`);
    return response.data;
  },
  
  // Create notice
  create: async (data: CreateNoticeRequest) => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('content', data.content);
    formData.append('priority', data.priority);
    formData.append('targetAudience', JSON.stringify(data.targetAudience));
    
    if (data.targetClasses) {
      formData.append('targetClasses', JSON.stringify(data.targetClasses));
    }
    if (data.expiresAt) {
      formData.append('expiresAt', data.expiresAt);
    }
    if (data.attachments) {
      data.attachments.forEach((file) => {
        formData.append('attachments', file);
      });
    }
    
    const response = await apiClient.post('/notices', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  
  // Update notice
  update: async (id: string, data: UpdateNoticeRequest) => {
    const response = await apiClient.put(`/notices/${id}`, data);
    return response.data;
  },
  
  // Delete notice
  delete: async (id: string) => {
    const response = await apiClient.delete(`/notices/${id}`);
    return response.data;
  },
  
  // Get recent notices
  getRecent: async (limit?: number) => {
    const response = await apiClient.get('/notices/recent', {
      params: { limit },
    });
    return response.data;
  },
  
  // Get notices for user
  getForUser: async () => {
    const response = await apiClient.get('/notices/user');
    return response.data;
  },
};
```

### 9.2 Notices Endpoints Summary

| Endpoint | Method | Description | Access |
|----------|--------|-------------|--------|
| `/api/notices` | GET | List all notices | All |
| `/api/notices` | POST | Create notice | Admin, Teacher |
| `/api/notices/:id` | GET | Get notice details | All |
| `/api/notices/:id` | PUT | Update notice | Admin, Teacher (own) |
| `/api/notices/:id` | DELETE | Delete notice | Admin, Teacher (own) |
| `/api/notices/recent` | GET | Get recent notices | All |
| `/api/notices/user` | GET | Get notices for current user | All |

---

## 10. Notification APIs

### 10.1 Notifications API

```typescript
// lib/api/notifications.ts
import apiClient from './client';

export interface Notification {
  id: string;
  userId: string;
  type: 'notice' | 'appointment' | 'marks' | 'attendance' | 'exam' | 'system';
  title: string;
  message: string;
  data?: {
    referenceId?: string;
    referenceType?: string;
    link?: string;
  };
  isRead: boolean;
  createdAt: string;
}

export const notificationsAPI = {
  // Get all notifications
  getAll: async (params?: {
    type?: string;
    isRead?: boolean;
    limit?: number;
    offset?: number;
  }) => {
    const response = await apiClient.get('/notifications', { params });
    return response.data;
  },
  
  // Get unread count
  getUnreadCount: async () => {
    const response = await apiClient.get('/notifications/unread/count');
    return response.data;
  },
  
  // Mark as read
  markAsRead: async (id: string) => {
    const response = await apiClient.patch(`/notifications/${id}/read`);
    return response.data;
  },
  
  // Mark all as read
  markAllAsRead: async () => {
    const response = await apiClient.patch('/notifications/read-all');
    return response.data;
  },
  
  // Delete notification
  delete: async (id: string) => {
    const response = await apiClient.delete(`/notifications/${id}`);
    return response.data;
  },
  
  // Delete all notifications
  deleteAll: async () => {
    const response = await apiClient.delete('/notifications/all');
    return response.data;
  },
  
  // Get recent notifications
  getRecent: async (limit?: number) => {
    const response = await apiClient.get('/notifications/recent', {
      params: { limit },
    });
    return response.data;
  },
  
  // Subscribe to push notifications
  subscribePush: async (fcmToken: string) => {
    const response = await apiClient.post('/notifications/subscribe', {
      fcmToken,
    });
    return response.data;
  },
  
  // Unsubscribe from push notifications
  unsubscribePush: async () => {
    const response = await apiClient.post('/notifications/unsubscribe');
    return response.data;
  },
};
```

### 10.2 Notifications Endpoints Summary

| Endpoint | Method | Description | Access |
|----------|--------|-------------|--------|
| `/api/notifications` | GET | List all notifications | Authenticated |
| `/api/notifications/unread/count` | GET | Get unread count | Authenticated |
| `/api/notifications/:id/read` | PATCH | Mark as read | Authenticated |
| `/api/notifications/read-all` | PATCH | Mark all as read | Authenticated |
| `/api/notifications/:id` | DELETE | Delete notification | Authenticated |
| `/api/notifications/all` | DELETE | Delete all notifications | Authenticated |
| `/api/notifications/recent` | GET | Get recent notifications | Authenticated |
| `/api/notifications/subscribe` | POST | Subscribe to push | Authenticated |
| `/api/notifications/unsubscribe` | POST | Unsubscribe from push | Authenticated |

---

## 11. Report APIs

### 11.1 Reports API

```typescript
// lib/api/reports.ts
import apiClient from './client';

export interface Report {
  id: string;
  type: 'term_report' | 'progress_report' | 'attendance_report' | 'full_academic';
  name: string;
  studentId?: string;
  studentName?: string;
  classId?: string;
  className?: string;
  term?: string;
  academicYear: string;
  generatedBy: string;
  generatedByName: string;
  pdfUrl?: string;
  status: 'generating' | 'completed' | 'failed';
  createdAt: string;
}

export interface GenerateStudentReportRequest {
  studentId: string;
  type: 'term_report' | 'progress_report' | 'attendance_report' | 'full_academic';
  term: string;
}

export interface GenerateClassReportRequest {
  classId: string;
  type: 'term_report' | 'progress_report' | 'attendance_report' | 'full_academic';
  term: string;
}

export interface GenerateSchoolReportRequest {
  type: 'term_report' | 'progress_report' | 'attendance_report' | 'full_academic';
  term: string;
}

export const reportsAPI = {
  // Get all reports
  getAll: async (params?: {
    type?: string;
    studentId?: string;
    classId?: string;
    term?: string;
  }) => {
    const response = await apiClient.get('/reports', { params });
    return response.data;
  },
  
  // Get single report
  getById: async (id: string) => {
    const response = await apiClient.get(`/reports/${id}`);
    return response.data;
  },
  
  // Generate student report
  generateStudentReport: async (data: GenerateStudentReportRequest) => {
    const response = await apiClient.post('/reports/student', data);
    return response.data;
  },
  
  // Generate class report
  generateClassReport: async (data: GenerateClassReportRequest) => {
    const response = await apiClient.post('/reports/class', data);
    return response.data;
  },
  
  // Generate school report (Admin only)
  generateSchoolReport: async (data: GenerateSchoolReportRequest) => {
    const response = await apiClient.post('/reports/school', data);
    return response.data;
  },
  
  // Download report PDF
  downloadReport: async (id: string) => {
    const response = await apiClient.get(`/reports/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },
  
  // Delete report
  delete: async (id: string) => {
    const response = await apiClient.delete(`/reports/${id}`);
    return response.data;
  },
  
  // Get report generation status
  getStatus: async (id: string) => {
    const response = await apiClient.get(`/reports/${id}/status`);
    return response.data;
  },
  
  // Get my reports (for parents)
  getMyReports: async () => {
    const response = await apiClient.get('/reports/my');
    return response.data;
  },
};
```

### 11.2 Reports Endpoints Summary

| Endpoint | Method | Description | Access |
|----------|--------|-------------|--------|
| `/api/reports` | GET | List all reports | Admin, Teacher, Parent |
| `/api/reports/:id` | GET | Get report details | Admin, Teacher, Parent |
| `/api/reports/student` | POST | Generate student report | Admin, Teacher, Parent |
| `/api/reports/class` | POST | Generate class report | Admin, Teacher |
| `/api/reports/school` | POST | Generate school report | Admin |
| `/api/reports/:id/download` | GET | Download report PDF | Admin, Teacher, Parent |
| `/api/reports/:id` | DELETE | Delete report | Admin, Teacher, Parent |
| `/api/reports/:id/status` | GET | Get generation status | Admin, Teacher, Parent |
| `/api/reports/my` | GET | Get my reports | Parent |

---

## 12. Settings APIs

### 12.1 Settings API

```typescript
// lib/api/settings.ts
import apiClient from './client';

export interface GradingScale {
  id: string;
  grade: string;
  minMarks: number;
  maxMarks: number;
  description: string;
}

export interface AcademicYear {
  id: string;
  year: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  status: 'active' | 'upcoming' | 'completed';
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'si' | 'ta';
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
}

export const settingsAPI = {
  // Get grading scale
  getGradingScale: async () => {
    const response = await apiClient.get('/settings/grading');
    return response.data;
  },
  
  // Update grading scale (Admin only)
  updateGradingScale: async (data: GradingScale[]) => {
    const response = await apiClient.put('/settings/grading', { grades: data });
    return response.data;
  },
  
  // Get academic years
  getAcademicYears: async () => {
    const response = await apiClient.get('/settings/academic-years');
    return response.data;
  },
  
  // Create academic year (Admin only)
  createAcademicYear: async (data: Omit<AcademicYear, 'id' | 'status'>) => {
    const response = await apiClient.post('/settings/academic-years', data);
    return response.data;
  },
  
  // Update academic year (Admin only)
  updateAcademicYear: async (id: string, data: Partial<AcademicYear>) => {
    const response = await apiClient.put(`/settings/academic-years/${id}`, data);
    return response.data;
  },
  
  // Set current academic year (Admin only)
  setCurrentAcademicYear: async (id: string) => {
    const response = await apiClient.patch(`/settings/academic-years/${id}/set-current`);
    return response.data;
  },
  
  // Delete academic year (Admin only)
  deleteAcademicYear: async (id: string) => {
    const response = await apiClient.delete(`/settings/academic-years/${id}`);
    return response.data;
  },
  
  // Get user preferences
  getUserPreferences: async () => {
    const response = await apiClient.get('/settings/preferences');
    return response.data;
  },
  
  // Update user preferences
  updateUserPreferences: async (data: Partial<UserPreferences>) => {
    const response = await apiClient.put('/settings/preferences', data);
    return response.data;
  },
  
  // Get current academic year
  getCurrentAcademicYear: async () => {
    const response = await apiClient.get('/settings/academic-years/current');
    return response.data;
  },
};
```

### 12.2 Settings Endpoints Summary

| Endpoint | Method | Description | Access |
|----------|--------|-------------|--------|
| `/api/settings/grading` | GET | Get grading scale | All |
| `/api/settings/grading` | PUT | Update grading scale | Admin |
| `/api/settings/academic-years` | GET | List academic years | Admin |
| `/api/settings/academic-years` | POST | Create academic year | Admin |
| `/api/settings/academic-years/:id` | PUT | Update academic year | Admin |
| `/api/settings/academic-years/:id` | DELETE | Delete academic year | Admin |
| `/api/settings/academic-years/:id/set-current` | PATCH | Set current year | Admin |
| `/api/settings/academic-years/current` | GET | Get current year | All |
| `/api/settings/preferences` | GET | Get user preferences | Authenticated |
| `/api/settings/preferences` | PUT | Update user preferences | Authenticated |

---

## 13. File Upload APIs

### 13.1 Upload API

```typescript
// lib/api/upload.ts
import apiClient from './client';

export interface UploadedFile {
  id: string;
  name: string;
  originalName: string;
  url: string;
  type: string;
  size: number;
  uploadedBy: string;
  createdAt: string;
}

export const uploadAPI = {
  // Upload profile picture
  uploadProfilePicture: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post('/upload/profile-picture', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  
  // Upload exam paper
  uploadExamPaper: async (file: File, studentId: string, examId: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('studentId', studentId);
    formData.append('examId', examId);
    
    const response = await apiClient.post('/upload/exam-paper', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  
  // Upload notice attachment
  uploadNoticeAttachment: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post('/upload/notice-attachment', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  
  // Delete file
  deleteFile: async (fileId: string) => {
    const response = await apiClient.delete(`/upload/${fileId}`);
    return response.data;
  },
  
  // Get signed URL for private file
  getSignedUrl: async (fileId: string) => {
    const response = await apiClient.get(`/upload/${fileId}/signed-url`);
    return response.data;
  },
};
```

### 13.2 Upload Endpoints Summary

| Endpoint | Method | Description | Access |
|----------|--------|-------------|--------|
| `/api/upload/profile-picture` | POST | Upload profile picture | Authenticated |
| `/api/upload/exam-paper` | POST | Upload exam paper | Teacher |
| `/api/upload/notice-attachment` | POST | Upload notice attachment | Admin, Teacher |
| `/api/upload/:id` | DELETE | Delete file | Owner |
| `/api/upload/:id/signed-url` | GET | Get signed URL | Authenticated |

---

## 14. Error Handling

### 14.1 Error Response Format

```typescript
interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
  timestamp: string;
}
```

### 14.2 Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `AUTH_INVALID_CREDENTIALS` | 401 | Invalid email or password |
| `AUTH_TOKEN_EXPIRED` | 401 | Access token has expired |
| `AUTH_TOKEN_INVALID` | 401 | Invalid access token |
| `AUTH_UNAUTHORIZED` | 403 | User not authorized for this action |
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `RESOURCE_NOT_FOUND` | 404 | Requested resource not found |
| `RESOURCE_ALREADY_EXISTS` | 409 | Resource already exists |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_SERVER_ERROR` | 500 | Internal server error |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily unavailable |

### 14.3 Error Handler Utility

```typescript
// lib/api/error-handler.ts
import { AxiosError } from 'axios';
import { ApiError } from './types';

export class ApiException extends Error {
  code: string;
  status: number;
  details?: Record<string, string[]>;
  
  constructor(error: ApiError, status: number) {
    super(error.error.message);
    this.code = error.error.code;
    this.status = status;
    this.details = error.error.details;
  }
}

export function handleApiError(error: AxiosError<ApiError>): never {
  if (error.response) {
    throw new ApiException(error.response.data, error.response.status);
  }
  
  if (error.request) {
    throw new Error('Network error. Please check your connection.');
  }
  
  throw new Error('An unexpected error occurred.');
}

// Usage in components
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiException) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred.';
}
```

### 14.4 Toast Notification for Errors

```typescript
// lib/utils/toast.ts
import { toast } from 'sonner';
import { ApiException, getErrorMessage } from '../api/error-handler';

export function showErrorToast(error: unknown) {
  const message = getErrorMessage(error);
  
  toast.error(message, {
    duration: 5000,
    action: error instanceof ApiException && error.details
      ? {
          label: 'Details',
          onClick: () => console.log(error.details),
        }
      : undefined,
  });
}

export function showSuccessToast(message: string) {
  toast.success(message, {
    duration: 3000,
  });
}
```

---

## 15. SWR Integration

### 15.1 SWR Configuration

```typescript
// lib/swr/config.ts
import { SWRConfiguration } from 'swr';

export const swrConfig: SWRConfiguration = {
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
  dedupingInterval: 2000,
  errorRetryCount: 3,
  errorRetryInterval: 5000,
  onError: (error, key) => {
    console.error(`SWR Error for ${key}:`, error);
  },
};
```

### 15.2 SWR Hooks

```typescript
// lib/swr/hooks.ts
import useSWR, { SWRResponse } from 'swr';
import useSWRMutation from 'swr/mutation';
import apiClient from '../api/client';

// Generic fetcher
const fetcher = (url: string) => apiClient.get(url).then((res) => res.data);

// Students hooks
export function useStudents(classId?: string) {
  const url = classId ? `/users/students?classId=${classId}` : '/users/students';
  return useSWR(url, fetcher);
}

export function useStudent(id: string | null) {
  return useSWR(id ? `/users/students/${id}` : null, fetcher);
}

// Attendance hooks
export function useAttendance(classId: string, date: string) {
  return useSWR(
    classId && date ? `/attendance?classId=${classId}&date=${date}` : null,
    fetcher
  );
}

export function useStudentAttendance(studentId: string, month?: number, year?: number) {
  const params = new URLSearchParams();
  if (month) params.append('month', month.toString());
  if (year) params.append('year', year.toString());
  
  return useSWR(
    studentId ? `/attendance/student/${studentId}?${params}` : null,
    fetcher
  );
}

// Marks hooks
export function useStudentMarks(studentId: string, term?: string) {
  const params = term ? `?term=${term}` : '';
  return useSWR(studentId ? `/marks/student/${studentId}${params}` : null, fetcher);
}

export function useExamMarks(examId: string) {
  return useSWR(examId ? `/marks/exam/${examId}` : null, fetcher);
}

// Notifications hooks
export function useNotifications(params?: { type?: string; limit?: number }) {
  const searchParams = new URLSearchParams();
  if (params?.type) searchParams.append('type', params.type);
  if (params?.limit) searchParams.append('limit', params.limit.toString());
  
  return useSWR(`/notifications?${searchParams}`, fetcher, {
    refreshInterval: 30000, // Refresh every 30 seconds
  });
}

export function useUnreadNotificationCount() {
  return useSWR('/notifications/unread/count', fetcher, {
    refreshInterval: 30000,
  });
}

// Appointments hooks
export function useAppointments(status?: string) {
  const params = status ? `?status=${status}` : '';
  return useSWR(`/appointments${params}`, fetcher);
}

// Notices hooks
export function useNotices(params?: { priority?: string; limit?: number }) {
  const searchParams = new URLSearchParams();
  if (params?.priority) searchParams.append('priority', params.priority);
  if (params?.limit) searchParams.append('limit', params.limit.toString());
  
  return useSWR(`/notices?${searchParams}`, fetcher);
}

// Reports hooks
export function useReports(params?: { type?: string; studentId?: string }) {
  const searchParams = new URLSearchParams();
  if (params?.type) searchParams.append('type', params.type);
  if (params?.studentId) searchParams.append('studentId', params.studentId);
  
  return useSWR(`/reports?${searchParams}`, fetcher);
}

// Settings hooks
export function useGradingScale() {
  return useSWR('/settings/grading', fetcher);
}

export function useAcademicYears() {
  return useSWR('/settings/academic-years', fetcher);
}

export function useCurrentAcademicYear() {
  return useSWR('/settings/academic-years/current', fetcher);
}

// Dashboard hooks
export function useDashboardStats(role: 'admin' | 'teacher' | 'parent') {
  return useSWR(`/dashboard/stats?role=${role}`, fetcher);
}
```

### 15.3 SWR Mutation Hooks

```typescript
// lib/swr/mutations.ts
import useSWRMutation from 'swr/mutation';
import apiClient from '../api/client';

// Generic mutation functions
async function postData(url: string, { arg }: { arg: any }) {
  const response = await apiClient.post(url, arg);
  return response.data;
}

async function putData(url: string, { arg }: { arg: any }) {
  const response = await apiClient.put(url, arg);
  return response.data;
}

async function deleteData(url: string) {
  const response = await apiClient.delete(url);
  return response.data;
}

// Attendance mutations
export function useMarkAttendance() {
  return useSWRMutation('/attendance/mark', postData);
}

// Marks mutations
export function useEnterMarks() {
  return useSWRMutation('/marks/enter', postData);
}

// Appointment mutations
export function useCreateAppointment() {
  return useSWRMutation('/appointments', postData);
}

export function useUpdateAppointmentStatus(id: string) {
  return useSWRMutation(`/appointments/${id}/status`, async (url, { arg }) => {
    const response = await apiClient.patch(url, arg);
    return response.data;
  });
}

// Notice mutations
export function useCreateNotice() {
  return useSWRMutation('/notices', postData);
}

// Notification mutations
export function useMarkNotificationRead(id: string) {
  return useSWRMutation(`/notifications/${id}/read`, async (url) => {
    const response = await apiClient.patch(url);
    return response.data;
  });
}

export function useMarkAllNotificationsRead() {
  return useSWRMutation('/notifications/read-all', async (url) => {
    const response = await apiClient.patch(url);
    return response.data;
  });
}

// Report mutations
export function useGenerateReport() {
  return useSWRMutation('/reports/student', postData);
}
```

---

## 16. Frontend Integration Examples

### 16.1 Login Page Integration

```typescript
// app/(auth)/login/page.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth/context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { showErrorToast } from '@/lib/utils/toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (!success) {
        showErrorToast('Invalid email or password');
      }
    } catch (error) {
      showErrorToast(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <Input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </Button>
    </form>
  );
}
```

### 16.2 Attendance Page Integration

```typescript
// app/(dashboard)/dashboard/attendance/page.tsx
'use client';

import { useState } from 'react';
import { useAttendance, useMarkAttendance } from '@/lib/swr/hooks';
import { showSuccessToast, showErrorToast } from '@/lib/utils/toast';

export default function AttendancePage() {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  const { data, error, isLoading, mutate } = useAttendance(selectedClass, selectedDate);
  const { trigger: markAttendance, isMutating } = useMarkAttendance();

  const handleMarkAttendance = async (attendance: any[]) => {
    try {
      await markAttendance({
        classId: selectedClass,
        date: selectedDate,
        attendance,
      });
      
      showSuccessToast('Attendance marked successfully');
      mutate(); // Refresh data
    } catch (error) {
      showErrorToast(error);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading attendance</div>;

  return (
    <div>
      {/* Render attendance table */}
      {/* data.data contains the attendance records */}
    </div>
  );
}
```

### 16.3 Notifications Integration

```typescript
// components/dashboard/notifications-popover.tsx
'use client';

import { useNotifications, useUnreadNotificationCount } from '@/lib/swr/hooks';
import { useMarkNotificationRead, useMarkAllNotificationsRead } from '@/lib/swr/mutations';
import { Bell } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

export function NotificationsPopover() {
  const { data: notifications, mutate } = useNotifications({ limit: 5 });
  const { data: countData } = useUnreadNotificationCount();
  const { trigger: markAsRead } = useMarkNotificationRead('');
  const { trigger: markAllRead } = useMarkAllNotificationsRead();

  const unreadCount = countData?.data?.count || 0;

  const handleMarkAsRead = async (id: string) => {
    await markAsRead({ id });
    mutate();
  };

  const handleMarkAllRead = async () => {
    await markAllRead();
    mutate();
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        {/* Render notifications list */}
      </PopoverContent>
    </Popover>
  );
}
```

### 16.4 Reports Page Integration

```typescript
// app/(dashboard)/dashboard/reports/page.tsx
'use client';

import { useState } from 'react';
import { useReports, useGenerateReport } from '@/lib/swr/hooks';
import { reportsAPI } from '@/lib/api/reports';
import { showSuccessToast, showErrorToast } from '@/lib/utils/toast';

export default function ReportsPage() {
  const { data: reports, mutate } = useReports();
  const { trigger: generateReport, isMutating } = useGenerateReport();

  const handleGenerateReport = async (studentId: string, type: string, term: string) => {
    try {
      await generateReport({ studentId, type, term });
      showSuccessToast('Report generated successfully');
      mutate();
    } catch (error) {
      showErrorToast(error);
    }
  };

  const handleDownload = async (reportId: string) => {
    try {
      const blob = await reportsAPI.downloadReport(reportId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${reportId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      showErrorToast(error);
    }
  };

  return (
    <div>
      {/* Render reports UI */}
    </div>
  );
}
```

---

## 17. API Response Codes

### 17.1 Success Codes

| Code | Description |
|------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 204 | No Content - Request successful, no content to return |

### 17.2 Client Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid request data |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Access denied |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 422 | Unprocessable Entity - Validation error |
| 429 | Too Many Requests - Rate limit exceeded |

### 17.3 Server Error Codes

| Code | Description |
|------|-------------|
| 500 | Internal Server Error |
| 502 | Bad Gateway |
| 503 | Service Unavailable |
| 504 | Gateway Timeout |

---

## 18. Rate Limiting

### 18.1 Rate Limits

| Endpoint Category | Limit | Window |
|-------------------|-------|--------|
| Authentication | 5 requests | 15 minutes |
| General API | 100 requests | 1 minute |
| File Upload | 10 requests | 1 minute |
| Report Generation | 5 requests | 5 minutes |

### 18.2 Rate Limit Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

### 18.3 Handling Rate Limits

```typescript
// lib/api/client.ts
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'];
      toast.error(`Rate limit exceeded. Please try again in ${retryAfter} seconds.`);
    }
    return Promise.reject(error);
  }
);
```

---

## 19. Testing APIs

### 19.1 API Testing with Jest

```typescript
// __tests__/api/auth.test.ts
import { authAPI } from '@/lib/api/auth';
import apiClient from '@/lib/api/client';

jest.mock('@/lib/api/client');

describe('Auth API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should login successfully', async () => {
    const mockResponse = {
      data: {
        success: true,
        data: {
          user: { id: '1', email: 'test@example.com', role: 'admin' },
          token: 'test-token',
          refreshToken: 'refresh-token',
        },
      },
    };

    (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

    const result = await authAPI.login('test@example.com', 'password');

    expect(apiClient.post).toHaveBeenCalledWith('/auth/login', {
      email: 'test@example.com',
      password: 'password',
    });
    expect(result.data.user.email).toBe('test@example.com');
  });

  it('should handle login error', async () => {
    const mockError = {
      response: {
        status: 401,
        data: {
          success: false,
          error: {
            code: 'AUTH_INVALID_CREDENTIALS',
            message: 'Invalid email or password',
          },
        },
      },
    };

    (apiClient.post as jest.Mock).mockRejectedValue(mockError);

    await expect(authAPI.login('test@example.com', 'wrong')).rejects.toThrow();
  });
});
```

### 19.2 Integration Testing

```typescript
// __tests__/integration/attendance.test.ts
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AttendancePage from '@/app/(dashboard)/dashboard/attendance/page';
import { SWRConfig } from 'swr';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <SWRConfig value={{ provider: () => new Map() }}>
    {children}
  </SWRConfig>
);

describe('Attendance Page Integration', () => {
  it('should load and display attendance data', async () => {
    render(<AttendancePage />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Attendance')).toBeInTheDocument();
    });
  });

  it('should mark attendance successfully', async () => {
    render(<AttendancePage />, { wrapper });

    const markButton = await screen.findByText('Mark Attendance');
    await userEvent.click(markButton);

    await waitFor(() => {
      expect(screen.getByText('Attendance marked successfully')).toBeInTheDocument();
    });
  });
});
```

---

## Appendix A: Complete API Endpoints Reference

| Module | Endpoint | Method | Access |
|--------|----------|--------|--------|
| **Auth** | `/api/auth/login` | POST | Public |
| | `/api/auth/logout` | POST | Auth |
| | `/api/auth/refresh` | POST | Public |
| | `/api/auth/me` | GET | Auth |
| | `/api/auth/forgot-password` | POST | Public |
| | `/api/auth/reset-password` | POST | Public |
| | `/api/auth/change-password` | POST | Auth |
| **Users** | `/api/users/teachers` | GET, POST | Admin |
| | `/api/users/teachers/:id` | GET, PUT, DELETE | Admin |
| | `/api/users/students` | GET, POST | Admin |
| | `/api/users/students/:id` | GET, PUT, DELETE | Admin/Teacher/Parent |
| | `/api/users/parents` | GET, POST | Admin |
| | `/api/users/parents/:id` | GET, PUT, DELETE | Admin |
| **Academic** | `/api/academic/classes` | GET, POST | Admin |
| | `/api/academic/classes/:id` | GET, PUT, DELETE | Admin |
| | `/api/academic/subjects` | GET, POST | Admin |
| | `/api/academic/subjects/:id` | GET, PUT, DELETE | Admin |
| **Attendance** | `/api/attendance` | GET | Admin/Teacher |
| | `/api/attendance/mark` | POST | Teacher |
| | `/api/attendance/student/:id` | GET | All |
| **Marks** | `/api/marks/exam/:id` | GET | Admin/Teacher |
| | `/api/marks/student/:id` | GET | All |
| | `/api/marks/enter` | POST | Teacher |
| | `/api/marks/upload-paper` | POST | Teacher |
| **Exams** | `/api/exams` | GET, POST | Admin/Teacher |
| | `/api/exams/:id` | GET, PUT, DELETE | Admin/Teacher |
| **Appointments** | `/api/appointments` | GET, POST | All |
| | `/api/appointments/:id/status` | PATCH | Teacher |
| **Notices** | `/api/notices` | GET, POST | All/Admin+Teacher |
| | `/api/notices/:id` | GET, PUT, DELETE | All/Owner |
| **Notifications** | `/api/notifications` | GET | Auth |
| | `/api/notifications/:id/read` | PATCH | Auth |
| | `/api/notifications/read-all` | PATCH | Auth |
| **Reports** | `/api/reports` | GET | All |
| | `/api/reports/student` | POST | All |
| | `/api/reports/class` | POST | Admin/Teacher |
| | `/api/reports/school` | POST | Admin |
| **Settings** | `/api/settings/grading` | GET, PUT | All/Admin |
| | `/api/settings/academic-years` | GET, POST | Admin |
| | `/api/settings/preferences` | GET, PUT | Auth |
| **Upload** | `/api/upload/profile-picture` | POST | Auth |
| | `/api/upload/exam-paper` | POST | Teacher |

---

## Appendix B: Environment Variables Checklist

```bash
# Required for API connection
NEXT_PUBLIC_API_URL=           # Backend API URL

# Required for Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Backend only (not exposed to client)
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=
```

---

**Document End**

*This API Integration Documentation provides complete guidance for connecting the Digital Iskole frontend to its backend services.*
