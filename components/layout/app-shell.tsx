"use client";

import { useState, useEffect } from "react";
import type { NextAction, TenantContext, User } from "@/types";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Topbar } from "@/components/layout/topbar";
import { AppAuthProvider, useTenant } from "@/providers";

interface AppShellProps {
  user: User | null;
  permissions?: string[];
  personas?: string[];
  activePersona?: string;
  nextAction?: NextAction;
  children: React.ReactNode;
  tenant?: TenantContext;
}

export function AppShell({
  user,
  permissions,
  personas,
  activePersona,
  nextAction,
  children,
  tenant,
}: AppShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const resolvedPermissions = permissions ?? user?.permissions ?? [];
  const { setTenant } = useTenant();

  useEffect(() => {
    if (tenant) {
      setTenant(tenant);
    }
  }, [tenant, setTenant]);

  return (
    <AppAuthProvider
      value={{
        user,
        permissions: resolvedPermissions,
        personas,
        activePersona,
        nextAction,
      }}
    >
      <div className="flex h-screen overflow-hidden">
        <AppSidebar isCollapsed={sidebarCollapsed} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Topbar
            onToggleSidebar={() => setSidebarCollapsed((prev) => !prev)}
          />
          <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-muted/30">
            {children}
          </main>
        </div>
      </div>
    </AppAuthProvider>
  );
}
