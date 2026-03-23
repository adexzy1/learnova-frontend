import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo, useCallback } from "react";
import apiClient from "@/lib/api-client";
import {
  TIMETABLE_ENDPOINTS,
  CLASS_ENDPOINTS,
  SESSION_ENDPOINTS,
  TERM_ENDPOINTS,
} from "@/lib/api-routes";
import { queryKeys } from "@/app/constants/queryKeys";
import { toast } from "sonner";
import type { ApiError, ClassArm, Session, Term } from "@/types";
import type { AxiosResponse } from "axios";

export interface TimetableEntry {
  id: string;
  day: string;
  periodId: number;
  subject: string;
  teacher: string;
  room: string | null;
  classId: string;
  startTime: string;
  endTime: string;
}

export interface SubjectTeacherOption {
  id: string;
  subjectId: string;
  subjectName: string;
  staffId: string;
  teacherName: string;
}

export interface TimetableEntryFormData {
  dayOfWeek: string;
  periodId: number;
  subjectTeacherId: string;
  room?: string;
  startTime: string;
  endTime: string;
  sessionId: string;
  termId: string;
}

/** Prefill data when clicking an empty cell */
export interface CellPrefill {
  dayOfWeek: string;
  periodId: number;
}

const useTimetableService = () => {
  const queryClient = useQueryClient();
  const [selectedSession, setSelectedSession] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimetableEntry | null>(null);
  const [cellPrefill, setCellPrefill] = useState<CellPrefill | null>(null);
  const [copyDialogOpen, setCopyDialogOpen] = useState(false);

  // ── Sessions ────────────────────────────────────────────────────────
  const { data: sessionsResponse, isLoading: sessionsLoading } = useQuery<
    AxiosResponse<{ data: Session[] }>
  >({
    queryKey: [queryKeys.SELECTABLE_SESSION],
    queryFn: () => apiClient.get(SESSION_ENDPOINTS.GET_SELECTABLE_SESSIONS),
  });

  const sessions = useMemo(
    () => sessionsResponse?.data?.data ?? [],
    [sessionsResponse],
  );

  // ── Terms (filtered by selected session) ────────────────────────────
  const { data: termsResponse, isLoading: termsLoading } = useQuery<
    AxiosResponse<{ data: Term[] }>
  >({
    queryKey: [queryKeys.SELECTABLE_TERM, selectedSession],
    queryFn: () =>
      apiClient.get(TERM_ENDPOINTS.GET_SELECTABLE_TERMS, {
        params: { sessionId: selectedSession },
      }),
    enabled: !!selectedSession,
  });

  const terms = useMemo(
    () => termsResponse?.data?.data ?? [],
    [termsResponse],
  );

  // ── Class arms (for dropdown) ──────────────────────────────────────
  const { data: classesResponse, isLoading: classesLoading } = useQuery<
    AxiosResponse<{ data: ClassArm[] }>
  >({
    queryKey: [queryKeys.CLASS_ARMS],
    queryFn: () => apiClient.get(CLASS_ENDPOINTS.GET_ALL_CLASS_ARMS),
  });

  const classOptions = useMemo(
    () => classesResponse?.data?.data ?? [],
    [classesResponse],
  );

  // ── Subject-teacher assignments (for the form dropdown) ────────────
  const { data: subjectTeachersResponse } = useQuery<
    AxiosResponse<{ data: SubjectTeacherOption[] }>
  >({
    queryKey: [queryKeys.SUBJECT_TEACHERS, selectedClass],
    queryFn: () =>
      apiClient.get(TIMETABLE_ENDPOINTS.SUBJECT_TEACHERS, {
        params: { classId: selectedClass },
      }),
    enabled: !!selectedClass,
  });

  const subjectTeachers = useMemo(
    () => subjectTeachersResponse?.data?.data ?? [],
    [subjectTeachersResponse],
  );

  // ── Timetable data ────────────────────────────────────────────────
  const { data: timetableResponse, isLoading: timetableLoading } = useQuery<
    AxiosResponse<{ data: TimetableEntry[] }>
  >({
    queryKey: [queryKeys.TIMETABLE, selectedClass, selectedTerm],
    queryFn: () =>
      apiClient.get(TIMETABLE_ENDPOINTS.GET, {
        params: { classId: selectedClass, termId: selectedTerm },
      }),
    enabled: !!selectedClass && !!selectedTerm,
  });

  const timetableEntries = useMemo(
    () => timetableResponse?.data?.data ?? [],
    [timetableResponse],
  );

  // Transform flat array into nested day→periodId map for the grid
  const timetableMap = useMemo(
    () =>
      timetableEntries.reduce<Record<string, Record<number, TimetableEntry>>>(
        (acc, entry) => {
          if (!acc[entry.day]) acc[entry.day] = {};
          acc[entry.day][entry.periodId] = entry;
          return acc;
        },
        {},
      ),
    [timetableEntries],
  );

  // ── Mutations ─────────────────────────────────────────────────────
  const invalidateTimetable = () =>
    queryClient.invalidateQueries({
      queryKey: [queryKeys.TIMETABLE, selectedClass, selectedTerm],
    });

  const createMutation = useMutation({
    mutationFn: (payload: TimetableEntryFormData) =>
      apiClient.post(TIMETABLE_ENDPOINTS.CREATE, payload),
    onSuccess: () => {
      invalidateTimetable();
      toast.success("Timetable entry added!");
      setDialogOpen(false);
      setEditingEntry(null);
      setCellPrefill(null);
    },
    onError: (err: ApiError) => {
      toast.error(err.message ?? "Failed to add timetable entry");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: TimetableEntryFormData;
    }) =>
      apiClient.patch(TIMETABLE_ENDPOINTS.UPDATE.replace(":id", id), payload),
    onSuccess: () => {
      invalidateTimetable();
      toast.success("Timetable entry updated!");
      setDialogOpen(false);
      setEditingEntry(null);
      setCellPrefill(null);
    },
    onError: (err: ApiError) => {
      toast.error(err.message ?? "Failed to update timetable entry");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiClient.delete(TIMETABLE_ENDPOINTS.DELETE.replace(":id", id)),
    onSuccess: () => {
      invalidateTimetable();
      toast.success("Timetable entry deleted!");
      setDialogOpen(false);
      setEditingEntry(null);
      setCellPrefill(null);
    },
    onError: (err: ApiError) => {
      toast.error(err.message ?? "Failed to delete timetable entry");
    },
  });

  const copyMutation = useMutation({
    mutationFn: (payload: {
      sourceTermId: string;
      targetTermId: string;
      targetSessionId: string;
      classId: string;
    }) => apiClient.post(TIMETABLE_ENDPOINTS.COPY, payload),
    onSuccess: () => {
      invalidateTimetable();
      toast.success("Timetable copied successfully!");
      setCopyDialogOpen(false);
    },
    onError: (err: ApiError) => {
      toast.error(err.message ?? "Failed to copy timetable");
    },
  });

  // ── Handlers ──────────────────────────────────────────────────────
  const handleEdit = useCallback((entry: TimetableEntry) => {
    setEditingEntry(entry);
    setCellPrefill(null);
    setDialogOpen(true);
  }, []);

  const handleCellClick = useCallback((prefill: CellPrefill) => {
    setEditingEntry(null);
    setCellPrefill(prefill);
    setDialogOpen(true);
  }, []);

  const handleSessionChange = useCallback((sessionId: string) => {
    setSelectedSession(sessionId);
    setSelectedTerm("");
  }, []);

  const handleTermChange = useCallback((termId: string) => {
    setSelectedTerm(termId);
  }, []);

  const handleClassChange = useCallback((classId: string) => {
    setSelectedClass(classId);
  }, []);

  const handleDialogClose = useCallback(() => {
    setDialogOpen(false);
    setEditingEntry(null);
    setCellPrefill(null);
  }, []);

  return {
    selectedSession,
    handleSessionChange,
    sessions,
    sessionsLoading,

    selectedTerm,
    handleTermChange,
    terms,
    termsLoading,

    selectedClass,
    handleClassChange,
    classOptions,
    classesLoading,

    subjectTeachers,

    timetableEntries,
    timetableMap,
    isLoading: timetableLoading,

    dialogOpen,
    setDialogOpen,
    editingEntry,
    cellPrefill,
    handleEdit,
    handleCellClick,
    handleDialogClose,
    createMutation,
    updateMutation,
    deleteMutation,

    copyDialogOpen,
    setCopyDialogOpen,
    copyMutation,
  };
};

export default useTimetableService;
