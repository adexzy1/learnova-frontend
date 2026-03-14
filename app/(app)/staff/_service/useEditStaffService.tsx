"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { STAFF_ENDPOINTS } from "@/lib/api-routes";
import { queryKeys } from "@/app/constants/queryKeys";
import { StaffFormData, staffSchema } from "@/schemas";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";
import axiosClient from "@/lib/axios-client";
import { AxiosResponse } from "axios";
import { Staff } from "@/types";
import { useEffect } from "react";

export const useEditStaffService = (staffId?: string) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const params = useParams();
  const id = staffId || (params.id as string);

  const { data: staffDetails, isLoading: isLoadingDetails } = useQuery<
    AxiosResponse<Staff>
  >({
    queryKey: [queryKeys.STAFF, id],
    queryFn: async () =>
      axiosClient.get(STAFF_ENDPOINTS.GET_STAFF_BY_ID.replace(":id", id)),
    enabled: !!id,
  });

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

  // Sync form with fetched data
  useEffect(() => {
    if (staffDetails?.data) {
      const staff = staffDetails.data;
      form.reset({
        firstName: staff.firstName,
        lastName: staff.lastName,
        email: staff.email,
        phone: staff.phone,
        role: staff.role as "school-admin" | "teacher" | "finance-officer",
        subjects: staff.subjects || [],
        classes: staff.classes || [],
      });
    }
  }, [staffDetails, form]);

  const mutation = useMutation({
    mutationFn: async (data: StaffFormData) => {
      const response = await axiosClient.patch(
        STAFF_ENDPOINTS.UPDATE_STAFF.replace(":id", id),
        data,
      );
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.STAFF] });
      queryClient.invalidateQueries({ queryKey: [queryKeys.STAFF, id] });
      toast.success("Success", {
        description:
          data.message || "Staff profile updated successfully",
      });
      router.push(`/staff/${id}`);
    },
    onError: (error: any) => {
      toast.error("Error", {
        description:
          error?.response?.data?.message || "Failed to update profile",
      });
    },
  });

  return {
    staffDetails: staffDetails?.data,
    isLoadingDetails,
    form,
    mutation,
    isLoading: mutation.isPending,
  };
};
