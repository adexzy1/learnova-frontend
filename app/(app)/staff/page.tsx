"use client";

import { Download, Plus, Upload } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

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
import { DataTableToolbar } from "@/components/shared/table/data-table-toolbar";
import { DataTablePagination } from "@/components/shared/table/pagination";

import useStaffService from "./_service/useStaffService";
import { getColumns } from "./_components/columns";
import { DeactivateStaffDialog } from "./_components/deactivate-dialog";
import { ImportStaffDialog } from "./_components/import-dialog";
import { useSelectableRoles } from "@/shared/service/useSelectableRoles";

export default function StaffPage() {
  const [importOpen, setImportOpen] = useState(false);
  const roles = useSelectableRoles();
  const {
    staff,
    isLoadingStaff,
    pagination,
    setPagination,
    meta,
    filters,
    setFilters,
    deactivateMutation,
    handleDeactivate,
    deactivateDialogOpen,
    setDeactivateDialogOpen,
    deactivateStaff,
  } = useStaffService();

  const columns = getColumns(handleDeactivate);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff Management"
        description="Manage teaching and non-teaching staff members"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Staff" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setImportOpen(true)}
            >
              <Upload className="mr-2 h-4 w-4" />
              Import
            </Button>
            <Button asChild size="sm">
              <Link href="/staff/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Staff
              </Link>
            </Button>
          </div>
        }
      />

      <DataTableToolbar>
        {/* <DataTableSearch
          value={filters.search}
          onChange={(val) => setFilters({ ...filters, search: val })}
          placeholder="Search staff..."
        /> */}
        <div className="flex items-center gap-4">
          <Select
            value={filters.role}
            onValueChange={(val) => setFilters({ ...filters, role: val })}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {roles?.map((role) => (
                <SelectItem key={role.id} value={role.id}>
                  {role.name}
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
              <SelectItem value="on-leave">On Leave</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </DataTableToolbar>

      <DataTable
        columns={columns}
        data={staff || []}
        isLoading={isLoadingStaff}
        emptyMessage="No staff members found. Add your first staff member to get started."
      />

      <DataTablePagination
        page={pagination.page}
        pageSize={pagination.per_page}
        totalPages={meta?.pageCount || 0}
        hasNextPage={meta?.hasNextPage || false}
        hasPrevPage={meta?.hasPreviousPage || false}
        onPaginationChange={(p) =>
          setPagination({
            page: p.page,
            per_page: p.pageSize,
          })
        }
      />

      <DeactivateStaffDialog
        open={deactivateDialogOpen}
        onOpenChange={setDeactivateDialogOpen}
        staff={deactivateStaff}
        onConfirm={(id) => deactivateMutation.mutate(id)}
        isLoading={deactivateMutation.isPending}
      />

      <ImportStaffDialog open={importOpen} onOpenChange={setImportOpen} />
    </div>
  );
}
