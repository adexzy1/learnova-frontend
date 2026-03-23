import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import apiClient from "@/lib/api-client";
import { DISCIPLINE_ENDPOINTS } from "@/lib/api-routes";
import { queryKeys } from "@/app/constants/queryKeys";
import { toast } from "sonner";
import type { ApiError, DisciplineIncident, PaginatedResponse } from "@/types";
import type { AxiosResponse } from "axios";

export interface CreateIncidentPayload {
  studentId: string;
  type: "minor" | "major" | "severe";
  description: string;
  date: string;
}

export interface UpdateStatusPayload {
  status: "open" | "resolved";
}

const useDisciplineService = () => {
  const queryClient = useQueryClient();

  const [pagination, setPagination] = useState({ page: 1, per_page: 10 });
  const [filters, setFilters] = useState({ search: "", status: "" });

  const { data: incidentsResponse, isLoading } = useQuery<
    AxiosResponse<PaginatedResponse<DisciplineIncident>>
  >({
    queryKey: [queryKeys.DISCIPLINE, pagination, filters],
    queryFn: () =>
      apiClient.get(DISCIPLINE_ENDPOINTS.GET_ALL, {
        params: {
          page: pagination.page,
          per_page: pagination.per_page,
          search: filters.search || undefined,
          status: filters.status || undefined,
        },
      }),
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateIncidentPayload) =>
      apiClient.post(DISCIPLINE_ENDPOINTS.CREATE, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.DISCIPLINE] });
      toast.success("Incident reported successfully");
    },
    onError: (err: ApiError) => {
      toast.error(err.message ?? "Failed to report incident");
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateStatusPayload }) =>
      apiClient.patch(DISCIPLINE_ENDPOINTS.UPDATE_STATUS.replace(":id", id), payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.DISCIPLINE] });
      toast.success("Incident status updated");
    },
    onError: (err: ApiError) => {
      toast.error(err.message ?? "Failed to update incident status");
    },
  });

  const incidents = incidentsResponse?.data?.data ?? [];
  const meta = incidentsResponse?.data?.meta;

  return {
    incidents,
    meta,
    isLoading,
    pagination,
    setPagination,
    filters,
    setFilters,
    createMutation,
    updateStatusMutation,
  };
};

export default useDisciplineService;
