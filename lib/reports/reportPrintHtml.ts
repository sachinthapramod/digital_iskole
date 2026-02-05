/**
 * Build report as pure HTML string with only hex/rgb inline styles.
 * Used for PDF in an iframe so html2canvas never sees lab()/oklch() from the host page.
 */

import type { ReportForPrint } from "./ReportPrintView"

function esc(s: unknown): string {
  if (s == null) return ""
  const t = String(s)
  return t
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

const s = {
  root: "background-color:#ffffff;color:#111827;padding:24px;max-width:210mm;margin:0 auto;",
  title: "font-size:20px;font-weight:700;border-bottom:1px solid #e5e7eb;padding-bottom:8px;margin-bottom:24px;",
  card: "border:1px solid #e5e7eb;border-radius:8px;margin-bottom:16px;overflow:hidden;",
  cardHeader: "padding:12px 16px;background-color:#f9fafb;border-bottom:1px solid #e5e7eb;",
  cardTitle: "font-size:18px;font-weight:600;color:#111827;margin:0;",
  cardContent: "padding:16px;",
  label: "font-size:12px;color:#6b7280;display:block;margin-bottom:2px;",
  value: "font-weight:500;color:#111827;margin:0;",
  grid2: "display:grid;grid-template-columns:1fr 1fr;gap:16px;",
  grid4: "display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:16px;",
  grid3: "display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;",
  bigValue: "font-size:28px;font-weight:700;color:#111827;margin:0;",
  green: "color:#16a34a;",
  red: "color:#dc2626;",
  yellow: "color:#ca8a04;",
  table: "width:100%;border-collapse:collapse;font-size:14px;",
  th: "text-align:left;padding:8px 12px;background-color:#f9fafb;border-bottom:2px solid #e5e7eb;color:#374151;font-weight:600;",
  thRight: "text-align:right;padding:8px 12px;background-color:#f9fafb;border-bottom:2px solid #e5e7eb;color:#374151;font-weight:600;",
  thCenter: "text-align:center;padding:8px 12px;background-color:#f9fafb;border-bottom:2px solid #e5e7eb;color:#374151;font-weight:600;",
  td: "padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#111827;",
  tdRight: "padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#111827;text-align:right;",
  tdCenter: "padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#111827;text-align:center;",
  badge: "display:inline-block;padding:2px 8px;border-radius:4px;background-color:#f3f4f6;color:#374151;font-size:12px;",
}

export function buildReportPrintHtml(report: ReportForPrint): string {
  const d = report?.data
  if (!d) return "<div style=\"padding:16px;\">No report data</div>"

  const title = esc(report?.title || "Report")

  let html = `<div style="${s.root}"><h1 style="${s.title}">${title}</h1>`

  if (report?.type === "student" && d.student) {
    const st = d.student
    const rankStr =
      d.marks?.classRank != null && d.marks?.classSize != null
        ? `${d.marks.classRank} / ${d.marks.classSize}`
        : "—"
    html += `
    <div style="${s.grid2}">
      <div style="${s.card}">
        <div style="${s.cardHeader}"><h2 style="${s.cardTitle}">Student Information</h2></div>
        <div style="${s.cardContent}">
          <div style="margin-bottom:8px;"><span style="${s.label}">Name:</span><p style="${s.value}">${esc(st.name)}</p></div>
          <div style="margin-bottom:8px;"><span style="${s.label}">Class:</span><p style="${s.value}">${esc(st.className)}</p></div>
          ${st.admissionNumber ? `<div style="margin-bottom:8px;"><span style="${s.label}">Admission No:</span><p style="${s.value}">${esc(st.admissionNumber)}</p></div>` : ""}
          ${d.term ? `<div style="margin-bottom:8px;"><span style="${s.label}">Term:</span><p style="${s.value}">${esc(d.term)}</p></div>` : ""}
        </div>
      </div>
      <div style="${s.card}">
        <div style="${s.cardHeader}"><h2 style="${s.cardTitle}">Overall Performance</h2></div>
        <div style="${s.cardContent}">
          <div style="${s.grid2}">
            <div><p style="${s.label}">Average</p><p style="${s.bigValue}">${d.marks?.averagePercent ?? 0}%</p></div>
            <div><p style="${s.label}">Grade</p><p style="${s.bigValue}">${d.marks?.overallGrade ?? "-"}</p></div>
            <div><p style="${s.label}">Attendance</p><p style="${s.bigValue}">${d.attendance?.attendanceRate ?? 0}%</p></div>
            <div><p style="${s.label}">Class Rank</p><p style="${s.bigValue}">${rankStr}</p></div>
          </div>
        </div>
      </div>
    </div>
    <div style="${s.card}">
      <div style="${s.cardHeader}"><h2 style="${s.cardTitle}">Attendance Summary</h2></div>
      <div style="${s.cardContent}">
        <div style="${s.grid4}">
          <div><p style="${s.label}">Total Days</p><p style="${s.value};font-size:20px;font-weight:600;">${d.attendance?.totalDays ?? 0}</p></div>
          <div><p style="${s.label}">Present</p><p style="${s.value};font-size:20px;font-weight:600;${s.green}">${d.attendance?.presentDays ?? 0}</p></div>
          <div><p style="${s.label}">Absent</p><p style="${s.value};font-size:20px;font-weight:600;${s.red}">${d.attendance?.absentDays ?? 0}</p></div>
          <div><p style="${s.label}">Late</p><p style="${s.value};font-size:20px;font-weight:600;${s.yellow}">${d.attendance?.lateDays ?? 0}</p></div>
        </div>
      </div>
    </div>`
    if (d.marks?.subjects?.length) {
      html += `<div style="${s.card}"><div style="${s.cardHeader}"><h2 style="${s.cardTitle}">Subject Marks</h2></div><div style="${s.cardContent}">
      <table style="${s.table}"><thead><tr>
        <th style="${s.th}">Subject</th><th style="${s.th}">Exam</th>
        <th style="${s.thRight}">Marks</th><th style="${s.thRight}">Total</th><th style="${s.thRight}">Percentage</th><th style="${s.thCenter}">Grade</th>
      </tr></thead><tbody>`
      for (const sub of d.marks.subjects) {
        html += `<tr>
          <td style="${s.td};font-weight:500;">${esc(sub.subjectName)}</td><td style="${s.td}">${esc(sub.examName ?? "-")}</td>
          <td style="${s.tdRight}">${sub.marks ?? 0}</td><td style="${s.tdRight}">${sub.totalMarks ?? 0}</td><td style="${s.tdRight}">${sub.percentage ?? 0}%</td>
          <td style="${s.tdCenter}"><span style="${s.badge}">${esc(sub.grade ?? "-")}</span></td>
        </tr>`
      }
      html += "</tbody></table></div></div>"
    }
  }

  if (report?.type === "class" && d.class) {
    html += `
    <div style="${s.card}">
      <div style="${s.cardHeader}"><h2 style="${s.cardTitle}">Class Information</h2></div>
      <div style="${s.cardContent}">
        <div style="margin-bottom:8px;"><span style="${s.label}">Class:</span><p style="${s.value};font-size:18px;">${esc(d.class.name)}</p></div>
        <div style="margin-bottom:8px;"><span style="${s.label}">Class Teacher:</span><p style="${s.value}">${esc(d.class.teacher)}</p></div>
        <div style="margin-bottom:8px;"><span style="${s.label}">Students:</span><p style="${s.value}">${d.class.studentCount}</p></div>
        ${d.term ? `<div style="margin-bottom:8px;"><span style="${s.label}">Term:</span><p style="${s.value}">${esc(d.term)}</p></div>` : ""}
      </div>
    </div>
    <div style="${s.grid2}">
      <div style="${s.card}"><div style="${s.cardHeader}"><h2 style="${s.cardTitle}">Class Average</h2></div><div style="${s.cardContent}"><p style="${s.bigValue}">${d.summary?.classAverageMarks ?? 0}%</p></div></div>
      <div style="${s.card}"><div style="${s.cardHeader}"><h2 style="${s.cardTitle}">Class Attendance</h2></div><div style="${s.cardContent}"><p style="${s.bigValue}">${d.summary?.classAttendanceRate ?? 0}%</p></div></div>
    </div>`
    if (d.topStudents?.length) {
      html += `<div style="${s.card}"><div style="${s.cardHeader}"><h2 style="${s.cardTitle}">Students</h2></div><div style="${s.cardContent}">
      <table style="${s.table}"><thead><tr>
        <th style="${s.th}">Rank</th><th style="${s.th}">Roll No</th><th style="${s.th}">Name</th><th style="${s.thRight}">Average %</th><th style="${s.thRight}">Attendance</th>
      </tr></thead><tbody>`
      d.topStudents.forEach((student: any, idx: number) => {
        html += `<tr>
          <td style="${s.td};font-weight:500;">#${student.rank ?? idx + 1}</td><td style="${s.td}">${esc(student.rollNo ?? "-")}</td><td style="${s.td};font-weight:500;">${esc(student.studentName)}</td>
          <td style="${s.tdRight}">${student.marks?.averagePercent ?? 0}%</td><td style="${s.tdRight}">${student.attendance?.attendanceRate ?? 0}%</td>
        </tr>`
      })
      html += "</tbody></table></div></div>"
    }
  }

  if (report?.type === "school") {
    html += `
    <div style="${s.card}">
      <div style="${s.cardHeader}"><h2 style="${s.cardTitle}">School Summary</h2></div>
      <div style="${s.cardContent}">
        <div style="${s.grid3}">
          <div><p style="${s.label}">Total Students</p><p style="${s.bigValue}">${d.summary?.totalStudents ?? 0}</p></div>
          <div><p style="${s.label}">Total Classes</p><p style="${s.bigValue}">${d.summary?.totalClasses ?? 0}</p></div>
          <div><p style="${s.label}">Total Teachers</p><p style="${s.bigValue}">${d.summary?.totalTeachers ?? 0}</p></div>
        </div>
      </div>
    </div>`
    if (d.classes?.length) {
      html += `<div style="${s.card}"><div style="${s.cardHeader}"><h2 style="${s.cardTitle}">Class-wise Performance</h2></div><div style="${s.cardContent}">
      <table style="${s.table}"><thead><tr>
        <th style="${s.th}">Class</th><th style="${s.th}">Teacher</th><th style="${s.thRight}">Students</th><th style="${s.thRight}">Avg Marks</th><th style="${s.thRight}">Attendance</th>
      </tr></thead><tbody>`
      d.classes.forEach((cls: any) => {
        html += `<tr>
          <td style="${s.td};font-weight:500;">${esc(cls.className)}</td><td style="${s.td}">${esc(cls.teacher)}</td>
          <td style="${s.tdRight}">${cls.students ?? 0}</td><td style="${s.tdRight}">${cls.averageMarks ?? 0}%</td><td style="${s.tdRight}">${cls.attendanceRate ?? 0}%</td>
        </tr>`
      })
      html += "</tbody></table></div></div>"
    }
    if (d.topStudents?.length) {
      html += `<div style="${s.card}"><div style="${s.cardHeader}"><h2 style="${s.cardTitle}">Top Students (School-wide)</h2></div><div style="${s.cardContent}">
      <table style="${s.table}"><thead><tr>
        <th style="${s.th}">Rank</th><th style="${s.th}">Name</th><th style="${s.th}">Class</th><th style="${s.thRight}">Average %</th><th style="${s.thCenter}">Grade</th>
      </tr></thead><tbody>`
      d.topStudents.forEach((student: any, idx: number) => {
        html += `<tr>
          <td style="${s.td};font-weight:500;">#${student.rank ?? idx + 1}</td><td style="${s.td};font-weight:500;">${esc(student.name)}</td><td style="${s.td}">${esc(student.className)}</td>
          <td style="${s.tdRight}">${student.averagePercent ?? 0}%</td><td style="${s.tdCenter}"><span style="${s.badge}">${esc(student.grade ?? "-")}</span></td>
        </tr>`
      })
      html += "</tbody></table></div></div>"
    }
  }

  html += "</div>"
  return html
}
