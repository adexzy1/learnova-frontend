import axiosClient from "@/lib/axios-client";
import { SUBSCRIPTION_ENDPOINTS } from "@/lib/api-routes";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/app/constants/queryKeys";
import type { Subscription, SubscriptionPlan, BillingRecord } from "@/types";
import type {
  PlanChangeRequest,
  PaymentInitRequest,
  PaymentInitResponse,
  PaymentVerifyRequest,
} from "../types";
import { MOCK_SUBSCRIPTION, MOCK_PLANS, MOCK_BILLING_HISTORY } from "../types";

// Toggle this to false when the real API is ready
const USE_MOCK = true;

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const useSubscription = () => {
  const response = useQuery<Subscription>({
    queryKey: [queryKeys.SUBSCRIPTION],
    queryFn: async () => {
      if (USE_MOCK) {
        await delay(600);
        return MOCK_SUBSCRIPTION;
      }
      const resp = await axiosClient.get(
        SUBSCRIPTION_ENDPOINTS.GET_SUBSCRIPTION,
      );
      return resp.data;
    },
  });

  return {
    subscription: response.data,
    isLoading: response.isLoading,
    isError: response.isError,
    error: response.error,
  };
};

export const useSubscriptionPlans = () => {
  const response = useQuery<SubscriptionPlan[]>({
    queryKey: [queryKeys.SUBSCRIPTION_PLANS],
    queryFn: async () => {
      if (USE_MOCK) {
        await delay(400);
        return MOCK_PLANS;
      }
      const resp = await axiosClient.get(SUBSCRIPTION_ENDPOINTS.GET_PLANS);
      return resp.data;
    },
  });

  return {
    plans: response.data ?? [],
    isLoading: response.isLoading,
    isError: response.isError,
    error: response.error,
  };
};

export const useBillingHistory = () => {
  const response = useQuery<BillingRecord[]>({
    queryKey: [queryKeys.BILLING_HISTORY],
    queryFn: async () => {
      if (USE_MOCK) {
        await delay(500);
        return MOCK_BILLING_HISTORY;
      }
      const resp = await axiosClient.get(
        SUBSCRIPTION_ENDPOINTS.GET_BILLING_HISTORY,
      );
      return resp.data;
    },
  });

  return {
    records: response.data ?? [],
    isLoading: response.isLoading,
    isError: response.isError,
    error: response.error,
  };
};

export const useChangePlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: PlanChangeRequest) => {
      if (USE_MOCK) {
        await delay(800);
        return { success: true };
      }
      const resp = await axiosClient.post(
        SUBSCRIPTION_ENDPOINTS.CHANGE_PLAN,
        data,
      );
      return resp.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.SUBSCRIPTION] });
      queryClient.invalidateQueries({ queryKey: [queryKeys.BILLING_HISTORY] });
    },
  });
};

export const useInitializePayment = () => {
  return useMutation<PaymentInitResponse, Error, PaymentInitRequest>({
    mutationFn: async (data) => {
      if (USE_MOCK) {
        await delay(500);
        return {
          authorization_url: "",
          access_code: "ACK_mock_test",
          reference: `PSK_ref_${Date.now()}`,
        };
      }
      const resp = await axiosClient.post(
        SUBSCRIPTION_ENDPOINTS.INIT_PAYMENT,
        data,
      );
      return resp.data;
    },
  });
};

export const useVerifyPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: PaymentVerifyRequest) => {
      if (USE_MOCK) {
        await delay(600);
        return { success: true, status: "paid" };
      }
      const resp = await axiosClient.post(
        SUBSCRIPTION_ENDPOINTS.VERIFY_PAYMENT,
        data,
      );
      return resp.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.SUBSCRIPTION] });
      queryClient.invalidateQueries({ queryKey: [queryKeys.BILLING_HISTORY] });
    },
  });
};
