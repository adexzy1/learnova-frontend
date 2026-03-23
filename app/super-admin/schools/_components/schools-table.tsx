"use client";

import { DataTable } from "@/components/shared/table/data-table";
import { Tenant } from "@/types";
import { schoolsColumns } from "./schools-columns";

interface SchoolsTableProps {
  data: Tenant[];
  isLoading: boolean;
  pageCount: number;
  pagination: { page: number; per_page: number };
  onPaginationChange: (pagination: { page: number; per_page: number }) => void;
  search: string;
  onSearchChange: (search: string) => void;
  onEdit: (school: Tenant) => void;
}

export function SchoolsTable({
  data,
  isLoading,
  pageCount,
  pagination,
  onPaginationChange,
  search,
  onSearchChange,
  onEdit,
}: SchoolsTableProps) {
  const columns = schoolsColumns(onEdit);

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        emptyMessage="No schools found."
      />
    </>
  );
}
