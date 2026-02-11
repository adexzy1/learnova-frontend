"use client";

import { useState } from "react";
import type { User } from "@/types";
import { TenantAuthProvider } from "@/providers/tenant-auth-provider";
import { TenantSidebar } from "@/components/layout/tenant-sidebar";
import { Topbar } from "@/components/layout/topbar";

interface TenantShellProps {
  user: User | null;
  permissions?: string[];
  children: React.ReactNode;
}

export function TenantShell({ user, permissions, children }: TenantShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const resolvedPermissions = permissions ?? user?.permissions ?? [];

  return (
    <TenantAuthProvider value={{ user, permissions: resolvedPermissions }}>
      <div className="flex h-screen overflow-hidden">
        <TenantSidebar isCollapsed={sidebarCollapsed} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Topbar
            onToggleSidebar={() => setSidebarCollapsed((prev) => !prev)}
          />
          <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-muted/30">
            {children}
          </main>
        </div>
      </div>
    </TenantAuthProvider>
  );
}
