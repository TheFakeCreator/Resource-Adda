"use client";

import { useState } from "react";
import api from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Ghost, PlusCircle, User as UserIcon } from "lucide-react";

export default function SubmitWellbeingModal({
  onPostSubmitted,
}: {
  onPostSubmitted: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<
    "confession" | "question" | "support"
  >("confession");
  const [tags, setTags] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [files, setFiles] = useState<FileList | null>(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      formData.append("category", category);
      formData.append("tags", tags); // backend will split by comma
      formData.append("isAnonymous", isAnonymous ? "true" : "false");

      if (files) {
        for (let i = 0; i < files.length; i++) {
          formData.append("media", files[i]);
        }
      }

      await api.post("/wellbeing", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setOpen(false);
      setTitle("");
      setContent("");
      setCategory("confession");
      setTags("");
      setIsAnonymous(true);
      setFiles(null);
      onPostSubmitted();
    } catch (err) {
      console.error(err);
      setError("Failed to submit post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="gap-2 bg-primary/20 text-primary hover:bg-primary hover:text-primary-foreground border border-primary/50 backdrop-blur-md transition-all shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]" />
        }
      >
        <PlusCircle className="h-4 w-4" />
        Create Post
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] border border-white/10 bg-background/80 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle>Share with the Community</DialogTitle>
          <DialogDescription>
            This is a safe space. You can choose whether to share your post
            anonymously or with your real identity attached.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="category">What kind of post is this?</Label>
            <Select
              value={category}
              onValueChange={(val: any) => setCategory(val)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="confession">Confession / Venting</SelectItem>
                <SelectItem value="question">Asking a Question</SelectItem>
                <SelectItem value="support">Offering Peer Support</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Keep it brief..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Your Message</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind? We are listening."
              className="min-h-[150px]"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (optional, comma separated)</Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g. stress, exams, placement"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="media">Attach Media (optional)</Label>
            <Input
              id="media"
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={(e) => setFiles(e.target.files)}
              className="cursor-pointer file:cursor-pointer"
            />
            <p className="text-xs text-muted-foreground">
              You can upload images or short videos to provide context.
            </p>
          </div>

          {error && (
            <p className="text-sm text-destructive font-medium">{error}</p>
          )}

          <div className="flex items-center space-x-3 border border-white/5 p-3 rounded-lg bg-black/20">
            <Switch
              id="anonymous"
              checked={isAnonymous}
              onCheckedChange={setIsAnonymous}
            />
            <div className="space-y-0.5">
              <Label htmlFor="anonymous" className="cursor-pointer">
                Post Anonymously
              </Label>
              <p className="text-xs text-muted-foreground">
                {isAnonymous
                  ? "Your identity will be hidden."
                  : "Your public profile will be attached."}
              </p>
            </div>
          </div>

          <div className="pt-4 mt-6 border-t border-white/5 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="gap-2">
              {loading ? (
                <>Posting...</>
              ) : (
                <>
                  {isAnonymous ? (
                    <Ghost className="h-4 w-4" />
                  ) : (
                    <UserIcon className="h-4 w-4" />
                  )}
                  {isAnonymous ? "Post Anonymously" : "Post Publicly"}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
