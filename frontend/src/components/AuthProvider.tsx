"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useConfigStore } from "@/store/useConfigStore";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { checkAuth } = useAuthStore();
  const { fetchConfig } = useConfigStore();

  useEffect(() => {
    checkAuth();
    fetchConfig();
  }, [checkAuth, fetchConfig]);

  return <>{children}</>;
}
