'use client'

import React from "react"

import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Save, Calendar, Check, X, Clock, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { PageHeader } from '@/components/shared/page-header'
import { fetchStudents, fetchClasses, saveAttendance } from '@/lib/api'
import { cn } from '@/lib/utils'
import type { AttendanceRecord } from '@/types'

type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused'

interface AttendanceEntry {
  studentId: string
  status: AttendanceStatus
  notes?: string
}

const statusConfig: Record<AttendanceStatus, { label: string; icon: React.ReactNode; className: string }> = {
  present: { 
    label: 'Present', 
    icon: <Check className="h-4 w-4" />,
    className: 'bg-green-100 text-green-700 hover:bg-green-200 border-green-300'
  },
  absent: { 
    label: 'Absent', 
    icon: <X className="h-4 w-4" />,
    className: 'bg-red-100 text-red-700 hover:bg-red-200 border-red-300'
  },
  late: { 
    label: 'Late', 
    icon: <Clock className="h-4 w-4" />,
    className: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-300'
  },
  excused: { 
    label: 'Excused', 
    icon: <AlertCircle className="h-4 w-4" />,
    className: 'bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-300'
  },
}

export default function AttendancePage() {
  const queryClient = useQueryClient()
  const [selectedClass, setSelectedClass] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'))
  const [attendance, setAttendance] = useState<Record<string, AttendanceEntry>>({})

  // Fetch data
  const { data: classes } = useQuery({
    queryKey: ['classes'],
    queryFn: fetchClasses,
  })

  const { data: studentsResponse, isLoading: studentsLoading } = useQuery({
    queryKey: ['students', selectedClass],
    queryFn: () => fetchStudents({ classId: selectedClass }),
    enabled: !!selectedClass,
  })

  const students = studentsResponse?.data || []

  // Initialize attendance when students load
  const initializeAttendance = useCallback(() => {
    const initial: Record<string, AttendanceEntry> = {}
    students.forEach((student) => {
      initial[student.id] = { studentId: student.id, status: 'present' }
    })
    setAttendance(initial)
  }, [students])

  // Update attendance status
  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], studentId, status }
    }))
  }

  // Mark all students
  const markAll = (status: AttendanceStatus) => {
    const updated: Record<string, AttendanceEntry> = {}
    students.forEach((student) => {
      updated[student.id] = { studentId: student.id, status }
    })
    setAttendance(updated)
  }

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const records = Object.values(attendance).map(entry => ({
        studentId: entry.studentId,
        classId: selectedClass,
        date: selectedDate,
        status: entry.status,
        notes: entry.notes,
        markedBy: 'current-user', // Would come from auth
      }))
      return saveAttendance(records)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] })
      toast.success('Attendance saved successfully!')
    },
    onError: () => {
      toast.error('Failed to save attendance. Please try again.')
    },
  })

  // Stats
  const stats = {
    total: students.length,
    present: Object.values(attendance).filter(a => a.status === 'present').length,
    absent: Object.values(attendance).filter(a => a.status === 'absent').length,
    late: Object.values(attendance).filter(a => a.status === 'late').length,
    excused: Object.values(attendance).filter(a => a.status === 'excused').length,
  }

  // Flatten arms for dropdown
  const classOptions = classes?.flatMap((level) => 
    level.arms.map((arm) => ({
      id: arm.id,
      name: `${level.name} ${arm.name}`,
    }))
  ) || []

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance"
        description="Mark and manage daily student attendance"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Attendance' },
        ]}
      />

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select Class & Date</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Class</Label>
              <Select 
                value={selectedClass} 
                onValueChange={(value) => {
                  setSelectedClass(value)
                  setAttendance({})
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classOptions.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                max={format(new Date(), 'yyyy-MM-dd')}
              />
            </div>

            <div className="space-y-2">
              <Label>Quick Actions</Label>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => markAll('present')}
                  disabled={!selectedClass}
                >
                  Mark All Present
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={initializeAttendance}
                  disabled={!selectedClass}
                >
                  Reset
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      {selectedClass && students.length > 0 && (
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total</CardDescription>
              <CardTitle className="text-2xl">{stats.total}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Present</CardDescription>
              <CardTitle className="text-2xl text-green-600">{stats.present}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Absent</CardDescription>
              <CardTitle className="text-2xl text-red-600">{stats.absent}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Late</CardDescription>
              <CardTitle className="text-2xl text-yellow-600">{stats.late}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Excused</CardDescription>
              <CardTitle className="text-2xl text-blue-600">{stats.excused}</CardTitle>
            </CardHeader>
          </Card>
        </div>
      )}

      {/* Attendance Table */}
      {selectedClass && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">
                Attendance for {format(new Date(selectedDate), 'EEEE, MMMM d, yyyy')}
              </CardTitle>
              <CardDescription>
                Click on a status to mark attendance
              </CardDescription>
            </div>
            <Button
              onClick={() => saveMutation.mutate()}
              disabled={Object.keys(attendance).length === 0 || saveMutation.isPending}
            >
              <Save className="mr-2 h-4 w-4" />
              {saveMutation.isPending ? 'Saving...' : 'Save Attendance'}
            </Button>
          </CardHeader>
          <CardContent>
            {studentsLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No students found in this class
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">S/N</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student, index) => {
                    const entry = attendance[student.id]
                    const currentStatus = entry?.status || 'present'
                    
                    return (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={student.photo || "/placeholder.svg"} alt={student.firstName} />
                              <AvatarFallback>
                                {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">
                                {student.firstName} {student.lastName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {student.admissionNumber}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center gap-2">
                            {(Object.keys(statusConfig) as AttendanceStatus[]).map((status) => {
                              const config = statusConfig[status]
                              const isActive = currentStatus === status
                              
                              return (
                                <button
                                  key={status}
                                  onClick={() => handleStatusChange(student.id, status)}
                                  className={cn(
                                    'flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-sm font-medium transition-all',
                                    isActive ? config.className : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                                  )}
                                >
                                  {config.icon}
                                  <span className="hidden sm:inline">{config.label}</span>
                                </button>
                              )
                            })}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
