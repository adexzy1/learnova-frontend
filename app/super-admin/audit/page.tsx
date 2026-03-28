"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import { Search, Download, User } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import { PageHeader } from "@/components/shared/page-header";
import axiosClient from "@/lib/axios-client";
import { AUDIT_ENDPOINTS } from "@/lib/api-routes";
import { queryKeys } from "@/app/constants/queryKeys";
import { PaginatedResponse } from "@/types";

interface AuditLogEntry {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  userId: string;
  userRole: string | null;
  userEmail: string | null;
  detail: string | null;
  metadata: Record<string, any> | null;
  createdAt: string;
}

interface AuditResponse {
  data: AuditLogEntry[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    lastPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export default function AuditLogPage() {
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: response,
    isLoading,
    error,
  } = useQuery<AxiosResponse<PaginatedResponse<AuditLogEntry>>>({
    queryKey: [queryKeys.AUDIT_LOGS, page, actionFilter],
    queryFn: () =>
      axiosClient.get(AUDIT_ENDPOINTS.GET_ALL, {
        params: {
          page,
          per_page: 20,
          action: actionFilter !== "all" ? actionFilter : undefined,
        },
      }),
  });

  const auditData = response?.data;
  const logs = auditData?.data.data ?? [];
  const meta = auditData?.data.meta;
  const totalItems = meta?.total ?? 0;
  const totalPages = meta?.pageCount ?? 1;

  // Client-side search filter on visible results
  const filteredLogs = searchQuery
    ? logs.filter(
        (log: AuditLogEntry) =>
          log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.entity.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.userEmail?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : logs;

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Audit Logs"
          description="Monitor system activity and security events"
          breadcrumbs={[
            { label: "Dashboard", href: "/super-admin" },
            { label: "Audit Logs" },
          ]}
        />
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <p className="text-sm text-muted-foreground">
            Unable to load audit logs. The audit endpoint may be unavailable.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Logs"
        description="Monitor system activity and security events"
        breadcrumbs={[
          { label: "Dashboard", href: "/super-admin" },
          { label: "Audit Logs" },
        ]}
        actions={
          <Button variant="outline" disabled>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card p-4 rounded-lg border">
        <div className="relative w-full sm:w-[300px]">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search logs..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Select
            value={actionFilter}
            onValueChange={(v) => {
              setActionFilter(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="LOGIN">Login</SelectItem>
              <SelectItem value="LOGOUT">Logout</SelectItem>
              <SelectItem value="EXAM_PUBLISH">Exam Publish</SelectItem>
              <SelectItem value="PAYMENT">Payment</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
              No audit logs found.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                      <div className="flex flex-col">
                        <span>
                          {format(new Date(log.createdAt), "MMM d, yyyy")}
                        </span>
                        <span>
                          {format(new Date(log.createdAt), "HH:mm:ss")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs">
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{log.entity}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs">
                          {log.userEmail ?? log.userId}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {log.userRole ? (
                        <Badge
                          variant="secondary"
                          className="text-xs font-normal"
                        >
                          {log.userRole}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell
                      className="text-muted-foreground text-xs max-w-[200px] truncate"
                      title={log.detail ?? ""}
                    >
                      {log.detail ?? "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {filteredLogs.length} of {totalItems} logs
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
    </div>
  );
}
