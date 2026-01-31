import { create } from 'zustand'

interface UIStore {
  sidebarOpen: boolean
  sidebarCollapsed: boolean
  mobileMenuOpen: boolean
  
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  toggleSidebarCollapsed: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setMobileMenuOpen: (open: boolean) => void
  toggleMobileMenu: () => void
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: true,
  sidebarCollapsed: false,
  mobileMenuOpen: false,

  toggleSidebar: () => 
    set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  
  setSidebarOpen: (sidebarOpen) => 
    set({ sidebarOpen }),

  toggleSidebarCollapsed: () => 
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  setSidebarCollapsed: (sidebarCollapsed) => 
    set({ sidebarCollapsed }),

  setMobileMenuOpen: (mobileMenuOpen) => 
    set({ mobileMenuOpen }),

  toggleMobileMenu: () => 
    set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen })),
}))
