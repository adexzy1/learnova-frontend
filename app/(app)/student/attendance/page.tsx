"use client";

import { useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import apiClient from "@/lib/api-client";
import { ATTENDANCE_ENDPOINTS } from "@/lib/api-routes";
import { queryKeys } from "@/app/constants/queryKeys";
import { useAuth } from "@/providers/app-auth-provider";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import type { AttendanceRecord } from "@/types";

interface AttendanceSummary {
  totalDays: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  attendancePercentage: number;
  records: AttendanceRecord[];
}

const statusConfig = {
  present: { label: "Present", className: "bg-green-100 text-green-700 border-green-300" },
  absent: { label: "Absent", className: "bg-red-100 text-red-700 border-red-300" },
  late: { label: "Late", className: "bg-amber-100 text-amber-700 border-amber-300" },
  excused: { label: "Excused", className: "bg-blue-100 text-blue-700 border-blue-300" },
} as const;

function AttendanceSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>
      <Card>
        <CardContent className="p-6 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string | number;
  valueClass?: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className={`text-2xl font-bold ${valueClass ?? ""}`}>{value}</p>
      </CardContent>
    </Card>
  );
}

export default function StudentAttendancePage() {
  const { user } = useAuth();
  const studentId = user?.id;

  const { data: summaryResponse, isLoading } = useQuery<
    AxiosResponse<AttendanceSummary>
  >({
    queryKey: [queryKeys.ATTENDANCE_SUMMARY, studentId],
    queryFn: () =>
      apiClient.get(ATTENDANCE_ENDPOINTS.GET_SUMMARY, {
        params: { studentId },
      }),
    enabled: !!studentId,
  });

  const summary = summaryResponse?.data;

  return (
    <div className="space-y-6">
      <PageHeader title="My Attendance" />

      {isLoading ? (
        <AttendanceSkeleton />
      ) : !summary ? (
        <div className="flex items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <p className="text-sm text-muted-foreground">No attendance data available.</p>
        </div>
      ) : (
        <>
          {/* Stats cards */}
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
            <StatCard label="Total Days" value={summary.totalDays} />
            <StatCard label="Present" value={summary.present} valueClass="text-green-600" />
            <StatCard label="Absent" value={summary.absent} valueClass="text-red-600" />
            <StatCard label="Late" value={summary.late} valueClass="text-amber-600" />
            <StatCard label="Excused" value={summary.excused} valueClass="text-blue-600" />
            <StatCard
              label="Attendance %"
              value={`${summary.attendancePercentage.toFixed(1)}%`}
              valueClass={
                summary.attendancePercentage >= 75 ? "text-green-600" : "text-red-600"
              }
            />
          </div>

          {/* Records list */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Attendance Records</CardTitle>
            </CardHeader>
            <CardContent>
              {summary.records.length === 0 ? (
                <div className="flex items-center justify-center py-8 text-center">
                  <p className="text-sm text-muted-foreground">No records found.</p>
                </div>
              ) : (
                <ul className="divide-y">
                  {summary.records.map((record) => {
                    const config =
                      statusConfig[record.status as keyof typeof statusConfig] ??
                      statusConfig.present;
                    return (
                      <li
                        key={record.id}
                        className="flex items-center justify-between py-3"
                      >
                        <span className="text-sm font-medium">
                          {format(new Date(record.date + "T00:00:00"), "EEE, MMM d, yyyy")}
                        </span>
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${config.className}`}
                        >
                          {config.label}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
