import axiosClient from "@/lib/axios-client";
import { TENANT_SETTINGS_ENDPOINTS } from "@/lib/api-routes";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { NotificationPreferences } from "../../types";
import { queryKeys } from "@/app/constants/queryKeys";

export const useUpdateNotificationPreferences = () => {
  const queryClient = useQueryClient();
  const response = useMutation({
    mutationFn: async (data: NotificationPreferences) =>
      await axiosClient.put(
        TENANT_SETTINGS_ENDPOINTS.UPDATE_NOTIFICATION_PREFERENCES,
        data,
      ),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.TENANT_SETTINGS] });
      toast.success(res.data.message);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message);
    },
  });

  return { updateNotifications: response.mutateAsync, ...response };
};
