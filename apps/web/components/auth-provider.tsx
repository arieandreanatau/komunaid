"use client";

import { createContext, useContext, useEffect, useCallback, useRef } from "react";
import { api } from "@/lib/api";
import { useAuthStore, type User } from "@/lib/auth";
import { useQueryClient } from "@tanstack/react-query";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading, setUser, setLoading } = useAuthStore();
  const queryClient = useQueryClient();
  const loginTimestampRef = useRef<number>(0);

  const fetchUser = useCallback(async () => {
    if (loginTimestampRef.current && Date.now() - loginTimestampRef.current < 5000) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get("/auth/me");
      if (loginTimestampRef.current && Date.now() - loginTimestampRef.current < 5000) {
        setLoading(false);
        return;
      }
      setUser(data.data?.user || data.user);
    } catch {
      if (!loginTimestampRef.current || Date.now() - loginTimestampRef.current >= 5000) {
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, [setUser, setLoading]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const setUserSafe = useCallback((u: User | null) => {
    if (user?.id && user.id !== u?.id) {
      queryClient.clear();
    }
    if (u) {
      loginTimestampRef.current = Date.now();
    } else {
      loginTimestampRef.current = 0;
    }
    setUser(u);
  }, [queryClient, setUser, user?.id]);

  const logout = useCallback(async () => {
    loginTimestampRef.current = 0;
    try {
      await api.post("/auth/logout");
    } catch {
      // Logout even if API call fails
    } finally {
      queryClient.clear();
      setUser(null);
    }
  }, [queryClient, setUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        setUser: setUserSafe,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
