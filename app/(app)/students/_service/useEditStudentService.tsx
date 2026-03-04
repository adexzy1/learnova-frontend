"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { STUDENT_ENDPOINTS } from "@/lib/api-routes";
import { queryKeys } from "@/app/constants/queryKeys";
import { StudentFormData, studentSchema } from "@/schemas";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";
import axiosClient from "@/lib/axios-client";
import { AxiosResponse } from "axios";
import { Student } from "@/types";
import { useEffect } from "react";

export const useEditStudentService = (studentId?: string) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const params = useParams();
  const id = studentId || (params.id as string);

  const { data: studentDetails, isLoading: isLoadingDetails } = useQuery<
    AxiosResponse<Student>
  >({
    queryKey: [queryKeys.STUDENTS, id],
    queryFn: async () =>
      axiosClient.get(STUDENT_ENDPOINTS.GET_STUDENT_BY_ID.replace(":id", id)),
    enabled: !!id,
  });

  const form = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      middleName: "",
      dateOfBirth: "",
      gender: "male",
      email: "",
      phone: "",
      address: "",
      admissionNumber: "",
      classArm: "",
      createUserAccount: false,
      guardians: [],
    },
  });

  // Sync form with data
  useEffect(() => {
    if (studentDetails?.data) {
      const student = studentDetails.data;
      form.reset({
        firstName: student.firstName,
        lastName: student.lastName,
        middleName: student.middleName || "",
        dateOfBirth: student.dateOfBirth,
        gender: student.gender,
        email: student.email || "",
        phone: student.phone || "",
        address: student.address,
        admissionNumber: student.admissionNumber || "",
        classArm: student.classArm || student.classId || "",
        createUserAccount: (student as any).createUserAccount || false,
        // guardians: student.guardians.map((g) => ({
        //   firstName: g.firstName,
        //   lastName: g.lastName,
        //   relationship: g.relationship,
        //   email: g.email,
        //   phoneNumber: g.phone,
        //   address: g.address,
        //   isPrimary: g.isPrimary,
        //   createUserAccount: (g as any).createUserAccount || false,
        // })),
      });
    }
  }, [studentDetails, form]);

  const mutation = useMutation({
    mutationFn: async (data: StudentFormData) => {
      const formData = new FormData();

      // Append all fields to FormData
      Object.entries(data).forEach(([key, value]) => {
        if (key === "guardians") {
          formData.append(key, JSON.stringify(value));
        } else if (key === "photo" && value instanceof File) {
          formData.append(key, value);
        } else if (value !== undefined && value !== null) {
          formData.append(key, value as string);
        }
      });

      const response = await axiosClient.patch(
        STUDENT_ENDPOINTS.UPDATE_STUDENT.replace(":id", id),
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.STUDENTS] });
      queryClient.invalidateQueries({ queryKey: [queryKeys.STUDENTS, id] });
      toast.success("Success", {
        description: data.message || "Student profile updated successfully",
      });
      router.push(`/students/${id}`);
    },
    onError: (error: any) => {
      toast.error("Error", {
        description:
          error?.response?.data?.message || "Failed to update profile",
      });
    },
  });

  return {
    studentDetails: studentDetails?.data,
    isLoadingDetails,
    form,
    mutation,
    isLoading: mutation.isPending,
  };
};
