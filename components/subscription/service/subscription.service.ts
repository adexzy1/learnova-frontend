import axiosClient from "@/lib/axios-client";
import { SUBSCRIPTION_ENDPOINTS } from "@/lib/api-routes";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/app/constants/queryKeys";
import type { Subscription, SubscriptionPlan, BillingRecord } from "@/types";
import type {
  PaymentInitRequest,
  PaymentInitResponse,
  PaymentVerifyRequest,
} from "../types";

// ── GET /subscription ────────────────────────────────────────────────────────
export const useSubscription = () => {
  const response = useQuery<Subscription | null>({
    queryKey: [queryKeys.SUBSCRIPTION],
    queryFn: async () => {
      const resp = await axiosClient.get(SUBSCRIPTION_ENDPOINTS.GET_SUBSCRIPTION);
      // Backend wraps in { success, data } via ResponseTransformInterceptor
      return resp.data.data ?? null;
    },
  });

  return {
    subscription: response.data ?? undefined,
    isLoading: response.isLoading,
    isError: response.isError,
    error: response.error,
  };
};

// ── GET /subscription/plan ───────────────────────────────────────────────────
export const useSubscriptionPlans = () => {
  const response = useQuery<SubscriptionPlan[]>({
    queryKey: [queryKeys.SUBSCRIPTION_PLANS],
    queryFn: async () => {
      const resp = await axiosClient.get(SUBSCRIPTION_ENDPOINTS.GET_PLANS);
      return resp.data.data ?? [];
    },
  });

  return {
    plans: response.data ?? [],
    isLoading: response.isLoading,
    isError: response.isError,
    error: response.error,
  };
};

// ── GET /subscription/billing ────────────────────────────────────────────────
export const useBillingHistory = () => {
  const response = useQuery<BillingRecord[]>({
    queryKey: [queryKeys.BILLING_HISTORY],
    queryFn: async () => {
      const resp = await axiosClient.get(SUBSCRIPTION_ENDPOINTS.GET_BILLING_HISTORY);
      return resp.data.data ?? [];
    },
  });

  return {
    records: response.data ?? [],
    isLoading: response.isLoading,
    isError: response.isError,
    error: response.error,
  };
};

// ── POST /subscription/change-plan ───────────────────────────────────────────
export const useChangePlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (planId: string) => {
      const resp = await axiosClient.post(SUBSCRIPTION_ENDPOINTS.CHANGE_PLAN, {
        planId,
      });
      return resp.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.SUBSCRIPTION] });
      queryClient.invalidateQueries({ queryKey: [queryKeys.BILLING_HISTORY] });
    },
  });
};

// ── POST /subscription/initialize-payment ────────────────────────────────────
export const useInitializePayment = () => {
  return useMutation<PaymentInitResponse, Error, PaymentInitRequest>({
    mutationFn: async (data) => {
      const resp = await axiosClient.post(SUBSCRIPTION_ENDPOINTS.INIT_PAYMENT, {
        planId: data.planId,
      });
      // Backend: { success, data: { authorization_url, access_code, reference } }
      return resp.data.data;
    },
  });
};

// ── POST /subscription/payment/verify ────────────────────────────────────────
export const useVerifyPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: PaymentVerifyRequest) => {
      const resp = await axiosClient.post(
        SUBSCRIPTION_ENDPOINTS.VERIFY_PAYMENT,
        data,
      );
      return resp.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.SUBSCRIPTION] });
      queryClient.invalidateQueries({ queryKey: [queryKeys.BILLING_HISTORY] });
    },
  });
};
