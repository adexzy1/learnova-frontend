import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, AuthState } from '@/types'

interface AuthStore extends AuthState {
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  logout: () => void
  hasPermission: (permission: string) => boolean
  hasAnyPermission: (permissions: string[]) => boolean
  hasAllPermissions: (permissions: string[]) => boolean
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,

      setUser: (user) => 
        set({ 
          user, 
          isAuthenticated: !!user,
          isLoading: false 
        }),

      setLoading: (isLoading) => 
        set({ isLoading }),

      logout: () => 
        set({ 
          user: null, 
          isAuthenticated: false,
          isLoading: false 
        }),

      hasPermission: (permission) => {
        const { user } = get()
        if (!user) return false
        return user.permissions.includes(permission)
      },

      hasAnyPermission: (permissions) => {
        const { user } = get()
        if (!user) return false
        return permissions.some(p => user.permissions.includes(p))
      },

      hasAllPermissions: (permissions) => {
        const { user } = get()
        if (!user) return false
        return permissions.every(p => user.permissions.includes(p))
      },
    }),
    {
      name: 'sms-auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
)
