"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import {
  Settings,
  FileText,
  LayoutDashboard,
  Loader2,
  LibraryBig,
  LogOut,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!isLoading) {
      if (
        !isAuthenticated ||
        (user?.role !== "super_admin" && user?.role !== "admin")
      ) {
        router.push("/dashboard");
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  if (!mounted || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const isSuperAdmin = user?.role === "super_admin";

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const navItems = [
    {
      title: "Overview",
      href: "/admin/overview",
      icon: LayoutDashboard,
      roles: ["admin", "super_admin"],
    },
    {
      title: "Pending Contributions",
      href: "/admin/contributions",
      icon: LibraryBig,
      roles: ["admin", "super_admin"],
    },
    {
      title: "System Settings",
      href: "/admin/settings",
      icon: Settings,
      roles: ["super_admin"],
    },
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card flex flex-col hidden md:flex">
        <div className="p-6 border-b border-border">
          <Link
            href="/dashboard"
            className="flex items-center text-sm text-muted-foreground hover:text-primary mb-4 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
            Back to Dashboard
          </Link>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Admin Portal
          </h2>
          <p className="text-xs text-muted-foreground mt-1 capitalize">
            {user?.role.replace("_", " ")}
          </p>
        </div>
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {navItems.map((item) => {
            if (!item.roles.includes(user?.role || "")) return null;

            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.title}
              </Link>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-border mt-auto">
          <div className="flex items-center gap-3 px-3 py-3 rounded-md bg-muted/50 mb-4">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <User className="h-4 w-4" />
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium text-foreground truncate">
                {user?.name || "Admin User"}
              </span>
              <span className="text-xs text-muted-foreground truncate">
                {user?.email}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-background p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}
