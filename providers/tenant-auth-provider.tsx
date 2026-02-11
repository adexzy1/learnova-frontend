"use client";

import { createContext, useCallback, useContext, useMemo } from "react";
import type { User } from "@/types";

export interface AuthValue {
  user: User | null;
  permissions: string[];
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
}

type TenantAuthInput = {
  user: User | null;
  permissions?: string[];
};

const AuthContext = createContext<AuthValue | null>(null);

export function TenantAuthProvider({
  value,
  children,
}: {
  value: TenantAuthInput;
  children: React.ReactNode;
}) {
  const resolvedPermissions = value.permissions ?? value.user?.permissions ?? [];

  const hasPermission = useCallback(
    (permission: string) => resolvedPermissions.includes(permission),
    [resolvedPermissions],
  );

  const hasAnyPermission = useCallback(
    (permissions: string[]) =>
      permissions.some((permission) => resolvedPermissions.includes(permission)),
    [resolvedPermissions],
  );

  const hasAllPermissions = useCallback(
    (permissions: string[]) =>
      permissions.every((permission) => resolvedPermissions.includes(permission)),
    [resolvedPermissions],
  );

  const ctx = useMemo(
    () => ({
      user: value.user,
      permissions: resolvedPermissions,
      hasPermission,
      hasAnyPermission,
      hasAllPermissions,
    }),
    [
      value.user,
      resolvedPermissions,
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
    throw new Error("useAuth must be used inside tenant layout");
  }
  return ctx;
}
