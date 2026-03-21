"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { ASSIGNMENTS_ENDPOINTS, STAFF_ENDPOINTS, SUBJECT_ENDPOINTS, CLASS_ENDPOINTS } from "@/lib/api-routes";
import { queryKeys } from "@/app/constants/queryKeys";
import { toast } from "sonner";
import type { ApiError, SubjectAssignment, Staff, Subject, ClassArm } from "@/types";
import type { AxiosResponse } from "axios";

export interface AssignmentPayload {
  teacherId: string;
  subjectId: string;
  classArmId: string;
}

const useAssignmentsService = () => {
  const queryClient = useQueryClient();

  const { data: assignmentsResponse, isLoading: assignmentsLoading, error } = useQuery<
    AxiosResponse<SubjectAssignment[]>
  >({
    queryKey: [queryKeys.ASSIGNMENTS],
    queryFn: () => apiClient.get(ASSIGNMENTS_ENDPOINTS.GET_ALL),
  });

  const { data: teachersResponse, isLoading: teachersLoading } = useQuery<
    AxiosResponse<Staff[]>
  >({
    queryKey: [queryKeys.STAFF],
    queryFn: () => apiClient.get(STAFF_ENDPOINTS.GET_ALL_STAFF),
  });

  const { data: subjectsResponse, isLoading: subjectsLoading } = useQuery<
    AxiosResponse<Subject[]>
  >({
    queryKey: [queryKeys.SUBJECTS],
    queryFn: () => apiClient.get(SUBJECT_ENDPOINTS.GET_ALL_SUBJECTS),
  });

  const { data: classArmsResponse, isLoading: classArmsLoading } = useQuery<
    AxiosResponse<ClassArm[]>
  >({
    queryKey: [queryKeys.CLASSES],
    queryFn: () => apiClient.get(CLASS_ENDPOINTS.GET_ALL_CLASS_ARMS),
  });

  const createMutation = useMutation({
    mutationFn: (payload: AssignmentPayload) =>
      apiClient.post(ASSIGNMENTS_ENDPOINTS.CREATE, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.ASSIGNMENTS] });
      toast.success("Subject assigned successfully");
    },
    onError: (err: ApiError) => {
      toast.error(err.message ?? "Failed to assign subject");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiClient.delete(ASSIGNMENTS_ENDPOINTS.DELETE.replace(":id", id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.ASSIGNMENTS] });
      toast.success("Assignment removed successfully");
    },
    onError: (err: ApiError) => {
      toast.error(err.message ?? "Failed to remove assignment");
    },
  });

  return {
    assignments: assignmentsResponse?.data ?? [],
    teachers: teachersResponse?.data ?? [],
    subjects: subjectsResponse?.data ?? [],
    classArms: classArmsResponse?.data ?? [],
    isLoading: assignmentsLoading || teachersLoading || subjectsLoading || classArmsLoading,
    error,
    createMutation,
    deleteMutation,
  };
};

export default useAssignmentsService;
