"use client"

import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import { apiRequest } from "@/lib/api/client"

const REPORT_GET_ENDPOINT = "/reports"

/** Report shape from GET /reports/:id (report field). */
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

function str(v: unknown): string {
  return v != null ? String(v) : ""
}

/**
 * Generate report PDF in the browser using jsPDF (no HTML/CSS, no lab() issues).
 * Builds the document programmatically and triggers download.
 */
function generatePdfWithJsPdf(report: ReportForPrint): void {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
  const margin = 14
  let y = margin
  const pageW = doc.internal.pageSize.getWidth()
  const lineH = 7

  const title = report?.title || "Report"
  doc.setFontSize(18)
  doc.setFont("helvetica", "bold")
  doc.text(title, margin, y)
  y += lineH + 4

  const d = report?.data
  if (!d) {
    doc.setFontSize(11)
    doc.setFont("helvetica", "normal")
    doc.text("No report data", margin, y)
    doc.save(`report-${report?.id ?? "download"}.pdf`)
    return
  }

  doc.setFontSize(11)
  doc.setFont("helvetica", "normal")

  if (report?.type === "student" && d.student) {
    doc.setFont("helvetica", "bold")
    doc.text("Student Information", margin, y)
    y += lineH
    doc.setFont("helvetica", "normal")
    doc.text(`Name: ${str(d.student.name)}`, margin, y)
    y += lineH
    doc.text(`Class: ${str(d.student.className)}`, margin, y)
    y += lineH
    if (d.student.admissionNumber) {
      doc.text(`Admission No: ${d.student.admissionNumber}`, margin, y)
      y += lineH
    }
    if (d.term) {
      doc.text(`Term: ${d.term}`, margin, y)
      y += lineH
    }
    y += 4

    doc.setFont("helvetica", "bold")
    doc.text("Overall Performance", margin, y)
    y += lineH
    doc.setFont("helvetica", "normal")
    doc.text(`Average: ${d.marks?.averagePercent ?? 0}%`, margin, y)
    y += lineH
    doc.text(`Grade: ${d.marks?.overallGrade ?? "-"}`, margin, y)
    y += lineH
    doc.text(`Attendance: ${d.attendance?.attendanceRate ?? 0}%`, margin, y)
    y += lineH
    const rankStr =
      d.marks?.classRank != null && d.marks?.classSize != null
        ? `Class Rank: ${d.marks.classRank} / ${d.marks.classSize}`
        : "Class Rank: —"
    doc.text(rankStr, margin, y)
    y += lineH + 4

    doc.setFont("helvetica", "bold")
    doc.text("Attendance Summary", margin, y)
    y += lineH
    doc.setFont("helvetica", "normal")
    doc.text(`Total Days: ${d.attendance?.totalDays ?? 0}  |  Present: ${d.attendance?.presentDays ?? 0}  |  Absent: ${d.attendance?.absentDays ?? 0}  |  Late: ${d.attendance?.lateDays ?? 0}`, margin, y)
    y += lineH + 6

    if (d.marks?.subjects?.length) {
      autoTable(doc, {
        startY: y,
        head: [["Subject", "Exam", "Marks", "Total", "%", "Grade"]],
        body: (d.marks.subjects || []).map((s) => [
          str(s.subjectName),
          str(s.examName ?? "-"),
          str(s.marks ?? 0),
          str(s.totalMarks ?? 0),
          `${s.percentage ?? 0}%`,
          str(s.grade ?? "-"),
        ]),
        margin: { left: margin, right: margin },
        theme: "grid",
        styles: { fontSize: 9 },
      })
      y = (doc as any).lastAutoTable.finalY + 8
    }
  }

  if (report?.type === "class" && d.class) {
    doc.setFont("helvetica", "bold")
    doc.text("Class Information", margin, y)
    y += lineH
    doc.setFont("helvetica", "normal")
    doc.text(`Class: ${str(d.class.name)}`, margin, y)
    y += lineH
    doc.text(`Teacher: ${str(d.class.teacher)}`, margin, y)
    y += lineH
    doc.text(`Students: ${d.class.studentCount ?? 0}`, margin, y)
    y += lineH
    if (d.term) {
      doc.text(`Term: ${d.term}`, margin, y)
      y += lineH
    }
    y += 4
    doc.setFont("helvetica", "bold")
    doc.text(`Class Average: ${d.summary?.classAverageMarks ?? 0}%  |  Class Attendance: ${d.summary?.classAttendanceRate ?? 0}%`, margin, y)
    y += lineH + 6

    if (d.topStudents?.length) {
      autoTable(doc, {
        startY: y,
        head: [["Rank", "Roll No", "Name", "Avg %", "Attendance"]],
        body: (d.topStudents || []).map((st, i) => [
          `#${st.rank ?? i + 1}`,
          str(st.rollNo ?? "-"),
          str(st.studentName),
          `${st.marks?.averagePercent ?? 0}%`,
          `${st.attendance?.attendanceRate ?? 0}%`,
        ]),
        margin: { left: margin, right: margin },
        theme: "grid",
        styles: { fontSize: 9 },
      })
      y = (doc as any).lastAutoTable.finalY + 8
    }
  }

  if (report?.type === "school") {
    doc.setFont("helvetica", "bold")
    doc.text("School Summary", margin, y)
    y += lineH
    doc.setFont("helvetica", "normal")
    doc.text(`Total Students: ${d.summary?.totalStudents ?? 0}  |  Classes: ${d.summary?.totalClasses ?? 0}  |  Teachers: ${d.summary?.totalTeachers ?? 0}`, margin, y)
    y += lineH + 6

    if (d.classes?.length) {
      autoTable(doc, {
        startY: y,
        head: [["Class", "Teacher", "Students", "Avg Marks", "Attendance"]],
        body: (d.classes || []).map((c) => [
          str(c.className),
          str(c.teacher),
          str(c.students ?? 0),
          `${c.averageMarks ?? 0}%`,
          `${c.attendanceRate ?? 0}%`,
        ]),
        margin: { left: margin, right: margin },
        theme: "grid",
        styles: { fontSize: 9 },
      })
      y = (doc as any).lastAutoTable.finalY + 6
    }

    if (d.topStudents?.length) {
      autoTable(doc, {
        startY: y,
        head: [["Rank", "Name", "Class", "Avg %", "Grade"]],
        body: (d.topStudents || []).map((st, i) => [
          `#${st.rank ?? i + 1}`,
          str(st.name),
          str(st.className),
          `${st.averagePercent ?? 0}%`,
          str(st.grade ?? "-"),
        ]),
        margin: { left: margin, right: margin },
        theme: "grid",
        styles: { fontSize: 9 },
      })
    }
  }

  doc.save(`report-${report?.id ?? "download"}.pdf`)
}

export interface DownloadReportPdfOptions {
  existingReport?: ReportForPrint | null
  onError?: (message: string) => void
}

/**
 * Client-side report PDF: fetch report (if needed) and generate PDF in browser with jsPDF.
 * No server PDF, no HTML/CSS capture, no lab() or oklch() issues.
 */
export async function downloadReportPdf(
  reportId: string,
  options: DownloadReportPdfOptions = {}
): Promise<void> {
  const { existingReport, onError } = options
  const setErr = (msg: string) => onError?.(msg)

  let report: ReportForPrint | null = existingReport ?? null
  if (!report) {
    try {
      const res = await apiRequest(`${REPORT_GET_ENDPOINT}/${reportId}`)
      const data = await res.json().catch(() => ({}))
      if (!res.ok || data?.success === false) {
        setErr(data?.error?.message || data?.message || "Could not load report")
        return
      }
      report = data?.data?.report ?? data?.report ?? data
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Could not load report")
      return
    }
  }

  if (!report?.data) {
    setErr("Report has no data to generate PDF")
    return
  }

  try {
    generatePdfWithJsPdf(report as ReportForPrint)
  } catch (e: unknown) {
    setErr(e instanceof Error ? e.message : "Failed to generate PDF")
  }
}
