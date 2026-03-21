"use client";

import { useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import apiClient from "@/lib/api-client";
import { ASSESSMENT_ENDPOINTS } from "@/lib/api-routes";
import { queryKeys } from "@/app/constants/queryKeys";
import { useAuth } from "@/providers/app-auth-provider";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { format, isBefore, startOfDay } from "date-fns";
import { Clock, MapPin, CalendarDays } from "lucide-react";
import type { ExamTimetable } from "@/types";

interface ExamTimetableEntry extends ExamTimetable {
  subjectName?: string;
  className?: string;
}

function ExamsSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-24 w-full rounded-lg" />
      ))}
    </div>
  );
}

export default function StudentExamsPage() {
  const { user } = useAuth();

  const { data: timetableResponse, isLoading } = useQuery<
    AxiosResponse<ExamTimetableEntry[]>
  >({
    queryKey: [queryKeys.TIMETABLE, "student-exams"],
    queryFn: () => apiClient.get(ASSESSMENT_ENDPOINTS.TIMETABLE_GET),
    enabled: !!user?.id,
  });

  const entries = timetableResponse?.data ?? [];
  const today = startOfDay(new Date());

  // Sort by date ascending
  const sorted = [...entries].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const upcoming = sorted.filter(
    (e) => !isBefore(startOfDay(new Date(e.date)), today)
  );
  const past = sorted.filter((e) =>
    isBefore(startOfDay(new Date(e.date)), today)
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Exam Timetable" />

      {isLoading ? (
        <ExamsSkeleton />
      ) : entries.length === 0 ? (
        <div className="flex items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <p className="text-sm text-muted-foreground">
            No exam timetable available at the moment.
          </p>
        </div>
      ) : (
        <>
          {/* Upcoming exams */}
          {upcoming.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Upcoming Exams ({upcoming.length})
              </h3>
              {upcoming.map((exam) => (
                <ExamCard key={exam.id} exam={exam} variant="upcoming" />
              ))}
            </div>
          )}

          {/* Past exams */}
          {past.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Past Exams ({past.length})
              </h3>
              {past.map((exam) => (
                <ExamCard key={exam.id} exam={exam} variant="past" />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ExamCard({
  exam,
  variant,
}: {
  exam: ExamTimetableEntry;
  variant: "upcoming" | "past";
}) {
  return (
    <Card className={variant === "past" ? "opacity-60" : ""}>
      <CardContent className="flex items-center gap-4 p-4">
        <div className="flex flex-col items-center justify-center h-14 w-14 rounded-lg bg-primary/10 text-primary font-bold text-xs shrink-0">
          <span className="uppercase">
            {format(new Date(exam.date), "MMM")}
          </span>
          <span className="text-lg leading-tight">
            {format(new Date(exam.date), "d")}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold truncate">
              {exam.subjectName ?? exam.subjectId}
            </p>
            {variant === "upcoming" && (
              <Badge variant="secondary" className="text-xs shrink-0">
                Upcoming
              </Badge>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
            <span className="flex items-center gap-1">
              <CalendarDays className="h-3 w-3" />
              {format(new Date(exam.date), "EEEE, MMM d, yyyy")}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {exam.startTime} – {exam.endTime}
            </span>
            {exam.venue && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {exam.venue}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
