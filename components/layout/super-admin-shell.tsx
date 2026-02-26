"use client";
import { TenantAuthProvider } from "@/providers/tenant-auth-provider";
import { useState } from "react";
import { TenantSidebar } from "./tenant-sidebar";
import { Topbar } from "./topbar";
import { User } from "@/types";
import { superAdminNavigation } from "@/lib/navigation";

interface TenantShellProps {
  user: User | null;
  permissions?: string[];
  children: React.ReactNode;
}

const SuperAdminShell = ({ user, permissions, children }: TenantShellProps) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const resolvedPermissions = permissions ?? user?.permissions ?? [];

  return (
    <TenantAuthProvider value={{ user, permissions: resolvedPermissions }}>
      <div className="flex h-screen overflow-hidden">
        <TenantSidebar
          isCollapsed={sidebarCollapsed}
          navigation={superAdminNavigation}
        />
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
};

export default SuperAdminShell;
