import axiosClient from "@/lib/axios-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CLASS_ENDPOINTS,
  GRADING_ENDPOINTS,
  ONBOARDING_ENDPOINTS,
  SESSION_ENDPOINTS,
  TENANT_SETTINGS_ENDPOINTS,
} from "@/lib/api-routes";
import { PasswordFormValues } from "../change-password/page";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { schoolSettingsSchema } from "@/components/settings/school-profile/service/school-profile.service";
import { User } from "@/types";
import { SchoolProfile } from "@/components/settings/types";
import {
  AcademicYearFormValues,
  academicYearSchema,
} from "../schema/academicYearSchema";
import { classStructureSchema } from "../schema/classStructureSchema";
import {
  gradingPolicySchema,
  GradingPolicyFormValues,
} from "../schema/gradingSystemSchema";
import { useTenant } from "@/providers/tenant-provider";

export const useChangeDefaultPassword = () => {
  const router = useRouter();
  const mutation = useMutation({
    mutationFn: async (data: PasswordFormValues) => {
      const response = await axiosClient.post(
        ONBOARDING_ENDPOINTS.CHANGE_DEFAULT_PASSWORD,
        data,
      );
      return response.data;
    },
    onSuccess: (res: any) => {
      toast.success("Password changed", { description: res.message });
      router.refresh();
    },
    onError: (error: any) => {
      toast.error("Error", { description: error.response?.data?.message });
    },
  });

  return {
    changePassword: mutation.mutateAsync,
    isLoading: mutation.isPending,
  };
};

export const useUpdateSchoolProfile = (user: User | null) => {
  const { tenant } = useTenant();
  const form = useForm({
    resolver: zodResolver(schoolSettingsSchema),
    defaultValues: {
      schoolName: tenant?.schoolName || "",
      phone: "",
      email: user?.email || "",
      address: "",
      website: "",
      description: "",
    },
  });
  const router = useRouter();
  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await axiosClient.put(
        TENANT_SETTINGS_ENDPOINTS.UPDATE_SCHOOL_PROFILE,
        data,
      );
      return response.data;
    },
    onSuccess: (res: any) => {
      toast.success("Profile updated", { description: res.message });
      router.refresh();
    },
    onError: (error: any) => {
      toast.error("Error", { description: error.response?.data?.message });
      if (error.response?.data?.errors) {
        Object.entries(error.response.data.errors).forEach(([key, value]) => {
          form.setError(key as keyof SchoolProfile, {
            message: value as string,
          });
        });
      }
    },
  });

  return {
    updateProfile: mutation.mutateAsync,
    isLoading: mutation.isPending,
    form,
  };
};

export const useSetAcademicYear = () => {
  const form = useForm({
    resolver: zodResolver(academicYearSchema),
    defaultValues: {
      sessionName: "",
      sessionStartDate: "",
      sessionEndDate: "",
      currentTermName: "",
      currentTermStartDate: "",
      currentTermEndDate: "",
    },
  });
  const router = useRouter();
  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await axiosClient.post(
        SESSION_ENDPOINTS.SETUP_ACADEMIC_YEAR,
        data,
      );
      return response.data;
    },
    onSuccess: (res: any) => {
      toast.success("Session added", { description: res.message });
      router.refresh();
    },
    onError: (error: any) => {
      toast.error("Error", { description: error.response?.data?.message });
      if (error.response?.data?.errors) {
        Object.entries(error.response.data.errors).forEach(([key, value]) => {
          form.setError(key as keyof AcademicYearFormValues, {
            message: value as string,
          });
        });
      }
    },
  });

  return {
    setAcademicYear: mutation.mutateAsync,
    isLoading: mutation.isPending,
    form,
  };
};

export const useSetupClassStructure = () => {
  const form = useForm({
    resolver: zodResolver(classStructureSchema),
    defaultValues: {
      classes: [
        {
          name: "",
          level: "1",
          arms: [{ name: "A", capacity: 40 }],
        },
      ],
    },
  });

  const formClassLevels = useFieldArray({
    control: form.control,
    name: "classes",
  });
  const router = useRouter();
  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await axiosClient.post(
        CLASS_ENDPOINTS.SETUP_CLASS_STRUCTURE,
        data,
      );
      return response.data;
    },
    onSuccess: (res: any) => {
      toast.success("Classes added", { description: res.message });
      router.refresh();
    },
    onError: (error: any) => {
      toast.error("Error", { description: error.response?.data?.message });
    },
  });

  return {
    addClassStructure: mutation.mutateAsync,
    isLoading: mutation.isPending,
    form,
    formClassLevels,
  };
};

export const useSetGradingSystem = () => {
  const form = useForm({
    resolver: zodResolver(gradingPolicySchema),
    defaultValues: {
      name: "",
      description: "",
      isActive: true,
      grades: [
        {
          grade: "",
          minScore: 0,
          maxScore: 100,
          gradePoint: 0,
          remark: "",
        },
      ],
    },
  });

  const formGrades = useFieldArray({
    control: form.control,
    name: "grades",
  });

  const router = useRouter();
  const mutation = useMutation({
    mutationFn: async (data: GradingPolicyFormValues) => {
      const response = await axiosClient.post(
        GRADING_ENDPOINTS.SETUP_GRADING_SYSTEM,
        data,
      );
      return response.data;
    },
    onSuccess: (res: any) => {
      toast.success("Grading system configured", { description: res.message });
      router.refresh();
    },
    onError: (error: any) => {
      toast.error("Error", { description: error.response?.data?.message });
    },
  });

  return {
    setGradingSystem: mutation.mutateAsync,
    isLoading: mutation.isPending,
    form,
    formGrades,
  };
};

export const useOnboardingPayment = () => {
  const router = useRouter();
  const initMutation = useMutation({
    mutationFn: async () => {
      const response = await axiosClient.post(
        ONBOARDING_ENDPOINTS.SET_PAYMENT_METHOD,
      );
      console.log(response.data);
      return response.data;
    },
  });

  const verifyMutation = useMutation({
    mutationFn: async (reference: string) => {
      const response = await axiosClient.post(
        ONBOARDING_ENDPOINTS.VERIFY_PAYMENT,
        { reference },
      );

      return response.data;
    },
    onSuccess: (res: any) => {
      toast.success("Payment verified", { description: res.message });
      router.refresh();
    },
    onError: (error: any) => {
      toast.error("Error", { description: error.response?.data?.message });
    },
  });

  return {
    initiatePayment: initMutation.mutateAsync,
    verifyPayment: verifyMutation.mutateAsync,
    isInitializing: initMutation.isPending,
    isVerifying: verifyMutation.isPending,
  };
};
