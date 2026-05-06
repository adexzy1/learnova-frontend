import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import apiClient from "@/lib/api-client";
import { FINANCE_ENDPOINTS } from "@/lib/api-routes";
import { queryKeys } from "@/app/constants/queryKeys";
import { toast } from "sonner";
import type { ApiError, PaginatedResponse } from "@/types";
import type { AxiosResponse } from "axios";

export interface Expense {
  id: string;
  entryType: "EXPENSE";
  description: string;
  amount: number;
  category: string;
  reference: string | null;
  occurredAt: string;
  createdAt: string;
}

export interface CreateExpensePayload {
  entryType: "EXPENSE";
  description: string;
  amount: number;
  category?: string;
  reference?: string;
}

const useExpensesService = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({ search: "", page: 1, limit: 50 });

  const { data: response, isLoading } = useQuery<
    AxiosResponse<PaginatedResponse<Expense>>
  >({
    queryKey: [queryKeys.EXPENSES, filters],
    queryFn: () =>
      apiClient.get(FINANCE_ENDPOINTS.EXPENSES_GET, {
        params: {
          entryType: "EXPENSE",
          page: filters.page,
          limit: filters.limit,
        },
      }),
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateExpensePayload) =>
      apiClient.post(FINANCE_ENDPOINTS.EXPENSES_CREATE, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.EXPENSES] });
      toast.success("Expense logged successfully");
    },
    onError: (err: ApiError) => {
      toast.error(err.message ?? "Failed to log expense");
    },
  });

  const expenses = response?.data?.data?.data ?? [];
  const meta = response?.data?.data?.meta;

  return { expenses, meta, isLoading, filters, setFilters, createMutation };
};

export default useExpensesService;
