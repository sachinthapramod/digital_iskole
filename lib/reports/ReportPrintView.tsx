"use client"

/** Inline styles using only hex/rgb so html2canvas never sees lab() or other unsupported color functions. */
const styles = {
  root: {
    backgroundColor: "#ffffff",
    color: "#111827",
    padding: 24,
    maxWidth: "210mm",
    margin: "0 auto",
  } as React.CSSProperties,
  title: { fontSize: 20, fontWeight: 700, borderBottom: "1px solid #e5e7eb", paddingBottom: 8, marginBottom: 24 },
  card: { border: "1px solid #e5e7eb", borderRadius: 8, marginBottom: 16, overflow: "hidden" },
  cardHeader: { padding: "12px 16px", backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb" },
  cardTitle: { fontSize: 18, fontWeight: 600, color: "#111827", margin: 0 },
  cardContent: { padding: 16 },
  label: { fontSize: 12, color: "#6b7280", display: "block", marginBottom: 2 },
  value: { fontWeight: 500, color: "#111827", margin: 0 },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  grid4: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 16 },
  grid3: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 },
  bigValue: { fontSize: 28, fontWeight: 700, color: "#111827", margin: 0 },
  green: { color: "#16a34a" },
  red: { color: "#dc2626" },
  yellow: { color: "#ca8a04" },
  table: { width: "100%", borderCollapse: "collapse" as const, fontSize: 14 },
  th: {
    textAlign: "left" as const,
    padding: "8px 12px",
    backgroundColor: "#f9fafb",
    borderBottom: "2px solid #e5e7eb",
    color: "#374151",
    fontWeight: 600,
  },
  td: { padding: "8px 12px", borderBottom: "1px solid #e5e7eb", color: "#111827" },
  textRight: { textAlign: "right" as const },
  textCenter: { textAlign: "center" as const },
  badge: { display: "inline-block", padding: "2px 8px", borderRadius: 4, backgroundColor: "#f3f4f6", color: "#374151", fontSize: 12 },
}

/** Report object as returned by GET /reports/:id (report field). */
export interface ReportForPrint {
  id?: string
  type?: "student" | "class" | "school"
  title?: string
  data?: {
    student?: { name?: string; className?: string; admissionNumber?: string }
    class?: { name?: string; teacher?: string; studentCount?: number }
    term?: string
    marks?: {
      averagePercent?: number
      overallGrade?: string
      subjects?: Array<{
        subjectName?: string
        examName?: string
        marks?: number
        totalMarks?: number
        percentage?: number
        grade?: string
      }>
      classRank?: number
      classSize?: number
    }
    attendance?: {
      attendanceRate?: number
      totalDays?: number
      presentDays?: number
      absentDays?: number
      lateDays?: number
    }
    summary?: {
      classAverageMarks?: number
      classAttendanceRate?: number
      totalStudents?: number
      totalClasses?: number
      totalTeachers?: number
    }
    topStudents?: Array<{
      rank?: number
      rollNo?: string
      studentName?: string
      name?: string
      className?: string
      marks?: { averagePercent?: number }
      attendance?: { attendanceRate?: number }
      averagePercent?: number
      grade?: string
    }>
    classes?: Array<{
      className?: string
      teacher?: string
      students?: number
      averageMarks?: number
      attendanceRate?: number
    }>
  }
}

/** Renders report content with inline hex/rgb only so html2canvas does not hit lab() color errors. */
export function ReportPrintView({ report }: { report: ReportForPrint }) {
  const d = report?.data
  if (!d) return <div style={{ padding: 16 }}>No report data</div>

  return (
    <div style={styles.root}>
      <h1 style={styles.title}>{report?.title || "Report"}</h1>

      {report?.type === "student" && d.student && (
        <>
          <div style={styles.grid2}>
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h2 style={styles.cardTitle}>Student Information</h2>
              </div>
              <div style={styles.cardContent}>
                <div style={{ marginBottom: 8 }}>
                  <span style={styles.label}>Name:</span>
                  <p style={styles.value}>{d.student.name}</p>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <span style={styles.label}>Class:</span>
                  <p style={styles.value}>{d.student.className}</p>
                </div>
                {d.student.admissionNumber && (
                  <div style={{ marginBottom: 8 }}>
                    <span style={styles.label}>Admission No:</span>
                    <p style={styles.value}>{d.student.admissionNumber}</p>
                  </div>
                )}
                {d.term && (
                  <div style={{ marginBottom: 8 }}>
                    <span style={styles.label}>Term:</span>
                    <p style={styles.value}>{d.term}</p>
                  </div>
                )}
              </div>
            </div>
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h2 style={styles.cardTitle}>Overall Performance</h2>
              </div>
              <div style={styles.cardContent}>
                <div style={styles.grid2}>
                  <div>
                    <p style={styles.label}>Average</p>
                    <p style={styles.bigValue}>{d.marks?.averagePercent ?? 0}%</p>
                  </div>
                  <div>
                    <p style={styles.label}>Grade</p>
                    <p style={styles.bigValue}>{d.marks?.overallGrade ?? "-"}</p>
                  </div>
                  <div>
                    <p style={styles.label}>Attendance</p>
                    <p style={styles.bigValue}>{d.attendance?.attendanceRate ?? 0}%</p>
                  </div>
                  <div>
                    <p style={styles.label}>Class Rank</p>
                    <p style={styles.bigValue}>
                      {d.marks?.classRank != null && d.marks?.classSize != null
                        ? `${d.marks.classRank} / ${d.marks.classSize}`
                        : "—"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>Attendance Summary</h2>
            </div>
            <div style={styles.cardContent}>
              <div style={styles.grid4}>
                <div>
                  <p style={styles.label}>Total Days</p>
                  <p style={{ ...styles.value, fontSize: 20, fontWeight: 600 }}>{d.attendance?.totalDays ?? 0}</p>
                </div>
                <div>
                  <p style={styles.label}>Present</p>
                  <p style={{ ...styles.value, fontSize: 20, fontWeight: 600, ...styles.green }}>{d.attendance?.presentDays ?? 0}</p>
                </div>
                <div>
                  <p style={styles.label}>Absent</p>
                  <p style={{ ...styles.value, fontSize: 20, fontWeight: 600, ...styles.red }}>{d.attendance?.absentDays ?? 0}</p>
                </div>
                <div>
                  <p style={styles.label}>Late</p>
                  <p style={{ ...styles.value, fontSize: 20, fontWeight: 600, ...styles.yellow }}>{d.attendance?.lateDays ?? 0}</p>
                </div>
              </div>
            </div>
          </div>
          {d.marks?.subjects && d.marks.subjects.length > 0 && (
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h2 style={styles.cardTitle}>Subject Marks</h2>
              </div>
              <div style={styles.cardContent}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Subject</th>
                      <th style={styles.th}>Exam</th>
                      <th style={{ ...styles.th, ...styles.textRight }}>Marks</th>
                      <th style={{ ...styles.th, ...styles.textRight }}>Total</th>
                      <th style={{ ...styles.th, ...styles.textRight }}>Percentage</th>
                      <th style={{ ...styles.th, ...styles.textCenter }}>Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {d.marks.subjects.map((subject: any, idx: number) => (
                      <tr key={idx}>
                        <td style={{ ...styles.td, fontWeight: 500 }}>{subject.subjectName}</td>
                        <td style={styles.td}>{subject.examName ?? "-"}</td>
                        <td style={{ ...styles.td, ...styles.textRight }}>{subject.marks ?? 0}</td>
                        <td style={{ ...styles.td, ...styles.textRight }}>{subject.totalMarks ?? 0}</td>
                        <td style={{ ...styles.td, ...styles.textRight }}>{subject.percentage ?? 0}%</td>
                        <td style={{ ...styles.td, ...styles.textCenter }}>
                          <span style={styles.badge}>{subject.grade ?? "-"}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {report?.type === "class" && d.class && (
        <>
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>Class Information</h2>
            </div>
            <div style={styles.cardContent}>
              <div style={{ marginBottom: 8 }}>
                <span style={styles.label}>Class:</span>
                <p style={{ ...styles.value, fontSize: 18 }}>{d.class.name}</p>
              </div>
              <div style={{ marginBottom: 8 }}>
                <span style={styles.label}>Class Teacher:</span>
                <p style={styles.value}>{d.class.teacher}</p>
              </div>
              <div style={{ marginBottom: 8 }}>
                <span style={styles.label}>Students:</span>
                <p style={styles.value}>{d.class.studentCount}</p>
              </div>
              {d.term && (
                <div style={{ marginBottom: 8 }}>
                  <span style={styles.label}>Term:</span>
                  <p style={styles.value}>{d.term}</p>
                </div>
              )}
            </div>
          </div>
          <div style={styles.grid2}>
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h2 style={styles.cardTitle}>Class Average</h2>
              </div>
              <div style={styles.cardContent}>
                <p style={styles.bigValue}>{d.summary?.classAverageMarks ?? 0}%</p>
              </div>
            </div>
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h2 style={styles.cardTitle}>Class Attendance</h2>
              </div>
              <div style={styles.cardContent}>
                <p style={styles.bigValue}>{d.summary?.classAttendanceRate ?? 0}%</p>
              </div>
            </div>
          </div>
          {d.topStudents && d.topStudents.length > 0 && (
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h2 style={styles.cardTitle}>Students</h2>
              </div>
              <div style={styles.cardContent}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Rank</th>
                      <th style={styles.th}>Roll No</th>
                      <th style={styles.th}>Name</th>
                      <th style={{ ...styles.th, ...styles.textRight }}>Average %</th>
                      <th style={{ ...styles.th, ...styles.textRight }}>Attendance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {d.topStudents.map((student: any, idx: number) => (
                      <tr key={idx}>
                        <td style={{ ...styles.td, fontWeight: 500 }}>#{student.rank ?? idx + 1}</td>
                        <td style={styles.td}>{student.rollNo ?? "-"}</td>
                        <td style={{ ...styles.td, fontWeight: 500 }}>{student.studentName}</td>
                        <td style={{ ...styles.td, ...styles.textRight }}>{student.marks?.averagePercent ?? 0}%</td>
                        <td style={{ ...styles.td, ...styles.textRight }}>{student.attendance?.attendanceRate ?? 0}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {report?.type === "school" && (
        <>
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>School Summary</h2>
            </div>
            <div style={styles.cardContent}>
              <div style={styles.grid3}>
                <div>
                  <p style={styles.label}>Total Students</p>
                  <p style={styles.bigValue}>{d.summary?.totalStudents ?? 0}</p>
                </div>
                <div>
                  <p style={styles.label}>Total Classes</p>
                  <p style={styles.bigValue}>{d.summary?.totalClasses ?? 0}</p>
                </div>
                <div>
                  <p style={styles.label}>Total Teachers</p>
                  <p style={styles.bigValue}>{d.summary?.totalTeachers ?? 0}</p>
                </div>
              </div>
            </div>
          </div>
          {d.classes && d.classes.length > 0 && (
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h2 style={styles.cardTitle}>Class-wise Performance</h2>
              </div>
              <div style={styles.cardContent}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Class</th>
                      <th style={styles.th}>Teacher</th>
                      <th style={{ ...styles.th, ...styles.textRight }}>Students</th>
                      <th style={{ ...styles.th, ...styles.textRight }}>Avg Marks</th>
                      <th style={{ ...styles.th, ...styles.textRight }}>Attendance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {d.classes.map((cls: any, idx: number) => (
                      <tr key={idx}>
                        <td style={{ ...styles.td, fontWeight: 500 }}>{cls.className}</td>
                        <td style={styles.td}>{cls.teacher}</td>
                        <td style={{ ...styles.td, ...styles.textRight }}>{cls.students ?? 0}</td>
                        <td style={{ ...styles.td, ...styles.textRight }}>{cls.averageMarks ?? 0}%</td>
                        <td style={{ ...styles.td, ...styles.textRight }}>{cls.attendanceRate ?? 0}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {d.topStudents && d.topStudents.length > 0 && (
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h2 style={styles.cardTitle}>Top Students (School-wide)</h2>
              </div>
              <div style={styles.cardContent}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Rank</th>
                      <th style={styles.th}>Name</th>
                      <th style={styles.th}>Class</th>
                      <th style={{ ...styles.th, ...styles.textRight }}>Average %</th>
                      <th style={{ ...styles.th, ...styles.textCenter }}>Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {d.topStudents.map((student: any, idx: number) => (
                      <tr key={idx}>
                        <td style={{ ...styles.td, fontWeight: 500 }}>#{student.rank ?? idx + 1}</td>
                        <td style={{ ...styles.td, fontWeight: 500 }}>{student.name}</td>
                        <td style={styles.td}>{student.className}</td>
                        <td style={{ ...styles.td, ...styles.textRight }}>{student.averagePercent ?? 0}%</td>
                        <td style={{ ...styles.td, ...styles.textCenter }}>
                          <span style={styles.badge}>{student.grade ?? "-"}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
