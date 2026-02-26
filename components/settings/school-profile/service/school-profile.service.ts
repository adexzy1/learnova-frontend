import axiosClient from "@/lib/axios-client";
import { TENANT_SETTINGS_ENDPOINTS } from "@/lib/api-routes";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { SchoolProfile } from "../../types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";

const schoolSettingsSchema = z.object({
  schoolName: z.string().min(2, "School name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(10, "Phone number is required"),
  address: z.string().min(10, "Address is required"),
  website: z.string().url().optional().or(z.literal("")),
  description: z.string().optional(),
});

export const useUpdateSchoolProfile = (data?: SchoolProfile) => {
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof schoolSettingsSchema>>({
    resolver: zodResolver(schoolSettingsSchema),
    defaultValues: {
      schoolName: data?.schoolName || "",
      email: data?.email || "",
      phone: data?.phone || "",
      address: data?.address || "",
      website: data?.website || "",
    },
  });

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
      if (error.response?.data?.errors) {
        Object.entries(error.response.data.errors).forEach(([key, value]) => {
          form.setError(key as keyof SchoolProfile, {
            message: value as string,
          });
        });
      }
      console.log(error);
      toast.error(error.response?.data?.message || error.message);
    },
  });

  async function onSubmit(values: z.infer<typeof schoolSettingsSchema>) {
    await response.mutateAsync(values);
  }

  return { updateProfile: onSubmit, ...response, form };
};
