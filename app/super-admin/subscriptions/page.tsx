"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import { format } from "date-fns";
import { CreditCard } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/page-header";
import axiosClient from "@/lib/axios-client";
import { SUBSCRIPTION_ENDPOINTS } from "@/lib/api-routes";
import { queryKeys } from "@/app/constants/queryKeys";
import { PaginatedResponse } from "@/types";

interface SubscriptionRow {
  id: string;
  tenantId: number;
  tenantName: string;
  tenantSlug: string;
  planName: string;
  planPrice: string;
  status: "TRIAL" | "ACTIVE" | "CANCELLED" | "EXPIRED";
  trialStartAt: string;
  trialEndAt: string;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  nextPaymentDate: string | null;
}

const STATUS_STYLES: Record<string, string> = {
  ACTIVE:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  TRIAL: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  CANCELLED: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
  EXPIRED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export default function SubscriptionsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);

  const {
    data: response,
    isLoading,
    error,
  } = useQuery<AxiosResponse<PaginatedResponse<SubscriptionRow>>>({
    queryKey: [queryKeys.SUBSCRIPTION, "list", page],
    queryFn: () =>
      axiosClient.get(SUBSCRIPTION_ENDPOINTS.GET_SUBSCRIPTION, {
        params: { page, per_page: 15 },
      }),
  });

  const subscriptions = response?.data?.data?.data ?? [];
  const meta = response?.data?.data?.meta;
  const totalItems = meta?.total ?? 0;
  const totalPages = meta?.pageCount ?? 1;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subscriptions"
        description="View and manage all school subscriptions."
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Subscriptions" },
        ]}
      />

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
              Unable to load subscriptions.
            </div>
          ) : subscriptions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CreditCard className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-sm font-medium">No subscriptions yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Subscriptions will appear here when schools are created.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>School</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Trial End</TableHead>
                  <TableHead>Current Period</TableHead>
                  <TableHead>Next Payment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptions.map((sub) => (
                  <TableRow
                    key={sub.id}
                    className="cursor-pointer"
                    onClick={() =>
                      router.push(`/super-admin/schools/${sub.tenantId}`)
                    }
                  >
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{sub.tenantName}</p>
                        <p className="text-xs text-muted-foreground">
                          {sub.tenantSlug}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{sub.planName}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      ₦{Number(sub.planPrice ?? 0).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={STATUS_STYLES[sub.status] ?? ""}
                      >
                        {sub.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {sub.trialEndAt
                        ? format(new Date(sub.trialEndAt), "MMM d, yyyy")
                        : "—"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {sub.currentPeriodEnd
                        ? format(new Date(sub.currentPeriodEnd), "MMM d, yyyy")
                        : "—"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {sub.nextPaymentDate
                        ? format(new Date(sub.nextPaymentDate), "MMM d, yyyy")
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {subscriptions.length} of {totalItems} subscriptions
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
