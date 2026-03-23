import { queryKeys } from "@/app/constants/queryKeys";
import { useQuery } from "@tanstack/react-query";
import axiosClient from "@/lib/axios-client";
import { ROLES_ENDPOINTS } from "@/lib/api-routes";
import { AxiosResponse } from "axios";
import { Role } from "@/components/settings/roles-manager/types";

export const useSelectableRoles = () => {
  const { data: roles } = useQuery<
    AxiosResponse<{ data: Pick<Role, "id" | "name">[] }>
  >({
    queryKey: [queryKeys.ROLES],
    queryFn: async () => axiosClient.get(ROLES_ENDPOINTS.GET_SELECTABLE_ROLES),
  });

  return roles?.data.data || [];
};
