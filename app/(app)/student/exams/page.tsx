"use client";

import { useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import apiClient from "@/lib/api-client";
import { ASSESSMENT_ENDPOINTS, ONLINE_EXAM_ENDPOINTS } from "@/lib/api-routes";
import { queryKeys } from "@/app/constants/queryKeys";
import { useAuth } from "@/providers/app-auth-provider";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { format, isBefore, startOfDay } from "date-fns";
import {
  Clock,
  MapPin,
  CalendarDays,
  MonitorPlay,
  CheckCircle2,
  Lock,
  ArrowRight,
} from "lucide-react";
import type { ExamTimetable, OnlineExam } from "@/types";
import { cn } from "@/lib/utils";

interface ExamTimetableEntry extends ExamTimetable {
  subjectName?: string;
  className?: string;
}

function SectionSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-24 w-full rounded-lg" />
      ))}
    </div>
  );
}

export default function StudentExamsPage() {
  const { user } = useAuth();

  const { data: timetableResponse, isLoading: timetableLoading } = useQuery<
    AxiosResponse<{ data: ExamTimetableEntry[] }>
  >({
    queryKey: [queryKeys.EXAM_TIMETABLE, "student-exams"],
    queryFn: () => apiClient.get(ASSESSMENT_ENDPOINTS.EXAM_TIMETABLE_GET),
    enabled: !!user?.id,
  });

  const { data: onlineExamsResponse, isLoading: onlineLoading } = useQuery<
    AxiosResponse<{ data: OnlineExam[] }>
  >({
    queryKey: [queryKeys.ONLINE_EXAMS],
    queryFn: () => apiClient.get(ONLINE_EXAM_ENDPOINTS.LIST),
    enabled: !!user?.id,
  });

  const entries = timetableResponse?.data?.data ?? [];
  const onlineExams = onlineExamsResponse?.data?.data ?? [];
  const today = startOfDay(new Date());

  const sorted = [...entries].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const upcoming = sorted.filter(
    (e) => !isBefore(startOfDay(new Date(e.date)), today)
  );
  const past = sorted.filter((e) =>
    isBefore(startOfDay(new Date(e.date)), today)
  );

  const openOnlineExams = onlineExams.filter((e) => e.status === "open");
  const otherOnlineExams = onlineExams.filter((e) => e.status !== "open");

  return (
    <div className="space-y-8">
      <PageHeader title="Exams" />

      {/* ── Online Exams ─────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <MonitorPlay className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Online Exams
          </h2>
        </div>

        {onlineLoading ? (
          <SectionSkeleton />
        ) : onlineExams.length === 0 ? (
          <EmptyState message="No online exams available at the moment." />
        ) : (
          <div className="space-y-3">
            {openOnlineExams.map((exam) => (
              <OnlineExamCard key={exam.id} exam={exam} />
            ))}
            {otherOnlineExams.map((exam) => (
              <OnlineExamCard key={exam.id} exam={exam} />
            ))}
          </div>
        )}
      </section>

      <Separator />

      {/* ── Exam Timetable ────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Exam Timetable
        </h2>

        {timetableLoading ? (
          <SectionSkeleton />
        ) : entries.length === 0 ? (
          <EmptyState message="No exam timetable available at the moment." />
        ) : (
          <>
            {upcoming.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-medium text-muted-foreground">
                  Upcoming ({upcoming.length})
                </h3>
                {upcoming.map((exam) => (
                  <TimetableCard key={exam.id} exam={exam} variant="upcoming" />
                ))}
              </div>
            )}
            {past.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-medium text-muted-foreground">
                  Past ({past.length})
                </h3>
                {past.map((exam) => (
                  <TimetableCard key={exam.id} exam={exam} variant="past" />
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

// ─── Online Exam Card ──────────────────────────────────────────────────────────

function OnlineExamCard({ exam }: { exam: OnlineExam }) {
  const statusConfig = {
    open: {
      label: "Open",
      variant: "default" as const,
      icon: <MonitorPlay className="h-3.5 w-3.5" />,
      actionLabel: exam.attempt ? "Continue" : "Start Exam",
      disabled: false,
    },
    upcoming: {
      label: "Upcoming",
      variant: "secondary" as const,
      icon: <Clock className="h-3.5 w-3.5" />,
      actionLabel: "Not yet open",
      disabled: true,
    },
    submitted: {
      label: "Submitted",
      variant: "outline" as const,
      icon: <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />,
      actionLabel: "Submitted",
      disabled: true,
    },
    closed: {
      label: "Closed",
      variant: "outline" as const,
      icon: <Lock className="h-3.5 w-3.5" />,
      actionLabel: "Closed",
      disabled: true,
    },
  }[exam.status];

  return (
    <Card
      className={cn(
        "transition-shadow",
        exam.status === "open" && "ring-1 ring-primary/30 shadow-sm",
        (exam.status === "submitted" || exam.status === "closed") && "opacity-70"
      )}
    >
      <CardContent className="flex items-center gap-4 p-4">
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-lg shrink-0",
            exam.status === "open"
              ? "bg-primary/10 text-primary"
              : "bg-muted text-muted-foreground"
          )}
        >
          <MonitorPlay className="h-5 w-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold truncate">{exam.title}</p>
            <Badge variant={statusConfig.variant} className="text-xs gap-1 shrink-0">
              {statusConfig.icon}
              {statusConfig.label}
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
            <span>{exam.subjectName}</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {exam.durationMinutes} min
            </span>
            <span>{exam.totalQuestions} questions · {exam.totalMarks} marks</span>
            {exam.windowStart && (
              <span className="flex items-center gap-1">
                <CalendarDays className="h-3 w-3" />
                {format(new Date(exam.windowStart), "MMM d, yyyy · h:mm a")}
              </span>
            )}
          </div>
        </div>

        {exam.status === "open" ? (
          <Button size="sm" asChild className="shrink-0">
            {/* Links to the dedicated exam portal (learnova-exam app) */}
            <a
              href={`${process.env.NEXT_PUBLIC_EXAM_PORTAL_URL ?? "http://localhost:3001"}/exams/${exam.id}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {statusConfig.actionLabel}
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </a>
          </Button>
        ) : (
          <Button size="sm" variant="outline" disabled className="shrink-0">
            {statusConfig.actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Timetable Card ───────────────────────────────────────────────────────────

function TimetableCard({
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
          <span className="uppercase">{format(new Date(exam.date), "MMM")}</span>
          <span className="text-lg leading-tight">{format(new Date(exam.date), "d")}</span>
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

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center rounded-lg border border-dashed p-10 text-center">
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
