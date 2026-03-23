import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import apiClient from "@/lib/api-client";
import { ADMISSIONS_ENDPOINTS } from "@/lib/api-routes";
import { queryKeys } from "@/app/constants/queryKeys";
import { toast } from "sonner";
import type { ApiError, PaginatedResponse } from "@/types";
import type { AxiosResponse } from "axios";

export interface AdmissionApplication {
  id: string;
  applicationNumber: string;
  status: string;
  submittedAt: string;
  entranceExamScore?: number;
  studentData: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
  };
  documents: { name: string; url: string }[];
}

export interface UpdateAdmissionStatusPayload {
  status: "approved" | "rejected" | "pending" | "assessment" | "interview";
}

const useAdmissionsService = () => {
  const queryClient = useQueryClient();

  const [pagination, setPagination] = useState({ page: 1, per_page: 10 });
  const [filters, setFilters] = useState({ search: "", status: "" });

  const { data: admissionsResponse, isLoading } = useQuery<
    AxiosResponse<PaginatedResponse<AdmissionApplication>>
  >({
    queryKey: [queryKeys.ADMISSIONS, pagination, filters],
    queryFn: () =>
      apiClient.get(ADMISSIONS_ENDPOINTS.GET_ALL, {
        params: {
          page: pagination.page,
          per_page: pagination.per_page,
          search: filters.search || undefined,
          status: filters.status || undefined,
        },
      }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateAdmissionStatusPayload;
    }) =>
      apiClient.patch(
        ADMISSIONS_ENDPOINTS.UPDATE_STATUS.replace(":id", id),
        payload,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.ADMISSIONS] });
      toast.success("Application status updated");
    },
    onError: (err: ApiError) => {
      toast.error(err.message ?? "Failed to update application status");
    },
  });

  const applications = admissionsResponse?.data?.data ?? [];
  const meta = admissionsResponse?.data?.meta;

  return {
    applications,
    meta,
    isLoading,
    pagination,
    setPagination,
    filters,
    setFilters,
    updateStatusMutation,
  };
};

export default useAdmissionsService;
