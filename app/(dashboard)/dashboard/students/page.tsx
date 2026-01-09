"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useLanguage } from "@/lib/i18n/context"
import { useAuth } from "@/lib/auth/context"
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
} from "lucide-react"

// Mock data - students in teacher's assigned class
const mockClassStudents = [
  {
    id: "1",
    name: "Kasun Perera",
    rollNo: "10A001",
    class: "Grade 10-A",
    parent: "Mr. Nimal Perera",
    parentPhone: "+94 77 123 4567",
    parentEmail: "nimal.perera@email.com",
    attendance: 92,
    avgMarks: 78,
    status: "active",
    trend: "up",
  },
  {
    id: "2",
    name: "Nimali Silva",
    rollNo: "10A002",
    class: "Grade 10-A",
    parent: "Mrs. Kamala Silva",
    parentPhone: "+94 77 234 5678",
    parentEmail: "kamala.silva@email.com",
    attendance: 88,
    avgMarks: 85,
    status: "active",
    trend: "up",
  },
  {
    id: "3",
    name: "Amal Fernando",
    rollNo: "10A003",
    class: "Grade 10-A",
    parent: "Mr. Sunil Fernando",
    parentPhone: "+94 77 345 6789",
    parentEmail: "sunil.fernando@email.com",
    attendance: 75,
    avgMarks: 62,
    status: "active",
    trend: "down",
  },
  {
    id: "4",
    name: "Sithara Jayawardena",
    rollNo: "10A004",
    class: "Grade 10-A",
    parent: "Mrs. Malini Jayawardena",
    parentPhone: "+94 77 456 7890",
    parentEmail: "malini.j@email.com",
    attendance: 95,
    avgMarks: 91,
    status: "active",
    trend: "stable",
  },
  {
    id: "5",
    name: "Dinesh Kumar",
    rollNo: "10A005",
    class: "Grade 10-A",
    parent: "Mr. Ravi Kumar",
    parentPhone: "+94 77 567 8901",
    parentEmail: "ravi.kumar@email.com",
    attendance: 68,
    avgMarks: 55,
    status: "active",
    trend: "down",
  },
  {
    id: "6",
    name: "Priya Mendis",
    rollNo: "10A006",
    class: "Grade 10-A",
    parent: "Mrs. Sita Mendis",
    parentPhone: "+94 77 678 9012",
    parentEmail: "sita.mendis@email.com",
    attendance: 90,
    avgMarks: 72,
    status: "active",
    trend: "up",
  },
]

export default function TeacherStudentsPage() {
  const { t } = useLanguage()
  const { user } = useAuth()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStudent, setSelectedStudent] = useState<(typeof mockClassStudents)[0] | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  const filteredStudents = mockClassStudents.filter((student) => {
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

  const openStudentDetails = (student: (typeof mockClassStudents)[0]) => {
    setSelectedStudent(student)
    setDetailsOpen(true)
  }

  // Calculate class statistics
  const classStats = {
    totalStudents: mockClassStudents.length,
    avgAttendance: Math.round(mockClassStudents.reduce((acc, s) => acc + s.attendance, 0) / mockClassStudents.length),
    avgMarks: Math.round(mockClassStudents.reduce((acc, s) => acc + s.avgMarks, 0) / mockClassStudents.length),
    atRisk: mockClassStudents.filter((s) => s.attendance < 75 || s.avgMarks < 60).length,
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t("students")}</h1>
        <p className="text-muted-foreground">View and manage students in your class (Grade 10-A)</p>
      </div>

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
          <CardDescription>{filteredStudents.length} students in Grade 10-A</CardDescription>
        </CardHeader>
        <CardContent>
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
                        {student.avgMarks}%
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
