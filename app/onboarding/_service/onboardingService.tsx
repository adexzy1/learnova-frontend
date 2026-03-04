import axiosClient from "@/lib/axios-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ONBOARDING_ENDPOINTS } from "@/lib/api-routes";
import { PasswordFormValues } from "../change-password/page";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

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

export const useUpdateCompanyProfile = () => {
  const router = useRouter();
  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await axiosClient.post(
        ONBOARDING_ENDPOINTS.UPDATE_COMPANY_PROFILE,
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
    },
  });

  return {
    updateProfile: mutation.mutateAsync,
    isLoading: mutation.isPending,
  };
};

export const useAddSession = () => {
  const router = useRouter();
  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await axiosClient.post(
        ONBOARDING_ENDPOINTS.ADD_SESSION,
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
    },
  });

  return {
    addSession: mutation.mutateAsync,
    isLoading: mutation.isPending,
  };
};

export const useAddTerm = () => {
  const router = useRouter();
  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await axiosClient.post(
        ONBOARDING_ENDPOINTS.ADD_TERM,
        data,
      );
      return response.data;
    },
    onSuccess: (res: any) => {
      toast.success("Term added", { description: res.message });
      router.refresh();
    },
    onError: (error: any) => {
      toast.error("Error", { description: error.response?.data?.message });
    },
  });

  return {
    addTerm: mutation.mutateAsync,
    isLoading: mutation.isPending,
  };
};

export const useOnboardingPayment = () => {
  const router = useRouter();
  const initMutation = useMutation({
    mutationFn: async () => {
      const response = await axiosClient.post(
        ONBOARDING_ENDPOINTS.ADD_CREDIT_CARD,
      );
      return response.data;
    },
  });

  const verifyMutation = useMutation({
    mutationFn: async (reference: string) => {
      const response = await axiosClient.post(
        ONBOARDING_ENDPOINTS.ADD_CREDIT_CARD + "/verify",
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
