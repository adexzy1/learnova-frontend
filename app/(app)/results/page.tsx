"use client"

import { useState } from "react"
import { Search, Download, Eye, FileSpreadsheet, Printer } from "lucide-react"
import useSWR from "swr"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageHeader } from "@/components/shared/page-header"
import { mockApi } from "@/lib/api"

interface StudentResult {
  studentId: string
  studentName: string
  admissionNumber: string
  classId: string
  className: string
  subjects: {
    subjectId: string
    subjectName: string
    ca1: number
    ca2: number
    exam: number
    total: number
    grade: string
    remark: string
  }[]
  totalScore: number
  averageScore: number
  position: number
  totalStudents: number
}

export default function ResultsPage() {
  const [selectedSession, setSelectedSession] = useState("")
  const [selectedTerm, setSelectedTerm] = useState("")
  const [selectedClass, setSelectedClass] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedResult, setSelectedResult] = useState<StudentResult | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  const { data: sessions } = useSWR("sessions", mockApi.getSessions)
  const { data: classes } = useSWR("classes", mockApi.getClasses)

  // Mock results data
  const results: StudentResult[] = [
    {
      studentId: "std-1",
      studentName: "John Adewale",
      admissionNumber: "ADM/2024/001",
      classId: "class-1",
      className: "JSS 1A",
      subjects: [
        { subjectId: "sub-1", subjectName: "Mathematics", ca1: 15, ca2: 18, exam: 52, total: 85, grade: "A", remark: "Excellent" },
        { subjectId: "sub-2", subjectName: "English", ca1: 14, ca2: 16, exam: 48, total: 78, grade: "B", remark: "Very Good" },
        { subjectId: "sub-3", subjectName: "Science", ca1: 16, ca2: 17, exam: 55, total: 88, grade: "A", remark: "Excellent" },
        { subjectId: "sub-4", subjectName: "Social Studies", ca1: 13, ca2: 15, exam: 45, total: 73, grade: "B", remark: "Very Good" },
        { subjectId: "sub-5", subjectName: "Civic Education", ca1: 17, ca2: 18, exam: 50, total: 85, grade: "A", remark: "Excellent" },
      ],
      totalScore: 409,
      averageScore: 81.8,
      position: 3,
      totalStudents: 45,
    },
    {
      studentId: "std-2",
      studentName: "Amina Mohammed",
      admissionNumber: "ADM/2024/002",
      classId: "class-1",
      className: "JSS 1A",
      subjects: [
        { subjectId: "sub-1", subjectName: "Mathematics", ca1: 18, ca2: 19, exam: 58, total: 95, grade: "A", remark: "Excellent" },
        { subjectId: "sub-2", subjectName: "English", ca1: 17, ca2: 18, exam: 55, total: 90, grade: "A", remark: "Excellent" },
        { subjectId: "sub-3", subjectName: "Science", ca1: 18, ca2: 18, exam: 56, total: 92, grade: "A", remark: "Excellent" },
        { subjectId: "sub-4", subjectName: "Social Studies", ca1: 16, ca2: 17, exam: 52, total: 85, grade: "A", remark: "Excellent" },
        { subjectId: "sub-5", subjectName: "Civic Education", ca1: 18, ca2: 19, exam: 55, total: 92, grade: "A", remark: "Excellent" },
      ],
      totalScore: 454,
      averageScore: 90.8,
      position: 1,
      totalStudents: 45,
    },
    {
      studentId: "std-3",
      studentName: "Chukwuemeka Obi",
      admissionNumber: "ADM/2024/003",
      classId: "class-1",
      className: "JSS 1A",
      subjects: [
        { subjectId: "sub-1", subjectName: "Mathematics", ca1: 12, ca2: 14, exam: 42, total: 68, grade: "C", remark: "Good" },
        { subjectId: "sub-2", subjectName: "English", ca1: 14, ca2: 15, exam: 46, total: 75, grade: "B", remark: "Very Good" },
        { subjectId: "sub-3", subjectName: "Science", ca1: 13, ca2: 14, exam: 44, total: 71, grade: "B", remark: "Very Good" },
        { subjectId: "sub-4", subjectName: "Social Studies", ca1: 15, ca2: 16, exam: 48, total: 79, grade: "B", remark: "Very Good" },
        { subjectId: "sub-5", subjectName: "Civic Education", ca1: 14, ca2: 15, exam: 45, total: 74, grade: "B", remark: "Very Good" },
      ],
      totalScore: 367,
      averageScore: 73.4,
      position: 12,
      totalStudents: 45,
    },
  ]

  const filteredResults = results.filter((result) =>
    result.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    result.admissionNumber.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "A":
        return "bg-green-100 text-green-800"
      case "B":
        return "bg-blue-100 text-blue-800"
      case "C":
        return "bg-amber-100 text-amber-800"
      case "D":
        return "bg-orange-100 text-orange-800"
      case "F":
        return "bg-red-100 text-red-800"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const handleViewResult = (result: StudentResult) => {
    setSelectedResult(result)
    setIsViewDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Results Management"
        description="View, manage, and publish student results"
      >
        <div className="flex gap-2">
          <Button variant="outline">
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Export All
          </Button>
          <Button>
            <Printer className="mr-2 h-4 w-4" />
            Bulk Print
          </Button>
        </div>
      </PageHeader>

      <Tabs defaultValue="view" className="space-y-4">
        <TabsList>
          <TabsTrigger value="view">View Results</TabsTrigger>
          <TabsTrigger value="broadsheet">Broadsheet</TabsTrigger>
          <TabsTrigger value="publish">Publish Results</TabsTrigger>
        </TabsList>

        <TabsContent value="view" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filter Results</CardTitle>
              <CardDescription>
                Select session, term, and class to view results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="space-y-2">
                  <Label>Session</Label>
                  <Select value={selectedSession} onValueChange={setSelectedSession}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select session" />
                    </SelectTrigger>
                    <SelectContent>
                      {sessions?.map((session) => (
                        <SelectItem key={session.id} value={session.id}>
                          {session.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Term</Label>
                  <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select term" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="term-1">First Term</SelectItem>
                      <SelectItem value="term-2">Second Term</SelectItem>
                      <SelectItem value="term-3">Third Term</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Class</Label>
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes?.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name} {cls.section}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Search</Label>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name or admission no..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Table */}
          <Card>
            <CardHeader>
              <CardTitle>Student Results</CardTitle>
              <CardDescription>
                Showing {filteredResults.length} results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Admission No.</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead className="text-center">Total</TableHead>
                    <TableHead className="text-center">Average</TableHead>
                    <TableHead className="text-center">Position</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResults.map((result) => (
                    <TableRow key={result.studentId}>
                      <TableCell className="font-medium">
                        {result.studentName}
                      </TableCell>
                      <TableCell>{result.admissionNumber}</TableCell>
                      <TableCell>{result.className}</TableCell>
                      <TableCell className="text-center">
                        {result.totalScore}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={getGradeColor(result.averageScore >= 80 ? "A" : result.averageScore >= 60 ? "B" : "C")}>
                          {result.averageScore.toFixed(1)}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {result.position}/{result.totalStudents}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewResult(result)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Printer className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="broadsheet" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Class Broadsheet</CardTitle>
              <CardDescription>
                View comprehensive class performance summary
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="sticky left-0 bg-background">S/N</TableHead>
                      <TableHead className="sticky left-10 bg-background min-w-[150px]">Student Name</TableHead>
                      <TableHead className="text-center">Math</TableHead>
                      <TableHead className="text-center">Eng</TableHead>
                      <TableHead className="text-center">Sci</TableHead>
                      <TableHead className="text-center">S.Std</TableHead>
                      <TableHead className="text-center">Civic</TableHead>
                      <TableHead className="text-center font-bold">Total</TableHead>
                      <TableHead className="text-center font-bold">Avg</TableHead>
                      <TableHead className="text-center font-bold">Pos</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredResults
                      .sort((a, b) => a.position - b.position)
                      .map((result, index) => (
                        <TableRow key={result.studentId}>
                          <TableCell className="sticky left-0 bg-background">
                            {index + 1}
                          </TableCell>
                          <TableCell className="sticky left-10 bg-background font-medium">
                            {result.studentName}
                          </TableCell>
                          {result.subjects.map((subject) => (
                            <TableCell key={subject.subjectId} className="text-center">
                              <span className={`inline-flex items-center justify-center w-10 h-6 rounded text-xs font-medium ${getGradeColor(subject.grade)}`}>
                                {subject.total}
                              </span>
                            </TableCell>
                          ))}
                          <TableCell className="text-center font-bold">
                            {result.totalScore}
                          </TableCell>
                          <TableCell className="text-center font-bold">
                            {result.averageScore.toFixed(1)}
                          </TableCell>
                          <TableCell className="text-center font-bold">
                            {result.position}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="publish" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Publish Results</CardTitle>
              <CardDescription>
                Make results available to students and parents
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Session</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select session" />
                    </SelectTrigger>
                    <SelectContent>
                      {sessions?.map((session) => (
                        <SelectItem key={session.id} value={session.id}>
                          {session.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Term</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select term" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="term-1">First Term</SelectItem>
                      <SelectItem value="term-2">Second Term</SelectItem>
                      <SelectItem value="term-3">Third Term</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Class</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="All classes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Classes</SelectItem>
                      {classes?.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name} {cls.section}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <h4 className="font-medium mb-4">Publication Status</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">JSS 1 Results</p>
                      <p className="text-sm text-muted-foreground">145 students</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Published</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">JSS 2 Results</p>
                      <p className="text-sm text-muted-foreground">132 students</p>
                    </div>
                    <Badge className="bg-amber-100 text-amber-800">Pending</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">JSS 3 Results</p>
                      <p className="text-sm text-muted-foreground">128 students</p>
                    </div>
                    <Badge className="bg-amber-100 text-amber-800">Pending</Badge>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline">Preview Before Publishing</Button>
                <Button>Publish Selected Results</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Result Detail Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Student Result</DialogTitle>
            <DialogDescription>
              Detailed result breakdown for {selectedResult?.studentName}
            </DialogDescription>
          </DialogHeader>
          {selectedResult && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Student Name</p>
                  <p className="font-medium">{selectedResult.studentName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Admission No.</p>
                  <p className="font-medium">{selectedResult.admissionNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Class</p>
                  <p className="font-medium">{selectedResult.className}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Position</p>
                  <p className="font-medium">
                    {selectedResult.position} of {selectedResult.totalStudents}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Subject Performance</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead className="text-center">CA1 (20)</TableHead>
                      <TableHead className="text-center">CA2 (20)</TableHead>
                      <TableHead className="text-center">Exam (60)</TableHead>
                      <TableHead className="text-center">Total (100)</TableHead>
                      <TableHead className="text-center">Grade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedResult.subjects.map((subject) => (
                      <TableRow key={subject.subjectId}>
                        <TableCell>{subject.subjectName}</TableCell>
                        <TableCell className="text-center">{subject.ca1}</TableCell>
                        <TableCell className="text-center">{subject.ca2}</TableCell>
                        <TableCell className="text-center">{subject.exam}</TableCell>
                        <TableCell className="text-center font-medium">
                          {subject.total}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={getGradeColor(subject.grade)}>
                            {subject.grade}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-sm text-muted-foreground">Total Score</p>
                    <p className="text-2xl font-bold">{selectedResult.totalScore}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-sm text-muted-foreground">Average</p>
                    <p className="text-2xl font-bold">{selectedResult.averageScore.toFixed(1)}%</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-sm text-muted-foreground">Performance</p>
                    <Progress value={selectedResult.averageScore} className="mt-2" />
                  </CardContent>
                </Card>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 bg-transparent">
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
                <Button className="flex-1">
                  <Printer className="mr-2 h-4 w-4" />
                  Print Result
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
