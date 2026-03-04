"use client";

import { useState, useEffect } from "react";
import { Loader2, CreditCard, Shield } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Paystack from "@paystack/inline-js";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAuth } from "@/providers/app-auth-provider";
import {
  useUpdateCompanyProfile,
  useAddSession,
  useAddTerm,
  useOnboardingPayment,
} from "./_service/onboardingService";
import type { PaystackPaymentResponse } from "@/types";

const profileSchema = z.object({
  name: z.string().min(1, "School name is required"),
  phone: z.string().min(1, "Contact phone is required"),
  domainName: z.string().optional(),
  address: z.string().optional(),
});

const sessionSchema = z.object({
  name: z.string().min(1, "Session name is required (e.g., 2024/2025)"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
});

const termSchema = z.object({
  name: z.string().min(1, "Term name is required (e.g., First Term)"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
});

const STEP_MAP: Record<string, number> = {
  schoolProfile: 1,
  session: 2,
  term: 3,
  payment: 4,
};

export default function OnboardingPage() {
  const { user, onboardingStep } = useAuth();
  const [step, setStep] = useState(1);
  const [isLoaded, setIsLoaded] = useState(false);

  console.log("onboardingStep", onboardingStep);

  const { updateProfile, isLoading: isProfileLoading } =
    useUpdateCompanyProfile();
  const { addSession, isLoading: isSessionLoading } = useAddSession();
  const { addTerm, isLoading: isTermLoading } = useAddTerm();
  const {
    initiatePayment,
    verifyPayment,
    isInitializing: isPayInitLoading,
    isVerifying: isPayVerifyLoading,
  } = useOnboardingPayment();

  // Sync step from server/sessionStore on mount
  useEffect(() => {
    const serverStepStr = onboardingStep || "schoolProfile";
    const serverStep = STEP_MAP[serverStepStr] || 1;
    const localStep = sessionStorage.getItem("onboarding_step");

    // Prioritize server step if it's further along
    const initialStep = Math.max(
      serverStep,
      localStep ? parseInt(localStep) : 1,
    );
    setStep(initialStep);
    setIsLoaded(true);
  }, [onboardingStep]);

  // Update session storage whenever step changes
  useEffect(() => {
    if (isLoaded) {
      sessionStorage.setItem("onboarding_step", step.toString());
    }
  }, [step, isLoaded]);

  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: "", phone: "", domainName: "", address: "" },
  });

  const sessionForm = useForm({
    resolver: zodResolver(sessionSchema),
    defaultValues: { name: "", startDate: "", endDate: "" },
  });

  const termForm = useForm({
    resolver: zodResolver(termSchema),
    defaultValues: { name: "", startDate: "", endDate: "" },
  });

  const onProfileSubmit = async (data: any) => {
    await updateProfile(data);
    setStep(2);
  };

  const onSessionSubmit = async (data: any) => {
    await addSession(data);
    setStep(3);
  };

  const onTermSubmit = async (data: any) => {
    await addTerm(data);
    setStep(4);
  };

  const handlePayment = async () => {
    try {
      const paymentData = await initiatePayment();
      const paystack = new Paystack();

      paystack.resumeTransaction(paymentData.access_code, {
        onSuccess: async (response: PaystackPaymentResponse) => {
          await verifyPayment(response.reference);
          // Flow complete, backend should update nextAction to NONE
          window.location.href = "/dashboard";
        },
        onCancel: () => {},
        onError: () => {},
      });
    } catch (error) {}
  };

  if (!isLoaded) return null;

  return (
    <div className="space-y-8">
      {/* Progress Header */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-medium text-muted-foreground uppercase tracking-wider">
          <span>Step {step} of 4</span>
          <span>{Math.round((step / 4) * 100)}% Complete</span>
        </div>
        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500 ease-in-out"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
      </div>

      {step === 1 && (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              Update School Profile
            </h1>
            <p className="text-sm text-muted-foreground">
              Provide your institution's essential details.
            </p>
          </div>
          <Form {...profileForm}>
            <form
              onSubmit={profileForm.handleSubmit(onProfileSubmit)}
              className="space-y-4"
            >
              <FormField
                control={profileForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>School Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="LearNova Academy" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={profileForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Phone *</FormLabel>
                    <FormControl>
                      <Input placeholder="+234 800 000 0000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={profileForm.control}
                name="domainName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="www.school.edu" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={isProfileLoading}
              >
                {isProfileLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save & Continue
              </Button>
            </form>
          </Form>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              Academic Session
            </h1>
            <p className="text-sm text-muted-foreground">
              Define your current academic year.
            </p>
          </div>
          <Form {...sessionForm}>
            <form
              onSubmit={sessionForm.handleSubmit(onSessionSubmit)}
              className="space-y-4"
            >
              <FormField
                control={sessionForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Session Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 2024/2025" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={sessionForm.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={sessionForm.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isSessionLoading}
              >
                {isSessionLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Session
              </Button>
            </form>
          </Form>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              Academic Term
            </h1>
            <p className="text-sm text-muted-foreground">
              Set up the current term in your session.
            </p>
          </div>
          <Form {...termForm}>
            <form
              onSubmit={termForm.handleSubmit(onTermSubmit)}
              className="space-y-4"
            >
              <FormField
                control={termForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Term Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., First Term" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={termForm.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={termForm.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isTermLoading}>
                {isTermLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Term
              </Button>
            </form>
          </Form>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              Account Verification
            </h1>
            <p className="text-sm text-muted-foreground">
              Add a credit card to verify your institution.
            </p>
          </div>
          <div className="rounded-lg border bg-muted/30 p-6 space-y-4 text-center">
            <div className="flex justify-center">
              <CreditCard className="h-12 w-12 text-primary/40" />
            </div>
            <div className="space-y-1">
              <p className="text-lg font-bold text-primary">₦1,000</p>
              <p className="text-xs text-muted-foreground">
                Refundable verification charge
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              We make a small charge to verify your card. This amount will be
              automatically refunded.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center">
            <Shield className="h-4 w-4" />
            <span>Securely processed by Paystack</span>
          </div>
          <Button
            onClick={handlePayment}
            className="w-full gap-2"
            disabled={isPayInitLoading || isPayVerifyLoading}
          >
            {isPayInitLoading || isPayVerifyLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CreditCard className="h-4 w-4" />
            )}
            Proceed to Payment
          </Button>
        </div>
      )}
    </div>
  );
}
