"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
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
import { apiRequest } from "@/lib/api/client"
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

type AttendanceStatus = "present" | "absent" | "late"

interface ParentChildApi {
  id: string
  name: string
  className: string
  classTeacher?: { id?: string; name?: string }
}

interface ExamApi {
  id: string
  name: string
  type: string
  startDate: string
  endDate: string
  grades: string[]
  status: "upcoming" | "ongoing" | "completed"
}

interface MarkApi {
  id: string
  studentId: string
  examId: string
  examName: string
  subjectId: string
  subjectName: string
  marks: number
  totalMarks: number
  grade: string
  percentage: number
  examPaperUrl?: string
  createdAt?: string
}

interface ChildDashboardData {
  id: string
  name: string
  admissionNo: string
  grade: string
  class: string
  dateOfBirth: string
  gender: string
  classTeacher: string
  classTeacherPhone: string
  classTeacherEmail: string
  attendanceRate: number
  averageMarks: number
  rank: number
  totalStudents: number
  recentGrade: string
  trend: "up" | "down" | "stable"
  subjects: Array<{ name: string; marks: number; grade: string; trend: "up" | "down" | "stable"; examPaper: string | null }>
  recentAttendance: Array<{ date: string; status: AttendanceStatus }>
  upcomingExams: Array<{ subject: string; date: string; type: string }>
}

function formatExamType(type: string): string {
  return type
    .replace(/-/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
}

function normalizeGradeFromClassName(className: string): string {
  if (!className) return ""
  const gradeMatch = className.match(/grade\s*(\d{1,2})/i)
  if (gradeMatch?.[1]) return `Grade ${gradeMatch[1]}`
  const leadingNumberMatch = className.match(/^(\d{1,2})/)
  if (leadingNumberMatch?.[1]) return `Grade ${leadingNumberMatch[1]}`
  return className
}

function gradeNumber(gradeLabel: string): number | null {
  const m = gradeLabel.match(/grade\s*(\d{1,2})/i)
  if (!m?.[1]) return null
  const n = Number(m[1])
  return Number.isFinite(n) ? n : null
}

function isExamRelevantToGrade(exam: ExamApi, gradeLabel: string): boolean {
  if (!exam.grades || exam.grades.length === 0) return true
  if (exam.grades.some((g) => g.toLowerCase() === "all grades")) return true

  const normalizedGrade = normalizeGradeFromClassName(gradeLabel).toLowerCase()
  if (exam.grades.some((g) => g.toLowerCase() === normalizedGrade)) return true

  const gradeNum = gradeNumber(gradeLabel)
  if (gradeNum !== null && exam.grades.some((g) => /grade\s*6\s*to\s*13/i.test(g))) {
    return gradeNum >= 6 && gradeNum <= 13
  }

  return false
}

async function apiGetJson(endpoint: string): Promise<any> {
  const response = await apiRequest(endpoint)
  const data = await response.json().catch(() => ({}))

  if (!response.ok || data?.success === false) {
    const message =
      data?.error?.message || data?.message || `Request failed (${response.status} ${response.statusText})`
    throw new Error(message)
  }

  return data
}

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
  const { user, isLoading } = useAuth()
  const [childrenData, setChildrenData] = useState<ChildDashboardData[]>([])
  const [selectedChildId, setSelectedChildId] = useState<string>("")
  const [isLoadingChildren, setIsLoadingChildren] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isLoading) return
    if (!user || user.role !== "parent") return

    let isCancelled = false

    async function fetchChildrenDashboard() {
      setIsLoadingChildren(true)
      setError(null)

      try {
        const childrenResponse = (await apiGetJson("/users/parents/me/children")) as any
        const children = (childrenResponse?.data?.children || []) as ParentChildApi[]

        if (!children.length) {
          if (!isCancelled) {
            setChildrenData([])
            setSelectedChildId("")
          }
          return
        }

        // Fetch exams once; we’ll filter per child.
        const examsResponse = (await apiGetJson("/exams")) as any
        const exams = (examsResponse?.data?.exams || []) as ExamApi[]

        const endDateObj = new Date()
        const startDateObj = new Date()
        startDateObj.setDate(endDateObj.getDate() - 60)
        const startDate = startDateObj.toISOString().split("T")[0]
        const endDate = endDateObj.toISOString().split("T")[0]

        const dashboards = await Promise.all(
          children.map(async (child) => {
            const [statsRes, historyRes, marksRes] = await Promise.allSettled([
              apiGetJson(`/attendance/student/${child.id}/stats`),
              apiGetJson(
                `/attendance/student/${child.id}/history?${new URLSearchParams({ startDate, endDate }).toString()}`
              ),
              apiGetJson(`/marks/student/${child.id}`),
            ])

            const stats = statsRes.status === "fulfilled" ? (statsRes.value as any)?.data?.stats : null
            const history = historyRes.status === "fulfilled" ? ((historyRes.value as any)?.data?.history as any[]) : []
            const marks = marksRes.status === "fulfilled" ? (((marksRes.value as any)?.data?.marks as MarkApi[]) || []) : []

            const normalizedGrade = normalizeGradeFromClassName(child.className)

            // Recent attendance (last 5 records)
            const recentAttendance = (history || [])
              .slice(0, 5)
              .map((h) => ({ date: h.date, status: h.status as AttendanceStatus }))

            // Subject performance (latest per subject)
            const marksBySubject = new Map<string, MarkApi[]>()
            for (const m of marks) {
              const key = m.subjectName || "Unknown Subject"
              const arr = marksBySubject.get(key) || []
              arr.push(m)
              marksBySubject.set(key, arr)
            }

            const subjects = Array.from(marksBySubject.entries())
              .map(([subjectName, list]) => {
                const sorted = [...list].sort((a, b) => {
                  const aT = a.createdAt ? new Date(a.createdAt).getTime() : 0
                  const bT = b.createdAt ? new Date(b.createdAt).getTime() : 0
                  return bT - aT
                })

                const latest = sorted[0]
                const prev = sorted[1]
                const latestPct =
                  typeof latest?.percentage === "number"
                    ? latest.percentage
                    : latest?.totalMarks
                      ? Math.round((latest.marks / latest.totalMarks) * 100)
                      : 0
                const prevPct =
                  prev && typeof prev?.percentage === "number"
                    ? prev.percentage
                    : prev?.totalMarks
                      ? Math.round((prev.marks / prev.totalMarks) * 100)
                      : null

                const trend: "up" | "down" | "stable" =
                  prevPct === null ? "stable" : latestPct > prevPct ? "up" : latestPct < prevPct ? "down" : "stable"

                return {
                  name: subjectName,
                  marks: Math.round(latestPct),
                  grade: latest?.grade || "-",
                  trend,
                  examPaper: latest?.examPaperUrl || null,
                  _latestAt: latest?.createdAt || "",
                }
              })
              .sort((a, b) => new Date(b._latestAt).getTime() - new Date(a._latestAt).getTime())
              .slice(0, 6)
              .map(({ _latestAt, ...rest }) => rest)

            const averageMarks =
              subjects.length > 0 ? Math.round(subjects.reduce((sum, s) => sum + (s.marks || 0), 0) / subjects.length) : 0

            const mostRecentMark = marks
              .slice()
              .sort((a, b) => {
                const aT = a.createdAt ? new Date(a.createdAt).getTime() : 0
                const bT = b.createdAt ? new Date(b.createdAt).getTime() : 0
                return bT - aT
              })[0]

            const recentGrade = mostRecentMark?.grade || (subjects[0]?.grade ?? "-")

            // Trend based on last two overall marks (fallback to stable)
            let overallTrend: "up" | "down" | "stable" = "stable"
            if (marks.length >= 2) {
              const sorted = marks
                .slice()
                .sort((a, b) => {
                  const aT = a.createdAt ? new Date(a.createdAt).getTime() : 0
                  const bT = b.createdAt ? new Date(b.createdAt).getTime() : 0
                  return bT - aT
                })
              const latestPct = typeof sorted[0].percentage === "number" ? sorted[0].percentage : 0
              const prevPct = typeof sorted[1].percentage === "number" ? sorted[1].percentage : 0
              overallTrend = latestPct > prevPct ? "up" : latestPct < prevPct ? "down" : "stable"
            }

            const relevantUpcomingExams = (exams || [])
              .filter((e) => e.status === "upcoming")
              .filter((e) => isExamRelevantToGrade(e, normalizedGrade))
              .slice(0, 6)
              .map((e) => ({
                subject: e.name,
                date: e.startDate,
                type: formatExamType(e.type),
              }))

            const teacherName = child.classTeacher?.name || ""

            const dashboard: ChildDashboardData = {
              id: child.id,
              name: child.name || "Unknown",
              admissionNo: child.id,
              grade: normalizedGrade || "-",
              class: child.className || "-",
              dateOfBirth: "",
              gender: "",
              classTeacher: teacherName || "-",
              classTeacherPhone: "-",
              classTeacherEmail: "-",
              attendanceRate: typeof stats?.attendanceRate === "number" ? stats.attendanceRate : 0,
              averageMarks,
              rank: 0,
              totalStudents: 0,
              recentGrade,
              trend: overallTrend,
              subjects,
              recentAttendance,
              upcomingExams: relevantUpcomingExams,
            }

            return dashboard
          })
        )

        if (!isCancelled) {
          setChildrenData(dashboards)
          setSelectedChildId((prev) => prev || dashboards[0]?.id || "")
        }
      } catch (e: any) {
        const message = e?.message || "Failed to load children dashboard."
        if (!isCancelled) {
          setError(message)
          setChildrenData([])
          setSelectedChildId("")
        }
      } finally {
        if (!isCancelled) setIsLoadingChildren(false)
      }
    }

    fetchChildrenDashboard()

    return () => {
      isCancelled = true
    }
  }, [isLoading, user])

  const selectedChild = useMemo(() => {
    if (!childrenData.length) return null
    return childrenData.find((c) => c.id === selectedChildId) || childrenData[0]
  }, [childrenData, selectedChildId])

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

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Unable to load</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoadingChildren && (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">Loading your children dashboard…</CardContent>
        </Card>
      )}

      {!isLoadingChildren && !childrenData.length && !error && (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            No children are linked to this parent account yet.
          </CardContent>
        </Card>
      )}

      {/* Child Selector Tabs */}
      {childrenData.length > 0 && selectedChild && (
        <Tabs value={selectedChild.id} onValueChange={(value) => setSelectedChildId(value)}>
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
                        {child.rank > 0 && child.totalStudents > 0 ? (
                          <Badge variant="outline">
                            Rank: {child.rank}/{child.totalStudents}
                          </Badge>
                        ) : null}
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
                      {child.rank > 0 && child.totalStudents > 0 ? (
                        <p className="text-2xl font-bold">
                          {child.rank}
                          <span className="text-sm font-normal text-muted-foreground">/{child.totalStudents}</span>
                        </p>
                      ) : (
                        <p className="text-2xl font-bold">-</p>
                      )}
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
      )}
    </div>
  )
}
