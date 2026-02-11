"use client";

import React from "react";

import { useAuth } from "@/providers/tenant-auth-provider";
import { PERMISSIONS } from "@/app/constants/permissions";

/**
 * Hook to check user permissions
 * Returns utility functions for permission checking
 */
export function usePermission() {
  const { hasPermission, hasAnyPermission, hasAllPermissions, user } =
    useAuth();

  return {
    // Check single permission
    can: hasPermission,

    // Check if user has any of the provided permissions
    canAny: hasAnyPermission,

    // Check if user has all of the provided permissions
    canAll: hasAllPermissions,

    // Get user role
    role: user?.role,

    // Check if user is a specific role
    isRole: (role: string) => user?.role === role,

    // Permission shortcuts
    canViewDashboard: () =>
      hasAnyPermission([
        PERMISSIONS.PORTAL_STAFF,
        PERMISSIONS.PORTAL_STUDENT,
        PERMISSIONS.PORTAL_GUARDIAN,
      ]),
    canManageStudents: () => hasPermission(PERMISSIONS.ACADEMIC_MANAGE),
    canViewStudents: () => hasPermission(PERMISSIONS.ACADEMIC_VIEW),
    canManageStaff: () => hasPermission(PERMISSIONS.IDENTITY_MANAGE),
    canViewStaff: () => hasPermission(PERMISSIONS.IDENTITY_MANAGE),
    canManageAcademics: () => hasPermission(PERMISSIONS.ACADEMIC_MANAGE),
    canViewAcademics: () => hasPermission(PERMISSIONS.ACADEMIC_VIEW),
    canManageAssessments: () => hasPermission(PERMISSIONS.ACADEMIC_MANAGE),
    canViewAssessments: () => hasPermission(PERMISSIONS.ACADEMIC_VIEW),
    canPublishResults: () => hasPermission(PERMISSIONS.ACADEMIC_MANAGE),
    canViewResults: () =>
      hasAnyPermission([
        PERMISSIONS.ACADEMIC_VIEW,
        PERMISSIONS.PORTAL_STUDENT,
        PERMISSIONS.PORTAL_GUARDIAN,
      ]),
    canManageFinance: () => hasPermission(PERMISSIONS.FINANCE_MANAGE),
    canViewFinance: () =>
      hasAnyPermission([PERMISSIONS.FINANCE_VIEW, PERMISSIONS.PORTAL_GUARDIAN]),
    canManageAttendance: () => hasPermission(PERMISSIONS.ACADEMIC_MANAGE),
    canViewAttendance: () =>
      hasAnyPermission([
        PERMISSIONS.ACADEMIC_VIEW,
        PERMISSIONS.PORTAL_STUDENT,
        PERMISSIONS.PORTAL_GUARDIAN,
      ]),
    canSendCommunications: () => hasPermission(PERMISSIONS.COMMUNICATION_SEND),
    canViewCommunications: () =>
      hasAnyPermission([
        PERMISSIONS.COMMUNICATION_SEND,
        PERMISSIONS.PORTAL_GUARDIAN,
      ]),
    canExportReports: () => hasPermission(PERMISSIONS.ACADEMIC_VIEW),
    canViewReports: () => hasPermission(PERMISSIONS.ACADEMIC_VIEW),
    canManageSettings: () => hasPermission(PERMISSIONS.SYSTEM_SETTINGS),
    canViewSettings: () => hasPermission(PERMISSIONS.SYSTEM_SETTINGS),

    // Super admin permissions (mapped to system settings in new schema)
    canManageTenants: () => hasPermission(PERMISSIONS.SYSTEM_SETTINGS),
    canViewTenants: () => hasPermission(PERMISSIONS.SYSTEM_SETTINGS),
    canManageSystem: () => hasPermission(PERMISSIONS.SYSTEM_SETTINGS),
    canViewAudit: () => hasPermission(PERMISSIONS.SYSTEM_SETTINGS),
  };
}

/**
 * Component wrapper that renders children only if user has permission
 */
interface PermissionGateProps {
  permission: string | string[];
  mode?: "any" | "all";
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function PermissionGate({
  permission,
  mode = "any",
  fallback = null,
  children,
}: PermissionGateProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = useAuth();

  const hasAccess = Array.isArray(permission)
    ? mode === "all"
      ? hasAllPermissions(permission)
      : hasAnyPermission(permission)
    : hasPermission(permission);

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
