import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import apiClient from "@/lib/api-client";
import { NOTIFICATIONS_ENDPOINTS } from "@/lib/api-routes";
import { queryKeys } from "@/app/constants/queryKeys";
import { toast } from "sonner";
import type { Notification, ApiError } from "@/types";

/**
 * SSE must connect directly to the backend, bypassing Next.js rewrites
 * which do not support streaming responses.
 *
 * NEXT_PUBLIC_SSE_URL should point to the backend's base URL:
 *   - Dev: "http://localhost:4000/v1"
 *   - Prod (behind Nginx): "/api/v1" (Nginx handles SSE correctly with proxy_buffering off)
 */
const SSE_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function useNotificationsService() {
  const queryClient = useQueryClient();

  // Initial load + cache of existing notifications
  const { data: notificationsResponse, isLoading } = useQuery<
    AxiosResponse<{ data: Notification[] }>
  >({
    queryKey: [queryKeys.NOTIFICATIONS],
    queryFn: () => apiClient.get(NOTIFICATIONS_ENDPOINTS.GET_ALL),
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
  });

  const notifications = notificationsResponse?.data?.data ?? [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // SSE: listen for real-time notification events
  useEffect(() => {
    const sseUrl = `${SSE_BASE_URL}/notifications/stream`;
    const eventSource = new EventSource(sseUrl, { withCredentials: true });

    eventSource.addEventListener("notification", (event: MessageEvent) => {
      try {
        const newNotification: Notification = JSON.parse(event.data);

        queryClient.setQueryData<AxiosResponse<{ data: Notification[] }>>(
          [queryKeys.NOTIFICATIONS],
          (old) => {
            if (!old) return old;
            // Avoid duplicates
            const exists = old.data.data.some(
              (n) => n.id === newNotification.id,
            );
            if (exists) return old;

            return {
              ...old,
              data: {
                ...old.data,
                data: [newNotification, ...old.data.data],
              },
            };
          },
        );
      } catch (error) {
        console.error("Failed to parse notification event:", error);
        // Silently ignore parse errors
      }
    });

    // eventSource.onerror = () => {
    //   // EventSource auto-reconnects; optionally refetch on reconnect
    //   queryClient.invalidateQueries({ queryKey: [queryKeys.NOTIFICATIONS] });
    // };

    return () => {
      eventSource.close();
    };
  }, [queryClient]);

  const markReadMutation = useMutation({
    mutationFn: (notificationId: string) =>
      apiClient.patch(
        NOTIFICATIONS_ENDPOINTS.MARK_READ.replace(":id", notificationId),
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
