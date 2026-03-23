import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import apiClient from "@/lib/api-client";
import { FINANCE_ENDPOINTS } from "@/lib/api-routes";
import { queryKeys } from "@/app/constants/queryKeys";
import { toast } from "sonner";
import type { ApiError, PaginatedResponse } from "@/types";
import type { AxiosResponse } from "axios";

export interface PaymentRecord {
  id: string;
  studentId: string;
  amount: number;
  paymentMethod: string;
  reference: string | null;
  paidAt: string;
  studentFirstName: string | null;
  studentLastName: string | null;
  admissionNumber: string | null;
  allocations: {
    id: string;
    invoiceId: string;
    amount: number;
  }[];
}

export interface CreatePaymentPayload {
  studentId: string;
  amount: number;
  paymentMethod: "CASH" | "TRANSFER" | "CARD" | "ONLINE";
  reference?: string;
  allocations: { invoiceId: string; amount: number }[];
}

interface PaymentStats {
  totalPayments: number;
  totalCollected: number;
}

const usePaymentsService = () => {
  const queryClient = useQueryClient();

  const [pagination, setPagination] = useState({ page: 1, limit: 20 });
  const [filters, setFilters] = useState({ search: "", paymentMethod: "" });

  const { data: paymentsResponse, isLoading } = useQuery<
    AxiosResponse<PaginatedResponse<PaymentRecord>>
  >({
    queryKey: [queryKeys.PAYMENTS, pagination, filters],
    queryFn: () =>
      apiClient.get(FINANCE_ENDPOINTS.PAYMENTS_GET_ALL, {
        params: {
          page: pagination.page,
          limit: pagination.limit,
          search: filters.search || undefined,
          paymentMethod: filters.paymentMethod || undefined,
        },
      }),
  });

  const { data: statsResponse, isLoading: isStatsLoading } = useQuery<
    AxiosResponse<{ data: PaymentStats }>
  >({
    queryKey: [queryKeys.PAYMENTS, "stats"],
    queryFn: () => apiClient.get(FINANCE_ENDPOINTS.PAYMENTS_STATS),
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreatePaymentPayload) =>
      apiClient.post(FINANCE_ENDPOINTS.PAYMENTS_CREATE, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.PAYMENTS] });
      queryClient.invalidateQueries({ queryKey: [queryKeys.INVOICES] });
      queryClient.invalidateQueries({ queryKey: [queryKeys.LEDGER] });
      toast.success("Payment recorded successfully");
    },
    onError: (err: ApiError) => {
      toast.error(err.message ?? "Failed to record payment");
    },
  });

  const payments = paymentsResponse?.data?.data.data ?? [];
  const meta = paymentsResponse?.data?.data?.meta;
  const statsData = statsResponse?.data?.data;

  return {
    payments,
    meta,
    isLoading,
    isStatsLoading,
    pagination,
    setPagination,
    filters,
    setFilters,
    createMutation,
    stats: {
      totalCollected: statsData?.totalCollected ?? 0,
      totalPayments: statsData?.totalPayments ?? 0,
    },
  };
};

export default usePaymentsService;
