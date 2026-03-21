import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import apiClient from "@/lib/api-client";
import { NOTIFICATIONS_ENDPOINTS } from "@/lib/api-routes";
import { queryKeys } from "@/app/constants/queryKeys";
import { toast } from "sonner";
import type { Notification, ApiError } from "@/types";

export default function useNotificationsService() {
  const queryClient = useQueryClient();

  const { data: notificationsResponse, isLoading } = useQuery<
    AxiosResponse<Notification[]>
  >({
    queryKey: [queryKeys.NOTIFICATIONS],
    queryFn: () => apiClient.get(NOTIFICATIONS_ENDPOINTS.GET_ALL),
  });

  const notifications = notificationsResponse?.data ?? [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markReadMutation = useMutation({
    mutationFn: (notificationId: string) =>
      apiClient.patch(
        NOTIFICATIONS_ENDPOINTS.MARK_READ.replace(":id", notificationId)
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.NOTIFICATIONS] });
    },
    onError: (err: ApiError) => toast.error(err.message),
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => apiClient.patch(NOTIFICATIONS_ENDPOINTS.MARK_ALL_READ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.NOTIFICATIONS] });
      toast.success("All notifications marked as read.");
    },
    onError: (err: ApiError) => toast.error(err.message),
  });

  return {
    notifications,
    isLoading,
    unreadCount,
    markReadMutation,
    markAllReadMutation,
  };
}
