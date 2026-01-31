"use client"

import { useState } from "react"
import { Search, Download, FileText, GraduationCap, Calendar, User } from "lucide-react"

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
  DialogFooter,
} from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { PageHeader } from "@/components/shared/page-header"

interface TranscriptRequest {
  id: string
  studentId: string
  studentName: string
  admissionNumber: string
  graduationYear: string
  requestDate: string
  status: "pending" | "processing" | "ready" | "collected"
  purpose: string
}

export default function TranscriptsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [selectedTranscript, setSelectedTranscript] = useState<TranscriptRequest | null>(null)

  // Mock transcript requests
  const transcriptRequests: TranscriptRequest[] = [
    {
      id: "tr-1",
      studentId: "std-1",
      studentName: "John Adewale",
      admissionNumber: "ADM/2020/001",
      graduationYear: "2023",
      requestDate: "2024-01-15",
      status: "ready",
      purpose: "University Admission",
    },
    {
      id: "tr-2",
      studentId: "std-2",
      studentName: "Amina Mohammed",
      admissionNumber: "ADM/2020/002",
      graduationYear: "2023",
      requestDate: "2024-01-18",
      status: "processing",
      purpose: "Scholarship Application",
    },
    {
      id: "tr-3",
      studentId: "std-3",
      studentName: "Chukwuemeka Obi",
      admissionNumber: "ADM/2019/015",
      graduationYear: "2022",
      requestDate: "2024-01-20",
      status: "pending",
      purpose: "Employment",
    },
    {
      id: "tr-4",
      studentId: "std-4",
      studentName: "Fatima Ibrahim",
      admissionNumber: "ADM/2018/008",
      graduationYear: "2021",
      requestDate: "2024-01-10",
      status: "collected",
      purpose: "Foreign University",
    },
  ]

  const filteredRequests = transcriptRequests.filter((request) => {
    const matchesSearch =
      request.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.admissionNumber.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || request.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-800"
      case "processing":
        return "bg-blue-100 text-blue-800"
      case "ready":
        return "bg-green-100 text-green-800"
      case "collected":
        return "bg-muted text-muted-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const handlePreview = (request: TranscriptRequest) => {
    setSelectedTranscript(request)
    setIsPreviewOpen(true)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transcripts"
        description="Generate and manage student academic transcripts"
      >
        <Button onClick={() => setIsNewRequestOpen(true)}>
          <FileText className="mr-2 h-4 w-4" />
          New Request
        </Button>
      </PageHeader>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-amber-100 p-3">
                <FileText className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">
                  {transcriptRequests.filter((r) => r.status === "pending").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-blue-100 p-3">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Processing</p>
                <p className="text-2xl font-bold">
                  {transcriptRequests.filter((r) => r.status === "processing").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-green-100 p-3">
                <FileText className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ready</p>
                <p className="text-2xl font-bold">
                  {transcriptRequests.filter((r) => r.status === "ready").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-muted p-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Collected</p>
                <p className="text-2xl font-bold">
                  {transcriptRequests.filter((r) => r.status === "collected").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="flex-1 space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or admission number..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="w-full md:w-48 space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="ready">Ready</SelectItem>
                  <SelectItem value="collected">Collected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transcript Requests</CardTitle>
          <CardDescription>
            Manage and process transcript requests from students and alumni
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Admission No.</TableHead>
                <TableHead>Graduation Year</TableHead>
                <TableHead>Purpose</TableHead>
                <TableHead>Request Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">{request.studentName}</TableCell>
                  <TableCell>{request.admissionNumber}</TableCell>
                  <TableCell>{request.graduationYear}</TableCell>
                  <TableCell>{request.purpose}</TableCell>
                  <TableCell>
                    {new Date(request.requestDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(request.status)}>
                      {request.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePreview(request)}
                      >
                        Preview
                      </Button>
                      {request.status === "ready" && (
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* New Request Dialog */}
      <Dialog open={isNewRequestOpen} onOpenChange={setIsNewRequestOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>New Transcript Request</DialogTitle>
            <DialogDescription>
              Create a new transcript request for a student or alumnus
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="student">Student/Alumni</Label>
              <Input id="student" placeholder="Search student by name or admission no." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select purpose" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="university">University Admission</SelectItem>
                  <SelectItem value="scholarship">Scholarship Application</SelectItem>
                  <SelectItem value="employment">Employment</SelectItem>
                  <SelectItem value="foreign">Foreign University</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="copies">Number of Copies</Label>
              <Input id="copies" type="number" min="1" defaultValue="1" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Input id="notes" placeholder="Any special requirements..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewRequestOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsNewRequestOpen(false)}>
              Create Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transcript Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Transcript Preview</DialogTitle>
            <DialogDescription>
              Academic transcript for {selectedTranscript?.studentName}
            </DialogDescription>
          </DialogHeader>
          {selectedTranscript && (
            <div className="space-y-6">
              {/* School Header */}
              <div className="text-center space-y-2 py-4 border-b">
                <div className="flex justify-center mb-2">
                  <GraduationCap className="h-12 w-12 text-primary" />
                </div>
                <h2 className="text-xl font-bold">EXCELLENCE HIGH SCHOOL</h2>
                <p className="text-sm text-muted-foreground">
                  123 Education Avenue, Lagos, Nigeria
                </p>
                <p className="text-lg font-semibold mt-4">ACADEMIC TRANSCRIPT</p>
              </div>

              {/* Student Information */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Name:</span>
                  <span className="font-medium">{selectedTranscript.studentName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Admission No:</span>
                  <span className="font-medium">{selectedTranscript.admissionNumber}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Year of Entry:</span>
                  <span className="font-medium">2017</span>
                </div>
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Year of Graduation:</span>
                  <span className="font-medium">{selectedTranscript.graduationYear}</span>
                </div>
              </div>

              <Separator />

              {/* Academic Records */}
              <div className="space-y-4">
                <h3 className="font-semibold">Academic Performance Summary</h3>
                
                {/* Sample Year Performance */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    2022/2023 Session - SS3
                  </p>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Subject</TableHead>
                        <TableHead className="text-center">1st Term</TableHead>
                        <TableHead className="text-center">2nd Term</TableHead>
                        <TableHead className="text-center">3rd Term</TableHead>
                        <TableHead className="text-center">Average</TableHead>
                        <TableHead className="text-center">Grade</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>Mathematics</TableCell>
                        <TableCell className="text-center">85</TableCell>
                        <TableCell className="text-center">88</TableCell>
                        <TableCell className="text-center">90</TableCell>
                        <TableCell className="text-center font-medium">87.7</TableCell>
                        <TableCell className="text-center">
                          <Badge className="bg-green-100 text-green-800">A</Badge>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>English Language</TableCell>
                        <TableCell className="text-center">78</TableCell>
                        <TableCell className="text-center">82</TableCell>
                        <TableCell className="text-center">80</TableCell>
                        <TableCell className="text-center font-medium">80.0</TableCell>
                        <TableCell className="text-center">
                          <Badge className="bg-green-100 text-green-800">A</Badge>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Physics</TableCell>
                        <TableCell className="text-center">82</TableCell>
                        <TableCell className="text-center">85</TableCell>
                        <TableCell className="text-center">87</TableCell>
                        <TableCell className="text-center font-medium">84.7</TableCell>
                        <TableCell className="text-center">
                          <Badge className="bg-green-100 text-green-800">A</Badge>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Chemistry</TableCell>
                        <TableCell className="text-center">75</TableCell>
                        <TableCell className="text-center">78</TableCell>
                        <TableCell className="text-center">82</TableCell>
                        <TableCell className="text-center font-medium">78.3</TableCell>
                        <TableCell className="text-center">
                          <Badge className="bg-blue-100 text-blue-800">B</Badge>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Biology</TableCell>
                        <TableCell className="text-center">80</TableCell>
                        <TableCell className="text-center">83</TableCell>
                        <TableCell className="text-center">85</TableCell>
                        <TableCell className="text-center font-medium">82.7</TableCell>
                        <TableCell className="text-center">
                          <Badge className="bg-green-100 text-green-800">A</Badge>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                {/* Summary */}
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <Card>
                    <CardContent className="pt-4">
                      <p className="text-sm text-muted-foreground">CGPA</p>
                      <p className="text-2xl font-bold">3.75</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <p className="text-sm text-muted-foreground">Final Average</p>
                      <p className="text-2xl font-bold">82.7%</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <p className="text-sm text-muted-foreground">Final Position</p>
                      <p className="text-2xl font-bold">5th/120</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <Separator />

              {/* Footer */}
              <div className="text-center text-sm text-muted-foreground">
                <p>This is an official academic transcript.</p>
                <p>Generated on {new Date().toLocaleDateString()}</p>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 bg-transparent">
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
                <Button className="flex-1">
                  Mark as Collected
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
