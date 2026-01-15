"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useLanguage } from "@/lib/i18n/context"
import { useAuth } from "@/lib/auth/context"
import { apiRequest } from "@/lib/api/client"
import { CheckCircle, XCircle, Clock, Save, Search, Calendar, TrendingUp, TrendingDown, Loader2, AlertCircle, Edit, History, ClipboardCheck } from "lucide-react"

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

interface Student {
  id: string
  name: string
  rollNo: string
}

interface Class {
  id: string
  name: string
}

export default function AttendancePage() {
  const { t } = useLanguage()
  const { user } = useAuth()
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [selectedClass, setSelectedClass] = useState<string>("")
  const [classes, setClasses] = useState<Class[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedChild, setSelectedChild] = useState(mockParentChildren[0]?.id || "")
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingStudents, setIsLoadingStudents] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"mark" | "history">("mark")
  const [historyStartDate, setHistoryStartDate] = useState(() => {
    const date = new Date()
    date.setDate(date.getDate() - 30) // Last 30 days
    return date.toISOString().split("T")[0]
  })
  const [historyEndDate, setHistoryEndDate] = useState(new Date().toISOString().split("T")[0])
  const [attendanceHistory, setAttendanceHistory] = useState<any[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const skipFetchAttendanceRef = useRef(false)

  const isTeacherOrAdmin = user?.role === "teacher" || user?.role === "admin"
  const isParent = user?.role === "parent"
  const isTeacher = user?.role === "teacher"

  // Initialize selected class for teachers
  useEffect(() => {
    if (isTeacher && user?.assignedClass) {
      setSelectedClass(user.assignedClass)
    }
  }, [isTeacher, user?.assignedClass])

  // Fetch classes for admin
  useEffect(() => {
    if (user?.role === "admin") {
      fetchClasses()
    }
  }, [user?.role])

  // Fetch students when class or date changes
  useEffect(() => {
    if (selectedClass && selectedDate) {
      fetchStudents()
    }
  }, [selectedClass, selectedDate])

  // Fetch attendance when date or class changes (after students are loaded)
  useEffect(() => {
    if (selectedClass && selectedDate && students.length > 0 && viewMode === "mark") {
      // Only skip if flag is set (from history edit)
      if (skipFetchAttendanceRef.current) {
        skipFetchAttendanceRef.current = false
        return
      }
      console.log('useEffect triggered - fetching attendance', { selectedClass, selectedDate, studentsCount: students.length })
      fetchAttendance()
    }
  }, [selectedClass, selectedDate, students.length, viewMode])

  const fetchClasses = async () => {
    try {
      setIsLoading(true)
      const response = await apiRequest('/academic/classes')
      const data = await response.json()
      
      if (response.ok) {
        setClasses(data.data?.classes || [])
      }
    } catch (err: any) {
      console.error('Fetch classes error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchStudents = async () => {
    if (!selectedClass) return
    
    try {
      setIsLoadingStudents(true)
      const response = await apiRequest(`/attendance/students?className=${encodeURIComponent(selectedClass)}`)
      const data = await response.json()
      
      if (response.ok) {
        const studentsList = data.data?.students || []
        setStudents(studentsList)
        
        // Initialize attendance with "absent" for new students only (don't overwrite existing)
        setAttendance((prev) => {
          const newAttendance = { ...prev }
          studentsList.forEach((student: Student) => {
            if (!(student.id in newAttendance)) {
              newAttendance[student.id] = "absent"
            }
          })
          return newAttendance
        })
      }
    } catch (err: any) {
      console.error('Fetch students error:', err)
      setError(err.message || 'Failed to fetch students')
    } finally {
      setIsLoadingStudents(false)
    }
  }

  const fetchAttendance = async () => {
    if (!selectedClass || !selectedDate) return
    
    try {
      const response = await apiRequest(`/attendance?className=${encodeURIComponent(selectedClass)}&date=${selectedDate}`)
      const data = await response.json()
      
      if (response.ok) {
        // Clear existing attendance and set new attendance for the selected date
        const attendanceMap: Record<string, AttendanceStatus> = {}
        
        // First, initialize all students as absent
        students.forEach((student) => {
          attendanceMap[student.id] = "absent"
        })
        
        // Then, update with fetched attendance
        if (data.data?.attendance && Array.isArray(data.data.attendance)) {
          data.data.attendance.forEach((item: any) => {
            if (attendanceMap.hasOwnProperty(item.studentId)) {
              attendanceMap[item.studentId] = item.status
            }
          })
        }
        
        setAttendance(attendanceMap)
      } else {
        // If response not OK or no data, initialize all as absent
        const attendanceMap: Record<string, AttendanceStatus> = {}
        students.forEach((student) => {
          attendanceMap[student.id] = "absent"
        })
        setAttendance(attendanceMap)
      }
    } catch (err: any) {
      console.error('Fetch attendance error:', err)
      // On error, initialize all as absent
      const attendanceMap: Record<string, AttendanceStatus> = {}
      students.forEach((student) => {
        attendanceMap[student.id] = "absent"
      })
      setAttendance(attendanceMap)
    }
  }

  const fetchAttendanceHistory = async () => {
    if (!selectedClass) return
    
    try {
      setIsLoadingHistory(true)
      const response = await apiRequest(
        `/attendance/history?className=${encodeURIComponent(selectedClass)}&startDate=${historyStartDate}&endDate=${historyEndDate}`
      )
      const data = await response.json()
      
      if (response.ok) {
        setAttendanceHistory(data.data?.history || [])
      }
    } catch (err: any) {
      console.error('Fetch attendance history error:', err)
      setError(err.message || 'Failed to fetch attendance history')
    } finally {
      setIsLoadingHistory(false)
    }
  }

  useEffect(() => {
    if (viewMode === "history" && selectedClass && historyStartDate && historyEndDate) {
      fetchAttendanceHistory()
    }
  }, [viewMode, selectedClass, historyStartDate, historyEndDate, students.length])

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }))
  }

  const handleSave = async () => {
    if (!selectedClass || !selectedDate) {
      setError("Please select a class and date")
      return
    }

    if (students.length === 0) {
      setError("No students found. Please wait for students to load.")
      return
    }

    if (Object.keys(attendance).length === 0) {
      setError("No attendance data to save. Please mark attendance for at least one student.")
      return
    }

    try {
      setIsSaving(true)
      setError(null)
      setSuccess(null)

      // Filter to only include students that exist in the students list
      const validStudentIds = new Set(students.map(s => s.id))
      const attendanceArray = Object.entries(attendance)
        .filter(([studentId]) => validStudentIds.has(studentId))
        .map(([studentId, status]) => ({
          studentId,
          status,
        }))

      if (attendanceArray.length === 0) {
        setError("No valid attendance data to save.")
        setIsSaving(false)
        return
      }

      console.log('Saving attendance:', {
        className: selectedClass,
        date: selectedDate,
        count: attendanceArray.length,
      })

      const response = await apiRequest('/attendance/mark/bulk', {
        method: 'POST',
        body: JSON.stringify({
          className: selectedClass,
          date: selectedDate,
          attendance: attendanceArray,
        }),
      })

      let data: any = {}
      try {
        const text = await response.text()
        if (text) {
          data = JSON.parse(text)
        }
      } catch (parseError) {
        console.error('Failed to parse response:', parseError)
        throw new Error(`Server error: ${response.status} ${response.statusText}`)
      }

      if (!response.ok) {
        console.error('Attendance save error response:', {
          status: response.status,
          statusText: response.statusText,
          data,
        })
        const errorMessage = data.error?.message || data.message || `Failed to save attendance (${response.status})`
        throw new Error(errorMessage)
      }

      setSuccess(`Attendance saved successfully for ${data.data?.marked || attendanceArray.length} students!`)
      setTimeout(() => setSuccess(null), 3000)
      
      // Refresh attendance data
      await fetchAttendance()
    } catch (err: any) {
      console.error('Save attendance error:', err)
      setError(err.message || 'Failed to save attendance. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.rollNo.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
          <p className="text-muted-foreground">
            {viewMode === "mark" ? t("markAttendance") : "View Attendance History"}
          </p>
        </div>
        {viewMode === "mark" && (
          <Button onClick={handleSave} disabled={isSaving || !selectedClass || students.length === 0}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {t("save")}
              </>
            )}
          </Button>
        )}
      </div>

      {/* Tabs for Mark/History */}
      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "mark" | "history")}>
        <TabsList>
          <TabsTrigger value="mark">
            <ClipboardCheck className="h-4 w-4 mr-2" />
            Mark Attendance
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="h-4 w-4 mr-2" />
            View History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="mark" className="space-y-6">

      {/* Error/Success Messages */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert className="bg-success/10 border-success">
          <CheckCircle className="h-4 w-4 text-success" />
          <AlertDescription className="text-success">{success}</AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>{t("date")}</Label>
              <Input 
                type="date" 
                value={selectedDate} 
                onChange={(e) => {
                  const newDate = e.target.value
                  setSelectedDate(newDate)
                  // Clear attendance when date changes - it will be reloaded by useEffect
                  setAttendance({})
                  // Reset skip flag to allow fetching
                  skipFetchAttendanceRef.current = false
                }} 
              />
              <p className="text-xs text-muted-foreground">
                Select a date to view/edit attendance for that day
              </p>
            </div>
            <div className="space-y-2">
              <Label>{t("className")}</Label>
              {isTeacher ? (
                <Input value={selectedClass || user?.assignedClass || ""} disabled />
              ) : (
                <Select value={selectedClass} onValueChange={setSelectedClass} disabled={isLoading}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.name}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
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
            {selectedDate ? (
              <>
                {new Date(selectedDate).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'short', 
                  day: 'numeric' 
                })} - {selectedClass || "No class selected"} ({filteredStudents.length} students)
              </>
            ) : (
              "Please select a date and class"
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingStudents ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : !selectedClass ? (
            <div className="text-center py-12 text-muted-foreground">
              Please select a class to mark attendance
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No students found in this class
            </div>
          ) : (
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
                  {filteredStudents.map((student) => {
                    const status = attendance[student.id] || "absent"
                    return (
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
                            {getStatusIcon(status)}
                            <Badge
                              variant={
                                status === "present"
                                  ? "default"
                                  : status === "absent"
                                    ? "destructive"
                                    : "secondary"
                              }
                              className={status === "present" ? "bg-success hover:bg-success/80" : status === "late" ? "bg-warning hover:bg-warning/80 text-warning-foreground" : ""}
                            >
                              {t(status)}
                            </Badge>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant={status === "present" ? "default" : "outline"}
                              className={
                                status === "present"
                                  ? "bg-success hover:bg-success/80 text-success-foreground"
                                  : ""
                              }
                              onClick={() => handleStatusChange(student.id, "present")}
                            >
                              P
                            </Button>
                            <Button
                              size="sm"
                              variant={status === "absent" ? "destructive" : "outline"}
                              onClick={() => handleStatusChange(student.id, "absent")}
                            >
                              A
                            </Button>
                            <Button
                              size="sm"
                              variant={status === "late" ? "default" : "outline"}
                              className={
                                status === "late"
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
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          {/* History Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid gap-4 sm:grid-cols-4">
                <div className="space-y-2">
                  <Label>Class</Label>
                  {isTeacher ? (
                    <Input value={selectedClass || user?.assignedClass || ""} disabled />
                  ) : (
                    <Select value={selectedClass} onValueChange={setSelectedClass} disabled={isLoading}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map((cls) => (
                          <SelectItem key={cls.id} value={cls.name}>
                            {cls.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={historyStartDate}
                    onChange={(e) => setHistoryStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={historyEndDate}
                    onChange={(e) => setHistoryEndDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>&nbsp;</Label>
                  <Button onClick={fetchAttendanceHistory} disabled={isLoadingHistory || !selectedClass}>
                    {isLoadingHistory ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4 mr-2" />
                        Search
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attendance History */}
          {isLoadingHistory ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : attendanceHistory.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12 text-muted-foreground">
                  No attendance records found for the selected date range.
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {attendanceHistory.map((dayRecord) => {
                const date = new Date(dayRecord.date)
                const dayName = date.toLocaleDateString('en-US', { weekday: 'long' })
                
                return (
                  <Card key={dayRecord.date}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>{dayName}</CardTitle>
                          <CardDescription>{dayRecord.date}</CardDescription>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge className="bg-success">{dayRecord.present} Present</Badge>
                          <Badge variant="destructive">{dayRecord.absent} Absent</Badge>
                          <Badge className="bg-warning text-warning-foreground">{dayRecord.late} Late</Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={async () => {
                              // Set flag to skip automatic fetch (prevents overwriting our pre-populated data)
                              skipFetchAttendanceRef.current = true
                              
                              // Set the date first
                              setSelectedDate(dayRecord.date)
                              
                              // Pre-populate attendance from history data
                              const attendanceMap: Record<string, AttendanceStatus> = {}
                              
                              // First, initialize all students as absent (if students are already loaded)
                              if (students.length > 0) {
                                students.forEach((student) => {
                                  attendanceMap[student.id] = "absent"
                                })
                              }
                              
                              // Then, update with history data
                              dayRecord.records.forEach((record: any) => {
                                attendanceMap[record.studentId] = record.status
                              })
                              
                              // Set attendance before switching mode
                              setAttendance(attendanceMap)
                              
                              // Switch to mark mode
                              setViewMode("mark")
                              
                              // If students aren't loaded yet, wait for them and update attendance
                              if (students.length === 0) {
                                // Wait for students to load, then merge attendance
                                const checkInterval = setInterval(() => {
                                  if (students.length > 0) {
                                    // Rebuild attendance map with all students
                                    const fullAttendanceMap: Record<string, AttendanceStatus> = {}
                                    students.forEach((student) => {
                                      // Use existing attendance if available, otherwise absent
                                      fullAttendanceMap[student.id] = attendanceMap[student.id] || "absent"
                                    })
                                    setAttendance(fullAttendanceMap)
                                    clearInterval(checkInterval)
                                  }
                                }, 100)
                                
                                // Clear interval after 5 seconds to prevent infinite loop
                                setTimeout(() => clearInterval(checkInterval), 5000)
                              }
                            }}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-border">
                              <th className="text-left py-2 px-2 text-sm font-medium text-muted-foreground">Roll No</th>
                              <th className="text-left py-2 px-2 text-sm font-medium text-muted-foreground">Student Name</th>
                              <th className="text-left py-2 px-2 text-sm font-medium text-muted-foreground">Status</th>
                              <th className="text-left py-2 px-2 text-sm font-medium text-muted-foreground">Marked By</th>
                            </tr>
                          </thead>
                          <tbody>
                            {dayRecord.records.map((record: any) => (
                              <tr key={record.id} className="border-b border-border last:border-0">
                                <td className="py-2 px-2 text-sm text-muted-foreground">
                                  {students.find(s => s.id === record.studentId)?.rollNo || "N/A"}
                                </td>
                                <td className="py-2 px-2 text-sm text-foreground">{record.studentName}</td>
                                <td className="py-2 px-2">
                                  <div className="flex items-center gap-2">
                                    {getStatusIcon(record.status)}
                                    {getStatusBadge(record.status)}
                                  </div>
                                </td>
                                <td className="py-2 px-2 text-sm text-muted-foreground">
                                  {record.markedBy} • {new Date(record.markedAt).toLocaleString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
