'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import type { TenantContext, TenantBranding, AcademicConfig } from '@/types'

interface TenantProviderProps {
  children: React.ReactNode
}

const defaultTenant: TenantContext = {
  id: 0,
  tenantId: 0,
  name: 'School Management System',
  slug: '',
  status: 1,
  schoolName: 'School Management System',
  email: null,
  phone: null,
  address: null,
  website: null,
  description: null,
  currentSessionId: null,
  currentTermId: null,
  autoPromoteStudents: false,
  lockPastResults: true,
  primaryColor: '#2563eb', // blue-600
  logoUrl: '/logo.png',
  emailNotificationsEnabled: true,
  smsAlertsEnabled: false,
  inAppNotificationsEnabled: true,
  onboardingStep: 'schoolProfile',
  onboardingCompletedAt: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

const TenantContextValue = createContext<{
  tenant: TenantContext
  setTenant: (tenant: TenantContext) => void
  isLoading: boolean
  isSuperAdmin: boolean
}>({
  tenant: defaultTenant,
  setTenant: () => {},
  isLoading: true,
  isSuperAdmin: false,
})

export function TenantProvider({ children }: TenantProviderProps) {
  const [tenant, setTenant] = useState<TenantContext>(defaultTenant)
  const [isLoading, setIsLoading] = useState(true)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)

  useEffect(() => {
    // Resolve tenant from subdomain
    const hostname = window.location.hostname
    const subdomain = hostname.split('.')[0]

    // Check if this is the super admin domain
    if (subdomain === 'app' || hostname === 'localhost' || hostname === '127.0.0.1') {
      setIsSuperAdmin(subdomain === 'app')
      setIsLoading(false)
      return
    }

    const fetchTenant = async () => {
      try {
        const baseURL = process.env.NEXT_PUBLIC_API_URL ?? '/api/v1';
        // We use a clean axios instance to avoid the default interceptors
        // from axiosClient.ts so unauthenticated users aren't redirected to login
        const axiosInstance = (await import('axios')).default;
        const response = await axiosInstance.get(`${baseURL}/tenant/config`);
        const resultData = response.data?.data || response.data;
        
        const tenantConfig: TenantContext = {
          ...defaultTenant,
          id: resultData.id || 0,
          tenantId: resultData.tenantId || 0,
          name: resultData.name || resultData.schoolName || 'School Management System',
          slug: resultData.domainName || resultData.slug || subdomain,
          status: resultData.tenantStatus ?? resultData.status ?? 1,
          schoolName: resultData.schoolName || resultData.name || 'School Management System',
          description: resultData.description || null,
          primaryColor: resultData.primaryColor || '#2563eb',
          logoUrl: resultData.logoUrl || '/logo.png',
        };

        setTenant(tenantConfig);
        setIsSuperAdmin(false);
      } catch (error) {
        console.error('Failed to fetch tenant configuration:', error);
        
        // Fallback to mock behavior to prevent breaking the app if endpoint is unavailable
        setTenant({
          ...defaultTenant,
          slug: subdomain,
          name: `${subdomain.charAt(0).toUpperCase() + subdomain.slice(1)} International School`,
          schoolName: `${subdomain.charAt(0).toUpperCase() + subdomain.slice(1)} International School`,
        });
        setIsSuperAdmin(false);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTenant()
  }, [])

  // Apply branding CSS variables
  useEffect(() => {
    if (tenant.primaryColor) {
      const root = document.documentElement;
      root.style.setProperty('--tenant-primary', tenant.primaryColor);
      
      // Auto-compute a darker secondary color based on primary
      // For now we just use a generic slightly darker shade or keep it simple
      root.style.setProperty('--tenant-secondary', '#1e40af');
    }
  }, [tenant.primaryColor]);

  return (
    <TenantContextValue.Provider value={{ tenant, setTenant, isLoading, isSuperAdmin }}>
      {children}
    </TenantContextValue.Provider>
  )
}

export function useTenant() {
  const context = useContext(TenantContextValue)
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider')
  }
  return context
}
