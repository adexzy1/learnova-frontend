"use client";

import { CreditCard, Loader2, Shield, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOnboardingPayment } from "../_service/onboardingService";
import type { PaystackPaymentResponse } from "@/types";
import { StepHeader } from "../page";

interface PaymentProps {
  goBack: () => void;
  setStep: (step: number) => void;
}

const Payment = ({ goBack, setStep }: PaymentProps) => {
  const {
    initiatePayment,
    verifyPayment,
    isInitializing: isPayInitLoading,
    isVerifying: isPayVerifyLoading,
  } = useOnboardingPayment();

  const handlePayment = async () => {
    try {
      const paymentData = await initiatePayment();
      const PaystackModule = await import("@paystack/inline-js");
      const PaystackConstructor = PaystackModule.default as any;
      const paystack = new PaystackConstructor();

      paystack.resumeTransaction(paymentData.data.access_code, {
        onSuccess: async (response: PaystackPaymentResponse) => {
          await verifyPayment(response.reference);
          setStep(6);
        },
        onCancel: () => {},
        onError: () => {},
      });
    } catch (error) {}
  };

  return (
    <div className="space-y-6">
      <StepHeader
        icon={CreditCard}
        title="Account Verification"
        description="Add a payment method to activate your subscription."
      />

      <div className="rounded-lg border bg-card p-6 space-y-5">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <CreditCard className="h-8 w-8 text-primary" />
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-primary">₦1,000</p>
            <p className="text-sm text-muted-foreground">
              Refundable verification charge
            </p>
          </div>
          <p className="text-sm text-muted-foreground max-w-sm">
            We make a small charge to verify your payment method. This amount
            will be automatically refunded to your account.
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground border-t pt-4">
          <Shield className="h-4 w-4" />
          <span>Securely processed by Paystack</span>
        </div>
      </div>

      <div className="flex justify-between pt-2">
        <Button
          type="button"
          variant="ghost"
          onClick={goBack}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button
          onClick={handlePayment}
          className="gap-2"
          disabled={isPayInitLoading || isPayVerifyLoading}
        >
          {isPayInitLoading || isPayVerifyLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <CreditCard className="h-4 w-4" />
              Complete Setup
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default Payment;
