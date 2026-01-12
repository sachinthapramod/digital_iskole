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
import { Plus, Search, Edit, Trash2, GraduationCap, Loader2, AlertCircle } from "lucide-react"

interface Student {
  id: string
  name: string
  rollNo: string
  class: string
  parent: string
  status: string
}

export default function StudentsPage() {
  const { t } = useLanguage()
  const [searchQuery, setSearchQuery] = useState("")
  const [filterClass, setFilterClass] = useState("all")
  const [students, setStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [newStudent, setNewStudent] = useState({ name: "", class: "", parent: "" })

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

  // Fetch students on mount
  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const token = localStorage.getItem("digital-iskole-token")
      
      if (!token) {
        setError("Not authenticated. Please login again.")
        setIsLoading(false)
        return
      }

      const response = await fetch(`${API_URL}/users/students`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || data.error?.message || 'Failed to fetch students')
      }

      setStudents(data.data?.students || [])
    } catch (err: any) {
      console.error('Fetch students error:', err)
      setError(err.message || 'Failed to load students')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.rollNo.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesClass = filterClass === "all" || student.class === filterClass
    return matchesSearch && matchesClass
  })

  const handleAddStudent = async () => {
    if (!newStudent.name || !newStudent.class || !newStudent.parent) {
      setError("Please fill in all required fields")
      return
    }

    try {
      setIsSaving(true)
      setError(null)
      const token = localStorage.getItem("digital-iskole-token")
      
      if (!token) {
        setError("Not authenticated. Please login again.")
        setIsSaving(false)
        return
      }

      const response = await fetch(`${API_URL}/users/students`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newStudent.name,
          class: newStudent.class,
          parent: newStudent.parent,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || data.error?.message || 'Failed to create student')
      }

      setDialogOpen(false)
      setNewStudent({ name: "", class: "", parent: "" })
      await fetchStudents() // Refresh list
    } catch (err: any) {
      console.error('Add student error:', err)
      setError(err.message || 'Failed to create student')
    } finally {
      setIsSaving(false)
    }
  }

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student)
    setEditDialogOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editingStudent) return

    try {
      setIsSaving(true)
      setError(null)
      const token = localStorage.getItem("digital-iskole-token")
      
      if (!token) {
        setError("Not authenticated. Please login again.")
        setIsSaving(false)
        return
      }

      const response = await fetch(`${API_URL}/users/students/${editingStudent.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editingStudent.name,
          class: editingStudent.class,
          parent: editingStudent.parent,
          status: editingStudent.status,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || data.error?.message || 'Failed to update student')
      }

      setEditDialogOpen(false)
      setEditingStudent(null)
      await fetchStudents() // Refresh list
    } catch (err: any) {
      console.error('Update student error:', err)
      setError(err.message || 'Failed to update student')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteStudent = async (id: string) => {
    if (!confirm("Are you sure you want to delete this student? This action cannot be undone.")) {
      return
    }

    try {
      setIsDeleting(id)
      setError(null)
      const token = localStorage.getItem("digital-iskole-token")
      
      if (!token) {
        setError("Not authenticated. Please login again.")
        setIsDeleting(null)
        return
      }

      const response = await fetch(`${API_URL}/users/students/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || data.error?.message || 'Failed to delete student')
      }

      await fetchStudents() // Refresh list
    } catch (err: any) {
      console.error('Delete student error:', err)
      setError(err.message || 'Failed to delete student')
    } finally {
      setIsDeleting(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("students")}</h1>
          <p className="text-muted-foreground">Manage student records and enrollments</p>
        </div>
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Student
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Student</DialogTitle>
              <DialogDescription>Enroll a new student to the school</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Student Name</Label>
                <Input
                  placeholder="Full name"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t("className")}</Label>
                  <Select value={newStudent.class} onValueChange={(v) => setNewStudent({ ...newStudent, class: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Grade 10-A">Grade 10-A</SelectItem>
                      <SelectItem value="Grade 10-B">Grade 10-B</SelectItem>
                      <SelectItem value="Grade 9-A">Grade 9-A</SelectItem>
                      <SelectItem value="Grade 9-B">Grade 9-B</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Roll Number</Label>
                  <Input placeholder="Auto-generated" disabled />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Parent/Guardian</Label>
                <Select value={newStudent.parent} onValueChange={(v) => setNewStudent({ ...newStudent, parent: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select or add parent" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mr. Nimal Perera">Mr. Nimal Perera</SelectItem>
                    <SelectItem value="Mrs. Kamala Silva">Mrs. Kamala Silva</SelectItem>
                    <SelectItem value="Mr. Sunil Fernando">Mr. Sunil Fernando</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isSaving}>
                {t("cancel")}
              </Button>
              <Button onClick={handleAddStudent} disabled={isSaving}>
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

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or roll number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterClass} onValueChange={setFilterClass}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                <SelectItem value="Grade 10-A">Grade 10-A</SelectItem>
                <SelectItem value="Grade 10-B">Grade 10-B</SelectItem>
                <SelectItem value="Grade 9-A">Grade 9-A</SelectItem>
                <SelectItem value="Grade 8-B">Grade 8-B</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Students</CardTitle>
          <CardDescription>{filteredStudents.length} students found</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Roll No</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Name</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">{t("className")}</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Parent/Guardian</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">{t("status")}</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">{t("actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-muted-foreground">
                        No students found
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((student) => (
                  <tr key={student.id} className="border-b border-border last:border-0">
                    <td className="py-3 px-2 text-sm text-muted-foreground">{student.rollNo}</td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                          <GraduationCap className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-sm font-medium text-foreground">{student.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-sm text-foreground">{student.class}</td>
                    <td className="py-3 px-2 text-sm text-muted-foreground">{student.parent}</td>
                    <td className="py-3 px-2">
                      <Badge
                        variant={student.status === "active" ? "default" : "secondary"}
                        className={student.status === "active" ? "bg-success text-success-foreground" : ""}
                      >
                        {t(student.status as "active" | "inactive")}
                      </Badge>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => handleEditStudent(student)} disabled={isDeleting === student.id}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() => handleDeleteStudent(student.id)}
                          disabled={isDeleting === student.id}
                        >
                          {isDeleting === student.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
            <DialogDescription>Update student information</DialogDescription>
          </DialogHeader>
          {editingStudent && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Student Name</Label>
                <Input
                  value={editingStudent.name}
                  onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t("className")}</Label>
                  <Select
                    value={editingStudent.class}
                    onValueChange={(v) => setEditingStudent({ ...editingStudent, class: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Grade 10-A">Grade 10-A</SelectItem>
                      <SelectItem value="Grade 10-B">Grade 10-B</SelectItem>
                      <SelectItem value="Grade 9-A">Grade 9-A</SelectItem>
                      <SelectItem value="Grade 9-B">Grade 9-B</SelectItem>
                      <SelectItem value="Grade 8-B">Grade 8-B</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Roll Number</Label>
                  <Input value={editingStudent.rollNo} disabled />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Parent/Guardian</Label>
                <Input
                  value={editingStudent.parent}
                  onChange={(e) => setEditingStudent({ ...editingStudent, parent: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("status")}</Label>
                <Select
                  value={editingStudent.status}
                  onValueChange={(v) => setEditingStudent({ ...editingStudent, status: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">{t("active")}</SelectItem>
                    <SelectItem value="inactive">{t("inactive")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} disabled={isSaving}>
              {t("cancel")}
            </Button>
            <Button onClick={handleSaveEdit} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                t("save")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
