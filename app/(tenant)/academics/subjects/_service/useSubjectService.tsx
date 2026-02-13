import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { PaginatedResponse, Subject } from "@/types";
import axiosClient from "@/lib/axios-client";
import { SUBJECT_ENDPOINTS } from "@/lib/api-routes";
import { queryKeys } from "@/app/constants/queryKeys";
import { SubjectFormData, subjectSchema } from "@/schemas";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { AxiosResponse } from "axios";
import { PaginationState } from "@tanstack/react-table";

const useSubjectService = () => {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [deleteSubject, setDeleteSubject] = useState<Subject | null>(null);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const { data: subjects, isLoading } = useQuery<
    AxiosResponse<PaginatedResponse<Subject>>
  >({
    queryKey: [queryKeys.SUBJECTS, pagination.pageIndex, pagination.pageSize],
    queryFn: async () =>
      axiosClient.get(SUBJECT_ENDPOINTS.GET_ALL_SUBJECTS, {
        params: {
          page: pagination.pageIndex + 1,
          per_page: pagination.pageSize,
        },
      }),
  });

  const form = useForm<SubjectFormData>({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      name: "",
      code: "",
      description: "",
      isActive: true,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: SubjectFormData) => {
      if (editingSubject) {
        const response = await axiosClient.patch(
          SUBJECT_ENDPOINTS.UPDATE_SUBJECT.replace(":id", editingSubject.id),
          data,
        );
        return response.data;
      }
      const response = await axiosClient.post(
        SUBJECT_ENDPOINTS.CREATE_SUBJECT,
        data,
      );
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.SUBJECTS] });
      toast.success("Success", { description: data.message });
      setDialogOpen(false);
      setEditingSubject(null);
      form.reset();
    },
    onError: (error: any) => {
      toast.error("Error", { description: error?.response?.data?.message });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await axiosClient.delete(
        SUBJECT_ENDPOINTS.DELETE_SUBJECT.replace(":id", id),
      );
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.SUBJECTS] });
      toast.success("Success", { description: data.message });
      setDeleteDialogOpen(false);
      setDeleteSubject(null);
    },
    onError: (error: any) => {
      toast.error("Error", { description: error?.response?.data.message });
    },
  });

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject);
    form.reset({
      name: subject.name,
      code: subject.code,
      description: subject.description || "",
      isActive: subject.isActive,
    });
    setDialogOpen(true);
  };

  const handleDelete = (subject: Subject) => {
    setDeleteSubject(subject);
    setDeleteDialogOpen(true);
  };

  return {
    subjects: subjects?.data.data,
    pageCount: subjects?.data?.meta?.lastPage,
    pagination,
    setPagination,
    isLoading,
    dialogOpen,
    setDialogOpen,
    editingSubject,
    setEditingSubject,
    form,
    mutation,
    deleteMutation,
    handleEdit,
    handleDelete,
    deleteDialogOpen,
    setDeleteDialogOpen,
    deleteSubject,
    setDeleteSubject,
  };
};

export default useSubjectService;
