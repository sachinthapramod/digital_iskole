# Frontend API Contract Map

This document maps all API endpoints expected by the frontend based on the codebase analysis.

**Generated:** 2025-01-XX  
**Base URL:** `/api` (from API Integration Documentation)  
**Version:** Optional `/api/v1` (frontend uses `/api` in examples)

---

## Authentication Endpoints

| Endpoint | Method | Request Body | Response | Auth Required |
|----------|--------|--------------|----------|---------------|
| `/api/auth/login` | POST | `{ email, password }` | `{ success, data: { user, token, refreshToken, expiresIn }, message }` | No |
| `/api/auth/logout` | POST | - | `{ success, message }` | Yes |
| `/api/auth/refresh` | POST | `{ refreshToken }` | `{ success, data: { token } }` | No |
| `/api/auth/me` | GET | - | `{ success, data: { user } }` | Yes |
| `/api/auth/forgot-password` | POST | `{ email }` | `{ success, message }` | No |
| `/api/auth/reset-password` | POST | `{ token, newPassword }` | `{ success, message }` | No |
| `/api/auth/change-password` | POST | `{ currentPassword, newPassword }` | `{ success, message }` | Yes |

**Token Format:** `Authorization: Bearer <token>`

---

## User Management Endpoints

### Teachers

| Endpoint | Method | Query Params | Request Body | Response | Access |
|----------|--------|--------------|--------------|----------|--------|
| `/api/users/teachers` | GET | `page?, limit?, search?, status?` | - | `PaginatedResponse<Teacher[]>` | Admin |
| `/api/users/teachers` | POST | - | `{ name, email, phone, subject, assignedClass?, password }` | `ApiResponse<Teacher>` | Admin |
| `/api/users/teachers/:id` | GET | - | - | `ApiResponse<Teacher>` | Admin |
| `/api/users/teachers/:id` | PUT | - | `{ name?, phone?, subject?, assignedClass?, status? }` | `ApiResponse<Teacher>` | Admin |
| `/api/users/teachers/:id` | DELETE | - | - | `ApiResponse<void>` | Admin |
| `/api/users/teachers/available` | GET | - | - | `ApiResponse<Teacher[]>` | Admin |
| `/api/users/teachers/:id/students` | GET | - | - | `ApiResponse<Student[]>` | Admin, Teacher |

### Students

| Endpoint | Method | Query Params | Request Body | Response | Access |
|----------|--------|--------------|--------------|----------|--------|
| `/api/users/students` | GET | `page?, limit?, search?, classId?, status?` | - | `PaginatedResponse<Student[]>` | Admin |
| `/api/users/students` | POST | - | `{ name, admissionNumber, classId, dateOfBirth, gender, address, parentId }` | `ApiResponse<Student>` | Admin |
| `/api/users/students/:id` | GET | - | - | `ApiResponse<Student>` | Admin, Teacher, Parent |
| `/api/users/students/:id` | PUT | - | `{ name?, classId?, address?, parentId?, status? }` | `ApiResponse<Student>` | Admin |
| `/api/users/students/:id` | DELETE | - | - | `ApiResponse<void>` | Admin |
| `/api/users/students/class/:classId` | GET | `page?, limit?` | - | `ApiResponse<Student[]>` | Admin, Teacher |
| `/api/users/students/:id/stats` | GET | - | - | `ApiResponse<StudentStats>` | Admin, Teacher, Parent |
| `/api/users/students/:id/attendance` | GET | `month?, year?` | - | `ApiResponse<Attendance[]>` | Admin, Teacher, Parent |
| `/api/users/students/:id/marks` | GET | `examId?, term?` | - | `ApiResponse<Mark[]>` | Admin, Teacher, Parent |

### Parents

| Endpoint | Method | Query Params | Request Body | Response | Access |
|----------|--------|--------------|--------------|----------|--------|
| `/api/users/parents` | GET | `page?, limit?, search?` | - | `PaginatedResponse<Parent[]>` | Admin |
| `/api/users/parents` | POST | - | `{ name, email, phone, address, password, childrenIds? }` | `ApiResponse<Parent>` | Admin |
| `/api/users/parents/:id` | GET | - | - | `ApiResponse<Parent>` | Admin |
| `/api/users/parents/:id` | PUT | - | `{ name?, phone?, address?, status? }` | `ApiResponse<Parent>` | Admin |
| `/api/users/parents/:id` | DELETE | - | - | `ApiResponse<void>` | Admin |
| `/api/users/parents/:id/children` | GET | - | - | `ApiResponse<Student[]>` | Admin, Parent |
| `/api/users/parents/:id/children` | POST | - | `{ studentId }` | `ApiResponse<void>` | Admin |
| `/api/users/parents/:id/children/:studentId` | DELETE | - | - | `ApiResponse<void>` | Admin |

---

## Academic Management Endpoints

### Classes

| Endpoint | Method | Query Params | Request Body | Response | Access |
|----------|--------|--------------|--------------|----------|--------|
| `/api/academic/classes` | GET | `academicYear?, grade?` | - | `ApiResponse<Class[]>` | Admin, Teacher |
| `/api/academic/classes` | POST | - | `{ name, grade, section, classTeacherId?, capacity, academicYear }` | `ApiResponse<Class>` | Admin |
| `/api/academic/classes/:id` | GET | - | - | `ApiResponse<Class>` | Admin, Teacher |
| `/api/academic/classes/:id` | PUT | - | `{ name?, classTeacherId?, capacity?, status? }` | `ApiResponse<Class>` | Admin |
| `/api/academic/classes/:id` | DELETE | - | - | `ApiResponse<void>` | Admin |
| `/api/academic/classes/:id/students` | GET | - | - | `ApiResponse<Student[]>` | Admin, Teacher |
| `/api/academic/classes/:id/stats` | GET | - | - | `ApiResponse<ClassStats>` | Admin, Teacher |
| `/api/academic/classes/:id/assign-teacher` | POST | - | `{ teacherId }` | `ApiResponse<Class>` | Admin |

### Subjects

| Endpoint | Method | Query Params | Request Body | Response | Access |
|----------|--------|--------------|--------------|----------|--------|
| `/api/academic/subjects` | GET | `grade?, isCore?` | - | `ApiResponse<Subject[]>` | Admin, Teacher |
| `/api/academic/subjects` | POST | - | `{ name, code, description?, grades, isCore }` | `ApiResponse<Subject>` | Admin |
| `/api/academic/subjects/:id` | GET | - | - | `ApiResponse<Subject>` | Admin, Teacher |
| `/api/academic/subjects/:id` | PUT | - | `{ name?, description?, grades?, isCore?, status? }` | `ApiResponse<Subject>` | Admin |
| `/api/academic/subjects/:id` | DELETE | - | - | `ApiResponse<void>` | Admin |
| `/api/academic/subjects/grade/:grade` | GET | - | - | `ApiResponse<Subject[]>` | Admin, Teacher |

---

## Attendance Endpoints

| Endpoint | Method | Query Params | Request Body | Response | Access |
|----------|--------|--------------|--------------|----------|--------|
| `/api/attendance` | GET | `classId, date` | - | `ApiResponse<AttendanceRecord[]>` | Admin, Teacher |
| `/api/attendance/mark` | POST | - | `{ classId, date, attendance: [{ studentId, status, remarks? }] }` | `ApiResponse<void>` | Teacher |
| `/api/attendance/:studentId` | PUT | - | `{ date, status, remarks? }` | `ApiResponse<AttendanceRecord>` | Teacher |
| `/api/attendance/student/:id` | GET | `startDate?, endDate?, month?, year?` | - | `ApiResponse<AttendanceRecord[]>` | Admin, Teacher, Parent |
| `/api/attendance/student/:id/stats` | GET | `term?, year?` | - | `ApiResponse<AttendanceStats>` | Admin, Teacher, Parent |
| `/api/attendance/class/:id/summary` | GET | `month?, year?` | - | `ApiResponse<ClassAttendanceSummary>` | Admin, Teacher |
| `/api/attendance/reports/daily` | GET | `date` | - | `ApiResponse<DailyAttendanceReport>` | Admin |
| `/api/attendance/reports/monthly` | GET | `classId, month, year` | - | `ApiResponse<MonthlyAttendanceReport>` | Admin, Teacher |

---

## Exams & Marks Endpoints

### Exams

| Endpoint | Method | Query Params | Request Body | Response | Access |
|----------|--------|--------------|--------------|----------|--------|
| `/api/exams` | GET | `classId?, subjectId?, type?, status?, startDate?, endDate?` | - | `ApiResponse<Exam[]>` | Admin, Teacher, Parent |
| `/api/exams` | POST | - | `{ name, type, classId, subjectId, date, startTime, endTime, totalMarks, passingMarks }` | `ApiResponse<Exam>` | Admin, Teacher |
| `/api/exams/:id` | GET | - | - | `ApiResponse<Exam>` | Admin, Teacher, Parent |
| `/api/exams/:id` | PUT | - | `{ name?, date?, startTime?, endTime?, totalMarks?, passingMarks?, status? }` | `ApiResponse<Exam>` | Admin, Teacher |
| `/api/exams/:id` | DELETE | - | - | `ApiResponse<void>` | Admin, Teacher |
| `/api/exams/upcoming` | GET | `classId?, limit?` | - | `ApiResponse<Exam[]>` | All |
| `/api/exams/:id/results` | GET | - | - | `ApiResponse<Mark[]>` | Admin, Teacher |

### Marks

| Endpoint | Method | Query Params | Request Body | Response | Access |
|----------|--------|--------------|--------------|----------|--------|
| `/api/marks/exam/:examId` | GET | - | - | `ApiResponse<Mark[]>` | Admin, Teacher |
| `/api/marks/student/:id` | GET | `term?, subjectId?, academicYear?` | - | `ApiResponse<Mark[]>` | Admin, Teacher, Parent |
| `/api/marks/enter` | POST | - | `{ examId, marks: [{ studentId, marks, remarks? }] }` | `ApiResponse<void>` | Teacher |
| `/api/marks/:id` | PUT | - | `{ marks?, remarks? }` | `ApiResponse<Mark>` | Teacher |
| `/api/marks/upload-paper` | POST | - | `FormData: { studentId, examId, file }` | `ApiResponse<{ url }>` | Teacher |
| `/api/marks/paper/:studentId/:examId` | GET | - | - | `ApiResponse<{ url }>` | Admin, Teacher, Parent |
| `/api/marks/paper/:studentId/:examId` | DELETE | - | - | `ApiResponse<void>` | Teacher |
| `/api/marks/class/:id/summary` | GET | `term?, examId?` | - | `ApiResponse<ClassMarksSummary>` | Admin, Teacher |
| `/api/marks/report-card/:studentId` | GET | `term` | - | `ApiResponse<ReportCard>` | Admin, Teacher, Parent |

---

## Appointments Endpoints

| Endpoint | Method | Query Params | Request Body | Response | Access |
|----------|--------|--------------|--------------|----------|--------|
| `/api/appointments` | GET | `status?, startDate?, endDate?, teacherId?, parentId?` | - | `ApiResponse<Appointment[]>` | Admin, Teacher, Parent |
| `/api/appointments` | POST | - | `{ studentId, date, time, reason }` | `ApiResponse<Appointment>` | Parent |
| `/api/appointments/:id` | GET | - | - | `ApiResponse<Appointment>` | Admin, Teacher, Parent |
| `/api/appointments/:id/status` | PATCH | - | `{ status, rejectionReason?, notes? }` | `ApiResponse<Appointment>` | Teacher |
| `/api/appointments/:id/cancel` | PATCH | - | - | `ApiResponse<Appointment>` | Parent |
| `/api/appointments/teacher` | GET | `status?, date?` | - | `ApiResponse<Appointment[]>` | Teacher |
| `/api/appointments/parent` | GET | `status?` | - | `ApiResponse<Appointment[]>` | Parent |
| `/api/appointments/pending/count` | GET | - | - | `ApiResponse<{ count }>` | Admin, Teacher |
| `/api/appointments/available-slots` | GET | `teacherId, date` | - | `ApiResponse<{ slots: string[] }>` | Parent |

---

## Notices Endpoints

| Endpoint | Method | Query Params | Request Body | Response | Access |
|----------|--------|--------------|--------------|----------|--------|
| `/api/notices` | GET | `priority?, status?, targetAudience?, startDate?, endDate?` | - | `ApiResponse<Notice[]>` | All |
| `/api/notices` | POST | - | `FormData: { title, content, priority, targetAudience, targetClasses?, expiresAt?, attachments? }` | `ApiResponse<Notice>` | Admin, Teacher |
| `/api/notices/:id` | GET | - | - | `ApiResponse<Notice>` | All |
| `/api/notices/:id` | PUT | - | `{ title?, content?, priority?, targetAudience?, targetClasses?, expiresAt?, status? }` | `ApiResponse<Notice>` | Admin, Teacher (own) |
| `/api/notices/:id` | DELETE | - | - | `ApiResponse<void>` | Admin, Teacher (own) |
| `/api/notices/recent` | GET | `limit?` | - | `ApiResponse<Notice[]>` | All |
| `/api/notices/user` | GET | - | - | `ApiResponse<Notice[]>` | All |

---

## Notifications Endpoints

| Endpoint | Method | Query Params | Request Body | Response | Access |
|----------|--------|--------------|--------------|----------|--------|
| `/api/notifications` | GET | `type?, isRead?, limit?, offset?` | - | `ApiResponse<Notification[]>` | Authenticated |
| `/api/notifications/unread/count` | GET | - | - | `ApiResponse<{ count }>` | Authenticated |
| `/api/notifications/:id/read` | PATCH | - | - | `ApiResponse<Notification>` | Authenticated |
| `/api/notifications/read-all` | PATCH | - | - | `ApiResponse<void>` | Authenticated |
| `/api/notifications/:id` | DELETE | - | - | `ApiResponse<void>` | Authenticated |
| `/api/notifications/all` | DELETE | - | - | `ApiResponse<void>` | Authenticated |
| `/api/notifications/recent` | GET | `limit?` | - | `ApiResponse<Notification[]>` | Authenticated |
| `/api/notifications/subscribe` | POST | - | `{ fcmToken }` | `ApiResponse<void>` | Authenticated |
| `/api/notifications/unsubscribe` | POST | - | - | `ApiResponse<void>` | Authenticated |

---

## Reports Endpoints

| Endpoint | Method | Query Params | Request Body | Response | Access |
|----------|--------|--------------|--------------|----------|--------|
| `/api/reports` | GET | `type?, studentId?, classId?, term?` | - | `ApiResponse<Report[]>` | Admin, Teacher, Parent |
| `/api/reports/:id` | GET | - | - | `ApiResponse<Report>` | Admin, Teacher, Parent |
| `/api/reports/student` | POST | - | `{ studentId, type, term }` | `ApiResponse<Report>` | Admin, Teacher, Parent |
| `/api/reports/class` | POST | - | `{ classId, type, term }` | `ApiResponse<Report>` | Admin, Teacher |
| `/api/reports/school` | POST | - | `{ type, term }` | `ApiResponse<Report>` | Admin |
| `/api/reports/:id/download` | GET | - | - | `Blob (PDF)` | Admin, Teacher, Parent |
| `/api/reports/:id` | DELETE | - | - | `ApiResponse<void>` | Admin, Teacher, Parent |
| `/api/reports/:id/status` | GET | - | - | `ApiResponse<{ status }>` | Admin, Teacher, Parent |
| `/api/reports/my` | GET | - | - | `ApiResponse<Report[]>` | Parent |

---

## Settings Endpoints

| Endpoint | Method | Query Params | Request Body | Response | Access |
|----------|--------|--------------|--------------|----------|--------|
| `/api/settings/grading` | GET | - | - | `ApiResponse<GradingScale[]>` | All |
| `/api/settings/grading` | PUT | - | `{ grades: GradingScale[] }` | `ApiResponse<GradingScale[]>` | Admin |
| `/api/settings/academic-years` | GET | - | - | `ApiResponse<AcademicYear[]>` | Admin |
| `/api/settings/academic-years` | POST | - | `{ year, startDate, endDate }` | `ApiResponse<AcademicYear>` | Admin |
| `/api/settings/academic-years/:id` | PUT | - | `Partial<AcademicYear>` | `ApiResponse<AcademicYear>` | Admin |
| `/api/settings/academic-years/:id` | DELETE | - | - | `ApiResponse<void>` | Admin |
| `/api/settings/academic-years/:id/set-current` | PATCH | - | - | `ApiResponse<AcademicYear>` | Admin |
| `/api/settings/academic-years/current` | GET | - | - | `ApiResponse<AcademicYear>` | All |
| `/api/settings/preferences` | GET | - | - | `ApiResponse<UserPreferences>` | Authenticated |
| `/api/settings/preferences` | PUT | - | `Partial<UserPreferences>` | `ApiResponse<UserPreferences>` | Authenticated |

---

## File Upload Endpoints

| Endpoint | Method | Request Body | Response | Access |
|----------|--------|--------------|----------|--------|
| `/api/upload/profile-picture` | POST | `FormData: { file }` | `ApiResponse<UploadedFile>` | Authenticated |
| `/api/upload/exam-paper` | POST | `FormData: { file, studentId, examId }` | `ApiResponse<UploadedFile>` | Teacher |
| `/api/upload/notice-attachment` | POST | `FormData: { file }` | `ApiResponse<UploadedFile>` | Admin, Teacher |
| `/api/upload/:id` | DELETE | - | `ApiResponse<void>` | Owner |
| `/api/upload/:id/signed-url` | GET | - | `ApiResponse<{ url }>` | Authenticated |

---

## Response Format

### Success Response
```typescript
{
  success: true,
  data: T,
  message?: string,
  timestamp: string // ISO 8601
}
```

### Paginated Response
```typescript
{
  success: true,
  data: T[],
  pagination: {
    page: number,
    limit: number,
    total: number,
    totalPages: number,
    hasMore: boolean
  },
  timestamp: string
}
```

### Error Response
```typescript
{
  success: false,
  error: {
    code: string,
    message: string,
    details?: Record<string, string[]>
  },
  timestamp: string
}
```

---

## Error Codes

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

---

## Rate Limiting

| Category | Limit | Window |
|----------|-------|--------|
| Authentication | 5 requests | 15 minutes |
| General API | 100 requests | 1 minute |
| File Upload | 10 requests | 1 minute |
| Report Generation | 5 requests | 5 minutes |

---

## Notes

1. All endpoints use Bearer token authentication (except auth endpoints)
2. Token stored in `Authorization: Bearer <token>` header
3. Frontend expects `/api` base path (not `/api/v1`)
4. All dates should be ISO 8601 strings
5. File uploads use `multipart/form-data`
6. Pagination defaults: `page=1`, `limit=20`
7. All timestamps in responses are ISO 8601 strings


