"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useLanguage } from "@/lib/i18n/context"
import { useAuth } from "@/lib/auth/context"
import { apiRequest } from "@/lib/api/client"
import { useRouter } from "next/navigation"
import {
  Search,
  GraduationCap,
  Phone,
  Mail,
  User,
  ClipboardCheck,
  FileText,
  TrendingUp,
  TrendingDown,
  Minus,
  Loader2,
  AlertCircle,
} from "lucide-react"

interface Student {
  id: string
  name: string
  rollNo: string
  class: string
  parent?: string
  parentPhone?: string
  parentEmail?: string
  attendance: number
  avgMarks: number
  status: string
  trend: "up" | "down" | "stable"
}

export default function TeacherStudentsPage() {
  const { t } = useLanguage()
  const { user } = useAuth()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [students, setStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  useEffect(() => {
    if (user?.assignedClass) {
      fetchStudents()
    } else {
      setIsLoading(false)
      setError("No class assigned. Please contact administrator.")
    }
  }, [user?.assignedClass])

  const fetchStudents = async () => {
    if (!user?.assignedClass) return

    try {
      setIsLoading(true)
      setError(null)

      // Fetch students from the class
      const studentsResponse = await apiRequest(`/attendance/students?className=${encodeURIComponent(user.assignedClass)}`)
      const studentsData = await studentsResponse.json()

      if (!studentsResponse.ok) {
        throw new Error(studentsData.message || studentsData.error?.message || 'Failed to fetch students')
      }

      const studentsList = studentsData.data?.students || []

      // OPTIMIZED: Batch fetch all stats and details in parallel
      // Instead of 2 sequential calls per student (60 calls for 30 students), we batch them
      const statsPromises = studentsList.map((student: any) => 
        apiRequest(`/attendance/student/${student.id}/stats`)
          .then(res => res.json().then(data => ({ ok: res.ok, data })))
          .catch(() => ({ ok: false, data: null }))
      )
      const detailsPromises = studentsList.map((student: any) => 
        apiRequest(`/users/students/${student.id}`)
          .then(res => res.json().then(data => ({ ok: res.ok, data })))
          .catch(() => ({ ok: false, data: null }))
      )

      // Fetch all in parallel
      const [statsResults, detailsResults] = await Promise.all([
        Promise.all(statsPromises),
        Promise.all(detailsPromises),
      ])

      // Process results
      const studentsWithStats = studentsList.map((student: any, index: number) => {
        const statsResult = statsResults[index]
        const detailsResult = detailsResults[index]

        const stats = statsResult.ok ? statsResult.data?.data?.stats : null
        const studentDetails = detailsResult.ok ? detailsResult.data?.data?.student : null

        // Calculate trend based on attendance
        let trend: "up" | "down" | "stable" = "stable"
        if (stats) {
          if (stats.attendanceRate >= 90) trend = "up"
          else if (stats.attendanceRate < 75) trend = "down"
        }

        return {
          id: student.id,
          name: student.name,
          rollNo: student.rollNo || student.admissionNumber || "N/A",
          class: user.assignedClass,
          parent: studentDetails?.parent || studentDetails?.parentName || "N/A",
          parentPhone: studentDetails?.parentPhone || "N/A",
          parentEmail: studentDetails?.parentEmail || "N/A",
          attendance: stats?.attendanceRate || 0,
          avgMarks: 0, // TODO: Fetch from marks API when available
          status: studentDetails?.status || "active",
          trend,
        }
      })

      setStudents(studentsWithStats)
    } catch (err: any) {
      console.error('Fetch students error:', err)
      if (err.message.includes('Token refresh failed') || err.message.includes('login')) {
        setError("Session expired. Please login again.")
      } else {
        setError(err.message || 'Failed to load students')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const filteredStudents = students.filter((student) => {
    return (
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.rollNo.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-success" />
      case "down":
        return <TrendingDown className="h-4 w-4 text-destructive" />
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getAttendanceBadge = (attendance: number) => {
    if (attendance >= 90) {
      return <Badge className="bg-success text-success-foreground">{attendance}%</Badge>
    } else if (attendance >= 75) {
      return <Badge variant="secondary">{attendance}%</Badge>
    } else {
      return <Badge variant="destructive">{attendance}%</Badge>
    }
  }

  const openStudentDetails = (student: Student) => {
    setSelectedStudent(student)
    setDetailsOpen(true)
  }

  // Calculate class statistics
  const classStats = {
    totalStudents: students.length,
    avgAttendance: students.length > 0
      ? Math.round(students.reduce((acc, s) => acc + s.attendance, 0) / students.length)
      : 0,
    avgMarks: students.length > 0
      ? Math.round(students.reduce((acc, s) => acc + s.avgMarks, 0) / students.length)
      : 0,
    atRisk: students.filter((s) => s.attendance < 75 || s.avgMarks < 60).length,
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t("students")}</h1>
        <p className="text-muted-foreground">
          View and manage students in your class ({user?.assignedClass || "No class assigned"})
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Class Statistics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold text-foreground">{classStats.totalStudents}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Attendance</p>
                <p className="text-2xl font-bold text-foreground">{classStats.avgAttendance}%</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                <ClipboardCheck className="h-5 w-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Marks</p>
                <p className="text-2xl font-bold text-foreground">{classStats.avgMarks}%</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-accent-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">At Risk</p>
                <p className="text-2xl font-bold text-destructive">{classStats.atRisk}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <TrendingDown className="h-5 w-5 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or roll number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Students List */}
      <Card>
        <CardHeader>
          <CardTitle>Class Students</CardTitle>
          <CardDescription>
            {isLoading ? "Loading..." : `${filteredStudents.length} students in ${user?.assignedClass || ""}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {searchQuery ? "No students found matching your search." : "No students found in this class."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Roll No</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Student Name</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Parent/Guardian</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">{t("attendance")}</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Avg Marks</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Trend</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">{t("actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="border-b border-border last:border-0">
                      <td className="py-3 px-2 text-sm text-muted-foreground">{student.rollNo}</td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-medium text-primary">{student.name.charAt(0)}</span>
                          </div>
                          <span className="text-sm font-medium text-foreground">{student.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-sm text-muted-foreground">{student.parent}</td>
                      <td className="py-3 px-2">{getAttendanceBadge(student.attendance)}</td>
                      <td className="py-3 px-2">
                        <span
                          className={`text-sm font-medium ${
                            student.avgMarks >= 75
                              ? "text-success"
                              : student.avgMarks >= 50
                                ? "text-foreground"
                                : "text-destructive"
                          }`}
                        >
                          {student.avgMarks > 0 ? `${student.avgMarks}%` : "N/A"}
                        </span>
                      </td>
                      <td className="py-3 px-2">{getTrendIcon(student.trend)}</td>
                      <td className="py-3 px-2">
                        <Button size="sm" variant="outline" onClick={() => openStudentDetails(student)}>
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Student Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Student Details</DialogTitle>
            <DialogDescription>View complete information about the student</DialogDescription>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-6 py-4">
              {/* Student Info */}
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">{selectedStudent.name.charAt(0)}</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{selectedStudent.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedStudent.rollNo} | {selectedStudent.class}
                  </p>
                </div>
              </div>

              {/* Performance Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">{t("attendance")}</p>
                  <p className="text-2xl font-bold text-foreground">{selectedStudent.attendance}%</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Average Marks</p>
                  <p className="text-2xl font-bold text-foreground">{selectedStudent.avgMarks}%</p>
                </div>
              </div>

              {/* Parent Contact */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-foreground">Parent/Guardian Contact</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">{selectedStudent.parent}</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">{selectedStudent.parentPhone}</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">{selectedStudent.parentEmail}</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 bg-transparent"
                  onClick={() => {
                    setDetailsOpen(false)
                    router.push(`/dashboard/attendance?student=${selectedStudent?.id}`)
                  }}
                >
                  <ClipboardCheck className="h-4 w-4 mr-2" />
                  View Attendance
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 bg-transparent"
                  onClick={() => {
                    setDetailsOpen(false)
                    router.push(`/dashboard/marks?student=${selectedStudent?.id}`)
                  }}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  View Marks
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
