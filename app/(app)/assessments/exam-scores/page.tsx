"use client";

import { Save, Lock, Unlock, AlertCircle, WifiOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { PageHeader } from "@/components/shared/page-header";
import { useOffline } from "@/hooks/use-offline";
import useExamScoreService from "./_service/useExamScoreService";

export default function ExamScoreEntryPage() {
  const { isOffline } = useOffline();

  const {
    selectedClass,
    setSelectedClass,
    selectedSubject,
    setSelectedSubject,
    selectedTerm,
    setSelectedTerm,
    hasSelection,
    isLocked,
    setIsLocked,
    classOptions,
    subjects,
    terms,
    students,
    examLoading,
    getScore,
    getMaxScore,
    handleScoreChange,
    handleSave,
    saveMutation,
  } = useExamScoreService();

  const canSave = hasSelection && !isLocked && !saveMutation.isPending;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Exam Score Entry"
        description="Enter and manage exam scores for students"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Assessments", href: "/assessments" },
          { label: "Exam Scores" },
        ]}
      />

      {isOffline && (
        <Alert variant="destructive">
          <WifiOff className="h-4 w-4" />
          <AlertTitle>You are offline</AlertTitle>
          <AlertDescription>
            Changes cannot be saved while offline. Please reconnect and try
            again.
          </AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select Class & Subject</CardTitle>
          <CardDescription>
            Choose the class, subject, and term to enter exam scores
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
                {subjects.map((subject) => (
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
                {terms.map((term) => (
                  <SelectItem key={term.id} value={term.id}>
                    {term.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant={isLocked ? "destructive" : "outline"}
              onClick={() => setIsLocked(!isLocked)}
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
        </CardContent>
      </Card>

      {/* Score Entry Table */}
      {hasSelection && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Enter Exam Scores</CardTitle>
              <CardDescription>
                Default max score: 60
              </CardDescription>
            </div>
            <Button onClick={handleSave} disabled={!canSave}>
              <Save className="mr-2 h-4 w-4" />
              {saveMutation.isPending ? "Saving..." : "Save Scores"}
            </Button>
          </CardHeader>
          <CardContent>
            {examLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : students.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center text-muted-foreground">
                <AlertCircle className="h-8 w-8" />
                <p>No students found in this class</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">S/N</TableHead>
                    <TableHead>Admission No.</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead className="w-40">
                      Exam Score
                    </TableHead>
                    <TableHead className="w-24 text-right">Max</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student, index) => {
                    const maxScore = getMaxScore(student.id);
                    return (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">
                          {index + 1}
                        </TableCell>
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
                            max={maxScore}
                            value={getScore(student.id)}
                            onChange={(e) =>
                              handleScoreChange(
                                student.id,
                                e.target.value,
                                maxScore
                              )
                            }
                            disabled={isLocked}
                            className="w-24"
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="secondary" className="font-mono">
                            {maxScore}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
