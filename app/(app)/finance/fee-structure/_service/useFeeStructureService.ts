import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { FINANCE_ENDPOINTS } from "@/lib/api-routes";
import { queryKeys } from "@/app/constants/queryKeys";
import { toast } from "sonner";
import type { ApiError, FeeStructure } from "@/types";
import type { AxiosResponse } from "axios";

export interface FeeStructurePayload {
  name: string;
  description?: string;
  amount: number;
  termId?: string;
  isActive: boolean;
  category?: string;
}

const useFeeStructureService = () => {
  const queryClient = useQueryClient();

  const {
    data: response,
    isLoading,
    error,
  } = useQuery<AxiosResponse<{ data: FeeStructure[] }>>({
    queryKey: [queryKeys.FEE_STRUCTURES],
    queryFn: () => apiClient.get(FINANCE_ENDPOINTS.FEE_STRUCTURES_GET_ALL),
  });

  const createMutation = useMutation({
    mutationFn: (payload: FeeStructurePayload) =>
      apiClient.post(FINANCE_ENDPOINTS.FEE_STRUCTURES_CREATE, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.FEE_STRUCTURES] });
      toast.success("Fee item created successfully");
    },
    onError: (err: ApiError) => {
      toast.error(err.message ?? "Failed to create fee item");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...payload }: FeeStructurePayload & { id: string }) =>
      apiClient.patch(
        FINANCE_ENDPOINTS.FEE_STRUCTURES_UPDATE.replace(":id", id),
        payload,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.FEE_STRUCTURES] });
      toast.success("Fee item updated successfully");
    },
    onError: (err: ApiError) => {
      toast.error(err.message ?? "Failed to update fee item");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiClient.delete(
        FINANCE_ENDPOINTS.FEE_STRUCTURES_DELETE.replace(":id", id),
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.FEE_STRUCTURES] });
      toast.success("Fee item deleted successfully");
    },
    onError: (err: ApiError) => {
      toast.error(err.message ?? "Failed to delete fee item");
    },
  });

  const feeStructures = response?.data.data ?? [];

  return {
    feeStructures,
    isLoading,
    error,
    createMutation,
    updateMutation,
    deleteMutation,
  };
};

export default useFeeStructureService;
