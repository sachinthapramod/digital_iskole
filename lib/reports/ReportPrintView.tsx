"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

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

/** Renders report content for client-side PDF capture. Same structure as view dialog. */
export function ReportPrintView({ report }: { report: ReportForPrint }) {
  const d = report?.data
  if (!d) return <div className="p-4">No report data</div>

  return (
    <div className="bg-white text-gray-900 p-6 max-w-[210mm] mx-auto space-y-6">
      <h1 className="text-xl font-bold border-b pb-2">{report?.title || "Report"}</h1>

      {report?.type === "student" && d.student && (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Student Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <span className="text-sm text-muted-foreground">Name:</span>
                  <p className="font-medium">{d.student.name}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Class:</span>
                  <p className="font-medium">{d.student.className}</p>
                </div>
                {d.student.admissionNumber && (
                  <div>
                    <span className="text-sm text-muted-foreground">Admission No:</span>
                    <p className="font-medium">{d.student.admissionNumber}</p>
                  </div>
                )}
                {d.term && (
                  <div>
                    <span className="text-sm text-muted-foreground">Term:</span>
                    <p className="font-medium">{d.term}</p>
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Overall Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Average</p>
                    <p className="text-2xl font-bold">{d.marks?.averagePercent ?? 0}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Grade</p>
                    <p className="text-2xl font-bold">{d.marks?.overallGrade ?? "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Attendance</p>
                    <p className="text-2xl font-bold">{d.attendance?.attendanceRate ?? 0}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Class Rank</p>
                    <p className="text-2xl font-bold">
                      {d.marks?.classRank != null && d.marks?.classSize != null
                        ? `${d.marks.classRank} / ${d.marks.classSize}`
                        : "—"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Attendance Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Days</p>
                  <p className="text-xl font-semibold">{d.attendance?.totalDays ?? 0}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Present</p>
                  <p className="text-xl font-semibold text-green-600">{d.attendance?.presentDays ?? 0}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Absent</p>
                  <p className="text-xl font-semibold text-red-600">{d.attendance?.absentDays ?? 0}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Late</p>
                  <p className="text-xl font-semibold text-yellow-600">{d.attendance?.lateDays ?? 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          {d.marks?.subjects && d.marks.subjects.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Subject Marks</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead>Exam</TableHead>
                      <TableHead className="text-right">Marks</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-right">Percentage</TableHead>
                      <TableHead className="text-center">Grade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {d.marks.subjects.map((subject: any, idx: number) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{subject.subjectName}</TableCell>
                        <TableCell>{subject.examName ?? "-"}</TableCell>
                        <TableCell className="text-right">{subject.marks ?? 0}</TableCell>
                        <TableCell className="text-right">{subject.totalMarks ?? 0}</TableCell>
                        <TableCell className="text-right">{subject.percentage ?? 0}%</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary">{subject.grade ?? "-"}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {report?.type === "class" && d.class && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Class Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <span className="text-sm text-muted-foreground">Class:</span>
                <p className="font-medium text-lg">{d.class.name}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Class Teacher:</span>
                <p className="font-medium">{d.class.teacher}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Students:</span>
                <p className="font-medium">{d.class.studentCount}</p>
              </div>
              {d.term && (
                <div>
                  <span className="text-sm text-muted-foreground">Term:</span>
                  <p className="font-medium">{d.term}</p>
                </div>
              )}
            </CardContent>
          </Card>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Class Average</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{d.summary?.classAverageMarks ?? 0}%</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Class Attendance</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{d.summary?.classAttendanceRate ?? 0}%</p>
              </CardContent>
            </Card>
          </div>
          {d.topStudents && d.topStudents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Students</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rank</TableHead>
                      <TableHead>Roll No</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead className="text-right">Average %</TableHead>
                      <TableHead className="text-right">Attendance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {d.topStudents.map((student: any, idx: number) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">#{student.rank ?? idx + 1}</TableCell>
                        <TableCell>{student.rollNo ?? "-"}</TableCell>
                        <TableCell className="font-medium">{student.studentName}</TableCell>
                        <TableCell className="text-right">{student.marks?.averagePercent ?? 0}%</TableCell>
                        <TableCell className="text-right">{student.attendance?.attendanceRate ?? 0}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {report?.type === "school" && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">School Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Students</p>
                  <p className="text-2xl font-bold">{d.summary?.totalStudents ?? 0}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Classes</p>
                  <p className="text-2xl font-bold">{d.summary?.totalClasses ?? 0}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Teachers</p>
                  <p className="text-2xl font-bold">{d.summary?.totalTeachers ?? 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          {d.classes && d.classes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Class-wise Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Class</TableHead>
                      <TableHead>Teacher</TableHead>
                      <TableHead className="text-right">Students</TableHead>
                      <TableHead className="text-right">Avg Marks</TableHead>
                      <TableHead className="text-right">Attendance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {d.classes.map((cls: any, idx: number) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{cls.className}</TableCell>
                        <TableCell>{cls.teacher}</TableCell>
                        <TableCell className="text-right">{cls.students ?? 0}</TableCell>
                        <TableCell className="text-right">{cls.averageMarks ?? 0}%</TableCell>
                        <TableCell className="text-right">{cls.attendanceRate ?? 0}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
          {d.topStudents && d.topStudents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Top Students (School-wide)</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rank</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead className="text-right">Average %</TableHead>
                      <TableHead className="text-center">Grade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {d.topStudents.map((student: any, idx: number) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">#{student.rank ?? idx + 1}</TableCell>
                        <TableCell className="font-medium">{student.name}</TableCell>
                        <TableCell>{student.className}</TableCell>
                        <TableCell className="text-right">{student.averagePercent ?? 0}%</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary">{student.grade ?? "-"}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
