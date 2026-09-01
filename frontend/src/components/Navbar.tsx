"use client";

import Link from "next/link";
import {
  BookOpen,
  LogOut,
  LayoutDashboard,
  Settings,
  User as UserIcon,
  Award,
  Plus,
  PenTool,
  Map,
  Briefcase,
  ChevronDown,
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "./ui/dropdown-menu";
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
          <Link
            href={isAuthenticated ? "/dashboard" : "/"}
            className="flex items-center gap-2"
          >
            <div className="bg-primary/10 p-2 rounded-lg text-primary">
              <BookOpen className="h-6 w-6" />
            </div>
            <span className="font-bold text-xl tracking-tight">
              Resource-Adda
            </span>
          </Link>
          <div className="hidden md:flex ml-6 items-center gap-6">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors ${pathname === "/" ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
            >
              Home
            </Link>
            <Link
              href="/explore"
              className={`text-sm font-medium transition-colors ${pathname === "/explore" ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
            >
              Explore
            </Link>
            <Link
              href="/featured"
              className={`text-sm font-medium transition-colors flex items-center ${pathname === "/featured" ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
            >
              <span className="relative flex h-2 w-2 mr-2">
                <span
                  className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${pathname === "/featured" ? "bg-primary animate-ping" : "bg-primary/50"}`}
                ></span>
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${pathname === "/featured" ? "bg-primary" : "bg-primary/50"}`}
                ></span>
              </span>
              Featured
            </Link>
            <Link
              href="/placements"
              className={`text-sm font-medium transition-colors ${pathname === "/placements" ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
            >
              Placements
            </Link>
            <Link
              href="/roadmaps"
              className={`text-sm font-medium transition-colors ${pathname === "/roadmaps" ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
            >
              Roadmaps
            </Link>
            <Link
              href="/wellbeing"
              className={`text-sm font-medium transition-colors ${pathname === "/wellbeing" ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
            >
              Wellbeing
            </Link>
            <Link
              href="/blogs"
              className={`text-sm font-medium transition-colors ${pathname === "/blogs" ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
            >
              Blogs
            </Link>
          </div>
        </div>

        <nav className="flex items-center gap-4">
          {isAuthenticated && (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    className="h-9 px-2.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors flex items-center gap-1"
                  />
                }
              >
                <Plus className="h-4 w-4" />
                <ChevronDown className="h-3 w-3 opacity-70" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Create New</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => router.push("/dashboard/upload")}
                    className="cursor-pointer"
                  >
                    <BookOpen className="mr-2 h-4 w-4" />
                    <span>Study Resource</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push("/blogs/write")}
                    className="cursor-pointer"
                  >
                    <PenTool className="mr-2 h-4 w-4" />
                    <span>Student Blog</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push("/dashboard/placements/write")}
                    className="cursor-pointer"
                  >
                    <Briefcase className="mr-2 h-4 w-4" />
                    <span>Interview Experience</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push("/dashboard/roadmaps/write")}
                    className="cursor-pointer"
                  >
                    <Map className="mr-2 h-4 w-4" />
                    <span>Roadmap</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <ThemeToggle />

          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full p-0 overflow-hidden"
                  />
                }
              >
                <Avatar className="h-full w-full border-2 border-primary/20 hover:border-primary transition-colors cursor-pointer">
                  <AvatarImage
                    src={
                      user.avatarUrl ||
                      `https://ui-avatars.com/api/?name=${user.name}&background=random`
                    }
                    alt={user.name}
                  />
                  <AvatarFallback>
                    {user.name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <div className="px-2 py-1.5 text-sm font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.name}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <div className="p-2">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="flex items-center text-muted-foreground">
                      <Award className="w-4 h-4 mr-1 text-amber-500" /> Level{" "}
                      {Math.floor((user.contributionPoints || 0) / 100) + 1}
                    </span>
                    <span className="font-bold text-primary">
                      {user.contributionPoints || 0} XP
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden mt-1">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-orange-500"
                      style={{
                        width: `${(user.contributionPoints || 0) % 100}%`,
                      }}
                    />
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => router.push("/dashboard")}
                  className="cursor-pointer"
                >
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  <span>Dashboard</span>
                </DropdownMenuItem>
                {user.role === "admin" || user.role === "super_admin" ? (
                  <DropdownMenuItem
                    onClick={() => router.push("/admin")}
                    className="cursor-pointer"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Admin Panel</span>
                  </DropdownMenuItem>
                ) : null}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-rose-500 focus:text-rose-600 focus:bg-rose-500/10 cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button
                  variant="ghost"
                  className="hidden sm:inline-flex font-semibold"
                >
                  Sign In
                </Button>
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
