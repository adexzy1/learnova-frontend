import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
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

export interface GenerateInvoicesPayload {
  classId: string;
  termId: string;
  sessionId: string;
  dueDate?: string;
  studentId?: string;
  sendEmail?: boolean;
}

export interface GenerateInvoicesResponse {
  generated: number;
  skipped: number;
  totalStudents: number;
}

export interface CreatePaymentPayload {
  studentId: string;
  amount: number;
  paymentMethod: "CASH" | "TRANSFER" | "CARD" | "ONLINE";
  reference?: string;
  allocations: { invoiceId: string; amount: number }[];
}

interface InvoiceStats {
  totalInvoices: number;
  totalBilled: number;
  totalCollected: number;
  totalOutstanding: number;
  unpaidCount: number;
  overdueCount: number;
  paidCount: number;
  partialCount: number;
}

const useInvoicesService = () => {
  const queryClient = useQueryClient();

  const [pagination, setPagination] = useState({ page: 1, limit: 100 });
  const [filters, setFilters] = useState({ search: "", status: "" });

  const { data: invoicesResponse, isLoading } = useQuery<
    AxiosResponse<PaginatedResponse<Invoice>>
  >({
    queryKey: [queryKeys.INVOICES, pagination, filters],
    queryFn: () =>
      apiClient.get(FINANCE_ENDPOINTS.INVOICES_GET_ALL, {
        params: {
          page: pagination.page,
          limit: pagination.limit,
          search: filters.search || undefined,
          status: filters.status || undefined,
        },
      }),
  });

  const { data: statsResponse, isLoading: isStatsLoading } = useQuery<
    AxiosResponse<{ data: InvoiceStats }>
  >({
    queryKey: [queryKeys.INVOICES, "stats"],
    queryFn: () => apiClient.get(FINANCE_ENDPOINTS.INVOICES_STATS),
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

  const generateMutation = useMutation<
    AxiosResponse<{ data: GenerateInvoicesResponse }>,
    ApiError,
    GenerateInvoicesPayload
  >({
    mutationFn: (payload) =>
      apiClient.post(FINANCE_ENDPOINTS.INVOICES_GENERATE, payload),
    onSuccess: (res) => {
      const { generated, skipped } = res.data.data;
      queryClient.invalidateQueries({ queryKey: [queryKeys.INVOICES] });
      let message = `${generated} invoice${generated !== 1 ? "s" : ""} generated successfully`;
      if (skipped > 0) {
        message += `. ${skipped} student${skipped !== 1 ? "s" : ""} skipped (already invoiced)`;
      }
      toast.success(message);
    },
    onError: (err) => {
      toast.error(err.message ?? "Failed to generate invoices");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiClient.delete(
        FINANCE_ENDPOINTS.INVOICES_DELETE.replace(":id", id),
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.INVOICES] });
      toast.success("Invoice deleted successfully");
    },
    onError: (err: ApiError) => {
      toast.error(err.message ?? "Failed to delete invoice");
    },
  });

  const sendInvoiceMutation = useMutation<void, ApiError, string>({
    mutationFn: (invoiceId: string) =>
      apiClient
        .post(FINANCE_ENDPOINTS.INVOICES_SEND.replace(":id", invoiceId))
        .then(() => undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.INVOICES] });
      toast.success("Invoice sent to guardian");
    },
    onError: (err) => {
      toast.error(err.message ?? "Failed to send invoice");
    },
  });

  const recordPaymentMutation = useMutation({
    mutationFn: (payload: CreatePaymentPayload) =>
      apiClient.post(FINANCE_ENDPOINTS.PAYMENTS_CREATE, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.INVOICES] });
      queryClient.invalidateQueries({ queryKey: [queryKeys.PAYMENTS] });
      queryClient.invalidateQueries({ queryKey: [queryKeys.LEDGER] });
      toast.success("Payment recorded successfully");
    },
    onError: (err: ApiError) => {
      toast.error(err.message ?? "Failed to record payment");
    },
  });

  const fetchInvoiceById = useCallback(
    async (id: string): Promise<Invoice | null> => {
      try {
        const res = await apiClient.get<{ data: Invoice }>(
          FINANCE_ENDPOINTS.INVOICES_GET_BY_ID.replace(":id", id),
        );
        const inv = res.data.data;
        return {
          ...inv,
          totalAmount: Number(inv.totalAmount),
          amountPaid: Number(inv.amountPaid),
          balance: Number(inv.totalAmount) - Number(inv.amountPaid),
        };
      } catch {
        toast.error("Failed to load invoice details");
        return null;
      }
    },
    [],
  );

  const invoices = invoicesResponse?.data?.data?.data ?? [];
  const meta = invoicesResponse?.data?.data?.meta;
  const statsData = statsResponse?.data?.data;

  return {
    invoices,
    meta,
    isLoading,
    isStatsLoading,
    pagination,
    setPagination,
    filters,
    setFilters,
    createMutation,
    generateMutation,
    deleteMutation,
    recordPaymentMutation,
    sendInvoiceMutation,
    fetchInvoiceById,
    stats: {
      totalBilled: statsData?.totalBilled ?? 0,
      totalCollected: statsData?.totalCollected ?? 0,
      totalOutstanding: statsData?.totalOutstanding ?? 0,
      totalInvoices: statsData?.totalInvoices ?? 0,
      overdueCount: statsData?.overdueCount ?? 0,
    },
  };
};

export default useInvoicesService;
