"use client";

import { useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import {
  Clock,
  GraduationCap,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { format, differenceInDays, startOfDay, isBefore } from "date-fns";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import { useAuth } from "@/providers/app-auth-provider";
import apiClient from "@/lib/api-client";
import {
  RESULTS_ENDPOINTS,
  ATTENDANCE_ENDPOINTS,
  ASSESSMENT_ENDPOINTS,
} from "@/lib/api-routes";
import { queryKeys } from "@/app/constants/queryKeys";
import type { TermResult, ExamTimetable } from "@/types";

interface AttendanceSummary {
  totalDays: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  attendancePercentage: number;
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const studentId = user?.id;

  // Fetch current term results
  const { data: resultResponse, isLoading: loadingResults } = useQuery<
    AxiosResponse<TermResult>
  >({
    queryKey: [queryKeys.RESULTS, studentId, "current"],
    queryFn: () =>
      apiClient.get(
        RESULTS_ENDPOINTS.GET_STUDENT_RESULT.replace(":studentId", studentId!)
      ),
    enabled: !!studentId,
  });

  // Fetch attendance summary
  const { data: attendanceResponse, isLoading: loadingAttendance } = useQuery<
    AxiosResponse<AttendanceSummary>
  >({
    queryKey: [queryKeys.ATTENDANCE_SUMMARY, studentId],
    queryFn: () =>
      apiClient.get(ATTENDANCE_ENDPOINTS.GET_SUMMARY, {
        params: { studentId },
      }),
    enabled: !!studentId,
  });

  // Fetch exam timetable
  const { data: timetableResponse, isLoading: loadingTimetable } = useQuery<
    AxiosResponse<(ExamTimetable & { subjectName?: string })[]>
  >({
    queryKey: [queryKeys.TIMETABLE, "student-exams"],
    queryFn: () => apiClient.get(ASSESSMENT_ENDPOINTS.TIMETABLE_GET),
    enabled: !!studentId,
  });

  const result = resultResponse?.data;
  const attendance = attendanceResponse?.data;
  const exams = timetableResponse?.data ?? [];

  // Compute next exam
  const today = startOfDay(new Date());
  const upcomingExams = exams
    .filter((e) => !isBefore(startOfDay(new Date(e.date)), today))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const nextExam = upcomingExams[0];
  const daysToNextExam = nextExam
    ? differenceInDays(startOfDay(new Date(nextExam.date)), today)
    : null;

  const isLoading = loadingResults || loadingAttendance;

  if (isLoading) {
    return (
      <div className="space-y-4 p-8">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">
          Welcome back, {user?.firstName ?? "Student"}
        </h2>
        <p className="text-muted-foreground">
          Here&apos;s what&apos;s happening in your academic life today.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {result?.averageScore != null
                ? `${result.averageScore.toFixed(1)}%`
                : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              {result?.rank != null
                ? `Position ${result.rank}${result.totalStudents ? ` of ${result.totalStudents}` : ""}`
                : "Current term"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {attendance?.attendancePercentage != null
                ? `${attendance.attendancePercentage.toFixed(0)}%`
                : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              {attendance
                ? `Present ${attendance.present}/${attendance.totalDays} days`
                : "Current term"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Exams</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingExams.length}</div>
            <p className="text-xs text-muted-foreground">
              {upcomingExams.length === 1 ? "exam" : "exams"} scheduled
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Exam</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {daysToNextExam != null
                ? daysToNextExam === 0
                  ? "Today"
                  : `${daysToNextExam} Day${daysToNextExam === 1 ? "" : "s"}`
                : "None"}
            </div>
            <p className="text-xs text-muted-foreground">
              {nextExam?.subjectName ?? "No upcoming exams"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Upcoming exams list */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Upcoming Exams</CardTitle>
            <CardDescription>Your exam schedule</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingTimetable ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : upcomingExams.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">
                No upcoming exams scheduled.
              </p>
            ) : (
              <div className="space-y-4">
                {upcomingExams.slice(0, 5).map((exam) => (
                  <div
                    key={exam.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {exam.subjectName ?? exam.subjectId}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(exam.date), "EEE, MMM d")} &middot;{" "}
                        {exam.startTime} – {exam.endTime}
                        {exam.venue && ` · ${exam.venue}`}
                      </p>
                    </div>
                    <Badge variant="secondary">
                      {differenceInDays(startOfDay(new Date(exam.date)), today) === 0
                        ? "Today"
                        : `${differenceInDays(startOfDay(new Date(exam.date)), today)}d`}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Today's info card */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Today</CardTitle>
            <CardDescription>{format(new Date(), "EEEE, MMMM d")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Attendance Rate</p>
                  <p className="text-xs text-muted-foreground">Current term</p>
                </div>
                <span
                  className={`text-lg font-bold ${
                    (attendance?.attendancePercentage ?? 0) >= 75
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {attendance?.attendancePercentage != null
                    ? `${attendance.attendancePercentage.toFixed(0)}%`
                    : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Days Present</p>
                  <p className="text-xs text-muted-foreground">Out of total school days</p>
                </div>
                <span className="text-lg font-bold">
                  {attendance ? `${attendance.present}/${attendance.totalDays}` : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Days Absent</p>
                  <p className="text-xs text-muted-foreground">Including late arrivals</p>
                </div>
                <span className="text-lg font-bold text-red-600">
                  {attendance ? attendance.absent + attendance.late : "—"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
