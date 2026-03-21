import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import apiClient from "@/lib/api-client";
import { FINANCE_ENDPOINTS } from "@/lib/api-routes";
import { queryKeys } from "@/app/constants/queryKeys";
import { toast } from "sonner";
import type { ApiError, Invoice, PaginatedResponse } from "@/types";
import type { AxiosResponse } from "axios";

export interface CreateInvoicePayload {
  studentId: string;
  termId: string;
  dueDate: string;
  items: { description: string; amount: number }[];
}

const useInvoicesService = () => {
  const queryClient = useQueryClient();

  const [pagination, setPagination] = useState({ page: 1, per_page: 100 });
  const [filters, setFilters] = useState({ search: "", status: "" });

  const { data: invoicesResponse, isLoading } = useQuery<
    AxiosResponse<PaginatedResponse<Invoice>>
  >({
    queryKey: [queryKeys.INVOICES, pagination, filters],
    queryFn: () =>
      apiClient.get(FINANCE_ENDPOINTS.INVOICES_GET_ALL, {
        params: {
          page: pagination.page,
          per_page: pagination.per_page,
          search: filters.search || undefined,
          status: filters.status || undefined,
        },
      }),
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateInvoicePayload) =>
      apiClient.post(FINANCE_ENDPOINTS.INVOICES_CREATE, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.INVOICES] });
      toast.success("Invoice created successfully");
    },
    onError: (err: ApiError) => {
      toast.error(err.message ?? "Failed to create invoice");
    },
  });

  const invoices = invoicesResponse?.data?.data ?? [];
  const meta = invoicesResponse?.data?.meta;

  // Computed stats from fetched data
  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
  const outstanding = invoices
    .filter((inv) => ["unpaid", "partial", "overdue"].includes(inv.status))
    .reduce((sum, inv) => sum + inv.balance, 0);
  const collected = totalRevenue;
  const activeInvoices = invoices.length;

  return {
    invoices,
    meta,
    isLoading,
    pagination,
    setPagination,
    filters,
    setFilters,
    createMutation,
    stats: {
      totalRevenue,
      outstanding,
      collected,
      activeInvoices,
    },
  };
};

export default useInvoicesService;
