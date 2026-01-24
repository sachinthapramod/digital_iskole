"use client"

import type React from "react"

import { useMemo, useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
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
import { apiRequest } from "@/lib/api/client"
import { Save, Search, FileText, Upload, Eye, Download, X, File, ImageIcon, Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

const mockExams = [
  { id: "1", name: "First Term Examination 2024", type: "firstTerm", date: "2024-04-15" },
  { id: "2", name: "Second Term Examination 2024", type: "secondTerm", date: "2024-08-15" },
  { id: "3", name: "Third Term Examination 2024", type: "thirdTerm", date: "2024-12-15" },
  { id: "4", name: "Monthly Test - November", type: "monthlyTest", date: "2024-11-20" },
  { id: "5", name: "Science Quiz 1", type: "quiz", date: "2024-10-20" },
  { id: "6", name: "Mathematics Assignment 1", type: "assignment", date: "2024-10-25" },
]

const mockStudentsMarks = [
  { id: "1", name: "Kasun Perera", rollNo: "001", marks: 85, total: 100, examPaper: null as string | null },
  {
    id: "2",
    name: "Nimali Silva",
    rollNo: "002",
    marks: 92,
    total: 100,
    examPaper: "/placeholder.svg?height=800&width=600",
  },
  { id: "3", name: "Amal Fernando", rollNo: "003", marks: 78, total: 100, examPaper: null },
  {
    id: "4",
    name: "Sithara Jayawardena",
    rollNo: "004",
    marks: 88,
    total: 100,
    examPaper: "/placeholder.svg?height=800&width=600",
  },
  { id: "5", name: "Dinesh Kumar", rollNo: "005", marks: 65, total: 100, examPaper: null },
  {
    id: "6",
    name: "Priya Mendis",
    rollNo: "006",
    marks: 95,
    total: 100,
    examPaper: "/placeholder.svg?height=800&width=600",
  },
  { id: "7", name: "Ruwan Bandara", rollNo: "007", marks: 72, total: 100, examPaper: null },
  { id: "8", name: "Malini Rathnayake", rollNo: "008", marks: 81, total: 100, examPaper: null },
]

function getGrade(marks: number, total: number): string {
  const percentage = (marks / total) * 100
  if (percentage >= 90) return "A+"
  if (percentage >= 80) return "A"
  if (percentage >= 75) return "B+"
  if (percentage >= 70) return "B"
  if (percentage >= 65) return "C+"
  if (percentage >= 60) return "C"
  if (percentage >= 50) return "D"
  return "F"
}

function getGradeColor(grade: string): string {
  if (grade.startsWith("A")) return "bg-success text-success-foreground"
  if (grade.startsWith("B")) return "bg-primary text-primary-foreground"
  if (grade.startsWith("C")) return "bg-warning text-warning-foreground"
  return "bg-destructive text-destructive-foreground"
}

// Component to view exam paper
function ExamPaperViewer({
  paperUrl,
  studentName,
  subject,
}: { paperUrl: string; studentName: string; subject?: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1 bg-transparent">
          <Eye className="h-4 w-4" />
          View Paper
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Exam Paper - {studentName}</DialogTitle>
          <DialogDescription>{subject ? `${subject} - ` : ""}Scanned exam paper softcopy</DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <div className="border rounded-lg overflow-hidden bg-muted/30">
            <img src={paperUrl || "/placeholder.svg"} alt={`Exam paper for ${studentName}`} className="w-full h-auto" />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" asChild>
              <a href={paperUrl} download={`exam-paper-${studentName.toLowerCase().replace(/\s+/g, "-")}.pdf`}>
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

// Component for uploading exam paper
function ExamPaperUploader({
  studentId,
  studentName,
  currentPaper,
  onUpload,
}: {
  studentId: string
  studentName: string
  currentPaper: string | null
  onUpload: (studentId: string, file: File | null) => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(currentPaper)
  const [fileName, setFileName] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFileName(file.name)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      onUpload(studentId, file)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    setFileName(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    onUpload(studentId, null)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1 bg-transparent">
          {currentPaper ? (
            <>
              <Eye className="h-4 w-4" />
              View/Edit
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Upload
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Exam Paper - {studentName}</DialogTitle>
          <DialogDescription>Upload or view the scanned exam paper softcopy</DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          {preview ? (
            <div className="space-y-4">
              <div className="border rounded-lg overflow-hidden bg-muted/30 relative">
                <img
                  src={preview || "/placeholder.svg"}
                  alt={`Exam paper for ${studentName}`}
                  className="w-full h-auto max-h-[400px] object-contain"
                />
                <Button variant="destructive" size="icon" className="absolute top-2 right-2" onClick={handleRemove}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              {fileName && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <File className="h-4 w-4" />
                  {fileName}
                </div>
              )}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 bg-transparent"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Replace
                </Button>
                <Button variant="outline" asChild className="flex-1 bg-transparent">
                  <a href={preview} download={`exam-paper-${studentName.toLowerCase().replace(/\s+/g, "-")}.pdf`}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </a>
                </Button>
              </div>
            </div>
          ) : (
            <div
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="flex flex-col items-center gap-2">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                  <ImageIcon className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">Click to upload exam paper</p>
                  <p className="text-sm text-muted-foreground">Supports: JPG, PNG, PDF (max 10MB)</p>
                </div>
              </div>
            </div>
          )}
          <input ref={fileInputRef} type="file" accept="image/*,.pdf" className="hidden" onChange={handleFileChange} />
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface Exam {
  id: string
  name: string
  type: string
  startDate: string
  endDate: string
}

interface Class {
  id: string
  name: string
  grade: string
}

interface Subject {
  id: string
  name: string
  code: string
}

interface Student {
  id: string
  name: string
  rollNo: string
  admissionNumber: string
}

interface ParentChild {
  id: string
  name: string
  className: string
}

interface ParentMark {
  id: string
  studentId: string
  studentName: string
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
  updatedAt?: string
}

export default function MarksPage() {
  const { t } = useLanguage()
  const { user } = useAuth()
  const [selectedExam, setSelectedExam] = useState("")
  const [selectedClass, setSelectedClass] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("")
  const [totalMarks, setTotalMarks] = useState(100)
  const [searchQuery, setSearchQuery] = useState("")
  const [marks, setMarks] = useState<Record<string, number>>({})
  const [remarks, setRemarks] = useState<Record<string, string>>({})
  const [examPapers, setExamPapers] = useState<Record<string, string | null>>({})
  
  const [exams, setExams] = useState<Exam[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [existingMarks, setExistingMarks] = useState<Record<string, any>>({})
  
  // View marks state
  const [viewExam, setViewExam] = useState("")
  const [viewClass, setViewClass] = useState("")
  const [viewSubject, setViewSubject] = useState("")
  const [viewMarks, setViewMarks] = useState<any[]>([])
  const [isLoadingViewMarks, setIsLoadingViewMarks] = useState(false)
  
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingStudents, setIsLoadingStudents] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const isTeacherOrAdmin = user?.role === "teacher" || user?.role === "admin"

  // Parent view state
  const [parentChildren, setParentChildren] = useState<ParentChild[]>([])
  const [selectedParentChildId, setSelectedParentChildId] = useState<string>("")
  const [parentMarks, setParentMarks] = useState<ParentMark[]>([])
  const [selectedParentExamId, setSelectedParentExamId] = useState<string>("all")
  const [isLoadingParent, setIsLoadingParent] = useState(false)
  const [isLoadingParentMarks, setIsLoadingParentMarks] = useState(false)
  const [parentError, setParentError] = useState<string | null>(null)

  useEffect(() => {
    if (isTeacherOrAdmin) {
      fetchExams()
      fetchClasses()
      fetchSubjects()
    }
  }, [isTeacherOrAdmin])

  useEffect(() => {
    if (selectedClass && selectedExam && selectedSubject) {
      fetchStudents()
      fetchExistingMarks()
    }
  }, [selectedClass, selectedExam, selectedSubject])

  useEffect(() => {
    if (user?.role !== "parent") return

    let cancelled = false

    async function fetchParentChildren() {
      try {
        setIsLoadingParent(true)
        setParentError(null)

        const response = await apiRequest("/users/parents/me/children")
        const data = await response.json().catch(() => ({}))

        if (!response.ok || data?.success === false) {
          throw new Error(data?.error?.message || data?.message || "Failed to load children")
        }

        const children = (data.data?.children || []) as ParentChild[]

        if (!cancelled) {
          setParentChildren(children)
          setSelectedParentChildId((prev) => prev || children[0]?.id || "")
        }
      } catch (e: any) {
        if (!cancelled) {
          setParentError(e?.message || "Failed to load children")
          setParentChildren([])
          setSelectedParentChildId("")
        }
      } finally {
        if (!cancelled) setIsLoadingParent(false)
      }
    }

    fetchParentChildren()
    return () => {
      cancelled = true
    }
  }, [user?.role])

  useEffect(() => {
    if (user?.role !== "parent") return

    if (!selectedParentChildId) {
      setParentMarks([])
      return
    }

    let cancelled = false

    async function fetchParentMarks() {
      try {
        setIsLoadingParentMarks(true)
        setParentError(null)

        const response = await apiRequest(`/marks/student/${selectedParentChildId}`)
        const data = await response.json().catch(() => ({}))

        if (!response.ok || data?.success === false) {
          throw new Error(data?.error?.message || data?.message || "Failed to load marks")
        }

        const marks = (data.data?.marks || []) as ParentMark[]
        marks.sort(
          (a, b) => new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime()
        )

        if (!cancelled) {
          setParentMarks(marks)
          setSelectedParentExamId("all")
        }
      } catch (e: any) {
        if (!cancelled) {
          setParentError(e?.message || "Failed to load marks")
          setParentMarks([])
        }
      } finally {
        if (!cancelled) setIsLoadingParentMarks(false)
      }
    }

    fetchParentMarks()
    return () => {
      cancelled = true
    }
  }, [selectedParentChildId, user?.role])

  const parentExamOptions = useMemo(() => {
    const map = new Map<string, string>()
    for (const m of parentMarks) {
      if (m.examId) map.set(m.examId, m.examName || "Exam")
    }
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }))
  }, [parentMarks])

  const filteredParentMarks = useMemo(() => {
    const filtered =
      selectedParentExamId === "all" ? parentMarks : parentMarks.filter((m) => m.examId === selectedParentExamId)
    return filtered.slice().sort((a, b) => {
      const aT = new Date(a.updatedAt || a.createdAt || 0).getTime()
      const bT = new Date(b.updatedAt || b.createdAt || 0).getTime()
      return bT - aT
    })
  }, [parentMarks, selectedParentExamId])

  const parentSummary = useMemo(() => {
    const totalObtained = filteredParentMarks.reduce((sum, m) => sum + (m.marks || 0), 0)
    const totalPossible = filteredParentMarks.reduce((sum, m) => sum + (m.totalMarks || 0), 0)
    const percent = totalPossible > 0 ? Math.round((totalObtained / totalPossible) * 1000) / 10 : 0
    const avgPercent =
      filteredParentMarks.length > 0
        ? Math.round(
            filteredParentMarks.reduce((sum, m) => sum + (typeof m.percentage === "number" ? m.percentage : 0), 0) /
              filteredParentMarks.length
          )
        : 0
    const avgGrade = filteredParentMarks.length > 0 ? getGrade(avgPercent, 100) : "-"
    return { totalObtained, totalPossible, percent, avgPercent, avgGrade }
  }, [filteredParentMarks])

  const fetchExams = async () => {
    try {
      const response = await apiRequest('/exams')
      const data = await response.json()
      if (response.ok) {
        setExams(data.data?.exams || [])
      }
    } catch (err: any) {
      console.error('Fetch exams error:', err)
    }
  }

  const fetchClasses = async () => {
    try {
      const response = await apiRequest('/academic/classes')
      const data = await response.json()
      if (response.ok) {
        setClasses(data.data?.classes || [])
      }
    } catch (err: any) {
      console.error('Fetch classes error:', err)
    }
  }

  const fetchSubjects = async () => {
    try {
      const response = await apiRequest('/academic/subjects')
      const data = await response.json()
      if (response.ok) {
        setSubjects(data.data?.subjects || [])
      }
    } catch (err: any) {
      console.error('Fetch subjects error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchStudents = async () => {
    try {
      setIsLoadingStudents(true)
      const response = await apiRequest(`/marks/students?className=${encodeURIComponent(selectedClass)}`)
      const data = await response.json()
      if (response.ok) {
        const studentsList = data.data?.students || []
        setStudents(studentsList)
        // Initialize marks with 0 for all students
        const initialMarks: Record<string, number> = {}
        studentsList.forEach((student: Student) => {
          initialMarks[student.id] = 0
        })
        setMarks(initialMarks)
      }
    } catch (err: any) {
      console.error('Fetch students error:', err)
      setError('Failed to load students')
    } finally {
      setIsLoadingStudents(false)
    }
  }

  const fetchExistingMarks = async () => {
    try {
      const response = await apiRequest(`/marks/exam/${selectedExam}?className=${encodeURIComponent(selectedClass)}&subjectId=${selectedSubject}`)
      const data = await response.json()
      if (response.ok) {
        const marksList = data.data?.marks || []
        const marksMap: Record<string, any> = {}
        const marksValues: Record<string, number> = {}
        const remarksMap: Record<string, string> = {}
        
        marksList.forEach((mark: any) => {
          marksMap[mark.studentId] = mark
          marksValues[mark.studentId] = mark.marks
          remarksMap[mark.studentId] = mark.remarks || ''
        })
        
        setExistingMarks(marksMap)
        setMarks((prev) => ({ ...prev, ...marksValues }))
        setRemarks(remarksMap)
      }
    } catch (err: any) {
      console.error('Fetch existing marks error:', err)
    }
  }

  const fetchViewMarks = async () => {
    if (!viewExam || !viewClass || !viewSubject) {
      setViewMarks([])
      return
    }

    try {
      setIsLoadingViewMarks(true)
      setError(null)

      // Fetch students for the class to get roll numbers
      const studentsResponse = await apiRequest(`/marks/students?className=${encodeURIComponent(viewClass)}`)
      const studentsData = await studentsResponse.json()
      if (studentsResponse.ok) {
        setStudents(studentsData.data?.students || [])
      }

      // Fetch marks
      const response = await apiRequest(`/marks/exam/${viewExam}?className=${encodeURIComponent(viewClass)}&subjectId=${viewSubject}`)
      const data = await response.json()

      if (response.ok) {
        const marksList = data.data?.marks || []
        // Sort by student name
        marksList.sort((a: any, b: any) => a.studentName.localeCompare(b.studentName))
        setViewMarks(marksList)
      } else {
        setError(data.message || 'Failed to fetch marks')
        setViewMarks([])
      }
    } catch (err: any) {
      console.error('Fetch view marks error:', err)
      setError(err.message || 'Failed to fetch marks')
      setViewMarks([])
    } finally {
      setIsLoadingViewMarks(false)
    }
  }

  useEffect(() => {
    if (viewExam && viewClass && viewSubject) {
      fetchViewMarks()
    } else {
      setViewMarks([])
    }
  }, [viewExam, viewClass, viewSubject])

  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.rollNo.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleMarksChange = (studentId: string, value: string) => {
    const numValue = Number.parseInt(value) || 0
    setMarks((prev) => ({ ...prev, [studentId]: Math.min(totalMarks, Math.max(0, numValue)) }))
  }

  const handleRemarksChange = (studentId: string, value: string) => {
    setRemarks((prev) => ({ ...prev, [studentId]: value }))
  }

  const handleExamPaperUpload = (studentId: string, file: File | null) => {
    if (file) {
      // In real app, this would upload to storage and get URL
      const fakeUrl = URL.createObjectURL(file)
      setExamPapers((prev) => ({ ...prev, [studentId]: fakeUrl }))
    } else {
      setExamPapers((prev) => ({ ...prev, [studentId]: null }))
    }
  }

  const handleSave = async () => {
    if (!selectedExam || !selectedClass || !selectedSubject) {
      setError("Please select exam, class, and subject")
      return
    }

    const marksToSave = filteredStudents
      .filter(student => marks[student.id] !== undefined && marks[student.id] > 0)
      .map(student => ({
        studentId: student.id,
        studentName: student.name,
        admissionNumber: student.rollNo,
        marks: marks[student.id],
        remarks: remarks[student.id] || '',
      }))

    if (marksToSave.length === 0) {
      setError("Please enter marks for at least one student")
      return
    }

    try {
      setIsSaving(true)
      setError(null)
      setSuccess(null)

      const selectedExamData = exams.find(e => e.id === selectedExam)
      const selectedSubjectData = subjects.find(s => s.id === selectedSubject)

      const response = await apiRequest('/marks/enter', {
        method: 'POST',
        body: JSON.stringify({
          examId: selectedExam,
          examName: selectedExamData?.name || 'Unknown Exam',
          className: selectedClass,
          subjectId: selectedSubject,
          subjectName: selectedSubjectData?.name || 'Unknown Subject',
          totalMarks,
          marks: marksToSave,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || data.error?.message || 'Failed to save marks')
      }

      setSuccess(`Marks saved successfully for ${data.data?.marked || marksToSave.length} students!`)
      await fetchExistingMarks()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      console.error('Save marks error:', err)
      setError(err.message || 'Failed to save marks')
    } finally {
      setIsSaving(false)
    }
  }

  // Parent view
  if (user?.role === "parent") {
    const selectedChild = parentChildren.find((c) => c.id === selectedParentChildId) || null
    const selectedExamName =
      selectedParentExamId === "all"
        ? "All Exams"
        : parentExamOptions.find((e) => e.id === selectedParentExamId)?.name || "Exam"

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("marks")}</h1>
          <p className="text-muted-foreground">{t("viewMarks")}</p>
        </div>

        {/* Child selector for parents with multiple children */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Select Child</Label>
                <Select value={selectedParentChildId} onValueChange={(v) => setSelectedParentChildId(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder={isLoadingParent ? "Loading..." : "Select child"} />
                  </SelectTrigger>
                  <SelectContent>
                    {parentChildren.map((child) => (
                      <SelectItem key={child.id} value={child.id}>
                        {child.name} - {child.className}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("examName")}</Label>
                <Select value={selectedParentExamId} onValueChange={setSelectedParentExamId}>
                  <SelectTrigger>
                    <SelectValue placeholder={isLoadingParentMarks ? "Loading..." : "All exams"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All exams</SelectItem>
                    {parentExamOptions.map((exam) => (
                      <SelectItem key={exam.id} value={exam.id}>
                        {exam.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {parentError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{parentError}</AlertDescription>
          </Alert>
        )}

        {isLoadingParent && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {!isLoadingParent && parentChildren.length === 0 && !parentError && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8 text-muted-foreground">No children linked to this parent account.</div>
            </CardContent>
          </Card>
        )}

        {/* Marks Summary */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-sm text-muted-foreground">{t("totalMarks")}</p>
              <p className="text-3xl font-bold text-foreground">
                {parentSummary.totalObtained}/{parentSummary.totalPossible}
              </p>
              <p className="text-sm text-muted-foreground">{parentSummary.percent}%</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-sm text-muted-foreground">Average Grade</p>
              <p className="text-3xl font-bold text-primary">{parentSummary.avgGrade}</p>
              <p className="text-sm text-muted-foreground">{parentSummary.avgPercent}%</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-sm text-muted-foreground">Class Rank</p>
              <p className="text-3xl font-bold text-foreground">-</p>
              <p className="text-sm text-muted-foreground">Not available</p>
            </CardContent>
          </Card>
        </div>

        {/* Marks table */}
        <Card>
          <CardHeader>
            <CardTitle>
              {t("marks")} - {selectedExamName}
            </CardTitle>
            <CardDescription>
              {selectedChild ? `Subject-wise performance for ${selectedChild.name}` : "Subject-wise performance"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingParentMarks ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredParentMarks.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">No marks available yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Subject</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">{t("examName")}</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                        {t("obtainedMarks")}
                      </th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">{t("percentage")}</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">{t("gradeLabel")}</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Exam Paper</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredParentMarks.map((mark) => {
                      const pct =
                        typeof mark.percentage === "number"
                          ? Math.round(mark.percentage * 10) / 10
                          : mark.totalMarks
                            ? Math.round((mark.marks / mark.totalMarks) * 1000) / 10
                            : 0

                      return (
                        <tr key={mark.id} className="border-b border-border last:border-0">
                          <td className="py-3 px-2">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <FileText className="h-4 w-4 text-primary" />
                              </div>
                              <span className="text-sm font-medium text-foreground">{mark.subjectName}</span>
                            </div>
                          </td>
                          <td className="py-3 px-2 text-sm text-muted-foreground">{mark.examName}</td>
                          <td className="py-3 px-2 text-sm text-foreground">
                            {mark.marks}/{mark.totalMarks}
                          </td>
                          <td className="py-3 px-2 text-sm text-foreground">{pct}%</td>
                          <td className="py-3 px-2">
                            <Badge className={getGradeColor(mark.grade)}>{mark.grade}</Badge>
                          </td>
                          <td className="py-3 px-2">
                            {mark.examPaperUrl ? (
                              <ExamPaperViewer
                                paperUrl={mark.examPaperUrl}
                                studentName={mark.studentName || selectedChild?.name || "Student"}
                                subject={mark.subjectName}
                              />
                            ) : (
                              <span className="text-sm text-muted-foreground">Not available</span>
                            )}
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
      </div>
    )
  }

  // Teacher/Admin view
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("marks")}</h1>
          <p className="text-muted-foreground">{t("enterMarks")}</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving || !selectedExam || !selectedClass || !selectedSubject}>
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

      <Tabs defaultValue="enter" className="space-y-4">
        <TabsList>
          <TabsTrigger value="enter">{t("enterMarks")}</TabsTrigger>
          <TabsTrigger value="view">{t("viewMarks")}</TabsTrigger>
        </TabsList>

        <TabsContent value="enter" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid gap-4 sm:grid-cols-4">
                <div className="space-y-2">
                  <Label>{t("examName")}</Label>
                  <Select value={selectedExam} onValueChange={setSelectedExam}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select exam" />
                    </SelectTrigger>
                    <SelectContent>
                      {exams.map((exam) => (
                        <SelectItem key={exam.id} value={exam.id}>
                          {exam.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t("className")}</Label>
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
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
                </div>
                <div className="space-y-2">
                  <Label>{t("subjectName")}</Label>
                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Total Marks</Label>
                  <Input
                    type="number"
                    min="1"
                    value={totalMarks}
                    onChange={(e) => setTotalMarks(Number.parseInt(e.target.value) || 100)}
                    className="w-full"
                  />
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

          {/* Marks Entry Table with Exam Paper Upload */}
          {selectedExam && selectedClass && selectedSubject ? (
            <Card>
              <CardHeader>
                <CardTitle>
                  {exams.find(e => e.id === selectedExam)?.name || 'Exam'} - {subjects.find(s => s.id === selectedSubject)?.name || 'Subject'}
                </CardTitle>
                <CardDescription>
                  {selectedClass} ({filteredStudents.length} students) - Total: {totalMarks} marks
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingStudents ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredStudents.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    No students found in this class.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Roll No</th>
                          <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Name</th>
                          <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                            {t("obtainedMarks")}
                          </th>
                          <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                            {t("percentage")}
                          </th>
                          <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                            {t("gradeLabel")}
                          </th>
                          <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Remarks</th>
                          <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Exam Paper</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredStudents.map((student) => {
                          const studentMarks = marks[student.id] || 0
                          const percentage = totalMarks > 0 ? Math.round((studentMarks / totalMarks) * 100) : 0
                          const grade = getGrade(studentMarks, totalMarks)
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
                                <Input
                                  type="number"
                                  min="0"
                                  max={totalMarks}
                                  value={studentMarks}
                                  onChange={(e) => handleMarksChange(student.id, e.target.value)}
                                  className="w-20"
                                />
                              </td>
                              <td className="py-3 px-2 text-sm text-foreground">{percentage}%</td>
                              <td className="py-3 px-2">
                                <Badge className={getGradeColor(grade)}>{grade}</Badge>
                              </td>
                              <td className="py-3 px-2">
                                <Input
                                  type="text"
                                  placeholder="Remarks..."
                                  value={remarks[student.id] || ''}
                                  onChange={(e) => handleRemarksChange(student.id, e.target.value)}
                                  className="w-32"
                                />
                              </td>
                              <td className="py-3 px-2">
                                <ExamPaperUploader
                                  studentId={student.id}
                                  studentName={student.name}
                                  currentPaper={examPapers[student.id]}
                                  onUpload={handleExamPaperUpload}
                                />
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
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12 text-muted-foreground">
                  Please select exam, class, and subject to enter marks.
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="view" className="space-y-4">
          {/* Filters for View Marks */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label>{t("examName")}</Label>
                  <Select value={viewExam} onValueChange={setViewExam}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select exam" />
                    </SelectTrigger>
                    <SelectContent>
                      {exams.map((exam) => (
                        <SelectItem key={exam.id} value={exam.id}>
                          {exam.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t("className")}</Label>
                  <Select value={viewClass} onValueChange={setViewClass}>
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
                </div>
                <div className="space-y-2">
                  <Label>{t("subjectName")}</Label>
                  <Select value={viewSubject} onValueChange={setViewSubject}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Marks Summary Statistics */}
          {viewMarks.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-4">
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-sm text-muted-foreground">Total Students</p>
                  <p className="text-2xl font-bold text-foreground">{viewMarks.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-sm text-muted-foreground">Average Marks</p>
                  <p className="text-2xl font-bold text-primary">
                    {viewMarks.length > 0
                      ? Math.round(
                          (viewMarks.reduce((sum, m) => sum + m.marks, 0) / viewMarks.length) * 100
                        ) / 100
                      : 0}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-sm text-muted-foreground">Average Percentage</p>
                  <p className="text-2xl font-bold text-primary">
                    {viewMarks.length > 0
                      ? Math.round(
                          (viewMarks.reduce((sum, m) => sum + m.percentage, 0) / viewMarks.length) * 100
                        ) / 100
                      : 0}%
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-sm text-muted-foreground">Pass Rate</p>
                  <p className="text-2xl font-bold text-success">
                    {viewMarks.length > 0
                      ? Math.round(
                          (viewMarks.filter((m) => m.grade !== 'F').length / viewMarks.length) * 100
                        )
                      : 0}%
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Marks Table */}
          {viewExam && viewClass && viewSubject ? (
            <Card>
              <CardHeader>
                <CardTitle>
                  {exams.find(e => e.id === viewExam)?.name || 'Exam'} - {subjects.find(s => s.id === viewSubject)?.name || 'Subject'}
                </CardTitle>
                <CardDescription>
                  {viewClass} - View all submitted marks
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingViewMarks ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : viewMarks.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    No marks found for the selected exam, class, and subject.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Roll No</th>
                          <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Name</th>
                          <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                            {t("obtainedMarks")}
                          </th>
                          <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                            {t("percentage")}
                          </th>
                          <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                            {t("gradeLabel")}
                          </th>
                          <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Remarks</th>
                          <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Entered By</th>
                        </tr>
                      </thead>
                      <tbody>
                        {viewMarks.map((mark) => (
                          <tr key={mark.id} className="border-b border-border last:border-0">
                            <td className="py-3 px-2 text-sm text-muted-foreground">
                              {students.find(s => s.id === mark.studentId)?.rollNo || 'N/A'}
                            </td>
                            <td className="py-3 px-2">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                                  {mark.studentName.charAt(0)}
                                </div>
                                <span className="text-sm text-foreground">{mark.studentName}</span>
                              </div>
                            </td>
                            <td className="py-3 px-2 text-sm text-foreground">
                              {mark.marks}/{mark.totalMarks}
                            </td>
                            <td className="py-3 px-2 text-sm text-foreground">{mark.percentage}%</td>
                            <td className="py-3 px-2">
                              <Badge className={getGradeColor(mark.grade)}>{mark.grade}</Badge>
                            </td>
                            <td className="py-3 px-2 text-sm text-muted-foreground">
                              {mark.remarks || '-'}
                            </td>
                            <td className="py-3 px-2 text-sm text-muted-foreground">
                              {mark.enteredByName || 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12 text-muted-foreground">
                  Please select exam, class, and subject to view marks.
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
