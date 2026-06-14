'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, LibraryBig, CheckCircle, XCircle, ExternalLink, FileText } from 'lucide-react';

interface Contribution {
  _id: string;
  documentId: {
    _id: string;
    title: string;
    description: string;
    type: string;
    branch: string;
    semester: number;
    subject: string;
    fileUrl: string;
    isExternalLink: boolean;
  };
  userId: {
    _id: string;
    email: string;
    role: string;
    branch: string;
    semester: number;
    rollNumber?: string;
  };
  status: string;
  createdAt: string;
}

export default function PendingContributionsPage() {
  const { token } = useAuthStore();
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchPending = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/resources/contributions/pending', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch pending contributions');
      const data = await res.json();
      setContributions(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, [token]);

  const handleReview = async (id: string, status: 'approved' | 'rejected') => {
    setActionLoading(id);
    try {
      const res = await fetch(`http://localhost:5000/api/resources/contributions/${id}/review`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to review contribution');
      }

      // Remove the reviewed contribution from the list
      setContributions(prev => prev.filter(c => c._id !== id));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Pending Contributions</h1>
        <p className="text-muted-foreground mt-2">Review and approve resources uploaded by students.</p>
      </div>
      
      {error && (
        <div className="p-3 bg-red-100 text-red-600 border border-red-300 rounded-md text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : contributions.length === 0 ? (
        <Card className="w-full border shadow-sm">
          <CardContent className="p-12 text-center flex flex-col items-center">
            <LibraryBig className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Queue is empty</h3>
            <p className="text-muted-foreground">
              There are no pending resources awaiting approval at this time.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {contributions.map((contribution) => {
            const doc = contribution.documentId;
            const uploader = contribution.userId;
            
            return (
              <Card key={contribution._id} className="w-full border shadow-sm">
                <CardHeader className="pb-3 border-b bg-muted/30">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl flex items-center gap-2">
                        {doc.title}
                        <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                          {doc.type || 'Resource'}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="mt-2 text-sm space-y-1">
                        <p><strong>Subject:</strong> {doc.subject}</p>
                        <p><strong>Branch / Sem:</strong> {doc.branch} - Sem {doc.semester}</p>
                        {doc.description && <p className="italic text-muted-foreground line-clamp-2">"{doc.description}"</p>}
                      </CardDescription>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <p>Uploaded by: <strong>{uploader.email}</strong></p>
                      <p>{uploader.branch} - Sem {uploader.semester}</p>
                      <p>{new Date(contribution.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="py-4">
                  <div className="flex items-center gap-2">
                    {doc.isExternalLink ? <ExternalLink className="h-4 w-4 text-amber-500" /> : <FileText className="h-4 w-4 text-blue-500" />}
                    <a 
                      href={doc.fileUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline font-medium text-sm"
                    >
                      View {doc.isExternalLink ? 'External Link' : 'Uploaded File'}
                    </a>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-3 pt-4 border-t bg-muted/10">
                  <Button 
                    variant="outline" 
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                    disabled={actionLoading === contribution._id}
                    onClick={() => handleReview(contribution._id, 'rejected')}
                  >
                    {actionLoading === contribution._id ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <XCircle className="h-4 w-4 mr-2" />}
                    Reject
                  </Button>
                  <Button 
                    variant="default"
                    className="bg-green-600 hover:bg-green-700 text-white"
                    disabled={actionLoading === contribution._id}
                    onClick={() => handleReview(contribution._id, 'approved')}
                  >
                    {actionLoading === contribution._id ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                    Approve
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
