"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  UploadCloud,
  Map,
  Target,
  Heart,
  Sparkles,
  MessageSquare,
  ShieldCheck,
  Users,
  Briefcase,
} from "lucide-react";
import { useConfigStore } from "@/store/useConfigStore";

const STATS = [
  {
    label: "Verified Resources",
    value: "1,200+",
    icon: <BookOpen className="w-5 h-5 text-blue-500" />,
  },
  {
    label: "Interview Experiences",
    value: "85+",
    icon: <Briefcase className="w-5 h-5 text-indigo-500" />,
  },
  {
    label: "Active Roadmaps",
    value: "24",
    icon: <Map className="w-5 h-5 text-emerald-500" />,
  },
  {
    label: "Community Members",
    value: "3,500+",
    icon: <Users className="w-5 h-5 text-amber-500" />,
  },
];

const TESTIMONIALS = [
  {
    name: "Rahul Verma",
    role: "SDE @ Amazon | Alumnus",
    content:
      "Resource Adda's interview experiences and roadmaps were instrumental in my placement journey. It's exactly what I needed during my final year.",
    avatar: "https://ui-avatars.com/api/?name=Rahul+Verma&background=random",
  },
  {
    name: "Sneha Patel",
    role: "3rd Year, IT",
    content:
      "The featured section with stress-free notes saved me during the end-sems. I didn't have to scroll through endless PDFs to find what matters.",
    avatar: "https://ui-avatars.com/api/?name=Sneha+Patel&background=random",
  },
  {
    name: "Aman Gupta",
    role: "2nd Year, CS",
    content:
      "I love the MERN stack roadmap. It gave me a clear step-by-step path instead of getting lost in tutorial hell.",
    avatar: "https://ui-avatars.com/api/?name=Aman+Gupta&background=random",
  },
];

export default function Home() {
  const { taglineLanguage, isLoaded } = useConfigStore();

  const hindiTagline = "HAA BHAI... AA GAYA PADHNE\nNOTES NAHI MIL RAHE ??";
  const englishTagline = "HEY THERE... HERE TO STUDY?\nCAN'T FIND THE NOTES ??";

  return (
    <div className="flex-1 bg-background flex flex-col items-center w-full relative overflow-hidden">
      {/* 1. Hero Section */}
      <section className="w-full relative flex flex-col items-center justify-center min-h-[calc(100vh-5rem)] px-4 py-10 md:py-12 text-center">
        {/* Floating background elements */}
        <div className="absolute top-[10%] left-[15%] w-24 h-24 bg-blue-500/20 rounded-full blur-2xl animate-pulse" />
        <div className="absolute bottom-[20%] right-[10%] w-32 h-32 bg-amber-500/20 rounded-full blur-2xl animate-pulse delay-700" />
        <div className="absolute top-[40%] right-[25%] w-20 h-20 bg-emerald-500/20 rounded-full blur-2xl animate-pulse delay-1000" />

        <Badge
          variant="outline"
          className="mb-8 border-primary/30 text-primary bg-primary/5 px-4 py-1.5 rounded-full font-medium shadow-sm flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          The Ultimate NITRR Survival Guide
        </Badge>

        <div className="max-w-5xl relative z-10 w-full flex flex-col items-center">
          {isLoaded && (
            <div className="relative inline-block rotate-[-2deg] mb-8 md:mb-10 mr-8 md:mr-16">
              {/* Added mr-8 md:mr-16 to shift it slightly left to fix centering visual balance */}
              <div className="bg-slate-900/90 backdrop-blur-md text-white p-6 md:p-10 rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.8)] border-4 border-slate-900 dark:border-white transition-transform hover:scale-105 duration-300">
                <p
                  className="text-3xl md:text-5xl lg:text-6xl whitespace-pre-wrap leading-[1.2] text-amber-50"
                  style={{
                    fontFamily: "var(--font-marker)",
                    letterSpacing: "2px",
                  }}
                >
                  {taglineLanguage === "hindi" ? hindiTagline : englishTagline}
                </p>
              </div>
              {/* Playful accent */}
              <div className="absolute -bottom-5 -right-5 w-14 h-14 bg-amber-400 rounded-full border-4 border-slate-900 dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.8)] flex items-center justify-center animate-bounce">
                <span className="text-2xl">✨</span>
              </div>
            </div>
          )}

          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl leading-relaxed">
            Everything you need to ace your exams, learn modern skills, and
            crack top placements. Curated by the community, for the community.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="/register">
              <Button
                size="lg"
                className="w-full sm:w-auto h-16 px-10 text-xl rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.8)] border-2 border-foreground hover:translate-y-1 hover:shadow-none transition-all font-bold group"
              >
                Join the Community{" "}
                <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/explore">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto h-16 px-10 text-xl rounded-2xl bg-background shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.8)] border-2 border-foreground hover:translate-y-1 hover:shadow-none transition-all font-bold text-foreground"
              >
                Explore Library
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Stats Banner */}
      <section className="w-full border-y border-border bg-muted/20 py-10">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-border/50">
            {STATS.map((stat, idx) => (
              <div
                key={idx}
                className={`flex flex-col items-center justify-center text-center ${idx % 2 !== 0 ? "pl-8" : ""}`}
              >
                <div className="mb-2 bg-background p-3 rounded-full border border-border shadow-sm">
                  {stat.icon}
                </div>
                <h3 className="text-3xl font-black text-foreground mb-1">
                  {stat.value}
                </h3>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Bento Grid Features */}
      <section className="w-full py-24 px-4 container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            Everything in <span className="text-primary">One Place</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Stop asking seniors for drive links. We've organized everything you
            need into beautiful, easy-to-digest formats.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[320px]">
          {/* Feature 1: Academic Library (Large) */}
          <Link href="/explore" className="md:col-span-2 md:row-span-2 group">
            <Card className="h-full relative overflow-hidden border-2 border-border hover:border-blue-500/50 transition-all duration-300 bg-gradient-to-br from-background to-blue-500/5">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <BookOpen className="w-48 h-48" />
              </div>
              <CardContent className="p-10 flex flex-col h-full justify-end relative z-10">
                <div className="bg-blue-500 text-white w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <h3 className="text-3xl font-bold mb-3">Academic Library</h3>
                <p className="text-lg text-muted-foreground max-w-md">
                  Access a massive collection of verified notes, previous year
                  papers, and assignments categorized cleanly by branch and
                  semester.
                </p>
              </CardContent>
            </Card>
          </Link>

          {/* Feature 2: Wellbeing (Small) */}
          <Link href="/featured" className="md:col-span-1 md:row-span-1 group">
            <Card className="h-full relative overflow-hidden border-2 border-border hover:border-rose-500/50 transition-all duration-300 bg-gradient-to-br from-background to-rose-500/5">
              <CardContent className="p-8 flex flex-col h-full justify-between">
                <div className="flex justify-between items-start">
                  <div className="bg-rose-500 text-white w-12 h-12 rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/30">
                    <Heart className="w-6 h-6" />
                  </div>
                  <Badge
                    variant="outline"
                    className="border-rose-500/30 text-rose-500 bg-rose-500/10"
                  >
                    Priority
                  </Badge>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Student Wellbeing</h3>
                  <p className="text-sm text-muted-foreground">
                    Curated, stress-free study materials designed to help you
                    breathe easy during exams.
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Feature 3: Interactive Roadmaps (Small) */}
          <Link href="/roadmaps" className="md:col-span-1 md:row-span-1 group">
            <Card className="h-full relative overflow-hidden border-2 border-border hover:border-emerald-500/50 transition-all duration-300 bg-gradient-to-br from-background to-emerald-500/5">
              <CardContent className="p-8 flex flex-col h-full justify-between">
                <div className="bg-emerald-500 text-white w-12 h-12 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <Target className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">
                    Interactive Roadmaps
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Track your progress step-by-step through skill and academic
                    guides.
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Feature 4: Placements (Wide) */}
          <Link
            href="/placements"
            className="md:col-span-3 md:row-span-1 group"
          >
            <Card className="h-full relative overflow-hidden border-2 border-border hover:border-indigo-500/50 transition-all duration-300 bg-gradient-to-r from-background to-indigo-500/10">
              <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />
              <CardContent className="p-10 flex flex-col md:flex-row items-center justify-between h-full gap-8">
                <div className="flex-1">
                  <div className="bg-indigo-500 text-white w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/30">
                    <Briefcase className="w-7 h-7" />
                  </div>
                  <h3 className="text-3xl font-bold mb-3">
                    Interview Experiences
                  </h3>
                  <p className="text-lg text-muted-foreground max-w-xl">
                    Read round-by-round breakdowns, CTC details, and exact
                    preparation strategies from seniors who cracked FAANG and
                    top product companies.
                  </p>
                </div>
                <div className="hidden md:flex flex-shrink-0 bg-background/80 backdrop-blur-sm border border-border p-6 rounded-2xl shadow-xl transform rotate-3 group-hover:rotate-0 transition-transform">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800" />
                      <div>
                        <div className="w-32 h-3 bg-slate-200 dark:bg-slate-700 rounded-full mb-2" />
                        <div className="w-20 h-2 bg-slate-100 dark:bg-slate-800 rounded-full" />
                      </div>
                    </div>
                    <div className="w-48 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-xl" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>

      {/* 4. Testimonials (Wall of Love) */}
      <section className="w-full py-24 bg-muted/30 border-y border-border">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <Badge
              variant="outline"
              className="mb-4 bg-primary/10 text-primary border-primary/20"
            >
              Wall of Love
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
              Loved by Students
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Don't just take our word for it. Here is what the community has to
              say.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t, i) => (
              <Card
                key={i}
                className="bg-card border-border hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-center gap-4 mb-2">
                    <Avatar className="w-12 h-12 border-2 border-primary/20">
                      <AvatarImage src={t.avatar} alt={t.name} />
                      <AvatarFallback>{t.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base">{t.name}</CardTitle>
                      <p className="text-xs text-primary font-medium">
                        {t.role}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground italic leading-relaxed">
                    "{t.content}"
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Final CTA */}
      <section className="w-full py-32 px-4 relative overflow-hidden bg-slate-950 dark:bg-slate-900 text-white">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/30 rounded-full blur-[100px]" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-600/30 rounded-full blur-[100px]" />

        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-white">
            Ready to Ace Your Semester?
          </h2>
          <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
            Join thousands of students sharing notes, strategies, and cracking
            placements together.
          </p>

          <Link href="/register">
            <Button
              size="lg"
              className="h-16 px-12 text-xl rounded-full bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 transition-all shadow-xl shadow-primary/20 font-bold"
            >
              Create Free Account
            </Button>
          </Link>
          <p className="text-sm text-slate-400 mt-6">
            Takes less than 30 seconds. No spam ever.
          </p>
        </div>
      </section>
    </div>
  );
}
