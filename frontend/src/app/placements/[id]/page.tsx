"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Building2,
  Briefcase,
  CheckCircle2,
  XCircle,
  Clock,
  Ghost,
  User as UserIcon,
  Lightbulb,
  Target,
  BookOpen,
  MessageSquare,
  IndianRupee,
} from "lucide-react";

const getStatusConfig = (status: string) => {
  switch (status.toLowerCase()) {
    case "accepted":
      return {
        icon: <CheckCircle2 className="w-5 h-5 mr-2 text-emerald-500" />,
        class: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
      };
    case "rejected":
      return {
        icon: <XCircle className="w-5 h-5 mr-2 text-rose-500" />,
        class: "text-rose-500 bg-rose-500/10 border-rose-500/20",
      };
    case "pending":
      return {
        icon: <Clock className="w-5 h-5 mr-2 text-amber-500" />,
        class: "text-amber-500 bg-amber-500/10 border-amber-500/20",
      };
    default:
      return {
        icon: <CheckCircle2 className="w-5 h-5 mr-2 text-muted-foreground" />,
        class: "text-muted-foreground bg-muted border-border",
      };
  }
};

export default function PlacementDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [experience, setExperience] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExperience = async () => {
      try {
        const response = await api.get(`/placements/${id}`);
        setExperience(response.data);
      } catch (error) {
        console.error("Failed to fetch experience details", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchExperience();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading experience...
      </div>
    );
  }

  if (!experience) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Experience not found
      </div>
    );
  }

  const statusConfig = getStatusConfig(experience.offerStatus);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* 1. Header Section */}
      <section className="bg-muted/30 border-b border-border pt-12 pb-16 relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl relative z-10">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <Badge
              variant="outline"
              className={
                statusConfig.class + " px-3 py-1 text-sm font-semibold"
              }
            >
              {statusConfig.icon}
              {experience.offerStatus}
            </Badge>
            <Badge
              variant="outline"
              className="bg-primary/10 text-primary border-primary/20 px-3 py-1"
            >
              {experience.type}
            </Badge>
            <Badge
              variant="outline"
              className={`px-3 py-1 border ${
                experience.difficulty === "Easy"
                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                  : experience.difficulty === "Medium"
                    ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                    : "bg-rose-500/10 text-rose-600 border-rose-500/20"
              }`}
            >
              Difficulty: {experience.difficulty}
            </Badge>
            {experience.ctc && (
              <Badge
                variant="outline"
                className="bg-emerald-500 text-white hover:bg-emerald-600 border-transparent px-3 py-1 shadow-sm flex items-center gap-1.5"
              >
                <IndianRupee className="w-4 h-4" />
                CTC: {experience.ctc}
              </Badge>
            )}
          </div>

          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 leading-tight">
            {experience.title}
          </h1>

          <div className="flex flex-wrap gap-6 mb-8 text-muted-foreground">
            <div className="flex items-center font-medium text-foreground">
              <Building2 className="w-5 h-5 mr-2 text-muted-foreground" />
              {experience.company}
            </div>
            <div className="flex items-center font-medium text-foreground">
              <Briefcase className="w-5 h-5 mr-2 text-muted-foreground" />
              {experience.role}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-4 bg-background border border-border p-4 rounded-xl shadow-sm inline-flex">
              {experience.isAnonymous ? (
                <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center border border-border">
                  <Ghost className="h-5 w-5 text-slate-500" />
                </div>
              ) : (
                <Avatar className="h-10 w-10 border border-border">
                  <AvatarImage
                    src={experience.author?.avatarUrl}
                    alt={experience.author?.name}
                  />
                  <AvatarFallback>
                    <UserIcon className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Written by</p>
                <p className="font-semibold text-foreground">
                  {experience.isAnonymous
                    ? "Anonymous Student"
                    : experience.author?.name}
                </p>
              </div>
            </div>

            <div className="flex items-center bg-background border border-border rounded-xl shadow-sm overflow-hidden h-full">
              <button className="flex items-center gap-1.5 px-4 py-4 hover:bg-emerald-500/10 hover:text-emerald-600 transition-colors border-r border-border font-medium">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m18 15-6-6-6 6" />
                </svg>
                {experience.upvotes}
              </button>
              <button className="flex items-center gap-1.5 px-4 py-4 hover:bg-rose-500/10 hover:text-rose-600 transition-colors font-medium">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl py-12">
        {/* 2. Preparation Strategy */}
        {experience.preparationStrategy && (
          <Card className="border-blue-500/30 bg-blue-500/5 shadow-none relative overflow-hidden mb-16">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
            <CardHeader className="pb-3">
              <CardTitle className="text-xl flex items-center text-blue-600 dark:text-blue-400">
                <Target className="w-6 h-6 mr-2" />
                Preparation Strategy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed text-base">
                {experience.preparationStrategy}
              </p>
            </CardContent>
          </Card>
        )}

        {/* 3. Round by Round Breakdown */}
        <h2 className="text-2xl font-bold mb-8 flex items-center">
          <BookOpen className="w-6 h-6 mr-2 text-primary" />
          Interview Rounds ({experience.rounds.length})
        </h2>

        <div className="relative pl-4 md:pl-8 space-y-12 mb-16">
          {/* Vertical Timeline Line */}
          <div className="absolute left-[35px] md:left-[51px] top-4 bottom-4 w-0.5 bg-border z-0"></div>

          {experience.rounds.map((round, index) => (
            <div
              key={round._id}
              className="relative z-10 flex gap-6 md:gap-8 group"
            >
              {/* Timeline Node */}
              <div className="mt-1 flex-shrink-0">
                <div className="relative w-10 h-10 rounded-full flex items-center justify-center border-2 border-primary bg-background text-primary font-bold shadow-sm">
                  {index + 1}
                </div>
              </div>

              {/* Round Card */}
              <Card className="flex-1 border-border shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                    <CardTitle className="text-xl text-primary">
                      {round.title}
                    </CardTitle>
                    {round.duration && (
                      <Badge
                        variant="outline"
                        className="w-fit bg-slate-500/10 text-slate-600 border-slate-500/20"
                      >
                        ⏱️ {round.duration}
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="prose prose-sm dark:prose-invert max-w-none mb-6 whitespace-pre-wrap text-muted-foreground">
                    {round.description}
                  </div>

                  {round.topics && round.topics.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                        Topics Covered
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {round.topics.map((topic, i) => (
                          <Badge
                            key={i}
                            variant="secondary"
                            className="bg-muted"
                          >
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* 4. Advice for Juniors */}
        {experience.adviceForJuniors && (
          <Card className="border-amber-500/30 bg-amber-500/5 shadow-none relative overflow-hidden mt-8 mb-16">
            <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
            <CardHeader className="pb-3">
              <CardTitle className="text-xl flex items-center text-amber-600 dark:text-amber-500">
                <Lightbulb className="w-6 h-6 mr-2" />
                Advice for Juniors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed text-base font-medium">
                "{experience.adviceForJuniors}"
              </p>
            </CardContent>
          </Card>
        )}

        <Separator className="my-16" />

        {/* 5. Comments Placeholder */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold flex items-center">
              <MessageSquare className="w-6 h-6 mr-2 text-primary" />
              Comments & Discussion
            </h2>
          </div>
          <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed border-border">
            <p className="text-muted-foreground">
              Comments section will be available soon. Ask questions to the
              author directly!
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
