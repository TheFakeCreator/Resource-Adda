"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  FileText,
  LayoutList,
  ShieldAlert,
  TrendingUp,
  TrendingDown,
  BookOpen,
  Clock,
  Settings,
  AlertTriangle,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

interface DashboardStats {
  stats: {
    totalUsers: number;
    totalResources: number;
    totalBlogs: number;
    totalWellbeingPosts: number;
    pendingReports: number;
    detailed: {
      documents: number;
      roadmaps: number;
      interviews: number;
    };
  };
  recentUsers: any[];
  recentDocuments: any[];
}

export default function AdminOverviewPage() {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get("/admin/stats");
        setData(response.data);
      } catch (error) {
        console.error("Failed to fetch admin stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-white/5 animate-pulse rounded-md"></div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card
              key={i}
              className="bg-white/5 animate-pulse h-32 border-white/10"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!data)
    return (
      <div className="text-muted-foreground py-10 text-center">
        Failed to load statistics.
      </div>
    );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Metric Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-indigo-500/5 border-blue-500/20 hover:border-blue-500/40 transition-all group">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Users
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {data.stats.totalUsers}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              <TrendingUp className="h-3 w-3 text-emerald-400 mr-1" />
              <span className="text-emerald-400 font-medium">+12%</span> from
              last month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border-emerald-500/20 hover:border-emerald-500/40 transition-all group">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Study Resources
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <BookOpen className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {data.stats.totalResources}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              <TrendingUp className="h-3 w-3 text-emerald-400 mr-1" />
              <span className="text-emerald-400 font-medium">+5%</span> from
              last month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/5 border-purple-500/20 hover:border-purple-500/40 transition-all group">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Community Posts
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
              <LayoutList className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {data.stats.totalBlogs + data.stats.totalWellbeingPosts}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              <span>
                {data.stats.totalBlogs} Blogs, {data.stats.totalWellbeingPosts}{" "}
                Wellbeing
              </span>
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-rose-500/10 to-orange-500/5 border-rose-500/20 hover:border-rose-500/40 transition-all group">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Action Required
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
              <ShieldAlert className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {data.stats.pendingReports}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              {data.stats.pendingReports > 0 ? (
                <>
                  <AlertTriangle className="h-3 w-3 text-rose-400 mr-1" />{" "}
                  <span className="text-rose-400">Reports pending review</span>
                </>
              ) : (
                <span className="text-emerald-400">All caught up</span>
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Users Table */}
        <Card className="lg:col-span-4 bg-black/40 border-white/10 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-lg">Recent Users</CardTitle>
            <CardDescription>
              The latest students to join Resource Adda.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {data.recentUsers.map((user) => (
                <div key={user._id} className="flex items-center">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user.avatarUrl} alt="Avatar" />
                    <AvatarFallback>
                      {user.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                  <div className="ml-auto font-medium text-sm text-muted-foreground">
                    <Badge variant="outline" className="bg-white/5 font-normal">
                      {user.branch}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Resources */}
        <Card className="lg:col-span-3 bg-black/40 border-white/10 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-lg">Recent Uploads</CardTitle>
            <CardDescription>
              Latest materials shared by the community.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {data.recentDocuments.map((doc) => (
                <div key={doc._id} className="flex items-start gap-4">
                  <div className="h-10 w-10 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-1 flex-1 min-w-0">
                    <p className="text-sm font-medium leading-none truncate">
                      {doc.title}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className="text-[10px] uppercase font-semibold"
                  >
                    {doc.type}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
