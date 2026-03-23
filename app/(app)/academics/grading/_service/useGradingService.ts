import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import apiClient from "@/lib/api-client";
import { GRADING_ENDPOINTS } from "@/lib/api-routes";
import { queryKeys } from "@/app/constants/queryKeys";
import { toast } from "sonner";
import type { ApiError, GradingSystem, PaginatedResponse } from "@/types";
import type { GradingSystemFormData } from "@/schemas";
import type { AxiosResponse } from "axios";

const useGradingService = () => {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSystem, setEditingSystem] = useState<GradingSystem | null>(
    null,
  );

  const { data: gradingSystemsResponse, isLoading } = useQuery<
    AxiosResponse<PaginatedResponse<GradingSystem>>
  >({
    queryKey: [queryKeys.GRADING_SYSTEMS],
    queryFn: () => apiClient.get(GRADING_ENDPOINTS.GET_ALL),
  });

  const createMutation = useMutation({
    mutationFn: (payload: GradingSystemFormData) =>
      apiClient.post(GRADING_ENDPOINTS.CREATE, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.GRADING_SYSTEMS] });
      toast.success("Grading system created!");
      setDialogOpen(false);
      setEditingSystem(null);
    },
    onError: (err: ApiError) => {
      toast.error(err.message ?? "Failed to create grading system");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: GradingSystemFormData;
    }) => apiClient.patch(GRADING_ENDPOINTS.UPDATE.replace(":id", id), payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.GRADING_SYSTEMS] });
      toast.success("Grading system updated!");
      setDialogOpen(false);
      setEditingSystem(null);
    },
    onError: (err: ApiError) => {
      toast.error(err.message ?? "Failed to update grading system");
    },
  });

  const setDefaultMutation = useMutation({
    mutationFn: (id: string) =>
      apiClient.patch(GRADING_ENDPOINTS.SET_DEFAULT.replace(":id", id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.GRADING_SYSTEMS] });
      toast.success("Default grading system updated!");
    },
    onError: (err: ApiError) => {
      toast.error(err.message ?? "Failed to set default grading system");
    },
  });

  const handleEdit = (system: GradingSystem) => {
    setEditingSystem(system);
    setDialogOpen(true);
  };

  const gradingSystems = gradingSystemsResponse?.data?.data.data ?? [];
  const meta = gradingSystemsResponse?.data.data.meta;

  return {
    gradingSystems,
    isLoading,
    dialogOpen,
    setDialogOpen,
    editingSystem,
    setEditingSystem,
    handleEdit,
    createMutation,
    updateMutation,
    setDefaultMutation,
  };
};

export default useGradingService;
