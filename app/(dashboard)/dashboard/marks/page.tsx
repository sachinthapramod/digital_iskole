"use client"

import type React from "react"

import { useState, useRef } from "react"
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
import { Save, Search, FileText, Upload, Eye, Download, X, File, ImageIcon } from "lucide-react"

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

// For parent view - mock children's marks with exam papers
const mockChildMarks = [
  {
    subject: "Mathematics",
    exam: "First Term",
    marks: 85,
    total: 100,
    grade: "A",
    teacher: "Mrs. Perera",
    examPaper: "/placeholder.svg?height=800&width=600",
  },
  {
    subject: "Science",
    exam: "First Term",
    marks: 78,
    total: 100,
    grade: "B+",
    teacher: "Mr. Kumar",
    examPaper: "/placeholder.svg?height=800&width=600",
  },
  {
    subject: "English",
    exam: "First Term",
    marks: 92,
    total: 100,
    grade: "A+",
    teacher: "Mrs. Fernando",
    examPaper: null,
  },
  {
    subject: "Sinhala",
    exam: "First Term",
    marks: 88,
    total: 100,
    grade: "A",
    teacher: "Mr. Silva",
    examPaper: "/placeholder.svg?height=800&width=600",
  },
  {
    subject: "History",
    exam: "First Term",
    marks: 75,
    total: 100,
    grade: "B",
    teacher: "Mrs. Mendis",
    examPaper: null,
  },
  {
    subject: "Geography",
    exam: "First Term",
    marks: 82,
    total: 100,
    grade: "A-",
    teacher: "Mr. Bandara",
    examPaper: "/placeholder.svg?height=800&width=600",
  },
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

export default function MarksPage() {
  const { t } = useLanguage()
  const { user } = useAuth()
  const [selectedExam, setSelectedExam] = useState("1")
  const [selectedClass, setSelectedClass] = useState("grade-10-a")
  const [selectedSubject, setSelectedSubject] = useState("mathematics")
  const [searchQuery, setSearchQuery] = useState("")
  const [marks, setMarks] = useState<Record<string, number>>(
    mockStudentsMarks.reduce((acc, student) => ({ ...acc, [student.id]: student.marks }), {}),
  )
  const [examPapers, setExamPapers] = useState<Record<string, string | null>>(
    mockStudentsMarks.reduce((acc, student) => ({ ...acc, [student.id]: student.examPaper }), {}),
  )

  const isTeacherOrAdmin = user?.role === "teacher" || user?.role === "admin"

  const filteredStudents = mockStudentsMarks.filter((student) =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleMarksChange = (studentId: string, value: string) => {
    const numValue = Number.parseInt(value) || 0
    setMarks((prev) => ({ ...prev, [studentId]: Math.min(100, Math.max(0, numValue)) }))
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

  const handleSave = () => {
    alert("Marks and exam papers saved successfully!")
  }

  // Parent view
  if (user?.role === "parent") {
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
                <Select defaultValue="kasun">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kasun">Kasun Silva - Grade 10-A</SelectItem>
                    <SelectItem value="nimali">Nimali Silva - Grade 8-B</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("examType")}</Label>
                <Select defaultValue="firstTerm">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="firstTerm">{t("firstTerm")} 2024</SelectItem>
                    <SelectItem value="secondTerm">{t("secondTerm")} 2024</SelectItem>
                    <SelectItem value="thirdTerm">{t("thirdTerm")} 2024</SelectItem>
                    <SelectItem value="monthlyTest">{t("monthlyTest")}</SelectItem>
                    <SelectItem value="quiz">{t("quiz")}</SelectItem>
                    <SelectItem value="assignment">{t("assignment")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Marks Summary */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-sm text-muted-foreground">{t("totalMarks")}</p>
              <p className="text-3xl font-bold text-foreground">500/600</p>
              <p className="text-sm text-muted-foreground">83.3%</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-sm text-muted-foreground">Average Grade</p>
              <p className="text-3xl font-bold text-primary">A-</p>
              <p className="text-sm text-muted-foreground">Excellent</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-sm text-muted-foreground">Class Rank</p>
              <p className="text-3xl font-bold text-foreground">5/32</p>
              <p className="text-sm text-success">Top 20%</p>
            </CardContent>
          </Card>
        </div>

        {/* Subject-wise Marks with Exam Paper View */}
        <Card>
          <CardHeader>
            <CardTitle>{t("marks")} - First Term 2024</CardTitle>
            <CardDescription>Subject-wise performance for Kasun Silva</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Subject</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Teacher</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                      {t("obtainedMarks")}
                    </th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">{t("percentage")}</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">{t("gradeLabel")}</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Exam Paper</th>
                  </tr>
                </thead>
                <tbody>
                  {mockChildMarks.map((mark, index) => (
                    <tr key={index} className="border-b border-border last:border-0">
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <FileText className="h-4 w-4 text-primary" />
                          </div>
                          <span className="text-sm font-medium text-foreground">{mark.subject}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-sm text-muted-foreground">{mark.teacher}</td>
                      <td className="py-3 px-2 text-sm text-foreground">
                        {mark.marks}/{mark.total}
                      </td>
                      <td className="py-3 px-2 text-sm text-foreground">{mark.marks}%</td>
                      <td className="py-3 px-2">
                        <Badge className={getGradeColor(mark.grade)}>{mark.grade}</Badge>
                      </td>
                      <td className="py-3 px-2">
                        {mark.examPaper ? (
                          <ExamPaperViewer paperUrl={mark.examPaper} studentName="Kasun Silva" subject={mark.subject} />
                        ) : (
                          <span className="text-sm text-muted-foreground">Not available</span>
                        )}
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

  // Teacher/Admin view
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("marks")}</h1>
          <p className="text-muted-foreground">{t("enterMarks")}</p>
        </div>
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          {t("save")}
        </Button>
      </div>

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
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {mockExams.map((exam) => (
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
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="grade-10-a">Grade 10-A</SelectItem>
                      <SelectItem value="grade-10-b">Grade 10-B</SelectItem>
                      <SelectItem value="grade-9-a">Grade 9-A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t("subjectName")}</Label>
                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mathematics">Mathematics</SelectItem>
                      <SelectItem value="science">Science</SelectItem>
                      <SelectItem value="english">English</SelectItem>
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

          {/* Marks Entry Table with Exam Paper Upload */}
          <Card>
            <CardHeader>
              <CardTitle>First Term Examination 2024 - Mathematics</CardTitle>
              <CardDescription>Grade 10-A ({filteredStudents.length} students) - Total: 100 marks</CardDescription>
            </CardHeader>
            <CardContent>
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
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Exam Paper</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student) => {
                      const grade = getGrade(marks[student.id], student.total)
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
                              max="100"
                              value={marks[student.id]}
                              onChange={(e) => handleMarksChange(student.id, e.target.value)}
                              className="w-20"
                            />
                          </td>
                          <td className="py-3 px-2 text-sm text-foreground">{marks[student.id]}%</td>
                          <td className="py-3 px-2">
                            <Badge className={getGradeColor(grade)}>{grade}</Badge>
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="view" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Marks Summary</CardTitle>
              <CardDescription>View submitted marks for all exams</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Select an exam from the filters above to view marks.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
