import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback, useMemo } from "react";
import apiClient from "@/lib/api-client";
import {
  CLASS_ENDPOINTS,
  SUBJECT_ENDPOINTS,
  TERM_ENDPOINTS,
  ASSESSMENT_ENDPOINTS,
} from "@/lib/api-routes";
import { queryKeys } from "@/app/constants/queryKeys";
import { toast } from "sonner";
import type { ApiError, ClassLevel, Subject, Term, CAConfig } from "@/types";
import type { AxiosResponse } from "axios";

interface StudentWithScores {
  id: string;
  admissionNumber: string;
  firstName: string;
  lastName: string;
  /** Scores keyed by caConfigId. null = not yet entered. */
  scores: Record<string, number | null>;
}

interface CAResponse {
  configs: CAConfig[];
  students: StudentWithScores[];
}

interface SaveCAScoresPayload {
  classId: string;
  subjectId: string;
  termId: string;
  scores: {
    studentId: string;
    subjectId: string;
    termId: string;
    caConfigId: string;
    score: number;
  }[];
}

function scoreKey(studentId: string, caConfigId: string) {
  return `${studentId}-${caConfigId}`;
}

const useCAService = () => {
  const queryClient = useQueryClient();

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");
  const [edits, setEdits] = useState<Record<string, number | "">>({});
  const [isLocked, setIsLocked] = useState(false);

  const hasSelection = !!selectedClass && !!selectedSubject && !!selectedTerm;

  // ── Dropdown data ──────────────────────────────────────────────────

  const { data: classesRes } = useQuery<AxiosResponse<{ data: ClassLevel[] }>>({
    queryKey: [queryKeys.CLASS_ARMS],
    queryFn: () => apiClient.get(CLASS_ENDPOINTS.GET_ALL_CLASS_ARMS),
  });

  const { data: subjectsRes } = useQuery<AxiosResponse<{ data: Subject[] }>>({
    queryKey: [queryKeys.SELECTABLE_SUBJECTS],
    queryFn: () => apiClient.get(SUBJECT_ENDPOINTS.GET_SELECTABLE_SUBJECTS),
  });

  const { data: termsRes } = useQuery<AxiosResponse<{ data: Term[] }>>({
    queryKey: [queryKeys.SELECTABLE_TERM],
    queryFn: () => apiClient.get(TERM_ENDPOINTS.GET_SELECTABLE_TERMS),
  });

  // ── Single call: configs + students with scores ───────────────────

  const { data: caRes, isLoading: caLoading } = useQuery<
    AxiosResponse<{ data: CAResponse }>
  >({
    queryKey: [
      queryKeys.ASSESSMENTS_CA,
      selectedClass,
      selectedSubject,
      selectedTerm,
    ],
    queryFn: () =>
      apiClient.get(ASSESSMENT_ENDPOINTS.CA_SCORES_GET, {
        params: {
          classId: selectedClass,
          subjectId: selectedSubject,
          termId: selectedTerm,
        },
      }),
    enabled: hasSelection,
  });

  // ── Save mutation ──────────────────────────────────────────────────

  const saveMutation = useMutation({
    mutationFn: (payload: SaveCAScoresPayload) =>
      apiClient.post(ASSESSMENT_ENDPOINTS.CA_SCORES_SAVE, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.ASSESSMENTS_CA] });
      setEdits({});
      toast.success("Scores saved successfully!");
    },
    onError: (err: ApiError) => {
      toast.error(err.message ?? "Failed to save scores");
    },
  });

  // ── Derived data ───────────────────────────────────────────────────

  const classes = classesRes?.data?.data ?? [];
  const subjects = subjectsRes?.data?.data ?? [];
  const terms = termsRes?.data?.data ?? [];
  const caConfigs = caRes?.data?.data?.configs ?? [];
  const students = caRes?.data?.data?.students ?? [];

  const totalMaxScore = useMemo(
    () => caConfigs.reduce((sum, c) => sum + c.maxScore, 0),
    [caConfigs],
  );

  // ── Score helpers ──────────────────────────────────────────────────

  /** Returns the display value: local edit > server value > empty */
  const getScore = useCallback(
    (studentId: string, caConfigId: string): number | "" => {
      const key = scoreKey(studentId, caConfigId);
      if (key in edits) return edits[key];
      const server = students.find((s) => s.id === studentId)?.scores[
        caConfigId
      ];
      return server ?? "";
    },
    [edits, students],
  );

  const handleScoreChange = useCallback(
    (
      studentId: string,
      caConfigId: string,
      value: string,
      maxScore: number,
    ) => {
      const key = scoreKey(studentId, caConfigId);
      const numValue =
        value === ""
          ? ""
          : Math.min(Math.max(0, parseInt(value) || 0), maxScore);
      setEdits((prev) => ({ ...prev, [key]: numValue }));
    },
    [],
  );

  const getStudentTotal = useCallback(
    (studentId: string): number =>
      caConfigs.reduce((sum, config) => {
        const val = getScore(studentId, config.id);
        return sum + (typeof val === "number" ? val : 0);
      }, 0),
    [caConfigs, getScore],
  );

  const handleSave = useCallback(() => {
    // Collect all scores: merge server values with local edits
    const scoresArray: SaveCAScoresPayload["scores"] = [];

    for (const student of students) {
      for (const config of caConfigs) {
        const val = getScore(student.id, config.id);
        if (typeof val === "number") {
          scoresArray.push({
            studentId: student.id,
            subjectId: selectedSubject,
            termId: selectedTerm,
            caConfigId: config.id,
            score: val,
          });
        }
      }
    }

    if (scoresArray.length === 0) return;

    saveMutation.mutate({
      classId: selectedClass,
      subjectId: selectedSubject,
      termId: selectedTerm,
      scores: scoresArray,
    });
  }, [
    students,
    caConfigs,
    getScore,
    selectedClass,
    selectedSubject,
    selectedTerm,
    saveMutation,
  ]);

  return {
    selectedClass,
    setSelectedClass,
    selectedSubject,
    setSelectedSubject,
    selectedTerm,
    setSelectedTerm,
    hasSelection,
    isLocked,
    setIsLocked,

    classes,
    subjects,
    terms,

    students,
    caConfigs,
    totalMaxScore,
    caLoading,

    getScore,
    handleScoreChange,
    getStudentTotal,

    handleSave,
    saveMutation,
  };
};

export default useCAService;
