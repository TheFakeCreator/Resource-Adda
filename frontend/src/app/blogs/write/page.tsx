"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Image as ImageIcon,
  Send,
  UploadCloud,
  FileType,
  CheckCircle2,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Badge } from "@/components/ui/badge";

export default function WriteBlogPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [mediaUploading, setMediaUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Authenticate user check
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to write a blog.");
      router.push("/login?redirect=/blogs/write");
    }
  }, [router]);

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverImage(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;

    const file = e.target.files[0];
    setMediaUploading(true);

    try {
      const formData = new FormData();
      formData.append("media", file);

      const res = await api.post("/blogs/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const data = res.data;

      // Inject markdown image syntax into cursor position
      const textarea = contentTextareaRef.current;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const textToInsert = `\n![${file.name}](${data.url})\n`;

        const newContent =
          content.substring(0, start) + textToInsert + content.substring(end);
        setContent(newContent);

        // Wait for state to update, then focus cursor
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(
            start + textToInsert.length,
            start + textToInsert.length,
          );
        }, 0);
      } else {
        setContent((prev) => prev + `\n![${file.name}](${data.url})\n`);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to upload image.");
    } finally {
      setMediaUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = ""; // Reset input
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);

      // Parse tags (comma separated)
      const parsedTags = tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);
      formData.append("tags", JSON.stringify(parsedTags));

      if (coverImage) {
        formData.append("coverImage", coverImage);
      }

      const res = await api.post("/blogs", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const data = res.data;
      router.push(`/blogs/${data.slug}`);
    } catch (err) {
      console.error(err);
      alert("Error publishing blog. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col bg-background">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-white/10 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link
            href="/blogs"
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-lg font-semibold leading-tight">
              Write a Blog
            </h1>
            <p className="text-xs text-muted-foreground">Markdown supported</p>
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={submitting || !title.trim() || !content.trim()}
          className="gap-2 bg-primary hover:bg-primary/90"
        >
          {submitting ? (
            "Publishing..."
          ) : (
            <>
              Publish <Send className="h-4 w-4" />
            </>
          )}
        </Button>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-white/10 overflow-hidden">
        {/* Editor Pane */}
        <div className="flex flex-col h-full overflow-y-auto p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">
                Cover Image
              </Label>
              <div className="relative border-2 border-dashed border-white/10 hover:border-primary/50 transition-colors rounded-xl overflow-hidden group">
                {coverPreview ? (
                  <div className="relative w-full aspect-video">
                    <img
                      src={coverPreview}
                      alt="Cover Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setCoverImage(null);
                          setCoverPreview(null);
                        }}
                        className="absolute"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full aspect-[21/9] cursor-pointer bg-white/5 hover:bg-white/10">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <UploadCloud className="w-8 h-8 mb-3 text-muted-foreground" />
                      <p className="mb-1 text-sm text-muted-foreground">
                        <span className="font-semibold text-primary">
                          Click to upload
                        </span>{" "}
                        a cover image
                      </p>
                      <p className="text-xs text-muted-foreground/70">
                        SVG, PNG, JPG or WEBP (Max 5MB)
                      </p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleCoverChange}
                    />
                  </label>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <Input
                placeholder="Blog Title..."
                className="text-2xl font-bold bg-transparent border-none px-0 h-auto focus-visible:ring-0 placeholder:text-muted-foreground/50"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <Input
                placeholder="Tags (comma separated)... e.g. react, interview, tutorial"
                className="text-sm bg-transparent border-b border-t-0 border-x-0 border-white/10 rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary/50 placeholder:text-muted-foreground/50"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 flex flex-col pt-4">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                Markdown Content
              </Label>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleMediaUpload}
                className="hidden"
                accept="image/*"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 gap-2 bg-white/5 border-white/10"
                onClick={() => fileInputRef.current?.click()}
                disabled={mediaUploading}
              >
                {mediaUploading ? (
                  "Uploading..."
                ) : (
                  <>
                    <ImageIcon className="h-4 w-4" />
                    Insert Image
                  </>
                )}
              </Button>
            </div>
            <textarea
              ref={contentTextareaRef}
              placeholder="Write your brilliant ideas here... Markdown is supported! Use # for headings, ** for bold, and ``` for code blocks."
              className="flex-1 w-full bg-white/5 border border-white/10 rounded-lg p-4 font-mono text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary/50 min-h-[400px]"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
        </div>

        {/* Live Preview Pane */}
        <div className="flex flex-col h-full bg-black/20 overflow-y-auto p-6 hidden lg:flex">
          <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-6 flex items-center gap-2">
            <FileType className="h-4 w-4" /> Live Preview
          </Label>

          <article className="prose prose-invert prose-lg max-w-none flex-1 opacity-90 transition-all duration-300">
            {!title && !content && (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground/30 mt-20">
                <CheckCircle2 className="h-16 w-16 mb-4 opacity-20" />
                <p>Start writing to see the preview here</p>
              </div>
            )}

            {title && <h1 className="mb-8">{title}</h1>}

            {tags && (
              <div className="flex flex-wrap gap-2 mb-8 -mt-4 not-prose">
                {tags
                  .split(",")
                  .map((t) => t.trim())
                  .filter((t) => t.length > 0)
                  .map((tag, i) => (
                    <Badge
                      key={i}
                      variant="secondary"
                      className="bg-primary/10 text-primary border-none"
                    >
                      {tag}
                    </Badge>
                  ))}
              </div>
            )}

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
                      className="rounded-lg border border-white/10 !bg-[#1E1E1E]"
                      {...props}
                    >
                      {String(children).replace(/\n$/, "")}
                    </SyntaxHighlighter>
                  ) : (
                    <code
                      className="bg-white/10 px-1 py-0.5 rounded text-sm text-primary-foreground"
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },
                img({ node, ...props }: any) {
                  return (
                    <span className="block my-6 border border-white/10 rounded-xl overflow-hidden bg-black/50">
                      <img className="w-full h-auto" {...props} />
                    </span>
                  );
                },
              }}
            >
              {content}
            </ReactMarkdown>
          </article>
        </div>
      </div>
    </div>
  );
}
