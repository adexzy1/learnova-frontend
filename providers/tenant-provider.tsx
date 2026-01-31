'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import type { TenantContext, TenantBranding, AcademicConfig } from '@/types'

interface TenantProviderProps {
  children: React.ReactNode
}

const defaultBranding: TenantBranding = {
  logo: '/logo.png',
  primaryColor: '#2563eb', // blue-600
  secondaryColor: '#1e40af', // blue-800
}

const defaultAcademicConfig: AcademicConfig = {
  currentSessionId: '',
  currentTermId: '',
  gradingSystem: 'default',
  attendanceType: 'daily',
  promotionRules: {},
}

const defaultTenant: TenantContext = {
  tenantId: '',
  tenantSlug: '',
  schoolName: 'School Management System',
  branding: defaultBranding,
  academicConfig: defaultAcademicConfig,
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

    // Simulate API call to fetch tenant configuration
    const fetchTenant = async () => {
      try {
        // Mock API call - in production this would be:
        // const response = await fetch(`/api/tenant/${subdomain}`)
        // const data = await response.json()
        
        // Mock tenant data based on subdomain
        const mockTenant: TenantContext = {
          tenantId: `tenant-${subdomain}`,
          tenantSlug: subdomain,
          schoolName: `${subdomain.charAt(0).toUpperCase() + subdomain.slice(1)} International School`,
          branding: {
            logo: '/logo.png',
            primaryColor: '#2563eb',
            secondaryColor: '#1e40af',
          },
          academicConfig: {
            currentSessionId: 'session-2024-2025',
            currentTermId: 'term-1',
            gradingSystem: 'default',
            attendanceType: 'daily',
            promotionRules: {},
          },
        }

        setTenant(mockTenant)
        setIsSuperAdmin(false)
      } catch (error) {
        console.error('Failed to fetch tenant:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTenant()
  }, [])

  // Apply branding CSS variables
  useEffect(() => {
    if (tenant.branding) {
      const root = document.documentElement
      root.style.setProperty('--tenant-primary', tenant.branding.primaryColor)
      root.style.setProperty('--tenant-secondary', tenant.branding.secondaryColor)
    }
  }, [tenant.branding])

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
