"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
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
import { Plus, Search, Edit, Trash2, BookOpen } from "lucide-react"

interface Subject {
  id: string
  name: string
  code: string
  teachers: number
  classes: number
}

const initialSubjects: Subject[] = [
  { id: "1", name: "Mathematics", code: "MATH", teachers: 4, classes: 12 },
  { id: "2", name: "Science", code: "SCI", teachers: 3, classes: 12 },
  { id: "3", name: "English", code: "ENG", teachers: 4, classes: 12 },
  { id: "4", name: "Sinhala", code: "SIN", teachers: 3, classes: 12 },
  { id: "5", name: "Tamil", code: "TAM", teachers: 2, classes: 6 },
  { id: "6", name: "History", code: "HIS", teachers: 2, classes: 8 },
  { id: "7", name: "Geography", code: "GEO", teachers: 2, classes: 8 },
  { id: "8", name: "Information Technology", code: "IT", teachers: 2, classes: 6 },
]

export default function SubjectsPage() {
  const { t } = useLanguage()
  const [searchQuery, setSearchQuery] = useState("")
  const [subjects, setSubjects] = useState<Subject[]>(initialSubjects)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null)
  const [newSubject, setNewSubject] = useState({ name: "", code: "" })

  const filteredSubjects = subjects.filter(
    (subject) =>
      subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subject.code.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleAddSubject = () => {
    setSubjects([...subjects, { ...newSubject, id: String(subjects.length + 1), teachers: 0, classes: 0 }])
    setDialogOpen(false)
    setNewSubject({ name: "", code: "" })
  }

  const handleEditSubject = (subject: Subject) => {
    setEditingSubject(subject)
    setEditDialogOpen(true)
  }

  const handleSaveEdit = () => {
    if (editingSubject) {
      setSubjects(subjects.map((s) => (s.id === editingSubject.id ? editingSubject : s)))
      setEditDialogOpen(false)
      setEditingSubject(null)
    }
  }

  const handleDeleteSubject = (id: string) => {
    if (confirm("Are you sure you want to delete this subject?")) {
      setSubjects(subjects.filter((s) => s.id !== id))
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
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                {t("cancel")}
              </Button>
              <Button onClick={handleAddSubject}>{t("add")}</Button>
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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {filteredSubjects.map((subject) => (
          <Card key={subject.id} className="overflow-hidden hover:border-primary/50 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => handleEditSubject(subject)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive"
                    onClick={() => handleDeleteSubject(subject.id)}
                  >
                    <Trash2 className="h-4 w-4" />
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
        ))}
      </div>

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
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              {t("cancel")}
            </Button>
            <Button onClick={handleSaveEdit}>{t("save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
