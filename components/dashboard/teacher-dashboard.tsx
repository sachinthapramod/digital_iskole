"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { StatsCard } from "@/components/dashboard/stats-card"
import { useLanguage } from "@/lib/i18n/context"
import { useAuth } from "@/lib/auth/context"
import { apiRequest } from "@/lib/api/client"
import {
  Users,
  ClipboardCheck,
  Calendar,
  ArrowRight,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Megaphone,
  AlertCircle,
  Loader2,
} from "lucide-react"
import Link from "next/link"

const progressStats = {
  classAverage: 72.5,
  previousAverage: 68.2,
  attendanceRate: 94.5,
  previousAttendance: 92.1,
  passRate: 88,
  previousPassRate: 85,
  subjectPerformance: [
    { subject: "Mathematics", average: 75, previousAverage: 70 },
    { subject: "Science", average: 72, previousAverage: 74 },
    { subject: "English", average: 68, previousAverage: 65 },
    { subject: "History", average: 78, previousAverage: 76 },
  ],
  topPerformers: [
    { name: "Nimali Silva", marks: 92, trend: "up" },
    { name: "Kasun Perera", marks: 88, trend: "up" },
    { name: "Dinesh Kumar", marks: 85, trend: "same" },
  ],
}

interface NoticeApi {
  id: string
  title: string
  content: string
  priority: "high" | "medium" | "low" | "normal"
  authorName: string
  publishedAt: string
  date?: string
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

interface Student {
  id: string
  name: string
  rollNo: string
  attendance?: "present" | "absent" | "late"
}

export function TeacherDashboard() {
  const { t } = useLanguage()
  const { user } = useAuth()
  const [classStudents, setClassStudents] = useState<Student[]>([])
  const [isLoadingStudents, setIsLoadingStudents] = useState(true)
  const [todayAttendance, setTodayAttendance] = useState<Record<string, "present" | "absent" | "late">>({})
  const [notices, setNotices] = useState<NoticeApi[]>([])
  const [isLoadingNotices, setIsLoadingNotices] = useState(true)
  
  useEffect(() => {
    if (user?.assignedClass) {
      fetchClassStudents()
      fetchTodayAttendance()
    }
    fetchNotices()
  }, [user?.assignedClass])

  const fetchClassStudents = async () => {
    if (!user?.assignedClass) return
    
    try {
      setIsLoadingStudents(true)
      const response = await apiRequest(`/attendance/students?className=${encodeURIComponent(user.assignedClass)}`)
      const data = await response.json()
      
      if (response.ok) {
        setClassStudents(data.data?.students || [])
      }
    } catch (err: any) {
      console.error('Fetch class students error:', err)
    } finally {
      setIsLoadingStudents(false)
    }
  }

  const fetchTodayAttendance = async () => {
    if (!user?.assignedClass) return
    
    try {
      const today = new Date().toISOString().split('T')[0]
      const response = await apiRequest(`/attendance?className=${encodeURIComponent(user.assignedClass)}&date=${today}`)
      const data = await response.json()
      
      if (response.ok) {
        const attendanceMap: Record<string, "present" | "absent" | "late"> = {}
        data.data?.attendance?.forEach((item: any) => {
          attendanceMap[item.studentId] = item.status
        })
        setTodayAttendance(attendanceMap)
      }
    } catch (err: any) {
      console.error('Fetch today attendance error:', err)
    }
  }

  const fetchNotices = async () => {
    try {
      setIsLoadingNotices(true)
      const noticesRes = await apiGetJson("/notices?target=teachers")
      const noticesApi = (noticesRes?.data?.notices || []) as NoticeApi[]
      
      // Format notices and sort by date (newest first)
      const formattedNotices = noticesApi
        .map((n) => ({
          id: n.id,
          title: n.title,
          content: n.content,
          priority: n.priority || "normal",
          author: n.authorName || "Admin",
          date: n.date || n.publishedAt ? new Date(n.publishedAt).toLocaleDateString() : new Date().toLocaleDateString(),
        }))
        .sort((a, b) => {
          const dateA = new Date(a.date).getTime()
          const dateB = new Date(b.date).getTime()
          return dateB - dateA
        })
        .slice(0, 4) // Show only latest 4 notices
      
      setNotices(formattedNotices)
    } catch (err: any) {
      console.error('Fetch notices error:', err)
      setNotices([]) // Set empty array on error
    } finally {
      setIsLoadingNotices(false)
    }
  }

  const getAttendanceIcon = (status: string) => {
    switch (status) {
      case "present":
        return <CheckCircle className="h-4 w-4 text-success" />
      case "absent":
        return <XCircle className="h-4 w-4 text-destructive" />
      case "late":
        return <Clock className="h-4 w-4 text-warning" />
      default:
        return null
    }
  }

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-success" />
    if (current < previous) return <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-destructive" />
    return null
  }

  const getTrendText = (current: number, previous: number) => {
    const diff = (current - previous).toFixed(1)
    if (current > previous) return `+${diff}%`
    if (current < previous) return `${diff}%`
    return "No change"
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive"
      case "medium":
        return "warning"
      default:
        return "secondary"
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <AlertCircle className="h-4 w-4 text-destructive" />
      case "medium":
        return <Megaphone className="h-4 w-4 text-warning" />
      default:
        return <Megaphone className="h-4 w-4 text-muted-foreground" />
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">{t("dashboard")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("classTeacher")}: {user?.assignedClass || "Grade 10-A"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild className="w-full sm:w-auto">
            <Link href="/dashboard/attendance">
              <ClipboardCheck className="h-4 w-4 mr-2" />
              {t("markAttendance")}
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <StatsCard 
          title="Class Students" 
          value={isLoadingStudents ? "..." : classStudents.length.toString()} 
          icon={Users} 
          description={user?.assignedClass || "Grade 10-A"} 
        />
        <StatsCard 
          title={t("todayAttendance")} 
          value={
            isLoadingStudents 
              ? "..." 
              : `${Object.values(todayAttendance).filter(s => s === "present").length}/${classStudents.length}`
          } 
          icon={ClipboardCheck} 
          description={
            isLoadingStudents || classStudents.length === 0
              ? "Loading..."
              : `${Math.round((Object.values(todayAttendance).filter(s => s === "present").length / classStudents.length) * 100)}% present`
          } 
        />
        <StatsCard title="Class Average" value="72.5%" icon={TrendingUp} description="+4.3% from last term" />
        <StatsCard title={t("appointments")} value="2" icon={Calendar} description="Scheduled today" />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-base sm:text-lg">Class Progress Stats</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              {user?.assignedClass || "Grade 10-A"} - Performance Overview
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              <div className="text-center p-2 sm:p-3 rounded-lg bg-muted/50">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <span className="text-lg sm:text-2xl font-bold text-foreground">{progressStats.classAverage}%</span>
                  {getTrendIcon(progressStats.classAverage, progressStats.previousAverage)}
                </div>
                <p className="text-xs text-muted-foreground">Class Avg</p>
                <p className="text-xs text-success hidden sm:block">
                  {getTrendText(progressStats.classAverage, progressStats.previousAverage)}
                </p>
              </div>
              <div className="text-center p-2 sm:p-3 rounded-lg bg-muted/50">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <span className="text-lg sm:text-2xl font-bold text-foreground">{progressStats.attendanceRate}%</span>
                  {getTrendIcon(progressStats.attendanceRate, progressStats.previousAttendance)}
                </div>
                <p className="text-xs text-muted-foreground">Attendance</p>
                <p className="text-xs text-success hidden sm:block">
                  {getTrendText(progressStats.attendanceRate, progressStats.previousAttendance)}
                </p>
              </div>
              <div className="text-center p-2 sm:p-3 rounded-lg bg-muted/50">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <span className="text-lg sm:text-2xl font-bold text-foreground">{progressStats.passRate}%</span>
                  {getTrendIcon(progressStats.passRate, progressStats.previousPassRate)}
                </div>
                <p className="text-xs text-muted-foreground">Pass Rate</p>
                <p className="text-xs text-success hidden sm:block">
                  {getTrendText(progressStats.passRate, progressStats.previousPassRate)}
                </p>
              </div>
            </div>

            {/* Subject Performance */}
            <div>
              <h4 className="text-xs sm:text-sm font-medium text-foreground mb-2 sm:mb-3">Subject Performance</h4>
              <div className="space-y-2 sm:space-y-3">
                {progressStats.subjectPerformance.map((subject) => (
                  <div key={subject.subject} className="space-y-1">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-foreground truncate">{subject.subject}</span>
                      <div className="flex items-center gap-1 sm:gap-2">
                        <span className="text-muted-foreground">{subject.average}%</span>
                        {getTrendIcon(subject.average, subject.previousAverage)}
                      </div>
                    </div>
                    <Progress value={subject.average} className="h-1.5 sm:h-2" />
                  </div>
                ))}
              </div>
            </div>

            {/* Top Performers */}
            <div>
              <h4 className="text-xs sm:text-sm font-medium text-foreground mb-2 sm:mb-3">Top Performers</h4>
              <div className="space-y-2">
                {progressStats.topPerformers.map((student, index) => (
                  <div
                    key={student.name}
                    className="flex items-center justify-between py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg bg-muted/30"
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <span className="text-xs font-bold text-primary">#{index + 1}</span>
                      <span className="text-xs sm:text-sm text-foreground truncate">{student.name}</span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <span className="text-xs sm:text-sm font-medium text-foreground">{student.marks}%</span>
                      {student.trend === "up" && <TrendingUp className="h-3 w-3 text-success" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Class Attendance Overview */}
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 sm:pb-4">
            <div>
              <CardTitle className="text-base sm:text-lg">Class Attendance</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                {user?.assignedClass || "Grade 10-A"} - Today
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild className="self-start sm:self-auto">
              <Link href="/dashboard/attendance">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isLoadingStudents ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : classStudents.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                No students found in this class
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {classStudents.slice(0, 5).map((student) => {
                  const attendanceStatus = todayAttendance[student.id] || "absent"
                  return (
                    <div key={student.id} className="flex items-center justify-between py-1.5 sm:py-2">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-muted flex items-center justify-center text-xs sm:text-sm font-medium">
                          {student.name.charAt(0)}
                        </div>
                        <span className="text-xs sm:text-sm text-foreground truncate max-w-[120px] sm:max-w-none">
                          {student.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        {getAttendanceIcon(attendanceStatus)}
                        <span className="text-xs text-muted-foreground capitalize hidden sm:inline">
                          {attendanceStatus}
                        </span>
                      </div>
                    </div>
                  )
                })}
                {classStudents.length > 5 && (
                  <div className="text-center pt-2">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href="/dashboard/attendance">
                        View All {classStudents.length} Students <ArrowRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 sm:pb-4">
            <div>
              <CardTitle className="text-base sm:text-lg">{t("notices")}</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Recent announcements and updates</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild className="self-start sm:self-auto">
              <Link href="/dashboard/notices">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isLoadingNotices ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : notices.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                No notices available.
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {notices.map((notice) => (
                  <div
                    key={notice.id}
                    className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4 p-3 sm:p-4 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-start gap-2 sm:gap-3 min-w-0">
                      <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        {getPriorityIcon(notice.priority)}
                      </div>
                      <div className="space-y-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium text-xs sm:text-sm text-foreground">{notice.title}</p>
                          <Badge variant={getPriorityColor(notice.priority) as any} className="text-xs">
                            {notice.priority}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">{notice.content}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>By {notice.author}</span>
                          <span>•</span>
                          <span>{notice.date}</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      asChild
                      className="w-full sm:w-auto mt-2 sm:mt-0 flex-shrink-0 bg-transparent"
                    >
                      <Link href="/dashboard/notices">View</Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
