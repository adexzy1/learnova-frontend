import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import apiClient from "@/lib/api-client";
import {
  SESSION_ENDPOINTS,
  TERM_ENDPOINTS,
  CLASS_ENDPOINTS,
  RESULTS_ENDPOINTS,
} from "@/lib/api-routes";
import { queryKeys } from "@/app/constants/queryKeys";
import { toast } from "sonner";
import type { ApiError, ClassLevel, Session, Term } from "@/types";
import type { AxiosResponse } from "axios";

interface SubjectResult {
  subjectId: string;
  subjectName: string;
  ca1: number;
  ca2: number;
  exam: number;
  total: number;
  grade: string;
  remark: string;
}

export interface StudentResult {
  studentId: string;
  studentName: string;
  admissionNumber: string;
  classId: string;
  className: string;
  subjects: SubjectResult[];
  totalScore: number;
  averageScore: number;
  position: number;
  totalStudents: number;
}

interface PublishPayload {
  sessionId: string;
  termId: string;
  classId?: string;
}

const useResultsService = () => {
  const queryClient = useQueryClient();

  const [selectedSession, setSelectedSession] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const hasSelection = !!selectedSession && !!selectedTerm && !!selectedClass;

  // ── Sessions ───────────────────────────────────────────────────────

  const { data: sessionsResponse, isLoading: sessionsLoading } = useQuery<
    AxiosResponse<{ data: Session[] }>
  >({
    queryKey: [queryKeys.SELECTABLE_SESSION],
    queryFn: () => apiClient.get(SESSION_ENDPOINTS.GET_SELECTABLE_SESSIONS),
  });

  // ── Terms ──────────────────────────────────────────────────────────

  const { data: termsResponse, isLoading: termsLoading } = useQuery<
    AxiosResponse<{ data: Term[] }>
  >({
    queryKey: [queryKeys.SELECTABLE_TERM],
    queryFn: () => apiClient.get(TERM_ENDPOINTS.GET_SELECTABLE_TERMS),
  });

  // ── Classes ────────────────────────────────────────────────────────

  const { data: classesResponse, isLoading: classesLoading } = useQuery<
    AxiosResponse<{ data: ClassLevel[] }>
  >({
    queryKey: [queryKeys.CLASS_ARMS],
    queryFn: () => apiClient.get(CLASS_ENDPOINTS.GET_ALL_CLASS_ARMS),
  });

  // ── Results ────────────────────────────────────────────────────────

  const { data: resultsResponse, isLoading: resultsLoading } = useQuery<
    AxiosResponse<{ data: StudentResult[] }>
  >({
    queryKey: [queryKeys.RESULTS, selectedSession, selectedTerm, selectedClass],
    queryFn: () =>
      apiClient.get(RESULTS_ENDPOINTS.GET_CLASS_RESULTS, {
        params: {
          sessionId: selectedSession,
          termId: selectedTerm,
          classId: selectedClass,
        },
      }),
    enabled: hasSelection,
  });

  // ── Publish mutation ───────────────────────────────────────────────

  const publishMutation = useMutation({
    mutationFn: (payload: PublishPayload) =>
      apiClient.post(RESULTS_ENDPOINTS.PUBLISH, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.RESULTS] });
      toast.success("Results published successfully!");
    },
    onError: (err: ApiError) => {
      toast.error(err.message ?? "Failed to publish results");
    },
  });

  // ── Derived data ───────────────────────────────────────────────────

  const sessions = sessionsResponse?.data?.data ?? [];
  const terms = termsResponse?.data?.data ?? [];
  const classOptions = classesResponse?.data?.data ?? [];
  const results = resultsResponse?.data?.data ?? [];

  const filteredResults = results.filter(
    (result) =>
      result.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.admissionNumber.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return {
    // selections
    selectedSession,
    setSelectedSession,
    selectedTerm,
    setSelectedTerm,
    selectedClass,
    setSelectedClass,
    searchQuery,
    setSearchQuery,
    hasSelection,

    // dropdown options
    sessions,
    terms,
    classOptions,
    sessionsLoading,
    termsLoading,
    classesLoading,

    // results
    results,
    filteredResults,
    resultsLoading,

    // mutations
    publishMutation,
  };
};

export default useResultsService;
