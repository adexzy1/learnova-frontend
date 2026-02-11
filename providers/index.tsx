"use client";

import React from "react";

import { TenantProvider } from "./tenant-provider";
import { QueryProvider } from "./query-provider";
import { Toaster } from "sonner";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryProvider>
      <TenantProvider>
        {children}
        <Toaster position="bottom-right" />
      </TenantProvider>
    </QueryProvider>
  );
}

export { TenantProvider, useTenant } from "./tenant-provider";
export { AuthProvider, useAuth } from "./auth-provider";
export { QueryProvider } from "./query-provider";
