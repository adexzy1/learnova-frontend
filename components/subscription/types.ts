import type { Subscription, SubscriptionPlan, BillingRecord } from "@/types";

export type SubscriptionStatus = Subscription["status"];

export interface PlanChangeRequest {
  planId: string;
  interval: SubscriptionPlan["interval"];
}

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

// Mock data for development
export const MOCK_PLANS: SubscriptionPlan[] = [
  {
    id: "bb7a8ada-1bcb-41e0-9494-a1c0db26fa41",
    name: "Essential",
    price: 20000,
    interval: "term",
    description: "Perfect for small schools just getting started",
    features: [
      "Up to 100 students",
      "Up to 10 staff members",
      "5 GB storage",
      "Basic reports",
      "Email support",
    ],
    maxStudents: 100,
    maxStaff: 10,
    maxStorage: 5,
  },
  {
    id: "7dc71341-688e-4507-b568-fc98e24b11be",
    name: "Professional",
    price: 50000,
    interval: "term",
    description: "Ideal for growing schools with more needs",
    features: [
      "Up to 500 students",
      "Up to 50 staff members",
      "25 GB storage",
      "Advanced reports & analytics",
      "SMS notifications",
      "Priority email support",
      "Parent portal",
    ],
    maxStudents: 500,
    maxStaff: 50,
    maxStorage: 25,
    isPopular: true,
  },
  {
    id: "plan_premium",
    name: "Enterprise",
    price: 0,
    interval: "term",
    description: "For large institutions that need everything",
    features: [
      "Unlimited students",
      "Unlimited staff",
      "100 GB storage",
      "Custom reports & dashboards",
      "SMS & WhatsApp notifications",
      "Dedicated account manager",
      "Parent & student portals",
      "API access",
      "Custom branding",
    ],
    maxStudents: 99999,
    maxStaff: 99999,
    maxStorage: 100,
  },
];

export const MOCK_SUBSCRIPTION: Subscription = {
  id: "sub_1",
  tenantId: "tenant_1",
  planId: "plan_standard",
  plan: MOCK_PLANS[1],
  status: "active",
  currentPeriodStart: "2026-01-15T00:00:00Z",
  currentPeriodEnd: "2026-04-15T00:00:00Z",
  trialEndAt: undefined,
  usage: {
    students: 234,
    staff: 18,
    storageUsed: 8.5,
  },
  createdAt: "2025-09-01T00:00:00Z",
  updatedAt: "2026-01-15T00:00:00Z",
};

export const MOCK_BILLING_HISTORY: BillingRecord[] = [
  {
    id: "bill_1",
    subscriptionId: "sub_1",
    amount: 35000,
    currency: "NGN",
    status: "paid",
    description: "Standard Plan — Jan–Apr 2026",
    paymentMethod: "Paystack (Card)",
    reference: "PSK_ref_abc123",
    paidAt: "2026-01-15T10:30:00Z",
  },
  {
    id: "bill_2",
    subscriptionId: "sub_1",
    amount: 35000,
    currency: "NGN",
    status: "paid",
    description: "Standard Plan — Sep–Dec 2025",
    paymentMethod: "Paystack (Card)",
    reference: "PSK_ref_def456",
    paidAt: "2025-09-01T09:15:00Z",
  },
  {
    id: "bill_3",
    subscriptionId: "sub_1",
    amount: 15000,
    currency: "NGN",
    status: "paid",
    description: "Starter Plan — May–Aug 2025",
    paymentMethod: "Paystack (Bank Transfer)",
    reference: "PSK_ref_ghi789",
    paidAt: "2025-05-01T14:00:00Z",
  },
];
