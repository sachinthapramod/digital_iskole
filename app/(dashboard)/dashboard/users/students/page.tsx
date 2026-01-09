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
import { Plus, Search, Edit, Trash2, GraduationCap } from "lucide-react"

interface Student {
  id: string
  name: string
  rollNo: string
  class: string
  parent: string
  status: string
}

const initialStudents: Student[] = [
  {
    id: "1",
    name: "Kasun Perera",
    rollNo: "10A001",
    class: "Grade 10-A",
    parent: "Mr. Nimal Perera",
    status: "active",
  },
  {
    id: "2",
    name: "Nimali Silva",
    rollNo: "10A002",
    class: "Grade 10-A",
    parent: "Mrs. Kamala Silva",
    status: "active",
  },
  {
    id: "3",
    name: "Amal Fernando",
    rollNo: "10A003",
    class: "Grade 10-A",
    parent: "Mr. Sunil Fernando",
    status: "active",
  },
  {
    id: "4",
    name: "Sithara Jayawardena",
    rollNo: "9A001",
    class: "Grade 9-A",
    parent: "Mrs. Malini Jayawardena",
    status: "active",
  },
  { id: "5", name: "Dinesh Kumar", rollNo: "9A002", class: "Grade 9-A", parent: "Mr. Ravi Kumar", status: "inactive" },
  { id: "6", name: "Priya Mendis", rollNo: "8B001", class: "Grade 8-B", parent: "Mrs. Sita Mendis", status: "active" },
]

export default function StudentsPage() {
  const { t } = useLanguage()
  const [searchQuery, setSearchQuery] = useState("")
  const [filterClass, setFilterClass] = useState("all")
  const [students, setStudents] = useState<Student[]>(initialStudents)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [newStudent, setNewStudent] = useState({ name: "", class: "", parent: "" })

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.rollNo.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesClass = filterClass === "all" || student.class === filterClass
    return matchesSearch && matchesClass
  })

  const handleAddStudent = () => {
    const classPrefix = newStudent.class.replace("Grade ", "").replace("-", "")
    const newRollNo = `${classPrefix}${String(students.length + 1).padStart(3, "0")}`
    setStudents([...students, { ...newStudent, id: String(students.length + 1), rollNo: newRollNo, status: "active" }])
    setDialogOpen(false)
    setNewStudent({ name: "", class: "", parent: "" })
  }

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student)
    setEditDialogOpen(true)
  }

  const handleSaveEdit = () => {
    if (editingStudent) {
      setStudents(students.map((s) => (s.id === editingStudent.id ? editingStudent : s)))
      setEditDialogOpen(false)
      setEditingStudent(null)
    }
  }

  const handleDeleteStudent = (id: string) => {
    if (confirm("Are you sure you want to delete this student?")) {
      setStudents(students.filter((s) => s.id !== id))
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
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                {t("cancel")}
              </Button>
              <Button onClick={handleAddStudent}>{t("add")}</Button>
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
                {filteredStudents.map((student) => (
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
                        <Button size="sm" variant="ghost" onClick={() => handleEditStudent(student)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() => handleDeleteStudent(student.id)}
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
