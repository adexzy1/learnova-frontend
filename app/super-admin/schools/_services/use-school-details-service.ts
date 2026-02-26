"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { Tenant } from "@/types";
import { queryKeys } from "@/app/constants/queryKeys";
import { TENANT_ENDPOINTS } from "@/lib/api-routes";
import axiosClient from "@/lib/axios-client";

export function useSchoolDetailsService() {
  const params = useParams();
  const schoolId = params.schoolId as string;

  const { data: school, isLoading } = useQuery<Tenant>({
    queryKey: [queryKeys.TENANTS, schoolId],
    queryFn: async () => {
      const res = await axiosClient.get(
        TENANT_ENDPOINTS.GET_TENANT_BY_ID.replace(":id", schoolId),
      );
      return res.data;
    },
  });

  return {
    school,
    isLoading,
    schoolId,
  };
}
