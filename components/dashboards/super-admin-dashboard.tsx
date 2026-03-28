"use client";

import { useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import {
  Building2,
  CreditCard,
  Users,
  TrendingUp,
  CalendarClock,
  PlusCircle,
  AlertTriangle,
  Activity,
  CheckCircle2,
  XCircle,
  User,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/page-header";
import apiClient from "@/lib/api-client";
import { TENANT_ENDPOINTS, AUDIT_ENDPOINTS } from "@/lib/api-routes";
import { queryKeys } from "@/app/constants/queryKeys";
import { PaginatedResponse } from "@/types";

interface TenantStats {
  totalTenants: number;
  activeSubscriptions: number;
  totalRevenue: number;
  pendingOnboarding: number;
  revenueThisMonth: number;
  newTenantsThisWeek: number;
  expiringTrials: number;
}

interface AuditLogEntry {
  id: string;
  action: string;
  entity: string;
  userEmail: string | null;
  createdAt: string;
}

interface HealthResponse {
  status: string;
  info?: Record<string, { status: string }>;
  error?: Record<string, { status: string; message?: string }>;
}

const STAT_CARDS = [
  {
    key: "totalTenants" as const,
    label: "Total Schools",
    icon: Building2,
    format: (v: number) => v.toLocaleString(),
  },
  {
    key: "activeSubscriptions" as const,
    label: "Active Subscriptions",
    icon: CreditCard,
    format: (v: number) => v.toLocaleString(),
  },
  {
    key: "totalRevenue" as const,
    label: "Total Revenue",
    icon: TrendingUp,
    format: (v: number) => `₦${v.toLocaleString()}`,
  },
  {
    key: "pendingOnboarding" as const,
    label: "Pending Onboarding",
    icon: Users,
    format: (v: number) => v.toLocaleString(),
  },
  {
    key: "revenueThisMonth" as const,
    label: "Revenue This Month",
    icon: CalendarClock,
    format: (v: number) => `₦${v.toLocaleString()}`,
  },
  {
    key: "newTenantsThisWeek" as const,
    label: "New Schools (7d)",
    icon: PlusCircle,
    format: (v: number) => v.toLocaleString(),
  },
  {
    key: "expiringTrials" as const,
    label: "Expiring Trials",
    icon: AlertTriangle,
    format: (v: number) => v.toLocaleString(),
  },
];

export default function SuperAdminDashboard() {
  const { data: statsResponse, isLoading: statsLoading } = useQuery<
    AxiosResponse<{ data: TenantStats }>
  >({
    queryKey: [queryKeys.SUPER_ADMIN_STATS],
    queryFn: () => apiClient.get(TENANT_ENDPOINTS.GET_STATS),
  });

  const { data: activityResponse, isLoading: activityLoading } = useQuery<
    AxiosResponse<PaginatedResponse<AuditLogEntry>>
  >({
    queryKey: [queryKeys.AUDIT_LOGS, "recent"],
    queryFn: () =>
      apiClient.get(AUDIT_ENDPOINTS.GET_ALL, {
        params: { page: 1, per_page: 8 },
      }),
  });

  const { data: healthResponse, isLoading: healthLoading } = useQuery<
    AxiosResponse<{ data: HealthResponse }>
  >({
    queryKey: ["system-health"],
    queryFn: () => apiClient.get("/health/ready"),
    refetchInterval: 30000,
  });

  const stats = statsResponse?.data?.data;
  const recentActivity = activityResponse?.data?.data.data ?? [];
  const health = healthResponse?.data?.data;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Super Admin Dashboard"
        description="System-wide overview and management."
      />

      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
        {STAT_CARDS.map((card) => (
          <Card key={card.key}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.label}
              </CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold">
                  {card.format(stats?.[card.key] ?? 0)}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bottom row: Recent Activity + System Health */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activityLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No recent activity.
              </p>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-start justify-between gap-3 py-2 border-b last:border-0"
                  >
                    <div className="flex items-start gap-2 min-w-0">
                      <User className="h-3.5 w-3.5 mt-0.5 text-muted-foreground shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {entry.action}
                          <span className="font-normal text-muted-foreground">
                            {" "}
                            on {entry.entity}
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {entry.userEmail ?? "System"}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                      {formatDistanceToNow(new Date(entry.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            {healthLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : !health ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Unable to fetch health status.
              </p>
            ) : (
              <div className="space-y-4">
                {/* Overall status */}
                <div className="flex items-center gap-2">
                  {health.status === "ok" ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span className="text-sm font-medium">
                    Overall:{" "}
                    <Badge
                      variant={
                        health.status === "ok" ? "secondary" : "destructive"
                      }
                      className={
                        health.status === "ok"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : ""
                      }
                    >
                      {health.status === "ok" ? "Healthy" : "Degraded"}
                    </Badge>
                  </span>
                </div>

                {/* Individual services */}
                {health.info &&
                  Object.entries(health.info).map(([service, info]) => (
                    <div
                      key={service}
                      className="flex items-center justify-between py-2 border-b last:border-0"
                    >
                      <span className="text-sm capitalize">{service}</span>
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      >
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        {info.status}
                      </Badge>
                    </div>
                  ))}

                {health.error &&
                  Object.entries(health.error).map(([service, err]) => (
                    <div
                      key={service}
                      className="flex items-center justify-between py-2 border-b last:border-0"
                    >
                      <span className="text-sm capitalize">{service}</span>
                      <Badge variant="destructive">
                        <XCircle className="h-3 w-3 mr-1" />
                        {err.status}
                      </Badge>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
