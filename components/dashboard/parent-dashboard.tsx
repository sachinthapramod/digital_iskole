"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useLanguage } from "@/lib/i18n/context"
import { apiRequest } from "@/lib/api/client"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { FileText, Calendar, Bell, ArrowRight, TrendingUp, User, Clock, AlertCircle } from "lucide-react"
import Link from "next/link"

interface ParentChildApi {
  id: string
  name: string
  className: string
}

interface AttendanceStatsApi {
  totalDays: number
  presentDays: number
  absentDays: number
  lateDays: number
  attendanceRate: number
}

interface MarkApi {
  id: string
  studentId: string
  studentName: string
  subjectName: string
  marks: number
  totalMarks: number
  grade: string
  percentage: number
  createdAt?: string
  updatedAt?: string
}

interface NoticeApi {
  id: string
  title: string
  priority: "high" | "medium" | "normal"
  date: string
}

type AppointmentStatus = "approved" | "pending" | "rejected" | "completed" | "cancelled"

interface AppointmentApi {
  id: string
  studentName: string
  className: string
  teacherName: string
  date: string
  time: string
  status: AppointmentStatus
  reason: string
}

interface ChildCardVm {
  id: string
  name: string
  grade: string
  attendanceRate: number
  averageMarks: number
  recentGrade: string
}

interface RecentMarkVm {
  subject: string
  marks: number
  total: number
  grade: string
  child: string
  _sortDate: string
}

function badgeLabelForNoticePriority(priority: NoticeApi["priority"]): string {
  switch (priority) {
    case "high":
      return "High"
    case "medium":
      return "Medium"
    default:
      return "Normal"
  }
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

export function ParentDashboard() {
  const { t } = useLanguage()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [children, setChildren] = useState<ChildCardVm[]>([])
  const [recentMarks, setRecentMarks] = useState<RecentMarkVm[]>([])
  const [notices, setNotices] = useState<Array<{ id: string; title: string; date: string; type: string }>>([])
  const [appointments, setAppointments] = useState<
    Array<{
      id: string
      child: string
      childClass: string
      teacher: string
      date: string
      time: string
      status: AppointmentStatus
      reason: string
    }>
  >([])

  useEffect(() => {
    let cancelled = false

    async function loadParentDashboard() {
      setIsLoading(true)
      setError(null)

      try {
        const [childrenRes, noticesRes, appointmentsRes] = await Promise.all([
          apiGetJson("/users/parents/me/children"),
          apiGetJson("/notices?target=parents"),
          apiGetJson("/appointments"),
        ])

        const childrenApi = (childrenRes?.data?.children || []) as ParentChildApi[]

        // Build children cards (attendance + marks summary per child)
        const childCards = await Promise.all(
          childrenApi.map(async (c) => {
            const [statsRes, marksRes] = await Promise.allSettled([
              apiGetJson(`/attendance/student/${c.id}/stats`),
              apiGetJson(`/marks/student/${c.id}`),
            ])

            const stats = statsRes.status === "fulfilled" ? ((statsRes.value as any)?.data?.stats as AttendanceStatsApi) : null
            const marks = marksRes.status === "fulfilled" ? (((marksRes.value as any)?.data?.marks as MarkApi[]) || []) : []

            const attendanceRate = typeof stats?.attendanceRate === "number" ? stats.attendanceRate : 0

            const avg =
              marks.length > 0
                ? Math.round(
                    marks.reduce((sum, m) => sum + (typeof m.percentage === "number" ? m.percentage : 0), 0) / marks.length
                  )
                : 0

            const latestMark = marks
              .slice()
              .sort((a, b) => {
                const aT = new Date(a.updatedAt || a.createdAt || 0).getTime()
                const bT = new Date(b.updatedAt || b.createdAt || 0).getTime()
                return bT - aT
              })[0]

            return {
              id: c.id,
              name: c.name,
              grade: c.className,
              attendanceRate,
              averageMarks: avg,
              recentGrade: latestMark?.grade || "-",
            } satisfies ChildCardVm
          })
        )

        // Recent marks across children (latest 4)
        const marksAcrossChildren: RecentMarkVm[] = []
        for (const child of childrenApi) {
          try {
            const marksRes = await apiGetJson(`/marks/student/${child.id}`)
            const marks = ((marksRes?.data?.marks as MarkApi[]) || []).map((m) => ({
              subject: m.subjectName || "-",
              marks: m.marks,
              total: m.totalMarks,
              grade: m.grade || "-",
              child: child.name,
              _sortDate: m.updatedAt || m.createdAt || "",
            }))
            marksAcrossChildren.push(...marks)
          } catch {
            // ignore per-child marks failures; dashboard should still render
          }
        }

        marksAcrossChildren.sort((a, b) => new Date(b._sortDate).getTime() - new Date(a._sortDate).getTime())
        const recentMarksVm = marksAcrossChildren.slice(0, 4)

        const noticesApi = (noticesRes?.data?.notices || []) as NoticeApi[]
        const noticesVm = noticesApi.slice(0, 3).map((n) => ({
          id: n.id,
          title: n.title,
          date: n.date,
          type: badgeLabelForNoticePriority(n.priority),
        }))

        const appointmentsApi = (appointmentsRes?.data?.appointments || []) as AppointmentApi[]
        const appointmentsVm = appointmentsApi.slice(0, 4).map((a) => ({
          id: a.id,
          child: a.studentName,
          childClass: a.className,
          teacher: a.teacherName,
          date: a.date,
          time: a.time,
          status: a.status,
          reason: a.reason,
        }))

        if (!cancelled) {
          setChildren(childCards)
          setRecentMarks(recentMarksVm)
          setNotices(noticesVm)
          setAppointments(appointmentsVm)
        }
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message || "Failed to load parent dashboard.")
          setChildren([])
          setRecentMarks([])
          setNotices([])
          setAppointments([])
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    loadParentDashboard()
    return () => {
      cancelled = true
    }
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-success text-success-foreground text-xs">{t("approved")}</Badge>
      case "pending":
        return (
          <Badge variant="secondary" className="text-xs">
            {t("pending")}
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="destructive" className="text-xs">
            {t("rejected")}
          </Badge>
        )
      case "cancelled":
        return (
          <Badge variant="outline" className="text-xs">
            Cancelled
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline" className="text-xs">
            Completed
          </Badge>
        )
      default:
        return null
    }
  }

  const showEmptyChildren = useMemo(() => !isLoading && !error && children.length === 0, [children.length, error, isLoading])

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">{t("dashboard")}</h1>
          <p className="text-sm text-muted-foreground">Monitor your children&apos;s progress</p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/dashboard/appointments">
            <Calendar className="h-4 w-4 mr-2" />
            {t("requestAppointment")}
          </Link>
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Unable to load dashboard</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading && (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">Loading your dashboard…</CardContent>
        </Card>
      )}

      {/* Children Overview */}
      {!isLoading && children.length > 0 && (
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
          {children.map((child) => (
            <Card key={child.id} className="overflow-hidden">
              <CardHeader className="bg-primary/5 pb-3 sm:pb-4">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-lg sm:text-xl font-bold flex-shrink-0">
                    {child.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="text-base sm:text-lg truncate">{child.name}</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">{child.grade}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-3 sm:pt-4">
                <div className="grid gap-3 sm:gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                      <span className="text-xs sm:text-sm text-muted-foreground">{t("attendance")}</span>
                      <span className="text-xs sm:text-sm font-medium">{child.attendanceRate}%</span>
                    </div>
                    <Progress value={child.attendanceRate} className="h-1.5 sm:h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                      <span className="text-xs sm:text-sm text-muted-foreground">Average Marks</span>
                      <span className="text-xs sm:text-sm font-medium">{child.averageMarks}%</span>
                    </div>
                    <Progress value={child.averageMarks} className="h-1.5 sm:h-2" />
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-success" />
                      <span className="text-xs sm:text-sm text-muted-foreground">Recent Grade</span>
                    </div>
                    <Badge variant="outline" className="font-bold text-xs">
                      {child.recentGrade}
                    </Badge>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-3 sm:mt-4 bg-transparent text-xs sm:text-sm" asChild>
                  <Link href="/dashboard/children">
                    {t("viewDetails")} <ArrowRight className="ml-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {showEmptyChildren && (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            No children are linked to this parent account yet.
          </CardContent>
        </Card>
      )}

      {/* Main Content Grid */}
      {!isLoading && (
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        {/* Recent Marks */}
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 sm:pb-4">
            <div>
              <CardTitle className="text-base sm:text-lg">{t("marks")}</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Recent examination results</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild className="self-start sm:self-auto">
              <Link href="/dashboard/marks">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              {recentMarks.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground text-sm">No marks available yet.</div>
              ) : (
                recentMarks.map((mark, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-border last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-xs sm:text-sm text-foreground truncate">{mark.subject}</p>
                      <p className="text-xs text-muted-foreground truncate">{mark.child}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-medium text-xs sm:text-sm">
                      {mark.marks}/{mark.total}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {mark.grade}
                    </Badge>
                  </div>
                </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Notices */}
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 sm:pb-4">
            <div>
              <CardTitle className="text-base sm:text-lg">{t("notices")}</CardTitle>
              <CardDescription className="text-xs sm:text-sm">School announcements</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild className="self-start sm:self-auto">
              <Link href="/dashboard/notices">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              {notices.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground text-sm">No notices available.</div>
              ) : (
                notices.map((notice) => (
                <div
                  key={notice.id}
                  className="flex items-center justify-between gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-border last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg bg-accent/50 flex items-center justify-center flex-shrink-0">
                      <Bell className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-accent-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-xs sm:text-sm text-foreground truncate">{notice.title}</p>
                      <p className="text-xs text-muted-foreground">{notice.date}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs flex-shrink-0">
                    {notice.type}
                  </Badge>
                </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Appointments */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 sm:pb-4">
            <div>
              <CardTitle className="text-base sm:text-lg">{t("appointments")}</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Your scheduled meetings with class teachers
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild className="self-start sm:self-auto">
              <Link href="/dashboard/appointments">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {appointments.length === 0 ? (
              <div className="text-center py-6 sm:py-8 text-muted-foreground">
                <Calendar className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No appointments scheduled</p>
                <Button variant="outline" className="mt-4 bg-transparent" asChild>
                  <Link href="/dashboard/appointments">{t("requestAppointment")}</Link>
                </Button>
              </div>
            ) : (
              <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                {appointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="p-3 sm:p-4 rounded-lg border border-border bg-card hover:bg-accent/5 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2 sm:mb-3">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <User className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-xs sm:text-sm text-foreground truncate">{appointment.child}</p>
                          <p className="text-xs text-muted-foreground">{appointment.childClass}</p>
                        </div>
                      </div>
                      {getStatusBadge(appointment.status)}
                    </div>
                    <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                        <span className="truncate">
                          Class Teacher: <span className="text-foreground font-medium">{appointment.teacher}</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                        <span>{appointment.date}</span>
                        <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 ml-1 sm:ml-2 flex-shrink-0" />
                        <span>{appointment.time}</span>
                      </div>
                      <p className="text-xs text-muted-foreground pt-1 border-t border-border mt-2 truncate">
                        {appointment.reason}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        </div>
      )}
    </div>
  )
}
