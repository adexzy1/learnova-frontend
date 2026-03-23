"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { STAFF_ENDPOINTS } from "@/lib/api-routes";
import { queryKeys } from "@/app/constants/queryKeys";
import { StaffFormData, staffSchema } from "@/schemas";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/api-client";
import type { ApiError } from "@/types";

export const useNewStaffService = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const form = useForm<StaffFormData>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      roleId: "",
      createUserAccount: true,
      assignments: [],
    },
  });

  const mutation = useMutation({
    mutationFn: (data: StaffFormData) =>
      apiClient.post(STAFF_ENDPOINTS.CREATE_STAFF, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.STAFF] });
      toast.success("Staff member registered successfully");
      router.push("/staff");
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Failed to register staff member");
    },
  });

  return {
    form,
    mutation,
    isLoading: mutation.isPending,
  };
};
