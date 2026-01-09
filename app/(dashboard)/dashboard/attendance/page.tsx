"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useLanguage } from "@/lib/i18n/context"
import { useAuth } from "@/lib/auth/context"
import { CheckCircle, XCircle, Clock, Save, Search, Calendar, TrendingUp, TrendingDown } from "lucide-react"

// Mock student data for teachers/admin
const mockStudents = [
  { id: "1", name: "Kasun Perera", rollNo: "001", status: "present" },
  { id: "2", name: "Nimali Silva", rollNo: "002", status: "present" },
  { id: "3", name: "Amal Fernando", rollNo: "003", status: "absent" },
  { id: "4", name: "Sithara Jayawardena", rollNo: "004", status: "late" },
  { id: "5", name: "Dinesh Kumar", rollNo: "005", status: "present" },
  { id: "6", name: "Priya Mendis", rollNo: "006", status: "present" },
  { id: "7", name: "Ruwan Bandara", rollNo: "007", status: "absent" },
  { id: "8", name: "Malini Rathnayake", rollNo: "008", status: "present" },
  { id: "9", name: "Nuwan Herath", rollNo: "009", status: "present" },
  { id: "10", name: "Chamari De Silva", rollNo: "010", status: "late" },
]

const mockParentChildren = [
  {
    id: "child-1",
    name: "Kasun Perera",
    class: "Grade 10-A",
    rollNo: "001",
    admissionNo: "ADM-2020-001",
    attendanceRate: 94,
    totalDays: 180,
    presentDays: 169,
    absentDays: 8,
    lateDays: 3,
    trend: "up",
    recentAttendance: [
      { date: "2025-01-13", day: "Monday", status: "present" },
      { date: "2025-01-12", day: "Sunday", status: "holiday" },
      { date: "2025-01-11", day: "Saturday", status: "holiday" },
      { date: "2025-01-10", day: "Friday", status: "present" },
      { date: "2025-01-09", day: "Thursday", status: "present" },
      { date: "2025-01-08", day: "Wednesday", status: "late" },
      { date: "2025-01-07", day: "Tuesday", status: "present" },
      { date: "2025-01-06", day: "Monday", status: "present" },
      { date: "2025-01-03", day: "Friday", status: "absent" },
      { date: "2025-01-02", day: "Thursday", status: "present" },
    ],
    monthlyAttendance: [
      { month: "January", present: 18, absent: 1, late: 1, total: 20 },
      { month: "December", present: 19, absent: 2, late: 1, total: 22 },
      { month: "November", present: 20, absent: 1, late: 0, total: 21 },
      { month: "October", present: 21, absent: 0, late: 1, total: 22 },
    ],
  },
  {
    id: "child-2",
    name: "Nimali Perera",
    class: "Grade 7-B",
    rollNo: "015",
    admissionNo: "ADM-2022-045",
    attendanceRate: 88,
    totalDays: 180,
    presentDays: 158,
    absentDays: 15,
    lateDays: 7,
    trend: "down",
    recentAttendance: [
      { date: "2025-01-13", day: "Monday", status: "absent" },
      { date: "2025-01-12", day: "Sunday", status: "holiday" },
      { date: "2025-01-11", day: "Saturday", status: "holiday" },
      { date: "2025-01-10", day: "Friday", status: "present" },
      { date: "2025-01-09", day: "Thursday", status: "late" },
      { date: "2025-01-08", day: "Wednesday", status: "present" },
      { date: "2025-01-07", day: "Tuesday", status: "present" },
      { date: "2025-01-06", day: "Monday", status: "absent" },
      { date: "2025-01-03", day: "Friday", status: "present" },
      { date: "2025-01-02", day: "Thursday", status: "present" },
    ],
    monthlyAttendance: [
      { month: "January", present: 15, absent: 3, late: 2, total: 20 },
      { month: "December", present: 17, absent: 4, late: 1, total: 22 },
      { month: "November", present: 18, absent: 2, late: 1, total: 21 },
      { month: "October", present: 19, absent: 2, late: 1, total: 22 },
    ],
  },
]

type AttendanceStatus = "present" | "absent" | "late" | "holiday"

export default function AttendancePage() {
  const { t } = useLanguage()
  const { user } = useAuth()
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [selectedClass, setSelectedClass] = useState("grade-10-a")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedChild, setSelectedChild] = useState(mockParentChildren[0]?.id || "")
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>(
    mockStudents.reduce(
      (acc, student) => ({ ...acc, [student.id]: student.status as AttendanceStatus }),
      {} as Record<string, AttendanceStatus>,
    ),
  )

  const isTeacherOrAdmin = user?.role === "teacher" || user?.role === "admin"
  const isParent = user?.role === "parent"

  const filteredStudents = mockStudents.filter((student) =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }))
  }

  const handleSave = () => {
    alert("Attendance saved successfully!")
  }

  const getStatusIcon = (status: AttendanceStatus) => {
    switch (status) {
      case "present":
        return <CheckCircle className="h-5 w-5 text-success" />
      case "absent":
        return <XCircle className="h-5 w-5 text-destructive" />
      case "late":
        return <Clock className="h-5 w-5 text-warning" />
      case "holiday":
        return <Calendar className="h-5 w-5 text-muted-foreground" />
    }
  }

  const getStatusBadge = (status: AttendanceStatus) => {
    switch (status) {
      case "present":
        return <Badge className="bg-success hover:bg-success/80">{t("present")}</Badge>
      case "absent":
        return <Badge variant="destructive">{t("absent")}</Badge>
      case "late":
        return <Badge className="bg-warning hover:bg-warning/80 text-warning-foreground">{t("late")}</Badge>
      case "holiday":
        return <Badge variant="secondary">Holiday</Badge>
    }
  }

  const stats = {
    present: Object.values(attendance).filter((s) => s === "present").length,
    absent: Object.values(attendance).filter((s) => s === "absent").length,
    late: Object.values(attendance).filter((s) => s === "late").length,
  }

  if (isParent) {
    const currentChild = mockParentChildren.find((c) => c.id === selectedChild) || mockParentChildren[0]

    return (
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("attendance")}</h1>
          <p className="text-muted-foreground">{t("attendanceHistory")}</p>
        </div>

        {/* Child Selector */}
        {mockParentChildren.length > 1 && (
          <Tabs value={selectedChild} onValueChange={setSelectedChild}>
            <TabsList>
              {mockParentChildren.map((child) => (
                <TabsTrigger key={child.id} value={child.id}>
                  {child.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        )}

        {/* Child Info Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                {currentChild.name.charAt(0)}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-foreground">{currentChild.name}</h2>
                <p className="text-muted-foreground">
                  {currentChild.class} • Roll No: {currentChild.rollNo}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {currentChild.trend === "up" ? (
                  <TrendingUp className="h-5 w-5 text-success" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-destructive" />
                )}
                <span className={currentChild.trend === "up" ? "text-success" : "text-destructive"}>
                  {currentChild.trend === "up" ? "Improving" : "Needs Attention"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Stats */}
        <div className="grid gap-4 sm:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Attendance Rate</p>
                <p className="text-3xl font-bold text-primary">{currentChild.attendanceRate}%</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t("present")}</p>
                  <p className="text-2xl font-bold text-success">{currentChild.presentDays}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-success/20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t("absent")}</p>
                  <p className="text-2xl font-bold text-destructive">{currentChild.absentDays}</p>
                </div>
                <XCircle className="h-8 w-8 text-destructive/20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t("late")}</p>
                  <p className="text-2xl font-bold text-warning">{currentChild.lateDays}</p>
                </div>
                <Clock className="h-8 w-8 text-warning/20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Attendance & Monthly Summary */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Attendance */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Attendance</CardTitle>
              <CardDescription>Last 10 school days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {currentChild.recentAttendance.map((record, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(record.status as AttendanceStatus)}
                      <div>
                        <p className="text-sm font-medium text-foreground">{record.day}</p>
                        <p className="text-xs text-muted-foreground">{record.date}</p>
                      </div>
                    </div>
                    {getStatusBadge(record.status as AttendanceStatus)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Monthly Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Summary</CardTitle>
              <CardDescription>Attendance breakdown by month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currentChild.monthlyAttendance.map((month, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">{month.month}</span>
                      <span className="text-sm text-muted-foreground">
                        {Math.round((month.present / month.total) * 100)}%
                      </span>
                    </div>
                    <div className="flex gap-1 h-2">
                      <div
                        className="bg-success rounded-l"
                        style={{ width: `${(month.present / month.total) * 100}%` }}
                      />
                      <div className="bg-destructive" style={{ width: `${(month.absent / month.total) * 100}%` }} />
                      <div className="bg-warning rounded-r" style={{ width: `${(month.late / month.total) * 100}%` }} />
                    </div>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-success" />
                        {month.present} {t("present")}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-destructive" />
                        {month.absent} {t("absent")}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-warning" />
                        {month.late} {t("late")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Teacher/Admin view - existing functionality
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("attendance")}</h1>
          <p className="text-muted-foreground">{t("markAttendance")}</p>
        </div>
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          {t("save")}
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>{t("date")}</Label>
              <Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t("className")}</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grade-10-a">Grade 10-A</SelectItem>
                  <SelectItem value="grade-10-b">Grade 10-B</SelectItem>
                  <SelectItem value="grade-9-a">Grade 9-A</SelectItem>
                  <SelectItem value="grade-9-b">Grade 9-B</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("search")}</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t("present")}</p>
                <p className="text-2xl font-bold text-success">{stats.present}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-success/20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t("absent")}</p>
                <p className="text-2xl font-bold text-destructive">{stats.absent}</p>
              </div>
              <XCircle className="h-8 w-8 text-destructive/20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t("late")}</p>
                <p className="text-2xl font-bold text-warning">{stats.late}</p>
              </div>
              <Clock className="h-8 w-8 text-warning/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t("markAttendance")}</CardTitle>
          <CardDescription>
            {selectedDate} - Grade 10-A ({filteredStudents.length} students)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Roll No</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Name</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">{t("status")}</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">{t("actions")}</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="border-b border-border last:border-0">
                    <td className="py-3 px-2 text-sm text-muted-foreground">{student.rollNo}</td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                          {student.name.charAt(0)}
                        </div>
                        <span className="text-sm text-foreground">{student.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(attendance[student.id])}
                        <Badge
                          variant={
                            attendance[student.id] === "present"
                              ? "default"
                              : attendance[student.id] === "absent"
                                ? "destructive"
                                : "secondary"
                          }
                          className={attendance[student.id] === "present" ? "bg-success hover:bg-success/80" : ""}
                        >
                          {t(attendance[student.id])}
                        </Badge>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant={attendance[student.id] === "present" ? "default" : "outline"}
                          className={
                            attendance[student.id] === "present"
                              ? "bg-success hover:bg-success/80 text-success-foreground"
                              : ""
                          }
                          onClick={() => handleStatusChange(student.id, "present")}
                        >
                          P
                        </Button>
                        <Button
                          size="sm"
                          variant={attendance[student.id] === "absent" ? "destructive" : "outline"}
                          onClick={() => handleStatusChange(student.id, "absent")}
                        >
                          A
                        </Button>
                        <Button
                          size="sm"
                          variant={attendance[student.id] === "late" ? "default" : "outline"}
                          className={
                            attendance[student.id] === "late"
                              ? "bg-warning hover:bg-warning/80 text-warning-foreground"
                              : ""
                          }
                          onClick={() => handleStatusChange(student.id, "late")}
                        >
                          L
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
