"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TenantSidebar } from "@/components/layout/tenant-sidebar";
import { Topbar } from "@/components/layout/topbar";
import { superAdminNavigation } from "@/lib/navigation";
import { useAuth } from "@/providers/auth-provider";

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isLoading && isMounted) {
      if (!isAuthenticated) {
        router.push("/login");
      } else if (user?.role !== "super-admin") {
        router.push("/dashboard");
      }
    }
  }, [isLoading, isAuthenticated, user, router, isMounted]);

  if (!isMounted || isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "super-admin") {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <TenantSidebar
        navigation={superAdminNavigation}
        tenantName="System Admin"
        userName="Super User"
        isCollapsed={sidebarCollapsed}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 bg-muted/30">
          {children}
        </main>
      </div>
    </div>
  );
}
