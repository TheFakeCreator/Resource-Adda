'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BookOpen, Download, User as UserIcon, Sparkles, TrendingUp, Star, Award } from 'lucide-react';
import Link from 'next/link';

// Types
interface Uploader {
  _id: string;
  name: string;
  avatarUrl: string;
  email: string;
  branch: string;
}

interface Document {
  _id: string;
  title: string;
  description: string;
  subject: string;
  semester: number;
  branch: string;
  type: string;
  createdAt: string;
  downloadCount?: number;
  averageRating?: number;
  totalRatings?: number;
  isFeatured?: boolean;
  uploadedBy: Uploader;
}

const RESOURCE_TYPE_COLORS: Record<string, { badge: string; dot: string; borderTop: string; bannerBg: string; bannerText: string }> = {
  'notes': { badge: 'text-blue-500 border-blue-500/20 bg-blue-500/10', dot: 'bg-blue-500', borderTop: 'border-blue-500', bannerBg: 'bg-blue-500', bannerText: 'text-white' },
  'pyq': { badge: 'text-purple-500 border-purple-500/20 bg-purple-500/10', dot: 'bg-purple-500', borderTop: 'border-purple-500', bannerBg: 'bg-purple-500', bannerText: 'text-white' },
  'book': { badge: 'text-amber-500 border-amber-500/20 bg-amber-500/10', dot: 'bg-amber-500', borderTop: 'border-amber-500', bannerBg: 'bg-amber-500', bannerText: 'text-amber-950' },
  'lab manual': { badge: 'text-emerald-500 border-emerald-500/20 bg-emerald-500/10', dot: 'bg-emerald-500', borderTop: 'border-emerald-500', bannerBg: 'bg-emerald-500', bannerText: 'text-emerald-950' },
  'default': { badge: 'text-slate-500 border-slate-500/20 bg-slate-500/10', dot: 'bg-slate-500', borderTop: 'border-slate-500', bannerBg: 'bg-slate-500', bannerText: 'text-white' },
};

const WELLBEING_MESSAGES = [
  "You're going to ace this! ✨",
  "Take a deep breath, you got this. 🌟",
  "One step at a time! 🚀",
  "Remember to drink water! 💧",
  "We believe in you! 🌻",
  "Your hard work will pay off. 📈",
  "Don't forget to take breaks! 🍵"
];

const getMessage = (id: string) => {
  const sum = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return WELLBEING_MESSAGES[sum % WELLBEING_MESSAGES.length];
};

const USE_DUMMY_DATA = true;

const DUMMY_DOC: Document = {
  _id: "1",
  title: "Engineering Mathematics 1 - Complete Handwritten Notes",
  description: "These are my complete handwritten notes for Engg Math 1. It covers Matrices, Calculus, and Vector Spaces.",
  subject: "Mathematics",
  semester: 1,
  branch: "Computer Science",
  type: "Notes",
  createdAt: new Date().toISOString(),
  downloadCount: 142,
  averageRating: 4.8,
  totalRatings: 12,
  isFeatured: true,
  uploadedBy: {
    _id: "u1",
    name: "Rahul Sharma",
    avatarUrl: "https://ui-avatars.com/api/?name=Rahul+Sharma&background=random",
    email: "rahul@example.com",
    branch: "Computer Science",
  }
};

const DUMMY_DATA = {
  adminPicks: [{ ...DUMMY_DOC, _id: "f1", title: "Data Structures & Algorithms - Expert Guide" }],
  topRated: [
    { ...DUMMY_DOC, _id: "t1", title: "Physics Lab Manual - Fully Solved", averageRating: 5.0, type: "Lab Manual" },
    { ...DUMMY_DOC, _id: "t2", title: "Database Systems PYQs 2020-2023", averageRating: 4.9, type: "PYQ" }
  ],
  trending: [
    { ...DUMMY_DOC, _id: "tr1", title: "Computer Networks Complete Notes", downloadCount: 520 },
    { ...DUMMY_DOC, _id: "tr2", title: "Operating Systems Reference Book", type: "Book", downloadCount: 450 }
  ]
};

export default function FeaturedPage() {
  const [adminPicks, setAdminPicks] = useState<Document[]>([]);
  const [topRated, setTopRated] = useState<Document[]>([]);
  const [trending, setTrending] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [heroState, setHeroState] = useState<'breathing' | 'collapsing' | 'hidden'>('breathing');

  useEffect(() => {
    // 3.5s for deep breath (inhale, hold, exhale)
    const breathTimer = setTimeout(() => {
      setHeroState('collapsing');
    }, 3500);

    // 1s for collapse
    const hideTimer = setTimeout(() => {
      setHeroState('hidden');
    }, 4500);

    return () => {
      clearTimeout(breathTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  useEffect(() => {
    const fetchFeatured = async () => {
      if (USE_DUMMY_DATA) {
        setAdminPicks(DUMMY_DATA.adminPicks);
        setTopRated(DUMMY_DATA.topRated);
        setTrending(DUMMY_DATA.trending);
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get('http://localhost:5000/api/resources/featured');
        setAdminPicks(response.data.adminPicks);
        setTopRated(response.data.topRated);
        setTrending(response.data.trending);
      } catch (error) {
        console.error('Failed to fetch featured resources', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const getTypeConfig = (type: string) => {
    return RESOURCE_TYPE_COLORS[type.toLowerCase()] || RESOURCE_TYPE_COLORS['default'];
  };

  const renderResourceCard = (doc: Document) => {
    const typeConfig = getTypeConfig(doc.type);
    return (
      <Link href={`/resources/${doc._id}`} key={doc._id} className="block group w-full min-w-[300px] md:min-w-[350px] max-w-[400px] snap-center">
        <Card className={`h-full relative overflow-hidden border border-border bg-card hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col border-t-4 ${typeConfig.borderTop}`}>
          {/* Expanding wellbeing banner that drops from the native top border */}
          <div className={`absolute top-0 left-0 w-full h-0 group-hover:h-8 transition-all duration-300 ease-in-out z-10 flex items-center justify-center overflow-hidden ${typeConfig.bannerBg} ${typeConfig.bannerText}`}>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100 whitespace-nowrap text-xs font-semibold tracking-wide px-4">
              {getMessage(doc._id)}
            </span>
          </div>
          <CardHeader className="pb-4 pt-6 relative z-0">
            <div className="flex justify-between items-start mb-2 gap-2">
              <Badge variant="outline" className={typeConfig.badge}>
                <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${typeConfig.dot}`} />
                {doc.type}
              </Badge>
              <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-md">
                Sem {doc.semester}
              </span>
            </div>
            <CardTitle className="line-clamp-2 text-xl leading-tight group-hover:text-primary transition-colors">
              {doc.title}
            </CardTitle>
            <CardDescription className="flex items-center mt-2 text-sm text-muted-foreground">
              <BookOpen className="mr-1.5 h-3.5 w-3.5" />
              {doc.subject}
            </CardDescription>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center text-sm text-amber-500 font-medium">
                <Star className="w-4 h-4 mr-1 fill-current" />
                {doc.averageRating && doc.averageRating > 0 ? doc.averageRating.toFixed(1) : 'New'}
                {doc.totalRatings && doc.totalRatings > 0 ? <span className="text-muted-foreground ml-1 font-normal">({doc.totalRatings})</span> : null}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Download className="w-4 h-4 mr-1" />
                {doc.downloadCount || 0}
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <p className="text-sm text-muted-foreground line-clamp-3">
              {doc.description || "No description provided."}
            </p>
          </CardContent>
          <CardFooter className="pt-4 pb-4 border-t border-border bg-muted/30 flex justify-between items-center mt-auto">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8 border border-border">
                <AvatarImage src={doc.uploadedBy?.avatarUrl} alt={doc.uploadedBy?.name || 'User'} />
                <AvatarFallback><UserIcon className="h-4 w-4" /></AvatarFallback>
              </Avatar>
              <div className="text-xs">
                <p className="font-medium text-foreground leading-none">{doc.uploadedBy?.name || 'Unknown'}</p>
                <p className="text-muted-foreground mt-0.5">{doc.uploadedBy?.branch || 'General'}</p>
              </div>
            </div>
            <div className="group-hover:bg-primary/90 group-hover:shadow-lg inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all duration-300 bg-primary text-primary-foreground shadow-md h-8 rounded-full px-4 group-hover:scale-105 active:scale-95">
              View Details
            </div>
          </CardFooter>
        </Card>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-12 flex flex-col">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes deepBreath {
          0% { transform: scale(1); opacity: 0; }
          15% { opacity: 1; }
          40% { transform: scale(1.06); }
          60% { transform: scale(1.06); }
          100% { transform: scale(0.95); opacity: 0; }
        }
        .animate-breath {
          animation: deepBreath 3.5s ease-in-out forwards;
        }
      `}} />

      {/* Hero Section */}
      {heroState !== 'hidden' && (
        <section className={`relative overflow-hidden bg-gradient-to-br from-rose-500/10 via-orange-500/10 to-amber-500/5 transition-all duration-1000 ease-in-out origin-top border-border ${
          heroState === 'collapsing' 
            ? 'max-h-0 opacity-0 pt-0 pb-0 border-transparent' 
            : 'max-h-[800px] opacity-100 pt-16 pb-12 md:pt-24 md:pb-20 border-b'
        }`}>
          {/* Decorative background shapes */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[150%] rounded-full bg-rose-500/5 blur-3xl mix-blend-multiply"></div>
            <div className="absolute top-[20%] -right-[10%] w-[40%] h-[120%] rounded-full bg-amber-500/5 blur-3xl mix-blend-multiply"></div>
          </div>
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-4xl relative z-10 animate-breath">
            <Badge variant="outline" className="mb-6 border-rose-500/30 text-rose-500 bg-rose-500/10 px-4 py-1.5 rounded-full font-medium shadow-sm">
              <Sparkles className="w-4 h-4 mr-2" />
              You belong here
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-foreground">
              Take a deep breath. <br/>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-rose-500 to-orange-500">
                We've got you covered.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8 max-w-2xl mx-auto">
              Studying can be overwhelming. We've curated the absolute best resources to make your learning journey easier, warmer, and completely stress-free. 
            </p>
          </div>
        </section>
      )}

      {/* Sections Container */}
      <div className={`container mx-auto px-4 sm:px-6 lg:px-8 space-y-16 flex-1 transition-all duration-1000 ${
        heroState === 'hidden' ? 'opacity-100 mt-8 translate-y-0' : 'opacity-0 h-0 overflow-hidden mt-0 translate-y-12'
      }`}>
        
        {loading ? (
          <div className="py-32 flex flex-col items-center justify-center text-muted-foreground">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
            Loading featured resources...
          </div>
        ) : (
          <>
            {/* Editor's Picks */}
            {adminPicks.length > 0 && (
              <section>
                <div className="flex items-center mb-6">
                  <div className="bg-primary/10 p-2.5 rounded-xl mr-3 text-primary">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight">Editor's Picks</h2>
                    <p className="text-sm text-muted-foreground">Highest quality resources manually verified by our team.</p>
                  </div>
                </div>
                <div className="flex gap-6 overflow-x-auto pb-6 snap-x snap-mandatory scrollbar-hide py-2 px-1">
                  {adminPicks.map(renderResourceCard)}
                </div>
              </section>
            )}

            {/* Top Rated */}
            {topRated.length > 0 && (
              <section>
                <div className="flex items-center mb-6">
                  <div className="bg-amber-500/10 p-2.5 rounded-xl mr-3 text-amber-500">
                    <Star className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight">Top Rated</h2>
                    <p className="text-sm text-muted-foreground">The most loved resources voted by the community.</p>
                  </div>
                </div>
                <div className="flex gap-6 overflow-x-auto pb-6 snap-x snap-mandatory scrollbar-hide py-2 px-1">
                  {topRated.map(renderResourceCard)}
                </div>
              </section>
            )}

            {/* Trending Now */}
            {trending.length > 0 && (
              <section>
                <div className="flex items-center mb-6">
                  <div className="bg-emerald-500/10 p-2.5 rounded-xl mr-3 text-emerald-500">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight">Trending Now</h2>
                    <p className="text-sm text-muted-foreground">Most downloaded resources this week.</p>
                  </div>
                </div>
                <div className="flex gap-6 overflow-x-auto pb-6 snap-x snap-mandatory scrollbar-hide py-2 px-1">
                  {trending.map(renderResourceCard)}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
