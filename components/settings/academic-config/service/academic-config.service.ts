import axiosClient from "@/lib/axios-client";
import {
  SESSION_ENDPOINTS,
  TENANT_SETTINGS_ENDPOINTS,
  TERM_ENDPOINTS,
} from "@/lib/api-routes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AcademicConfig } from "../../types";
import { queryKeys } from "@/app/constants/queryKeys";
import { AxiosResponse } from "axios";
import { Session, Term } from "@/types";

export const useUpdateAcademicConfig = () => {
  const queryClient = useQueryClient();

  const session = useQuery<AxiosResponse<Pick<Session, "id" | "name">[]>>({
    queryKey: [queryKeys.SESSION],
    queryFn: async () =>
      await axiosClient.get(SESSION_ENDPOINTS.GET_SELECTABLE_SESSIONS),
  });

  const term = useQuery<AxiosResponse<Pick<Term, "id" | "name">[]>>({
    queryKey: [queryKeys.TERM],
    queryFn: async () =>
      await axiosClient.get(TERM_ENDPOINTS.GET_SELECTABLE_TERMS),
  });

  const response = useMutation({
    mutationFn: async (data: AcademicConfig) =>
      await axiosClient.put(
        TENANT_SETTINGS_ENDPOINTS.UPDATE_ACADEMIC_CONFIGURATION,
        data,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant-settings"] });
      toast.success("Success", {
        description: "Academic configuration updated successfully",
      });
    },
    onError: (error: any) => {
      toast.error("Error", {
        description: error.response?.data?.message || error.message,
      });
    },
  });

  return {
    updateConfig: response.mutateAsync,
    ...response,
    sessions: session.data?.data || [],
    terms: term.data?.data || [],
  };
};
