"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { STUDENT_ENDPOINTS } from "@/lib/api-routes";
import { queryKeys } from "@/app/constants/queryKeys";
import { StudentFormData, studentSchema } from "@/schemas";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import axiosClient from "@/lib/axios-client";

export const useNewStudentService = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

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
      guardians: [
        {
          firstName: "",
          lastName: "",
          relationship: "",
          email: "",
          phoneNumber: "",
          address: "",
          isPrimary: true,
          createUserAccount: false,
        },
      ],
    },
  });

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

      const response = await axiosClient.post(
        STUDENT_ENDPOINTS.CREATE_STUDENT,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.STUDENTS] });
      toast.success("Success", {
        description: data.data.message || "Student registered successfully",
      });
      router.push("/students");
    },
    onError: (error: any) => {
      if (error?.response?.data?.errors) {
        console.log(error?.response?.data?.errors);
        Object.entries(error?.response?.data?.errors).forEach(
          ([key, value]) => {
            form.setError(key as keyof StudentFormData, {
              message: value as string,
            });
          },
        );
        return;
      }
      toast.error("Error", {
        description:
          error?.response?.data?.message || "Failed to register student",
      });
    },
  });

  return {
    form,
    mutation,
    isLoading: mutation.isPending,
  };
};
