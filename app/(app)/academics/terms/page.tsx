"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, MoreHorizontal, Pencil, Trash2, Check } from "lucide-react";
import type { ColumnDef, PaginationState } from "@tanstack/react-table";
import { AxiosResponse } from "axios";
import { format } from "date-fns";

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
import type { Term, PaginatedResponse } from "@/types";
import { queryKeys } from "@/app/constants/queryKeys";
import axiosClient from "@/lib/axios-client";
import { TERM_ENDPOINTS } from "@/lib/api-routes";
import { TermFormDialog } from "./_components/term-form-dialog";
import { DeleteTermDialog } from "./_components/delete-term-dialog";

export default function TermsPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTerm, setEditingTerm] = useState<Term | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [termToDelete, setTermToDelete] = useState<Term | null>(null);

  // Pagination and Search State
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [search, setSearch] = useState("");

  const { data: termsResponse, isLoading } = useQuery<
    AxiosResponse<PaginatedResponse<Term>>
  >({
    queryKey: [queryKeys.TERM, pagination, search],
    queryFn: async () =>
      await axiosClient.get(TERM_ENDPOINTS.GET_ALL_TERMS, {
        params: {
          page: `${pagination.pageIndex + 1}`,
          per_page: `${pagination.pageSize}`,
          search: search || undefined,
        },
      }),
  });

  const terms = termsResponse?.data?.data || [];
  const pageCount = termsResponse?.data?.meta.totalPages || 0;

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await axiosClient.delete(
        TERM_ENDPOINTS.DELETE_TERM.replace(":id", id),
      );
      return res;
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.TERM] });
      toast.success(res.data.message);
      setDeleteDialogOpen(false);
      setTermToDelete(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Something went wrong");
    },
  });

  const handleEdit = (term: Term) => {
    setEditingTerm(term);
    setDialogOpen(true);
  };

  const handleDelete = (term: Term) => {
    setTermToDelete(term);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (termToDelete) {
      deleteMutation.mutate(termToDelete.id);
    }
  };

  const columns: ColumnDef<Term>[] = [
    {
      accessorKey: "name",
      header: "Term Name",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "session.name",
      header: "Session",
      cell: ({ row }) => {
        return (
          <div className="text-muted-foreground">
            {row.original.session.name}
          </div>
        );
      },
    },
    {
      accessorKey: "startDate",
      header: "Start Date",
      cell: ({ row }) =>
        format(new Date(row.getValue("startDate")), "MMM d, yyyy"),
    },
    {
      accessorKey: "endDate",
      header: "End Date",
      cell: ({ row }) =>
        format(new Date(row.getValue("endDate")), "MMM d, yyyy"),
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
        title="Terms Management"
        description="Manage academic terms for each session"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Academics", href: "#" },
          { label: "Terms" },
        ]}
        actions={
          <>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Term
            </Button>
            <TermFormDialog
              open={dialogOpen}
              onOpenChange={(open) => {
                setDialogOpen(open);
                if (!open) {
                  setEditingTerm(null);
                }
              }}
              initialData={editingTerm}
            />
          </>
        }
      />

      <DataTable
        columns={columns}
        data={terms}
        isLoading={isLoading}
        searchPlaceholder="Search terms..."
        searchColumn="name"
        emptyMessage="No terms found. Create your first academic term."
        pageCount={pageCount}
        pagination={pagination}
        onPaginationChange={setPagination}
        search={search}
        onSearchChange={setSearch}
      />

      <DeleteTermDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        termName={termToDelete?.name || ""}
        onConfirm={confirmDelete}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}
