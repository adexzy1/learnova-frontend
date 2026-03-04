import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { PaginatedResponse, Student } from "@/types";
import axiosClient from "@/lib/axios-client";
import { STUDENT_ENDPOINTS } from "@/lib/api-routes";
import { queryKeys } from "@/app/constants/queryKeys";
import { toast } from "sonner";
import { AxiosResponse } from "axios";

const useStudentService = () => {
  const queryClient = useQueryClient();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteStudent, setDeleteStudent] = useState<Student | null>(null);

  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 10,
  });

  const [filters, setFilters] = useState({
    class: "all",
    status: "all",
    gender: "all",
    search: "",
  });

  // Query for paginated students
  const { data: studentsResponse, isLoading: isLoadingStudents } = useQuery<
    AxiosResponse<PaginatedResponse<Student>>
  >({
    queryKey: [
      queryKeys.STUDENTS,
      pagination.page,
      pagination.per_page,
      filters,
    ],
    queryFn: async () =>
      axiosClient.get(STUDENT_ENDPOINTS.GET_ALL_STUDENTS, {
        params: {
          page: pagination.page,
          per_page: pagination.per_page,
          search: filters.search || undefined,
          filters: JSON.stringify({
            classId: filters.class !== "all" ? filters.class : undefined,
            status: filters.status !== "all" ? filters.status : undefined,
            gender: filters.gender !== "all" ? filters.gender : undefined,
          }),
        },
      }),
  });

  console.log(studentsResponse?.data.data);

  // Mutation for delete
  const deleteMutation = useMutation({
    mutationFn: async (studentId: string) => {
      const response = await axiosClient.delete(
        STUDENT_ENDPOINTS.DELETE_STUDENT.replace(":id", studentId),
      );
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.STUDENTS] });
      toast.success("Success", {
        description: data.message || "Student deleted successfully",
      });
      setDeleteDialogOpen(false);
      setDeleteStudent(null);
    },
    onError: (error: any) => {
      toast.error("Error", {
        description:
          error?.response?.data?.message || "Failed to delete student",
      });
    },
  });

  const handleDelete = (student: Student) => {
    setDeleteStudent(student);
    setDeleteDialogOpen(true);
  };

  return {
    students: studentsResponse?.data.data,
    meta: studentsResponse?.data?.meta,
    pagination,
    setPagination,
    filters,
    setFilters,
    isLoadingStudents,
    deleteMutation,
    handleDelete,
    deleteDialogOpen,
    setDeleteDialogOpen,
    deleteStudent,
  };
};

export default useStudentService;
