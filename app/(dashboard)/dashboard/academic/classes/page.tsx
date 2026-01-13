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
import { Plus, Search, Edit, Trash2, Users, GraduationCap, Loader2, AlertCircle } from "lucide-react"
import { apiRequest } from "@/lib/api/client"

interface ClassInfo {
  id: string
  name: string
  grade: string
  section: string
  classTeacher: string
  students: number
  room: string
  status?: string
}

interface Teacher {
  id: string
  name: string
  email: string
  phone: string
  status: string
}

export default function ClassesPage() {
  const { t } = useLanguage()
  const [searchQuery, setSearchQuery] = useState("")
  const [classes, setClasses] = useState<ClassInfo[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingClass, setEditingClass] = useState<ClassInfo | null>(null)
  const [newClass, setNewClass] = useState({ grade: "", section: "", classTeacher: "", room: "" })

  // Fetch classes and teachers on mount
  useEffect(() => {
    fetchClasses()
    fetchTeachers()
  }, [])

  const fetchClasses = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await apiRequest('/academic/classes')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || data.error?.message || 'Failed to fetch classes')
      }

      setClasses(data.data?.classes || [])
    } catch (err: any) {
      console.error('Fetch classes error:', err)
      if (err.message.includes('Token refresh failed') || err.message.includes('login')) {
        setError("Session expired. Please login again.")
      } else {
        setError(err.message || 'Failed to load classes')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const fetchTeachers = async () => {
    try {
      setIsLoadingTeachers(true)

      const response = await apiRequest('/users/teachers')
      const data = await response.json()

      if (response.ok) {
        setTeachers(data.data?.teachers || [])
      }
    } catch (err: any) {
      console.error('Fetch teachers error:', err)
      // Don't show error for teachers fetch failure, just log it
    } finally {
      setIsLoadingTeachers(false)
    }
  }

  const filteredClasses = classes.filter(
    (cls) =>
      cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls.classTeacher.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const totalStudents = classes.reduce((acc, cls) => acc + cls.students, 0)

  const handleAddClass = async () => {
    if (!newClass.grade || !newClass.section) {
      setError("Please fill in all required fields")
      return
    }

    try {
      setIsSaving(true)
      setError(null)

      const response = await apiRequest('/academic/classes', {
        method: 'POST',
        body: JSON.stringify({
          grade: newClass.grade,
          section: newClass.section,
          classTeacher: newClass.classTeacher || 'Not assigned',
          room: newClass.room || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || data.error?.message || 'Failed to create class')
      }

      setDialogOpen(false)
      setNewClass({ grade: "", section: "", classTeacher: "", room: "" })
      await fetchClasses() // Refresh list
    } catch (err: any) {
      console.error('Add class error:', err)
      if (err.message.includes('Token refresh failed') || err.message.includes('login')) {
        setError("Session expired. Please login again.")
      } else {
        setError(err.message || 'Failed to create class')
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleEditClass = (cls: ClassInfo) => {
    setEditingClass(cls)
    setEditDialogOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editingClass) return

    try {
      setIsSaving(true)
      setError(null)

      const response = await apiRequest(`/academic/classes/${editingClass.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          grade: editingClass.grade,
          section: editingClass.section,
          classTeacher: editingClass.classTeacher || 'Not assigned',
          room: editingClass.room || undefined,
          status: editingClass.status || 'active',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || data.error?.message || 'Failed to update class')
      }

      setEditDialogOpen(false)
      setEditingClass(null)
      await fetchClasses() // Refresh list
    } catch (err: any) {
      console.error('Update class error:', err)
      if (err.message.includes('Token refresh failed') || err.message.includes('login')) {
        setError("Session expired. Please login again.")
      } else {
        setError(err.message || 'Failed to update class')
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteClass = async (id: string) => {
    if (!confirm("Are you sure you want to delete this class? This action cannot be undone.")) {
      return
    }

    try {
      setIsDeleting(id)
      setError(null)

      const response = await apiRequest(`/academic/classes/${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || data.error?.message || 'Failed to delete class')
      }

      await fetchClasses() // Refresh list
    } catch (err: any) {
      console.error('Delete class error:', err)
      if (err.message.includes('Token refresh failed') || err.message.includes('login')) {
        setError("Session expired. Please login again.")
      } else {
        setError(err.message || 'Failed to delete class')
      }
    } finally {
      setIsDeleting(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("classes")}</h1>
          <p className="text-muted-foreground">Manage class sections and assignments</p>
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
              Add Class
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Class</DialogTitle>
              <DialogDescription>Create a new class section</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t("grade")}</Label>
                  <Select value={newClass.grade} onValueChange={(v) => setNewClass({ ...newClass, grade: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select grade" />
                    </SelectTrigger>
                    <SelectContent>
                      {[6, 7, 8, 9, 10, 11, 12, 13].map((g) => (
                        <SelectItem key={g} value={g.toString()}>
                          Grade {g}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t("section")}</Label>
                  <Select value={newClass.section} onValueChange={(v) => setNewClass({ ...newClass, section: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select section" />
                    </SelectTrigger>
                    <SelectContent>
                      {["A", "B", "C", "D"].map((s) => (
                        <SelectItem key={s} value={s}>
                          Section {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t("classTeacher")}</Label>
                <Select
                  value={newClass.classTeacher}
                  onValueChange={(v) => setNewClass({ ...newClass, classTeacher: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={isLoadingTeachers ? "Loading teachers..." : "Assign class teacher"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Not assigned">Not assigned</SelectItem>
                    {teachers.length === 0 ? (
                      <SelectItem value="no-teachers" disabled>
                        {isLoadingTeachers ? "Loading..." : "No teachers available"}
                      </SelectItem>
                    ) : (
                      teachers.map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.name}>
                          {teacher.name} {teacher.email ? `(${teacher.email})` : ''}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Room Number</Label>
                <Input
                  placeholder="e.g., Room 101"
                  value={newClass.room}
                  onChange={(e) => setNewClass({ ...newClass, room: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isSaving}>
                {t("cancel")}
              </Button>
              <Button onClick={handleAddClass} disabled={isSaving}>
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

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t("totalClasses")}</p>
                <p className="text-2xl font-bold text-foreground">{classes.length}</p>
              </div>
              <GraduationCap className="h-8 w-8 text-primary/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t("totalStudents")}</p>
                <p className="text-2xl font-bold text-foreground">{totalStudents}</p>
              </div>
              <Users className="h-8 w-8 text-primary/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Class Size</p>
                <p className="text-2xl font-bold text-foreground">
                  {classes.length > 0 ? Math.round(totalStudents / classes.length) : 0}
                </p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search classes or teachers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Classes Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredClasses.length === 0 ? (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              No classes found
            </div>
          ) : (
            filteredClasses.map((cls) => (
              <Card key={cls.id} className="overflow-hidden">
                <CardHeader className="bg-primary/5 pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{cls.name}</CardTitle>
                    <div className="flex gap-1">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => handleEditClass(cls)}
                        disabled={isDeleting === cls.id}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => handleDeleteClass(cls.id)}
                        disabled={isDeleting === cls.id}
                      >
                        {isDeleting === cls.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <CardDescription>{cls.room}</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{t("classTeacher")}</span>
                      <span className="text-sm font-medium text-foreground">{cls.classTeacher}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{t("students")}</span>
                      <Badge variant="secondary">{cls.students} students</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Class</DialogTitle>
            <DialogDescription>Update class information</DialogDescription>
          </DialogHeader>
          {editingClass && (
            <div className="space-y-4 py-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t("grade")}</Label>
                  <Select
                    value={editingClass.grade}
                    onValueChange={(v) => setEditingClass({ ...editingClass, grade: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[6, 7, 8, 9, 10, 11, 12, 13].map((g) => (
                        <SelectItem key={g} value={g.toString()}>
                          Grade {g}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t("section")}</Label>
                  <Select
                    value={editingClass.section}
                    onValueChange={(v) => setEditingClass({ ...editingClass, section: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["A", "B", "C", "D"].map((s) => (
                        <SelectItem key={s} value={s}>
                          Section {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t("classTeacher")}</Label>
                <Select
                  value={editingClass.classTeacher}
                  onValueChange={(v) => setEditingClass({ ...editingClass, classTeacher: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={isLoadingTeachers ? "Loading teachers..." : "Assign class teacher"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Not assigned">Not assigned</SelectItem>
                    {teachers.length === 0 ? (
                      <SelectItem value="no-teachers" disabled>
                        {isLoadingTeachers ? "Loading..." : "No teachers available"}
                      </SelectItem>
                    ) : (
                      teachers.map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.name}>
                          {teacher.name} {teacher.email ? `(${teacher.email})` : ''}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Room Number</Label>
                <Input
                  value={editingClass.room}
                  onChange={(e) => setEditingClass({ ...editingClass, room: e.target.value })}
                />
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
