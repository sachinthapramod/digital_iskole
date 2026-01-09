# Digital Iskole
## School Management System - User Roles & Responsibilities and Core Features Documentation

---

## Document Information

| Field | Details |
|-------|---------|
| **Project Name** | Digital Iskole |
| **Version** | 1.0.0 |
| **Document Type** | Technical & Functional Specification |
| **Last Updated** | January 2026 |

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Technical Specifications](#2-technical-specifications)
3. [User Roles & Responsibilities](#3-user-roles--responsibilities)
4. [Core Features](#4-core-features)
5. [Module Specifications](#5-module-specifications)
6. [Access Control Matrix](#6-access-control-matrix)
7. [Data Flow Diagrams](#7-data-flow-diagrams)
8. [Security Considerations](#8-security-considerations)

---

## 1. System Overview

### 1.1 Introduction

Digital Iskole is a comprehensive, web-based school management system designed specifically for Sri Lankan schools. The system facilitates seamless communication and data management between administrators, teachers, and parents while providing robust tools for academic tracking, attendance management, and performance reporting.

### 1.2 Key Objectives

- **Centralized Management**: Provide a single platform for all school administrative tasks
- **Real-time Communication**: Enable instant communication between teachers and parents
- **Academic Tracking**: Monitor student performance, attendance, and growth over time
- **Accessibility**: Support multiple languages (English, Sinhala, Tamil) for inclusive access
- **Mobile-First Design**: Ensure full functionality on mobile devices for on-the-go access

### 1.3 Target Users

| User Type | Description |
|-----------|-------------|
| **Administrators** | School management staff responsible for overall system administration |
| **Teachers** | Class teachers responsible for managing their assigned classes |
| **Parents** | Guardians of students enrolled in the school |

---

## 2. Technical Specifications

### 2.1 Technology Stack

| Layer | Technology |
|-------|------------|
| **Frontend Framework** | Next.js 16 (React 19) |
| **UI Components** | shadcn/ui |
| **Styling** | Tailwind CSS v4 |
| **State Management** | React Context API |
| **Data Fetching** | SWR (Stale-While-Revalidate) |
| **Backend** | Node.js (planned) |
| **Database** | Firebase Firestore |
| **Authentication** | Firebase Authentication |
| **File Storage** | Firebase Storage |
| **Push Notifications** | Firebase Cloud Messaging (FCM) |

### 2.2 Browser Support

| Browser | Minimum Version |
|---------|-----------------|
| Chrome | 90+ |
| Firefox | 88+ |
| Safari | 14+ |
| Edge | 90+ |
| Mobile Safari | iOS 14+ |
| Chrome Mobile | Android 10+ |

### 2.3 Multi-Language Support

The system supports three languages with complete UI translations:

| Language | Code | Script |
|----------|------|--------|
| English | `en` | Latin |
| Sinhala | `si` | Sinhala |
| Tamil | `ta` | Tamil |

### 2.4 Theme Support

| Theme | Description |
|-------|-------------|
| **Light Mode** | Default bright theme with teal accent colors |
| **Dark Mode** | Eye-friendly dark theme for low-light usage |

---

## 3. User Roles & Responsibilities

### 3.1 Administrator Role

#### 3.1.1 Overview

The Administrator is the highest-level user with complete system oversight. Administrators manage the school's digital infrastructure, user accounts, and academic structure.

#### 3.1.2 Primary Responsibilities

| Responsibility | Description |
|----------------|-------------|
| **User Management** | Create, update, and delete accounts for teachers, students, and parents |
| **Academic Structure** | Define and manage classes, sections, and subjects |
| **System Configuration** | Configure grading scales, academic years, and system settings |
| **Oversight** | Monitor all school activities, appointments, and communications |
| **Reporting** | Generate school-wide, class-level, and individual student reports |

#### 3.1.3 Dashboard Features

| Feature | Description |
|---------|-------------|
| **Statistics Overview** | Total students, teachers, classes, and overall attendance rate |
| **Recent Notices** | Latest announcements published in the system |
| **Upcoming Exams** | Scheduled examinations across all classes |
| **Pending Appointments** | View-only list of parent-teacher appointment requests |

#### 3.1.4 Permissions Summary

| Action | Permission |
|--------|------------|
| Create Users | Yes |
| Edit Users | Yes |
| Delete Users | Yes |
| Manage Classes | Yes |
| Manage Subjects | Yes |
| View All Attendance | Yes |
| Mark Attendance | No |
| View All Marks | Yes |
| Enter Marks | No |
| Approve Appointments | No (View Only) |
| Create Notices | Yes (All Targets) |
| Configure Settings | Yes |
| Generate All Reports | Yes |

---

### 3.2 Teacher Role (Class Teacher)

#### 3.2.1 Overview

Teachers are responsible for managing their assigned class, including student attendance, academic records, and parent communication. Each teacher is assigned to one class as the Class Teacher.

#### 3.2.2 Primary Responsibilities

| Responsibility | Description |
|----------------|-------------|
| **Attendance Management** | Mark daily attendance for assigned class students |
| **Academic Records** | Enter and manage marks for examinations and assessments |
| **Exam Papers** | Upload scanned exam papers for parent review |
| **Parent Communication** | Handle appointment requests and create class notices |
| **Student Monitoring** | Track individual student performance and progress |
| **Reporting** | Generate student and class performance reports |

#### 3.2.3 Dashboard Features

| Feature | Description |
|---------|-------------|
| **Class Statistics** | Total students, today's attendance count, class average marks, pending tasks |
| **Progress Stats** | Class average trend, attendance rate, pass rate with comparisons to previous term |
| **Subject Performance** | Visual breakdown of average marks per subject |
| **Top Performers** | List of highest-performing students in the class |
| **Notices** | Recent announcements relevant to the teacher |

#### 3.2.4 Permissions Summary

| Action | Permission |
|--------|------------|
| View Own Class Students | Yes |
| View Other Class Students | No |
| Mark Attendance | Yes (Own Class) |
| View Attendance History | Yes (Own Class) |
| Enter Marks | Yes (Own Class) |
| Upload Exam Papers | Yes (Own Class) |
| Approve Appointments | Yes (Own Class Parents) |
| Reject Appointments | Yes (Own Class Parents) |
| Complete Appointments | Yes (Own Class Parents) |
| Create Notices | Yes (Own Class Only) |
| Generate Reports | Yes (Own Class/Students) |

---

### 3.3 Parent Role

#### 3.3.1 Overview

Parents have read-only access to their children's academic information. They can monitor progress, view attendance, access exam results, and communicate with class teachers through appointment requests.

#### 3.3.2 Primary Responsibilities

| Responsibility | Description |
|----------------|-------------|
| **Progress Monitoring** | Track children's academic performance and growth |
| **Attendance Review** | Monitor daily attendance and identify patterns |
| **Exam Review** | View marks and download scanned exam papers |
| **Teacher Communication** | Request appointments with class teachers |
| **Stay Informed** | Read notices and notifications from the school |
| **Report Access** | Generate and download comprehensive reports for children |

#### 3.3.3 Dashboard Features

| Feature | Description |
|---------|-------------|
| **Children Overview** | Cards showing each child's key metrics (attendance, marks, rank) |
| **Recent Exam Results** | Latest examination scores for all children |
| **Appointments** | Status of requested parent-teacher meetings |
| **Notices** | Announcements targeted to the parent |

#### 3.3.4 Permissions Summary

| Action | Permission |
|--------|------------|
| View Own Children Data | Yes |
| View Other Students | No |
| Mark Attendance | No |
| View Children Attendance | Yes |
| Enter Marks | No |
| View Children Marks | Yes |
| Download Exam Papers | Yes (Own Children) |
| Request Appointments | Yes (Children's Teachers) |
| Create Notices | No |
| Generate Reports | Yes (Own Children Only) |

---

## 4. Core Features

### 4.1 Authentication & Authorization

#### 4.1.1 Login System

| Feature | Description |
|---------|-------------|
| **Email/Password Login** | Standard authentication with email and password |
| **Role Detection** | Automatic role identification upon login |
| **Session Persistence** | Maintain login state across browser sessions |
| **Password Visibility** | Toggle to show/hide password during entry |
| **Demo Credentials** | Pre-configured demo accounts for testing |

#### 4.1.2 Role-Based Access Control

The system implements strict role-based access control (RBAC) with the following hierarchy:

```
Administrator (Highest)
    └── Full system access
    └── Cannot approve appointments (view only)

Teacher (Middle)
    └── Full access to assigned class
    └── Limited system-wide access

Parent (Lowest)
    └── Read-only access to own children
    └── Can request appointments
```

### 4.2 Multi-Language Support

#### 4.2.1 Implementation Details

| Aspect | Description |
|--------|-------------|
| **Translation System** | Custom i18n implementation with React Context |
| **Language Switching** | Instant switching without page reload |
| **Persistence** | Selected language saved to localStorage |
| **Coverage** | All UI elements, labels, messages, and notifications |

#### 4.2.2 Supported Languages

| Language | Native Name | Code |
|----------|-------------|------|
| English | English | `en` |
| Sinhala | සිංහල | `si` |
| Tamil | தமிழ் | `ta` |

### 4.3 Theme System

#### 4.3.1 Color Palette

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `--primary` | Teal 600 | Teal 500 | Primary actions, links |
| `--secondary` | Gray 100 | Gray 800 | Secondary elements |
| `--background` | White | Gray 950 | Page backgrounds |
| `--foreground` | Gray 950 | Gray 50 | Primary text |
| `--muted` | Gray 100 | Gray 800 | Muted backgrounds |
| `--accent` | Teal 100 | Teal 900 | Accent highlights |

#### 4.3.2 Theme Switching

| Feature | Description |
|---------|-------------|
| **Toggle Button** | Sun/Moon icon in header |
| **Persistence** | Theme preference saved locally |
| **System Detection** | Option to follow system preference |

---

## 5. Module Specifications

### 5.1 Dashboard Module

#### 5.1.1 Admin Dashboard

| Component | Description |
|-----------|-------------|
| **Stats Cards** | Four cards showing total students, teachers, classes, attendance rate |
| **Recent Notices** | List of 3 most recent announcements with priority badges |
| **Upcoming Exams** | Table of scheduled exams with date, subject, class |
| **Pending Appointments** | Card grid of appointment requests (view only) |

#### 5.1.2 Teacher Dashboard

| Component | Description |
|-----------|-------------|
| **Stats Cards** | Class students, today's attendance, class average, pending tasks |
| **Progress Stats** | Class average with trend, attendance rate, pass rate, subject breakdown |
| **Student Attendance** | Visual overview of today's attendance by student |
| **Notices** | Recent announcements with priority indicators |

#### 5.1.3 Parent Dashboard

| Component | Description |
|-----------|-------------|
| **Children Cards** | Overview card per child with photo, class, attendance, marks |
| **Recent Results** | Latest exam results for all children |
| **Appointments** | Status cards for requested meetings |
| **Notices** | Targeted announcements for the parent |

---

### 5.2 User Management Module (Admin Only)

#### 5.2.1 Teachers Management

| Feature | Description |
|---------|-------------|
| **List View** | Table with name, email, phone, subject, assigned class |
| **Search** | Filter by name or email |
| **Add Teacher** | Dialog form with validation |
| **Edit Teacher** | Modify existing teacher details |
| **Delete Teacher** | Remove with confirmation dialog |

**Teacher Data Fields:**
- Full Name (required)
- Email Address (required, unique)
- Phone Number (required)
- Subject Specialization (required)
- Assigned Class (optional)

#### 5.2.2 Students Management

| Feature | Description |
|---------|-------------|
| **List View** | Table with name, admission number, class, parent |
| **Search** | Filter by name or admission number |
| **Add Student** | Dialog form with parent linking |
| **Edit Student** | Modify student details |
| **Delete Student** | Remove with confirmation |

**Student Data Fields:**
- Full Name (required)
- Admission Number (required, unique)
- Class Assignment (required)
- Linked Parent (required)
- Date of Birth
- Address

#### 5.2.3 Parents Management

| Feature | Description |
|---------|-------------|
| **List View** | Table with name, email, phone, children list |
| **Search** | Filter by name or email |
| **Add Parent** | Dialog form with children selection |
| **Edit Parent** | Modify parent details and children links |
| **Delete Parent** | Remove with confirmation |

**Parent Data Fields:**
- Full Name (required)
- Email Address (required, unique)
- Phone Number (required)
- Linked Children (required, multi-select)
- Address

---

### 5.3 Academic Management Module (Admin Only)

#### 5.3.1 Classes Management

| Feature | Description |
|---------|-------------|
| **List View** | Cards showing class name, teacher, student count |
| **Add Class** | Create new class with section |
| **Edit Class** | Modify class details |
| **Delete Class** | Remove class (with student reassignment warning) |
| **Assign Teacher** | Link class teacher to class |

**Class Data Fields:**
- Grade Level (1-13)
- Section (A, B, C, D)
- Class Teacher (foreign key)
- Student Capacity
- Academic Year

#### 5.3.2 Subjects Management

| Feature | Description |
|---------|-------------|
| **List View** | Table with subject name, code, assigned grades |
| **Add Subject** | Create new subject |
| **Edit Subject** | Modify subject details |
| **Delete Subject** | Remove subject |

**Subject Data Fields:**
- Subject Name (required)
- Subject Code (required, unique)
- Applicable Grades (multi-select)
- Is Core Subject (boolean)

---

### 5.4 Attendance Module

#### 5.4.1 Teacher View

| Feature | Description |
|---------|-------------|
| **Date Selection** | Calendar picker for attendance date |
| **Student List** | All students in assigned class |
| **Status Marking** | Present (P), Absent (A), Late (L) buttons |
| **Bulk Actions** | Mark all present/absent |
| **Statistics** | Real-time count of present/absent/late |
| **Save** | Submit attendance for the day |

#### 5.4.2 Admin View

| Feature | Description |
|---------|-------------|
| **Class Filter** | Select any class to view |
| **Date Range** | Filter by date range |
| **View Only** | Cannot modify attendance records |
| **Export** | Download attendance data |

#### 5.4.3 Parent View

| Feature | Description |
|---------|-------------|
| **Child Selector** | Tabs for multiple children |
| **Attendance Stats** | Overall rate, present days, absent days, late days |
| **Recent History** | Last 10 school days with status icons |
| **Monthly Summary** | Visual bar chart of monthly attendance |
| **Holiday Display** | School holidays marked in calendar |

**Attendance Statuses:**
| Status | Code | Color | Description |
|--------|------|-------|-------------|
| Present | P | Green | Student attended class |
| Absent | A | Red | Student did not attend |
| Late | L | Yellow | Student arrived late |
| Holiday | H | Blue | School holiday |

---

### 5.5 Marks & Examinations Module

#### 5.5.1 Exam Types

| Type | Code | Description |
|------|------|-------------|
| First Term | `first-term` | First term examination |
| Second Term | `second-term` | Second term examination |
| Third Term | `third-term` | Third term examination |
| Monthly Test | `monthly` | Monthly assessment |
| Quiz | `quiz` | Short quiz/test |
| Assignment | `assignment` | Homework/project |

#### 5.5.2 Exam Management (Admin/Teacher)

| Feature | Description |
|---------|-------------|
| **Exam List** | Table of all scheduled exams |
| **Add Exam** | Create new exam with type, date, subject, class |
| **Edit Exam** | Modify exam details |
| **Delete Exam** | Remove exam schedule |

#### 5.5.3 Marks Entry (Teacher)

| Feature | Description |
|---------|-------------|
| **Exam Selection** | Choose exam to enter marks for |
| **Subject Selection** | Select subject |
| **Student List** | All students with marks input fields |
| **Auto-Grade** | Automatic grade calculation based on marks |
| **Exam Paper Upload** | Upload scanned papers per student |
| **Save** | Submit marks for all students |

#### 5.5.4 Marks Viewing (Parent)

| Feature | Description |
|---------|-------------|
| **Child Selector** | Tabs for multiple children |
| **Subject Grid** | All subjects with marks and grades |
| **Exam Paper Download** | View/download scanned exam papers |
| **Progress Bars** | Visual representation of marks |
| **Grade Display** | Letter grade with color coding |

**Default Grading Scale:**
| Grade | Marks Range | Description |
|-------|-------------|-------------|
| A | 75-100 | Excellent |
| B | 65-74 | Very Good |
| C | 55-64 | Good |
| D | 40-54 | Satisfactory |
| F | 0-39 | Fail |

---

### 5.6 Appointments Module

#### 5.6.1 Workflow

```
Parent Requests → Teacher Reviews → Approved/Rejected → Completed
```

#### 5.6.2 Appointment Statuses

| Status | Color | Description |
|--------|-------|-------------|
| Pending | Yellow | Awaiting teacher review |
| Approved | Green | Confirmed by teacher |
| Rejected | Red | Declined by teacher |
| Completed | Blue | Meeting has occurred |

#### 5.6.3 Parent Features

| Feature | Description |
|---------|-------------|
| **Request Appointment** | Select child (auto-assigns class teacher), date, time, reason |
| **View Status** | See current status of all requests |
| **Cancel Request** | Cancel pending appointments |

#### 5.6.4 Teacher Features

| Feature | Description |
|---------|-------------|
| **Request List** | View all appointment requests |
| **Approve** | Accept appointment request |
| **Reject** | Decline with optional reason |
| **Complete** | Mark appointment as conducted |

#### 5.6.5 Admin Features

| Feature | Description |
|---------|-------------|
| **View All** | See all appointments across classes |
| **No Actions** | Cannot approve, reject, or complete |

---

### 5.7 Notices Module

#### 5.7.1 Notice Structure

| Field | Description |
|-------|-------------|
| Title | Notice heading (required) |
| Content | Full notice text (required) |
| Priority | High, Medium, Normal |
| Target Audience | All, Teachers, Parents, Students, Specific Class |
| Author | Creator's name and role |
| Created Date | Timestamp |
| Attachments | Optional file attachments |

#### 5.7.2 Priority Levels

| Priority | Color | Use Case |
|----------|-------|----------|
| High | Red | Urgent announcements, emergencies |
| Medium | Yellow | Important but not urgent |
| Normal | Green | Regular announcements |

#### 5.7.3 Admin Capabilities

| Feature | Description |
|---------|-------------|
| **Create** | Create notices for any target audience |
| **Edit** | Modify any notice |
| **Delete** | Remove any notice |
| **View All** | See all notices in the system |

#### 5.7.4 Teacher Capabilities

| Feature | Description |
|---------|-------------|
| **Create** | Create notices for own class only |
| **Edit** | Modify own notices only |
| **Delete** | Delete own notices only |
| **View** | See notices targeted to teachers or own class |

#### 5.7.5 Parent Capabilities

| Feature | Description |
|---------|-------------|
| **View Only** | See notices targeted to parents or own children's class |

---

### 5.8 Notifications Module

#### 5.8.1 Notification Types

| Type | Icon | Trigger Events |
|------|------|----------------|
| Notice | Megaphone | New announcement published |
| Appointment | Calendar | Request status change |
| Marks | FileText | New marks entered |
| Attendance | ClipboardCheck | Attendance marked (absent/late) |
| Exam | BookOpen | New exam scheduled |
| System | Bell | System alerts |

#### 5.8.2 Features

| Feature | Description |
|---------|-------------|
| **Bell Icon Badge** | Unread count in header |
| **Popover Preview** | Quick view of recent notifications |
| **Full Page** | Complete notification list with filters |
| **Mark as Read** | Individual or bulk mark as read |
| **Delete** | Remove notifications |
| **Filter by Type** | Show specific notification types |

---

### 5.9 Reports Module

#### 5.9.1 Report Types

| Type | Description | Available To |
|------|-------------|--------------|
| Term Report | Subject-wise marks for specific term | All Roles |
| Progress Report | Term-over-term comparison | All Roles |
| Attendance Report | Detailed attendance breakdown | All Roles |
| Full Academic Report | Comprehensive all-inclusive report | All Roles |

#### 5.9.2 Report Scopes by Role

| Role | Individual Student | Class Report | School Report |
|------|-------------------|--------------|---------------|
| Admin | Any student | Any class | Yes |
| Teacher | Own class students | Own class | No |
| Parent | Own children only | No | No |

#### 5.9.3 Report Content

**Individual Student Report:**
- Student Information (name, class, admission number, rank)
- Performance Summary (average marks, attendance rate, grade distribution)
- Subject-wise Marks with Grades
- Term Progress Comparison (bar chart)
- Attendance Breakdown
- Achievements and Awards

**Class Report:**
- Class Information (name, teacher, student count)
- Class Statistics (average, attendance rate, pass rate)
- Subject-wise Performance
- Top 10 Performers
- All Students Ranking

**School Report (Admin Only):**
- School Overview Statistics
- Class-wise Performance Ranking
- Top 10 Students School-wide
- Subject-wise Analysis
- Attendance Trends

#### 5.9.4 Report Actions

| Action | Description |
|--------|-------------|
| **Preview** | View report before saving |
| **Generate** | Create and save report |
| **View** | Open saved report |
| **Download/Print** | Export as PDF |
| **Delete** | Remove saved report |

---

### 5.10 Profile Module

#### 5.10.1 Profile Information

| Field | Editable | Description |
|-------|----------|-------------|
| Full Name | Yes | User's display name |
| Email | No | Login email (read-only) |
| Phone | Yes | Contact number |
| Address | Yes | Residential address |
| Profile Picture | Yes | User avatar |
| Role | No | System role (read-only) |

#### 5.10.2 Change Password

| Field | Description |
|-------|-------------|
| Current Password | Verify existing password |
| New Password | New password entry |
| Confirm Password | Re-enter new password |

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

---

### 5.11 Settings Module

#### 5.11.1 App Preferences (All Users)

| Setting | Options | Description |
|---------|---------|-------------|
| Theme | Light, Dark, System | Visual theme preference |
| Language | English, Sinhala, Tamil | Interface language |
| Notifications | On/Off | Enable/disable push notifications |

#### 5.11.2 Grading System (Admin Only)

| Feature | Description |
|---------|-------------|
| **View Grades** | Table of all grade definitions |
| **Add Grade** | Create new grade with marks range |
| **Edit Grade** | Modify grade boundaries |
| **Delete Grade** | Remove grade definition |

**Grade Configuration Fields:**
- Grade Letter (A, B, C, etc.)
- Minimum Marks
- Maximum Marks
- Description

#### 5.11.3 Academic Year (Admin Only)

| Feature | Description |
|---------|-------------|
| **View Years** | List of all academic years |
| **Add Year** | Create new academic year |
| **Set Current** | Mark year as active |
| **Edit Year** | Modify year dates |
| **Delete Year** | Remove year (cannot delete current) |

**Academic Year Fields:**
- Year Name (e.g., "2025/2026")
- Start Date
- End Date
- Status (Active, Upcoming, Completed)

---

## 6. Access Control Matrix

### 6.1 Module Access

| Module | Admin | Teacher | Parent |
|--------|-------|---------|--------|
| Dashboard | Full | Class-specific | Children-specific |
| User Management | Full CRUD | None | None |
| Academic Management | Full CRUD | None | None |
| Attendance | View All | Mark & View Class | View Children |
| Marks & Exams | View All, Manage Exams | Enter & View Class | View Children |
| Appointments | View Only | Full Management | Request & View |
| Notices | Full CRUD | Create/Edit Own | View Only |
| Notifications | Full | Full | Full |
| Reports | All Scopes | Class & Student | Children Only |
| Profile | Edit Own | Edit Own | Edit Own |
| Settings | All Settings | Preferences Only | Preferences Only |

### 6.2 Data Visibility

| Data Type | Admin | Teacher | Parent |
|-----------|-------|---------|--------|
| All Students | Yes | Own Class | Own Children |
| All Teachers | Yes | No | No |
| All Parents | Yes | Own Class Parents | No |
| All Attendance | Yes | Own Class | Own Children |
| All Marks | Yes | Own Class | Own Children |
| All Appointments | Yes (View) | Own Class | Own Requests |
| All Notices | Yes | Relevant | Relevant |

---

## 7. Data Flow Diagrams

### 7.1 Authentication Flow

```
User enters credentials
        │
        ▼
Firebase Authentication
        │
        ├── Success ──► Fetch user profile from Firestore
        │                       │
        │                       ▼
        │               Determine user role
        │                       │
        │                       ▼
        │               Redirect to role dashboard
        │
        └── Failure ──► Display error message
```

### 7.2 Attendance Marking Flow (Teacher)

```
Teacher selects date
        │
        ▼
Load student list for class
        │
        ▼
Teacher marks each student (P/A/L)
        │
        ▼
Submit attendance
        │
        ▼
Save to Firestore
        │
        ▼
Trigger notifications for absent students' parents
```

### 7.3 Appointment Request Flow

```
Parent selects child
        │
        ▼
System shows child's class teacher
        │
        ▼
Parent selects date, time, reason
        │
        ▼
Submit request (Status: Pending)
        │
        ▼
Teacher receives notification
        │
        ▼
Teacher reviews request
        │
        ├── Approve ──► Status: Approved ──► Parent notified
        │
        └── Reject ──► Status: Rejected ──► Parent notified
        
After meeting:
Teacher marks as Completed ──► Status: Completed
```

### 7.4 Report Generation Flow

```
User selects report parameters
        │
        ├── Student (Parent/Teacher/Admin)
        ├── Class (Teacher/Admin)
        └── School (Admin only)
        │
        ▼
Fetch relevant data from Firestore
        │
        ▼
Generate report preview (HTML)
        │
        ▼
User reviews preview
        │
        ├── Save ──► Store report metadata in Firestore
        │                    │
        │                    ▼
        │            Generate PDF (if requested)
        │                    │
        │                    ▼
        │            Upload to Firebase Storage
        │
        └── Cancel ──► Discard preview
```

---

## 8. Security Considerations

### 8.1 Authentication Security

| Measure | Implementation |
|---------|----------------|
| **Password Hashing** | Firebase Auth handles secure hashing |
| **Session Management** | JWT tokens with automatic refresh |
| **Rate Limiting** | Firebase Auth built-in protection |
| **Brute Force Protection** | Account lockout after failed attempts |

### 8.2 Authorization Security

| Measure | Implementation |
|---------|----------------|
| **Role-Based Access** | Server-side role verification |
| **Data Isolation** | Users can only access permitted data |
| **Firestore Rules** | Database-level security rules |

### 8.3 Data Security

| Measure | Implementation |
|---------|----------------|
| **HTTPS** | All traffic encrypted in transit |
| **Firestore Encryption** | Data encrypted at rest |
| **Input Validation** | Client and server-side validation |
| **XSS Prevention** | React's built-in escaping |

### 8.4 Recommended Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId || isAdmin();
    }
    
    // Students collection
    match /students/{studentId} {
      allow read: if isAdmin() || isTeacherOfStudent() || isParentOfStudent();
      allow write: if isAdmin() || isTeacherOfStudent();
    }
    
    // Attendance collection
    match /attendance/{attendanceId} {
      allow read: if isAdmin() || isTeacherOfClass() || isParentOfStudent();
      allow write: if isTeacherOfClass();
    }
    
    // Marks collection
    match /marks/{markId} {
      allow read: if isAdmin() || isTeacherOfClass() || isParentOfStudent();
      allow write: if isTeacherOfClass();
    }
    
    // Helper functions
    function isAdmin() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    function isTeacher() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'teacher';
    }
    
    function isParent() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'parent';
    }
  }
}
```

---

## Appendix A: Glossary

| Term | Definition |
|------|------------|
| **Class Teacher** | Teacher assigned to manage a specific class |
| **Academic Year** | School year period (e.g., 2025/2026) |
| **Term** | Division of academic year (First, Second, Third) |
| **Admission Number** | Unique identifier for each student |
| **RLS** | Row-Level Security for database access control |
| **FCM** | Firebase Cloud Messaging for push notifications |
| **SWR** | Stale-While-Revalidate data fetching pattern |

---

## Appendix B: Contact Information

For technical support or inquiries about Digital Iskole:

- **Documentation**: `/docs` folder in project repository
- **Issue Tracking**: GitHub Issues
- **Support**: Contact system administrator

---

*This document is maintained as part of the Digital Iskole project and should be updated as new features are added or existing features are modified.*
