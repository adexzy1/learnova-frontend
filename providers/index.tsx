'use client'

import React from "react"

import { TenantProvider } from './tenant-provider'
import { AuthProvider } from './auth-provider'
import { QueryProvider } from './query-provider'
import { Toaster } from 'sonner'

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryProvider>
      <TenantProvider>
        <AuthProvider>
          {children}
          <Toaster position="top-right" richColors closeButton />
        </AuthProvider>
      </TenantProvider>
    </QueryProvider>
  )
}

export { TenantProvider, useTenant } from './tenant-provider'
export { AuthProvider, useAuth } from './auth-provider'
export { QueryProvider } from './query-provider'
