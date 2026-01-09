"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useLanguage } from "@/lib/i18n/context"
import { useAuth } from "@/lib/auth/context"
import {
  GraduationCap,
  Calendar,
  FileText,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  BookOpen,
  Phone,
  Mail,
  User,
  Eye,
  Download,
} from "lucide-react"
import Link from "next/link"

// Mock data for parent's children with detailed information including exam papers
const childrenData = [
  {
    id: "student-1",
    name: "Kasun Silva",
    admissionNo: "STU-2024-001",
    grade: "Grade 10",
    class: "10-A",
    dateOfBirth: "2009-05-15",
    gender: "Male",
    classTeacher: "Mrs. Perera",
    classTeacherPhone: "+94 77 123 4567",
    classTeacherEmail: "perera@school.lk",
    attendanceRate: 94,
    averageMarks: 78,
    rank: 5,
    totalStudents: 35,
    recentGrade: "A",
    trend: "up",
    subjects: [
      { name: "Mathematics", marks: 82, grade: "A", trend: "up", examPaper: "/placeholder.svg?height=800&width=600" },
      { name: "Science", marks: 78, grade: "B+", trend: "stable", examPaper: "/placeholder.svg?height=800&width=600" },
      { name: "English", marks: 75, grade: "B+", trend: "up", examPaper: null },
      { name: "Sinhala", marks: 88, grade: "A", trend: "up", examPaper: "/placeholder.svg?height=800&width=600" },
      { name: "History", marks: 72, grade: "B", trend: "down", examPaper: null },
      { name: "ICT", marks: 90, grade: "A+", trend: "up", examPaper: "/placeholder.svg?height=800&width=600" },
    ],
    recentAttendance: [
      { date: "2024-12-09", status: "present" },
      { date: "2024-12-10", status: "present" },
      { date: "2024-12-11", status: "late" },
      { date: "2024-12-12", status: "present" },
      { date: "2024-12-13", status: "present" },
    ],
    upcomingExams: [
      { subject: "Mathematics", date: "2024-12-18", type: "Term Test" },
      { subject: "Science", date: "2024-12-20", type: "Term Test" },
    ],
  },
  {
    id: "student-2",
    name: "Nimali Silva",
    admissionNo: "STU-2024-002",
    grade: "Grade 8",
    class: "8-B",
    dateOfBirth: "2011-08-22",
    gender: "Female",
    classTeacher: "Mr. Kumar",
    classTeacherPhone: "+94 77 234 5678",
    classTeacherEmail: "kumar@school.lk",
    attendanceRate: 98,
    averageMarks: 85,
    rank: 3,
    totalStudents: 38,
    recentGrade: "A+",
    trend: "up",
    subjects: [
      { name: "Mathematics", marks: 88, grade: "A", trend: "up", examPaper: "/placeholder.svg?height=800&width=600" },
      { name: "Science", marks: 85, grade: "A", trend: "up", examPaper: "/placeholder.svg?height=800&width=600" },
      { name: "English", marks: 82, grade: "A", trend: "stable", examPaper: "/placeholder.svg?height=800&width=600" },
      { name: "Sinhala", marks: 92, grade: "A+", trend: "up", examPaper: null },
      { name: "History", marks: 80, grade: "A", trend: "up", examPaper: "/placeholder.svg?height=800&width=600" },
      { name: "ICT", marks: 88, grade: "A", trend: "stable", examPaper: null },
    ],
    recentAttendance: [
      { date: "2024-12-09", status: "present" },
      { date: "2024-12-10", status: "present" },
      { date: "2024-12-11", status: "present" },
      { date: "2024-12-12", status: "present" },
      { date: "2024-12-13", status: "present" },
    ],
    upcomingExams: [
      { subject: "English", date: "2024-12-17", type: "Term Test" },
      { subject: "Sinhala", date: "2024-12-19", type: "Term Test" },
    ],
  },
]

// Component to view exam paper
function ExamPaperViewer({
  paperUrl,
  studentName,
  subject,
}: { paperUrl: string; studentName: string; subject: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1 h-7 px-2">
          <Eye className="h-3.5 w-3.5" />
          <span className="text-xs">View</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Exam Paper - {studentName}</DialogTitle>
          <DialogDescription>{subject} - Scanned exam paper softcopy</DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <div className="border rounded-lg overflow-hidden bg-muted/30">
            <img
              src={paperUrl || "/placeholder.svg"}
              alt={`${subject} exam paper for ${studentName}`}
              className="w-full h-auto"
            />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" asChild>
              <a
                href={paperUrl}
                download={`${subject.toLowerCase()}-exam-${studentName.toLowerCase().replace(/\s+/g, "-")}.pdf`}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function MyChildrenPage() {
  const { t } = useLanguage()
  const { user } = useAuth()
  const [selectedChild, setSelectedChild] = useState(childrenData[0])

  if (user?.role !== "parent") {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">This page is only accessible to parents.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-success" />
      case "down":
        return <TrendingDown className="h-4 w-4 text-destructive" />
      default:
        return <div className="h-4 w-4 rounded-full bg-muted" />
    }
  }

  const getAttendanceIcon = (status: string) => {
    switch (status) {
      case "present":
        return <CheckCircle2 className="h-5 w-5 text-success" />
      case "absent":
        return <XCircle className="h-5 w-5 text-destructive" />
      case "late":
        return <AlertCircle className="h-5 w-5 text-warning" />
      default:
        return null
    }
  }

  const getGradeColor = (grade: string) => {
    if (grade.startsWith("A")) return "text-success"
    if (grade.startsWith("B")) return "text-primary"
    if (grade.startsWith("C")) return "text-warning"
    return "text-destructive"
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("myChildren")}</h1>
          <p className="text-muted-foreground">View and monitor your children&apos;s academic progress</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/appointments">
            <Calendar className="h-4 w-4 mr-2" />
            {t("requestAppointment")}
          </Link>
        </Button>
      </div>

      {/* Child Selector Tabs */}
      <Tabs
        value={selectedChild.id}
        onValueChange={(value) => {
          const child = childrenData.find((c) => c.id === value)
          if (child) setSelectedChild(child)
        }}
      >
        <TabsList className="w-full justify-start gap-2 bg-transparent p-0 h-auto flex-wrap">
          {childrenData.map((child) => (
            <TabsTrigger
              key={child.id}
              value={child.id}
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-2 rounded-lg border border-border data-[state=active]:border-primary"
            >
              <GraduationCap className="h-4 w-4 mr-2" />
              {child.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {childrenData.map((child) => (
          <TabsContent key={child.id} value={child.id} className="mt-6 space-y-6">
            {/* Child Profile Card */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Avatar and Basic Info */}
                  <div className="flex items-start gap-4">
                    <div className="h-20 w-20 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold flex-shrink-0">
                      {child.name.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">{child.name}</h2>
                      <p className="text-muted-foreground">{child.admissionNo}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary">{child.class}</Badge>
                        <Badge variant="outline">
                          Rank: {child.rank}/{child.totalStudents}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Class Teacher Info */}
                  <div className="flex-1 md:border-l md:pl-6 border-border">
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">Class Teacher</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{child.classTeacher}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{child.classTeacherPhone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{child.classTeacherEmail}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{t("attendance")}</p>
                      <p className="text-2xl font-bold">{child.attendanceRate}%</p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
                      <CheckCircle2 className="h-6 w-6 text-success" />
                    </div>
                  </div>
                  <Progress value={child.attendanceRate} className="h-2 mt-4" />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Average Marks</p>
                      <p className="text-2xl font-bold">{child.averageMarks}%</p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <Progress value={child.averageMarks} className="h-2 mt-4" />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Class Rank</p>
                      <p className="text-2xl font-bold">
                        {child.rank}
                        <span className="text-sm font-normal text-muted-foreground">/{child.totalStudents}</span>
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-accent/50 flex items-center justify-center">
                      <GraduationCap className="h-6 w-6 text-accent-foreground" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-4">
                    {getTrendIcon(child.trend)}
                    <span className="text-sm text-muted-foreground">
                      {child.trend === "up" ? "Improving" : child.trend === "down" ? "Needs attention" : "Stable"}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Recent Grade</p>
                      <p className={`text-2xl font-bold ${getGradeColor(child.recentGrade)}`}>{child.recentGrade}</p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-success" />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">Last examination result</p>
                </CardContent>
              </Card>
            </div>

            {/* Subject Performance and Attendance */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Subject Performance with Exam Paper View */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Subject Performance</CardTitle>
                  <CardDescription>Current term marks by subject with exam papers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {child.subjects.map((subject, index) => (
                      <div key={index} className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <BookOpen className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{subject.name}</p>
                            <Progress value={subject.marks} className="h-1.5 mt-1" />
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{subject.marks}%</span>
                          <Badge variant="outline" className={getGradeColor(subject.grade)}>
                            {subject.grade}
                          </Badge>
                          {getTrendIcon(subject.trend)}
                          {subject.examPaper ? (
                            <ExamPaperViewer
                              paperUrl={subject.examPaper}
                              studentName={child.name}
                              subject={subject.name}
                            />
                          ) : (
                            <span className="text-xs text-muted-foreground w-12 text-center">-</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-4 bg-transparent" asChild>
                    <Link href="/dashboard/marks">View All Marks</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Attendance */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Attendance</CardTitle>
                  <CardDescription>Last 5 school days</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {child.recentAttendance.map((record, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between py-2 border-b border-border last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {new Date(record.date).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {getAttendanceIcon(record.status)}
                          <span className="text-sm capitalize">{record.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-4 bg-transparent" asChild>
                    <Link href="/dashboard/attendance">View Full History</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Upcoming Exams */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Upcoming Examinations</CardTitle>
                <CardDescription>Scheduled tests and exams</CardDescription>
              </CardHeader>
              <CardContent>
                {child.upcomingExams.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {child.upcomingExams.map((exam, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 p-4 rounded-lg border border-border bg-muted/30"
                      >
                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <FileText className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{exam.subject}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            {new Date(exam.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </div>
                          <Badge variant="secondary" className="mt-1">
                            {exam.type}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No upcoming examinations</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
