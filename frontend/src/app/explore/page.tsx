"use client";

import Link from "next/link";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Search,
  FileText,
  Download,
  User as UserIcon,
  BookOpen,
  Layers,
  PlusCircle,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { INSTITUTE_BRANCHES, SEMESTERS } from "@/lib/constants";

// Types
interface Uploader {
  _id: string;
  name: string;
  avatarUrl: string;
  email: string;
  branch: string;
  semester: number;
}

interface Document {
  _id: string;
  title: string;
  description: string;
  fileUrl: string;
  isExternalLink: boolean;
  subject: string;
  semester: number;
  branch: string;
  type: string;
  createdAt: string;
  downloadCount?: number;
  averageRating?: number;
  totalRatings?: number;
  uploadedBy: Uploader;
}

const TYPES = ["Notes", "PYQ", "Book", "Lab Manual", "Other"];
export const RESOURCE_TYPE_COLORS: Record<
  string,
  {
    badge: string;
    dot: string;
    borderTop: string;
    bannerBg: string;
    bannerText: string;
  }
> = {
  notes: {
    badge: "text-blue-500 border-blue-500/20 bg-blue-500/10",
    dot: "bg-blue-500",
    borderTop: "border-blue-500",
    bannerBg: "bg-blue-500",
    bannerText: "text-white",
  },
  pyq: {
    badge: "text-purple-500 border-purple-500/20 bg-purple-500/10",
    dot: "bg-purple-500",
    borderTop: "border-purple-500",
    bannerBg: "bg-purple-500",
    bannerText: "text-white",
  },
  book: {
    badge: "text-amber-500 border-amber-500/20 bg-amber-500/10",
    dot: "bg-amber-500",
    borderTop: "border-amber-500",
    bannerBg: "bg-amber-500",
    bannerText: "text-amber-950",
  },
  "lab manual": {
    badge: "text-emerald-500 border-emerald-500/20 bg-emerald-500/10",
    dot: "bg-emerald-500",
    borderTop: "border-emerald-500",
    bannerBg: "bg-emerald-500",
    bannerText: "text-emerald-950",
  },
  default: {
    badge: "text-slate-500 border-slate-500/20 bg-slate-500/10",
    dot: "bg-slate-500",
    borderTop: "border-slate-500",
    bannerBg: "bg-slate-500",
    bannerText: "text-white",
  },
};

const WELLBEING_MESSAGES = [
  "You're going to ace this! ✨",
  "Take a deep breath, you got this. 🌟",
  "One step at a time! 🚀",
  "Remember to drink water! 💧",
  "We believe in you! 🌻",
  "Your hard work will pay off. 📈",
  "Don't forget to take breaks! 🍵",
];

const getMessage = (id: string) => {
  const sum = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return WELLBEING_MESSAGES[sum % WELLBEING_MESSAGES.length];
};

const getTypeConfig = (docType: string) => {
  const key = docType?.toLowerCase();
  return RESOURCE_TYPE_COLORS[key] || RESOURCE_TYPE_COLORS["default"];
};

// Toggle this to false when you want to use the real backend API
const USE_DUMMY_DATA = false;

const DUMMY_DOCUMENTS: Document[] = [
  {
    _id: "1",
    title: "Operating Systems Full Notes (Mid-Sem)",
    description:
      "Complete handwritten notes for OS covering processes, threads, scheduling, and deadlocks. Highly recommended for mid-semester exams.",
    fileUrl: "#",
    isExternalLink: false,
    subject: "Operating Systems",
    semester: 5,
    branch: "CSE",
    type: "Notes",
    createdAt: new Date().toISOString(),
    downloadCount: 142,
    averageRating: 4.8,
    totalRatings: 12,
    uploadedBy: {
      _id: "u1",
      name: "Rahul Sharma",
      avatarUrl:
        "https://ui-avatars.com/api/?name=Rahul+Sharma&background=random",
      email: "rahul@nitrr.ac.in",
      branch: "CSE",
      semester: 5,
    },
  },
  {
    _id: "2",
    title: "Data Structures 2023 Previous Year Question Paper",
    description:
      "End semester question paper for Data Structures. Includes some tricky graph and DP questions.",
    fileUrl: "#",
    isExternalLink: true,
    subject: "Data Structures",
    semester: 3,
    branch: "CSE",
    type: "PYQ",
    createdAt: new Date().toISOString(),
    downloadCount: 89,
    averageRating: 3.5,
    totalRatings: 4,
    uploadedBy: {
      _id: "u2",
      name: "Aditi Verma",
      avatarUrl:
        "https://ui-avatars.com/api/?name=Aditi+Verma&background=random",
      email: "aditi@nitrr.ac.in",
      branch: "CSE",
      semester: 7,
    },
  },
  {
    _id: "3",
    title: "Engineering Mechanics Lab Manual",
    description:
      "Standard lab manual for Engineering Mechanics. Contains all the readings and precautions.",
    fileUrl: "#",
    isExternalLink: false,
    subject: "Engineering Mechanics",
    semester: 1,
    branch: "MECH",
    type: "Lab Manual",
    createdAt: new Date().toISOString(),
    downloadCount: 210,
    averageRating: 4.2,
    totalRatings: 28,
    uploadedBy: {
      _id: "u3",
      name: "Vikram Singh",
      avatarUrl:
        "https://ui-avatars.com/api/?name=Vikram+Singh&background=random",
      email: "vikram@nitrr.ac.in",
      branch: "MECH",
      semester: 3,
    },
  },
  {
    _id: "4",
    title: "Advanced Engineering Mathematics (Kreyzig)",
    description:
      "Reference book for Engineering Math. Very useful for solving complex differential equations.",
    fileUrl: "#",
    isExternalLink: true,
    subject: "Mathematics",
    semester: 2,
    branch: "EE",
    type: "Book",
    createdAt: new Date().toISOString(),
    downloadCount: 45,
    averageRating: 5.0,
    totalRatings: 2,
    uploadedBy: {
      _id: "u4",
      name: "Priya Das",
      avatarUrl: "https://ui-avatars.com/api/?name=Priya+Das&background=random",
      email: "priya@nitrr.ac.in",
      branch: "EE",
      semester: 4,
    },
  },
];

export default function ExplorePage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ pages: 1, total: 0 });

  // Filters
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [branch, setBranch] = useState<string>("all");
  const [type, setType] = useState<string>("all");
  const [semester, setSemester] = useState<string>("all");
  const [minRating, setMinRating] = useState<string>("all");

  const { token } = useAuthStore();

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset page on new search
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch documents
  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true);

      if (USE_DUMMY_DATA) {
        // Simulate network delay
        setTimeout(() => {
          let filtered = DUMMY_DOCUMENTS;
          if (debouncedSearch) {
            filtered = filtered.filter(
              (d) =>
                d.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                d.subject.toLowerCase().includes(debouncedSearch.toLowerCase()),
            );
          }
          if (branch !== "all")
            filtered = filtered.filter((d) => d.branch === branch);
          if (type !== "all")
            filtered = filtered.filter((d) => d.type === type);
          if (semester !== "all")
            filtered = filtered.filter(
              (d) => d.semester.toString() === semester,
            );
          if (minRating !== "all")
            filtered = filtered.filter(
              (d) => (d.averageRating || 0) >= parseInt(minRating),
            );

          setDocuments(filtered);
          setLoading(false);
        }, 600);
        return;
      }

      try {
        const params = new URLSearchParams();
        if (debouncedSearch) params.append("search", debouncedSearch);
        if (branch !== "all") params.append("branch", branch);
        if (type !== "all") params.append("type", type);
        if (semester !== "all") params.append("semester", semester);
        if (minRating !== "all") params.append("minRating", minRating);
        params.append("page", page.toString());
        params.append("limit", "12");

        const response = await api.get(
          `/resources/documents?${params.toString()}`,
        );

        // Handle new paginated response structure or fallback
        if (response.data.documents && response.data.pagination) {
          setDocuments(response.data.documents);
          setPagination(response.data.pagination);
        } else {
          setDocuments(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch documents", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [debouncedSearch, branch, type, semester, minRating, page]);

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-8">
      {/* Sidebar Filters */}
      <aside className="w-full md:w-64 flex-shrink-0 space-y-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight mb-4 flex items-center">
            <Layers className="mr-2 h-5 w-5 text-primary" />
            Filters
          </h2>
          <Separator className="mb-6" />

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">
                Resource Type
              </label>
              <Select
                value={type}
                onValueChange={(val) => setType(val || "all")}
              >
                <SelectTrigger className="w-full bg-background backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    {type !== "all" && (
                      <div
                        className={`w-2 h-2 rounded-full ${getTypeConfig(type).dot}`}
                      />
                    )}
                    <SelectValue placeholder="All Types" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${getTypeConfig(t).dot}`}
                        />
                        {t}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">
                Branch / Department
              </label>
              <Select
                value={branch}
                onValueChange={(val) => setBranch(val || "all")}
              >
                <SelectTrigger className="w-full bg-background backdrop-blur-sm">
                  <SelectValue placeholder="All Branches" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Branches</SelectItem>
                  {INSTITUTE_BRANCHES.map((b) => (
                    <SelectItem key={b} value={b}>
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">
                Semester
              </label>
              <Select
                value={semester}
                onValueChange={(val) => setSemester(val || "all")}
              >
                <SelectTrigger className="w-full bg-background backdrop-blur-sm">
                  <SelectValue placeholder="All Semesters" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Semesters</SelectItem>
                  {SEMESTERS.map((s) => (
                    <SelectItem key={s} value={s}>
                      Semester {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">
                Minimum Rating
              </label>
              <Select
                value={minRating}
                onValueChange={(val) => setMinRating(val || "all")}
              >
                <SelectTrigger className="w-full bg-background backdrop-blur-sm">
                  <SelectValue placeholder="Any Rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Rating</SelectItem>
                  <SelectItem value="4">4+ Stars</SelectItem>
                  <SelectItem value="3">3+ Stars</SelectItem>
                  <SelectItem value="2">2+ Stars</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setBranch("all");
                setType("all");
                setSemester("all");
                setSearch("");
                setPage(1);
              }}
            >
              Reset Filters
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-[500px]">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Explore Resources
            </h1>
            <p className="text-muted-foreground mt-1">
              Discover study materials, notes, and previous year papers.
            </p>
          </div>
          <Link href="/dashboard/upload">
            <Button className="gap-2">
              <PlusCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Upload Material</span>
            </Button>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="relative mb-8 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Search resources by title, subject, or keywords..."
            className="pl-12 h-14 text-base rounded-2xl bg-background border-border shadow-sm focus-visible:ring-primary/20 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Results Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card
                  key={i}
                  className="animate-pulse bg-card border-border h-64"
                />
              ))}
            </div>
          ) : documents.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {documents.map((doc) => {
                const typeConfig = getTypeConfig(doc.type);
                return (
                  <Link
                    href={`/resources/${doc._id}`}
                    key={doc._id}
                    className="block group"
                  >
                    <Card
                      className={`h-full relative overflow-hidden border border-border bg-card hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col border-t-4 ${typeConfig.borderTop}`}
                    >
                      {/* Expanding wellbeing banner that drops from the native top border */}
                      <div
                        className={`absolute top-0 left-0 w-full h-0 group-hover:h-8 transition-all duration-300 ease-in-out z-10 flex items-center justify-center overflow-hidden ${typeConfig.bannerBg} ${typeConfig.bannerText}`}
                      >
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100 whitespace-nowrap text-xs font-semibold tracking-wide px-4">
                          {getMessage(doc._id)}
                        </span>
                      </div>
                      <CardHeader className="pb-4 pt-10 relative z-0">
                        <div className="flex justify-between items-start mb-2 gap-2">
                          <Badge variant="outline" className={typeConfig.badge}>
                            <div
                              className={`w-1.5 h-1.5 rounded-full mr-1.5 ${typeConfig.dot}`}
                            />
                            {doc.type}
                          </Badge>
                          <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-md">
                            Sem {doc.semester}
                          </span>
                        </div>
                        <CardTitle className="line-clamp-2 text-xl leading-tight group-hover:text-primary transition-colors">
                          {doc.title}
                        </CardTitle>
                        <CardDescription className="flex items-center mt-2 text-sm text-muted-foreground">
                          <BookOpen className="mr-1.5 h-3.5 w-3.5" />
                          {doc.subject}
                        </CardDescription>
                        <div className="flex items-center gap-4 mt-3">
                          <div className="flex items-center text-sm text-amber-500 font-medium">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              className="w-4 h-4 mr-1"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                                clipRule="evenodd"
                              />
                            </svg>
                            {doc.averageRating && doc.averageRating > 0
                              ? doc.averageRating.toFixed(1)
                              : "New"}
                            {doc.totalRatings && doc.totalRatings > 0 ? (
                              <span className="text-muted-foreground ml-1 font-normal">
                                ({doc.totalRatings})
                              </span>
                            ) : null}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Download className="w-4 h-4 mr-1" />
                            {doc.downloadCount || 0}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="flex-1">
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {doc.description || "No description provided."}
                        </p>
                      </CardContent>
                      <CardFooter className="pt-4 pb-4 border-t border-border bg-muted/30 flex justify-between items-center mt-auto">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8 border border-border">
                            <AvatarImage
                              src={doc.uploadedBy?.avatarUrl}
                              alt={doc.uploadedBy?.name || "User"}
                            />
                            <AvatarFallback>
                              <UserIcon className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="text-xs">
                            <p className="font-medium text-foreground leading-none">
                              {doc.uploadedBy?.name || "Unknown"}
                            </p>
                            <p className="text-muted-foreground mt-0.5">
                              {doc.uploadedBy?.branch || "General"}
                            </p>
                          </div>
                        </div>
                        <div className="group-hover:bg-primary/90 group-hover:shadow-lg inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all duration-300 bg-primary text-primary-foreground shadow-md h-8 rounded-full px-4 group-hover:scale-105 active:scale-95">
                          View Details
                        </div>
                      </CardFooter>
                    </Card>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center bg-card rounded-3xl border border-dashed border-border">
              <div className="bg-primary/10 p-4 rounded-full mb-4">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No resources found</h3>
              <p className="text-muted-foreground max-w-md">
                We couldn't find any resources matching your current filters.
                Try adjusting your search or clearing the filters.
              </p>
              <Button
                variant="outline"
                className="mt-6"
                onClick={() => {
                  setBranch("all");
                  setType("all");
                  setSemester("all");
                  setSearch("");
                  setPage(1);
                }}
              >
                Clear all filters
              </Button>
            </div>
          )}

          {/* Pagination Controls */}
          {!loading && documents.length > 0 && pagination.pages > 1 && (
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
        </div>
      </main>
    </div>
  );
}
