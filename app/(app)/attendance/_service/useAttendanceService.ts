import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useMemo, useCallback } from "react";
import { format } from "date-fns";
import apiClient from "@/lib/api-client";
import { CLASS_ENDPOINTS, ATTENDANCE_ENDPOINTS } from "@/lib/api-routes";
import { queryKeys } from "@/app/constants/queryKeys";
import { toast } from "sonner";
import type { ApiError, ClassLevel } from "@/types";
import type { AxiosResponse } from "axios";

export type AttendanceStatus = "present" | "absent" | "late" | "excused";

export interface AttendanceEntry {
  studentId: string;
  status: AttendanceStatus;
  notes?: string;
}

interface RosterRow {
  studentId: string;
  firstName: string;
  lastName: string;
  admissionNumber: string;
  photo: string | null;
  recordId: string | null;
  status: AttendanceStatus | null;
  notes: string | null;
}

interface SaveAttendancePayload {
  records: {
    studentId: string;
    classId: string;
    date: string;
    status: AttendanceStatus;
    notes?: string;
  }[];
}

const useAttendanceService = () => {
  const queryClient = useQueryClient();

  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd"),
  );
  const [attendance, setAttendance] = useState<Record<string, AttendanceEntry>>(
    {},
  );
  const [isEditMode, setIsEditMode] = useState(false);

  const hasSelection = !!selectedClass && !!selectedDate;

  // ── Classes (for dropdown) ───────────────────────────────────────────

  const { data: classesResponse, isLoading: classesLoading } = useQuery<
    AxiosResponse<{ data: ClassLevel[] }>
  >({
    queryKey: [queryKeys.CLASS_ARMS],
    queryFn: () => apiClient.get(CLASS_ENDPOINTS.GET_ALL_CLASS_ARMS),
  });

  // ── Single query: students + attendance for class + date ─────────────

  const { data: rosterResponse, isLoading: rosterLoading } = useQuery<
    AxiosResponse<RosterRow[]>
  >({
    queryKey: [queryKeys.ATTENDANCE, "roster", selectedClass, selectedDate],
    queryFn: () =>
      apiClient.get(ATTENDANCE_ENDPOINTS.CLASS_ROSTER, {
        params: { classId: selectedClass, date: selectedDate },
      }),
    enabled: hasSelection,
  });

  // ── Derived data (memoized) ──────────────────────────────────────────

  const roster = useMemo(
    () => rosterResponse?.data?.data ?? [],
    [rosterResponse],
  );

  const students = useMemo(
    () =>
      roster.map((r) => ({
        id: r.studentId,
        firstName: r.firstName,
        lastName: r.lastName,
        admissionNumber: r.admissionNumber,
        photo: r.photo,
      })),
    [roster],
  );

  const hasExistingRecords = useMemo(
    () => roster.some((r) => r.recordId !== null),
    [roster],
  );

  // ── Pre-populate attendance from roster ──────────────────────────────

  useEffect(() => {
    if (roster.length === 0) return;

    const populated: Record<string, AttendanceEntry> = {};
    roster.forEach((row) => {
      populated[row.studentId] = {
        studentId: row.studentId,
        status: row.status ?? "present",
        notes: row.notes ?? undefined,
      };
    });
    setAttendance(populated);
    setIsEditMode(!hasExistingRecords);
  }, [roster, hasExistingRecords]);

  // ── Stats (memoized) ────────────────────────────────────────────────

  const stats = useMemo(() => {
    const values = Object.values(attendance);
    const counts = { present: 0, absent: 0, late: 0, excused: 0 };
    for (const entry of values) {
      counts[entry.status]++;
    }
    return { total: values.length, ...counts };
  }, [attendance]);

  // ── Save mutation ──────────────────────────────────────────────────

  const saveMutation = useMutation({
    mutationFn: (payload: SaveAttendancePayload) =>
      apiClient.post(ATTENDANCE_ENDPOINTS.SAVE, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.ATTENDANCE, "roster", selectedClass, selectedDate],
      });
      toast.success("Attendance saved successfully!");
      setIsEditMode(false);
    },
    onError: (err: ApiError) => {
      toast.error(err.message ?? "Failed to save attendance");
    },
  });

  // ── Handlers (stable references) ────────────────────────────────────

  const handleStatusChange = useCallback(
    (studentId: string, status: AttendanceStatus) => {
      setAttendance((prev) => ({
        ...prev,
        [studentId]: { ...prev[studentId], studentId, status },
      }));
    },
    [],
  );

  const markAll = useCallback(
    (status: AttendanceStatus) => {
      const updated: Record<string, AttendanceEntry> = {};
      students.forEach((student) => {
        updated[student.id] = { studentId: student.id, status };
      });
      setAttendance(updated);
    },
    [students],
  );

  const resetAttendance = useCallback(() => {
    const initial: Record<string, AttendanceEntry> = {};
    students.forEach((student) => {
      initial[student.id] = { studentId: student.id, status: "present" };
    });
    setAttendance(initial);
  }, [students]);

  const handleSave = useCallback(() => {
    const records = Object.values(attendance).map((entry) => ({
      studentId: entry.studentId,
      classId: selectedClass,
      date: selectedDate,
      status: entry.status,
      notes: entry.notes,
    }));
    saveMutation.mutate({ records });
  }, [attendance, selectedClass, selectedDate, saveMutation]);

  const handleClassChange = useCallback((classId: string) => {
    setSelectedClass(classId);
    setAttendance({});
    setIsEditMode(false);
  }, []);

  const handleDateChange = useCallback((date: string) => {
    setSelectedDate(date);
    setAttendance({});
    setIsEditMode(false);
  }, []);

  // ── Return ──────────────────────────────────────────────────────────

  const classOptions = classesResponse?.data?.data;

  return {
    selectedClass,
    selectedDate,
    handleClassChange,
    handleDateChange,
    hasSelection,

    classOptions,
    classesLoading,
    students,
    studentsLoading: rosterLoading,
    existingAttendanceLoading: rosterLoading,

    attendance,
    hasExistingRecords,
    isEditMode,
    setIsEditMode,
    stats,

    handleStatusChange,
    markAll,
    resetAttendance,
    handleSave,
    saveMutation,
  };
};

export default useAttendanceService;
