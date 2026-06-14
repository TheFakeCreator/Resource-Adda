'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User as UserIcon, Building2, Briefcase, Calendar, CheckCircle2, XCircle, Clock, Search, Ghost, IndianRupee } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Uploader {
  _id: string;
  name: string;
  avatarUrl: string;
  branch: string;
  semester: number;
}

interface InterviewExperience {
  _id: string;
  title: string;
  company: string;
  role: string;
  type: string;
  offerStatus: string;
  difficulty: string;
  ctc?: string;
  roundsCount: number;
  isAnonymous: boolean;
  author: Uploader;
  createdAt: string;
  upvotes: number;
}

const USE_DUMMY_DATA = true;

const DUMMY_EXPERIENCES: InterviewExperience[] = [
  {
    _id: "1",
    title: "Amazon SDE Intern Interview Experience 2024",
    company: "Amazon",
    role: "SDE Intern",
    type: "On-Campus",
    offerStatus: "Accepted",
    difficulty: "Medium",
    ctc: "45 LPA",
    roundsCount: 3,
    isAnonymous: false,
    author: {
      _id: "u1",
      name: "Sneha Gupta",
      avatarUrl: "https://ui-avatars.com/api/?name=Sneha+Gupta&background=random",
      branch: "Computer Science",
      semester: 6
    },
    createdAt: new Date().toISOString(),
    upvotes: 142
  },
  {
    _id: "2",
    title: "Google SWE Off-Campus Drive",
    company: "Google",
    role: "Software Engineer",
    type: "Off-Campus",
    offerStatus: "Pending",
    difficulty: "Hard",
    roundsCount: 5,
    isAnonymous: true,
    author: {
      _id: "anon",
      name: "Anonymous Student",
      avatarUrl: "https://ui-avatars.com/api/?name=Anonymous&background=random",
      branch: "Confidential",
      semester: 0
    },
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    upvotes: 89
  },
  {
    _id: "3",
    title: "Atlassian FTE 2023 Batch",
    company: "Atlassian",
    role: "FTE",
    type: "On-Campus",
    offerStatus: "Rejected",
    difficulty: "Medium",
    ctc: "16 LPA",
    roundsCount: 2,
    isAnonymous: false,
    author: {
      _id: "u3",
      name: "Ravi Kumar",
      avatarUrl: "https://ui-avatars.com/api/?name=Ravi+Kumar&background=random",
      branch: "Information Technology",
      semester: 8
    },
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    upvotes: 45
  }
];

const getStatusConfig = (status: string) => {
  switch(status.toLowerCase()) {
    case 'accepted': return { icon: <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-500" />, class: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" };
    case 'rejected': return { icon: <XCircle className="w-4 h-4 mr-1 text-rose-500" />, class: "text-rose-500 bg-rose-500/10 border-rose-500/20" };
    case 'pending': return { icon: <Clock className="w-4 h-4 mr-1 text-amber-500" />, class: "text-amber-500 bg-amber-500/10 border-amber-500/20" };
    default: return { icon: <CheckCircle2 className="w-4 h-4 mr-1 text-muted-foreground" />, class: "text-muted-foreground bg-muted border-border" };
  }
};

export default function PlacementsPage() {
  const [experiences, setExperiences] = useState<InterviewExperience[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const fetchExperiences = async () => {
      setLoading(true);
      if (USE_DUMMY_DATA) {
        setTimeout(() => {
          let filtered = DUMMY_EXPERIENCES;
          if (debouncedSearch) {
            filtered = filtered.filter(e => 
              e.company.toLowerCase().includes(debouncedSearch.toLowerCase()) || 
              e.role.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
              e.title.toLowerCase().includes(debouncedSearch.toLowerCase())
            );
          }
          if (typeFilter !== 'all') {
            filtered = filtered.filter(e => e.type.toLowerCase() === typeFilter.toLowerCase());
          }
          setExperiences(filtered);
          setLoading(false);
        }, 600);
        return;
      }

      try {
        const params = new URLSearchParams();
        if (debouncedSearch) params.append('company', debouncedSearch); // Simulating basic search
        if (typeFilter !== 'all') params.append('type', typeFilter);

        const response = await axios.get(`http://localhost:5000/api/placements?${params.toString()}`);
        setExperiences(response.data);
      } catch (error) {
        console.error('Failed to fetch experiences', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExperiences();
  }, [debouncedSearch, typeFilter]);

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Filters */}
        <aside className="w-full md:w-64 flex-shrink-0 space-y-6">
          <div>
            <h2 className="text-xl font-bold mb-4">Filters</h2>
            <div className="space-y-4">
              
              <div className="space-y-2">
                <Label>Search Company/Role</Label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="e.g. Google, Amazon..." 
                    className="pl-9 bg-background"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Opportunity Type</Label>
                <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value || 'all')}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="On-Campus">On-Campus</SelectItem>
                    <SelectItem value="Off-Campus">Off-Campus</SelectItem>
                    <SelectItem value="Internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setSearch('');
                  setTypeFilter('all');
                }}
              >
                Reset Filters
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Interview Experiences</h1>
              <p className="text-muted-foreground mt-1">Learn from the community's placement journeys.</p>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="animate-pulse bg-card border-border h-48" />
              ))}
            </div>
          ) : experiences.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {experiences.map((exp) => {
                const statusConfig = getStatusConfig(exp.offerStatus);
                return (
                  <Link href={`/placements/${exp._id}`} key={exp._id} className="block group">
                    <Card className="h-full relative overflow-hidden border border-border bg-card hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col border-t-4 border-t-indigo-500">
                      <CardHeader className="pb-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                              {exp.type}
                            </Badge>
                            <Badge variant="outline" className={statusConfig.class}>
                              {statusConfig.icon}
                              {exp.offerStatus}
                            </Badge>
                          </div>
                        </div>
                        <CardTitle className="line-clamp-2 text-xl group-hover:text-primary transition-colors">
                          {exp.title}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-4 mt-2">
                          <span className="flex items-center text-foreground font-medium">
                            <Building2 className="w-4 h-4 mr-1.5 text-muted-foreground" />
                            {exp.company}
                          </span>
                          <span className="flex items-center">
                            <Briefcase className="w-4 h-4 mr-1.5 text-muted-foreground" />
                            {exp.role}
                          </span>
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex-1 space-y-3">
                        <div className="flex flex-wrap gap-2">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm border ${
                            exp.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                            exp.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' :
                            'bg-rose-500/10 text-rose-600 border-rose-500/20'
                          }`}>
                            {exp.difficulty}
                          </span>
                          {exp.ctc && (
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm border bg-primary/10 text-primary border-primary/20 flex items-center">
                              <IndianRupee className="w-3 h-3 mr-1" />
                              {exp.ctc}
                            </span>
                          )}
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm border bg-slate-500/10 text-slate-600 border-slate-500/20 dark:text-slate-400">
                            {exp.roundsCount} Rounds
                          </span>
                        </div>
                      </CardContent>
                      <CardFooter className="pt-4 border-t border-border bg-muted/30 flex justify-between items-center mt-auto">
                        <div className="flex items-center gap-2">
                          {exp.isAnonymous ? (
                            <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center border border-border">
                              <Ghost className="h-4 w-4 text-slate-500" />
                            </div>
                          ) : (
                            <Avatar className="h-8 w-8 border border-border">
                              <AvatarImage src={exp.author?.avatarUrl} alt={exp.author?.name} />
                              <AvatarFallback><UserIcon className="h-4 w-4" /></AvatarFallback>
                            </Avatar>
                          )}
                          <div className="text-xs">
                            <p className="font-medium text-foreground">{exp.author?.name}</p>
                            <div className="flex items-center text-muted-foreground mt-0.5">
                              <button 
                                onClick={(e) => { e.preventDefault(); /* Handle upvote */ }}
                                className="flex items-center hover:text-emerald-500 transition-colors"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="m18 15-6-6-6 6"/></svg>
                                {exp.upvotes}
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="group-hover:bg-primary/90 group-hover:shadow-lg inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all duration-300 bg-primary text-primary-foreground shadow-md h-8 rounded-full px-4 group-hover:scale-105 active:scale-95">
                          Read Experience
                        </div>
                      </CardFooter>
                    </Card>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 bg-muted/30 rounded-3xl border border-dashed border-border">
              <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium">No experiences found</h3>
              <p className="text-muted-foreground max-w-sm mx-auto mt-2">
                We couldn't find any interview experiences matching your filters.
              </p>
              <Button 
                variant="outline" 
                className="mt-6"
                onClick={() => {
                  setSearch('');
                  setTypeFilter('all');
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </main>

      </div>
    </div>
  );
}
