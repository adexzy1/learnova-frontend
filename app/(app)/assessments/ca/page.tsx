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
import useCAService from "./_service/useCAService";

export default function CAEntryPage() {
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
    classes,
    subjects,
    terms,
    students,
    caConfigs,
    totalMaxScore,
    caLoading,
    getScore,
    handleScoreChange,
    getStudentTotal,
    handleSave,
    saveMutation,
  } = useCAService();

  const canSave = hasSelection && !isLocked && !saveMutation.isPending;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Continuous Assessment Entry"
        description="Enter and manage CA scores for students"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Assessments", href: "/assessments" },
          { label: "CA Entry" },
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
                {classes.map((cls) => (
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
              <CardTitle className="text-lg">Enter Scores</CardTitle>
              <CardDescription>
                {caConfigs.length > 0
                  ? `${caConfigs.map((c) => `${c.name}: max ${c.maxScore}`).join(" | ")} | Total: ${totalMaxScore}`
                  : "No CA configurations found for this term"}
              </CardDescription>
            </div>
            <Button onClick={handleSave} disabled={!canSave}>
              <Save className="mr-2 h-4 w-4" />
              {saveMutation.isPending ? "Saving..." : "Save Scores"}
            </Button>
          </CardHeader>
          <CardContent>
            {caLoading ? (
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
            ) : caConfigs.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center text-muted-foreground">
                <AlertCircle className="h-8 w-8" />
                <p>
                  No CA configurations found for this term. Please set up CA
                  configs first.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">S/N</TableHead>
                    <TableHead>Admission No.</TableHead>
                    <TableHead>Student Name</TableHead>
                    {caConfigs.map((config) => (
                      <TableHead key={config.id} className="w-32">
                        {config.name} ({config.maxScore})
                      </TableHead>
                    ))}
                    <TableHead className="w-24 text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student, index) => (
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
                      {caConfigs.map((config) => (
                        <TableCell key={config.id}>
                          <Input
                            type="number"
                            min={0}
                            max={config.maxScore}
                            value={getScore(student.id, config.id)}
                            onChange={(e) =>
                              handleScoreChange(
                                student.id,
                                config.id,
                                e.target.value,
                                config.maxScore,
                              )
                            }
                            disabled={isLocked || config.isLocked}
                            className="w-20"
                          />
                        </TableCell>
                      ))}
                      <TableCell className="text-right">
                        <Badge variant="secondary" className="font-mono">
                          {getStudentTotal(student.id)}/{totalMaxScore}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
