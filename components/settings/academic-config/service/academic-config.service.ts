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
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const academicConfigSchema = z.object({
  currentSessionId: z.string().min(1, "Session is required"),
  currentTermId: z.string().min(1, "Term is required"),
  autoPromoteStudents: z.boolean(),
  lockPastResults: z.boolean(),
});

export const useUpdateAcademicConfig = (data?: AcademicConfig) => {
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof academicConfigSchema>>({
    defaultValues: {
      currentSessionId: data?.currentSessionId || "",
      currentTermId: data?.currentTermId || "",
      autoPromoteStudents: data?.autoPromoteStudents ?? false,
      lockPastResults: data?.lockPastResults ?? true,
    },
    resolver: zodResolver(academicConfigSchema),
  });

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
      if (error.response?.data?.errors) {
        Object.entries(error.response.data.errors).forEach(([key, value]) => {
          form.setError(key as keyof AcademicConfig, {
            message: value as string,
          });
        });
      }
      toast.error("Error", {
        description: error.response?.data?.message || error.message,
      });
    },
  });

  const handleSave = async (values: z.infer<typeof academicConfigSchema>) => {
    await response.mutateAsync(values);
  };

  return {
    updateConfig: handleSave,
    ...response,
    sessions: session.data?.data || [],
    terms: term.data?.data || [],
    form,
  };
};
