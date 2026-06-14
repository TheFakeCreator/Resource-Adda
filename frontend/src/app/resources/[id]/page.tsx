'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Download, BookOpen, Star, ThumbsUp, ThumbsDown, MessageSquare, ArrowLeft, Send, User as UserIcon, FileText } from 'lucide-react';
import Link from 'next/link';
import { RESOURCE_TYPE_COLORS } from '@/app/explore/page';
import { Document as PdfDocument, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface DocumentDetails {
  _id: string;
  title: string;
  description: string;
  fileUrl: string;
  isExternalLink: boolean;
  subject: string;
  semester: number;
  branch: string;
  type: string;
  downloadCount: number;
  averageRating: number;
  totalRatings: number;
  createdAt: string;
  uploadedBy: {
    _id: string;
    name: string;
    avatarUrl: string;
    branch: string;
  };
}

interface Review {
  _id: string;
  userId: {
    _id: string;
    name: string;
    avatarUrl: string;
  };
  rating: number;
  comment: string;
  upvotes: number;
  downvotes: number;
  upvotedBy: string[];
  downvotedBy: string[];
  createdAt: string;
}

// Toggle this to false when you want to use the real backend API
const USE_DUMMY_DATA = true;

const DUMMY_RESOURCE: DocumentDetails = {
  _id: "1",
  title: "Engineering Mathematics 1 - Complete Handwritten Notes",
  description: "These are my complete handwritten notes for Engg Math 1. It covers Matrices, Calculus, and Vector Spaces. I've highlighted the important theorems that usually come in the end semester exams.",
  fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
  isExternalLink: false,
  subject: "Mathematics",
  semester: 1,
  branch: "Computer Science",
  type: "Notes",
  createdAt: new Date().toISOString(),
  downloadCount: 142,
  averageRating: 4.8,
  totalRatings: 12,
  uploadedBy: {
    _id: "u1",
    name: "Rahul Sharma",
    avatarUrl: "https://ui-avatars.com/api/?name=Rahul+Sharma&background=random",
    branch: "Computer Science",
  }
};

const DUMMY_REVIEWS: Review[] = [
  {
    _id: "r1",
    userId: {
      _id: "u2",
      name: "Aditi Verma",
      avatarUrl: "https://ui-avatars.com/api/?name=Aditi+Verma&background=random",
    },
    rating: 5,
    comment: "These notes are an absolute lifesaver! Thank you so much for sharing.",
    upvotes: 4,
    downvotes: 0,
    upvotedBy: ["u3", "u4"],
    downvotedBy: [],
    createdAt: new Date().toISOString()
  }
];

export default function ResourceDetailPage() {
  const params = useParams();
  const documentId = params.id as string;
  const { token, user } = useAuthStore();

  const [document, setDocument] = useState<DocumentDetails | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  
  // PDF state
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);

  // Review form state
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      if (USE_DUMMY_DATA) {
        setDocument(DUMMY_RESOURCE);
        setReviews(DUMMY_REVIEWS);
        setLoading(false);
        return;
      }

      try {
        const [docRes, revRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/resources/documents/${documentId}`),
          axios.get(`http://localhost:5000/api/resources/documents/${documentId}/reviews`)
        ]);
        setDocument(docRes.data);
        setReviews(revRes.data);
      } catch (error) {
        console.error('Failed to fetch resource details', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [documentId]);

  const handleDownload = async () => {
    if (!document) return;
    try {
      await axios.post(`http://localhost:5000/api/resources/documents/${documentId}/download`);
      setDocument(prev => prev ? { ...prev, downloadCount: prev.downloadCount + 1 } : null);
      window.open(document.fileUrl, '_blank');
    } catch (error) {
      console.error('Download tracking failed', error);
      // Still try to open it even if tracking fails
      window.open(document.fileUrl, '_blank');
    }
  };

  const handleReviewSubmit = async () => {
    if (!token) return alert('Please login to submit a review');
    try {
      setSubmittingReview(true);
      await axios.post(
        `http://localhost:5000/api/resources/documents/${documentId}/reviews`,
        { rating: newRating, comment: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Refresh reviews and doc stats
      const [docRes, revRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/resources/documents/${documentId}`),
        axios.get(`http://localhost:5000/api/resources/documents/${documentId}/reviews`)
      ]);
      setDocument(docRes.data);
      setReviews(revRes.data);
      setNewComment('');
    } catch (error) {
      console.error('Failed to submit review', error);
      alert('Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleVote = async (reviewId: string, voteType: 'upvote' | 'downvote') => {
    if (!token) return alert('Please login to vote');
    try {
      await axios.post(
        `http://localhost:5000/api/resources/reviews/${reviewId}/vote`,
        { voteType },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Optimistic update
      setReviews(prev => prev.map(rev => {
        if (rev._id === reviewId) {
          const isUpvote = voteType === 'upvote';
          const hasUpvoted = rev.upvotedBy.includes(user?._id || '');
          const hasDownvoted = rev.downvotedBy.includes(user?._id || '');
          
          const newUpvotes = [...rev.upvotedBy].filter(id => id !== user?._id);
          const newDownvotes = [...rev.downvotedBy].filter(id => id !== user?._id);

          if (isUpvote && !hasUpvoted) newUpvotes.push(user?._id || '');
          if (!isUpvote && !hasDownvoted) newDownvotes.push(user?._id || '');

          return {
            ...rev,
            upvotedBy: newUpvotes,
            downvotedBy: newDownvotes,
            upvotes: newUpvotes.length,
            downvotes: newDownvotes.length
          };
        }
        return rev;
      }));
    } catch (error) {
      console.error('Failed to vote', error);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading resource...</div>;
  }

  if (!document) {
    return <div className="min-h-screen flex items-center justify-center">Resource not found</div>;
  }

  const typeConfig = RESOURCE_TYPE_COLORS[document.type.toLowerCase()] || RESOURCE_TYPE_COLORS['default'];
  const isPdf = document.fileUrl.toLowerCase().endsWith('.pdf');

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 max-w-6xl">
      <Link href="/explore" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Explore
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Metadata & Reviews */}
        <div className="lg:col-span-1 space-y-8">
          
          {/* Main Info Card */}
          <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
            <div className="flex gap-2 mb-4">
              <Badge variant="outline" className={typeConfig.badge}>
                <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${typeConfig.dot}`} />
                {document.type}
              </Badge>
              <Badge variant="secondary" className="bg-muted text-muted-foreground">
                Sem {document.semester}
              </Badge>
            </div>
            
            <h1 className="text-2xl font-bold leading-tight mb-2">{document.title}</h1>
            
            <div className="flex items-center text-muted-foreground text-sm mb-6">
              <BookOpen className="w-4 h-4 mr-1.5" />
              {document.subject} • {document.branch}
            </div>

            <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
              {document.description || "No description provided."}
            </p>

            <Separator className="mb-6" />

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex flex-col items-center justify-center p-3 bg-muted/50 rounded-2xl">
                <div className="flex items-center text-amber-500 font-bold text-xl mb-1">
                  <Star className="w-5 h-5 mr-1 fill-current" />
                  {document.averageRating > 0 ? document.averageRating.toFixed(1) : '-'}
                </div>
                <span className="text-xs text-muted-foreground">{document.totalRatings} Ratings</span>
              </div>
              <div className="flex flex-col items-center justify-center p-3 bg-muted/50 rounded-2xl">
                <div className="flex items-center text-primary font-bold text-xl mb-1">
                  <Download className="w-5 h-5 mr-1" />
                  {document.downloadCount}
                </div>
                <span className="text-xs text-muted-foreground">Downloads</span>
              </div>
            </div>

            <Button 
              onClick={handleDownload} 
              className="w-full h-12 rounded-xl text-base shadow-md hover:-translate-y-0.5 transition-all"
            >
              <Download className="w-5 h-5 mr-2" />
              {document.isExternalLink ? 'Open External Link' : 'Download Resource'}
            </Button>

            {/* Uploader Info */}
            <div className="mt-6 flex items-center p-4 bg-muted/30 rounded-2xl border border-border/50">
              <Avatar className="h-10 w-10 border border-border mr-3">
                <AvatarImage src={document.uploadedBy?.avatarUrl} alt={document.uploadedBy?.name} />
                <AvatarFallback><UserIcon className="h-4 w-4" /></AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{document.uploadedBy?.name}</p>
                <p className="text-xs text-muted-foreground truncate">Uploaded {new Date(document.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Leave a Review Section */}
          <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
            <h3 className="font-semibold text-lg mb-4 flex items-center">
              <MessageSquare className="w-5 h-5 mr-2 text-primary" />
              Leave a Review
            </h3>
            {token ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button 
                      key={star} 
                      onClick={() => setNewRating(star)}
                      className="focus:outline-none hover:scale-110 transition-transform"
                    >
                      <Star className={`w-8 h-8 ${star <= newRating ? 'fill-amber-500 text-amber-500' : 'text-slate-300 dark:text-slate-700'}`} />
                    </button>
                  ))}
                </div>
                <Textarea 
                  placeholder="Share your thoughts about this resource..." 
                  className="resize-none bg-background border-border"
                  rows={3}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <Button 
                  onClick={handleReviewSubmit} 
                  disabled={submittingReview}
                  className="w-full rounded-xl"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </Button>
              </div>
            ) : (
              <div className="text-center py-6 bg-muted/50 rounded-2xl">
                <p className="text-sm text-muted-foreground mb-3">Please login to rate and review this resource.</p>
                <Link href="/login">
                  <Button variant="outline" size="sm">Login</Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: PDF Preview & Reviews */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* PDF Previewer */}
          <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm flex flex-col h-[600px]">
            <div className="bg-muted/50 px-4 py-3 border-b border-border flex justify-between items-center">
              <h3 className="font-semibold text-sm">Document Preview</h3>
              {!isPdf && !document.isExternalLink && (
                <Badge variant="secondary">No preview available for this file type</Badge>
              )}
            </div>
            <div className="flex-1 bg-zinc-100 dark:bg-zinc-950 overflow-auto flex justify-center p-4">
              {isPdf && !document.isExternalLink ? (
                <PdfDocument
                  file={document.fileUrl}
                  onLoadSuccess={({ numPages }: { numPages: number }) => setNumPages(numPages)}
                  loading={<div className="animate-pulse flex items-center justify-center h-full w-full">Loading PDF...</div>}
                  error={<div className="text-muted-foreground">Failed to load PDF preview.</div>}
                  className="shadow-2xl"
                >
                  <Page 
                    pageNumber={pageNumber} 
                    width={800} 
                    renderTextLayer={false} 
                    renderAnnotationLayer={false}
                    className="bg-white"
                  />
                </PdfDocument>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <FileText className="w-16 h-16 mb-4 opacity-20" />
                  <p>Preview not available.</p>
                  <Button variant="link" onClick={handleDownload}>Download to view</Button>
                </div>
              )}
            </div>
            {isPdf && numPages && (
              <div className="bg-muted/50 px-4 py-3 border-t border-border flex justify-between items-center">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setPageNumber(p => Math.max(1, p - 1))}
                  disabled={pageNumber <= 1}
                >
                  Previous
                </Button>
                <span className="text-xs font-medium text-muted-foreground">
                  Page {pageNumber} of {numPages}
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setPageNumber(p => Math.min(numPages, p + 1))}
                  disabled={pageNumber >= numPages}
                >
                  Next
                </Button>
              </div>
            )}
          </div>

          {/* User Reviews List */}
          <div>
            <h3 className="font-semibold text-xl mb-4">Community Reviews ({reviews.length})</h3>
            <div className="space-y-4">
              {reviews.length === 0 ? (
                <div className="text-center py-12 bg-card border border-dashed border-border rounded-3xl">
                  <Star className="w-12 h-12 text-muted-foreground opacity-20 mx-auto mb-3" />
                  <h4 className="font-medium text-foreground">No reviews yet</h4>
                  <p className="text-sm text-muted-foreground mt-1">Be the first to review this resource!</p>
                </div>
              ) : (
                reviews.map(review => (
                  <Card key={review._id} className="bg-card border-border shadow-sm">
                    <CardContent className="p-5">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center">
                          <Avatar className="h-8 w-8 mr-3 border border-border">
                            <AvatarImage src={review.userId?.avatarUrl} />
                            <AvatarFallback>{review.userId?.name?.[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{review.userId?.name}</p>
                            <div className="flex items-center text-amber-500">
                              {[1, 2, 3, 4, 5].map(star => (
                                <Star key={star} className={`w-3 h-3 ${star <= review.rating ? 'fill-current' : 'text-slate-300 dark:text-slate-700'}`} />
                              ))}
                              <span className="text-xs text-muted-foreground ml-2 font-normal">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-sm text-foreground/80 mb-4">{review.comment}</p>
                      )}
                      
                      <div className="flex items-center gap-3">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={`h-8 px-2 text-xs rounded-lg ${review.upvotedBy.includes(user?._id || '') ? 'bg-primary/10 text-primary hover:bg-primary/20' : 'text-muted-foreground hover:bg-muted'}`}
                          onClick={() => handleVote(review._id, 'upvote')}
                        >
                          <ThumbsUp className={`w-3.5 h-3.5 mr-1.5 ${review.upvotedBy.includes(user?._id || '') ? 'fill-current' : ''}`} />
                          {review.upvotes || 0}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={`h-8 px-2 text-xs rounded-lg ${review.downvotedBy.includes(user?._id || '') ? 'bg-destructive/10 text-destructive hover:bg-destructive/20' : 'text-muted-foreground hover:bg-muted'}`}
                          onClick={() => handleVote(review._id, 'downvote')}
                        >
                          <ThumbsDown className={`w-3.5 h-3.5 mr-1.5 ${review.downvotedBy.includes(user?._id || '') ? 'fill-current' : ''}`} />
                          {review.downvotes || 0}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
