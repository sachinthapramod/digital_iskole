"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useLanguage } from "@/lib/i18n/context"
import { useAuth } from "@/lib/auth/context"
import {
  GraduationCap,
  FileText,
  Download,
  Eye,
  Trash2,
  Plus,
  Calendar,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  User,
  BookOpen,
  Award,
  BarChart3,
  Users,
  School,
} from "lucide-react"

// Mock data for parent's children
const childrenData = [
  {
    id: "student-1",
    name: "Kasun Silva",
    admissionNo: "STU-2024-001",
    grade: "Grade 10",
    class: "10-A",
    dateOfBirth: "2009-05-15",
    gender: "Male",
    classTeacher: "Mrs. Perera",
    attendanceRate: 94,
    averageMarks: 78,
    rank: 5,
    totalStudents: 35,
    subjects: [
      { name: "Mathematics", marks: 82, grade: "A", trend: "up" },
      { name: "Science", marks: 78, grade: "B+", trend: "stable" },
      { name: "English", marks: 75, grade: "B+", trend: "up" },
      { name: "Sinhala", marks: 88, grade: "A", trend: "up" },
      { name: "History", marks: 72, grade: "B", trend: "down" },
      { name: "ICT", marks: 90, grade: "A+", trend: "up" },
    ],
    termProgress: [
      { term: "First Term", average: 72, rank: 8 },
      { term: "Second Term", average: 75, rank: 6 },
      { term: "Third Term", average: 78, rank: 5 },
    ],
    attendance: {
      totalDays: 180,
      present: 169,
      absent: 8,
      late: 3,
    },
    achievements: ["Science Fair - 2nd Place", "Mathematics Olympiad Participant", "Perfect Attendance Award - Q1"],
  },
  {
    id: "student-2",
    name: "Nimali Silva",
    admissionNo: "STU-2024-002",
    grade: "Grade 8",
    class: "8-B",
    dateOfBirth: "2011-08-22",
    gender: "Female",
    classTeacher: "Mr. Kumar",
    attendanceRate: 98,
    averageMarks: 85,
    rank: 3,
    totalStudents: 38,
    subjects: [
      { name: "Mathematics", marks: 88, grade: "A", trend: "up" },
      { name: "Science", marks: 85, grade: "A", trend: "up" },
      { name: "English", marks: 82, grade: "A", trend: "stable" },
      { name: "Sinhala", marks: 92, grade: "A+", trend: "up" },
      { name: "History", marks: 80, grade: "A", trend: "up" },
      { name: "ICT", marks: 88, grade: "A", trend: "stable" },
    ],
    termProgress: [
      { term: "First Term", average: 80, rank: 5 },
      { term: "Second Term", average: 83, rank: 4 },
      { term: "Third Term", average: 85, rank: 3 },
    ],
    attendance: {
      totalDays: 180,
      present: 176,
      absent: 3,
      late: 1,
    },
    achievements: ["English Essay Competition - 1st Place", "Best Student Award - Term 2", "Art Competition Winner"],
  },
]

// Mock data for teacher's class students
const classStudentsData = [
  {
    id: "student-t1",
    name: "Amara Perera",
    admissionNo: "STU-2024-010",
    grade: "Grade 10",
    class: "10-A",
    dateOfBirth: "2009-03-12",
    gender: "Female",
    classTeacher: "Mrs. Perera",
    attendanceRate: 96,
    averageMarks: 82,
    rank: 3,
    totalStudents: 35,
    subjects: [
      { name: "Mathematics", marks: 85, grade: "A", trend: "up" },
      { name: "Science", marks: 80, grade: "A", trend: "stable" },
      { name: "English", marks: 78, grade: "B+", trend: "up" },
      { name: "Sinhala", marks: 90, grade: "A+", trend: "up" },
      { name: "History", marks: 75, grade: "B+", trend: "stable" },
      { name: "ICT", marks: 84, grade: "A", trend: "up" },
    ],
    termProgress: [
      { term: "First Term", average: 78, rank: 5 },
      { term: "Second Term", average: 80, rank: 4 },
      { term: "Third Term", average: 82, rank: 3 },
    ],
    attendance: { totalDays: 180, present: 173, absent: 5, late: 2 },
    achievements: ["Best in Sinhala", "Drama Club Leader"],
  },
  {
    id: "student-t2",
    name: "Nuwan Fernando",
    admissionNo: "STU-2024-011",
    grade: "Grade 10",
    class: "10-A",
    dateOfBirth: "2009-07-25",
    gender: "Male",
    classTeacher: "Mrs. Perera",
    attendanceRate: 92,
    averageMarks: 75,
    rank: 8,
    totalStudents: 35,
    subjects: [
      { name: "Mathematics", marks: 78, grade: "B+", trend: "up" },
      { name: "Science", marks: 72, grade: "B", trend: "stable" },
      { name: "English", marks: 70, grade: "B", trend: "down" },
      { name: "Sinhala", marks: 82, grade: "A", trend: "up" },
      { name: "History", marks: 68, grade: "C+", trend: "stable" },
      { name: "ICT", marks: 80, grade: "A", trend: "up" },
    ],
    termProgress: [
      { term: "First Term", average: 70, rank: 12 },
      { term: "Second Term", average: 73, rank: 10 },
      { term: "Third Term", average: 75, rank: 8 },
    ],
    attendance: { totalDays: 180, present: 166, absent: 10, late: 4 },
    achievements: ["Sports Day - 100m Winner", "Cricket Team Captain"],
  },
  {
    id: "student-t3",
    name: "Dilini Jayawardena",
    admissionNo: "STU-2024-012",
    grade: "Grade 10",
    class: "10-A",
    dateOfBirth: "2009-01-08",
    gender: "Female",
    classTeacher: "Mrs. Perera",
    attendanceRate: 98,
    averageMarks: 88,
    rank: 1,
    totalStudents: 35,
    subjects: [
      { name: "Mathematics", marks: 92, grade: "A+", trend: "up" },
      { name: "Science", marks: 90, grade: "A+", trend: "up" },
      { name: "English", marks: 85, grade: "A", trend: "stable" },
      { name: "Sinhala", marks: 88, grade: "A", trend: "up" },
      { name: "History", marks: 82, grade: "A", trend: "up" },
      { name: "ICT", marks: 91, grade: "A+", trend: "stable" },
    ],
    termProgress: [
      { term: "First Term", average: 85, rank: 2 },
      { term: "Second Term", average: 87, rank: 1 },
      { term: "Third Term", average: 88, rank: 1 },
    ],
    attendance: { totalDays: 180, present: 177, absent: 2, late: 1 },
    achievements: ["Class Rank 1", "Science Olympiad Gold", "Perfect Attendance"],
  },
  {
    id: "student-t4",
    name: "Sahan Bandara",
    admissionNo: "STU-2024-013",
    grade: "Grade 10",
    class: "10-A",
    dateOfBirth: "2009-11-30",
    gender: "Male",
    classTeacher: "Mrs. Perera",
    attendanceRate: 90,
    averageMarks: 70,
    rank: 15,
    totalStudents: 35,
    subjects: [
      { name: "Mathematics", marks: 68, grade: "C+", trend: "stable" },
      { name: "Science", marks: 65, grade: "C+", trend: "down" },
      { name: "English", marks: 72, grade: "B", trend: "up" },
      { name: "Sinhala", marks: 78, grade: "B+", trend: "up" },
      { name: "History", marks: 70, grade: "B", trend: "stable" },
      { name: "ICT", marks: 67, grade: "C+", trend: "down" },
    ],
    termProgress: [
      { term: "First Term", average: 68, rank: 18 },
      { term: "Second Term", average: 69, rank: 16 },
      { term: "Third Term", average: 70, rank: 15 },
    ],
    attendance: { totalDays: 180, present: 162, absent: 14, late: 4 },
    achievements: ["Art Competition - 3rd Place"],
  },
  {
    id: "student-t5",
    name: "Kavindi Rathnayake",
    admissionNo: "STU-2024-014",
    grade: "Grade 10",
    class: "10-A",
    dateOfBirth: "2009-04-18",
    gender: "Female",
    classTeacher: "Mrs. Perera",
    attendanceRate: 95,
    averageMarks: 80,
    rank: 5,
    totalStudents: 35,
    subjects: [
      { name: "Mathematics", marks: 82, grade: "A", trend: "up" },
      { name: "Science", marks: 78, grade: "B+", trend: "up" },
      { name: "English", marks: 80, grade: "A", trend: "stable" },
      { name: "Sinhala", marks: 85, grade: "A", trend: "up" },
      { name: "History", marks: 76, grade: "B+", trend: "up" },
      { name: "ICT", marks: 79, grade: "B+", trend: "stable" },
    ],
    termProgress: [
      { term: "First Term", average: 76, rank: 7 },
      { term: "Second Term", average: 78, rank: 6 },
      { term: "Third Term", average: 80, rank: 5 },
    ],
    attendance: { totalDays: 180, present: 171, absent: 6, late: 3 },
    achievements: ["English Debate Winner", "Prefect"],
  },
]

const allClassesData = [
  { id: "class-1", name: "Grade 6-A", teacher: "Mr. Silva", students: 32 },
  { id: "class-2", name: "Grade 6-B", teacher: "Mrs. Fernando", students: 30 },
  { id: "class-3", name: "Grade 7-A", teacher: "Mr. Perera", students: 35 },
  { id: "class-4", name: "Grade 7-B", teacher: "Mrs. Gunasekara", students: 33 },
  { id: "class-5", name: "Grade 8-A", teacher: "Mr. Jayawardena", students: 34 },
  { id: "class-6", name: "Grade 8-B", teacher: "Mr. Kumar", students: 38 },
  { id: "class-7", name: "Grade 9-A", teacher: "Mrs. Rathnayake", students: 36 },
  { id: "class-8", name: "Grade 9-B", teacher: "Mr. Bandara", students: 32 },
  { id: "class-9", name: "Grade 10-A", teacher: "Mrs. Perera", students: 35 },
  { id: "class-10", name: "Grade 10-B", teacher: "Mr. Wijesinghe", students: 34 },
  { id: "class-11", name: "Grade 11-A", teacher: "Mrs. Dissanayake", students: 30 },
  { id: "class-12", name: "Grade 11-B", teacher: "Mr. Karunaratne", students: 28 },
]

const allStudentsData = [
  ...classStudentsData,
  {
    id: "student-a1",
    name: "Rashmi Perera",
    admissionNo: "STU-2024-020",
    grade: "Grade 8",
    class: "8-B",
    dateOfBirth: "2011-02-14",
    gender: "Female",
    classTeacher: "Mr. Kumar",
    attendanceRate: 97,
    averageMarks: 86,
    rank: 2,
    totalStudents: 38,
    subjects: [
      { name: "Mathematics", marks: 89, grade: "A", trend: "up" },
      { name: "Science", marks: 87, grade: "A", trend: "up" },
      { name: "English", marks: 84, grade: "A", trend: "stable" },
      { name: "Sinhala", marks: 90, grade: "A+", trend: "up" },
      { name: "History", marks: 82, grade: "A", trend: "up" },
      { name: "ICT", marks: 84, grade: "A", trend: "stable" },
    ],
    termProgress: [
      { term: "First Term", average: 82, rank: 4 },
      { term: "Second Term", average: 84, rank: 3 },
      { term: "Third Term", average: 86, rank: 2 },
    ],
    attendance: { totalDays: 180, present: 175, absent: 4, late: 1 },
    achievements: ["Best in Science", "Quiz Competition Winner"],
  },
  {
    id: "student-a2",
    name: "Tharaka Fernando",
    admissionNo: "STU-2024-021",
    grade: "Grade 9",
    class: "9-A",
    dateOfBirth: "2010-06-20",
    gender: "Male",
    classTeacher: "Mrs. Rathnayake",
    attendanceRate: 93,
    averageMarks: 79,
    rank: 6,
    totalStudents: 36,
    subjects: [
      { name: "Mathematics", marks: 82, grade: "A", trend: "up" },
      { name: "Science", marks: 78, grade: "B+", trend: "stable" },
      { name: "English", marks: 76, grade: "B+", trend: "up" },
      { name: "Sinhala", marks: 85, grade: "A", trend: "up" },
      { name: "History", marks: 74, grade: "B", trend: "stable" },
      { name: "ICT", marks: 79, grade: "B+", trend: "up" },
    ],
    termProgress: [
      { term: "First Term", average: 75, rank: 9 },
      { term: "Second Term", average: 77, rank: 7 },
      { term: "Third Term", average: 79, rank: 6 },
    ],
    attendance: { totalDays: 180, present: 167, absent: 9, late: 4 },
    achievements: ["Sports Day - Long Jump Winner"],
  },
]

// Mock generated reports for parents
const initialParentReports = [
  {
    id: "report-1",
    childId: "student-1",
    childName: "Kasun Silva",
    type: "Term Report",
    term: "Third Term",
    generatedAt: "2024-12-10T10:30:00",
    academicYear: "2024",
  },
  {
    id: "report-2",
    childId: "student-2",
    childName: "Nimali Silva",
    type: "Term Report",
    term: "Third Term",
    generatedAt: "2024-12-08T14:20:00",
    academicYear: "2024",
  },
]

// Mock generated reports for teachers
const initialTeacherReports = [
  {
    id: "treport-1",
    studentId: "student-t3",
    studentName: "Dilini Jayawardena",
    type: "Student Report",
    term: "Third Term",
    generatedAt: "2024-12-12T09:00:00",
    academicYear: "2024",
    reportCategory: "individual",
  },
  {
    id: "treport-2",
    studentId: null,
    studentName: null,
    type: "Class Report",
    term: "Third Term",
    generatedAt: "2024-12-11T15:30:00",
    academicYear: "2024",
    reportCategory: "class",
  },
]

const initialAdminReports = [
  {
    id: "areport-1",
    studentId: "student-t3",
    studentName: "Dilini Jayawardena",
    className: null,
    type: "Term Report",
    term: "Third Term",
    generatedAt: "2024-12-12T09:00:00",
    academicYear: "2024",
    reportCategory: "individual" as const,
  },
  {
    id: "areport-2",
    studentId: null,
    studentName: null,
    className: "Grade 10-A",
    type: "Class Report",
    term: "Third Term",
    generatedAt: "2024-12-11T15:30:00",
    academicYear: "2024",
    reportCategory: "class" as const,
  },
  {
    id: "areport-3",
    studentId: null,
    studentName: null,
    className: null,
    type: "School Report",
    term: "Third Term",
    generatedAt: "2024-12-10T11:00:00",
    academicYear: "2024",
    reportCategory: "school" as const,
  },
]

// Student Report Preview Component
function StudentReportPreview({
  student,
  reportType,
  term,
}: { student: (typeof classStudentsData)[0]; reportType: string; term: string }) {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-3 w-3 text-green-600" />
      case "down":
        return <TrendingDown className="h-3 w-3 text-red-600" />
      default:
        return <div className="h-3 w-3" />
    }
  }

  const getGradeColor = (grade: string) => {
    if (grade.startsWith("A")) return "text-green-600"
    if (grade.startsWith("B")) return "text-blue-600"
    if (grade.startsWith("C")) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <div className="bg-white text-black p-8 max-w-4xl mx-auto" id="report-content">
      {/* Report Header */}
      <div className="text-center border-b-2 border-gray-800 pb-6 mb-6">
        <div className="flex justify-center mb-4">
          <div className="h-16 w-16 rounded-full bg-teal-600 flex items-center justify-center">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Digital Iskole</h1>
        <p className="text-gray-600">Student Academic Report</p>
        <div className="mt-2">
          <Badge variant="outline" className="text-teal-700 border-teal-700">
            {reportType} - {term} {new Date().getFullYear()}
          </Badge>
        </div>
      </div>

      {/* Student Information */}
      <div className="grid grid-cols-2 gap-6 mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-500">Student Name:</span>
            <span className="font-semibold">{student.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-500">Admission No:</span>
            <span className="font-semibold">{student.admissionNo}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-500">Date of Birth:</span>
            <span className="font-semibold">{new Date(student.dateOfBirth).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-500">Class:</span>
            <span className="font-semibold">{student.class}</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-500">Class Teacher:</span>
            <span className="font-semibold">{student.classTeacher}</span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-500">Class Rank:</span>
            <span className="font-semibold">
              {student.rank} / {student.totalStudents}
            </span>
          </div>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="text-center p-4 bg-teal-50 rounded-lg border border-teal-200">
          <p className="text-2xl font-bold text-teal-700">{student.averageMarks}%</p>
          <p className="text-xs text-teal-600">Average Marks</p>
        </div>
        <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-2xl font-bold text-blue-700">{student.attendanceRate}%</p>
          <p className="text-xs text-blue-600">Attendance</p>
        </div>
        <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
          <p className="text-2xl font-bold text-purple-700">#{student.rank}</p>
          <p className="text-xs text-purple-600">Class Rank</p>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
          <p className="text-2xl font-bold text-green-700">
            {student.subjects.filter((s) => s.grade.startsWith("A")).length}
          </p>
          <p className="text-xs text-green-600">A Grades</p>
        </div>
      </div>

      {/* Subject-wise Performance */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-teal-600" />
          Subject-wise Performance
        </h2>
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-100">
              <TableHead>Subject</TableHead>
              <TableHead className="text-center">Marks</TableHead>
              <TableHead className="text-center">Grade</TableHead>
              <TableHead className="text-center">Progress</TableHead>
              <TableHead className="text-center">Trend</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {student.subjects.map((subject, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{subject.name}</TableCell>
                <TableCell className="text-center">{subject.marks}/100</TableCell>
                <TableCell className="text-center">
                  <span className={`font-semibold ${getGradeColor(subject.grade)}`}>{subject.grade}</span>
                </TableCell>
                <TableCell>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-teal-600 h-2 rounded-full" style={{ width: `${subject.marks}%` }} />
                  </div>
                </TableCell>
                <TableCell className="text-center">{getTrendIcon(subject.trend)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Term Progress */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-teal-600" />
          Term Progress
        </h2>
        <div className="grid grid-cols-3 gap-4">
          {student.termProgress.map((tp, index) => (
            <div key={index} className="p-4 border rounded-lg text-center">
              <p className="text-sm text-gray-500 mb-1">{tp.term}</p>
              <p className="text-xl font-bold text-gray-900">{tp.average}%</p>
              <p className="text-xs text-gray-500">Rank: #{tp.rank}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Attendance Summary */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-teal-600" />
          Attendance Summary
        </h2>
        <div className="grid grid-cols-4 gap-4">
          <div className="p-3 bg-gray-50 rounded-lg text-center">
            <p className="text-lg font-bold">{student.attendance.totalDays}</p>
            <p className="text-xs text-gray-500">Total Days</p>
          </div>
          <div className="p-3 bg-green-50 rounded-lg text-center">
            <p className="text-lg font-bold text-green-600">{student.attendance.present}</p>
            <p className="text-xs text-green-600">Present</p>
          </div>
          <div className="p-3 bg-red-50 rounded-lg text-center">
            <p className="text-lg font-bold text-red-600">{student.attendance.absent}</p>
            <p className="text-xs text-red-600">Absent</p>
          </div>
          <div className="p-3 bg-yellow-50 rounded-lg text-center">
            <p className="text-lg font-bold text-yellow-600">{student.attendance.late}</p>
            <p className="text-xs text-yellow-600">Late</p>
          </div>
        </div>
      </div>

      {/* Achievements */}
      {student.achievements.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Award className="h-5 w-5 text-teal-600" />
            Achievements & Awards
          </h2>
          <ul className="list-disc list-inside space-y-1 pl-2">
            {student.achievements.map((achievement, index) => (
              <li key={index} className="text-gray-700">
                {achievement}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Footer */}
      <div className="border-t-2 border-gray-300 pt-6 mt-8">
        <div className="grid grid-cols-2 gap-8">
          <div className="text-center">
            <div className="border-t border-gray-400 pt-2 mx-8">
              <p className="text-sm text-gray-500">Class Teacher&apos;s Signature</p>
            </div>
          </div>
          <div className="text-center">
            <div className="border-t border-gray-400 pt-2 mx-8">
              <p className="text-sm text-gray-500">Principal&apos;s Signature</p>
            </div>
          </div>
        </div>
        <p className="text-center text-xs text-gray-400 mt-6">
          Generated on {new Date().toLocaleString()} | Digital Iskole School Management System
        </p>
      </div>
    </div>
  )
}

// Class Report Preview Component
function ClassReportPreview({
  students,
  term,
  reportType,
  className = "Grade 10-A",
  classTeacher = "Mrs. Perera",
}: {
  students: typeof classStudentsData
  term: string
  reportType: string
  className?: string
  classTeacher?: string
}) {
  const classAverage = Math.round(students.reduce((sum, s) => sum + s.averageMarks, 0) / students.length)
  const classAttendance = Math.round(students.reduce((sum, s) => sum + s.attendanceRate, 0) / students.length)
  const topPerformers = [...students].sort((a, b) => b.averageMarks - a.averageMarks).slice(0, 5)
  const subjectAverages = students[0].subjects.map((_, idx) => ({
    name: students[0].subjects[idx].name,
    average: Math.round(students.reduce((sum, s) => sum + s.subjects[idx].marks, 0) / students.length),
  }))

  return (
    <div className="bg-white text-black p-8 max-w-4xl mx-auto" id="class-report-content">
      {/* Report Header */}
      <div className="text-center border-b-2 border-gray-800 pb-6 mb-6">
        <div className="flex justify-center mb-4">
          <div className="h-16 w-16 rounded-full bg-teal-600 flex items-center justify-center">
            <Users className="h-8 w-8 text-white" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Digital Iskole</h1>
        <p className="text-gray-600">Class Performance Report</p>
        <div className="mt-2">
          <Badge variant="outline" className="text-teal-700 border-teal-700">
            {reportType} - {className} - {term} {new Date().getFullYear()}
          </Badge>
        </div>
      </div>

      {/* Class Information */}
      <div className="grid grid-cols-2 gap-6 mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-500">Class:</span>
            <span className="font-semibold">{className}</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-500">Class Teacher:</span>
            <span className="font-semibold">{classTeacher}</span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-500">Total Students:</span>
            <span className="font-semibold">{students.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-500">Academic Year:</span>
            <span className="font-semibold">{new Date().getFullYear()}</span>
          </div>
        </div>
      </div>

      {/* Class Performance Summary */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="text-center p-4 bg-teal-50 rounded-lg border border-teal-200">
          <p className="text-2xl font-bold text-teal-700">{classAverage}%</p>
          <p className="text-xs text-teal-600">Class Average</p>
        </div>
        <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-2xl font-bold text-blue-700">{classAttendance}%</p>
          <p className="text-xs text-blue-600">Attendance Rate</p>
        </div>
        <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
          <p className="text-2xl font-bold text-purple-700">{students.length}</p>
          <p className="text-xs text-purple-600">Total Students</p>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
          <p className="text-2xl font-bold text-green-700">{students.filter((s) => s.averageMarks >= 75).length}</p>
          <p className="text-xs text-green-600">Above 75%</p>
        </div>
      </div>

      {/* Subject-wise Class Average */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-teal-600" />
          Subject-wise Class Average
        </h2>
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-100">
              <TableHead>Subject</TableHead>
              <TableHead className="text-center">Class Average</TableHead>
              <TableHead className="text-center">Highest</TableHead>
              <TableHead className="text-center">Lowest</TableHead>
              <TableHead className="text-center">Pass Rate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subjectAverages.map((subject, index) => {
              const subjectMarks = students.map((s) => s.subjects[index].marks)
              const highest = Math.max(...subjectMarks)
              const lowest = Math.min(...subjectMarks)
              const passRate = Math.round((subjectMarks.filter((m) => m >= 40).length / students.length) * 100)
              return (
                <TableRow key={index}>
                  <TableCell className="font-medium">{subject.name}</TableCell>
                  <TableCell className="text-center">{subject.average}%</TableCell>
                  <TableCell className="text-center text-green-600 font-semibold">{highest}%</TableCell>
                  <TableCell className="text-center text-red-600 font-semibold">{lowest}%</TableCell>
                  <TableCell className="text-center">{passRate}%</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Top Performers */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Award className="h-5 w-5 text-teal-600" />
          Top 5 Performers
        </h2>
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-100">
              <TableHead>Rank</TableHead>
              <TableHead>Student Name</TableHead>
              <TableHead className="text-center">Average</TableHead>
              <TableHead className="text-center">Attendance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topPerformers.map((student, index) => (
              <TableRow key={student.id}>
                <TableCell className="font-bold text-teal-600">#{index + 1}</TableCell>
                <TableCell className="font-medium">{student.name}</TableCell>
                <TableCell className="text-center">{student.averageMarks}%</TableCell>
                <TableCell className="text-center">{student.attendanceRate}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* All Students Performance */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Users className="h-5 w-5 text-teal-600" />
          All Students Performance
        </h2>
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-100">
              <TableHead>Rank</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="text-center">Average</TableHead>
              <TableHead className="text-center">Attendance</TableHead>
              <TableHead className="text-center">A Grades</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...students]
              .sort((a, b) => a.rank - b.rank)
              .map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-semibold">#{student.rank}</TableCell>
                  <TableCell>{student.name}</TableCell>
                  <TableCell className="text-center">{student.averageMarks}%</TableCell>
                  <TableCell className="text-center">{student.attendanceRate}%</TableCell>
                  <TableCell className="text-center">
                    {student.subjects.filter((s) => s.grade.startsWith("A")).length}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      {/* Footer */}
      <div className="border-t-2 border-gray-300 pt-6 mt-8">
        <div className="grid grid-cols-2 gap-8">
          <div className="text-center">
            <div className="border-t border-gray-400 pt-2 mx-8">
              <p className="text-sm text-gray-500">Class Teacher&apos;s Signature</p>
            </div>
          </div>
          <div className="text-center">
            <div className="border-t border-gray-400 pt-2 mx-8">
              <p className="text-sm text-gray-500">Principal&apos;s Signature</p>
            </div>
          </div>
        </div>
        <p className="text-center text-xs text-gray-400 mt-6">
          Generated on {new Date().toLocaleString()} | Digital Iskole School Management System
        </p>
      </div>
    </div>
  )
}

function SchoolReportPreview({ term, reportType }: { term: string; reportType: string }) {
  const totalStudents = 420
  const totalTeachers = 35
  const totalClasses = 12
  const schoolAverage = 76
  const schoolAttendance = 94

  const classPerformance = allClassesData.map((cls) => ({
    ...cls,
    average: Math.floor(Math.random() * 20) + 70,
    attendance: Math.floor(Math.random() * 10) + 90,
    passRate: Math.floor(Math.random() * 15) + 85,
  }))

  const topStudents = [...allStudentsData].sort((a, b) => b.averageMarks - a.averageMarks).slice(0, 10)

  return (
    <div className="bg-white text-black p-8 max-w-4xl mx-auto" id="school-report-content">
      {/* Report Header */}
      <div className="text-center border-b-2 border-gray-800 pb-6 mb-6">
        <div className="flex justify-center mb-4">
          <div className="h-16 w-16 rounded-full bg-teal-600 flex items-center justify-center">
            <School className="h-8 w-8 text-white" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Digital Iskole</h1>
        <p className="text-gray-600">School Performance Report</p>
        <div className="mt-2">
          <Badge variant="outline" className="text-teal-700 border-teal-700">
            {reportType} - {term} {new Date().getFullYear()}
          </Badge>
        </div>
      </div>

      {/* School Overview */}
      <div className="grid grid-cols-2 gap-6 mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <School className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-500">School:</span>
            <span className="font-semibold">Digital Iskole</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-500">Academic Year:</span>
            <span className="font-semibold">{new Date().getFullYear()}</span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-500">Total Students:</span>
            <span className="font-semibold">{totalStudents}</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-500">Total Teachers:</span>
            <span className="font-semibold">{totalTeachers}</span>
          </div>
        </div>
      </div>

      {/* School Performance Summary */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="text-center p-4 bg-teal-50 rounded-lg border border-teal-200">
          <p className="text-2xl font-bold text-teal-700">{schoolAverage}%</p>
          <p className="text-xs text-teal-600">School Average</p>
        </div>
        <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-2xl font-bold text-blue-700">{schoolAttendance}%</p>
          <p className="text-xs text-blue-600">Attendance</p>
        </div>
        <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
          <p className="text-2xl font-bold text-purple-700">{totalStudents}</p>
          <p className="text-xs text-purple-600">Students</p>
        </div>
        <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
          <p className="text-2xl font-bold text-orange-700">{totalClasses}</p>
          <p className="text-xs text-orange-600">Classes</p>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
          <p className="text-2xl font-bold text-green-700">{totalTeachers}</p>
          <p className="text-xs text-green-600">Teachers</p>
        </div>
      </div>

      {/* Class-wise Performance */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-teal-600" />
          Class-wise Performance
        </h2>
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-100">
              <TableHead>Class</TableHead>
              <TableHead>Class Teacher</TableHead>
              <TableHead className="text-center">Students</TableHead>
              <TableHead className="text-center">Average</TableHead>
              <TableHead className="text-center">Attendance</TableHead>
              <TableHead className="text-center">Pass Rate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {classPerformance.map((cls) => (
              <TableRow key={cls.id}>
                <TableCell className="font-medium">{cls.name}</TableCell>
                <TableCell>{cls.teacher}</TableCell>
                <TableCell className="text-center">{cls.students}</TableCell>
                <TableCell className="text-center">{cls.average}%</TableCell>
                <TableCell className="text-center">{cls.attendance}%</TableCell>
                <TableCell className="text-center">{cls.passRate}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Top 10 Students School-wide */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Award className="h-5 w-5 text-teal-600" />
          Top 10 Students (School-wide)
        </h2>
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-100">
              <TableHead>Rank</TableHead>
              <TableHead>Student Name</TableHead>
              <TableHead>Class</TableHead>
              <TableHead className="text-center">Average</TableHead>
              <TableHead className="text-center">Attendance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topStudents.map((student, index) => (
              <TableRow key={student.id}>
                <TableCell className="font-bold text-teal-600">#{index + 1}</TableCell>
                <TableCell className="font-medium">{student.name}</TableCell>
                <TableCell>{student.class}</TableCell>
                <TableCell className="text-center">{student.averageMarks}%</TableCell>
                <TableCell className="text-center">{student.attendanceRate}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Performance Distribution */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-teal-600" />
          Performance Distribution
        </h2>
        <div className="grid grid-cols-5 gap-4">
          <div className="p-3 bg-green-50 rounded-lg text-center border border-green-200">
            <p className="text-xl font-bold text-green-600">85</p>
            <p className="text-xs text-green-600">A Grade (90%+)</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg text-center border border-blue-200">
            <p className="text-xl font-bold text-blue-600">120</p>
            <p className="text-xs text-blue-600">B Grade (75-89%)</p>
          </div>
          <div className="p-3 bg-yellow-50 rounded-lg text-center border border-yellow-200">
            <p className="text-xl font-bold text-yellow-600">140</p>
            <p className="text-xs text-yellow-600">C Grade (60-74%)</p>
          </div>
          <div className="p-3 bg-orange-50 rounded-lg text-center border border-orange-200">
            <p className="text-xl font-bold text-orange-600">55</p>
            <p className="text-xs text-orange-600">D Grade (40-59%)</p>
          </div>
          <div className="p-3 bg-red-50 rounded-lg text-center border border-red-200">
            <p className="text-xl font-bold text-red-600">20</p>
            <p className="text-xs text-red-600">F Grade (&lt;40%)</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t-2 border-gray-300 pt-6 mt-8">
        <div className="grid grid-cols-2 gap-8">
          <div className="text-center">
            <div className="border-t border-gray-400 pt-2 mx-8">
              <p className="text-sm text-gray-500">Vice Principal&apos;s Signature</p>
            </div>
          </div>
          <div className="text-center">
            <div className="border-t border-gray-400 pt-2 mx-8">
              <p className="text-sm text-gray-500">Principal&apos;s Signature</p>
            </div>
          </div>
        </div>
        <p className="text-center text-xs text-gray-400 mt-6">
          Generated on {new Date().toLocaleString()} | Digital Iskole School Management System
        </p>
      </div>
    </div>
  )
}

export default function ReportsPage() {
  const { t } = useLanguage()
  const { user } = useAuth()

  // Parent state
  const [selectedChild, setSelectedChild] = useState(childrenData[0])
  const [parentReports, setParentReports] = useState(initialParentReports)
  const [reportType, setReportType] = useState("Term Report")
  const [selectedTerm, setSelectedTerm] = useState("Third Term")
  const [isGenerating, setIsGenerating] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [viewingReport, setViewingReport] = useState<(typeof initialParentReports)[0] | null>(null)
  const [viewParentDialogOpen, setViewParentDialogOpen] = useState(false)

  // Teacher state
  const [teacherReportCategory, setTeacherReportCategory] = useState<"individual" | "class">("individual")
  const [selectedStudent, setSelectedStudent] = useState(classStudentsData[0])
  const [viewTeacherDialogOpen, setViewTeacherDialogOpen] = useState(false)
  const [classReportType, setClassReportType] = useState("Term Report")
  const [teacherReportType, setTeacherReportType] = useState("Term Report")
  const [teacherSelectedTerm, setTeacherSelectedTerm] = useState("Third Term")
  const [isTeacherGenerating, setIsTeacherGenerating] = useState(false)
  const [teacherPreviewOpen, setTeacherPreviewOpen] = useState(false)
  const [teacherReports, setTeacherReports] = useState(initialTeacherReports)
  const [viewingTeacherReport, setViewingTeacherReport] = useState<(typeof initialTeacherReports)[0] | null>(null)

  const [adminReportCategory, setAdminReportCategory] = useState<"individual" | "class" | "school">("individual")
  const [adminSelectedClass, setAdminSelectedClass] = useState(allClassesData[8]) // Default to 10-A
  const [adminSelectedStudent, setAdminSelectedStudent] = useState(allStudentsData[0])
  const [adminReportType, setAdminReportType] = useState("Term Report")
  const [adminSelectedTerm, setAdminSelectedTerm] = useState("Third Term")
  const [isAdminGenerating, setIsAdminGenerating] = useState(false)
  const [adminPreviewOpen, setAdminPreviewOpen] = useState(false)
  const [adminReports, setAdminReports] = useState(initialAdminReports)
  const [viewingAdminReport, setViewingAdminReport] = useState<(typeof initialAdminReports)[0] | null>(null)
  const [viewAdminDialogOpen, setViewAdminDialogOpen] = useState(false)

  // Get students for selected class (admin)
  const studentsInSelectedClass = allStudentsData.filter(
    (s) => s.class === adminSelectedClass.name.replace("Grade ", ""),
  )

  // Parent handlers
  const handleGenerateReport = () => {
    setIsGenerating(true)
    setTimeout(() => {
      const newReport = {
        id: `report-${Date.now()}`,
        childId: selectedChild.id,
        childName: selectedChild.name,
        type: reportType,
        term: selectedTerm,
        generatedAt: new Date().toISOString(),
        academicYear: "2024",
      }
      setParentReports([newReport, ...parentReports])
      setIsGenerating(false)
      setPreviewOpen(false)
    }, 1500)
  }

  const handleDeleteReport = (reportId: string) => {
    setParentReports(parentReports.filter((r) => r.id !== reportId))
  }

  const handleDownloadPDF = (report: (typeof initialParentReports)[0]) => {
    const child = childrenData.find((c) => c.id === report.childId)
    if (!child) return
    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(generatePrintHTML(child, report))
      printWindow.document.close()
      printWindow.print()
    }
  }

  // Teacher handlers
  const handleTeacherGenerateReport = () => {
    setIsTeacherGenerating(true)
    setTimeout(() => {
      const newReport = {
        id: `report-${Date.now()}`,
        type: teacherReportCategory === "individual" ? teacherReportType : classReportType,
        studentId: teacherReportCategory === "individual" ? selectedStudent.id : null,
        studentName: teacherReportCategory === "individual" ? selectedStudent.name : null,
        term: teacherSelectedTerm,
        academicYear: new Date().getFullYear().toString(),
        generatedAt: new Date().toISOString(),
        reportCategory: teacherReportCategory,
      }
      setTeacherReports([newReport, ...teacherReports])
      setIsTeacherGenerating(false)
      setTeacherPreviewOpen(false)
    }, 1500)
  }

  const handleDownloadTeacherPDF = (report: (typeof initialTeacherReports)[0]) => {
    const printWindow = window.open("", "_blank")
    if (printWindow) {
      if (report.reportCategory === "individual" && report.studentId) {
        const student = classStudentsData.find((s) => s.id === report.studentId)
        if (student) {
          printWindow.document.write(generateStudentPrintHTML(student, report))
        }
      } else {
        printWindow.document.write(generateClassPrintHTML(classStudentsData, report))
      }
      printWindow.document.close()
      printWindow.print()
    }
  }

  const handleAdminGenerateReport = () => {
    setIsAdminGenerating(true)
    setTimeout(() => {
      const newReport = {
        id: `areport-${Date.now()}`,
        type: adminReportType,
        studentId: adminReportCategory === "individual" ? adminSelectedStudent.id : null,
        studentName: adminReportCategory === "individual" ? adminSelectedStudent.name : null,
        className: adminReportCategory === "class" ? adminSelectedClass.name : null,
        term: adminSelectedTerm,
        academicYear: new Date().getFullYear().toString(),
        generatedAt: new Date().toISOString(),
        reportCategory: adminReportCategory,
      }
      setAdminReports([newReport, ...adminReports])
      setIsAdminGenerating(false)
      setAdminPreviewOpen(false)
    }, 1500)
  }

  const handleDownloadAdminPDF = (report: (typeof initialAdminReports)[0]) => {
    const printWindow = window.open("", "_blank")
    if (printWindow) {
      if (report.reportCategory === "individual" && report.studentId) {
        const student = allStudentsData.find((s) => s.id === report.studentId)
        if (student) {
          printWindow.document.write(generateStudentPrintHTML(student, { ...report, type: report.type }))
        }
      } else if (report.reportCategory === "class") {
        const classInfo = allClassesData.find((c) => c.name === report.className)
        printWindow.document.write(
          generateClassPrintHTML(
            classStudentsData,
            { ...report, type: report.type },
            report.className || "Class",
            classInfo?.teacher || "Teacher",
          ),
        )
      } else {
        printWindow.document.write(generateSchoolPrintHTML(report))
      }
      printWindow.document.close()
      printWindow.print()
    }
  }

  // Generate print HTML for parent reports
  const generatePrintHTML = (child: (typeof childrenData)[0], report: (typeof initialParentReports)[0]) => `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Report - ${child.name}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; color: #000; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
        .header h1 { margin: 0; font-size: 24px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; padding: 15px; background: #f5f5f5; border-radius: 8px; }
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 20px; }
        .stat-box { text-align: center; padding: 15px; border-radius: 8px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
        th { background: #f0f0f0; }
        .footer { border-top: 2px solid #ccc; padding-top: 20px; margin-top: 30px; }
        .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; text-align: center; }
        @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Digital Iskole</h1>
        <p>Student Academic Report</p>
        <p><strong>${report.type} - ${report.term} ${report.academicYear}</strong></p>
      </div>
      <div class="info-grid">
        <div>
          <p><strong>Student Name:</strong> ${child.name}</p>
          <p><strong>Admission No:</strong> ${child.admissionNo}</p>
          <p><strong>Date of Birth:</strong> ${new Date(child.dateOfBirth).toLocaleDateString()}</p>
        </div>
        <div>
          <p><strong>Class:</strong> ${child.class}</p>
          <p><strong>Class Teacher:</strong> ${child.classTeacher}</p>
          <p><strong>Class Rank:</strong> ${child.rank} / ${child.totalStudents}</p>
        </div>
      </div>
      <div class="stats-grid">
        <div class="stat-box" style="background: #e0f2f1;"><div style="font-size: 24px; font-weight: bold; color: #00796b;">${child.averageMarks}%</div><div style="font-size: 12px; color: #00796b;">Average</div></div>
        <div class="stat-box" style="background: #e3f2fd;"><div style="font-size: 24px; font-weight: bold; color: #1976d2;">${child.attendanceRate}%</div><div style="font-size: 12px; color: #1976d2;">Attendance</div></div>
        <div class="stat-box" style="background: #f3e5f5;"><div style="font-size: 24px; font-weight: bold; color: #7b1fa2;">#${child.rank}</div><div style="font-size: 12px; color: #7b1fa2;">Rank</div></div>
        <div class="stat-box" style="background: #e8f5e9;"><div style="font-size: 24px; font-weight: bold; color: #388e3c;">${child.subjects.filter((s) => s.grade.startsWith("A")).length}</div><div style="font-size: 12px; color: #388e3c;">A Grades</div></div>
      </div>
      <h3>Subject-wise Performance</h3>
      <table><thead><tr><th>Subject</th><th>Marks</th><th>Grade</th></tr></thead><tbody>${child.subjects.map((s) => `<tr><td>${s.name}</td><td>${s.marks}/100</td><td>${s.grade}</td></tr>`).join("")}</tbody></table>
      <div class="footer">
        <div class="signatures">
          <div><div style="border-top: 1px solid #333; padding-top: 5px; margin: 0 20px;">Class Teacher</div></div>
          <div><div style="border-top: 1px solid #333; padding-top: 5px; margin: 0 20px;">Principal</div></div>
        </div>
        <p style="text-align: center; font-size: 12px; color: #666; margin-top: 20px;">Generated on ${new Date().toLocaleString()} | Digital Iskole</p>
      </div>
    </body>
    </html>
  `

  // Generate print HTML for student reports (teacher/admin)
  const generateStudentPrintHTML = (
    student: (typeof classStudentsData)[0],
    report: { type: string; term: string; academicYear: string },
  ) => `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Report - ${student.name}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; color: #000; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
        .header h1 { margin: 0; font-size: 24px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; padding: 15px; background: #f5f5f5; border-radius: 8px; }
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 20px; }
        .stat-box { text-align: center; padding: 15px; border-radius: 8px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
        th { background: #f0f0f0; }
        .footer { border-top: 2px solid #ccc; padding-top: 20px; margin-top: 30px; }
        .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; text-align: center; }
        @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Digital Iskole</h1>
        <p>Student Academic Report</p>
        <p><strong>${report.type} - ${report.term} ${report.academicYear}</strong></p>
      </div>
      <div class="info-grid">
        <div>
          <p><strong>Student Name:</strong> ${student.name}</p>
          <p><strong>Admission No:</strong> ${student.admissionNo}</p>
          <p><strong>Date of Birth:</strong> ${new Date(student.dateOfBirth).toLocaleDateString()}</p>
        </div>
        <div>
          <p><strong>Class:</strong> ${student.class}</p>
          <p><strong>Class Teacher:</strong> ${student.classTeacher}</p>
          <p><strong>Class Rank:</strong> ${student.rank} / ${student.totalStudents}</p>
        </div>
      </div>
      <div class="stats-grid">
        <div class="stat-box" style="background: #e0f2f1;"><div style="font-size: 24px; font-weight: bold; color: #00796b;">${student.averageMarks}%</div><div style="font-size: 12px; color: #00796b;">Average</div></div>
        <div class="stat-box" style="background: #e3f2fd;"><div style="font-size: 24px; font-weight: bold; color: #1976d2;">${student.attendanceRate}%</div><div style="font-size: 12px; color: #1976d2;">Attendance</div></div>
        <div class="stat-box" style="background: #f3e5f5;"><div style="font-size: 24px; font-weight: bold; color: #7b1fa2;">#${student.rank}</div><div style="font-size: 12px; color: #7b1fa2;">Rank</div></div>
        <div class="stat-box" style="background: #e8f5e9;"><div style="font-size: 24px; font-weight: bold; color: #388e3c;">${student.subjects.filter((s) => s.grade.startsWith("A")).length}</div><div style="font-size: 12px; color: #388e3c;">A Grades</div></div>
      </div>
      <h3>Subject-wise Performance</h3>
      <table><thead><tr><th>Subject</th><th>Marks</th><th>Grade</th></tr></thead><tbody>${student.subjects.map((s) => `<tr><td>${s.name}</td><td>${s.marks}/100</td><td>${s.grade}</td></tr>`).join("")}</tbody></table>
      <h3>Term Progress</h3>
      <table><thead><tr><th>Term</th><th>Average</th><th>Rank</th></tr></thead><tbody>${student.termProgress.map((tp) => `<tr><td>${tp.term}</td><td>${tp.average}%</td><td>#${tp.rank}</td></tr>`).join("")}</tbody></table>
      <h3>Attendance Summary</h3>
      <table><thead><tr><th>Total Days</th><th>Present</th><th>Absent</th><th>Late</th></tr></thead><tbody><tr><td>${student.attendance.totalDays}</td><td>${student.attendance.present}</td><td>${student.attendance.absent}</td><td>${student.attendance.late}</td></tr></tbody></table>
      ${student.achievements.length > 0 ? `<h3>Achievements</h3><ul>${student.achievements.map((a) => `<li>${a}</li>`).join("")}</ul>` : ""}
      <div class="footer">
        <div class="signatures">
          <div><div style="border-top: 1px solid #333; padding-top: 5px; margin: 0 20px;">Class Teacher</div></div>
          <div><div style="border-top: 1px solid #333; padding-top: 5px; margin: 0 20px;">Principal</div></div>
        </div>
        <p style="text-align: center; font-size: 12px; color: #666; margin-top: 20px;">Generated on ${new Date().toLocaleString()} | Digital Iskole</p>
      </div>
    </body>
    </html>
  `

  // Generate print HTML for class reports
  const generateClassPrintHTML = (
    students: typeof classStudentsData,
    report: { type: string; term: string; academicYear: string },
    className = "Grade 10-A",
    classTeacher = "Mrs. Perera",
  ) => {
    const classAverage = Math.round(students.reduce((sum, s) => sum + s.averageMarks, 0) / students.length)
    const classAttendance = Math.round(students.reduce((sum, s) => sum + s.attendanceRate, 0) / students.length)
    const subjectAverages = students[0].subjects.map((_, idx) => ({
      name: students[0].subjects[idx].name,
      average: Math.round(students.reduce((sum, s) => sum + s.subjects[idx].marks, 0) / students.length),
    }))

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Class Report - ${className}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; color: #000; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
        .header h1 { margin: 0; font-size: 24px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; padding: 15px; background: #f5f5f5; border-radius: 8px; }
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 20px; }
        .stat-box { text-align: center; padding: 15px; border-radius: 8px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
        th { background: #f0f0f0; }
        .footer { border-top: 2px solid #ccc; padding-top: 20px; margin-top: 30px; }
        .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; text-align: center; }
        @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Digital Iskole</h1>
        <p>Class Performance Report</p>
        <p><strong>${className} - ${report.term} ${report.academicYear}</strong></p>
      </div>
      <div class="info-grid">
        <div>
          <p><strong>Class:</strong> ${className}</p>
          <p><strong>Class Teacher:</strong> ${classTeacher}</p>
        </div>
        <div>
          <p><strong>Total Students:</strong> ${students.length}</p>
          <p><strong>Academic Year:</strong> ${report.academicYear}</p>
        </div>
      </div>
      <div class="stats-grid">
        <div class="stat-box" style="background: #e0f2f1;"><div style="font-size: 24px; font-weight: bold; color: #00796b;">${classAverage}%</div><div style="font-size: 12px; color: #00796b;">Class Average</div></div>
        <div class="stat-box" style="background: #e3f2fd;"><div style="font-size: 24px; font-weight: bold; color: #1976d2;">${classAttendance}%</div><div style="font-size: 12px; color: #1976d2;">Attendance</div></div>
        <div class="stat-box" style="background: #f3e5f5;"><div style="font-size: 24px; font-weight: bold; color: #7b1fa2;">${students.length}</div><div style="font-size: 12px; color: #7b1fa2;">Students</div></div>
        <div class="stat-box" style="background: #e8f5e9;"><div style="font-size: 24px; font-weight: bold; color: #388e3c;">${students.filter((s) => s.averageMarks >= 75).length}</div><div style="font-size: 12px; color: #388e3c;">Above 75%</div></div>
      </div>
      <h3>Subject-wise Class Average</h3>
      <table><thead><tr><th>Subject</th><th>Class Average</th></tr></thead><tbody>${subjectAverages.map((s) => `<tr><td>${s.name}</td><td>${s.average}%</td></tr>`).join("")}</tbody></table>
      <h3>All Students Performance</h3>
      <table><thead><tr><th>Rank</th><th>Name</th><th>Average</th><th>Attendance</th></tr></thead><tbody>${[...students]
        .sort((a, b) => a.rank - b.rank)
        .map(
          (s) =>
            `<tr><td>#${s.rank}</td><td>${s.name}</td><td>${s.averageMarks}%</td><td>${s.attendanceRate}%</td></tr>`,
        )
        .join("")}</tbody></table>
      <div class="footer">
        <div class="signatures">
          <div><div style="border-top: 1px solid #333; padding-top: 5px; margin: 0 20px;">Class Teacher</div></div>
          <div><div style="border-top: 1px solid #333; padding-top: 5px; margin: 0 20px;">Principal</div></div>
        </div>
        <p style="text-align: center; font-size: 12px; color: #666; margin-top: 20px;">Generated on ${new Date().toLocaleString()} | Digital Iskole</p>
      </div>
    </body>
    </html>
  `
  }

  const generateSchoolPrintHTML = (report: (typeof initialAdminReports)[0]) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>School Report - Digital Iskole</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; color: #000; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
        .header h1 { margin: 0; font-size: 24px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; padding: 15px; background: #f5f5f5; border-radius: 8px; }
        .stats-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; margin-bottom: 20px; }
        .stat-box { text-align: center; padding: 15px; border-radius: 8px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
        th { background: #f0f0f0; }
        .footer { border-top: 2px solid #ccc; padding-top: 20px; margin-top: 30px; }
        .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; text-align: center; }
        @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Digital Iskole</h1>
        <p>School Performance Report</p>
        <p><strong>${report.type} - ${report.term} ${report.academicYear}</strong></p>
      </div>
      <div class="info-grid">
        <div>
          <p><strong>School:</strong> Digital Iskole</p>
          <p><strong>Academic Year:</strong> ${report.academicYear}</p>
        </div>
        <div>
          <p><strong>Total Students:</strong> 420</p>
          <p><strong>Total Teachers:</strong> 35</p>
        </div>
      </div>
      <div class="stats-grid">
        <div class="stat-box" style="background: #e0f2f1;"><div style="font-size: 20px; font-weight: bold; color: #00796b;">76%</div><div style="font-size: 11px; color: #00796b;">School Average</div></div>
        <div class="stat-box" style="background: #e3f2fd;"><div style="font-size: 20px; font-weight: bold; color: #1976d2;">94%</div><div style="font-size: 11px; color: #1976d2;">Attendance</div></div>
        <div class="stat-box" style="background: #f3e5f5;"><div style="font-size: 20px; font-weight: bold; color: #7b1fa2;">420</div><div style="font-size: 11px; color: #7b1fa2;">Students</div></div>
        <div class="stat-box" style="background: #fff3e0;"><div style="font-size: 20px; font-weight: bold; color: #e65100;">12</div><div style="font-size: 11px; color: #e65100;">Classes</div></div>
        <div class="stat-box" style="background: #e8f5e9;"><div style="font-size: 20px; font-weight: bold; color: #388e3c;">35</div><div style="font-size: 11px; color: #388e3c;">Teachers</div></div>
      </div>
      <h3>Class-wise Performance</h3>
      <table>
        <thead><tr><th>Class</th><th>Teacher</th><th>Students</th><th>Average</th><th>Attendance</th></tr></thead>
        <tbody>
          ${allClassesData.map((cls) => `<tr><td>${cls.name}</td><td>${cls.teacher}</td><td>${cls.students}</td><td>${Math.floor(Math.random() * 20) + 70}%</td><td>${Math.floor(Math.random() * 10) + 90}%</td></tr>`).join("")}
        </tbody>
      </table>
      <h3>Top 10 Students (School-wide)</h3>
      <table>
        <thead><tr><th>Rank</th><th>Name</th><th>Class</th><th>Average</th></tr></thead>
        <tbody>
          ${[...allStudentsData]
            .sort((a, b) => b.averageMarks - a.averageMarks)
            .slice(0, 10)
            .map(
              (s, i) => `<tr><td>#${i + 1}</td><td>${s.name}</td><td>${s.class}</td><td>${s.averageMarks}%</td></tr>`,
            )
            .join("")}
        </tbody>
      </table>
      <div class="footer">
        <div class="signatures">
          <div><div style="border-top: 1px solid #333; padding-top: 5px; margin: 0 20px;">Vice Principal</div></div>
          <div><div style="border-top: 1px solid #333; padding-top: 5px; margin: 0 20px;">Principal</div></div>
        </div>
        <p style="text-align: center; font-size: 12px; color: #666; margin-top: 20px;">Generated on ${new Date().toLocaleString()} | Digital Iskole</p>
      </div>
    </body>
    </html>
  `
  }

  const childReports = parentReports.filter((r) => r.childId === selectedChild.id)

  if (user?.role === "admin") {
    return (
      <div className="container mx-auto py-6 px-4 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{t("reports")}</h1>
          <p className="text-muted-foreground">
            Generate and manage academic reports for students, classes, and the entire school
          </p>
        </div>

        {/* Report Category Selection */}
        <Tabs
          value={adminReportCategory}
          onValueChange={(v) => setAdminReportCategory(v as "individual" | "class" | "school")}
        >
          <TabsList className="grid w-full max-w-lg grid-cols-3">
            <TabsTrigger value="individual">
              <User className="mr-2 h-4 w-4" />
              {t("individualStudent")}
            </TabsTrigger>
            <TabsTrigger value="class">
              <Users className="mr-2 h-4 w-4" />
              {t("entireClass")}
            </TabsTrigger>
            <TabsTrigger value="school">
              <School className="mr-2 h-4 w-4" />
              School
            </TabsTrigger>
          </TabsList>

          {/* Individual Student Report */}
          <TabsContent value="individual" className="space-y-6">
            {/* Class and Student Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {t("selectStudent")}
                </CardTitle>
                <CardDescription>First select a class, then choose a student to generate their report</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Select Class</label>
                    <Select
                      value={adminSelectedClass.id}
                      onValueChange={(value) => {
                        const cls = allClassesData.find((c) => c.id === value)
                        if (cls) {
                          setAdminSelectedClass(cls)
                          // Reset student selection when class changes
                          const studentsInClass = allStudentsData.filter(
                            (s) => s.class === cls.name.replace("Grade ", ""),
                          )
                          if (studentsInClass.length > 0) {
                            setAdminSelectedStudent(studentsInClass[0])
                          }
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a class" />
                      </SelectTrigger>
                      <SelectContent>
                        {allClassesData.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id}>
                            {cls.name} ({cls.teacher})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Select Student</label>
                    <Select
                      value={adminSelectedStudent.id}
                      onValueChange={(value) => {
                        const student = allStudentsData.find((s) => s.id === value)
                        if (student) setAdminSelectedStudent(student)
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a student" />
                      </SelectTrigger>
                      <SelectContent>
                        {studentsInSelectedClass.length > 0 ? (
                          studentsInSelectedClass.map((student) => (
                            <SelectItem key={student.id} value={student.id}>
                              {student.name} - {student.admissionNo}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="none" disabled>
                            No students in this class
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Generate Report */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  {t("generateReport")}
                </CardTitle>
                <CardDescription>Create a new report for {adminSelectedStudent.name}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t("reportType")}</label>
                    <Select value={adminReportType} onValueChange={setAdminReportType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Term Report">{t("termReport")}</SelectItem>
                        <SelectItem value="Progress Report">{t("progressReport")}</SelectItem>
                        <SelectItem value="Attendance Report">{t("attendanceReport")}</SelectItem>
                        <SelectItem value="Full Academic Report">{t("fullAcademicReport")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t("selectTerm")}</label>
                    <Select value={adminSelectedTerm} onValueChange={setAdminSelectedTerm}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="First Term">{t("firstTerm")}</SelectItem>
                        <SelectItem value="Second Term">{t("secondTerm")}</SelectItem>
                        <SelectItem value="Third Term">{t("thirdTerm")}</SelectItem>
                        <SelectItem value="Annual">Annual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Dialog open={adminPreviewOpen} onOpenChange={setAdminPreviewOpen}>
                      <Button onClick={() => setAdminPreviewOpen(true)} className="w-full">
                        <Eye className="mr-2 h-4 w-4" />
                        Preview & Generate
                      </Button>
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>{t("reportPreview")}</DialogTitle>
                          <DialogDescription>{t("reportPreviewDescription")}</DialogDescription>
                        </DialogHeader>
                        <StudentReportPreview
                          student={adminSelectedStudent}
                          reportType={adminReportType}
                          term={adminSelectedTerm}
                        />
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setAdminPreviewOpen(false)}>
                            {t("cancel")}
                          </Button>
                          <Button onClick={handleAdminGenerateReport} disabled={isAdminGenerating}>
                            {isAdminGenerating ? t("generating") : t("saveReport")}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Class Report */}
          <TabsContent value="class" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Select Class
                </CardTitle>
                <CardDescription>Choose a class to generate their performance report</CardDescription>
              </CardHeader>
              <CardContent>
                <Select
                  value={adminSelectedClass.id}
                  onValueChange={(value) => {
                    const cls = allClassesData.find((c) => c.id === value)
                    if (cls) setAdminSelectedClass(cls)
                  }}
                >
                  <SelectTrigger className="w-full max-w-md">
                    <SelectValue placeholder="Select a class" />
                  </SelectTrigger>
                  <SelectContent>
                    {allClassesData.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name} - {cls.teacher} ({cls.students} students)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  {t("generateReport")}
                </CardTitle>
                <CardDescription>Generate a comprehensive report for {adminSelectedClass.name}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t("reportType")}</label>
                    <Select value={adminReportType} onValueChange={setAdminReportType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Term Report">{t("termReport")}</SelectItem>
                        <SelectItem value="Progress Report">{t("progressReport")}</SelectItem>
                        <SelectItem value="Attendance Report">{t("attendanceReport")}</SelectItem>
                        <SelectItem value="Full Academic Report">{t("fullAcademicReport")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t("selectTerm")}</label>
                    <Select value={adminSelectedTerm} onValueChange={setAdminSelectedTerm}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="First Term">{t("firstTerm")}</SelectItem>
                        <SelectItem value="Second Term">{t("secondTerm")}</SelectItem>
                        <SelectItem value="Third Term">{t("thirdTerm")}</SelectItem>
                        <SelectItem value="Annual">Annual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Dialog open={adminPreviewOpen} onOpenChange={setAdminPreviewOpen}>
                      <Button onClick={() => setAdminPreviewOpen(true)} className="w-full">
                        <Eye className="mr-2 h-4 w-4" />
                        Preview & Generate
                      </Button>
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Class Report Preview</DialogTitle>
                          <DialogDescription>Review the class report before saving</DialogDescription>
                        </DialogHeader>
                        <ClassReportPreview
                          students={classStudentsData}
                          term={adminSelectedTerm}
                          reportType={adminReportType}
                          className={adminSelectedClass.name}
                          classTeacher={adminSelectedClass.teacher}
                        />
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setAdminPreviewOpen(false)}>
                            {t("cancel")}
                          </Button>
                          <Button onClick={handleAdminGenerateReport} disabled={isAdminGenerating}>
                            {isAdminGenerating ? t("generating") : t("saveReport")}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* School Report */}
          <TabsContent value="school" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <School className="h-5 w-5" />
                  School Report
                </CardTitle>
                <CardDescription>Generate a comprehensive performance report for the entire school</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t("reportType")}</label>
                    <Select value={adminReportType} onValueChange={setAdminReportType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Term Report">{t("termReport")}</SelectItem>
                        <SelectItem value="Progress Report">{t("progressReport")}</SelectItem>
                        <SelectItem value="Attendance Report">{t("attendanceReport")}</SelectItem>
                        <SelectItem value="Full Academic Report">{t("fullAcademicReport")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t("selectTerm")}</label>
                    <Select value={adminSelectedTerm} onValueChange={setAdminSelectedTerm}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="First Term">{t("firstTerm")}</SelectItem>
                        <SelectItem value="Second Term">{t("secondTerm")}</SelectItem>
                        <SelectItem value="Third Term">{t("thirdTerm")}</SelectItem>
                        <SelectItem value="Annual">Annual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Dialog open={adminPreviewOpen} onOpenChange={setAdminPreviewOpen}>
                      <Button onClick={() => setAdminPreviewOpen(true)} className="w-full">
                        <Eye className="mr-2 h-4 w-4" />
                        Preview & Generate
                      </Button>
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>School Report Preview</DialogTitle>
                          <DialogDescription>Review the school-wide report before saving</DialogDescription>
                        </DialogHeader>
                        <SchoolReportPreview term={adminSelectedTerm} reportType={adminReportType} />
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setAdminPreviewOpen(false)}>
                            {t("cancel")}
                          </Button>
                          <Button onClick={handleAdminGenerateReport} disabled={isAdminGenerating}>
                            {isAdminGenerating ? t("generating") : t("saveReport")}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Generated Reports */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {t("generatedReports")}
            </CardTitle>
            <CardDescription>View and manage all generated reports</CardDescription>
          </CardHeader>
          <CardContent>
            {adminReports.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t("noReportsYet")}</p>
                <p className="text-sm">{t("generateFirstReport")}</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Student/Class</TableHead>
                    <TableHead>Term</TableHead>
                    <TableHead>Generated</TableHead>
                    <TableHead className="text-right">{t("actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {adminReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <Badge variant="outline">{report.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            report.reportCategory === "school"
                              ? "default"
                              : report.reportCategory === "class"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {report.reportCategory === "school"
                            ? "School"
                            : report.reportCategory === "class"
                              ? "Class"
                              : "Student"}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {report.reportCategory === "school"
                          ? "Entire School"
                          : report.reportCategory === "class"
                            ? report.className
                            : report.studentName}
                      </TableCell>
                      <TableCell>{report.term}</TableCell>
                      <TableCell>{new Date(report.generatedAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setViewingAdminReport(report)
                              setViewAdminDialogOpen(true)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDownloadAdminPDF(report)}>
                            <Download className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>{t("deleteReport")}</AlertDialogTitle>
                                <AlertDialogDescription>{t("deleteReportConfirmation")}</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => setAdminReports(adminReports.filter((r) => r.id !== report.id))}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  {t("delete")}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* View Admin Report Dialog */}
        <Dialog open={viewAdminDialogOpen} onOpenChange={setViewAdminDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{viewingAdminReport?.type}</DialogTitle>
              <DialogDescription>
                {viewingAdminReport?.reportCategory === "school"
                  ? "Entire School"
                  : viewingAdminReport?.reportCategory === "class"
                    ? viewingAdminReport?.className
                    : viewingAdminReport?.studentName}{" "}
                - {viewingAdminReport?.term}
              </DialogDescription>
            </DialogHeader>
            {viewingAdminReport?.reportCategory === "school" ? (
              <SchoolReportPreview term={viewingAdminReport?.term || ""} reportType={viewingAdminReport?.type || ""} />
            ) : viewingAdminReport?.reportCategory === "class" ? (
              <ClassReportPreview
                students={classStudentsData}
                term={viewingAdminReport?.term || ""}
                reportType={viewingAdminReport?.type || ""}
                className={viewingAdminReport?.className || ""}
              />
            ) : viewingAdminReport?.studentId ? (
              <StudentReportPreview
                student={allStudentsData.find((s) => s.id === viewingAdminReport.studentId) || allStudentsData[0]}
                reportType={viewingAdminReport?.type || ""}
                term={viewingAdminReport?.term || ""}
              />
            ) : null}
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewAdminDialogOpen(false)}>
                Close
              </Button>
              {viewingAdminReport && (
                <Button onClick={() => handleDownloadAdminPDF(viewingAdminReport)}>
                  <Download className="mr-2 h-4 w-4" />
                  {t("downloadPDF")}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  // Teacher UI
  if (user?.role === "teacher") {
    return (
      <div className="container mx-auto py-6 px-4 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{t("reports")}</h1>
          <p className="text-muted-foreground">Generate and manage academic reports for your class</p>
        </div>

        {/* Report Type Selection */}
        <Tabs
          value={teacherReportCategory}
          onValueChange={(v) => setTeacherReportCategory(v as "individual" | "class")}
        >
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="individual">
              <User className="mr-2 h-4 w-4" />
              {t("individualStudent")}
            </TabsTrigger>
            <TabsTrigger value="class">
              <Users className="mr-2 h-4 w-4" />
              {t("entireClass")}
            </TabsTrigger>
          </TabsList>

          {/* Individual Student Report */}
          <TabsContent value="individual" className="space-y-6">
            {/* Student Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {t("selectStudent")}
                </CardTitle>
                <CardDescription>Choose a student to generate their report</CardDescription>
              </CardHeader>
              <CardContent>
                <Select
                  value={selectedStudent.id}
                  onValueChange={(value) => {
                    const student = classStudentsData.find((s) => s.id === value)
                    if (student) setSelectedStudent(student)
                  }}
                >
                  <SelectTrigger className="w-full max-w-md">
                    <SelectValue placeholder="Select a student" />
                  </SelectTrigger>
                  <SelectContent>
                    {classStudentsData.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.name} - {student.admissionNo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Generate Report */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  {t("generateReport")}
                </CardTitle>
                <CardDescription>Create a new report for {selectedStudent.name}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t("reportType")}</label>
                    <Select value={teacherReportType} onValueChange={setTeacherReportType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Term Report">{t("termReport")}</SelectItem>
                        <SelectItem value="Progress Report">{t("progressReport")}</SelectItem>
                        <SelectItem value="Attendance Report">{t("attendanceReport")}</SelectItem>
                        <SelectItem value="Full Academic Report">{t("fullAcademicReport")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t("selectTerm")}</label>
                    <Select value={teacherSelectedTerm} onValueChange={setTeacherSelectedTerm}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="First Term">{t("firstTerm")}</SelectItem>
                        <SelectItem value="Second Term">{t("secondTerm")}</SelectItem>
                        <SelectItem value="Third Term">{t("thirdTerm")}</SelectItem>
                        <SelectItem value="Annual">Annual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Dialog open={teacherPreviewOpen} onOpenChange={setTeacherPreviewOpen}>
                      <Button onClick={() => setTeacherPreviewOpen(true)} className="w-full">
                        <Eye className="mr-2 h-4 w-4" />
                        Preview & Generate
                      </Button>
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>{t("reportPreview")}</DialogTitle>
                          <DialogDescription>{t("reportPreviewDescription")}</DialogDescription>
                        </DialogHeader>
                        <StudentReportPreview
                          student={selectedStudent}
                          reportType={teacherReportType}
                          term={teacherSelectedTerm}
                        />
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setTeacherPreviewOpen(false)}>
                            {t("cancel")}
                          </Button>
                          <Button onClick={handleTeacherGenerateReport} disabled={isTeacherGenerating}>
                            {isTeacherGenerating ? t("generating") : t("saveReport")}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Class Report */}
          <TabsContent value="class" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Class Report - 10-A
                </CardTitle>
                <CardDescription>Generate a comprehensive report for your entire class</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t("reportType")}</label>
                    <Select value={classReportType} onValueChange={setClassReportType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Term Report">{t("termReport")}</SelectItem>
                        <SelectItem value="Progress Report">{t("progressReport")}</SelectItem>
                        <SelectItem value="Attendance Report">{t("attendanceReport")}</SelectItem>
                        <SelectItem value="Full Academic Report">{t("fullAcademicReport")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t("selectTerm")}</label>
                    <Select value={teacherSelectedTerm} onValueChange={setTeacherSelectedTerm}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="First Term">{t("firstTerm")}</SelectItem>
                        <SelectItem value="Second Term">{t("secondTerm")}</SelectItem>
                        <SelectItem value="Third Term">{t("thirdTerm")}</SelectItem>
                        <SelectItem value="Annual">Annual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Dialog open={teacherPreviewOpen} onOpenChange={setTeacherPreviewOpen}>
                      <Button onClick={() => setTeacherPreviewOpen(true)} className="w-full">
                        <Eye className="mr-2 h-4 w-4" />
                        Preview & Generate
                      </Button>
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Class Report Preview</DialogTitle>
                          <DialogDescription>Review the class report before saving</DialogDescription>
                        </DialogHeader>
                        <ClassReportPreview
                          students={classStudentsData}
                          term={teacherSelectedTerm}
                          reportType={classReportType}
                        />
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setTeacherPreviewOpen(false)}>
                            {t("cancel")}
                          </Button>
                          <Button onClick={handleTeacherGenerateReport} disabled={isTeacherGenerating}>
                            {isTeacherGenerating ? t("generating") : t("saveReport")}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Generated Reports */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {t("generatedReports")}
            </CardTitle>
            <CardDescription>View and manage all generated reports</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Report Type</TableHead>
                  <TableHead>Student/Class</TableHead>
                  <TableHead>Term</TableHead>
                  <TableHead>Generated</TableHead>
                  <TableHead className="text-right">{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teacherReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      <Badge variant={report.reportCategory === "class" ? "default" : "outline"}>{report.type}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {report.reportCategory === "class" ? "Class 10-A" : report.studentName}
                    </TableCell>
                    <TableCell>{report.term}</TableCell>
                    <TableCell>{new Date(report.generatedAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setViewingTeacherReport(report)
                            setViewTeacherDialogOpen(true)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDownloadTeacherPDF(report)}>
                          <Download className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{t("deleteReport")}</AlertDialogTitle>
                              <AlertDialogDescription>{t("deleteReportConfirmation")}</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => setTeacherReports(teacherReports.filter((r) => r.id !== report.id))}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                {t("delete")}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* View Teacher Report Dialog */}
        <Dialog open={viewTeacherDialogOpen} onOpenChange={setViewTeacherDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{viewingTeacherReport?.type}</DialogTitle>
              <DialogDescription>
                {viewingTeacherReport?.reportCategory === "class" ? "Class 10-A" : viewingTeacherReport?.studentName} -{" "}
                {viewingTeacherReport?.term}
              </DialogDescription>
            </DialogHeader>
            {viewingTeacherReport?.reportCategory === "class" ? (
              <ClassReportPreview
                students={classStudentsData}
                term={viewingTeacherReport?.term || ""}
                reportType={viewingTeacherReport?.type || ""}
              />
            ) : viewingTeacherReport?.studentId ? (
              <StudentReportPreview
                student={classStudentsData.find((s) => s.id === viewingTeacherReport.studentId) || classStudentsData[0]}
                reportType={viewingTeacherReport?.type || ""}
                term={viewingTeacherReport?.term || ""}
              />
            ) : null}
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewTeacherDialogOpen(false)}>
                Close
              </Button>
              {viewingTeacherReport && (
                <Button onClick={() => handleDownloadTeacherPDF(viewingTeacherReport)}>
                  <Download className="mr-2 h-4 w-4" />
                  {t("downloadPDF")}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  // Parent UI
  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t("reports")}</h1>
        <p className="text-muted-foreground">{t("reportsDescription")}</p>
      </div>

      {/* Child Selection Tabs */}
      {childrenData.length > 1 && (
        <Tabs
          value={selectedChild.id}
          onValueChange={(value) => {
            const child = childrenData.find((c) => c.id === value)
            if (child) setSelectedChild(child)
          }}
        >
          <TabsList>
            {childrenData.map((child) => (
              <TabsTrigger key={child.id} value={child.id} className="gap-2">
                <GraduationCap className="h-4 w-4" />
                {child.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      {/* Generate Report Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            {t("generateReport")}
          </CardTitle>
          <CardDescription>{t("generateReportDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("reportType")}</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Term Report">{t("termReport")}</SelectItem>
                  <SelectItem value="Progress Report">{t("progressReport")}</SelectItem>
                  <SelectItem value="Attendance Report">{t("attendanceReport")}</SelectItem>
                  <SelectItem value="Full Academic Report">{t("fullAcademicReport")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("selectTerm")}</label>
              <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="First Term">{t("firstTerm")}</SelectItem>
                  <SelectItem value="Second Term">{t("secondTerm")}</SelectItem>
                  <SelectItem value="Third Term">{t("thirdTerm")}</SelectItem>
                  <SelectItem value="Annual">Annual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                <Button onClick={() => setPreviewOpen(true)} className="w-full">
                  <Eye className="mr-2 h-4 w-4" />
                  Preview & Generate
                </Button>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{t("reportPreview")}</DialogTitle>
                    <DialogDescription>{t("reportPreviewDescription")}</DialogDescription>
                  </DialogHeader>
                  <StudentReportPreview student={selectedChild} reportType={reportType} term={selectedTerm} />
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setPreviewOpen(false)}>
                      {t("cancel")}
                    </Button>
                    <Button onClick={handleGenerateReport} disabled={isGenerating}>
                      {isGenerating ? t("generating") : t("saveReport")}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generated Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {t("generatedReports")}
          </CardTitle>
          <CardDescription>
            {childReports.length} {t("reportsFor")} {selectedChild.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {childReports.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{t("noReportsYet")}</p>
              <p className="text-sm">{t("generateFirstReport")}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Report Type</TableHead>
                  <TableHead>Term</TableHead>
                  <TableHead>Generated</TableHead>
                  <TableHead className="text-right">{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {childReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      <Badge variant="outline">{report.type}</Badge>
                    </TableCell>
                    <TableCell>{report.term}</TableCell>
                    <TableCell>{new Date(report.generatedAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setViewingReport(report)
                            setViewParentDialogOpen(true)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDownloadPDF(report)}>
                          <Download className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{t("deleteReport")}</AlertDialogTitle>
                              <AlertDialogDescription>{t("deleteReportConfirmation")}</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteReport(report.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                {t("delete")}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* View Parent Report Dialog */}
      <Dialog open={viewParentDialogOpen} onOpenChange={setViewParentDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{viewingReport?.type}</DialogTitle>
            <DialogDescription>
              {viewingReport?.childName} - {viewingReport?.term}
            </DialogDescription>
          </DialogHeader>
          {viewingReport && (
            <StudentReportPreview
              student={childrenData.find((c) => c.id === viewingReport.childId) || selectedChild}
              reportType={viewingReport.type}
              term={viewingReport.term}
            />
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewParentDialogOpen(false)}>
              Close
            </Button>
            {viewingReport && (
              <Button onClick={() => handleDownloadPDF(viewingReport)}>
                <Download className="mr-2 h-4 w-4" />
                {t("downloadPDF")}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
