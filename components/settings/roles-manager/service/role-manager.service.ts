import axiosClient from "@/lib/axios-client";
import { ROLES_ENDPOINTS } from "@/lib/api-routes";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Role } from "../types";
import { toast } from "sonner";
import { UseFormSetError } from "react-hook-form";

export const useAllRoles = () => {
  const response = useQuery<Role[]>({
    queryKey: ["roles"],
    queryFn: async () => {
      const resp = await axiosClient.get(ROLES_ENDPOINTS.GET_ALL_ROLES);
      return resp.data;
    },
  });
  return {
    roles: response.data ?? [],
    isLoading: response.isLoading,
    isError: response.isError,
    error: response.error,
  };
};

export const getRoleById = async (id: string) => {
  const response = await axiosClient.get(
    ROLES_ENDPOINTS.GET_ROLE_BY_ID.replace(":id", id),
  );
  return response.data;
};

export const useCreateRole = (
  setError?: UseFormSetError<{
    name: string;
    description: string;
    permissions: string[];
  }>,
) => {
  const queryClient = useQueryClient();
  const response = useMutation<any, any, any>({
    mutationFn: async (data: any) =>
      await axiosClient.post(ROLES_ENDPOINTS.CREATE_ROLE, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast.success("Role created successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || error.message);
      if (setError && error.response?.data?.errors) {
        for (const [key, value] of Object.entries(error.response.data.errors)) {
          setError(
            key as keyof {
              name: string;
              description: string;
              permissions: string[];
            },
            {
              message: value as string,
            },
          );
        }
      }
    },
  });
  return { create: response.mutateAsync, ...response };
};

export const useUpdateRole = (id: string) => {
  const queryClient = useQueryClient();
  const response = useMutation({
    mutationFn: async (data: any) =>
      await axiosClient.put(
        ROLES_ENDPOINTS.UPDATE_ROLE.replace(":id", id),
        data,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast.success("Role updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message);
    },
  });
  return { updateRole: response.mutateAsync, ...response };
};

export const useDeleteRole = () => {
  const queryClient = useQueryClient();
  const response = useMutation({
    mutationFn: async (id: string) =>
      await axiosClient.delete(ROLES_ENDPOINTS.DELETE_ROLE.replace(":id", id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast.success("Role deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message);
    },
  });
  return { deleteRole: response.mutateAsync, ...response };
};
