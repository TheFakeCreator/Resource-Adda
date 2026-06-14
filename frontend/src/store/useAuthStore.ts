import { create } from "zustand";
import api from "@/lib/api";

export interface User {
  id: string;
  _id?: string;
  email: string;
  role: "super_admin" | "admin" | "student";
  name?: string;
  avatarUrl?: string;
  isVerified: boolean;
  contributionPoints?: number;
  badges?: string[];
  branch?: string;
  semester?: number;
  bio?: string;
  rollNumber?: string;
  section?: string;
  graduationYear?: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  login: (token, user) => {
    localStorage.setItem("token", token);
    set({ user, token, isAuthenticated: true, isLoading: false });
  },
  logout: () => {
    localStorage.removeItem("token");
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
  },
  checkAuth: async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      set({ isLoading: false });
      return;
    }

    try {
      const response = await api.get("/auth/me");
      set({
        user: response.data,
        token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      localStorage.removeItem("token");
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },
}));
