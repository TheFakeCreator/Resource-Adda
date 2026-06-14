"use client";

import { useState, useEffect, use } from "react";
import api from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Calendar, AlertTriangle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function BlogReadingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const router = useRouter();
  const { slug } = use(params);
  const [blog, setBlog] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reporting, setReporting] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await api.get(`/blogs/${slug}`);
        setBlog(res.data);
      } catch (err: any) {
        if (err.response?.status === 404) {
          router.push("/blogs");
        }
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [slug, router]);

  const handleReport = async () => {
    if (!blog) return;

    setReporting(true);
    try {
      await api.post(`/blogs/${blog._id}/report`, { reason: reportReason });
      setReportDialogOpen(false);
      alert("Report submitted successfully.");
    } catch (error: any) {
      alert(
        error.response?.data?.error ||
          "Failed to submit report. Please try again or log in.",
      );
    } finally {
      setReporting(false);
    }
  };

  if (loading) {
    return (
      <div className="container max-w-4xl py-12 space-y-8 animate-pulse">
        <div className="h-8 w-24 bg-white/10 rounded-md"></div>
        <div className="h-12 w-3/4 bg-white/10 rounded-md"></div>
        <div className="flex gap-4">
          <div className="h-12 w-12 rounded-full bg-white/10"></div>
          <div className="space-y-2">
            <div className="h-4 w-32 bg-white/10 rounded-md"></div>
            <div className="h-4 w-24 bg-white/10 rounded-md"></div>
          </div>
        </div>
        <div className="h-64 w-full bg-white/5 rounded-2xl"></div>
      </div>
    );
  }

  if (!blog) return null;

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl pt-12">
        <Link
          href="/blogs"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Blogs
        </Link>

        <article className="space-y-8">
          {/* Header */}
          <header className="space-y-6">
            <div className="flex flex-wrap gap-2">
              {blog.tags?.map((tag: string, i: number) => (
                <Badge
                  key={i}
                  variant="secondary"
                  className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20"
                >
                  {tag}
                </Badge>
              ))}
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight lg:leading-[1.1]">
              {blog.title}
            </h1>

            <div className="flex items-center justify-between py-6 border-y border-white/10">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12 border border-white/10">
                  <AvatarImage src={blog.author?.avatarUrl} />
                  <AvatarFallback>
                    {blog.author?.name?.charAt(0) || "A"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-foreground">
                    {blog.author?.name || "Anonymous"}
                  </p>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />{" "}
                      {new Date(blog.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" /> {blog.readTime || 3} min
                      read
                    </span>
                  </div>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReportDialogOpen(true)}
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                title="Report inappropriate content"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Report
              </Button>
            </div>
          </header>

          {/* Cover Image */}
          {blog.coverImage && (
            <div className="w-full aspect-video md:aspect-[21/9] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
              <img
                src={
                  blog.coverImage.startsWith("http")
                    ? blog.coverImage
                    : `${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:5000"}${blog.coverImage}`
                }
                alt={blog.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Markdown Content */}
          <div className="prose prose-invert prose-lg max-w-none mt-10">
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeKatex]}
              components={{
                code({ node, inline, className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || "");
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={vscDarkPlus as any}
                      language={match[1]}
                      PreTag="div"
                      className="rounded-lg border border-white/10 my-6 !bg-[#1E1E1E]"
                      {...props}
                    >
                      {String(children).replace(/\n$/, "")}
                    </SyntaxHighlighter>
                  ) : (
                    <code
                      className="bg-white/10 px-1.5 py-0.5 rounded text-sm font-mono text-primary-foreground"
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },
                img({ node, ...props }: any) {
                  return (
                    <span className="block my-8 border border-white/10 rounded-xl overflow-hidden bg-black/50">
                      <img className="w-full h-auto" {...props} />
                    </span>
                  );
                },
                a({ node, ...props }: any) {
                  return (
                    <a
                      className="text-primary hover:underline underline-offset-4 decoration-primary/50"
                      target="_blank"
                      rel="noopener noreferrer"
                      {...props}
                    />
                  );
                },
                blockquote({ node, ...props }: any) {
                  return (
                    <blockquote
                      className="border-l-4 border-primary/50 bg-primary/5 py-2 pr-4 pl-6 italic my-6 rounded-r-lg"
                      {...props}
                    />
                  );
                },
              }}
            >
              {blog.content}
            </ReactMarkdown>
          </div>
        </article>
      </div>

      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Report Blog Post</DialogTitle>
            <DialogDescription>
              Please let us know why you are reporting this blog post. Our
              moderators will review it shortly.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for reporting</Label>
              <Select
                value={reportReason}
                onValueChange={(val) => setReportReason(val || "")}
              >
                <SelectTrigger id="reason">
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Spam">Spam</SelectItem>
                  <SelectItem value="Inappropriate Content">
                    Inappropriate Content
                  </SelectItem>
                  <SelectItem value="Plagiarism">Plagiarism</SelectItem>
                  <SelectItem value="Harassment">Harassment</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="mt-4 gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setReportDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReport}
              disabled={reporting || !reportReason}
            >
              {reporting ? "Reporting..." : "Submit Report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
