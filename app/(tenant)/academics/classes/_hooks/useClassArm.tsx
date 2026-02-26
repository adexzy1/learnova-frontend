"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/app/constants/queryKeys";
import type { ClassArm, Session } from "@/types";
import { AxiosResponse } from "axios";
import { CLASS_ENDPOINTS, SESSION_ENDPOINTS } from "@/lib/api-routes";
import axiosClient from "@/lib/axios-client";
import { useForm } from "react-hook-form";
import { ClassArmFormData, classArmSchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";

export function useClassArm(classLevelId: string) {
  const queryClient = useQueryClient();
  const [deleteArmOpen, setDeleteArmOpen] = useState(false);
  const [selectedArm, setSelectedArm] = useState<ClassArm | null>(null);
  const [armDialogOpen, setArmDialogOpen] = useState(false);

  const deleteArmMutation = useMutation({
    mutationFn: async (armId: string) => {
      const res = await axiosClient.delete(
        CLASS_ENDPOINTS.DELETE_CLASS_ARM.replace(":id", armId),
      );
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.CLASSES] });
      toast.success("Success", {
        description: data.message,
      });
      setDeleteArmOpen(false);
      setSelectedArm(null);
    },
    onError: (error: any) => {
      toast.error("Error", {
        description:
          error.response?.data?.message || "Failed to delete class arm",
      });
    },
  });

  const handleDeleteArm = (arm: ClassArm) => {
    setSelectedArm(arm);
    setDeleteArmOpen(true);
  };

  const confirmDeleteArm = () => {
    if (selectedArm) {
      deleteArmMutation.mutate(selectedArm.id);
    }
  };

  // const session = useQuery<AxiosResponse<Pick<Session, "id" | "name">[]>>({
  //   queryKey: [queryKeys.SESSION],
  //   queryFn: async () =>
  //     await axiosClient.get(SESSION_ENDPOINTS.GET_SELECTABLE_SESSIONS),
  // });

  const form = useForm<ClassArmFormData>({
    resolver: zodResolver(classArmSchema),
    defaultValues: {
      classId: classLevelId,
      name: "",
    },
  });

  const createArmMutation = useMutation({
    mutationFn: async (data: ClassArmFormData) => {
      const res = await axiosClient.post(
        CLASS_ENDPOINTS.CREATE_CLASS_ARM,
        data,
      );
      return res.data;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.CLASSES] });
      toast.success("Class arm created!", {
        description: data.message,
      });
      setArmDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast.error("Error", {
        description: error.response?.data?.message || error.message,
      });
    },
  });

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset();
    }
    setArmDialogOpen(newOpen);
  };

  return {
    deleteArmOpen,
    setDeleteArmOpen,
    selectedArm,
    handleDeleteArm,
    confirmDeleteArm,
    isDeleting: deleteArmMutation.isPending,
    armDialogOpen,
    setArmDialogOpen,
    form,
    createArmMutation,
    handleOpenChange,
  };
}
