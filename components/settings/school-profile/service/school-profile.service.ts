import axiosClient from "@/lib/axios-client";
import { TENANT_SETTINGS_ENDPOINTS } from "@/lib/api-routes";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { SchoolProfile } from "../../types";

export const useUpdateSchoolProfile = () => {
  const queryClient = useQueryClient();
  const response = useMutation({
    mutationFn: async (data: SchoolProfile) =>
      await axiosClient.put(
        TENANT_SETTINGS_ENDPOINTS.UPDATE_SCHOOL_PROFILE,
        data,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant-settings"] });
      toast.success("School profile updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message);
    },
  });

  return { updateProfile: response.mutateAsync, ...response };
};
