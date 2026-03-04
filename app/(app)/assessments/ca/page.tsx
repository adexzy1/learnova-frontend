'use client'

import { useState, useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Save, Lock, Unlock, AlertCircle, WifiOff, RefreshCw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { Skeleton } from '@/components/ui/skeleton'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert'

import { PageHeader } from '@/components/shared/page-header'
import { fetchStudents, fetchClasses, fetchSubjects, fetchTerms, saveCAScores } from '@/lib/api'
import { useOffline, useAutosaveDraft } from '@/hooks/use-offline'
import type { Student, CAScore } from '@/types'

interface ScoreEntry {
  studentId: string
  score: number | ''
}

export default function CAEntryPage() {
  const queryClient = useQueryClient()
  const { isOnline, isOffline } = useOffline()
  
  const [selectedClass, setSelectedClass] = useState<string>('')
  const [selectedSubject, setSelectedSubject] = useState<string>('')
  const [selectedTerm, setSelectedTerm] = useState<string>('')
  const [scores, setScores] = useState<Record<string, ScoreEntry>>({})
  const [isLocked, setIsLocked] = useState(false)

  // Generate draft ID based on selections
  const draftId = `ca-${selectedClass}-${selectedSubject}-${selectedTerm}`
  const { save: saveDraft, restore: restoreDraft, clear: clearDraft, hasDraft, lastSaved } = useAutosaveDraft<Record<string, ScoreEntry>>('ca-scores', draftId)

  // Fetch data
  const { data: classes } = useQuery({
    queryKey: ['classes'],
    queryFn: fetchClasses,
  })

  const { data: subjects } = useQuery({
    queryKey: ['subjects'],
    queryFn: fetchSubjects,
  })

  const { data: terms } = useQuery({
    queryKey: ['terms'],
    queryFn: fetchTerms,
  })

  const { data: studentsResponse, isLoading: studentsLoading } = useQuery({
    queryKey: ['students', selectedClass],
    queryFn: () => fetchStudents({ classId: selectedClass }),
    enabled: !!selectedClass,
  })

  const students = studentsResponse?.data || []

  // Restore draft on load
  useEffect(() => {
    if (selectedClass && selectedSubject && selectedTerm) {
      const draft = restoreDraft()
      if (draft) {
        setScores(draft)
        toast.info('Restored unsaved scores from draft')
      } else {
        // Initialize empty scores
        const initialScores: Record<string, ScoreEntry> = {}
        students.forEach((student) => {
          initialScores[student.id] = { studentId: student.id, score: '' }
        })
        setScores(initialScores)
      }
    }
  }, [selectedClass, selectedSubject, selectedTerm, students, restoreDraft])

  // Auto-save on score changes (with debounce)
  const handleScoreChange = useCallback((studentId: string, value: string) => {
    const numValue = value === '' ? '' : Math.min(Math.max(0, parseInt(value) || 0), 20)
    
    setScores(prev => {
      const updated = {
        ...prev,
        [studentId]: { studentId, score: numValue }
      }
      // Auto-save to draft
      saveDraft(updated)
      return updated
    })
  }, [saveDraft])

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const scoresArray = Object.values(scores)
        .filter(s => s.score !== '')
        .map(s => ({
          studentId: s.studentId,
          subjectId: selectedSubject,
          termId: selectedTerm,
          caConfigId: 'ca-test-1', // Would come from config
          score: s.score as number,
        }))
      
      return saveCAScores(scoresArray)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ca-scores'] })
      clearDraft()
      toast.success('Scores saved successfully!')
    },
    onError: () => {
      toast.error('Failed to save scores. Your changes have been saved as a draft.')
    },
  })

  // Flatten arms for dropdown
  const classOptions = classes?.flatMap((level) => 
    level.arms.map((arm) => ({
      id: arm.id,
      name: `${level.name} ${arm.name}`,
    }))
  ) || []

  const canSave = selectedClass && selectedSubject && selectedTerm && Object.keys(scores).length > 0

  return (
    <div className="space-y-6">
      <PageHeader
        title="Continuous Assessment Entry"
        description="Enter and manage CA scores for students"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Assessments', href: '/assessments' },
          { label: 'CA Entry' },
        ]}
      />

      {/* Offline Alert */}
      {isOffline && (
        <Alert variant="destructive">
          <WifiOff className="h-4 w-4" />
          <AlertTitle>You are offline</AlertTitle>
          <AlertDescription>
            Changes will be saved locally and synced when you're back online.
          </AlertDescription>
        </Alert>
      )}

      {/* Draft Indicator */}
      {hasDraft && isOnline && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Unsaved Draft</AlertTitle>
          <AlertDescription>
            You have unsaved changes. {lastSaved && `Last saved: ${lastSaved.toLocaleTimeString()}`}
          </AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select Class & Subject</CardTitle>
          <CardDescription>
            Choose the class, subject, and term to enter CA scores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <Select value={selectedClass} onValueChange={setSelectedClass}>
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

            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger>
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects?.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedTerm} onValueChange={setSelectedTerm}>
              <SelectTrigger>
                <SelectValue placeholder="Select term" />
              </SelectTrigger>
              <SelectContent>
                {terms?.map((term) => (
                  <SelectItem key={term.id} value={term.id}>
                    {term.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button
                variant={isLocked ? 'destructive' : 'outline'}
                onClick={() => setIsLocked(!isLocked)}
                className="flex-1"
              >
                {isLocked ? (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Locked
                  </>
                ) : (
                  <>
                    <Unlock className="mr-2 h-4 w-4" />
                    Unlocked
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Score Entry Table */}
      {selectedClass && selectedSubject && selectedTerm && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Enter Scores</CardTitle>
              <CardDescription>
                Maximum score: 20 points per CA
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  const draft = restoreDraft()
                  if (draft) setScores(draft)
                }}
                disabled={!hasDraft}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Restore Draft
              </Button>
              <Button
                onClick={() => saveMutation.mutate()}
                disabled={!canSave || isLocked || saveMutation.isPending}
              >
                <Save className="mr-2 h-4 w-4" />
                {saveMutation.isPending ? 'Saving...' : 'Save Scores'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {studentsLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
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
                    <TableHead>Admission No.</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead className="w-32">CA 1 (20)</TableHead>
                    <TableHead className="w-32">CA 2 (15)</TableHead>
                    <TableHead className="w-24 text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student, index) => {
                    const ca1 = scores[student.id]?.score || ''
                    const total = typeof ca1 === 'number' ? ca1 : 0
                    
                    return (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell className="font-mono text-sm">
                          {student.admissionNumber}
                        </TableCell>
                        <TableCell>
                          {student.firstName} {student.lastName}
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min={0}
                            max={20}
                            value={ca1}
                            onChange={(e) => handleScoreChange(student.id, e.target.value)}
                            disabled={isLocked}
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min={0}
                            max={15}
                            disabled={isLocked}
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="secondary" className="font-mono">
                            {total}/35
                          </Badge>
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
