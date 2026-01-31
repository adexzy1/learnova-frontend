'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

import { useAuth } from '@/providers/auth-provider'
import { useTenant } from '@/providers/tenant-provider'

export default function HomePage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading, user } = useAuth()
  const { isSuperAdmin, isLoading: tenantLoading } = useTenant()

  useEffect(() => {
    if (authLoading || tenantLoading) return

    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    // Route based on user role and domain
    if (isSuperAdmin) {
      router.push('/super-admin')
    } else if (user?.role === 'parent') {
      router.push('/parent')
    } else if (user?.role === 'student') {
      router.push('/student')
    } else {
      router.push('/dashboard')
    }
  }, [isAuthenticated, authLoading, tenantLoading, isSuperAdmin, user, router])

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}
