import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { PaginatedResponse, Staff } from "@/types";
import axiosClient from "@/lib/axios-client";
import { ROLES_ENDPOINTS, STAFF_ENDPOINTS } from "@/lib/api-routes";
import { queryKeys } from "@/app/constants/queryKeys";
import { toast } from "sonner";
import { AxiosResponse } from "axios";
import { Role } from "@/components/settings/roles-manager/types";

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
    queryFn: async () =>
      axiosClient.get(STAFF_ENDPOINTS.GET_ALL_STAFF, {
        params: {
          page: pagination.page,
          per_page: pagination.per_page,
          search: filters.search || undefined,
          filters: JSON.stringify({
            role: filters.role !== "all" ? filters.role : undefined,
            status: filters.status !== "all" ? filters.status : undefined,
          }),
        },
      }),
  });

  const deactivateMutation = useMutation({
    mutationFn: async (staffId: string) => {
      const response = await axiosClient.patch(
        STAFF_ENDPOINTS.DEACTIVATE_STAFF.replace(":id", staffId),
      );
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.STAFF] });
      toast.success("Success", {
        description: data.message || "Staff member deactivated successfully",
      });
      setDeactivateDialogOpen(false);
      setDeactivateStaff(null);
    },
    onError: (error: any) => {
      toast.error("Error", {
        description:
          error?.response?.data?.message || "Failed to deactivate staff member",
      });
    },
  });

  const handleDeactivate = (staff: Staff) => {
    setDeactivateStaff(staff);
    setDeactivateDialogOpen(true);
  };

  return {
    staff: staffResponse?.data.data,
    meta: staffResponse?.data?.meta,
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
