import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import apiClient from "@/lib/api-client";
import { FINANCE_ENDPOINTS } from "@/lib/api-routes";
import { queryKeys } from "@/app/constants/queryKeys";
import type { LedgerEntry, PaginatedResponse } from "@/types";
import type { AxiosResponse } from "axios";

interface LedgerStats {
  totalEntries: number;
  totalIncome: number;
  totalExpenses: number;
  netFlow: number;
}

export const useLedgerService = () => {
  const [pagination, setPagination] = useState({ page: 1, limit: 20 });
  const [filters, setFilters] = useState({ search: "", entryType: "" });

  const {
    data: ledgerResponse,
    isLoading,
    error,
  } = useQuery<AxiosResponse<PaginatedResponse<LedgerEntry>>>({
    queryKey: [queryKeys.LEDGER, pagination, filters],
    queryFn: () =>
      apiClient.get(FINANCE_ENDPOINTS.LEDGER_GET, {
        params: {
          page: pagination.page,
          limit: pagination.limit,
          search: filters.search || undefined,
          entryType: filters.entryType || undefined,
        },
      }),
  });

  const { data: statsResponse, isLoading: isStatsLoading } = useQuery<
    AxiosResponse<{ data: LedgerStats }>
  >({
    queryKey: [queryKeys.LEDGER, "stats"],
    queryFn: () => apiClient.get(FINANCE_ENDPOINTS.LEDGER_STATS),
  });

  const transactions = ledgerResponse?.data?.data?.data ?? [];
  const meta = ledgerResponse?.data?.data?.meta;
  const statsData = statsResponse?.data?.data;

  return {
    transactions,
    meta,
    isLoading,
    isStatsLoading,
    error,
    pagination,
    setPagination,
    filters,
    setFilters,
    stats: {
      totalIncome: statsData?.totalIncome ?? 0,
      totalExpenses: statsData?.totalExpenses ?? 0,
      netFlow: statsData?.netFlow ?? 0,
      totalEntries: statsData?.totalEntries ?? 0,
    },
  };
};
