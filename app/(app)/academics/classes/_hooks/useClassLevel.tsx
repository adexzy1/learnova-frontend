"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import axiosClient from "@/lib/axios-client";
import { CLASS_ENDPOINTS } from "@/lib/api-routes";
import { queryKeys } from "@/app/constants/queryKeys";
import type { ClassLevel } from "@/types";
import { useForm } from "react-hook-form";
import { ClassLevelFormData, classLevelSchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";

export function useClassLevel() {
  const queryClient = useQueryClient();
  const [deleteClassOpen, setDeleteClassOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassLevel | null>(null);
  const [classDialogOpen, setClassDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassLevel | null>(null);

  const form = useForm<ClassLevelFormData>({
    resolver: zodResolver(classLevelSchema),
    defaultValues: {
      name: "",
      level: "",
      description: "",
    },
  });

  const deleteClassMutation = useMutation({
    mutationFn: async (classId: string) => {
      const res = await axiosClient.delete(
        CLASS_ENDPOINTS.DELETE_CLASS.replace(":id", classId),
      );
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.CLASSES] });
      toast.success("Success", {
        description: data.message || "Class deleted successfully",
      });
      setDeleteClassOpen(false);
      setSelectedClass(null);
    },
    onError: (error: any) => {
      toast.error("Error", {
        description: error.response?.data?.message || "Failed to delete class",
      });
    },
  });

  const saveClassMutation = useMutation({
    mutationFn: async (data: ClassLevelFormData) => {
      if (editingClass) {
        const res = await axiosClient.put(
          CLASS_ENDPOINTS.UPDATE_CLASS.replace(":id", editingClass.id),
          data,
        );
        return res.data;
      } else {
        const res = await axiosClient.post(CLASS_ENDPOINTS.CREATE_CLASS, data);
        return res.data;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.CLASSES] });
      toast.success("Success", {
        description: data.message,
      });
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast.error("Error", {
        description: error.response?.data?.message || "Something went wrong",
      });
    },
  });

  const handleDeleteClass = (classLevel: ClassLevel) => {
    setSelectedClass(classLevel);
    setDeleteClassOpen(true);
  };

  const confirmDeleteClass = () => {
    if (selectedClass) {
      deleteClassMutation.mutate(selectedClass.id);
    }
  };

  const handleEditClass = (classLevel: ClassLevel) => {
    setEditingClass(classLevel);
    form.reset({
      name: classLevel.name,
      level: classLevel.level,
      description: classLevel.description || "",
    });
    setClassDialogOpen(true);
  };

  const handleCreateClass = () => {
    setEditingClass(null);
    form.reset({
      name: "",
      level: "",
      description: "",
    });
    setClassDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setClassDialogOpen(false);
    setEditingClass(null);
    form.reset();
  };

  return {
    // Delete state
    deleteClassOpen,
    setDeleteClassOpen,
    selectedClass,
    handleDeleteClass,
    confirmDeleteClass,
    isDeleting: deleteClassMutation.isPending,

    // Create/Edit state
    classDialogOpen,
    setClassDialogOpen: (open: boolean) =>
      open ? setClassDialogOpen(true) : handleCloseDialog(),
    editingClass,
    handleEditClass,
    handleCreateClass,
    saveClassMutation,
    form,
  };
}
