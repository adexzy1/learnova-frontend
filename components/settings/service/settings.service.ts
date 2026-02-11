import axiosClient from "@/lib/axios-client";
import { TENANT_SETTINGS_ENDPOINTS } from "@/lib/api-routes";
import { useQuery } from "@tanstack/react-query";
import { TenantSettings } from "../types";
import { queryKeys } from "@/app/constants/queryKeys";

export const useTenantSettings = () => {
  const response = useQuery<TenantSettings>({
    queryKey: [queryKeys.TENANT_SETTINGS],
    queryFn: async () => {
      const resp = await axiosClient.get(
        TENANT_SETTINGS_ENDPOINTS.GET_TENANT_SETTINGS,
      );
      return resp.data;
    },
  });

  return {
    settings: response.data,
    isLoading: response.isLoading,
    isError: response.isError,
    error: response.error,
  };
};
