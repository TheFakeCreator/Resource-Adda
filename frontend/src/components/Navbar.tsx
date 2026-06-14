"use client";

import Link from "next/link";
import { BookOpen, LogOut } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "./ui/button";
import { useRouter, usePathname } from "next/navigation";

export function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-lg text-primary">
              <BookOpen className="h-6 w-6" />
            </div>
            <span className="font-bold text-xl tracking-tight">Resource-Adda</span>
          </Link>
          <div className="hidden md:flex ml-6 items-center gap-6">
            <Link 
              href="/" 
              className={`text-sm font-medium transition-colors ${pathname === '/' ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
            >
              Home
            </Link>
            <Link 
              href="/explore" 
              className={`text-sm font-medium transition-colors ${pathname === '/explore' ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
            >
              Explore
            </Link>
            <Link 
              href="/featured" 
              className={`text-sm font-medium transition-colors flex items-center ${pathname === '/featured' ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
            >
              <span className="relative flex h-2 w-2 mr-2">
                <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${pathname === '/featured' ? 'bg-primary animate-ping' : 'bg-primary/50'}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${pathname === '/featured' ? 'bg-primary' : 'bg-primary/50'}`}></span>
              </span>
              Featured
            </Link>
            <Link 
              href="/placements" 
              className={`text-sm font-medium transition-colors ${pathname === '/placements' ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
            >
              Placements
            </Link>
            <Link 
              href="/roadmaps" 
              className={`text-sm font-medium transition-colors ${pathname === '/roadmaps' ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
            >
              Roadmaps
            </Link>
          </div>
        </div>

        <nav className="flex items-center gap-4">
          <ThemeToggle />
          
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2">
              <Link href="/dashboard" className="hidden sm:flex flex-col items-end mr-2 hover:bg-muted p-2 rounded-lg transition-colors cursor-pointer">
                <span className="text-sm font-medium leading-none hover:text-primary transition-colors">{user.email}</span>
                <span className="text-xs text-muted-foreground mt-1 capitalize">{user.role.replace('_', ' ')}</span>
              </Link>
              <Button variant="ghost" size="icon" onClick={handleLogout} title="Log out">
                <LogOut className="h-5 w-5 text-muted-foreground hover:text-red-500 transition-colors" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" className="hidden sm:inline-flex font-semibold">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button className="font-semibold shadow-sm">Get Started</Button>
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
