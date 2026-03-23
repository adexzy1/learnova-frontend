import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import apiClient from "@/lib/api-client";
import { COMMUNICATIONS_ENDPOINTS } from "@/lib/api-routes";
import { queryKeys } from "@/app/constants/queryKeys";
import { toast } from "sonner";
import type { Message, PaginatedResponse, ApiError } from "@/types";

export default function useMessagesService() {
  const queryClient = useQueryClient();

  const { data: messagesResponse, isLoading } = useQuery<
    AxiosResponse<PaginatedResponse<Message>>
  >({
    queryKey: [queryKeys.MESSAGES],
    queryFn: () => apiClient.get(COMMUNICATIONS_ENDPOINTS.MESSAGES_GET),
  });

  const messages = messagesResponse?.data?.data ?? [];

  const sendMutation = useMutation({
    mutationFn: (payload: { to: string; subject: string; content: string }) =>
      apiClient.post(COMMUNICATIONS_ENDPOINTS.MESSAGES_CREATE, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.MESSAGES] });
      toast.success("Message sent.");
    },
    onError: (err: ApiError) => toast.error(err.message),
  });

  const replyMutation = useMutation({
    mutationFn: ({ messageId, content }: { messageId: string; content: string }) =>
      apiClient.post(
        COMMUNICATIONS_ENDPOINTS.MESSAGES_REPLY.replace(":id", messageId),
        { content }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.MESSAGES] });
      toast.success("Reply sent.");
    },
    onError: (err: ApiError) => toast.error(err.message),
  });

  const markReadMutation = useMutation({
    mutationFn: (messageId: string) =>
      apiClient.patch(
        COMMUNICATIONS_ENDPOINTS.MESSAGES_MARK_READ.replace(":id", messageId)
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.MESSAGES] });
    },
  });

  return {
    messages,
    isLoading,
    sendMutation,
    replyMutation,
    markReadMutation,
  };
}
