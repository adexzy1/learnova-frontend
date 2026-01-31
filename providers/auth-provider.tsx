'use client'

import React, { createContext, useContext, useEffect } from 'react'
import { useAuthStore } from '@/lib/stores/auth-store'
import type { User } from '@/types'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  hasPermission: (permission: string) => boolean
  hasAnyPermission: (permissions: string[]) => boolean
  hasAllPermissions: (permissions: string[]) => boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { 
    user, 
    isAuthenticated, 
    isLoading,
    setUser, 
    setLoading,
    logout: clearAuth,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  } = useAuthStore()

  useEffect(() => {
    // Check for existing session on mount
    const checkSession = async () => {
      try {
        // Mock session check - in production this would be:
        // const response = await fetch('/api/auth/session')
        // const data = await response.json()
        
        // For demo, we'll simulate checking a session
        const storedUser = localStorage.getItem('sms-auth-storage')
        if (storedUser) {
          const parsed = JSON.parse(storedUser)
          if (parsed.state?.user) {
            setUser(parsed.state.user)
          } else {
            setLoading(false)
          }
        } else {
          setLoading(false)
        }
      } catch {
        setLoading(false)
      }
    }

    checkSession()
  }, [setUser, setLoading])

  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      // Mock API call - in production this would be:
      // const response = await fetch('/api/auth/login', {
      //   method: 'POST',
      //   body: JSON.stringify({ email, password }),
      // })
      // const data = await response.json()
      
      // Mock response based on email for demo purposes
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Simulate different users based on email
      let mockUser: User
      
      if (email.includes('admin')) {
        mockUser = {
          id: 'user-1',
          email,
          firstName: 'Admin',
          lastName: 'User',
          role: 'school-admin',
          permissions: [
            'dashboard.view',
            'students.view', 'students.create', 'students.edit', 'students.delete',
            'staff.view', 'staff.create', 'staff.edit',
            'academics.view', 'academics.manage',
            'assessments.view', 'assessments.manage',
            'results.view', 'results.publish',
            'finance.view', 'finance.manage',
            'attendance.view', 'attendance.manage',
            'communications.view', 'communications.send',
            'reports.view', 'reports.export',
            'settings.view', 'settings.manage',
          ],
        }
      } else if (email.includes('teacher')) {
        mockUser = {
          id: 'user-2',
          email,
          firstName: 'Teacher',
          lastName: 'User',
          role: 'teacher',
          permissions: [
            'dashboard.view',
            'students.view',
            'assessments.view', 'assessments.manage',
            'results.view',
            'attendance.view', 'attendance.manage',
            'communications.view', 'communications.send',
          ],
        }
      } else if (email.includes('parent')) {
        mockUser = {
          id: 'user-3',
          email,
          firstName: 'Parent',
          lastName: 'User',
          role: 'parent',
          permissions: [
            'dashboard.view',
            'children.view',
            'results.view',
            'attendance.view',
            'finance.view',
            'communications.view',
          ],
        }
      } else if (email.includes('student')) {
        mockUser = {
          id: 'user-4',
          email,
          firstName: 'Student',
          lastName: 'User',
          role: 'student',
          permissions: [
            'dashboard.view',
            'results.view',
            'attendance.view',
            'exams.take',
          ],
        }
      } else if (email.includes('super')) {
        mockUser = {
          id: 'user-5',
          email,
          firstName: 'Super',
          lastName: 'Admin',
          role: 'super-admin',
          permissions: [
            'tenants.view', 'tenants.create', 'tenants.edit', 'tenants.delete',
            'system.view', 'system.manage',
            'audit.view',
          ],
        }
      } else {
        // Default to school admin for demo
        mockUser = {
          id: 'user-1',
          email,
          firstName: 'Demo',
          lastName: 'User',
          role: 'school-admin',
          permissions: [
            'dashboard.view',
            'students.view', 'students.create', 'students.edit', 'students.delete',
            'staff.view', 'staff.create', 'staff.edit',
            'academics.view', 'academics.manage',
            'assessments.view', 'assessments.manage',
            'results.view', 'results.publish',
            'finance.view', 'finance.manage',
            'attendance.view', 'attendance.manage',
            'communications.view', 'communications.send',
            'reports.view', 'reports.export',
            'settings.view', 'settings.manage',
          ],
        }
      }

      setUser(mockUser)
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  const logout = async () => {
    try {
      // Mock API call - in production this would be:
      // await fetch('/api/auth/logout', { method: 'POST' })
      clearAuth()
    } catch (error) {
      console.error('Logout failed:', error)
      clearAuth()
    }
  }

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated, 
        isLoading, 
        login, 
        logout, 
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
