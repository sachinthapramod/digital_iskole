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
import { Plus, Calendar, Clock, BookOpen } from "lucide-react"

// Mock data
const mockExams = [
  {
    id: "1",
    name: "First Term Examination 2024",
    type: "firstTerm",
    startDate: "2024-04-15",
    endDate: "2024-04-25",
    grades: ["Grade 9", "Grade 10", "Grade 11"],
    status: "completed",
  },
  {
    id: "2",
    name: "Second Term Examination 2024",
    type: "secondTerm",
    startDate: "2024-08-15",
    endDate: "2024-08-25",
    grades: ["All Grades"],
    status: "completed",
  },
  {
    id: "3",
    name: "Third Term Examination 2024",
    type: "thirdTerm",
    startDate: "2024-12-20",
    endDate: "2025-01-05",
    grades: ["All Grades"],
    status: "upcoming",
  },
  {
    id: "4",
    name: "Monthly Test - November",
    type: "monthlyTest",
    startDate: "2024-11-20",
    endDate: "2024-11-20",
    grades: ["Grade 10"],
    status: "ongoing",
  },
  {
    id: "5",
    name: "Science Quiz - Term 2",
    type: "quiz",
    startDate: "2024-12-10",
    endDate: "2024-12-10",
    grades: ["Grade 8", "Grade 9"],
    status: "upcoming",
  },
  {
    id: "6",
    name: "Mathematics Assignment",
    type: "assignment",
    startDate: "2024-12-05",
    endDate: "2024-12-15",
    grades: ["Grade 10"],
    status: "ongoing",
  },
]

export default function ExamsPage() {
  const { t } = useLanguage()
  const [dialogOpen, setDialogOpen] = useState(false)

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
                <Input placeholder="e.g., First Term Examination 2024" />
              </div>
              <div className="space-y-2">
                <Label>{t("examType")}</Label>
                <Select>
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
                  <Input type="date" />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input type="date" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Applicable Grades</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select grades" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Grades</SelectItem>
                    <SelectItem value="grade-10">Grade 10</SelectItem>
                    <SelectItem value="grade-9">Grade 9</SelectItem>
                    <SelectItem value="grade-8">Grade 8</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                {t("cancel")}
              </Button>
              <Button>{t("add")}</Button>
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
                <p className="text-sm text-muted-foreground">{t("upcomingExams")}</p>
                <p className="text-2xl font-bold text-foreground">
                  {mockExams.filter((e) => e.status === "upcoming").length}
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
                  {mockExams.filter((e) => e.status === "ongoing").length}
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
                  {mockExams.filter((e) => e.status === "completed").length}
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
          <div className="space-y-4">
            {mockExams.map((exam) => (
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
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
