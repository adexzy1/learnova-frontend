"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TenantListItem, PaginatedResponse } from "@/types";
import { queryKeys } from "@/app/constants/queryKeys";
import { TENANT_ENDPOINTS } from "@/lib/api-routes";
import axiosClient from "@/lib/axios-client";
import { AxiosResponse } from "axios";

export function useSchoolsService() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState<TenantListItem | null>(null);

  // Pagination and Search State
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 10,
  });
  const [search, setSearch] = useState("");

  const { data: tenantsResponse, isLoading } = useQuery<
    AxiosResponse<PaginatedResponse<TenantListItem>>
  >({
    queryKey: [queryKeys.TENANTS, pagination, search],
    queryFn: async () =>
      await axiosClient.get(TENANT_ENDPOINTS.GET_ALL_TENANTS, {
        params: {
          page: pagination.page,
          per_page: pagination.per_page,
          search: search || undefined,
        },
      }),
  });

  const tenants = tenantsResponse?.data?.data.data || [];
  const pageCount = tenantsResponse?.data?.data.meta.pageCount || 0;

  const handleEdit = (school: TenantListItem) => {
    setEditingSchool(school);
    setIsCreateOpen(true);
  };

  const handleCreateOpen = (open: boolean) => {
    setIsCreateOpen(open);
    if (!open) setEditingSchool(null);
  };

  return {
    tenants,
    isLoading,
    pageCount,
    pagination,
    setPagination,
    search,
    setSearch,
    isCreateOpen,
    setIsCreateOpen,
    editingSchool,
    handleEdit,
    handleCreateOpen,
  };
}
