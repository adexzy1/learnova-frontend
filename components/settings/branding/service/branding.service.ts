import axiosClient from "@/lib/axios-client";
import { TENANT_SETTINGS_ENDPOINTS } from "@/lib/api-routes";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { BrandingSettings } from "../../types";
import { queryKeys } from "@/app/constants/queryKeys";

export const useUpdateBranding = () => {
  const queryClient = useQueryClient();
  const response = useMutation({
    mutationFn: async (data: BrandingSettings | FormData) => {
      const isFormData = data instanceof FormData;
      return await axiosClient.put(
        TENANT_SETTINGS_ENDPOINTS.UPDATE_BRANDING,
        data,
        isFormData
          ? {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          : undefined,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.TENANT_SETTINGS] });
      toast.success("Branding updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message);
    },
  });

  return { updateBranding: response.mutateAsync, ...response };
};
