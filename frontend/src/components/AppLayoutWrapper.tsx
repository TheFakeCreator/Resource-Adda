"use client";

import { usePathname, useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAuthStore } from "@/store/useAuthStore";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

const PUBLIC_PATHS = ["/", "/login", "/register", "/setup"];

export function AppLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  const isAdminRoute = pathname?.startsWith("/admin");
  const isAuthRoute =
    pathname?.startsWith("/login") ||
    pathname?.startsWith("/register") ||
    pathname?.startsWith("/setup");
  const isPublicRoute = PUBLIC_PATHS.includes(pathname || "");

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isPublicRoute && !isAuthRoute) {
      const redirectUrl = encodeURIComponent(pathname || "/");
      router.push(`/login?redirect=${redirectUrl}`);
    }
  }, [
    isLoading,
    isAuthenticated,
    isPublicRoute,
    isAuthRoute,
    router,
    pathname,
  ]);

  // Show a full screen loader while checking authentication so no "glimpses" occur
  if (isLoading && !isPublicRoute && !isAuthRoute) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  // Prevent rendering if about to redirect
  if (!isLoading && !isAuthenticated && !isPublicRoute && !isAuthRoute) {
    return null;
  }

  if (isAdminRoute || isAuthRoute) {
    return <main className="flex-1 flex flex-col">{children}</main>;
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col">{children}</main>
      <Footer />
    </>
  );
}
