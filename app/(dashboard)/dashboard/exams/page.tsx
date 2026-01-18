"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useLanguage } from "@/lib/i18n/context"
import { useAuth } from "@/lib/auth/context"
import { apiRequest } from "@/lib/api/client"
import { Plus, Calendar, Clock, BookOpen, Loader2, AlertCircle, Edit, Trash2 } from "lucide-react"

interface Exam {
  id: string
  name: string
  type: string
  startDate: string
  endDate: string
  grades: string[]
  status: "upcoming" | "ongoing" | "completed"
}

export default function ExamsPage() {
  const { t } = useLanguage()
  const { user } = useAuth()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [exams, setExams] = useState<Exam[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [editingExam, setEditingExam] = useState<Exam | null>(null)
  const [newExam, setNewExam] = useState({
    name: "",
    type: "",
    startDate: "",
    endDate: "",
    grades: [] as string[],
  })
  const [selectedGrade, setSelectedGrade] = useState("")

  const isAdmin = user?.role === "admin"

  // Static list of grades from 6 to 13
  const availableGrades = Array.from({ length: 8 }, (_, i) => `Grade ${i + 6}`)

  useEffect(() => {
    fetchExams()
  }, [])

  const fetchExams = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await apiRequest('/exams')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || data.error?.message || 'Failed to fetch exams')
      }

      // Map backend types to frontend types
      const mappedExams = (data.data?.exams || []).map((exam: any) => ({
        ...exam,
        type: mapExamTypeToFrontend(exam.type),
      }))

      setExams(mappedExams)
    } catch (err: any) {
      console.error('Fetch exams error:', err)
      if (err.message.includes('Token refresh failed') || err.message.includes('login')) {
        setError("Session expired. Please login again.")
      } else {
        setError(err.message || 'Failed to load exams')
      }
    } finally {
      setIsLoading(false)
    }
  }


  // Map backend exam type to frontend format
  const mapExamTypeToFrontend = (type: string): string => {
    const mapping: Record<string, string> = {
      'first-term': 'firstTerm',
      'second-term': 'secondTerm',
      'third-term': 'thirdTerm',
      'monthly-test': 'monthlyTest',
      'quiz': 'quiz',
      'assignment': 'assignment',
    }
    return mapping[type] || type
  }

  // Map frontend exam type to backend format
  const mapExamTypeToBackend = (type: string): string => {
    const mapping: Record<string, string> = {
      'firstTerm': 'first-term',
      'secondTerm': 'second-term',
      'thirdTerm': 'third-term',
      'monthlyTest': 'monthly-test',
      'quiz': 'quiz',
      'assignment': 'assignment',
    }
    return mapping[type] || type
  }

  const handleAddExam = async () => {
    if (!newExam.name || !newExam.type || !newExam.startDate || !newExam.endDate) {
      setError("Please fill in all required fields")
      return
    }

    try {
      setIsSaving(true)
      setError(null)
      setSuccess(null)

      const grades = selectedGrade === "all" 
        ? ["All Grades"] 
        : selectedGrade 
          ? [selectedGrade] 
          : []

      const response = await apiRequest('/exams', {
        method: 'POST',
        body: JSON.stringify({
          name: newExam.name,
          type: mapExamTypeToBackend(newExam.type),
          startDate: newExam.startDate,
          endDate: newExam.endDate,
          grades,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || data.error?.message || 'Failed to create exam')
      }

      setSuccess("Exam created successfully!")
      setDialogOpen(false)
      setNewExam({ name: "", type: "", startDate: "", endDate: "", grades: [] })
      setSelectedGrade("")
      await fetchExams()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      console.error('Create exam error:', err)
      setError(err.message || 'Failed to create exam')
    } finally {
      setIsSaving(false)
    }
  }

  const handleEditExam = (exam: Exam) => {
    setEditingExam(exam)
    setNewExam({
      name: exam.name,
      type: exam.type,
      startDate: exam.startDate,
      endDate: exam.endDate,
      grades: exam.grades,
    })
    setSelectedGrade(exam.grades.length > 0 ? exam.grades[0] : "")
    setEditDialogOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editingExam || !newExam.name || !newExam.type || !newExam.startDate || !newExam.endDate) {
      setError("Please fill in all required fields")
      return
    }

    try {
      setIsSaving(true)
      setError(null)
      setSuccess(null)

      const grades = selectedGrade === "all" 
        ? ["All Grades"] 
        : selectedGrade 
          ? [selectedGrade] 
          : []

      const response = await apiRequest(`/exams/${editingExam.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: newExam.name,
          type: mapExamTypeToBackend(newExam.type),
          startDate: newExam.startDate,
          endDate: newExam.endDate,
          grades,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || data.error?.message || 'Failed to update exam')
      }

      setSuccess("Exam updated successfully!")
      setEditDialogOpen(false)
      setEditingExam(null)
      setNewExam({ name: "", type: "", startDate: "", endDate: "", grades: [] })
      setSelectedGrade("")
      await fetchExams()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      console.error('Update exam error:', err)
      setError(err.message || 'Failed to update exam')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteExam = async (id: string) => {
    if (!confirm("Are you sure you want to delete this exam?")) {
      return
    }

    try {
      setIsDeleting(id)
      setError(null)

      const response = await apiRequest(`/exams/${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || data.error?.message || 'Failed to delete exam')
      }

      setSuccess("Exam deleted successfully!")
      await fetchExams()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      console.error('Delete exam error:', err)
      setError(err.message || 'Failed to delete exam')
    } finally {
      setIsDeleting(null)
    }
  }


  const getStatusBadge = (status: string) => {
    switch (status) {
      case "upcoming":
        return <Badge variant="secondary">Upcoming</Badge>
      case "ongoing":
        return <Badge className="bg-warning text-warning-foreground">Ongoing</Badge>
      case "completed":
        return <Badge variant="outline">Completed</Badge>
      default:
        return null
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "firstTerm":
        return <Badge className="bg-primary">{t("firstTerm")}</Badge>
      case "secondTerm":
        return <Badge className="bg-primary">{t("secondTerm")}</Badge>
      case "thirdTerm":
        return <Badge className="bg-destructive">{t("thirdTerm")}</Badge>
      case "monthlyTest":
        return <Badge className="bg-warning text-warning-foreground">{t("monthlyTest")}</Badge>
      case "quiz":
        return <Badge variant="secondary">{t("quiz")}</Badge>
      case "assignment":
        return <Badge variant="outline">{t("assignment")}</Badge>
      default:
        return null
    }
  }

  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("exams")}</h1>
          <p className="text-muted-foreground">View examinations and assessments</p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12 text-muted-foreground">
              You don't have permission to manage exams. Only administrators can create and edit exams.
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("exams")}</h1>
          <p className="text-muted-foreground">Manage examinations and assessments</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Exam
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Exam</DialogTitle>
              <DialogDescription>Schedule a new examination or assessment</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>{t("examName")}</Label>
                <Input 
                  placeholder="e.g., First Term Examination 2024" 
                  value={newExam.name}
                  onChange={(e) => setNewExam({ ...newExam, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("examType")}</Label>
                <Select value={newExam.type} onValueChange={(value) => setNewExam({ ...newExam, type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="firstTerm">{t("firstTerm")}</SelectItem>
                    <SelectItem value="secondTerm">{t("secondTerm")}</SelectItem>
                    <SelectItem value="thirdTerm">{t("thirdTerm")}</SelectItem>
                    <SelectItem value="monthlyTest">{t("monthlyTest")}</SelectItem>
                    <SelectItem value="quiz">{t("quiz")}</SelectItem>
                    <SelectItem value="assignment">{t("assignment")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input 
                    type="date" 
                    value={newExam.startDate}
                    onChange={(e) => setNewExam({ ...newExam, startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input 
                    type="date" 
                    value={newExam.endDate}
                    onChange={(e) => setNewExam({ ...newExam, endDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Applicable Grades</Label>
                <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select grades" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Grades</SelectItem>
                    {availableGrades.map((grade) => (
                      <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setDialogOpen(false)
                setNewExam({ name: "", type: "", startDate: "", endDate: "", grades: [] })
                setSelectedGrade("")
              }}>
                {t("cancel")}
              </Button>
              <Button onClick={handleAddExam} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  t("add")
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert className="bg-success/10 border-success">
          <AlertCircle className="h-4 w-4 text-success" />
          <AlertDescription className="text-success">{success}</AlertDescription>
        </Alert>
      )}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t("upcomingExams")}</p>
                <p className="text-2xl font-bold text-foreground">
                  {exams.filter((e) => e.status === "upcoming").length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-primary/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ongoing</p>
                <p className="text-2xl font-bold text-warning">
                  {exams.filter((e) => e.status === "ongoing").length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-warning/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-foreground">
                  {exams.filter((e) => e.status === "completed").length}
                </p>
              </div>
              <BookOpen className="h-8 w-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Exams List */}
      <Card>
        <CardHeader>
          <CardTitle>All Examinations</CardTitle>
          <CardDescription>View and manage all scheduled examinations</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : exams.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No exams found. Create your first exam to get started.
            </div>
          ) : (
            <div className="space-y-4">
              {exams.map((exam) => (
                <div key={exam.id} className="flex items-center justify-between p-4 rounded-lg border border-border">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">{exam.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {exam.startDate} {exam.startDate !== exam.endDate && `- ${exam.endDate}`}
                        </span>
                      </div>
                      <div className="flex gap-1 mt-2">
                        {exam.grades.map((grade, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {grade}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getTypeBadge(exam.type)}
                    {getStatusBadge(exam.status)}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditExam(exam)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteExam(exam.id)}
                      disabled={isDeleting === exam.id}
                    >
                      {isDeleting === exam.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Exam</DialogTitle>
            <DialogDescription>Update examination details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t("examName")}</Label>
              <Input 
                placeholder="e.g., First Term Examination 2024" 
                value={newExam.name}
                onChange={(e) => setNewExam({ ...newExam, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("examType")}</Label>
              <Select value={newExam.type} onValueChange={(value) => setNewExam({ ...newExam, type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="firstTerm">{t("firstTerm")}</SelectItem>
                  <SelectItem value="secondTerm">{t("secondTerm")}</SelectItem>
                  <SelectItem value="thirdTerm">{t("thirdTerm")}</SelectItem>
                  <SelectItem value="monthlyTest">{t("monthlyTest")}</SelectItem>
                  <SelectItem value="quiz">{t("quiz")}</SelectItem>
                  <SelectItem value="assignment">{t("assignment")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input 
                  type="date" 
                  value={newExam.startDate}
                  onChange={(e) => setNewExam({ ...newExam, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input 
                  type="date" 
                  value={newExam.endDate}
                  onChange={(e) => setNewExam({ ...newExam, endDate: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Applicable Grades</Label>
              <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                <SelectTrigger>
                  <SelectValue placeholder="Select grades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Grades</SelectItem>
                  {availableGrades.map((grade) => (
                    <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setEditDialogOpen(false)
              setEditingExam(null)
              setNewExam({ name: "", type: "", startDate: "", endDate: "", grades: [] })
              setSelectedGrade("")
            }}>
              {t("cancel")}
            </Button>
            <Button onClick={handleSaveEdit} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
