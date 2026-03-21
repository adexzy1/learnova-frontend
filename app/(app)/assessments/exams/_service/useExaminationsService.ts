import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import apiClient from "@/lib/api-client";
import { ASSESSMENT_ENDPOINTS, SESSION_ENDPOINTS } from "@/lib/api-routes";
import { queryKeys } from "@/app/constants/queryKeys";
import { toast } from "sonner";
import type { ApiError, Session } from "@/types";
import type { AxiosResponse } from "axios";
import type { Examination } from "@/lib/api";

interface ExaminationFormData {
  name: string;
  sessionId: string;
  termId: string;
  startDate: string;
  endDate: string;
  status: "scheduled" | "ongoing" | "completed";
}

const useExaminationsService = () => {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Examination | null>(null);

  const { data: examinationsResponse, isLoading: examinationsLoading } =
    useQuery<AxiosResponse<{ data: Examination[] }>>({
      queryKey: [queryKeys.EXAMINATIONS],
      queryFn: () => apiClient.get(ASSESSMENT_ENDPOINTS.EXAMINATIONS_GET),
    });

  const { data: sessionsResponse, isLoading: sessionsLoading } = useQuery<
    AxiosResponse<{ data: Session[] }>
  >({
    queryKey: [queryKeys.SELECTABLE_SESSION],
    queryFn: () => apiClient.get(SESSION_ENDPOINTS.GET_SELECTABLE_SESSIONS),
  });

  const createMutation = useMutation({
    mutationFn: (payload: ExaminationFormData) =>
      apiClient.post(ASSESSMENT_ENDPOINTS.EXAMINATIONS_CREATE, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.EXAMINATIONS] });
      toast.success("Examination created!");
      setDialogOpen(false);
      setEditingExam(null);
    },
    onError: (err: ApiError) => {
      toast.error(err.message ?? "Failed to create examination");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: ExaminationFormData;
    }) =>
      apiClient.patch(
        ASSESSMENT_ENDPOINTS.EXAMINATIONS_UPDATE.replace(":id", id),
        payload,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.EXAMINATIONS] });
      toast.success("Examination updated!");
      setDialogOpen(false);
      setEditingExam(null);
    },
    onError: (err: ApiError) => {
      toast.error(err.message ?? "Failed to update examination");
    },
  });

  const handleEdit = (exam: Examination) => {
    setEditingExam(exam);
    setDialogOpen(true);
  };

  const examinations = examinationsResponse?.data?.data ?? [];
  const sessions = sessionsResponse?.data?.data ?? [];

  return {
    examinations,
    examinationsLoading,
    sessions,
    sessionsLoading,
    dialogOpen,
    setDialogOpen,
    editingExam,
    setEditingExam,
    handleEdit,
    createMutation,
    updateMutation,
  };
};

export default useExaminationsService;
