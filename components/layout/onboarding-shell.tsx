"use client";

import type { NextAction, User } from "@/types";
import { AppAuthProvider } from "@/providers/app-auth-provider";
import { OnboardingHeader } from "./onboarding-header";

interface OnboardingShellProps {
  user: User | null;
  permissions?: string[];
  personas?: string[];
  activePersona?: string;
  nextAction?: NextAction;
  onboardingStep?: string;
  children: React.ReactNode;
}

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
        <main className="flex-1 overflow-y-auto flex flex-col items-center justify-center p-4 lg:p-12">
          <div className="w-full h-full max-w-[500px] flex flex-col justify-center gap-8">
            {children}
          </div>
        </main>
      </div>
    </AppAuthProvider>
  );
}
