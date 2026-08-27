import { create } from "zustand";

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar?: string | null;
  phone?: string | null;
  bio?: string | null;
  location?: string | null;
  isProfilePublic?: boolean;
  roles: string[];
  interests?: string[];
  communitiesCount?: number;
  organizationsCount?: number;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  updateUser: (data: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  setUser: (user) => {
    set({ user, isAuthenticated: !!user, isLoading: false });
  },
  setLoading: (loading) => {
    set({ isLoading: loading });
  },
  updateUser: (data) => {
    set((state) => {
      if (!state.user) return state;
      return { user: { ...state.user, ...data } };
    });
  },
}));
