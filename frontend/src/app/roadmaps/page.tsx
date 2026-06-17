"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User as UserIcon,
  Map,
  Target,
  BookOpen,
  Search,
  ShieldCheck,
  Flame,
  Ghost,
  Clock,
  PlusCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ReportModal } from "@/components/ui/ReportModal";

interface Uploader {
  _id: string;
  name: string;
  avatarUrl: string;
  branch: string;
  semester: number;
}

interface Roadmap {
  _id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  estimatedTime: string;
  targetAudience: string;
  isOfficial: boolean;
  isAnonymous: boolean;
  author: Uploader;
  createdAt: string;
  upvotes: number;
}

const USE_DUMMY_DATA = false;

const DUMMY_ROADMAPS: Roadmap[] = [
  {
    _id: "1",
    title: "Complete MERN Stack Roadmap 2024",
    description:
      "A step-by-step guide to mastering MongoDB, Express, React, and Node.js for placements.",
    category: "Skill",
    difficulty: "Intermediate",
    estimatedTime: "12 Weeks",
    targetAudience: "Beginners to Intermediate",
    isOfficial: true,
    isAnonymous: false,
    author: {
      _id: "admin",
      name: "Resource Adda Team",
      avatarUrl:
        "https://ui-avatars.com/api/?name=Resource+Adda&background=0D8ABC&color=fff",
      branch: "Admin",
      semester: 0,
    },
    createdAt: new Date().toISOString(),
    upvotes: 342,
  },
  {
    _id: "2",
    title: "Cracking FAANG Off-Campus",
    description:
      "How to build your resume, cold email recruiters, and prepare for system design rounds.",
    category: "Placement",
    difficulty: "Advanced",
    estimatedTime: "4 Weeks",
    targetAudience: "Final Year Students",
    isOfficial: false,
    isAnonymous: true,
    author: {
      _id: "anon",
      name: "Anonymous Creator",
      avatarUrl: "https://ui-avatars.com/api/?name=Anonymous&background=random",
      branch: "Confidential",
      semester: 0,
    },
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    upvotes: 215,
  },
  {
    _id: "3",
    title: "How to ace OS & DBMS in 1 week",
    description:
      "Focused topics and important PYQs to pass your semester exams for core CS subjects.",
    category: "Academic",
    difficulty: "Beginner",
    estimatedTime: "1 Week",
    targetAudience: "5th Semester CS/IT",
    isOfficial: false,
    isAnonymous: false,
    author: {
      _id: "u2",
      name: "Anjali Sharma",
      avatarUrl:
        "https://ui-avatars.com/api/?name=Anjali+Sharma&background=random",
      branch: "Computer Science",
      semester: 7,
    },
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    upvotes: 189,
  },
];

const getCategoryConfig = (category: string) => {
  switch (category.toLowerCase()) {
    case "academic":
      return {
        icon: <BookOpen className="w-4 h-4 mr-1" />,
        class: "text-blue-500 bg-blue-500/10 border-blue-500/20",
      };
    case "placement":
      return {
        icon: <Target className="w-4 h-4 mr-1" />,
        class: "text-purple-500 bg-purple-500/10 border-purple-500/20",
      };
    case "skill":
      return {
        icon: <Flame className="w-4 h-4 mr-1" />,
        class: "text-orange-500 bg-orange-500/10 border-orange-500/20",
      };
    default:
      return {
        icon: <Map className="w-4 h-4 mr-1" />,
        class: "text-slate-500 bg-slate-500/10 border-slate-500/20",
      };
  }
};

export default function RoadmapsPage() {
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ pages: 1, total: 0 });

  // Filters
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset page on new search
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const fetchRoadmaps = async () => {
      setLoading(true);
      if (USE_DUMMY_DATA) {
        setTimeout(() => {
          let filtered = DUMMY_ROADMAPS;
          if (debouncedSearch) {
            filtered = filtered.filter(
              (r) =>
                r.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                r.description
                  .toLowerCase()
                  .includes(debouncedSearch.toLowerCase()),
            );
          }
          if (categoryFilter !== "all") {
            filtered = filtered.filter(
              (r) => r.category.toLowerCase() === categoryFilter.toLowerCase(),
            );
          }
          setRoadmaps(filtered);
          setLoading(false);
        }, 600);
        return;
      }

      try {
        const params = new URLSearchParams();
        if (debouncedSearch) params.append("targetAudience", debouncedSearch); // Simulating basic search
        if (categoryFilter !== "all") params.append("category", categoryFilter);
        params.append("page", page.toString());
        params.append("limit", "10");

        const response = await api.get(`/roadmaps?${params.toString()}`);
        if (response.data.roadmaps) {
          setRoadmaps(response.data.roadmaps);
          setPagination({
            pages: response.data.pages,
            total: response.data.total,
          });
        } else {
          setRoadmaps(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch roadmaps", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoadmaps();
  }, [debouncedSearch, categoryFilter, page]);

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="w-full md:w-64 flex-shrink-0 space-y-6">
          <div>
            <h2 className="text-xl font-bold mb-4">Filters</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Search</Label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="e.g. React, DBMS..."
                    className="pl-9 bg-background"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={categoryFilter}
                  onValueChange={(value) => setCategoryFilter(value || "all")}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Academic">Academic</SelectItem>
                    <SelectItem value="Placement">Placement</SelectItem>
                    <SelectItem value="Skill">Skill</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setSearch("");
                  setCategoryFilter("all");
                  setPage(1);
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Community Roadmaps
              </h1>
              <p className="text-muted-foreground mt-1">
                Structured guides to help you navigate academics, skills, and
                placements.
              </p>
            </div>
            <Link href="/dashboard/roadmaps/write">
              <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
                <PlusCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Build Roadmap</span>
              </Button>
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Card
                  key={i}
                  className="animate-pulse bg-card border-border h-56"
                />
              ))}
            </div>
          ) : roadmaps.length > 0 ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {roadmaps.map((roadmap) => {
                const categoryConfig = getCategoryConfig(roadmap.category);
                return (
                  <Link
                    href={`/roadmaps/${roadmap._id}`}
                    key={roadmap._id}
                    className="block group"
                  >
                    <Card
                      className={`h-full relative overflow-hidden border border-border bg-card hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col ${
                        roadmap.isOfficial
                          ? "border-l-4 border-l-blue-500"
                          : "border-t-4 border-t-emerald-500"
                      }`}
                    >
                      {roadmap.isOfficial && (
                        <div className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg flex items-center shadow-sm">
                          <ShieldCheck className="w-3 h-3 mr-1" />
                          OFFICIAL
                        </div>
                      )}

                      <CardHeader className="pb-4">
                        <div className="flex justify-between items-start mb-2">
                          <Badge
                            variant="outline"
                            className={categoryConfig.class}
                          >
                            {categoryConfig.icon}
                            {roadmap.category}
                          </Badge>
                          <div onClick={(e) => e.preventDefault()}>
                            <ReportModal
                              itemId={roadmap._id}
                              itemModel="Roadmap"
                            />
                          </div>
                        </div>
                        <CardTitle className="text-xl group-hover:text-primary transition-colors leading-tight pr-12">
                          {roadmap.title}
                        </CardTitle>
                        <CardDescription className="mt-2 line-clamp-2">
                          {roadmap.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex-1 space-y-3">
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm border ${
                              roadmap.difficulty === "Beginner"
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                : roadmap.difficulty === "Intermediate"
                                  ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                                  : "bg-rose-500/10 text-rose-600 border-rose-500/20"
                            }`}
                          >
                            {roadmap.difficulty}
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm border bg-slate-500/10 text-slate-600 border-slate-500/20 dark:text-slate-400 flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {roadmap.estimatedTime}
                          </span>
                        </div>
                        <div className="inline-flex items-center text-xs font-medium bg-muted text-muted-foreground px-2.5 py-1 rounded-md">
                          <Target className="w-3.5 h-3.5 mr-1.5" />
                          For: {roadmap.targetAudience}
                        </div>
                      </CardContent>
                      <CardFooter className="pt-4 border-t border-border bg-muted/30 flex justify-between items-center mt-auto">
                        <div className="flex items-center gap-2">
                          {roadmap.isAnonymous ? (
                            <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center border border-border">
                              <Ghost className="h-4 w-4 text-slate-500" />
                            </div>
                          ) : (
                            <Avatar className="h-8 w-8 border border-border">
                              <AvatarImage
                                src={roadmap.author?.avatarUrl}
                                alt={roadmap.author?.name}
                              />
                              <AvatarFallback>
                                <UserIcon className="h-4 w-4" />
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div className="text-xs">
                            <p className="font-medium text-foreground">
                              {roadmap.isOfficial
                                ? "Resource Adda"
                                : roadmap.author?.name}
                            </p>
                            <div className="flex items-center text-muted-foreground mt-0.5">
                              <button
                                onClick={(e) => {
                                  e.preventDefault(); /* Handle upvote */
                                }}
                                className="flex items-center hover:text-emerald-500 transition-colors"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="12"
                                  height="12"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="mr-1"
                                >
                                  <path d="m18 15-6-6-6 6" />
                                </svg>
                                {roadmap.upvotes}
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="group-hover:bg-primary/90 group-hover:shadow-lg inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all duration-300 bg-primary text-primary-foreground shadow-md h-8 rounded-full px-4 group-hover:scale-105 active:scale-95">
                          View Roadmap
                        </div>
                      </CardFooter>
                    </Card>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 bg-muted/30 rounded-3xl border border-dashed border-border">
              <Map className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium">No roadmaps found</h3>
              <p className="text-muted-foreground max-w-sm mx-auto mt-2">
                We couldn't find any roadmaps matching your filters.
              </p>
              <Button
                variant="outline"
                className="mt-6"
                onClick={() => {
                  setSearch("");
                  setCategoryFilter("all");
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}

          {/* Pagination Controls */}
          {!loading && roadmaps.length > 0 && pagination.pages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-12 mb-8">
              <Button
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <div className="text-sm text-muted-foreground font-medium">
                Page {page} of {pagination.pages}
              </div>
              <Button
                variant="outline"
                disabled={page >= pagination.pages}
                onClick={() =>
                  setPage((p) => Math.min(pagination.pages, p + 1))
                }
              >
                Next
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
