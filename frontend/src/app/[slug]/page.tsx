/* eslint-disable @typescript-eslint/no-unused-vars */
import { notFound } from "next/navigation";
import api from "@/lib/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import "katex/dist/katex.min.css"; // For math styling

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function fetchPageData(slug: string) {
  try {
    const res = await api.get(`/pages/${slug}`, {
      // In Next.js App router, external fetches via axios aren't cached automatically like fetch() is,
      // but since this is for demonstration we'll just fetch it. In production, `fetch` with `next: { revalidate }` is better.
    });
    return res.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
}

export default async function DynamicPage({ params }: PageProps) {
  const resolvedParams = await params;
  const pageData = await fetchPageData(resolvedParams.slug);

  if (!pageData) {
    notFound(); // Triggers Next.js 404 page
  }

  return (
    <div className="min-h-screen bg-background py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-extrabold text-foreground mb-8 text-center">
          {pageData.title}
        </h1>
        <div className="bg-card shadow-sm border rounded-xl p-8 md:p-12">
          {/* We use prose classes from Tailwind Typography to beautifully format the markdown */}
          {/* Note: since we didn't install @tailwindcss/typography, we'll write custom classes or install it. Let's just use raw custom CSS or install it. */}
          {/* Actually it's easier to use a simple wrapper class if prose isn't installed. Let's assume we don't have it, we'll style basic elements manually. */}
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
                  <td className="border border-border px-4 py-2" {...props} />
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
              {pageData.content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}
