"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import confetti from "canvas-confetti";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Target,
  Clock,
  ShieldCheck,
  Ghost,
  User as UserIcon,
  BookOpen,
  AlertCircle,
  Link as LinkIcon,
  Star,
  MessageSquare,
} from "lucide-react";

// 1. Added Interfaces to properly type the nested arrays and prevent further build errors
interface Resource {
  type: string;
  title: string;
  url: string;
}

interface RoadmapStep {
  _id: string | number;
  title: string;
  description: string;
  prerequisites?: string[];
  resources?: Resource[];
}

export default function RoadmapDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [roadmap, setRoadmap] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const fetchRoadmap = async () => {
      try {
        const response = await api.get(`/roadmaps/${id}`);
        setRoadmap(response.data);
      } catch (error) {
        console.error("Failed to fetch roadmap details", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchRoadmap();
    }
  }, [id]);
  const completionRef = useRef<HTMLDivElement>(null);

  // Load progress from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(`roadmap_progress_${id}`);
    if (saved) {
      try {
        setCompletedSteps(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse roadmap progress");
      }
    }
  }, [id]);

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    if (mounted) {
      localStorage.setItem(
        `roadmap_progress_${id}`,
        JSON.stringify(completedSteps),
      );
    }
  }, [completedSteps, mounted, id]);

  const handleToggleStep = (index: number) => {
    setCompletedSteps((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  };

  let progressPercentage = 0;
  if (roadmap?.steps?.length) {
    progressPercentage = Math.round(
      (completedSteps.length / roadmap.steps.length) * 100,
    );
  }

  // Trigger confetti and scroll when 100% reached
  useEffect(() => {
    if (mounted && progressPercentage === 100) {
      // Small delay to allow the card to render first if it wasn't rendered
      setTimeout(() => {
        // Fire confetti
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#10b981", "#3b82f6", "#f59e0b", "#ec4899"],
        });

        // Scroll to the congratulations card
        completionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 300);
    }
  }, [progressPercentage, mounted]);

  if (!mounted || loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  if (!roadmap)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Roadmap not found
      </div>
    );

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* 1. Header Section */}
      <section className="bg-muted/30 border-b border-border pt-12 pb-16 relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl relative z-10">
          <div className="flex flex-wrap gap-3 mb-6">
            {roadmap.isOfficial && (
              <Badge className="bg-blue-500 text-white hover:bg-blue-600 px-3 py-1 shadow-sm">
                <ShieldCheck className="w-4 h-4 mr-1.5" />
                OFFICIAL
              </Badge>
            )}
            <Badge
              variant="outline"
              className={`px-3 py-1 border ${
                roadmap.difficulty === "Beginner"
                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                  : roadmap.difficulty === "Intermediate"
                    ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                    : "bg-rose-500/10 text-rose-600 border-rose-500/20"
              }`}
            >
              Difficulty: {roadmap.difficulty}
            </Badge>
            <Badge
              variant="outline"
              className="px-3 py-1 bg-slate-500/10 text-slate-600 border-slate-500/20 dark:text-slate-400"
            >
              <Clock className="w-4 h-4 mr-1.5" />
              {roadmap.estimatedTime}
            </Badge>
            <Badge
              variant="outline"
              className="px-3 py-1 bg-primary/10 text-primary border-primary/20"
            >
              <Target className="w-4 h-4 mr-1.5" />
              {roadmap.category}
            </Badge>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 leading-tight">
            {roadmap.title}
          </h1>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            {roadmap.description}
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-4 bg-background border border-border p-4 rounded-xl shadow-sm inline-flex">
              {roadmap.isAnonymous ? (
                <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center border border-border">
                  <Ghost className="h-5 w-5 text-slate-500" />
                </div>
              ) : (
                <Avatar className="h-10 w-10 border border-border">
                  <AvatarImage
                    src={roadmap.author?.avatarUrl}
                    alt={roadmap.author?.name}
                  />
                  <AvatarFallback>
                    <UserIcon className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Created by</p>
                <p className="font-semibold text-foreground">
                  {roadmap.isOfficial ? "Resource Adda" : roadmap.author?.name}
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
                {roadmap.upvotes}
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

      {/* 2. Sticky Progress Bar */}
      <div className="sticky top-[64px] z-40 bg-background/95 backdrop-blur border-b border-border py-4 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl flex items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex justify-between mb-2 text-sm font-medium">
              <span>Your Progress</span>
              <span className="text-primary">
                {progressPercentage}% ({completedSteps.length}/
                {roadmap.steps.length})
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2.5" />
          </div>
          <Button
            variant="outline"
            size="sm"
            className="hidden sm:flex"
            onClick={() => setCompletedSteps([])}
          >
            Reset
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl py-12">
        {/* Intro Notes */}
        {roadmap.introNotes && (
          <Card className="border-border bg-muted/30 shadow-none relative overflow-hidden mb-12">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary/50"></div>
            <CardHeader className="pb-3">
              <CardTitle className="text-xl flex items-center text-foreground">
                <BookOpen className="w-6 h-6 mr-2 text-primary" />
                Author's Intro Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed text-base">
                {roadmap.introNotes}
              </p>
            </CardContent>
          </Card>
        )}

        {/* 3. Global Prerequisites */}
        {roadmap.globalPrerequisites &&
          roadmap.globalPrerequisites.length > 0 && (
            <Card className="mb-16 border-amber-500/30 bg-amber-500/5 shadow-none relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center text-amber-600 dark:text-amber-500">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  Before you begin
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  {/* 2. Added types 'string' and 'number' */}
                  {roadmap.globalPrerequisites.map(
                    (prereq: string, idx: number) => (
                      <li key={idx}>{prereq}</li>
                    ),
                  )}
                </ul>
              </CardContent>
            </Card>
          )}

        {/* 4. Interactive Timeline */}
        <div className="relative pl-4 md:pl-8">
          {/* Vertical Timeline Line */}
          <div className="absolute left-[35px] md:left-[51px] top-4 bottom-4 w-0.5 bg-border z-0"></div>

          <div className="space-y-12">
            {/* 3. Added types 'RoadmapStep' and 'number' */}
            {roadmap.steps.map((step: RoadmapStep, index: number) => {
              const isCompleted = completedSteps.includes(index);

              return (
                <div
                  key={step._id}
                  className="relative z-10 flex gap-6 md:gap-8 group"
                >
                  {/* Timeline Node Checkbox */}
                  <div className="mt-1 flex-shrink-0">
                    <div
                      className={`relative w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                        isCompleted
                          ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/30"
                          : "bg-background border-muted-foreground/30 text-muted-foreground hover:border-primary"
                      }`}
                    >
                      <Checkbox
                        id={`step-${index}`}
                        checked={isCompleted}
                        onCheckedChange={() => handleToggleStep(index)}
                        className="opacity-0 absolute w-full h-full cursor-pointer z-20"
                      />
                      <span className="font-bold pointer-events-none">
                        {index + 1}
                      </span>
                    </div>
                  </div>

                  {/* Step Card */}
                  <Card
                    className={`flex-1 transition-all duration-300 ${
                      isCompleted
                        ? "border-primary/50 bg-primary/5 shadow-md"
                        : "border-border bg-card opacity-90 hover:opacity-100 hover:shadow-md"
                    }`}
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle
                          className={`text-xl md:text-2xl transition-colors ${isCompleted ? "text-primary" : ""}`}
                        >
                          {step.title}
                        </CardTitle>
                      </div>
                      <p className="text-muted-foreground mt-3 leading-relaxed">
                        {step.description}
                      </p>
                    </CardHeader>

                    <CardContent className="space-y-6">
                      {/* Step Prerequisites */}
                      {step.prerequisites && step.prerequisites.length > 0 && (
                        <div className="bg-muted/50 rounded-lg p-4">
                          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center">
                            <BookOpen className="w-3.5 h-3.5 mr-1.5" /> Required
                            Knowledge
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {/* 4. Added types 'string' and 'number' */}
                            {step.prerequisites.map(
                              (req: string, i: number) => (
                                <Badge
                                  key={i}
                                  variant="secondary"
                                  className="bg-background text-xs"
                                >
                                  {req}
                                </Badge>
                              ),
                            )}
                          </div>
                        </div>
                      )}

                      {/* Step Resources */}
                      {step.resources && step.resources.length > 0 && (
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center">
                            <LinkIcon className="w-3.5 h-3.5 mr-1.5" />{" "}
                            Recommended Resources
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {/* 5. Added types 'Resource' and 'number' */}
                            {step.resources.map((res: Resource, i: number) => (
                              <a
                                key={i}
                                href={res.url}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-colors group/link"
                              >
                                <div className="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center mr-3 flex-shrink-0">
                                  {res.type === "Video"
                                    ? "🎥"
                                    : res.type === "Course"
                                      ? "🎓"
                                      : "📄"}
                                </div>
                                <span className="text-sm font-medium line-clamp-2 group-hover/link:text-primary transition-colors">
                                  {res.title}
                                </span>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>

        {/* 5. Completion State */}
        {progressPercentage === 100 && (
          <div
            ref={completionRef}
            className="mt-16 bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 rounded-2xl p-8 text-center animate-in fade-in zoom-in duration-500"
          >
            <div className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/30">
              <Star className="w-8 h-8 fill-current" />
            </div>
            <h2 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">
              Congratulations! 🎉
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              You've completed all the steps in this roadmap. Don't forget to
              practice building projects and applying what you've learned!
            </p>
          </div>
        )}

        <Separator className="my-16" />

        {/* 6. Review Section Placeholder */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold flex items-center">
              <MessageSquare className="w-6 h-6 mr-2 text-primary" />
              Community Discussion
            </h2>
            <div className="flex items-center text-amber-500 font-bold">
              <Star className="w-5 h-5 mr-1 fill-current" />
              {roadmap.averageRating}{" "}
              <span className="text-muted-foreground text-sm font-normal ml-1">
                ({roadmap.totalRatings} ratings)
              </span>
            </div>
          </div>
          <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed border-border">
            <p className="text-muted-foreground">
              Reviews and discussions will be available soon. Keep learning!
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
