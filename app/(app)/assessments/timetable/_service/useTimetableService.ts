import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import apiClient from "@/lib/api-client";
import { ASSESSMENT_ENDPOINTS } from "@/lib/api-routes";
import { queryKeys } from "@/app/constants/queryKeys";
import { toast } from "sonner";
import type { ApiError } from "@/types";
import type { AxiosResponse } from "axios";

export interface TimetableEntry {
  id: string;
  day: string;
  periodId: number;
  subject: string;
  teacher: string;
  room: string;
  classId?: string;
}

export interface TimetableEntryFormData {
  day: string;
  periodId: number;
  subject: string;
  teacher: string;
  room: string;
  classId?: string;
}

const useTimetableService = () => {
  const queryClient = useQueryClient();
  const [selectedClass, setSelectedClass] = useState("jss1a");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimetableEntry | null>(null);

  const { data: timetableResponse, isLoading } = useQuery<
    AxiosResponse<{ data: TimetableEntry[] }>
  >({
    queryKey: [queryKeys.TIMETABLE, selectedClass],
    queryFn: () =>
      apiClient.get(ASSESSMENT_ENDPOINTS.TIMETABLE_GET, {
        params: { classId: selectedClass },
      }),
  });

  const createMutation = useMutation({
    mutationFn: (payload: TimetableEntryFormData) =>
      apiClient.post(ASSESSMENT_ENDPOINTS.TIMETABLE_CREATE, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.TIMETABLE] });
      toast.success("Timetable entry added!");
      setDialogOpen(false);
      setEditingEntry(null);
    },
    onError: (err: ApiError) => {
      toast.error(err.message ?? "Failed to add timetable entry");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: TimetableEntryFormData }) =>
      apiClient.patch(
        ASSESSMENT_ENDPOINTS.TIMETABLE_UPDATE.replace(":id", id),
        payload,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.TIMETABLE] });
      toast.success("Timetable entry updated!");
      setDialogOpen(false);
      setEditingEntry(null);
    },
    onError: (err: ApiError) => {
      toast.error(err.message ?? "Failed to update timetable entry");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiClient.delete(ASSESSMENT_ENDPOINTS.TIMETABLE_DELETE.replace(":id", id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.TIMETABLE] });
      toast.success("Timetable entry deleted!");
    },
    onError: (err: ApiError) => {
      toast.error(err.message ?? "Failed to delete timetable entry");
    },
  });

  const handleEdit = (entry: TimetableEntry) => {
    setEditingEntry(entry);
    setDialogOpen(true);
  };

  const timetableEntries = timetableResponse?.data?.data ?? [];

  // Transform flat array into the nested day→periodId map the grid expects
  const timetableMap = timetableEntries.reduce<
    Record<string, Record<number, TimetableEntry>>
  >((acc, entry) => {
    if (!acc[entry.day]) acc[entry.day] = {};
    acc[entry.day][entry.periodId] = entry;
    return acc;
  }, {});

  return {
    selectedClass,
    setSelectedClass,
    timetableEntries,
    timetableMap,
    isLoading,
    dialogOpen,
    setDialogOpen,
    editingEntry,
    setEditingEntry,
    handleEdit,
    createMutation,
    updateMutation,
    deleteMutation,
  };
};

export default useTimetableService;
