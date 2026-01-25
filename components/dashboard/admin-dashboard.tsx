"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StatsCard } from "@/components/dashboard/stats-card"
import { useLanguage } from "@/lib/i18n/context"
import { apiRequest } from "@/lib/api/client"
import { Users, GraduationCap, School, ClipboardCheck, Calendar, Bell, Plus, ArrowRight, Loader2 } from "lucide-react"
import Link from "next/link"

interface Notice {
  id: string
  title: string
  date: string
  target: string
}

interface Exam {
  id: string
  name: string
  date: string
  grade: string
  status: "upcoming" | "ongoing" | "completed"
}

interface Appointment {
  id: string
  parentName: string
  teacherName: string
  studentName: string
  className: string
  date: string
  time: string
  reason: string
  status: string
}

export function AdminDashboard() {
  const { t } = useLanguage()
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    todayAttendance: 0,
  })
  const [recentNotices, setRecentNotices] = useState<Notice[]>([])
  const [upcomingExams, setUpcomingExams] = useState<Exam[]>([])
  const [pendingAppointments, setPendingAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)

      // Fetch all data in parallel
      const [studentsRes, teachersRes, classesRes, noticesRes, examsRes, appointmentsRes] = await Promise.all([
        apiRequest('/users/students'),
        apiRequest('/users/teachers'),
        apiRequest('/academic/classes'),
        apiRequest('/notices'),
        apiRequest('/exams'),
        apiRequest('/appointments'),
      ])

      const studentsData = await studentsRes.json()
      const teachersData = await teachersRes.json()
      const classesData = await classesRes.json()
      const noticesData = await noticesRes.json()
      const examsData = await examsRes.json()
      const appointmentsData = await appointmentsRes.json()

      // Calculate stats
      const students = studentsData.data?.students || []
      const teachers = teachersData.data?.teachers || []
      const classes = classesData.data?.classes || []
      const notices = noticesData.data?.notices || []
      const exams = examsData.data?.exams || []
      const appointments = appointmentsData.data?.appointments || []

      // Calculate today's attendance percentage
      // For performance, we'll use a simplified calculation
      // In a production app, you might want a dedicated stats endpoint
      const today = new Date().toISOString().split('T')[0]
      let todayAttendanceCount = 0
      let todayTotalStudents = 0

      // Get attendance for first few classes only (for performance)
      // In production, consider a dedicated stats endpoint
      const classesToCheck = classes.slice(0, 5)
      const attendancePromises = classesToCheck.map(async (cls: any) => {
        try {
          const attendanceRes = await apiRequest(`/attendance?className=${encodeURIComponent(cls.name)}&date=${today}`)
          const attendanceData = await attendanceRes.json()
          const attendanceRecords = attendanceData.data?.attendance || []
          
          todayTotalStudents += attendanceRecords.length
          todayAttendanceCount += attendanceRecords.filter((r: any) => r.status === 'present').length
        } catch (err) {
          // Ignore errors for individual classes
        }
      })

      await Promise.all(attendancePromises)

      // If we checked some classes, extrapolate for all classes
      let attendancePercentage = 0
      if (classesToCheck.length > 0 && todayTotalStudents > 0) {
        const samplePercentage = (todayAttendanceCount / todayTotalStudents) * 100
        // Use sample percentage as estimate for all classes
        attendancePercentage = parseFloat(samplePercentage.toFixed(1))
      }

      setStats({
        totalStudents: students.length,
        totalTeachers: teachers.length,
        totalClasses: classes.length,
        todayAttendance: parseFloat(attendancePercentage),
      })

      // Get recent notices (last 3, sorted by publishedAt)
      const sortedNotices = notices
        .sort((a: any, b: any) => {
          const dateA = new Date(a.publishedAt || a.createdAt || a.date || 0).getTime()
          const dateB = new Date(b.publishedAt || b.createdAt || b.date || 0).getTime()
          return dateB - dateA
        })
        .slice(0, 3)
        .map((n: any) => ({
          id: n.id,
          title: n.title,
          date: n.date || (n.publishedAt ? String(n.publishedAt).split('T')[0] : ''),
          target: n.targetAudience?.includes('all')
            ? 'All'
            : Array.isArray(n.targetAudience) && n.targetAudience.length > 0
              ? n.targetAudience.join(', ')
              : (n.target || 'All'),
        }))

      setRecentNotices(sortedNotices)

      // Get upcoming exams (next 3, sorted by date)
      const todayDate = new Date()
      todayDate.setHours(0, 0, 0, 0)

      const sortedExams = exams
        .filter((e: any) => {
          const start = new Date(e.startDate || e.date || 0)
          // show upcoming + ongoing (backend uses upcoming/ongoing/completed)
          if (e.status !== 'upcoming' && e.status !== 'ongoing') return false
          // keep future upcoming; keep ongoing even if started earlier
          return e.status === 'ongoing' || start >= todayDate
        })
        .sort((a: any, b: any) => {
          const dateA = new Date(a.startDate || a.date || 0).getTime()
          const dateB = new Date(b.startDate || b.date || 0).getTime()
          return dateA - dateB
        })
        .slice(0, 3)
        .map((e: any) => ({
          id: e.id,
          name: e.name,
          date: e.startDate || e.date || '',
          grade: Array.isArray(e.grades) && e.grades.length > 0 ? e.grades.join(', ') : 'All Grades',
          status: e.status,
        }))

      setUpcomingExams(sortedExams)

      // Get pending appointments (last 3)
      const pending = appointments
        .filter((a: any) => a.status === 'pending')
        .sort((a: any, b: any) => {
          const dateA = new Date(a.date).getTime()
          const dateB = new Date(b.date).getTime()
          return dateA - dateB
        })
        .slice(0, 3)
        .map((a: any) => ({
          id: a.id,
          parent: a.parentName,
          teacher: a.teacherName,
          child: a.studentName,
          class: a.className,
          date: a.date,
          time: a.time,
          reason: a.reason,
          status: a.status,
        }))

      setPendingAppointments(pending)
    } catch (err: any) {
      console.error('Fetch dashboard data error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">{t("dashboard")}</h1>
          <p className="text-sm text-muted-foreground">Overview of school management system</p>
        </div>
        <div className="flex gap-2">
          <Button asChild className="w-full sm:w-auto">
            <Link href="/dashboard/notices">
              <Plus className="h-4 w-4 mr-2" />
              {t("createNotice")}
            </Link>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title={t("totalStudents")}
              value={stats.totalStudents.toLocaleString()}
              icon={GraduationCap}
            />
            <StatsCard 
              title={t("totalTeachers")} 
              value={stats.totalTeachers.toLocaleString()} 
              icon={Users} 
            />
            <StatsCard 
              title={t("totalClasses")} 
              value={stats.totalClasses.toLocaleString()} 
              icon={School} 
              description="Across all grades" 
            />
            <StatsCard
              title={t("todayAttendance")}
              value={`${stats.todayAttendance}%`}
              icon={ClipboardCheck}
            />
          </div>

      {/* Main Content Grid */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        {/* Recent Notices */}
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 sm:pb-4">
            <div>
              <CardTitle className="text-base sm:text-lg">{t("recentNotices")}</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Latest announcements and updates</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild className="self-start sm:self-auto">
              <Link href="/dashboard/notices">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              {recentNotices.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No recent notices</p>
              ) : (
                recentNotices.map((notice) => (
                <div
                  key={notice.id}
                  className="flex items-start justify-between gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-border last:border-0 last:pb-0"
                >
                  <div className="flex items-start gap-2 sm:gap-3 min-w-0">
                    <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Bell className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-xs sm:text-sm text-foreground truncate">{notice.title}</p>
                      <p className="text-xs text-muted-foreground">{notice.date}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs flex-shrink-0">
                    {notice.target}
                  </Badge>
                </div>
              ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Exams */}
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 sm:pb-4">
            <div>
              <CardTitle className="text-base sm:text-lg">{t("upcomingExams")}</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Scheduled examinations</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild className="self-start sm:self-auto">
              <Link href="/dashboard/exams">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              {upcomingExams.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No upcoming exams</p>
              ) : (
                upcomingExams.map((exam) => (
                <div
                  key={exam.id}
                  className="flex items-center justify-between gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-border last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg bg-accent/50 flex items-center justify-center flex-shrink-0">
                      <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-accent-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-xs sm:text-sm text-foreground truncate">{exam.name}</p>
                      <p className="text-xs text-muted-foreground">{exam.grade}</p>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground flex-shrink-0">{exam.date}</p>
                </div>
              ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pending Appointments */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 sm:pb-4">
            <div>
              <CardTitle className="text-base sm:text-lg">{t("pendingAppointments")}</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Overview of parent-teacher meeting requests
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild className="self-start sm:self-auto">
              <Link href="/dashboard/appointments">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {pendingAppointments.length === 0 ? (
                <div className="col-span-full">
                  <p className="text-sm text-muted-foreground text-center py-4">No pending appointments</p>
                </div>
              ) : (
                pendingAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="p-3 sm:p-4 rounded-lg border border-border bg-card hover:bg-accent/5 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2 sm:mb-3">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-xs sm:text-sm text-foreground">{appointment.parent}</p>
                        <p className="text-xs text-muted-foreground">{appointment.child}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20 text-xs">
                      Pending
                    </Badge>
                  </div>
                  <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <GraduationCap className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
                      <span className="truncate">
                        {appointment.teacher} ({appointment.class})
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
                      <span>
                        {appointment.date} at {appointment.time}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground pt-1 border-t border-border mt-2 truncate">
                      {appointment.reason}
                    </p>
                  </div>
                </div>
              ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
        </>
      )}
    </div>
  )
}
