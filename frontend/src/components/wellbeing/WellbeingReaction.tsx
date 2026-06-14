"use client";

import { useState } from "react";
import {
  HeartHandshake,
  Handshake,
  Lightbulb,
  Heart,
  SmilePlus,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type ReactionType = "hugs" | "relatable" | "helpful" | "care";

const REACTIONS = [
  {
    type: "hugs" as ReactionType,
    icon: HeartHandshake,
    color: "text-rose-500",
    bg: "bg-rose-500/20",
    label: "Hugs",
  },
  {
    type: "relatable" as ReactionType,
    icon: Handshake,
    color: "text-blue-500",
    bg: "bg-blue-500/20",
    label: "Relatable",
  },
  {
    type: "helpful" as ReactionType,
    icon: Lightbulb,
    color: "text-amber-500",
    bg: "bg-amber-500/20",
    label: "Helpful",
  },
  {
    type: "care" as ReactionType,
    icon: Heart,
    color: "text-purple-500",
    bg: "bg-purple-500/20",
    label: "Care",
  },
];

export default function WellbeingReaction({
  post,
  onReact,
}: {
  post: any;
  onReact: (postId: string, type: ReactionType) => Promise<void>;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [loading, setLoading] = useState(false);

  // Parse reactions to find current user's reaction (assuming frontend knows who they are, but for now we just show overall counts and active state)
  // Since we don't have global user state easily here, let's just assume the user reacted if they have a reaction in the local state update.
  // We'll rely on the parent component to pass down the 'hasReacted' or 'myReaction' state if possible, but let's just make it simple.

  const totalReactions = post.reactions ? post.reactions.length : 0;

  // Find top 2 reaction types for the summary icons
  const reactionCounts: Record<string, number> = {};
  (post.reactions || []).forEach((r: any) => {
    reactionCounts[r.type] = (reactionCounts[r.type] || 0) + 1;
  });

  const sortedReactions = Object.entries(reactionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2);

  const handleReact = async (e: React.MouseEvent, type: ReactionType) => {
    e.stopPropagation();
    if (loading) return;
    setLoading(true);
    try {
      await onReact(post._id, type);
    } finally {
      setIsHovered(false);
      setLoading(false);
    }
  };

  return (
    <div
      className="relative flex items-center group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* LinkedIn-style popover pill */}
      <div
        className={cn(
          "absolute bottom-full left-0 pb-2 transition-all duration-200 z-50",
          isHovered
            ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
            : "opacity-0 translate-y-2 scale-95 pointer-events-none",
        )}
      >
        <div className="bg-background border border-white/10 rounded-full px-2 py-1.5 flex items-center gap-1 shadow-xl">
          {REACTIONS.map((R) => (
            <button
              key={R.type}
              onClick={(e) => handleReact(e, R.type)}
              className="group/btn relative flex items-center justify-center p-2 rounded-full hover:bg-white/10 transition-colors"
              title={R.label}
            >
              <R.icon
                className={cn(
                  "h-5 w-5 transition-transform group-hover/btn:-translate-y-1 group-hover/btn:scale-110",
                  R.color,
                )}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Main Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsHovered(true);
        }}
        className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors h-8 px-2 -ml-2 rounded-md hover:bg-white/5"
      >
        {sortedReactions.length > 0 ? (
          <div className="flex items-center -space-x-1.5">
            {sortedReactions.map(([type], i) => {
              const ReactionData = REACTIONS.find((r) => r.type === type);
              if (!ReactionData) return null;
              return (
                <div
                  key={type}
                  className={cn(
                    "bg-background rounded-full p-0.5 z-" + (10 - i),
                  )}
                >
                  <div className={cn("rounded-full p-1", ReactionData.bg)}>
                    <ReactionData.icon
                      className={cn("h-3 w-3", ReactionData.color)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <SmilePlus className="h-4 w-4" />
        )}
        <span>{totalReactions > 0 ? totalReactions : "Support"}</span>
      </button>
    </div>
  );
}
