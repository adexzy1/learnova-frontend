"use client";

import { useState, useEffect, useCallback } from "react";
import { CheckCircle2, Loader2, CreditCard, Shield } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  useInitializePayment,
  useVerifyPayment,
} from "./service/subscription.service";
import type { SubscriptionPlan, PaystackPaymentResponse } from "@/types";

// Extend the global window to include PaystackPop
declare global {
  interface Window {
    PaystackPop?: {
      setup: (config: Record<string, unknown>) => {
        openIframe: () => void;
      };
    };
  }
}

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: SubscriptionPlan | null;
  email: string;
  onSuccess: () => void;
}

type PaymentStep = "summary" | "processing" | "success" | "error";

export function PaymentDialog({
  open,
  onOpenChange,
  plan,
  email,
  onSuccess,
}: PaymentDialogProps) {
  const [step, setStep] = useState<PaymentStep>("summary");
  const [errorMessage, setErrorMessage] = useState("");
  const initPayment = useInitializePayment();
  const verifyPayment = useVerifyPayment();

  // Load Paystack script
  useEffect(() => {
    if (!open) return;
    if (document.getElementById("paystack-script")) return;

    const script = document.createElement("script");
    script.id = "paystack-script";
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    document.body.appendChild(script);
  }, [open]);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setStep("summary");
      setErrorMessage("");
    }
  }, [open]);

  const handlePaystackCallback = useCallback(
    async (response: PaystackPaymentResponse) => {
      setStep("processing");
      try {
        await verifyPayment.mutateAsync({
          reference: response.reference,
        });
        setStep("success");
      } catch {
        setStep("error");
        setErrorMessage(
          "Payment was received but verification failed. Please contact support.",
        );
      }
    },
    [verifyPayment],
  );

  const handlePaystackClose = useCallback(() => {
    // User closed the paystack popup without paying
    setStep("summary");
  }, []);

  const handlePay = async () => {
    if (!plan) return;

    setStep("processing");
    try {
      const paymentData = await initPayment.mutateAsync({
        planId: plan.id,
        interval: plan.interval,
        email,
        amount: plan.price,
      });

      // Check if PaystackPop is available
      if (!window.PaystackPop) {
        // Paystack script not loaded — simulate success for dev/mock mode
        setTimeout(() => {
          handlePaystackCallback({
            reference: paymentData.reference,
            status: "success",
            trans: "mock_trans",
            transaction: "mock_transaction",
            message: "Approved",
          });
        }, 1500);
        return;
      }

      const handler = window.PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
        access_code: paymentData.access_code,
        callback: (response: PaystackPaymentResponse) => {
          handlePaystackCallback(response);
        },
        onClose: handlePaystackClose,
      });
      handler.openIframe();
    } catch {
      setStep("error");
      setErrorMessage("Failed to initialize payment. Please try again.");
    }
  };

  const handleDone = () => {
    onOpenChange(false);
    onSuccess();
  };

  if (!plan) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {step === "summary" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Complete Payment
              </DialogTitle>
              <DialogDescription>
                Subscribe to the {plan.name} plan to continue
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Plan summary */}
              <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Plan</span>
                  <span className="font-medium">{plan.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Billing cycle
                  </span>
                  <span className="font-medium capitalize">
                    {plan.interval}
                  </span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total</span>
                  <span className="text-xl font-bold">
                    ₦{plan.price.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Security notice */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Shield className="h-3.5 w-3.5" />
                <span>
                  Payments are processed securely by Paystack. We never store
                  your card details.
                </span>
              </div>
            </div>

            <DialogFooter className="flex flex-col gap-2 sm:flex-row">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button onClick={handlePay} className="w-full sm:w-auto gap-2">
                <CreditCard className="h-4 w-4" />
                Pay ₦{plan.price.toLocaleString()}
              </Button>
            </DialogFooter>
          </>
        )}

        {step === "processing" && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <div className="text-center space-y-1">
              <h3 className="font-semibold">Processing Payment</h3>
              <p className="text-sm text-muted-foreground">
                Please wait while we process your payment...
              </p>
            </div>
          </div>
        )}

        {step === "success" && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="rounded-full bg-emerald-100 p-3 dark:bg-emerald-900/30">
              <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-semibold">Payment Successful!</h3>
              <p className="text-sm text-muted-foreground">
                Your {plan.name} plan is now active. Thank you!
              </p>
            </div>
            <Button onClick={handleDone} className="mt-4">
              Done
            </Button>
          </div>
        )}

        {step === "error" && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/30">
              <CreditCard className="h-10 w-10 text-red-600 dark:text-red-400" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-semibold">Payment Failed</h3>
              <p className="text-sm text-muted-foreground max-w-[280px]">
                {errorMessage}
              </p>
            </div>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={() => setStep("summary")}>Try Again</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
