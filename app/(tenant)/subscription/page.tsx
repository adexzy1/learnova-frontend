"use client";

import { useState, useRef } from "react";

import { PageHeader } from "@/components/shared/page-header";
import { SubscriptionOverview } from "@/components/subscription/subscription-overview";
import { PlanSelector } from "@/components/subscription/plan-selector";
import { BillingHistory } from "@/components/subscription/billing-history";
import { PaymentDialog } from "@/components/subscription/payment-dialog";
import {
  useSubscription,
  useSubscriptionPlans,
  useBillingHistory,
} from "@/components/subscription/service/subscription.service";
import { useAuth } from "@/providers/tenant-auth-provider";
import type { SubscriptionPlan } from "@/types";

export default function SubscriptionPage() {
  const { user } = useAuth();
  const { subscription, isLoading: subLoading } = useSubscription();
  const { plans, isLoading: plansLoading } = useSubscriptionPlans();
  const { records, isLoading: billingLoading } = useBillingHistory();

  const [paymentOpen, setPaymentOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(
    null,
  );

  const planSectionRef = useRef<HTMLDivElement>(null);

  const handleUpgrade = () => {
    planSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleRenew = () => {
    // For renewal, select the current plan and open payment
    if (subscription) {
      setSelectedPlan(subscription.plan);
      setPaymentOpen(true);
    }
  };

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setPaymentOpen(true);
  };

  const handlePaymentSuccess = () => {
    // Queries are auto-invalidated by the service hook
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Subscription"
        description="Manage your school's subscription plan and billing"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Subscription" },
        ]}
      />

      {/* Current subscription overview */}
      <SubscriptionOverview
        subscription={subscription}
        isLoading={subLoading}
        onUpgrade={handleUpgrade}
        onRenew={handleRenew}
      />

      {/* Plan selector */}
      <div ref={planSectionRef}>
        <PlanSelector
          plans={plans}
          currentPlanId={subscription?.planId}
          isLoading={plansLoading}
          onSelectPlan={handleSelectPlan}
        />
      </div>

      {/* Billing history */}
      <BillingHistory records={records} isLoading={billingLoading} />

      {/* Payment dialog */}
      <PaymentDialog
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
        plan={selectedPlan}
        email={user?.email ?? ""}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
}
