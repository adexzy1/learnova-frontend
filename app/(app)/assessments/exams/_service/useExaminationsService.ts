import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo, useCallback } from "react";
import apiClient from "@/lib/api-client";
import {
  ASSESSMENT_ENDPOINTS,
  SESSION_ENDPOINTS,
  TERM_ENDPOINTS,
} from "@/lib/api-routes";
import { queryKeys } from "@/app/constants/queryKeys";
import { toast } from "sonner";
import type { ApiError, Session, Examination, Term } from "@/types";
import type { AxiosResponse } from "axios";

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

  const { data: termsResponse } = useQuery<
    AxiosResponse<{ data: Term[] }>
  >({
    queryKey: [queryKeys.SELECTABLE_TERM],
    queryFn: () => apiClient.get(TERM_ENDPOINTS.GET_SELECTABLE_TERMS),
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

  const handleEdit = useCallback((exam: Examination) => {
    setEditingExam(exam);
    setDialogOpen(true);
  }, []);

  const examinations = useMemo(
    () => examinationsResponse?.data?.data ?? [],
    [examinationsResponse],
  );
  const sessions = useMemo(
    () => sessionsResponse?.data?.data ?? [],
    [sessionsResponse],
  );
  const terms = useMemo(
    () => termsResponse?.data?.data ?? [],
    [termsResponse],
  );

  return {
    examinations,
    examinationsLoading,
    sessions,
    sessionsLoading,
    terms,
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
