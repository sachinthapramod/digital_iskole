"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { Plus, Search, Edit, Trash2, BookOpen, Loader2, AlertCircle } from "lucide-react"
import { apiRequest } from "@/lib/api/client"

interface Subject {
  id: string
  name: string
  code: string
  teachers: number
  classes: number
  status?: string
}

export default function SubjectsPage() {
  const { t } = useLanguage()
  const [searchQuery, setSearchQuery] = useState("")
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null)
  const [newSubject, setNewSubject] = useState({ name: "", code: "" })

  // Fetch subjects on mount
  useEffect(() => {
    fetchSubjects()
  }, [])

  const fetchSubjects = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await apiRequest('/academic/subjects')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || data.error?.message || 'Failed to fetch subjects')
      }

      setSubjects(data.data?.subjects || [])
    } catch (err: any) {
      console.error('Fetch subjects error:', err)
      if (err.message.includes('Token refresh failed') || err.message.includes('login')) {
        setError("Session expired. Please login again.")
      } else {
        setError(err.message || 'Failed to load subjects')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const filteredSubjects = subjects.filter(
    (subject) =>
      subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subject.code.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleAddSubject = async () => {
    if (!newSubject.name || !newSubject.code) {
      setError("Please fill in all required fields")
      return
    }

    try {
      setIsSaving(true)
      setError(null)

      const response = await apiRequest('/academic/subjects', {
        method: 'POST',
        body: JSON.stringify({
          name: newSubject.name,
          code: newSubject.code,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || data.error?.message || 'Failed to create subject')
      }

      setDialogOpen(false)
      setNewSubject({ name: "", code: "" })
      await fetchSubjects() // Refresh list
    } catch (err: any) {
      console.error('Add subject error:', err)
      if (err.message.includes('Token refresh failed') || err.message.includes('login')) {
        setError("Session expired. Please login again.")
      } else {
        setError(err.message || 'Failed to create subject')
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleEditSubject = (subject: Subject) => {
    setEditingSubject(subject)
    setEditDialogOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editingSubject) return

    try {
      setIsSaving(true)
      setError(null)

      const response = await apiRequest(`/academic/subjects/${editingSubject.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: editingSubject.name,
          code: editingSubject.code,
          status: editingSubject.status || 'active',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || data.error?.message || 'Failed to update subject')
      }

      setEditDialogOpen(false)
      setEditingSubject(null)
      await fetchSubjects() // Refresh list
    } catch (err: any) {
      console.error('Update subject error:', err)
      if (err.message.includes('Token refresh failed') || err.message.includes('login')) {
        setError("Session expired. Please login again.")
      } else {
        setError(err.message || 'Failed to update subject')
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteSubject = async (id: string) => {
    if (!confirm("Are you sure you want to delete this subject? This action cannot be undone.")) {
      return
    }

    try {
      setIsDeleting(id)
      setError(null)

      const response = await apiRequest(`/academic/subjects/${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || data.error?.message || 'Failed to delete subject')
      }

      await fetchSubjects() // Refresh list
    } catch (err: any) {
      console.error('Delete subject error:', err)
      if (err.message.includes('Token refresh failed') || err.message.includes('login')) {
        setError("Session expired. Please login again.")
      } else {
        setError(err.message || 'Failed to delete subject')
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
          <h1 className="text-2xl font-bold text-foreground">{t("subjects")}</h1>
          <p className="text-muted-foreground">Manage curriculum subjects</p>
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
              Add Subject
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Subject</DialogTitle>
              <DialogDescription>Add a new subject to the curriculum</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>{t("subjectName")}</Label>
                <Input
                  placeholder="e.g., Mathematics"
                  value={newSubject.name}
                  onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Subject Code</Label>
                <Input
                  placeholder="e.g., MATH"
                  value={newSubject.code}
                  onChange={(e) => setNewSubject({ ...newSubject, code: e.target.value.toUpperCase() })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isSaving}>
                {t("cancel")}
              </Button>
              <Button onClick={handleAddSubject} disabled={isSaving}>
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

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search subjects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Subjects Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {filteredSubjects.length === 0 ? (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              No subjects found
            </div>
          ) : (
            filteredSubjects.map((subject) => (
              <Card key={subject.id} className="overflow-hidden hover:border-primary/50 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <BookOpen className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => handleEditSubject(subject)}
                        disabled={isDeleting === subject.id}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => handleDeleteSubject(subject.id)}
                        disabled={isDeleting === subject.id}
                      >
                        {isDeleting === subject.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <CardTitle className="text-lg mt-2">{subject.name}</CardTitle>
                  <CardDescription>Code: {subject.code}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Badge variant="secondary">{subject.teachers} Teachers</Badge>
                    <Badge variant="outline">{subject.classes} Classes</Badge>
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
            <DialogTitle>Edit Subject</DialogTitle>
            <DialogDescription>Update subject information</DialogDescription>
          </DialogHeader>
          {editingSubject && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>{t("subjectName")}</Label>
                <Input
                  value={editingSubject.name}
                  onChange={(e) => setEditingSubject({ ...editingSubject, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Subject Code</Label>
                <Input
                  value={editingSubject.code}
                  onChange={(e) => setEditingSubject({ ...editingSubject, code: e.target.value.toUpperCase() })}
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
