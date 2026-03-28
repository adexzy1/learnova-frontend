"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import {
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Phone,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { TENANT_ENDPOINTS } from "@/lib/api-routes";
import { queryKeys } from "@/app/constants/queryKeys";
import type { PaginatedResponse } from "@/types";

interface PendingTenant {
  id: number;
  name: string;
  domainName: string;
  createdAt: string;
  plan: string | null;
  status: string;
}

export default function OnboardingPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  const {
    data: response,
    isLoading,
    error,
  } = useQuery<AxiosResponse<PaginatedResponse<PendingTenant>>>({
    queryKey: [queryKeys.TENANTS, "pending", page],
    queryFn: () =>
      axiosClient.get(TENANT_ENDPOINTS.GET_ALL_TENANTS, {
        params: { page, per_page: 10, status: 0 },
      }),
  });

  const tenants = response?.data?.data.data ?? [];
  const totalItems = response?.data?.data?.meta?.total ?? 0;
  const totalPages = response?.data?.data?.meta?.pageCount ?? 1;

  const approveMutation = useMutation({
    mutationFn: (id: number) =>
      axiosClient.patch(
        TENANT_ENDPOINTS.UPDATE_TENANT.replace(":id", String(id)),
        {
          status: 1,
        },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.TENANTS] });
      queryClient.invalidateQueries({
        queryKey: [queryKeys.SUPER_ADMIN_STATS],
      });
      toast.success("School approved successfully.");
    },
    onError: () => toast.error("Failed to approve school."),
  });

  const rejectMutation = useMutation({
    mutationFn: (id: number) =>
      axiosClient.delete(
        TENANT_ENDPOINTS.DELETE_TENANT.replace(":id", String(id)),
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.TENANTS] });
      queryClient.invalidateQueries({
        queryKey: [queryKeys.SUPER_ADMIN_STATS],
      });
      toast.success("School rejected and removed.");
    },
    onError: () => toast.error("Failed to reject school."),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Onboarding Requests"
        description="Review and approve pending school registration requests."
        breadcrumbs={[
          { label: "Dashboard", href: "/super-admin" },
          { label: "Onboarding" },
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle>Pending Applications</CardTitle>
          <CardDescription>
            {totalItems} school{totalItems !== 1 ? "s" : ""} awaiting approval
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
              Unable to load onboarding requests.
            </div>
          ) : tenants.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CheckCircle className="h-10 w-10 text-green-500 mb-3" />
              <p className="text-sm font-medium">All caught up!</p>
              <p className="text-xs text-muted-foreground mt-1">
                No pending onboarding requests.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>School Name</TableHead>
                  <TableHead>Domain</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tenants.map((tenant) => (
                  <TableRow key={tenant.id}>
                    <TableCell className="font-medium">{tenant.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {tenant.domainName}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{tenant.plan ?? "—"}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {tenant.createdAt
                        ? format(new Date(tenant.createdAt), "MMM d, yyyy")
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                      >
                        <Clock className="mr-1 h-3 w-3" />
                        Pending
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="default"
                          disabled={approveMutation.isPending}
                          onClick={() => approveMutation.mutate(tenant.id)}
                        >
                          {approveMutation.isPending ? (
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          ) : (
                            <CheckCircle className="h-4 w-4 mr-1" />
                          )}
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={rejectMutation.isPending}
                          onClick={() => rejectMutation.mutate(tenant.id)}
                        >
                          {rejectMutation.isPending ? (
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          ) : (
                            <XCircle className="h-4 w-4 mr-1" />
                          )}
                          Reject
                        </Button>
                      </div>
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
            Showing {tenants.length} of {totalItems} requests
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
