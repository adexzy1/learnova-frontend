import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import apiClient from "@/lib/api-client";
import {
  ASSESSMENT_ENDPOINTS,
  SESSION_ENDPOINTS,
  TERM_ENDPOINTS,
} from "@/lib/api-routes";
import { queryKeys } from "@/app/constants/queryKeys";
import { toast } from "sonner";
import type { ApiError, CAConfig, Session } from "@/types";
import type { AxiosResponse } from "axios";

interface SlimTerm {
  id: string;
  name: string;
}

interface CAConfigFormData {
  name: string;
  maxScore: number;
  weight?: number;
  termId: string;
}

interface UpdateCAConfigFormData {
  name?: string;
  maxScore?: number;
  weight?: number;
  isLocked?: boolean;
}

const useCAConfigService = () => {
  const queryClient = useQueryClient();
  const [selectedSession, setSelectedSession] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<CAConfig | null>(null);

  // Fetch sessions for the first dropdown
  const { data: sessionsRes } = useQuery<AxiosResponse<{ data: Session[] }>>({
    queryKey: [queryKeys.SELECTABLE_SESSION],
    queryFn: () => apiClient.get(SESSION_ENDPOINTS.GET_SELECTABLE_SESSIONS),
  });

  // Fetch terms filtered by selected session
  const { data: termsRes } = useQuery<AxiosResponse<{ data: SlimTerm[] }>>({
    queryKey: [queryKeys.SELECTABLE_TERM, "select", selectedSession],
    queryFn: () =>
      apiClient.get(TERM_ENDPOINTS.GET_SELECTABLE_TERMS, {
        params: { sessionId: selectedSession },
      }),
    enabled: !!selectedSession,
  });

  // Reset term when session changes
  const handleSessionChange = (sessionId: string) => {
    setSelectedSession(sessionId);
    setSelectedTerm("");
  };

  const { data: configsRes, isLoading: configsLoading } = useQuery<
    AxiosResponse<{ data: CAConfig[] }>
  >({
    queryKey: [queryKeys.CA_CONFIGS, selectedTerm],
    queryFn: () =>
      apiClient.get(ASSESSMENT_ENDPOINTS.CA_CONFIGS_GET, {
        params: { termId: selectedTerm },
      }),
    enabled: !!selectedTerm,
  });

  const createMutation = useMutation({
    mutationFn: (payload: CAConfigFormData) =>
      apiClient.post(ASSESSMENT_ENDPOINTS.CA_CONFIGS_CREATE, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.CA_CONFIGS] });
      toast.success("CA configuration created!");
      setDialogOpen(false);
    },
    onError: (err: ApiError) => {
      toast.error(err.message ?? "Failed to create CA configuration");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateCAConfigFormData;
    }) =>
      apiClient.patch(
        ASSESSMENT_ENDPOINTS.CA_CONFIGS_UPDATE.replace(":id", id),
        payload,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.CA_CONFIGS] });
      toast.success("CA configuration updated!");
      setDialogOpen(false);
      setEditingConfig(null);
    },
    onError: (err: ApiError) => {
      toast.error(err.message ?? "Failed to update CA configuration");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiClient.delete(
        ASSESSMENT_ENDPOINTS.CA_CONFIGS_DELETE.replace(":id", id),
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.CA_CONFIGS] });
      toast.success("CA configuration deleted!");
    },
    onError: (err: ApiError) => {
      toast.error(err.message ?? "Failed to delete CA configuration");
    },
  });

  const toggleLockMutation = useMutation({
    mutationFn: ({ id, isLocked }: { id: string; isLocked: boolean }) =>
      apiClient.patch(
        ASSESSMENT_ENDPOINTS.CA_CONFIGS_UPDATE.replace(":id", id),
        { isLocked },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.CA_CONFIGS] });
      toast.success("Lock status updated!");
    },
    onError: (err: ApiError) => {
      toast.error(err.message ?? "Failed to update lock status");
    },
  });

  const handleEdit = (config: CAConfig) => {
    setEditingConfig(config);
    setDialogOpen(true);
  };

  const sessions = sessionsRes?.data?.data ?? [];
  const terms = termsRes?.data?.data ?? [];
  const configs = configsRes?.data?.data ?? [];
  const totalMaxScore = configs.reduce((sum, c) => sum + c.maxScore, 0);

  return {
    selectedSession,
    handleSessionChange,
    selectedTerm,
    setSelectedTerm,
    sessions,
    terms,
    configs,
    configsLoading,
    totalMaxScore,
    dialogOpen,
    setDialogOpen,
    editingConfig,
    setEditingConfig,
    handleEdit,
    createMutation,
    updateMutation,
    deleteMutation,
    toggleLockMutation,
  };
};

export default useCAConfigService;
