"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { Plus, Search, Edit, Trash2, Users, GraduationCap } from "lucide-react"

interface ClassInfo {
  id: string
  name: string
  grade: string
  section: string
  classTeacher: string
  students: number
  room: string
}

const initialClasses: ClassInfo[] = [
  {
    id: "1",
    name: "Grade 10-A",
    grade: "10",
    section: "A",
    classTeacher: "Mrs. Kumari Perera",
    students: 32,
    room: "Room 101",
  },
  {
    id: "2",
    name: "Grade 10-B",
    grade: "10",
    section: "B",
    classTeacher: "Mr. Nuwan Bandara",
    students: 30,
    room: "Room 102",
  },
  {
    id: "3",
    name: "Grade 9-A",
    grade: "9",
    section: "A",
    classTeacher: "Mr. Amal Kumar",
    students: 35,
    room: "Room 201",
  },
  {
    id: "4",
    name: "Grade 9-B",
    grade: "9",
    section: "B",
    classTeacher: "Mrs. Sithara Fernando",
    students: 33,
    room: "Room 202",
  },
  {
    id: "5",
    name: "Grade 8-A",
    grade: "8",
    section: "A",
    classTeacher: "Mrs. Malini Rathnayake",
    students: 34,
    room: "Room 301",
  },
  {
    id: "6",
    name: "Grade 8-B",
    grade: "8",
    section: "B",
    classTeacher: "Mr. Ravi Kumar",
    students: 31,
    room: "Room 302",
  },
]

export default function ClassesPage() {
  const { t } = useLanguage()
  const [searchQuery, setSearchQuery] = useState("")
  const [classes, setClasses] = useState<ClassInfo[]>(initialClasses)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingClass, setEditingClass] = useState<ClassInfo | null>(null)
  const [newClass, setNewClass] = useState({ grade: "", section: "", classTeacher: "", room: "" })

  const filteredClasses = classes.filter(
    (cls) =>
      cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls.classTeacher.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const totalStudents = classes.reduce((acc, cls) => acc + cls.students, 0)

  const handleAddClass = () => {
    const name = `Grade ${newClass.grade}-${newClass.section}`
    setClasses([...classes, { ...newClass, id: String(classes.length + 1), name, students: 0 }])
    setDialogOpen(false)
    setNewClass({ grade: "", section: "", classTeacher: "", room: "" })
  }

  const handleEditClass = (cls: ClassInfo) => {
    setEditingClass(cls)
    setEditDialogOpen(true)
  }

  const handleSaveEdit = () => {
    if (editingClass) {
      const updatedClass = {
        ...editingClass,
        name: `Grade ${editingClass.grade}-${editingClass.section}`,
      }
      setClasses(classes.map((c) => (c.id === editingClass.id ? updatedClass : c)))
      setEditDialogOpen(false)
      setEditingClass(null)
    }
  }

  const handleDeleteClass = (id: string) => {
    if (confirm("Are you sure you want to delete this class?")) {
      setClasses(classes.filter((c) => c.id !== id))
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
                    <SelectValue placeholder="Assign class teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mrs. Kumari Perera">Mrs. Kumari Perera</SelectItem>
                    <SelectItem value="Mr. Amal Kumar">Mr. Amal Kumar</SelectItem>
                    <SelectItem value="Mrs. Sithara Fernando">Mrs. Sithara Fernando</SelectItem>
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
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                {t("cancel")}
              </Button>
              <Button onClick={handleAddClass}>{t("add")}</Button>
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
                <p className="text-2xl font-bold text-foreground">{Math.round(totalStudents / classes.length)}</p>
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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredClasses.map((cls) => (
          <Card key={cls.id} className="overflow-hidden">
            <CardHeader className="bg-primary/5 pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{cls.name}</CardTitle>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => handleEditClass(cls)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive"
                    onClick={() => handleDeleteClass(cls.id)}
                  >
                    <Trash2 className="h-4 w-4" />
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
        ))}
      </div>

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
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mrs. Kumari Perera">Mrs. Kumari Perera</SelectItem>
                    <SelectItem value="Mr. Amal Kumar">Mr. Amal Kumar</SelectItem>
                    <SelectItem value="Mrs. Sithara Fernando">Mrs. Sithara Fernando</SelectItem>
                    <SelectItem value="Mr. Nuwan Bandara">Mr. Nuwan Bandara</SelectItem>
                    <SelectItem value="Mrs. Malini Rathnayake">Mrs. Malini Rathnayake</SelectItem>
                    <SelectItem value="Mr. Ravi Kumar">Mr. Ravi Kumar</SelectItem>
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
