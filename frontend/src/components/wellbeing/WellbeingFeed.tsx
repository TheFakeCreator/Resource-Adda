"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, PlaySquare } from "lucide-react";
import SubmitWellbeingModal from "./SubmitWellbeingModal";
import WellbeingPostModal from "./WellbeingPostModal";
import WellbeingReaction, { ReactionType } from "./WellbeingReaction";

// Component to handle YouTube-style sliding comments preview
function CommentTicker({ comments }: { comments: any[] }) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (!comments || comments.length <= 1) return;
    const interval = setInterval(() => {
      setIdx((prev) => (prev + 1) % comments.length);
    }, 4000); // Slide every 4 seconds
    return () => clearInterval(interval);
  }, [comments]);

  if (!comments || comments.length === 0) return null;

  return (
    <div className="mt-4 bg-black/20 rounded-md h-9 overflow-hidden relative border border-white/5 w-full">
      <div
        className="flex flex-col w-full transition-transform duration-500 ease-in-out"
        style={{ transform: `translateY(-${idx * 36}px)` }} // h-9 = 36px
      >
        {comments.map((comment, i) => (
          <div
            key={i}
            className="h-9 flex items-center gap-2 px-3 w-full shrink-0 box-border"
          >
            <span className="text-[10px] font-bold opacity-60 shrink-0 whitespace-nowrap">
              {comment.author?.name?.split(" ")[0]}:
            </span>
            <span className="text-[11px] truncate opacity-90 leading-none">
              {comment.content}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function WellbeingFeed() {
  const { user } = useAuthStore();
  const [posts, setPosts] = useState<any[]>([]);
  const [category, setCategory] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const url =
        category === "all" ? "/wellbeing" : `/wellbeing?category=${category}`;
      const res = await api.get(url);
      setPosts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReaction = async (postId: string, type: ReactionType) => {
    // Optimistic UI update
    const currentUserId = user?._id || "unauthenticated";

    setPosts((prevPosts) =>
      prevPosts.map((p) => {
        if (p._id !== postId) return p;

        const newReactions = [...(p.reactions || [])];
        const existingIdx = newReactions.findIndex(
          (r) => r.user === currentUserId,
        );

        if (existingIdx !== -1) {
          if (newReactions[existingIdx].type === type) {
            newReactions.splice(existingIdx, 1); // remove
          } else {
            newReactions[existingIdx] = { ...newReactions[existingIdx], type }; // update
          }
        } else {
          newReactions.push({ type, user: currentUserId }); // add
        }

        const updatedPost = { ...p, reactions: newReactions };
        if (selectedPost?._id === postId) {
          setSelectedPost(updatedPost);
        }
        return updatedPost;
      }),
    );

    try {
      await api.post(`/wellbeing/${postId}/react`, { type });
    } catch (err) {
      console.error(err);
      fetchPosts(); // Revert on failure
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [category]);

  return (
    <div className="w-full max-w-6xl mx-auto py-12 px-4 md:px-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
        <Tabs
          defaultValue="all"
          onValueChange={setCategory}
          className="w-full md:w-auto"
        >
          <TabsList className="bg-white/5 border border-white/10 backdrop-blur-md">
            <TabsTrigger value="all">Everything</TabsTrigger>
            <TabsTrigger value="confession">Confessions</TabsTrigger>
            <TabsTrigger value="question">Questions</TabsTrigger>
            <TabsTrigger value="support">Peer Support</TabsTrigger>
          </TabsList>
        </Tabs>

        <SubmitWellbeingModal onPostSubmitted={fetchPosts} />
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-white/10 h-10 w-10"></div>
            <div className="flex-1 space-y-6 py-1">
              <div className="h-2 bg-white/10 rounded"></div>
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-4">
                  <div className="h-2 bg-white/10 rounded col-span-2"></div>
                  <div className="h-2 bg-white/10 rounded col-span-1"></div>
                </div>
                <div className="h-2 bg-white/10 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-24 text-muted-foreground">
          <p>No posts found in this category.</p>
        </div>
      ) : (
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {posts.map((post) => (
            <Card
              key={post._id}
              className="break-inside-avoid bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors cursor-pointer flex flex-col"
              onClick={() => {
                setSelectedPost(post);
                setModalOpen(true);
              }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
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
                  <span className="text-xs text-muted-foreground">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <CardTitle className="text-xl leading-tight">
                  {post.title}
                </CardTitle>
                <div className="flex items-center gap-2 mt-4">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={post.author.avatarUrl} />
                    <AvatarFallback>AN</AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-muted-foreground">
                    {post.author.name}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap">
                  {post.content}
                </p>

                {post.mediaUrls && post.mediaUrls.length > 0 && (
                  <div className="mt-4 rounded-md overflow-hidden border border-white/10 bg-black/50 aspect-video relative">
                    {post.mediaUrls[0].match(/\.(mp4|webm|ogg)$/i) ? (
                      <>
                        <video
                          src={post.mediaUrls[0]}
                          className="w-full h-full object-cover opacity-80"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <PlaySquare className="h-10 w-10 text-white/70" />
                        </div>
                      </>
                    ) : (
                      <img
                        src={post.mediaUrls[0]}
                        alt="Post media"
                        className="w-full h-full object-cover"
                      />
                    )}
                    {post.mediaUrls.length > 1 && (
                      <div className="absolute top-2 right-2 bg-black/60 px-2 py-0.5 rounded text-[10px] text-white">
                        +{post.mediaUrls.length - 1} more
                      </div>
                    )}
                  </div>
                )}

                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {post.tags.map((tag: string, i: number) => (
                      <span
                        key={i}
                        className="text-xs text-muted-foreground bg-black/20 px-2 py-1 rounded-md"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-2 pb-4 border-t border-white/5 flex flex-col items-stretch">
                <div className="flex items-center justify-between w-full">
                  <WellbeingReaction post={post} onReact={handleReaction} />
                  <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <MessageCircle className="h-4 w-4" />
                    <span>{post.comments?.length || 0} Replies</span>
                  </button>
                </div>

                {post.comments && post.comments.length > 0 && (
                  <CommentTicker comments={post.comments} />
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {selectedPost && (
        <WellbeingPostModal
          post={selectedPost}
          open={modalOpen}
          onOpenChange={setModalOpen}
          onCommentAdded={fetchPosts}
          onReact={handleReaction}
        />
      )}
    </div>
  );
}
