"use client";

import React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { TenantSidebar } from "@/components/layout/tenant-sidebar";
import { Topbar } from "@/components/layout/topbar";
import { useAuth } from "@/providers/auth-provider";
import { useTenant } from "@/providers/tenant-provider";
import { Skeleton } from "@/components/ui/skeleton";

export default function TenantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const { isLoading: tenantLoading, isSuperAdmin } = useTenant();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
    // Redirect super admin users to super admin dashboard
    // Check both the domain flag (isSuperAdmin) AND the user role
    const isSuperUser = user?.role === "super-admin";
    if (!authLoading && isAuthenticated && (isSuperAdmin || isSuperUser)) {
      router.push("/super-admin");
    }
  }, [isAuthenticated, authLoading, isSuperAdmin, router, user]);

  // Show loading state
  if (authLoading || tenantLoading) {
    return (
      <div className="flex h-screen">
        <div className="hidden lg:flex w-64 border-r flex-col">
          <div className="h-16 border-b px-4 flex items-center">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-4 w-32 ml-2" />
          </div>
          <div className="p-4 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        </div>
        <div className="flex-1 flex flex-col">
          <div className="h-16 border-b px-4 flex items-center justify-between">
            <Skeleton className="h-8 w-8" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
          <div className="flex-1 p-6">
            <Skeleton className="h-8 w-64 mb-6" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <TenantSidebar isCollapsed={sidebarCollapsed} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-muted/30">
          {children}
        </main>
      </div>
    </div>
  );
}
