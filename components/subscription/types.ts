import type { SubscriptionPlan } from "@/types";

export interface PaymentInitRequest {
  planId: string;
}

export interface PaymentInitResponse {
  authorization_url: string;
  access_code: string;
  reference: string;
}

export interface PaymentVerifyRequest {
  reference: string;
}
