"use client";

import { createContext, useCallback, useContext, useMemo } from "react";
import type { NextAction, User } from "@/types";

export interface AuthValue {
  user: User | null;
  permissions: string[];
  personas?: string[];
  activePersona?: string;
  nextAction?: NextAction;
  onboardingStep?: string;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
}

type AppAuthInput = {
  user: User | null;
  permissions?: string[];
  personas?: string[];
  activePersona?: string;
  nextAction?: NextAction;
  onboardingStep?: string;
};

const AuthContext = createContext<AuthValue | null>(null);

export function AppAuthProvider({
  value,
  children,
}: {
  value: AppAuthInput;
  children: React.ReactNode;
}) {
  const resolvedPermissions =
    value.permissions ?? value.user?.permissions ?? [];

  const hasPermission = useCallback(
    (permission: string) => resolvedPermissions.includes(permission),
    [resolvedPermissions],
  );

  const hasAnyPermission = useCallback(
    (permissions: string[]) =>
      permissions.some((permission) =>
        resolvedPermissions.includes(permission),
      ),
    [resolvedPermissions],
  );

  const hasAllPermissions = useCallback(
    (permissions: string[]) =>
      permissions.every((permission) =>
        resolvedPermissions.includes(permission),
      ),
    [resolvedPermissions],
  );

  const ctx = useMemo(
    () => ({
      user: value.user,
      permissions: resolvedPermissions,
      personas: value.personas,
      activePersona: value.activePersona,
      nextAction: value.nextAction,
      onboardingStep: value.onboardingStep,
      hasPermission,
      hasAnyPermission,
      hasAllPermissions,
    }),
    [
      value.user,
      resolvedPermissions,
      value.personas,
      value.activePersona,
      value.nextAction,
      value.onboardingStep,
      hasPermission,
      hasAnyPermission,
      hasAllPermissions,
    ],
  );

  return <AuthContext.Provider value={ctx}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside app layout");
  }
  return ctx;
}
