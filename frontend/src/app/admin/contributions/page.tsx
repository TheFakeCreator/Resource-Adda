"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  CheckCircle,
  XCircle,
  FileText,
  User as UserIcon,
  BookOpen,
  ExternalLink,
  Calendar,
} from "lucide-react";

interface PendingQueue {
  documents: any[];
  experiences: any[];
  roadmaps: any[];
  wellbeingPosts: any[];
  wellbeingComments: any[];
}

export default function AdminModerationQueuePage() {
  const { token } = useAuthStore();
  const [queue, setQueue] = useState<PendingQueue>({
    documents: [],
    experiences: [],
    roadmaps: [],
    wellbeingPosts: [],
    wellbeingComments: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null); // e.g. 'document-123'
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ hasMore: false });

  const fetchPending = async () => {
    try {
      const res = await api.get(`/moderation/pending?page=${page}`);

      if (page === 1) {
        setQueue({
          documents: res.data.documents || [],
          experiences: res.data.experiences || [],
          roadmaps: res.data.roadmaps || [],
          wellbeingPosts: res.data.wellbeingPosts || [],
          wellbeingComments: res.data.wellbeingComments || [],
        });
      } else {
        setQueue((prev) => ({
          documents: [...prev.documents, ...(res.data.documents || [])],
          experiences: [...prev.experiences, ...(res.data.experiences || [])],
          roadmaps: [...prev.roadmaps, ...(res.data.roadmaps || [])],
          wellbeingPosts: [
            ...prev.wellbeingPosts,
            ...(res.data.wellbeingPosts || []),
          ],
          wellbeingComments: [
            ...prev.wellbeingComments,
            ...(res.data.wellbeingComments || []),
          ],
        }));
      }

      if (res.data.pagination) {
        setPagination(res.data.pagination);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          err.message ||
          "Failed to fetch pending queue",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchPending();
  }, [token, page]);

  const handleReview = async (
    type:
      | "document"
      | "experience"
      | "roadmap"
      | "wellbeing_post"
      | "wellbeing_comment",
    id: string,
    action: "approve" | "reject",
  ) => {
    setActionLoading(`${type}-${id}`);
    try {
      await api.post(`/moderation/${type}/${id}/review`, { action });

      // Remove the item from the queue instantly without a reload
      setQueue((prev) => {
        const next = { ...prev };
        if (type === "document")
          next.documents = next.documents.filter((d) => d._id !== id);
        if (type === "experience")
          next.experiences = next.experiences.filter((e) => e._id !== id);
        if (type === "roadmap")
          next.roadmaps = next.roadmaps.filter((r) => r._id !== id);
        if (type === "wellbeing_post")
          next.wellbeingPosts = next.wellbeingPosts.filter((p) => p._id !== id);
        if (type === "wellbeing_comment")
          next.wellbeingComments = next.wellbeingComments.filter(
            (c) => c._id !== id,
          );
        return next;
      });
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalPending =
    queue.documents.length +
    queue.experiences.length +
    queue.roadmaps.length +
    queue.wellbeingPosts.length +
    queue.wellbeingComments.length;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Moderation Queue
          </h2>
          <p className="text-muted-foreground mt-1">
            Review pending contributions before they go live.
          </p>
        </div>
        <Badge
          variant="outline"
          className="text-sm px-3 py-1 border-primary/20 bg-primary/10 text-primary"
        >
          {totalPending} Items Pending
        </Badge>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-xl">
          {error}
        </div>
      )}

      {totalPending === 0 ? (
        <div className="text-center py-20 bg-card border border-border rounded-2xl flex flex-col items-center">
          <CheckCircle className="h-16 w-16 text-emerald-500 mb-4 opacity-80" />
          <h3 className="text-xl font-bold">All caught up!</h3>
          <p className="text-muted-foreground">
            The moderation queue is completely empty.
          </p>
        </div>
      ) : (
        <div className="space-y-12">
          {/* RESOURCES (DOCUMENTS) */}
          {queue.documents.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold flex items-center gap-2 border-b border-border pb-2">
                <FileText className="h-5 w-5 text-blue-500" /> Academic
                Resources ({queue.documents.length})
              </h3>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {queue.documents.map((contrib) => (
                  <Card
                    key={contrib._id}
                    className="border-border shadow-sm flex flex-col"
                  >
                    <CardHeader className="pb-3 bg-muted/30">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg leading-tight line-clamp-1">
                          {contrib.documentId?.title || "Unknown Title"}
                        </CardTitle>
                        <div className="flex flex-col items-end gap-1">
                          <Badge variant="secondary" className="capitalize">
                            {contrib.documentId?.type}
                          </Badge>
                          {contrib.documentId?.reportCount >= 5 && (
                            <Badge variant="destructive" className="text-xs">
                              Reported {contrib.documentId.reportCount} times
                            </Badge>
                          )}
                        </div>
                      </div>
                      <CardDescription className="line-clamp-2 mt-2">
                        {contrib.documentId?.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4 flex-1">
                      <div className="grid grid-cols-2 gap-y-2 text-sm text-muted-foreground mb-4">
                        <div>
                          <span className="font-semibold text-foreground">
                            Subject:
                          </span>{" "}
                          {contrib.documentId?.subject}
                        </div>
                        <div>
                          <span className="font-semibold text-foreground">
                            Semester:
                          </span>{" "}
                          {contrib.documentId?.semester} (
                          {contrib.documentId?.branch})
                        </div>
                        <div className="col-span-2 flex items-center gap-2 mt-2">
                          <UserIcon className="h-4 w-4" />
                          <span className="font-medium text-foreground">
                            {contrib.userId?.name || contrib.userId?.email}
                          </span>
                          <span className="text-xs">
                            ({new Date(contrib.createdAt).toLocaleDateString()})
                          </span>
                        </div>
                      </div>
                      <a
                        href={contrib.documentId?.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm font-medium text-blue-500 hover:text-blue-600 transition-colors"
                      >
                        View Attached File{" "}
                        <ExternalLink className="ml-1 h-3 w-3" />
                      </a>
                    </CardContent>
                    <CardFooter className="pt-0 flex gap-3 border-t border-border mt-auto px-6 py-4">
                      <Button
                        className="flex-1 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white border border-emerald-500/20"
                        onClick={() =>
                          handleReview("document", contrib._id, "approve")
                        }
                        disabled={actionLoading === `document-${contrib._id}`}
                      >
                        {actionLoading === `document-${contrib._id}` ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle className="mr-2 h-4 w-4" /> Approve
                            (+50 XP)
                          </>
                        )}
                      </Button>
                      <Button
                        className="flex-1 bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white border border-rose-500/20"
                        onClick={() =>
                          handleReview("document", contrib._id, "reject")
                        }
                        disabled={actionLoading === `document-${contrib._id}`}
                      >
                        <XCircle className="mr-2 h-4 w-4" /> Reject
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* INTERVIEW EXPERIENCES */}
          {queue.experiences.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold flex items-center gap-2 border-b border-border pb-2">
                <UserIcon className="h-5 w-5 text-amber-500" /> Placement
                Experiences ({queue.experiences.length})
              </h3>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {queue.experiences.map((exp) => (
                  <Card
                    key={exp._id}
                    className="border-border shadow-sm flex flex-col"
                  >
                    <CardHeader className="pb-3 bg-muted/30">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg leading-tight">
                          {exp.company}
                        </CardTitle>
                        <div className="flex flex-col items-end gap-1">
                          <Badge
                            variant="outline"
                            className="text-amber-600 border-amber-600/30 bg-amber-500/10"
                          >
                            {exp.role}
                          </Badge>
                          {exp.reportCount >= 5 && (
                            <Badge variant="destructive" className="text-xs">
                              Reported {exp.reportCount} times
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-sm font-medium text-emerald-500">
                        {exp.verdict}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4 flex-1">
                      <div className="text-sm text-muted-foreground mb-4 line-clamp-3">
                        {exp.content.replace(/<[^>]*>?/gm, "")}{" "}
                        {/* Strip HTML for preview */}
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center">
                          <Calendar className="mr-1 h-4 w-4" /> {exp.year}
                        </span>
                        <span className="flex items-center">
                          <UserIcon className="mr-1 h-4 w-4" />{" "}
                          {exp.author?.name}
                        </span>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0 flex gap-3 border-t border-border mt-auto px-6 py-4">
                      <Button
                        className="flex-1 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white border border-emerald-500/20"
                        onClick={() =>
                          handleReview("experience", exp._id, "approve")
                        }
                        disabled={actionLoading === `experience-${exp._id}`}
                      >
                        {actionLoading === `experience-${exp._id}` ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle className="mr-2 h-4 w-4" /> Approve
                            (+100 XP)
                          </>
                        )}
                      </Button>
                      <Button
                        className="flex-1 bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white border border-rose-500/20"
                        onClick={() =>
                          handleReview("experience", exp._id, "reject")
                        }
                        disabled={actionLoading === `experience-${exp._id}`}
                      >
                        <XCircle className="mr-2 h-4 w-4" /> Reject
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* ROADMAPS */}
          {queue.roadmaps.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold flex items-center gap-2 border-b border-border pb-2">
                <BookOpen className="h-5 w-5 text-purple-500" /> Roadmaps (
                {queue.roadmaps.length})
              </h3>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {queue.roadmaps.map((rm) => (
                  <Card
                    key={rm._id}
                    className="border-border shadow-sm flex flex-col"
                  >
                    <CardHeader className="pb-3 bg-muted/30">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg leading-tight">
                          {rm.title}
                        </CardTitle>
                        {rm.reportCount >= 5 && (
                          <Badge variant="destructive" className="text-xs">
                            Reported {rm.reportCount} times
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="line-clamp-2 mt-2">
                        {rm.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4 flex-1">
                      <div className="text-sm font-semibold mb-2">
                        {rm.steps?.length || 0} Steps Included
                      </div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {rm.tags?.slice(0, 3).map((tag: string, i: number) => (
                          <Badge
                            key={i}
                            variant="secondary"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <UserIcon className="h-4 w-4" /> {rm.author?.name}
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0 flex gap-3 border-t border-border mt-auto px-6 py-4">
                      <Button
                        className="flex-1 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white border border-emerald-500/20"
                        onClick={() =>
                          handleReview("roadmap", rm._id, "approve")
                        }
                        disabled={actionLoading === `roadmap-${rm._id}`}
                      >
                        {actionLoading === `roadmap-${rm._id}` ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle className="mr-2 h-4 w-4" /> Approve
                            (+200 XP)
                          </>
                        )}
                      </Button>
                      <Button
                        className="flex-1 bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white border border-rose-500/20"
                        onClick={() =>
                          handleReview("roadmap", rm._id, "reject")
                        }
                        disabled={actionLoading === `roadmap-${rm._id}`}
                      >
                        <XCircle className="mr-2 h-4 w-4" /> Reject
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          )}
          {/* WELLBEING POSTS */}
          {queue.wellbeingPosts.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold flex items-center gap-2 border-b border-border pb-2">
                <BookOpen className="h-5 w-5 text-indigo-500" /> Wellbeing Posts
                ({queue.wellbeingPosts.length})
              </h3>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {queue.wellbeingPosts.map((post) => (
                  <Card
                    key={post._id}
                    className="border-border shadow-sm flex flex-col"
                  >
                    <CardHeader className="pb-3 bg-muted/30">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg leading-tight">
                          {post.title}
                        </CardTitle>
                        {post.reportCount >= 5 && (
                          <Badge variant="destructive" className="text-xs">
                            Reported {post.reportCount} times
                          </Badge>
                        )}
                      </div>
                      <Badge
                        variant="outline"
                        className="w-fit mt-2 capitalize"
                      >
                        {post.category}
                      </Badge>
                    </CardHeader>
                    <CardContent className="pt-4 flex-1">
                      <div className="text-sm text-muted-foreground mb-4 line-clamp-3">
                        {post.content}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <UserIcon className="h-4 w-4" />{" "}
                        {post.isAnonymous ? "Anonymous" : post.author?.name}
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0 flex gap-3 border-t border-border mt-auto px-6 py-4">
                      <Button
                        className="flex-1 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white border border-emerald-500/20"
                        onClick={() =>
                          handleReview("wellbeing_post", post._id, "approve")
                        }
                        disabled={
                          actionLoading === `wellbeing_post-${post._id}`
                        }
                      >
                        {actionLoading === `wellbeing_post-${post._id}` ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle className="mr-2 h-4 w-4" /> Approve
                          </>
                        )}
                      </Button>
                      <Button
                        className="flex-1 bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white border border-rose-500/20"
                        onClick={() =>
                          handleReview("wellbeing_post", post._id, "reject")
                        }
                        disabled={
                          actionLoading === `wellbeing_post-${post._id}`
                        }
                      >
                        <XCircle className="mr-2 h-4 w-4" /> Reject
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* WELLBEING COMMENTS */}
          {queue.wellbeingComments.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold flex items-center gap-2 border-b border-border pb-2">
                <FileText className="h-5 w-5 text-indigo-500" /> Wellbeing
                Comments ({queue.wellbeingComments.length})
              </h3>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {queue.wellbeingComments.map((comment) => (
                  <Card
                    key={comment._id}
                    className="border-border shadow-sm flex flex-col"
                  >
                    <CardHeader className="pb-3 bg-muted/30">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-sm leading-tight text-muted-foreground">
                          Comment on Post ID: {comment.post}
                        </CardTitle>
                        {comment.reportCount >= 5 && (
                          <Badge variant="destructive" className="text-xs">
                            Reported {comment.reportCount} times
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4 flex-1">
                      <div className="text-sm text-foreground mb-4 whitespace-pre-wrap">
                        {comment.content}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <UserIcon className="h-4 w-4" />{" "}
                        {comment.isAnonymous
                          ? "Anonymous"
                          : comment.author?.name}
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0 flex gap-3 border-t border-border mt-auto px-6 py-4">
                      <Button
                        className="flex-1 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white border border-emerald-500/20"
                        onClick={() =>
                          handleReview(
                            "wellbeing_comment",
                            comment._id,
                            "approve",
                          )
                        }
                        disabled={
                          actionLoading === `wellbeing_comment-${comment._id}`
                        }
                      >
                        {actionLoading ===
                        `wellbeing_comment-${comment._id}` ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle className="mr-2 h-4 w-4" /> Approve
                          </>
                        )}
                      </Button>
                      <Button
                        className="flex-1 bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white border border-rose-500/20"
                        onClick={() =>
                          handleReview(
                            "wellbeing_comment",
                            comment._id,
                            "reject",
                          )
                        }
                        disabled={
                          actionLoading === `wellbeing_comment-${comment._id}`
                        }
                      >
                        <XCircle className="mr-2 h-4 w-4" /> Reject
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {pagination.hasMore && (
            <div className="flex justify-center mt-8">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setPage((p) => p + 1)}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Load More Pending Items
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
