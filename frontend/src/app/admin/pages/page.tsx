"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save, Loader2, BookOpen } from "lucide-react";

// Markdown imports for live preview
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import "katex/dist/katex.min.css";

const DEFAULT_PAGES = [
  { slug: "privacy", title: "Privacy Policy" },
  { slug: "terms", title: "Terms of Service" },
  { slug: "guidelines", title: "Contribution Guidelines" },
  { slug: "faq", title: "Frequently Asked Questions" },
  { slug: "security", title: "Security Policy" },
];

export default function AdminPagesEditor() {
  const router = useRouter();
  const { user, token, isAuthenticated, isLoading } = useAuthStore();

  const [selectedSlug, setSelectedSlug] = useState("privacy");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  async function fetchPageData(slug: string) {
    setFetching(true);
    try {
      const res = await api.get(`/pages/${slug}`);
      setTitle(res.data.title);
      setContent(res.data.content);
    } catch (error: any) {
      // If 404, it means the page hasn't been created yet. Default to the preset title.
      if (error.response?.status === 404) {
        const defaultPage = DEFAULT_PAGES.find((p) => p.slug === slug);
        setTitle(defaultPage?.title || "");
        setContent("");
      } else {
        console.error("Failed to fetch page", error);
      }
    } finally {
      setFetching(false);
    }
  }

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || user?.role !== "super_admin") {
        router.push("/admin");
      } else {
        fetchPageData(selectedSlug);
      }
    }
  }, [isLoading, isAuthenticated, user, router, selectedSlug]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.put(
        `/pages/${selectedSlug}`,
        { title, content },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      alert("Page saved successfully!");
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.error || "Failed to save page.");
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || !user)
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Markdown Pages Editor
          </h1>
          <p className="text-muted-foreground">
            Manage static content pages globally.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-card p-2 rounded-lg border shadow-sm">
          <BookOpen className="h-5 w-5 text-muted-foreground ml-2" />
          <select
            value={selectedSlug}
            onChange={(e) => setSelectedSlug(e.target.value)}
            className="bg-transparent text-foreground font-medium outline-none pr-4 cursor-pointer"
          >
            <optgroup label="Core Pages">
              {DEFAULT_PAGES.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.title} (/{p.slug})
                </option>
              ))}
            </optgroup>
          </select>
        </div>
      </div>

      {fetching ? (
        <div className="h-64 flex items-center justify-center bg-card rounded-xl border">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
        </div>
      ) : (
        <form
          onSubmit={handleSave}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {/* Editor Side */}
          <Card className="flex flex-col h-[75vh] shadow-lg">
            <CardHeader className="bg-muted/50 border-b pb-4">
              <CardTitle>Editor</CardTitle>
              <CardDescription>
                Write your content in standard Markdown.
              </CardDescription>

              <div className="mt-4 space-y-2">
                <Label htmlFor="title" className="text-foreground font-bold">
                  Page Title
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="e.g. Privacy Policy"
                  className="bg-background focus-visible:ring-primary"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 flex flex-col">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Start typing markdown here... Use # for headings, **bold**, etc."
                className="flex-1 w-full p-4 bg-background text-foreground resize-none focus:outline-none focus:ring-0 font-mono text-sm leading-relaxed"
              />
            </CardContent>
            <div className="p-4 border-t bg-muted/30">
              <Button
                type="submit"
                className="w-full font-bold shadow-sm"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                {loading ? "Saving..." : "Save Page"}
              </Button>
            </div>
          </Card>

          {/* Live Preview Side */}
          <Card className="flex flex-col h-[75vh] shadow-lg overflow-hidden">
            <CardHeader className="bg-muted/50 border-b pb-4">
              <CardTitle>Live Preview</CardTitle>
              <CardDescription>How it will look to the users.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 overflow-y-auto bg-background flex-1">
              <h1 className="text-4xl font-extrabold text-foreground mb-8 text-center">
                {title || "Untitled Page"}
              </h1>
              <div className="markdown-body text-foreground space-y-6 leading-relaxed">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                  components={{
                    h1: ({ node, ...props }) => (
                      <h1
                        className="text-3xl font-bold mt-8 mb-4 border-b pb-2"
                        {...props}
                      />
                    ),
                    h2: ({ node, ...props }) => (
                      <h2
                        className="text-2xl font-bold mt-8 mb-4 border-b pb-2"
                        {...props}
                      />
                    ),
                    h3: ({ node, ...props }) => (
                      <h3 className="text-xl font-bold mt-6 mb-3" {...props} />
                    ),
                    p: ({ node, ...props }) => (
                      <p className="mb-4 text-muted-foreground" {...props} />
                    ),
                    a: ({ node, ...props }) => (
                      <a
                        className="text-primary hover:underline font-medium"
                        {...props}
                      />
                    ),
                    ul: ({ node, ...props }) => (
                      <ul
                        className="list-disc pl-6 mb-4 space-y-2 text-muted-foreground"
                        {...props}
                      />
                    ),
                    ol: ({ node, ...props }) => (
                      <ol
                        className="list-decimal pl-6 mb-4 space-y-2 text-muted-foreground"
                        {...props}
                      />
                    ),
                    li: ({ node, ...props }) => <li className="" {...props} />,
                    blockquote: ({ node, ...props }) => (
                      <blockquote
                        className="border-l-4 border-primary pl-4 italic my-4 text-muted-foreground"
                        {...props}
                      />
                    ),
                    table: ({ node, ...props }) => (
                      <div className="overflow-x-auto my-6">
                        <table
                          className="min-w-full border-collapse border border-border"
                          {...props}
                        />
                      </div>
                    ),
                    th: ({ node, ...props }) => (
                      <th
                        className="border border-border bg-muted px-4 py-2 font-semibold text-left"
                        {...props}
                      />
                    ),
                    td: ({ node, ...props }) => (
                      <td
                        className="border border-border px-4 py-2"
                        {...props}
                      />
                    ),
                    code(props) {
                      const { children, className, node, ref, ...rest } = props;
                      const match = /language-(\w+)/.exec(className || "");
                      return match ? (
                        <SyntaxHighlighter
                          {...rest}
                          PreTag="div"
                          children={String(children).replace(/\n$/, "")}
                          language={match[1]}
                          style={vscDarkPlus as any}
                          className="rounded-md my-4"
                        />
                      ) : (
                        <code
                          {...rest}
                          className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-primary"
                        >
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {content || "*No content yet...*"}
                </ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        </form>
      )}
    </div>
  );
}
