"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { STAFF_ENDPOINTS } from "@/lib/api-routes";
import { queryKeys } from "@/app/constants/queryKeys";
import { StaffFormData, staffSchema } from "@/schemas";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";
import apiClient from "@/lib/api-client";
import type { AxiosResponse } from "axios";
import type { ApiError, Staff } from "@/types";
import { useEffect } from "react";

export const useEditStaffService = (staffId?: string) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const params = useParams();
  const id = staffId || (params.id as string);

  const { data: staffResponse, isLoading: isLoadingDetails } = useQuery<
    AxiosResponse<{ data: Staff }>
  >({
    queryKey: [queryKeys.STAFF, id],
    queryFn: () =>
      apiClient.get(STAFF_ENDPOINTS.GET_STAFF_BY_ID.replace(":id", id)),
    enabled: !!id,
  });

  const staffDetails = staffResponse?.data?.data ?? null;

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

  // Sync form with fetched data
  useEffect(() => {
    if (staffDetails) {
      form.reset({
        firstName: staffDetails.firstName,
        lastName: staffDetails.lastName,
        email: staffDetails.email,
        phone: staffDetails.phone ?? "",
        roleId: staffDetails.roles?.[0]?.role?.id ?? "",
      });
    }
  }, [staffDetails, form]);

  const mutation = useMutation({
    mutationFn: (data: StaffFormData) =>
      apiClient.patch(
        STAFF_ENDPOINTS.UPDATE_STAFF.replace(":id", id),
        data,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.STAFF] });
      queryClient.invalidateQueries({ queryKey: [queryKeys.STAFF, id] });
      toast.success("Staff profile updated successfully");
      router.push(`/staff/${id}`);
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Failed to update profile");
    },
  });

  return {
    staffDetails,
    isLoadingDetails,
    form,
    mutation,
    isLoading: mutation.isPending,
  };
};
