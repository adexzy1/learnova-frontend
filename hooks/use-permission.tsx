'use client'

import React from "react"

import { useAuth } from '@/providers/auth-provider'

/**
 * Hook to check user permissions
 * Returns utility functions for permission checking
 */
export function usePermission() {
  const { hasPermission, hasAnyPermission, hasAllPermissions, user } = useAuth()

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
    canViewDashboard: () => hasPermission('dashboard.view'),
    canManageStudents: () => hasAnyPermission(['students.create', 'students.edit', 'students.delete']),
    canViewStudents: () => hasPermission('students.view'),
    canManageStaff: () => hasAnyPermission(['staff.create', 'staff.edit']),
    canViewStaff: () => hasPermission('staff.view'),
    canManageAcademics: () => hasPermission('academics.manage'),
    canViewAcademics: () => hasPermission('academics.view'),
    canManageAssessments: () => hasPermission('assessments.manage'),
    canViewAssessments: () => hasPermission('assessments.view'),
    canPublishResults: () => hasPermission('results.publish'),
    canViewResults: () => hasPermission('results.view'),
    canManageFinance: () => hasPermission('finance.manage'),
    canViewFinance: () => hasPermission('finance.view'),
    canManageAttendance: () => hasPermission('attendance.manage'),
    canViewAttendance: () => hasPermission('attendance.view'),
    canSendCommunications: () => hasPermission('communications.send'),
    canViewCommunications: () => hasPermission('communications.view'),
    canExportReports: () => hasPermission('reports.export'),
    canViewReports: () => hasPermission('reports.view'),
    canManageSettings: () => hasPermission('settings.manage'),
    canViewSettings: () => hasPermission('settings.view'),
    
    // Super admin permissions
    canManageTenants: () => hasPermission('tenants.create'),
    canViewTenants: () => hasPermission('tenants.view'),
    canManageSystem: () => hasPermission('system.manage'),
    canViewAudit: () => hasPermission('audit.view'),
  }
}

/**
 * Component wrapper that renders children only if user has permission
 */
interface PermissionGateProps {
  permission: string | string[]
  mode?: 'any' | 'all'
  fallback?: React.ReactNode
  children: React.ReactNode
}

export function PermissionGate({ 
  permission, 
  mode = 'any', 
  fallback = null, 
  children 
}: PermissionGateProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = useAuth()

  const hasAccess = Array.isArray(permission)
    ? mode === 'all' 
      ? hasAllPermissions(permission)
      : hasAnyPermission(permission)
    : hasPermission(permission)

  if (!hasAccess) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
