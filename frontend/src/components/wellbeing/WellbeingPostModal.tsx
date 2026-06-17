"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Send, CornerDownRight, Flag } from "lucide-react";
import WellbeingReaction, { ReactionType } from "./WellbeingReaction";
import { ReportModal } from "@/components/ui/ReportModal";

function CommentNode({
  comment,
  onReply,
  nestingLevel = 0,
}: {
  comment: any;
  onReply: (parentId: string) => void;
  nestingLevel?: number;
}) {
  return (
    <div
      className={`flex gap-4 ${nestingLevel > 0 ? "ml-8 mt-4 border-l border-white/10 pl-4 relative" : "mt-6"}`}
    >
      {nestingLevel > 0 && (
        <CornerDownRight className="absolute -left-[18px] top-4 h-4 w-4 text-white/20" />
      )}
      <Avatar className="h-8 w-8 shrink-0 mt-1">
        <AvatarImage src={comment.author?.avatarUrl} />
        <AvatarFallback>AN</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="bg-white/5 rounded-2xl rounded-tl-none p-4 border border-white/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              {comment.author?.name || "Anonymous Student"}
            </span>
            <span className="text-xs text-muted-foreground">
              {new Date(comment.createdAt).toLocaleDateString()}
            </span>
          </div>
          <p className="text-sm text-foreground/80 whitespace-pre-wrap">
            {comment.content}
          </p>
        </div>

        {nestingLevel === 0 && (
          <button
            onClick={() => onReply(comment._id)}
            className="text-xs text-muted-foreground hover:text-primary mt-2 ml-2 transition-colors font-medium"
          >
            Reply
          </button>
        )}
        <div className="inline-block mt-2 ml-4">
          <ReportModal
            itemId={comment._id}
            itemModel="WellbeingComment"
            triggerButton={
              <button className="text-xs text-muted-foreground hover:text-destructive transition-colors font-medium flex items-center gap-1">
                <Flag className="h-3 w-3" /> Report
              </button>
            }
          />
        </div>

        {comment.replies && comment.replies.length > 0 && (
          <div className="space-y-2">
            {comment.replies.map((reply: any, index: number) => (
              <CommentNode
                key={reply._id || index}
                comment={reply}
                onReply={onReply}
                nestingLevel={nestingLevel + 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function WellbeingPostModal({
  post,
  open,
  onOpenChange,
  onCommentAdded,
  onReact,
}: {
  post: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCommentAdded: () => void;
  onReact: (postId: string, type: ReactionType) => Promise<void>;
}) {
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [comments, setComments] = useState<any[]>(post?.comments || []);
  const [loadingComments, setLoadingComments] = useState(false);

  const fetchComments = useCallback(async () => {
    if (!post?._id || post._id.startsWith("dummy-")) {
      // If it's a dummy post, just use the local dummy comments
      setComments(post.comments || []);
      return;
    }

    setLoadingComments(true);
    try {
      const res = await api.get(`/wellbeing/${post._id}/comments`);
      setComments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingComments(false);
    }
  }, [post]);

  useEffect(() => {
    if (open && post?._id) {
      fetchComments();
    }
  }, [open, post?._id, fetchComments]);

  if (!post) return null;

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    if (post._id.startsWith("dummy-")) {
      // Dummy mode update
      const newComment = {
        _id: "dummy-c-" + Date.now(),
        author: {
          name: "Anonymous Student",
          avatarUrl:
            "https://ui-avatars.com/api/?name=Anonymous&background=random",
        },
        content: commentText,
        createdAt: new Date().toISOString(),
        replies: [],
      };

      if (replyingTo) {
        const newComments = [...comments];
        const parent = newComments.find((c) => c._id === replyingTo);
        if (parent) {
          if (!parent.replies) parent.replies = [];
          parent.replies.push(newComment);
        }
        setComments(newComments);
      } else {
        setComments([...comments, newComment]);
      }

      setCommentText("");
      setReplyingTo(null);
      onCommentAdded();
      return;
    }

    setSubmitting(true);
    try {
      await api.post(`/wellbeing/${post._id}/comments`, {
        content: commentText,
        isAnonymous: isAnonymous,
        parentComment: replyingTo,
      });
      setCommentText("");
      setReplyingTo(null);
      fetchComments(); // Refresh comment tree
      onCommentAdded();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        onOpenChange(val);
        if (!val) setReplyingTo(null);
      }}
    >
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col p-0 border border-white/10 bg-background/95 backdrop-blur-xl overflow-hidden">
        <DialogHeader className="p-6 border-b border-white/10 shrink-0">
          <div className="flex items-center justify-between mb-4">
            <Badge
              variant={
                post.category === "support"
                  ? "default"
                  : post.category === "question"
                    ? "secondary"
                    : "destructive"
              }
              className="capitalize bg-opacity-20 border-none"
            >
              {post.category}
            </Badge>
            <div className="flex items-center gap-4">
              <span className="text-xs text-muted-foreground">
                {new Date(post.createdAt).toLocaleDateString()}
              </span>
              <ReportModal itemId={post._id} itemModel="WellbeingPost" />
            </div>
          </div>
          <DialogTitle className="text-2xl leading-tight mb-2">
            {post.title}
          </DialogTitle>
          <div className="flex items-center gap-3 mt-4">
            <Avatar className="h-8 w-8">
              <AvatarImage src={post.author?.avatarUrl} />
              <AvatarFallback>AN</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">
              {post.author?.name || "Anonymous Student"}
            </span>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="text-foreground/90 whitespace-pre-wrap leading-relaxed text-[15px]">
            {post.content}
          </div>

          {post.mediaUrls && post.mediaUrls.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              {post.mediaUrls.map((url: string, i: number) => (
                <div
                  key={i}
                  className="relative rounded-lg overflow-hidden border border-white/10 bg-black/50 aspect-video"
                >
                  {url.match(/\.(mp4|webm|ogg)$/i) ? (
                    <video
                      src={url}
                      controls
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <img
                      src={url}
                      alt="Attached media"
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-6">
              {post.tags.map((tag: string, i: number) => (
                <span
                  key={i}
                  className="text-xs text-muted-foreground bg-white/5 px-2.5 py-1 rounded-md border border-white/5"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="mt-6 flex items-center">
            <WellbeingReaction post={post} onReact={onReact} />
          </div>

          <div className="mt-8 pt-6 border-t border-white/10">
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              Responses{" "}
              <span className="bg-white/10 text-xs px-2 py-0.5 rounded-full">
                {comments?.length || 0}
              </span>
            </h3>

            {loadingComments ? (
              <div className="py-8 text-center text-sm text-muted-foreground animate-pulse">
                Loading comments...
              </div>
            ) : (
              <div className="space-y-2 pb-4">
                {comments && comments.length > 0 ? (
                  comments.map((comment: any, i: number) => (
                    <CommentNode
                      key={comment._id || i}
                      comment={comment}
                      onReply={(id) => setReplyingTo(id)}
                    />
                  ))
                ) : (
                  <div className="text-center py-12 bg-white/5 rounded-lg border border-white/5 border-dashed mt-6">
                    <p className="text-sm text-muted-foreground">
                      No responses yet. Be the first to reply!
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-white/10 bg-background/50 shrink-0">
          {replyingTo && (
            <div className="flex items-center justify-between mb-2 px-2">
              <span className="text-xs font-medium text-primary">
                Replying to comment...
              </span>
              <button
                onClick={() => setReplyingTo(null)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
            </div>
          )}

          <div className="flex items-center gap-2 mb-3 px-2">
            <Switch
              id="anon-comment"
              checked={isAnonymous}
              onCheckedChange={setIsAnonymous}
            />
            <Label
              htmlFor="anon-comment"
              className="text-xs text-muted-foreground cursor-pointer"
            >
              {isAnonymous ? "Posting anonymously" : "Posting publicly"}
            </Label>
          </div>

          <form onSubmit={handleSubmitComment} className="flex gap-3">
            <Input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={
                replyingTo
                  ? "Write a reply..."
                  : "Write a supportive response anonymously..."
              }
              className="flex-1 rounded-full bg-white/5 border-white/10 focus-visible:ring-1"
            />
            <Button
              type="submit"
              disabled={submitting || !commentText.trim()}
              size="icon"
              className="rounded-full shrink-0 bg-primary/20 hover:bg-primary text-primary hover:text-primary-foreground border border-primary/50"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
