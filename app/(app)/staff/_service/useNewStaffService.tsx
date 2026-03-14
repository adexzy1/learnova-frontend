"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { STAFF_ENDPOINTS } from "@/lib/api-routes";
import { queryKeys } from "@/app/constants/queryKeys";
import { StaffFormData, staffSchema } from "@/schemas";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import axiosClient from "@/lib/axios-client";

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
      role: "teacher",
      subjects: [],
      classes: [],
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: StaffFormData) => {
      const response = await axiosClient.post(
        STAFF_ENDPOINTS.CREATE_STAFF,
        data,
      );
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.STAFF] });
      toast.success("Success", {
        description:
          data.data.message || "Staff member registered successfully",
      });
      router.push("/staff");
    },
    onError: (error: any) => {
      if (error?.response?.data?.errors) {
        Object.entries(error?.response?.data?.errors).forEach(
          ([key, value]) => {
            form.setError(key as keyof StaffFormData, {
              message: value as string,
            });
          },
        );
        return;
      }
      toast.error("Error", {
        description:
          error?.response?.data?.message ||
          "Failed to register staff member",
      });
    },
  });

  return {
    form,
    mutation,
    isLoading: mutation.isPending,
  };
};
