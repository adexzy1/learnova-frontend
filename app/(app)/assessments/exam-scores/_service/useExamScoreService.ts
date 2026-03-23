import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback } from "react";
import apiClient from "@/lib/api-client";
import {
  CLASS_ENDPOINTS,
  SUBJECT_ENDPOINTS,
  TERM_ENDPOINTS,
  ASSESSMENT_ENDPOINTS,
} from "@/lib/api-routes";
import { queryKeys } from "@/app/constants/queryKeys";
import { toast } from "sonner";
import type { ApiError, ClassLevel, Subject, Term } from "@/types";
import type { AxiosResponse } from "axios";

interface StudentWithExamScore {
  id: string;
  admissionNumber: string;
  firstName: string;
  lastName: string;
  score: number | null;
  maxScore: number;
}

interface ExamScoresResponse {
  students: StudentWithExamScore[];
}

interface SaveExamScoresPayload {
  classId: string;
  subjectId: string;
  termId: string;
  scores: {
    studentId: string;
    subjectId: string;
    termId: string;
    score: number;
  }[];
}

const DEFAULT_MAX_SCORE = 60;

const useExamScoreService = () => {
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

  // ── Exam scores fetch ──────────────────────────────────────────────

  const { data: examRes, isLoading: examLoading } = useQuery<
    AxiosResponse<{ data: ExamScoresResponse }>
  >({
    queryKey: [
      queryKeys.ASSESSMENTS_EXAM,
      selectedClass,
      selectedSubject,
      selectedTerm,
    ],
    queryFn: () =>
      apiClient.get(ASSESSMENT_ENDPOINTS.EXAM_SCORES_GET, {
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
    mutationFn: (payload: SaveExamScoresPayload) =>
      apiClient.post(ASSESSMENT_ENDPOINTS.EXAM_SCORES_SAVE, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.ASSESSMENTS_EXAM],
      });
      setEdits({});
      toast.success("Exam scores saved successfully!");
    },
    onError: (err: ApiError) => {
      toast.error(err.message ?? "Failed to save exam scores");
    },
  });

  // ── Derived data ───────────────────────────────────────────────────

  const classOptions = classesRes?.data?.data ?? [];
  const subjects = subjectsRes?.data?.data ?? [];
  const terms = termsRes?.data?.data ?? [];
  const students = examRes?.data?.data?.students ?? [];

  // ── Score helpers ──────────────────────────────────────────────────

  const getScore = useCallback(
    (studentId: string): number | "" => {
      if (studentId in edits) return edits[studentId];
      const server = students.find((s) => s.id === studentId)?.score;
      return server ?? "";
    },
    [edits, students],
  );

  const getMaxScore = useCallback(
    (studentId: string): number => {
      return (
        students.find((s) => s.id === studentId)?.maxScore ?? DEFAULT_MAX_SCORE
      );
    },
    [students],
  );

  const handleScoreChange = useCallback(
    (studentId: string, value: string, maxScore: number) => {
      const numValue =
        value === ""
          ? ""
          : Math.min(Math.max(0, parseInt(value) || 0), maxScore);
      setEdits((prev) => ({ ...prev, [studentId]: numValue }));
    },
    [],
  );

  const handleSave = useCallback(() => {
    const scoresArray: SaveExamScoresPayload["scores"] = [];

    for (const student of students) {
      const val = getScore(student.id);
      if (typeof val === "number") {
        scoresArray.push({
          studentId: student.id,
          subjectId: selectedSubject,
          termId: selectedTerm,
          score: val,
        });
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

    classOptions,
    subjects,
    terms,

    students,
    examLoading,

    getScore,
    getMaxScore,
    handleScoreChange,

    handleSave,
    saveMutation,
  };
};

export default useExamScoreService;
