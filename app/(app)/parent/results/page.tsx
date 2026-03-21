"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import apiClient from "@/lib/api-client";
import { TERM_ENDPOINTS, RESULTS_ENDPOINTS } from "@/lib/api-routes";
import { queryKeys } from "@/app/constants/queryKeys";
import { useChildSelector } from "../ChildSelectorContext";
import { PageHeader } from "@/components/shared/page-header";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import type { Term, TermResult, ApiError } from "@/types";

function ResultsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Skeleton className="h-9 w-48" />
      </div>
      <Card>
        <CardContent className="p-6 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function caTotal(subject: TermResult["subjects"][number]): number {
  return subject.caScores.reduce((sum, ca) => sum + ca.score, 0);
}

export default function ParentResultsPage() {
  const { selectedChildId } = useChildSelector();
  const [selectedTermId, setSelectedTermId] = useState<string>("");

  // Fetch selectable terms
  const { data: termsResponse, isLoading: termsLoading } = useQuery<
    AxiosResponse<Term[]>
  >({
    queryKey: [queryKeys.TERM, "select"],
    queryFn: () => apiClient.get(TERM_ENDPOINTS.GET_SELECTABLE_TERMS),
  });

  const terms = termsResponse?.data ?? [];

  // Fetch student result
  const {
    data: resultResponse,
    isLoading: resultLoading,
    error: resultError,
  } = useQuery<AxiosResponse<TermResult>, ApiError>({
    queryKey: [queryKeys.RESULTS, selectedChildId, selectedTermId],
    queryFn: () =>
      apiClient.get(
        RESULTS_ENDPOINTS.GET_STUDENT_RESULT.replace(":studentId", selectedChildId!),
        { params: { termId: selectedTermId } }
      ),
    enabled: !!selectedChildId && !!selectedTermId,
    retry: (failureCount, error) => {
      // Don't retry on 404
      if ((error as ApiError).statusCode === 404) return false;
      return failureCount < 2;
    },
  });

  const result = resultResponse?.data;
  const is404 = (resultError as ApiError)?.statusCode === 404;

  if (!selectedChildId) {
    return (
      <div className="space-y-6">
        <PageHeader title="Academic Results" />
        <div className="flex items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <p className="text-sm text-muted-foreground">
            Please select a child to view their academic results.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Academic Results" />

      {/* Term selector */}
      <div className="flex items-center gap-3">
        <Label className="text-sm font-medium shrink-0">Term</Label>
        {termsLoading ? (
          <Skeleton className="h-9 w-48" />
        ) : (
          <Select value={selectedTermId} onValueChange={setSelectedTermId}>
            <SelectTrigger className="w-48">
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
        )}
      </div>

      {/* Content area */}
      {!selectedTermId ? (
        <div className="flex items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <p className="text-sm text-muted-foreground">
            Please select a term to view results.
          </p>
        </div>
      ) : resultLoading ? (
        <ResultsSkeleton />
      ) : !result?.isPublished || is404 ? (
        <div className="flex items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <p className="text-sm text-muted-foreground">
            Results not yet available for the selected term.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Overall summary */}
          {(result.rank != null || result.averageScore != null) && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {result.averageScore != null && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Average Score
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{result.averageScore.toFixed(1)}%</p>
                  </CardContent>
                </Card>
              )}
              {result.rank != null && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Position
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      {result.rank}
                      {result.totalStudents != null && (
                        <span className="text-base font-normal text-muted-foreground">
                          {" "}/ {result.totalStudents}
                        </span>
                      )}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Subject breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Subject Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead className="text-center">CA Score</TableHead>
                    <TableHead className="text-center">Exam Score</TableHead>
                    <TableHead className="text-center">Total</TableHead>
                    <TableHead className="text-center">Grade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.subjects.map((subject) => (
                    <TableRow key={subject.subjectId}>
                      <TableCell className="font-medium">{subject.subjectName}</TableCell>
                      <TableCell className="text-center">{caTotal(subject)}</TableCell>
                      <TableCell className="text-center">{subject.examScore}</TableCell>
                      <TableCell className="text-center font-semibold">
                        {subject.totalScore}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{subject.grade}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
