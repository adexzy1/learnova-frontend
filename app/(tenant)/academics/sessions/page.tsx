"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, MoreHorizontal, Pencil, Trash2, Check } from "lucide-react";
import type { ColumnDef, PaginationState } from "@tanstack/react-table";
import { AxiosResponse } from "axios";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/table/data-table";
import { formatDate } from "@/lib/format";
import type { Session, PaginatedResponse } from "@/types";
import { queryKeys } from "@/app/constants/queryKeys";
import axiosClient from "@/lib/axios-client";
import { SESSION_ENDPOINTS } from "@/lib/api-routes";
import { SessionFormDialog } from "./_components/session-form-dialog";
import { DeleteSessionDialog } from "./_components/delete-session-dialog";

export default function SessionsPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<Session | null>(null);

  // Pagination and Search State
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [search, setSearch] = useState("");

  const { data: sessionsResponse, isLoading } = useQuery<
    AxiosResponse<PaginatedResponse<Session>>
  >({
    queryKey: [queryKeys.SESSION, pagination, search],
    queryFn: async () =>
      await axiosClient.get(SESSION_ENDPOINTS.GET_ALL_SESSIONS, {
        params: {
          page: `${pagination.pageIndex + 1}`,
          per_page: `${pagination.pageSize}`,
          search: search || undefined,
        },
      }),
  });

  const sessions = sessionsResponse?.data?.data || [];
  const pageCount = sessionsResponse?.data?.meta.totalPages || 0;

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await axiosClient.delete(
        SESSION_ENDPOINTS.DELETE_SESSION.replace(":id", id),
      );
      return res;
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.SESSION] });
      toast.success(res.data.message);
      setDeleteDialogOpen(false);
      setSessionToDelete(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Something went wrong");
    },
  });

  const handleEdit = (session: Session) => {
    setEditingSession(session);
    setDialogOpen(true);
  };

  const handleDelete = (session: Session) => {
    setSessionToDelete(session);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (sessionToDelete) {
      deleteMutation.mutate(sessionToDelete.id);
    }
  };

  const columns: ColumnDef<Session>[] = [
    {
      accessorKey: "name",
      header: "Session Name",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "startDate",
      header: "Start Date",
      cell: ({ row }) => formatDate(row.getValue("startDate")),
    },
    {
      accessorKey: "endDate",
      header: "End Date",
      cell: ({ row }) => formatDate(row.getValue("endDate")),
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) =>
        row.getValue("isActive") ? (
          <Badge className="gap-1">
            <Check className="h-3 w-3" />
            Active
          </Badge>
        ) : (
          <Badge variant="secondary">Inactive</Badge>
        ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleEdit(row.original)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleDelete(row.original)}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Academic Sessions"
        description="Manage academic sessions and their date ranges"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Academics", href: "#" },
          { label: "Sessions" },
        ]}
        actions={
          <>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Session
            </Button>
            <SessionFormDialog
              open={dialogOpen}
              onOpenChange={(open) => {
                setDialogOpen(open);
                if (!open) {
                  setEditingSession(null);
                }
              }}
              initialData={editingSession}
            />
          </>
        }
      />

      <DataTable
        columns={columns}
        data={sessions}
        isLoading={isLoading}
        searchPlaceholder="Search sessions..."
        searchColumn="name"
        emptyMessage="No sessions found. Create your first academic session."
        pageCount={pageCount}
        pagination={pagination}
        onPaginationChange={setPagination}
        search={search}
        onSearchChange={setSearch}
      />

      <DeleteSessionDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        sessionName={sessionToDelete?.name || ""}
        onConfirm={confirmDelete}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}
