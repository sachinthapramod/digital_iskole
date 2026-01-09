"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/lib/i18n/context"
import { useTheme } from "@/lib/theme/context"
import { useAuth } from "@/lib/auth/context"
import {
  Globe,
  Moon,
  Sun,
  Bell,
  Mail,
  Smartphone,
  Save,
  GraduationCap,
  Edit,
  Trash2,
  Plus,
  Calendar,
  CheckCircle2,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface GradeScale {
  id: string
  grade: string
  minMarks: number
  maxMarks: number
  description: string
}

interface AcademicYear {
  id: string
  year: string
  startDate: string
  endDate: string
  isCurrent: boolean
  status: "active" | "completed" | "upcoming"
}

const defaultGradeScale: GradeScale[] = [
  { id: "1", grade: "A+", minMarks: 90, maxMarks: 100, description: "Excellent" },
  { id: "2", grade: "A", minMarks: 80, maxMarks: 89, description: "Very Good" },
  { id: "3", grade: "B+", minMarks: 75, maxMarks: 79, description: "Good" },
  { id: "4", grade: "B", minMarks: 70, maxMarks: 74, description: "Above Average" },
  { id: "5", grade: "C+", minMarks: 65, maxMarks: 69, description: "Average" },
  { id: "6", grade: "C", minMarks: 60, maxMarks: 64, description: "Satisfactory" },
  { id: "7", grade: "D", minMarks: 50, maxMarks: 59, description: "Pass" },
  { id: "8", grade: "F", minMarks: 0, maxMarks: 49, description: "Fail" },
]

const defaultAcademicYears: AcademicYear[] = [
  { id: "1", year: "2024", startDate: "2024-01-08", endDate: "2024-12-15", isCurrent: true, status: "active" },
  { id: "2", year: "2023", startDate: "2023-01-09", endDate: "2023-12-14", isCurrent: false, status: "completed" },
  { id: "3", year: "2025", startDate: "2025-01-06", endDate: "2025-12-12", isCurrent: false, status: "upcoming" },
]

export default function SettingsPage() {
  const { t, language, setLanguage } = useLanguage()
  const { theme, setTheme } = useTheme()
  const { user } = useAuth()
  const [gradeScale, setGradeScale] = useState<GradeScale[]>(defaultGradeScale)
  const [gradeDialogOpen, setGradeDialogOpen] = useState(false)
  const [editingGrade, setEditingGrade] = useState<GradeScale | null>(null)
  const [newGrade, setNewGrade] = useState({ grade: "", minMarks: 0, maxMarks: 100, description: "" })

  const [academicYears, setAcademicYears] = useState<AcademicYear[]>(defaultAcademicYears)
  const [yearDialogOpen, setYearDialogOpen] = useState(false)
  const [editingYear, setEditingYear] = useState<AcademicYear | null>(null)
  const [newYear, setNewYear] = useState({ year: "", startDate: "", endDate: "" })

  const isAdmin = user?.role === "admin"

  const handleAddGrade = () => {
    setGradeScale([...gradeScale, { ...newGrade, id: String(gradeScale.length + 1) }])
    setGradeDialogOpen(false)
    setNewGrade({ grade: "", minMarks: 0, maxMarks: 100, description: "" })
  }

  const handleEditGrade = (grade: GradeScale) => {
    setEditingGrade(grade)
    setGradeDialogOpen(true)
  }

  const handleSaveGradeEdit = () => {
    if (editingGrade) {
      setGradeScale(gradeScale.map((g) => (g.id === editingGrade.id ? editingGrade : g)))
      setEditingGrade(null)
      setGradeDialogOpen(false)
    }
  }

  const handleDeleteGrade = (id: string) => {
    if (confirm("Are you sure you want to delete this grade?")) {
      setGradeScale(gradeScale.filter((g) => g.id !== id))
    }
  }

  const handleAddYear = () => {
    const newAcademicYear: AcademicYear = {
      id: String(academicYears.length + 1),
      year: newYear.year,
      startDate: newYear.startDate,
      endDate: newYear.endDate,
      isCurrent: false,
      status: "upcoming",
    }
    setAcademicYears([...academicYears, newAcademicYear])
    setYearDialogOpen(false)
    setNewYear({ year: "", startDate: "", endDate: "" })
  }

  const handleEditYear = (year: AcademicYear) => {
    setEditingYear(year)
    setYearDialogOpen(true)
  }

  const handleSaveYearEdit = () => {
    if (editingYear) {
      setAcademicYears(academicYears.map((y) => (y.id === editingYear.id ? editingYear : y)))
      setEditingYear(null)
      setYearDialogOpen(false)
    }
  }

  const handleDeleteYear = (id: string) => {
    const year = academicYears.find((y) => y.id === id)
    if (year?.isCurrent) {
      alert("Cannot delete the current academic year. Please set another year as current first.")
      return
    }
    if (confirm("Are you sure you want to delete this academic year?")) {
      setAcademicYears(academicYears.filter((y) => y.id !== id))
    }
  }

  const handleSetCurrentYear = (id: string) => {
    setAcademicYears(
      academicYears.map((y) => ({
        ...y,
        isCurrent: y.id === id,
        status: y.id === id ? "active" : new Date(y.endDate) < new Date() ? "completed" : "upcoming",
      })),
    )
  }

  const handleSaveSettings = () => {
    alert("Settings saved successfully!")
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t("settings")}</h1>
        <p className="text-muted-foreground">Manage application preferences</p>
      </div>

      <div className="grid gap-6">
        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize the look and feel of the application</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Language */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Globe className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{t("language")}</p>
                  <p className="text-sm text-muted-foreground">Select your preferred language</p>
                </div>
              </div>
              <Select value={language} onValueChange={(v) => setLanguage(v as "en" | "si" | "ta")}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="si">සිංහල</SelectItem>
                  <SelectItem value="ta">தமிழ்</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Theme */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  {theme === "light" ? (
                    <Sun className="h-5 w-5 text-primary" />
                  ) : (
                    <Moon className="h-5 w-5 text-primary" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-foreground">{t("theme")}</p>
                  <p className="text-sm text-muted-foreground">Choose light or dark mode</p>
                </div>
              </div>
              <Select value={theme} onValueChange={(v) => setTheme(v as "light" | "dark")}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">{t("lightMode")}</SelectItem>
                  <SelectItem value="dark">{t("darkMode")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {isAdmin && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    {t("academicYear")} Management
                  </CardTitle>
                  <CardDescription>Configure academic years and set the current year</CardDescription>
                </div>
                <Dialog
                  open={yearDialogOpen && !editingYear}
                  onOpenChange={(open) => {
                    setYearDialogOpen(open)
                    if (!open) setEditingYear(null)
                  }}
                >
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Year
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Academic Year</DialogTitle>
                      <DialogDescription>Define a new academic year for the school</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Year</Label>
                        <Input
                          placeholder="e.g., 2025"
                          value={newYear.year}
                          onChange={(e) => setNewYear({ ...newYear, year: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Start Date</Label>
                          <Input
                            type="date"
                            value={newYear.startDate}
                            onChange={(e) => setNewYear({ ...newYear, startDate: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>End Date</Label>
                          <Input
                            type="date"
                            value={newYear.endDate}
                            onChange={(e) => setNewYear({ ...newYear, endDate: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setYearDialogOpen(false)}>
                        {t("cancel")}
                      </Button>
                      <Button
                        onClick={handleAddYear}
                        disabled={!newYear.year || !newYear.startDate || !newYear.endDate}
                      >
                        {t("add")}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Year</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Duration</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">{t("status")}</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Current</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">{t("actions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {academicYears
                      .sort((a, b) => b.year.localeCompare(a.year))
                      .map((year) => (
                        <tr key={year.id} className="border-b border-border last:border-0">
                          <td className="py-3 px-2">
                            <span className="font-medium text-foreground">{year.year}</span>
                          </td>
                          <td className="py-3 px-2 text-sm text-muted-foreground">
                            {new Date(year.startDate).toLocaleDateString()} -{" "}
                            {new Date(year.endDate).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-2">
                            <Badge
                              variant="secondary"
                              className={
                                year.status === "active"
                                  ? "bg-success text-success-foreground"
                                  : year.status === "upcoming"
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-secondary"
                              }
                            >
                              {year.status === "active"
                                ? "Active"
                                : year.status === "upcoming"
                                  ? "Upcoming"
                                  : "Completed"}
                            </Badge>
                          </td>
                          <td className="py-3 px-2">
                            {year.isCurrent ? (
                              <Badge className="bg-success text-success-foreground">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Current
                              </Badge>
                            ) : (
                              <Button size="sm" variant="outline" onClick={() => handleSetCurrentYear(year.id)}>
                                Set as Current
                              </Button>
                            )}
                          </td>
                          <td className="py-3 px-2">
                            <div className="flex gap-2">
                              <Button size="sm" variant="ghost" onClick={() => handleEditYear(year)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-destructive"
                                onClick={() => handleDeleteYear(year.id)}
                                disabled={year.isCurrent}
                              >
                                <Trash2 className="h-4 w-4" />
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
        )}

        <Dialog
          open={!!editingYear}
          onOpenChange={(open) => {
            if (!open) setEditingYear(null)
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Academic Year</DialogTitle>
              <DialogDescription>Update the academic year settings</DialogDescription>
            </DialogHeader>
            {editingYear && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Year</Label>
                  <Input
                    value={editingYear.year}
                    onChange={(e) => setEditingYear({ ...editingYear, year: e.target.value })}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      value={editingYear.startDate}
                      onChange={(e) => setEditingYear({ ...editingYear, startDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input
                      type="date"
                      value={editingYear.endDate}
                      onChange={(e) => setEditingYear({ ...editingYear, endDate: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingYear(null)}>
                {t("cancel")}
              </Button>
              <Button onClick={handleSaveYearEdit}>{t("save")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {isAdmin && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Grading System
                  </CardTitle>
                  <CardDescription>Configure the grading scale for marks evaluation</CardDescription>
                </div>
                <Dialog
                  open={gradeDialogOpen && !editingGrade}
                  onOpenChange={(open) => {
                    setGradeDialogOpen(open)
                    if (!open) setEditingGrade(null)
                  }}
                >
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Grade
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Grade</DialogTitle>
                      <DialogDescription>Define a new grade level for the grading scale</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Grade</Label>
                          <Input
                            placeholder="e.g., A+"
                            value={newGrade.grade}
                            onChange={(e) => setNewGrade({ ...newGrade, grade: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Input
                            placeholder="e.g., Excellent"
                            value={newGrade.description}
                            onChange={(e) => setNewGrade({ ...newGrade, description: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Minimum Marks (%)</Label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={newGrade.minMarks}
                            onChange={(e) =>
                              setNewGrade({ ...newGrade, minMarks: Number.parseInt(e.target.value) || 0 })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Maximum Marks (%)</Label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={newGrade.maxMarks}
                            onChange={(e) =>
                              setNewGrade({ ...newGrade, maxMarks: Number.parseInt(e.target.value) || 100 })
                            }
                          />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setGradeDialogOpen(false)}>
                        {t("cancel")}
                      </Button>
                      <Button onClick={handleAddGrade}>{t("add")}</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Grade</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Marks Range</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Description</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">{t("actions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gradeScale
                      .sort((a, b) => b.minMarks - a.minMarks)
                      .map((grade) => (
                        <tr key={grade.id} className="border-b border-border last:border-0">
                          <td className="py-3 px-2">
                            <Badge
                              variant="secondary"
                              className={
                                grade.grade.startsWith("A")
                                  ? "bg-success text-success-foreground"
                                  : grade.grade.startsWith("B")
                                    ? "bg-primary text-primary-foreground"
                                    : grade.grade.startsWith("C")
                                      ? "bg-warning text-warning-foreground"
                                      : grade.grade === "D"
                                        ? "bg-secondary"
                                        : "bg-destructive text-destructive-foreground"
                              }
                            >
                              {grade.grade}
                            </Badge>
                          </td>
                          <td className="py-3 px-2 text-sm text-foreground">
                            {grade.minMarks}% - {grade.maxMarks}%
                          </td>
                          <td className="py-3 px-2 text-sm text-muted-foreground">{grade.description}</td>
                          <td className="py-3 px-2">
                            <div className="flex gap-2">
                              <Button size="sm" variant="ghost" onClick={() => handleEditGrade(grade)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-destructive"
                                onClick={() => handleDeleteGrade(grade.id)}
                              >
                                <Trash2 className="h-4 w-4" />
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
        )}

        {/* Edit Grade Dialog */}
        <Dialog
          open={!!editingGrade}
          onOpenChange={(open) => {
            if (!open) setEditingGrade(null)
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Grade</DialogTitle>
              <DialogDescription>Update the grade settings</DialogDescription>
            </DialogHeader>
            {editingGrade && (
              <div className="space-y-4 py-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Grade</Label>
                    <Input
                      value={editingGrade.grade}
                      onChange={(e) => setEditingGrade({ ...editingGrade, grade: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input
                      value={editingGrade.description}
                      onChange={(e) => setEditingGrade({ ...editingGrade, description: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Minimum Marks (%)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={editingGrade.minMarks}
                      onChange={(e) =>
                        setEditingGrade({ ...editingGrade, minMarks: Number.parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Maximum Marks (%)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={editingGrade.maxMarks}
                      onChange={(e) =>
                        setEditingGrade({ ...editingGrade, maxMarks: Number.parseInt(e.target.value) || 100 })
                      }
                    />
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingGrade(null)}>
                {t("cancel")}
              </Button>
              <Button onClick={handleSaveGradeEdit}>{t("save")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>{t("notifications")}</CardTitle>
            <CardDescription>Configure how you receive notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Bell className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Push Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive push notifications in the app</p>
                </div>
              </div>
              <Switch defaultChecked />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive important updates via email</p>
                </div>
              </div>
              <Switch defaultChecked />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Smartphone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">SMS Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive critical alerts via SMS</p>
                </div>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* Notification Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
            <CardDescription>Choose what notifications you want to receive</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <Label htmlFor="notice-notif">New Notices & Announcements</Label>
              <Switch id="notice-notif" defaultChecked />
            </div>
            <div className="flex items-center justify-between py-2">
              <Label htmlFor="appointment-notif">Appointment Updates</Label>
              <Switch id="appointment-notif" defaultChecked />
            </div>
            <div className="flex items-center justify-between py-2">
              <Label htmlFor="marks-notif">Marks & Results Published</Label>
              <Switch id="marks-notif" defaultChecked />
            </div>
            <div className="flex items-center justify-between py-2">
              <Label htmlFor="attendance-notif">Attendance Alerts</Label>
              <Switch id="attendance-notif" defaultChecked />
            </div>
            <div className="flex items-center justify-between py-2">
              <Label htmlFor="exam-notif">Exam Reminders</Label>
              <Switch id="exam-notif" defaultChecked />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSaveSettings}>
            <Save className="h-4 w-4 mr-2" />
            {t("save")} {t("settings")}
          </Button>
        </div>
      </div>
    </div>
  )
}
