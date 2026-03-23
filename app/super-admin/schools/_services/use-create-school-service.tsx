import { queryKeys } from "@/app/constants/queryKeys";
import { Plan, Tenant } from "@/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import z from "zod";
import { PLAN_ENDPOINTS, TENANT_ENDPOINTS } from "@/lib/api-routes";
import axiosClient from "@/lib/axios-client";
import { AxiosResponse } from "axios";

const tenantSchema = z.object({
  name: z.string().min(2, "School name is required"),
  domainName: z.string(),
  planId: z.string(),
  accountName: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  bankCode: z.string(),
  accountNumber: z.string(),
  email: z.string(),
  phone: z.string(),
});

type TenantFormData = z.infer<typeof tenantSchema>;

interface Args {
  onOpenChange: (open: boolean) => void;
  initialData?: Tenant | null;
}

export const UseCreateSchoolService = ({ onOpenChange, initialData }: Args) => {
  const queryClient = useQueryClient();

  const form = useForm<TenantFormData>({
    resolver: zodResolver(tenantSchema),
    defaultValues: {
      name: "",
      domainName: "",
      planId: "",
      accountName: "",
      firstName: "",
      lastName: "",
      bankCode: "",
      accountNumber: "",
      email: "",
      phone: "",
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        domainName: initialData.domainName,
        planId: initialData.planId,
        accountName: initialData.accountName,
        firstName: initialData.firstName,
        lastName: initialData.lastName,
        bankCode: initialData.bankCode,
        accountNumber: initialData.accountNumber,
        email: initialData.email,
        phone: initialData.phone,
      });
    } else {
      form.reset({
        name: "",
        domainName: "",
        planId: "",
        accountName: "",
        firstName: "",
        lastName: "",
        bankCode: "",
        accountNumber: "",
        email: "",
        phone: "",
      });
    }
  }, [initialData, form]);

  const { data: plans } = useQuery<AxiosResponse<Plan[]>>({
    queryKey: [queryKeys.PLANS],
    queryFn: () => axiosClient.get(PLAN_ENDPOINTS.GET_ALL_PLANS),
  });

  const mutation = useMutation({
    mutationFn: async (data: TenantFormData) => {
      if (initialData) {
        const res = await axiosClient.patch(
          TENANT_ENDPOINTS.UPDATE_TENANT.replace(":id", initialData.id),
          data,
        );
        return res;
      } else {
        const res = await axiosClient.post(
          TENANT_ENDPOINTS.CREATE_TENANT,
          data,
        );
        return res;
      }
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.TENANTS] });
      toast.success("success", { description: res.data.message });
      onOpenChange(false);
      form.reset();
    },
    onError: (error: any) => {
      toast.error("error", { description: error.response?.data?.message });
    },
  });

  const onSubmit = (data: TenantFormData) => {
    mutation.mutate(data);
  };
  return {
    form,
    onSubmit,
    mutation,
    plans: plans?.data ?? [],
  };
};
