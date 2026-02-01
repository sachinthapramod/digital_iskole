# Digital Iskole – Prompt for ER Diagram and Relational Schema

Use the following prompt with an AI tool to generate **1) an Entity-Relationship (ER) diagram** and **2) a complete relational schema** for the Digital Iskole school management application.

---

## QUICK START: COPY-PASTE PROMPT

If you want a single block to paste into an AI (e.g. ChatGPT, Claude), use this:

```
Create an ER diagram (Chen or Crow's Foot) and a complete relational schema (tables, columns, PKs, FKs, data types) for a school management system called "Digital Iskole" with these entities and relationships. Use the full specification in the document "ER-DIAGRAM-AND-SCHEMA-PROMPT.md" in the same repo (docs folder). If you don't have access to that file, use the detailed entity/relationship list below.

Main entities: User (uid, email, role, profileId, displayName, ...); Teacher (id, userId→User, employeeId, fullName, assignedClass→Class, subjects[], ...); Parent (id, userId→User, children[]→Student, ...); Class (id, name, classTeacherId→Teacher, ...); Student (id, classId→Class, parentId→Parent, admissionNumber, ...); Subject (id, name, code, ...); Exam (id, name, type, startDate, endDate, createdBy→User, ...); Mark (id, studentId→Student, examId→Exam, subjectId→Subject, classId→Class, marks, totalMarks, grade, enteredBy→User, ...); Attendance (id, studentId→Student, classId→Class, date, status, markedBy→User, ...); Notice (id, title, content, authorId→User, targetAudience[], ...); Appointment (id, parentId→Parent, teacherId→Teacher, studentId→Student, classId→Class, date, status, ...); Notification (id, userId→User, type, title, message, isRead, ...); Report (id, type, studentId→Student?, classId→Class?, generatedBy→User, ...); AcademicYear; GradeScale; UserPreferences (userId→User). Relationships: User 1-1 Teacher, 1-1 Parent, 1-1 UserPreferences; Class N-1 Teacher (class teacher); Student N-1 Class, N-1 Parent; Teacher M-N Subject; Mark N-1 Student, Exam, Subject, Class, User; Attendance N-1 Student, Class, User; Notice/Exam/Report N-1 User; Appointment N-1 Parent, Teacher, Student, Class; Notification N-1 User. Use snake_case, include timestamps (createdAt, updatedAt) where listed. Output: (1) ER diagram description or Mermaid/PlantUML, (2) full relational schema with types and constraints.
```

For best results, paste the **full specification** from the sections below into the AI instead of (or after) the short block.

---

## INSTRUCTIONS FOR THE AI

You are a database designer. Based on the application description and the detailed entity/relationship specification below, produce:

1. **ER diagram**
   - Use **Chen notation** or **Crow’s Foot** (specify which you use).
   - Show all entities, key attributes, and relationships with cardinalities (1:1, 1:N, M:N).
   - Include weak entities and identifying relationships where applicable.
   - Clearly label relationship names and optionality (mandatory/optional).

2. **Relational schema**
   - One logical schema (normalized, 3NF where appropriate).
   - For each table: table name, all columns with data types (e.g. VARCHAR(n), INT, DATE, BOOLEAN, TEXT), primary key (PK), and foreign keys (FK) with referenced table.column.
   - Include unique constraints and NOT NULL where implied by the description.
   - Resolve M:N relationships with junction tables; name them clearly (e.g. `parent_children`).
   - Use consistent naming: snake_case for tables and columns, singular or plural as you prefer but consistent.

Do **not** invent extra entities or attributes beyond what is listed. If something is ambiguous, choose a reasonable interpretation and state it briefly.

---

## APPLICATION CONTEXT

**Digital Iskole** is a school management system used by:

- **Admins** – manage school setup (classes, subjects, teachers, students, parents, exams, notices, settings).
- **Teachers** – manage their assigned class(es), enter attendance and marks, create notices, view reports.
- **Parents** – view their children’s attendance, marks, exam papers; request parent–teacher appointments; read notices.
- **Students** – represented by records only; they do not log in; parents and teachers act on their behalf.

The system stores: user accounts and role-specific profiles (teacher, parent), classes and class teachers, subjects, students (linked to class and parent), exams (schedule and type), marks per student per exam/subject, daily attendance, notices (with target audience), parent–teacher appointments, notifications, generated reports, academic years, grade scale, and user preferences.

---

## ENTITIES AND ATTRIBUTES

### 1. User (system login account)
- **uid** (PK) – string, unique
- **email** – string, unique
- **role** – enum: admin, teacher, parent
- **profileId** – string (references Teacher.id or Parent.id depending on role)
- **displayName** – string
- **photoURL** – string, optional
- **phone** – string, optional
- **dateOfBirth** – date, optional
- **language** – enum: en, si, ta
- **theme** – enum: light, dark
- **isActive** – boolean
- **lastLogin** – timestamp, optional
- **createdAt** – timestamp
- **updatedAt** – timestamp  
(Note: fcmTokens stored as array for push notifications – can be separate table or JSON column.)

### 2. Teacher (profile for role teacher)
- **id** (PK) – string
- **userId** (FK → User.uid) – string, unique
- **employeeId** – string, unique
- **fullName** – string
- **nameWithInitials** – string
- **email** – string
- **phone** – string
- **address** – string
- **dateOfBirth** – date
- **gender** – enum: male, female
- **nic** – string, optional
- **qualifications** – array of strings (or separate table)
- **subjects** – array of subject names (or FK to Subject; many-to-many with Subject)
- **assignedClass** – string, optional (class name; or classId FK → Class.id)
- **isClassTeacher** – boolean
- **status** – enum: active, inactive, on_leave
- **createdAt** – timestamp
- **updatedAt** – timestamp  

Relationship: One User (role=teacher) has one Teacher. One Class can have one class teacher (Class.classTeacherId → Teacher.id).

### 3. Parent (profile for role parent)
- **id** (PK) – string
- **userId** (FK → User.uid) – string, unique
- **fullName** – string
- **email** – string
- **phone** – string
- **address** – string, optional
- **children** – array of student IDs (M:N with Student; use junction table or FK on Student)
- **occupation** – string, optional
- **status** – enum: active, inactive
- **createdAt** – timestamp
- **updatedAt** – timestamp  

Relationship: One User (role=parent) has one Parent. Parent has many Students (biological/guardian); Student has one primary parent (parentId).

### 4. Class
- **id** (PK) – string
- **name** – string, unique (e.g. "Grade 10-A")
- **grade** – string (e.g. "10")
- **section** – string (e.g. "A")
- **classTeacherId** (FK → Teacher.id) – string, optional
- **classTeacherName** – string, optional (denormalized)
- **room** – string, optional
- **studentCount** – integer (denormalized)
- **status** – enum: active, inactive
- **createdAt** – timestamp
- **updatedAt** – timestamp  

Relationship: Class has one class teacher (Teacher). Class has many Students (Student.classId → Class.id).

### 5. Student
- **id** (PK) – string
- **admissionNumber** – string, unique
- **fullName** – string
- **nameWithInitials** – string
- **dateOfBirth** – date
- **gender** – enum: male, female
- **classId** (FK → Class.id) – string
- **className** – string (denormalized)
- **parentId** (FK → Parent.id) – string
- **parentName** – string (denormalized)
- **parentEmail** – string (denormalized)
- **parentPhone** – string (denormalized)
- **address** – string, optional
- **enrollmentDate** – date
- **status** – enum: active, inactive, transferred
- **createdAt** – timestamp
- **updatedAt** – timestamp  

Relationship: Student belongs to one Class. Student has one primary Parent (parentId). Parent can have many Students (also stored in Parent.children array – keep one source of truth; FK on Student is canonical).

### 6. Subject
- **id** (PK) – string
- **name** – string
- **code** – string, unique (e.g. MATH, SCI)
- **description** – text, optional
- **status** – enum: active, inactive
- **createdAt** – timestamp
- **updatedAt** – timestamp  

Relationship: Teachers have many subjects (array of subject names or M:N table Teacher_Subject). No direct FK from Subject to Class; classes “have” subjects implicitly via curriculum.

### 7. Exam (exam schedule / definition)
- **id** (PK) – string
- **name** – string
- **type** – enum: first_term, second_term, third_term, monthly_test, quiz, assignment
- **startDate** – date/timestamp
- **endDate** – date/timestamp
- **grades** – array of grade strings (which grades this exam applies to)
- **description** – text, optional
- **createdBy** (FK → User.uid) – string
- **createdByName** – string, optional
- **createdByRole** – enum: admin, teacher, optional
- **createdAt** – timestamp
- **updatedAt** – timestamp  

Relationship: Exam is created by one User. Marks reference Exam (Mark.examId → Exam.id).

### 8. Mark (single student’s mark for one exam + subject)
- **id** (PK) – string
- **studentId** (FK → Student.id) – string
- **studentName** – string (denormalized)
- **examId** (FK → Exam.id) – string
- **examName** – string (denormalized)
- **subjectId** (FK → Subject.id) – string
- **subjectName** – string (denormalized)
- **classId** (FK → Class.id) – string
- **className** – string (denormalized)
- **marks** – number (obtained)
- **totalMarks** – number
- **grade** – string (e.g. A+, B)
- **percentage** – number
- **rank** – integer, optional (class rank for this subject/exam)
- **remarks** – text, optional
- **examPaperUrl** – string, optional
- **enteredBy** (FK → User.uid) – string
- **enteredByName** – string
- **createdAt** – timestamp
- **updatedAt** – timestamp  

Relationship: Mark belongs to one Student, one Exam, one Subject, one Class. Unique constraint (studentId, examId, subjectId) so one mark per student per exam per subject.

### 9. Attendance (one record per student per day)
- **id** (PK) – string
- **studentId** (FK → Student.id) – string
- **studentName** – string (denormalized)
- **classId** (FK → Class.id) – string
- **className** – string (denormalized)
- **date** – date
- **status** – enum: present, absent, late
- **markedBy** (FK → User.uid) – string
- **markedByName** – string
- **remarks** – text, optional
- **createdAt** – timestamp
- **updatedAt** – timestamp  

Relationship: Attendance belongs to one Student and one Class. Unique (studentId, date) – one attendance record per student per day.

### 10. Notice (announcement)
- **id** (PK) – string
- **title** – string
- **content** – text
- **priority** – enum: high, medium, normal
- **targetAudience** – array: all, teachers, parents, students (store as array or separate table)
- **targetClasses** – array of class names, optional
- **authorId** (FK → User.uid) – string
- **authorName** – string
- **authorRole** – enum: admin, teacher
- **attachments** – JSON array of { name, url, type }, optional
- **publishedAt** – timestamp
- **expiresAt** – timestamp, optional
- **status** – enum: draft, published, archived
- **createdAt** – timestamp
- **updatedAt** – timestamp  

Relationship: Notice is created by one User (authorId).

### 11. Appointment (parent–teacher meeting request)
- **id** (PK) – string
- **parentId** (FK → Parent.id) – string
- **parentName** – string
- **teacherId** (FK → Teacher.id) – string
- **teacherName** – string
- **studentId** (FK → Student.id) – string
- **studentName** – string
- **classId** (FK → Class.id) – string
- **className** – string
- **date** – date
- **time** – string
- **reason** – text
- **status** – enum: pending, approved, rejected, completed, cancelled
- **rejectionReason** – text, optional
- **notes** – text, optional
- **createdAt** – timestamp
- **updatedAt** – timestamp  

Relationship: Appointment involves one Parent, one Teacher, one Student, one Class.

### 12. Notification (in-app / push notification for a user)
- **id** (PK) – string
- **userId** (FK → User.uid) – string
- **type** – enum: appointment, notice, marks, attendance, system, exams
- **title** – string
- **message** – text
- **link** – string, optional
- **data** – JSON, optional
- **isRead** – boolean
- **priority** – enum: high, normal, low
- **createdAt** – timestamp
- **readAt** – timestamp, optional  

Relationship: Notification belongs to one User.

### 13. Report (generated report metadata; PDF stored externally)
- **id** (PK) – string
- **type** – enum: term_report, progress_report, attendance_report, full_academic
- **name** – string
- **studentId** (FK → Student.id) – string, optional
- **studentName** – string, optional
- **classId** (FK → Class.id) – string, optional
- **className** – string, optional
- **term** – string, optional
- **academicYear** – string
- **generatedBy** (FK → User.uid) – string
- **generatedByName** – string
- **pdfUrl** – string, optional
- **status** – enum: generating, completed, failed
- **createdAt** – timestamp  

Relationship: Report is generated by one User; optionally for one Student or one Class.

### 14. AcademicYear
- **id** (PK) – string
- **year** – string (e.g. "2024-2025")
- **startDate** – date
- **endDate** – date
- **isCurrent** – boolean
- **status** – enum: active, completed, upcoming
- **createdAt** – timestamp
- **updatedAt** – timestamp  

### 15. GradeScale (grading scheme)
- **id** (PK) – string
- **grade** – string (e.g. A+, A, B+)
- **minMarks** – number
- **maxMarks** – number
- **description** – string
- **order** – integer (for sorting)
- **createdAt** – timestamp
- **updatedAt** – timestamp  

### 16. UserPreferences (per-user notification and UI preferences)
- **userId** (PK, FK → User.uid) – string
- **pushNotifications** – boolean
- **emailNotifications** – boolean
- **smsNotifications** – boolean
- **noticeNotifications** – boolean
- **appointmentNotifications** – boolean
- **marksNotifications** – boolean
- **attendanceNotifications** – boolean
- **examNotifications** – boolean
- **updatedAt** – timestamp  

Relationship: One User has one UserPreferences.

---

## RELATIONSHIPS SUMMARY (for ER diagram)

- **User** 1 — 1 **Teacher** (via profileId when role=teacher)
- **User** 1 — 1 **Parent** (via profileId when role=parent)
- **User** 1 — 1 **UserPreferences**
- **Class** N — 1 **Teacher** (class teacher: Class.classTeacherId)
- **Student** N — 1 **Class**
- **Student** N — 1 **Parent** (primary parent; Parent has many Students via parentId or children array)
- **Teacher** M — N **Subject** (teachers.subjects array of subject names; can be junction table Teacher_Subject)
- **Mark** N — 1 **Student**, N — 1 **Exam**, N — 1 **Subject**, N — 1 **Class**, N — 1 **User** (enteredBy)
- **Attendance** N — 1 **Student**, N — 1 **Class**, N — 1 **User** (markedBy)
- **Notice** N — 1 **User** (authorId)
- **Appointment** N — 1 **Parent**, N — 1 **Teacher**, N — 1 **Student**, N — 1 **Class**
- **Notification** N — 1 **User**
- **Report** N — 1 **User**; Report N — 1 **Student** (optional), N — 1 **Class** (optional)
- **Exam** N — 1 **User** (createdBy)

Optional: **Parent — Student** M:N if multiple guardians per student (junction table parent_children: parentId, studentId). Current design: Student.parentId (one primary parent); Parent.children array. For schema, either keep parentId on Student only or add parent_children junction and keep parentId as “primary” guardian.

---

## ADDITIONAL NOTES FOR THE AI

- **Timestamps**: Use TIMESTAMP or DATETIME for createdAt, updatedAt, date, publishedAt, etc.
- **Enums**: Represent as VARCHAR with CHECK or as separate lookup tables; state your choice.
- **Arrays** (e.g. targetAudience, grades, subjects, children): Either JSON/array type if the target DB supports it, or normalized tables (e.g. notice_target_audience, exam_grades, teacher_subjects, parent_children).
- **IDs**: All PKs are string (UUID or Firestore-style IDs); use VARCHAR(36) or CHAR(36) in relational schema.
- **Denormalized fields** (e.g. studentName, className in Mark): Keep in schema as stated for reporting/display; mention they are denormalized.
- **Firestore**: The live app uses Firestore (NoSQL); the relational schema is for documentation and possible future SQL migration or analytics DB.

---

## OUTPUT FORMAT REQUESTED

1. **ER diagram**: Image description (or Mermaid/PlantUML code) with entities, attributes (key attributes on diagram, full list optional), and relationships with cardinalities.
2. **Relational schema**: List of tables with columns, data types, PK, FK, and unique/not-null constraints. Example:

   **users**  
   - uid VARCHAR(36) PK  
   - email VARCHAR(255) UNIQUE NOT NULL  
   - role VARCHAR(20) NOT NULL  
   - profile_id VARCHAR(36)  
   - ...  
   - FK profile_id → teachers(id) or parents(id) (depending on role)

Repeat for every table. Then list all foreign key constraints in one place if helpful.

---

End of prompt.
