import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { FINANCE_ENDPOINTS } from "@/lib/api-routes";
import { queryKeys } from "@/app/constants/queryKeys";
import type { LedgerEntry } from "@/types";
import type { AxiosResponse } from "axios";

export const useLedgerService = () => {
  const { data: ledgerResponse, isLoading, error } = useQuery<
    AxiosResponse<LedgerEntry[]>
  >({
    queryKey: [queryKeys.LEDGER],
    queryFn: () => apiClient.get(FINANCE_ENDPOINTS.LEDGER_GET),
  });

  const transactions = ledgerResponse?.data ?? [];

  const totalIncome = transactions
    .filter((tx) => tx.type === "credit")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalExpenses = transactions
    .filter((tx) => tx.type === "debit")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const netFlow = totalIncome - totalExpenses;

  return {
    transactions,
    isLoading,
    error,
    stats: { totalIncome, totalExpenses, netFlow },
  };
};
