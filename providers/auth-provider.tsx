"use client";

import React, { createContext, useContext, useEffect } from "react";
import { useAuthStore } from "@/lib/stores/auth-store";
import type { User } from "@/types";
import axiosClient from "@/lib/axios-client";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: React.ReactNode;
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
  } = useAuthStore();

  const router = useRouter();

  useEffect(() => {
    // Check for existing session on mount
    const checkSession = async () => {
      try {
        // Mock session check - in production this would be:
        // const response = await fetch('/api/auth/session')
        // const data = await response.json()

        // For demo, we'll simulate checking a session
        const storedUser = localStorage.getItem("sms-auth-storage");
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          if (parsed.state?.user) {
            setUser(parsed.state.user);
          } else {
            setLoading(false);
          }
        } else {
          setLoading(false);
        }
      } catch {
        setLoading(false);
      }
    };

    // checkSession();
  }, [setUser, setLoading]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      await axiosClient.post("/auth/login", { email, password });
      router.push("/dashboard");
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Mock API call - in production this would be:
      // await fetch('/api/auth/logout', { method: 'POST' })
      await axiosClient.post("/auth/logout");
      clearAuth();
    } catch (error) {
      console.error("Logout failed:", error);
      clearAuth();
    }
  };

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
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
