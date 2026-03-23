import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import type { PaginatedResponse, Staff, ApiError } from "@/types";
import apiClient from "@/lib/api-client";
import { STAFF_ENDPOINTS } from "@/lib/api-routes";
import { queryKeys } from "@/app/constants/queryKeys";
import { toast } from "sonner";
import type { AxiosResponse } from "axios";

const useStaffService = () => {
  const queryClient = useQueryClient();

  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);
  const [deactivateStaff, setDeactivateStaff] = useState<Staff | null>(null);

  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 10,
  });

  const [filters, setFilters] = useState({
    role: "all",
    status: "all",
    search: "",
  });

  const { data: staffResponse, isLoading: isLoadingStaff } = useQuery<
    AxiosResponse<PaginatedResponse<Staff>>
  >({
    queryKey: [queryKeys.STAFF, pagination.page, pagination.per_page, filters],
    queryFn: () =>
      apiClient.get(STAFF_ENDPOINTS.GET_ALL_STAFF, {
        params: {
          page: pagination.page,
          limit: pagination.per_page,
          search: filters.search || undefined,
          filters: JSON.stringify({
            role: filters.role !== "all" ? filters.role : undefined,
            status: filters.status !== "all" ? filters.status : undefined,
          }),
        },
      }),
  });

  const deactivateMutation = useMutation({
    mutationFn: (staffId: string) =>
      apiClient.patch(
        STAFF_ENDPOINTS.DEACTIVATE_STAFF.replace(":id", staffId),
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.STAFF] });
      toast.success("Staff member deactivated successfully");
      setDeactivateDialogOpen(false);
      setDeactivateStaff(null);
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Failed to deactivate staff member");
    },
  });

  const handleDeactivate = (staff: Staff) => {
    setDeactivateStaff(staff);
    setDeactivateDialogOpen(true);
  };

  return {
    staff: staffResponse?.data.data.data,
    meta: staffResponse?.data?.data.meta,
    pagination,
    setPagination,
    filters,
    setFilters,
    isLoadingStaff,
    deactivateMutation,
    handleDeactivate,
    deactivateDialogOpen,
    setDeactivateDialogOpen,
    deactivateStaff,
  };
};

export default useStaffService;
