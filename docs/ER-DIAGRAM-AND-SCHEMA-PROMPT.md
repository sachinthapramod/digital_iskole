# Digital Iskole – Prompt for ER Diagram and Relational Schema

Use the following prompt with an AI tool to generate **1) an Entity-Relationship (ER) diagram** and **2) a complete relational schema** for the Digital Iskole school management application.

---

# PART A: ER DIAGRAM PROMPT (CHEN NOTATION)

**Use this section first** when asking an AI to generate **only the ER diagram**. The notation is **Chen notation**: rectangles for entities, ovals for attributes, diamonds for relationships, and lines with cardinality labels (1, N, M).

**How to use:** Copy the entire block inside the code fence below and paste it into your AI tool (e.g. ChatGPT, Claude). The AI will output an ER diagram description, Mermaid/PlantUML code, or ASCII diagram in Chen style. You can then draw the diagram in a tool (e.g. draw.io, Lucidchart) or render the code.

---

## Copy-paste prompt for ER diagram (Chen notation)

```
You are a database designer. Create a complete Entity-Relationship diagram for a school management system called "Digital Iskole" using CHEN NOTATION.

CHEN NOTATION RULES:
- Entities: rectangles. Label each entity in singular (e.g. User, Teacher, Class).
- Attributes: ovals connected to their entity. Underline the primary key attribute(s).
- Relationships: diamonds. Label each relationship with a verb phrase (e.g. "has", "belongs to", "created by").
- Cardinality: on each edge between an entity and a relationship, write 1, N, or M (e.g. User ---1--- HAS_PROFILE ---N--- Teacher means one User has at most one Teacher profile; one Teacher belongs to one User).
- Use double rectangles for weak entities (if any) and double diamonds for identifying relationships.
- Use double ovals for multi-valued attributes (e.g. targetAudience, subjects, children) or note them in a separate table; in Chen you can show multi-valued as a separate oval linked to the entity.

APPLICATION CONTEXT:
Digital Iskole is used by Admins (manage school setup), Teachers (manage classes, attendance, marks, notices), and Parents (view children's data, request appointments). Students do not log in; they are represented by records. The system stores user accounts, role-specific profiles (Teacher, Parent), classes with class teachers, subjects, students (linked to class and parent), exam schedules, marks per student per exam per subject, daily attendance, notices with target audience, parent-teacher appointments, notifications, generated reports, academic years, grade scale, and user preferences.

ENTITIES AND KEY ATTRIBUTES (include these on the diagram; full attribute list is below):

1. User
   PK: uid. Other: email, role (admin|teacher|parent), profileId, displayName, photoURL, phone, dateOfBirth, language (en|si|ta), theme (light|dark), isActive, lastLogin, createdAt, updatedAt.
   Multi-valued: fcmTokens (optional; can be separate or omitted).

2. Teacher
   PK: id. FK: userId → User. Other: employeeId, fullName, nameWithInitials, email, phone, address, dateOfBirth, gender (male|female), nic, qualifications (array), subjects (array of subject names), assignedClass (class name or FK to Class), isClassTeacher, status (active|inactive|on_leave), createdAt, updatedAt.

3. Parent
   PK: id. FK: userId → User. Other: fullName, email, phone, address, children (array of student IDs), occupation, status (active|inactive), createdAt, updatedAt.

4. Class
   PK: id. Other: name, grade, section, classTeacherId (FK → Teacher), classTeacherName (denorm), room, studentCount (denorm), status (active|inactive), createdAt, updatedAt.

5. Student
   PK: id. FK: classId → Class, parentId → Parent. Other: admissionNumber, fullName, nameWithInitials, dateOfBirth, gender (male|female), className, parentName, parentEmail, parentPhone (denorm), address, enrollmentDate, status (active|inactive|transferred), createdAt, updatedAt.

6. Subject
   PK: id. Other: name, code, description, status (active|inactive), createdAt, updatedAt.

7. Exam
   PK: id. FK: createdBy → User. Other: name, type (first_term|second_term|third_term|monthly_test|quiz|assignment), startDate, endDate, grades (array of grade strings), description, createdByName, createdByRole, createdAt, updatedAt.

8. Mark
   PK: id. FK: studentId → Student, examId → Exam, subjectId → Subject, classId → Class, enteredBy → User. Other: studentName, examName, subjectName, className (denorm), marks, totalMarks, grade, percentage, rank, remarks, examPaperUrl, enteredByName, createdAt, updatedAt. Business rule: unique (studentId, examId, subjectId).

9. Attendance
   PK: id. FK: studentId → Student, classId → Class, markedBy → User. Other: studentName, className (denorm), date, status (present|absent|late), markedByName, remarks, createdAt, updatedAt. Business rule: unique (studentId, date).

10. Notice
    PK: id. FK: authorId → User. Other: title, content, priority (high|medium|normal), targetAudience (array: all|teachers|parents|students), targetClasses (array), authorName, authorRole (admin|teacher), attachments (JSON), publishedAt, expiresAt, status (draft|published|archived), createdAt, updatedAt.

11. Appointment
    PK: id. FK: parentId → Parent, teacherId → Teacher, studentId → Student, classId → Class. Other: parentName, teacherName, studentName, className, date, time, reason, status (pending|approved|rejected|completed|cancelled), rejectionReason, notes, createdAt, updatedAt.

12. Notification
    PK: id. FK: userId → User. Other: type (appointment|notice|marks|attendance|system|exams), title, message, link, data (JSON), isRead, priority (high|normal|low), createdAt, readAt.

13. Report
    PK: id. FK: generatedBy → User; optional studentId → Student, classId → Class. Other: type (term_report|progress_report|attendance_report|full_academic), name, studentName, className, term, academicYear, generatedByName, pdfUrl, status (generating|completed|failed), createdAt.

14. AcademicYear
    PK: id. Other: year, startDate, endDate, isCurrent, status (active|completed|upcoming), createdAt, updatedAt.

15. GradeScale
    PK: id. Other: grade, minMarks, maxMarks, description, order, createdAt, updatedAt.

16. UserPreferences
    PK: userId (FK → User). Other: pushNotifications, emailNotifications, smsNotifications, noticeNotifications, appointmentNotifications, marksNotifications, attendanceNotifications, examNotifications, updatedAt.

RELATIONSHIPS AND CARDINALITIES (show on diagram with diamonds and labels):

- User 1 — 1 Teacher (relationship: "has teacher profile"; when role=teacher, profileId references Teacher.id)
- User 1 — 1 Parent (relationship: "has parent profile"; when role=parent, profileId references Parent.id)
- User 1 — 1 UserPreferences ("has preferences")
- Class N — 1 Teacher ("has class teacher"; Class.classTeacherId → Teacher.id; one teacher can be class teacher of one class)
- Student N — 1 Class ("enrolled in")
- Student N — 1 Parent ("has primary guardian"; Student.parentId; Parent has many Students via children array or FK on Student)
- Teacher M — N Subject ("teaches"; teachers.subjects array of names; optionally junction entity Teacher_Subject)
- Mark N — 1 Student ("for student")
- Mark N — 1 Exam ("for exam")
- Mark N — 1 Subject ("for subject")
- Mark N — 1 Class ("for class")
- Mark N — 1 User ("entered by"; enteredBy)
- Attendance N — 1 Student ("for student")
- Attendance N — 1 Class ("for class")
- Attendance N — 1 User ("marked by")
- Notice N — 1 User ("authored by"; authorId)
- Appointment N — 1 Parent ("requested by")
- Appointment N — 1 Teacher ("with teacher")
- Appointment N — 1 Student ("regarding student")
- Appointment N — 1 Class ("for class")
- Notification N — 1 User ("for user")
- Report N — 1 User ("generated by")
- Report N — 1 Student (optional; "for student")
- Report N — 1 Class (optional; "for class")
- Exam N — 1 User ("created by"; createdBy)

OUTPUT REQUESTED:
1. A description of the ER diagram suitable for drawing it (e.g. list each entity, its key attributes, then each relationship with participating entities and cardinalities), OR
2. Mermaid/PlantUML code that renders a Chen-style ER diagram (rectangles, ovals, diamonds, cardinalities), OR
3. A diagram in text-art (ASCII) using Chen notation.

Do not add entities or attributes not listed above. Use exact names (e.g. uid, profileId, classTeacherId). Denormalized attributes (e.g. className, studentName) are kept for display/reporting; show them in the entity.
```

---

## QUICK START: COPY-PASTE PROMPT

If you want a single block to paste into an AI (e.g. ChatGPT, Claude), use this:

```
Create an ER diagram (Chen or Crow's Foot) and a complete relational schema (tables, columns, PKs, FKs, data types) for a school management system called "Digital Iskole" with these entities and relationships. Use the full specification in the document "ER-DIAGRAM-AND-SCHEMA-PROMPT.md" in the same repo (docs folder). If you don't have access to that file, use the detailed entity/relationship list below.

Main entities: User (uid, email, role, profileId, displayName, ...); Teacher (id, userId→User, employeeId, fullName, assignedClass→Class, subjects[], ...); Parent (id, userId→User, children[]→Student, ...); Class (id, name, classTeacherId→Teacher, ...); Student (id, classId→Class, parentId→Parent, admissionNumber, ...); Subject (id, name, code, ...); Exam (id, name, type, startDate, endDate, createdBy→User, ...); Mark (id, studentId→Student, examId→Exam, subjectId→Subject, classId→Class, marks, totalMarks, grade, enteredBy→User, ...); Attendance (id, studentId→Student, classId→Class, date, status, markedBy→User, ...); Notice (id, title, content, authorId→User, targetAudience[], ...); Appointment (id, parentId→Parent, teacherId→Teacher, studentId→Student, classId→Class, date, status, ...); Notification (id, userId→User, type, title, message, isRead, ...); Report (id, type, studentId→Student?, classId→Class?, generatedBy→User, ...); AcademicYear; GradeScale; UserPreferences (userId→User). Relationships: User 1-1 Teacher, 1-1 Parent, 1-1 UserPreferences; Class N-1 Teacher (class teacher); Student N-1 Class, N-1 Parent; Teacher M-N Subject; Mark N-1 Student, Exam, Subject, Class, User; Attendance N-1 Student, Class, User; Notice/Exam/Report N-1 User; Appointment N-1 Parent, Teacher, Student, Class; Notification N-1 User. Use snake_case, include timestamps (createdAt, updatedAt) where listed. Output: (1) ER diagram description or Mermaid/PlantUML, (2) full relational schema with types and constraints.
```

For best results, paste the **full specification** from the sections below into the AI instead of (or after) the short block.

---


End of prompt.
