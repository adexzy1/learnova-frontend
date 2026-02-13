"use client";

import { Download, Plus } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/table/data-table";
import { fetchClasses } from "@/lib/api";
import useStudentService from "./_service/useStudentService";
import { getColumns } from "./_components/columns";
import { DeleteStudentDialog } from "./_components/delete-dialog";
import { DataTableToolbar } from "@/components/shared/table/data-table-toolbar";
import { DataTableSearch } from "@/components/shared/table/data-table-search";
import { DataTablePagination } from "@/components/shared/table/pagination";
import axiosClient from "@/lib/axios-client";
import { CLASS_ENDPOINTS } from "@/lib/api-routes";
import { queryKeys } from "@/app/constants/queryKeys";
import { AxiosResponse } from "axios";
import { ClassArm } from "@/types";

export default function StudentsPage() {
  const {
    students,
    isLoadingStudents,
    pagination,
    setPagination,
    meta,
    filters,
    setFilters,
    deleteStudent,
    deleteMutation,
    handleDelete,
    deleteDialogOpen,
    setDeleteDialogOpen,
  } = useStudentService();

  const { data: classes } = useQuery<
    AxiosResponse<Pick<ClassArm, "id" | "name">[]>
  >({
    queryKey: [queryKeys.CLASSES],
    queryFn: async () => axiosClient.get(CLASS_ENDPOINTS.GET_ALL_CLASS_ARMS),
  });

  const columns = getColumns(handleDelete);

  // Flatten arms for dropdown

  return (
    <div className="space-y-6">
      <PageHeader
        title="Students"
        description="Manage student records and information"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Students" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button asChild size="sm">
              <Link href="/students/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Student
              </Link>
            </Button>
          </div>
        }
      />

      <DataTableToolbar>
        <DataTableSearch
          value={filters.search}
          onChange={(val) => setFilters({ ...filters, search: val })}
          placeholder="Search students..."
        />
        <div className="flex items-center gap-4">
          <Select
            value={filters.class}
            onValueChange={(val) => setFilters({ ...filters, class: val })}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Classes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {classes?.data.map((opt) => (
                <SelectItem key={opt.id} value={opt.id}>
                  {opt.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.status}
            onValueChange={(val) => setFilters({ ...filters, status: val })}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="graduated">Graduated</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </DataTableToolbar>

      <DataTable
        columns={columns}
        data={students || []}
        isLoading={isLoadingStudents}
        emptyMessage="No students found. Add your first student to get started."
      />

      <DataTablePagination
        page={pagination.page}
        pageSize={pagination.per_page}
        totalPages={meta?.lastPage || 0}
        hasNextPage={meta?.hasNextPage || false}
        hasPrevPage={meta?.hasPrevPage || false}
        onPaginationChange={(pagination) =>
          setPagination({
            page: pagination.page,
            per_page: pagination.pageSize,
          })
        }
      />

      <DeleteStudentDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        student={deleteStudent}
        onConfirm={(id) => deleteMutation.mutate(id)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
