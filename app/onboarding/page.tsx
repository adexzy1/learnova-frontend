"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/providers/app-auth-provider";
import SchoolProfile from "./_components/school-profile";
import AcademicSession from "./_components/academic-session";
import ClassStructure from "./_components/class-structure";
import GradingSystem from "./_components/grading-system";
import Payment from "./_components/payment";
import Complete from "./_components/onboarding-complete";

// ─── Step map ───────────────────────────────────────────────────────

const STEP_MAP: Record<string, number> = {
  schoolProfile: 1,
  session: 2,
  classStructure: 3,
  gradingSystem: 4,
  paymentMethod: 5,
  complete: 6,
};

// ─── Step Header Component ──────────────────────────────────────────

export function StepHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-2 mb-8">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────

export default function OnboardingPage() {
  const { onboardingStep } = useAuth();
  const [step, setStep] = useState(1);
  const [isLoaded, setIsLoaded] = useState(false);

  // ─── Sync step from server on mount ─────────────────────────────
  useEffect(() => {
    const serverStepStr = onboardingStep || "schoolProfile";
    const serverStep = STEP_MAP[serverStepStr] || 1;
    const localStep = sessionStorage.getItem("onboarding_step");

    const initialStep = Math.max(
      serverStep,
      localStep ? parseInt(localStep) : 1,
    );
    setStep(initialStep);
    setIsLoaded(true);
  }, [onboardingStep]);

  useEffect(() => {
    if (isLoaded) {
      sessionStorage.setItem("onboarding_step", step.toString());
    }
  }, [step, isLoaded]);

  const goBack = () => {
    if (step > 1) setStep(step - 1);
  };

  if (!isLoaded) return null;

  return (
    <div className="space-y-6">
      {step === 1 && <SchoolProfile setStep={setStep} />}
      {step === 2 && <AcademicSession goBack={goBack} setStep={setStep} />}
      {step === 3 && <ClassStructure goBack={goBack} setStep={setStep} />}
      {step === 4 && <GradingSystem goBack={goBack} setStep={setStep} />}
      {step === 5 && <Payment goBack={goBack} setStep={setStep} />}
      {step === 6 && <Complete />}
    </div>
  );
}
