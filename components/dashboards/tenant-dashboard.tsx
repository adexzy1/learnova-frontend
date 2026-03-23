"use client";

import React from "react";

import {
  Users,
  GraduationCap,
  BookOpen,
  CreditCard,
  TrendingUp,
  Calendar,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatNumber } from "@/lib/format";
import { DashboardCharts } from "@/features/dashboard/dashboard-charts";
import { RecentActivity } from "@/features/dashboard/recent-activity";
import { QuickActions } from "@/features/dashboard/quick-actions";
import {
  useDashboardService,
  type TrendData,
} from "@/features/dashboard/use-dashboard-service";

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  trendValue,
  isLoading,
}: {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: "up" | "down";
  trendValue?: string;
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-3 w-20" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(description || trendValue) && (
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
            {trend && trendValue && (
              <>
                {trend === "up" ? (
                  <ArrowUpRight className="h-3 w-3 text-green-500" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-red-500" />
                )}
                <span
                  className={trend === "up" ? "text-green-500" : "text-red-500"}
                >
                  {trendValue}
                </span>
              </>
            )}
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function getTrend(data: TrendData | null | undefined): {
  trend?: "up" | "down";
  trendValue?: string;
} {
  if (!data || data.percentage === 0) return {};
  return {
    trend: data.percentage > 0 ? "up" : "down",
    trendValue: `${data.percentage > 0 ? "+" : ""}${data.percentage}%`,
  };
}

export default function TenantDashboard() {
  const {
    people,
    attendance,
    academic,
    classes,
    financeSummary,
    revenue,
    payments,
    upcomingExams,
  } = useDashboardService();

  const peopleData = people.data?.data.data;
  const attendanceData = attendance.data?.data.data;
  const academicData = academic.data?.data.data;
  const classesData = classes.data?.data.data;
  const financeData = financeSummary.data?.data.data;
  const revenueData = revenue.data?.data.data;
  const paymentsData = payments.data?.data.data;
  const examsData = upcomingExams.data?.data.data;

  // Debug: log errors and data for diagnosis
  if (process.env.NODE_ENV === "development") {
    const errors = {
      people: people.error,
      attendance: attendance.error,
      academic: academic.error,
      classes: classes.error,
      financeSummary: financeSummary.error,
      revenue: revenue.error,
      payments: payments.error,
      upcomingExams: upcomingExams.error,
    };
    const hasErrors = Object.values(errors).some(Boolean);
    if (hasErrors) {
      console.error("[Dashboard] Query errors:", errors);
    }
  }

  // Map payments to activity format
  const activities = (paymentsData?.payments ?? []).map((p) => ({
    id: p.id,
    type: "payment",
    description: `${p.studentFirstName} ${p.studentLastName} — ${formatCurrency(p.amount)}`,
    timestamp: p.paidAt,
  }));

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Students"
          value={formatNumber(peopleData?.activeStudents ?? 0)}
          description="enrolled students"
          icon={GraduationCap}
          {...getTrend(peopleData?.studentsTrend)}
          isLoading={people.isLoading}
        />
        <StatCard
          title="Total Staff"
          value={formatNumber(peopleData?.activeStaff ?? 0)}
          description="active staff members"
          icon={Users}
          {...getTrend(peopleData?.staffTrend)}
          isLoading={people.isLoading}
        />
        <StatCard
          title="Attendance Rate"
          value={
            attendanceData?.attendanceRate != null
              ? `${(attendanceData.attendanceRate * 100).toFixed(1)}%`
              : "—"
          }
          description="this term"
          icon={Calendar}
          {...getTrend(attendanceData?.attendanceTrend)}
          isLoading={attendance.isLoading}
        />
        <StatCard
          title="Outstanding Balance"
          value={formatCurrency(financeData?.outstandingBalance ?? 0)}
          description={`${financeData?.overdueInvoiceCount ?? 0} overdue invoices`}
          icon={CreditCard}
          {...getTrend(financeData?.balanceTrend)}
          isLoading={financeSummary.isLoading}
        />
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Charts and Activity */}
      <div className="grid gap-6 lg:grid-cols-7">
        <div className="lg:col-span-4">
          <DashboardCharts
            attendanceChart={attendanceData?.weeklyChart}
            revenueChart={revenueData?.revenueChart}
            gradeDistribution={academicData?.gradeDistribution}
            attendanceLoading={attendance.isLoading}
            revenueLoading={revenue.isLoading}
            academicLoading={academic.isLoading}
          />
        </div>
        <div className="lg:col-span-3">
          <RecentActivity
            activities={activities}
            isLoading={payments.isLoading}
          />
        </div>
      </div>

      {/* Additional Stats Row */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Active Classes"
          value={classesData?.totalClassArms ?? 0}
          description={`${classesData?.totalClasses ?? 0} class levels`}
          icon={BookOpen}
          isLoading={classes.isLoading}
        />

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Upcoming Exams
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {upcomingExams.isLoading ? (
              <>
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-3 w-20" />
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {examsData?.count ?? 0}
                </div>
                <p className="text-xs text-muted-foreground">in next 14 days</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Academic Performance
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {academic.isLoading ? (
              <>
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-3 w-20" />
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold">
                    {academicData?.passRate != null
                      ? `${(academicData.passRate * 100).toFixed(1)}%`
                      : "—"}
                  </div>
                  {academicData?.passRateTrend &&
                    academicData.passRateTrend.percentage !== 0 && (
                      <Badge
                        variant="secondary"
                        className={
                          academicData.passRateTrend.percentage > 0
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {academicData.passRateTrend.percentage > 0 ? "+" : ""}
                        {academicData.passRateTrend.percentage}%
                      </Badge>
                    )}
                </div>
                <p className="text-xs text-muted-foreground">avg. pass rate</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
