"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, PenTool, Search, PlusCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ pages: 1, total: 0 });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/blogs?page=${page}&limit=9`);
      let data = res.data;

      if (res.data.blogs) {
        data = res.data.blogs;
        setPagination({ pages: res.data.pages, total: res.data.total });
      }

      if (debouncedSearch) {
        data = data.filter(
          (b: any) =>
            b.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            b.content.toLowerCase().includes(debouncedSearch.toLowerCase()),
        );
      }
      setBlogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, [debouncedSearch, page]);

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
                    placeholder="Search blogs..."
                    className="pl-9 bg-background"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">
                Student Blogs
              </h1>
              <p className="text-muted-foreground">
                Read insights, technical tutorials, and experiences from your
                peers.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge
                variant="secondary"
                className="px-3 py-1 text-sm font-normal hidden sm:inline-flex"
              >
                {blogs.length} Blogs
              </Badge>
              <Link href="/blogs/write">
                <Button className="gap-2">
                  <PlusCircle className="h-4 w-4" />
                  <span className="hidden sm:inline">Write a Blog</span>
                </Button>
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card
                  key={i}
                  className="animate-pulse bg-white/5 border-white/10 h-[380px]"
                />
              ))}
            </div>
          ) : blogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogs.map((blog) => (
                <Link
                  key={blog._id}
                  href={`/blogs/${blog.slug}`}
                  className="group block h-full"
                >
                  <Card className="h-full bg-white/5 border-white/10 hover:border-primary/50 transition-all duration-300 overflow-hidden flex flex-col group-hover:-translate-y-1">
                    {blog.coverImage ? (
                      <div className="aspect-[16/9] w-full overflow-hidden relative border-b border-white/10">
                        <img
                          src={
                            blog.coverImage.startsWith("http")
                              ? blog.coverImage
                              : `${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:5000"}${blog.coverImage}`
                          }
                          alt={blog.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    ) : (
                      <div className="aspect-[16/9] w-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center border-b border-white/10">
                        <BookOpen className="h-12 w-12 text-primary/40" />
                      </div>
                    )}

                    <CardHeader className="p-5 pb-3">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {blog.tags
                          ?.slice(0, 3)
                          .map((tag: string, i: number) => (
                            <Badge
                              key={i}
                              variant="secondary"
                              className="bg-white/5 hover:bg-white/10 text-xs font-medium border-white/5"
                            >
                              {tag}
                            </Badge>
                          ))}
                      </div>
                      <CardTitle className="text-xl leading-tight group-hover:text-primary transition-colors line-clamp-2">
                        {blog.title}
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="p-5 pt-0 flex-1">
                      <p className="text-muted-foreground text-sm line-clamp-3">
                        {blog.content
                          .replace(/[#*`_\[\]()]/g, "")
                          .slice(0, 150)}
                        ...
                      </p>
                    </CardContent>

                    <CardFooter className="p-5 pt-0 mt-auto flex items-center justify-between border-t border-white/5">
                      <div className="flex items-center gap-2 mt-4">
                        <Avatar className="h-7 w-7 border border-white/10">
                          <AvatarImage src={blog.author?.avatarUrl} />
                          <AvatarFallback>
                            {blog.author?.name?.charAt(0) || "A"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium text-foreground/80">
                          {blog.author?.name || "Anonymous"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-4">
                        <Clock className="h-3 w-3" />
                        {blog.readTime || 3} min read
                      </div>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10 border-dashed">
              <BookOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No blogs found</h3>
              <p className="text-muted-foreground mb-6">
                Be the first to share your thoughts and experiences.
              </p>
              <Link href="/blogs/write">
                <Button>Write a Blog</Button>
              </Link>
            </div>
          )}

          {/* Pagination Controls */}
          {!loading && blogs.length > 0 && pagination.pages > 1 && (
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
