"use client";

import type { NextAction, User } from "@/types";
import { AppAuthProvider } from "@/providers/app-auth-provider";
import { OnboardingHeader } from "./onboarding-header";
import {
  Building2,
  Calendar,
  Layers,
  GraduationCap,
  CreditCard,
  Check,
} from "lucide-react";

interface OnboardingShellProps {
  user: User | null;
  permissions?: string[];
  personas?: string[];
  activePersona?: string;
  nextAction?: NextAction;
  onboardingStep?: string;
  children: React.ReactNode;
}

const ONBOARDING_STEPS = [
  {
    key: "schoolProfile",
    label: "School Profile",
    description: "Complete your institution details",
    icon: Building2,
  },
  {
    key: "session",
    label: "Session & Term",
    description: "Set up your academic calendar",
    icon: Calendar,
  },
  {
    key: "classStructure",
    label: "Class Structure",
    description: "Define class levels and arms",
    icon: Layers,
  },
  {
    key: "gradingSystem",
    label: "Grading System",
    description: "Configure your grading scale",
    icon: GraduationCap,
  },
  {
    key: "payment",
    label: "Subscription",
    description: "Verify your billing details",
    icon: CreditCard,
  },
];

const STEP_ORDER: Record<string, number> = {
  schoolProfile: 1,
  session: 2,
  classStructure: 3,
  gradingSystem: 4,
  payment: 5,
};

export function OnboardingShell({
  user,
  permissions,
  personas,
  activePersona,
  nextAction,
  onboardingStep,
  children,
}: OnboardingShellProps) {
  const resolvedPermissions = permissions ?? user?.permissions ?? [];

  // Determine current step from onboardingStep string
  const currentStepNum = STEP_ORDER[onboardingStep || "schoolProfile"] || 1;

  // If nextAction is CHANGE_PASSWORD, we're on the password page — don't show stepper
  const isPasswordStep = nextAction === "CHANGE_PASSWORD";

  return (
    <AppAuthProvider
      value={{
        user,
        permissions: resolvedPermissions,
        personas,
        activePersona,
        nextAction,
        onboardingStep,
      }}
    >
      <div className="flex flex-col h-screen overflow-hidden bg-muted/30">
        <OnboardingHeader />
        <main className="flex-1 overflow-y-auto">
          {isPasswordStep ? (
            /* Password change — simple centered layout */
            <div className="flex flex-col items-center justify-center min-h-full p-4 lg:p-12">
              <div className="w-full max-w-[500px] flex flex-col justify-center gap-8">
                {children}
              </div>
            </div>
          ) : (
            /* Multi-step onboarding — two-column layout */
            <div className="flex flex-col lg:flex-row min-h-full">
              {/* Sidebar stepper — desktop */}
              <aside className="hidden lg:flex flex-col w-80 border-r bg-background p-8 gap-2">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold">Setup Your School</h2>
                  <p className="text-sm text-muted-foreground">
                    Complete these steps to get started
                  </p>
                </div>
                <nav className="flex flex-col gap-1">
                  {ONBOARDING_STEPS.map((step, idx) => {
                    const stepNum = idx + 1;
                    const isCompleted = stepNum < currentStepNum;
                    const isActive = stepNum === currentStepNum;
                    const Icon = step.icon;

                    return (
                      <div key={step.key} className="flex items-start gap-3">
                        {/* Step line + indicator */}
                        <div className="flex flex-col items-center">
                          <div
                            className={`
                              flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300
                              ${
                                isCompleted
                                  ? "border-emerald-500 bg-emerald-500 text-white"
                                  : isActive
                                    ? "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/25"
                                    : "border-muted-foreground/25 bg-muted text-muted-foreground/50"
                              }
                            `}
                          >
                            {isCompleted ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Icon className="h-4 w-4" />
                            )}
                          </div>
                          {/* Connector line */}
                          {idx < ONBOARDING_STEPS.length - 1 && (
                            <div
                              className={`w-0.5 h-8 mt-1 transition-colors duration-300 ${
                                isCompleted
                                  ? "bg-emerald-500"
                                  : "bg-muted-foreground/15"
                              }`}
                            />
                          )}
                        </div>
                        {/* Step text */}
                        <div className="pt-1.5 pb-5">
                          <p
                            className={`text-sm font-medium leading-none transition-colors ${
                              isActive
                                ? "text-foreground"
                                : isCompleted
                                  ? "text-muted-foreground"
                                  : "text-muted-foreground/50"
                            }`}
                          >
                            {step.label}
                          </p>
                          <p
                            className={`text-xs mt-1 transition-colors ${
                              isActive
                                ? "text-muted-foreground"
                                : "text-muted-foreground/40"
                            }`}
                          >
                            {step.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </nav>
              </aside>

              {/* Mobile stepper — compact horizontal progress */}
              <div className="lg:hidden border-b bg-background px-4 py-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Step {currentStepNum} of {ONBOARDING_STEPS.length}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">
                    {Math.round(
                      (currentStepNum / ONBOARDING_STEPS.length) * 100,
                    )}
                    %
                  </span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-500 ease-in-out rounded-full"
                    style={{
                      width: `${(currentStepNum / ONBOARDING_STEPS.length) * 100}%`,
                    }}
                  />
                </div>
                <p className="text-sm font-medium mt-2">
                  {ONBOARDING_STEPS[currentStepNum - 1]?.label}
                </p>
              </div>

              {/* Right column — form content */}
              <div className="flex-1 overflow-y-auto p-6 lg:p-12">
                <div className="w-full max-w-2xl mx-auto">{children}</div>
              </div>
            </div>
          )}
        </main>
      </div>
    </AppAuthProvider>
  );
}
