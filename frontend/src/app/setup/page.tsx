'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuthStore } from '@/store/useAuthStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Settings, ShieldCheck } from 'lucide-react';

export default function SetupPage() {
  const router = useRouter();
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    instituteName: '',
    allowedEmailPatterns: '',
  });

  React.useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/setup/status');
        if (res.data.isSetup) {
          router.push('/dashboard');
        }
      } catch (err) {
        console.error('Failed to check setup status', err);
      }
    };
    checkStatus();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await axios.post(
        'http://localhost:5000/api/setup/configure',
        {
          instituteName: formData.instituteName,
          allowedEmailPatterns: formData.allowedEmailPatterns.split(',').map(s => s.trim()),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      router.push('/dashboard');
    } catch (error) {
      console.error(error);
      alert('Setup failed. Make sure you are registered as the Super Admin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-lg border-none shadow-xl">
        <CardHeader className="space-y-1 bg-muted/50 border-b rounded-t-xl pb-8 pt-4">
          <div className="flex items-center space-x-2 mb-4 text-primary">
            <ShieldCheck className="h-6 w-6" />
            <h2 className="text-sm font-semibold tracking-wider uppercase">Super Admin</h2>
          </div>
          <CardTitle className="text-3xl font-bold text-foreground">System Setup</CardTitle>
          <CardDescription className="text-muted-foreground text-base">
            Configure your institute's instance of Resource-Adda.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="instituteName" className="text-foreground">Institute Name</Label>
              <Input
                id="instituteName"
                placeholder="e.g., National Institute of Technology Raipur"
                value={formData.instituteName}
                onChange={(e) => setFormData({ ...formData, instituteName: e.target.value })}
                required
                className="bg-background focus-visible:ring-primary h-12"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="allowedEmailPatterns" className="text-foreground">Allowed Email Domains (Comma separated)</Label>
              <Input
                id="allowedEmailPatterns"
                placeholder="e.g., *@*.nitrr.ac.in, *@stanford.edu"
                value={formData.allowedEmailPatterns}
                onChange={(e) => setFormData({ ...formData, allowedEmailPatterns: e.target.value })}
                required
                className="bg-background focus-visible:ring-primary h-12"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Students registering with these domains will be automatically verified.
              </p>
            </div>

            <Button type="submit" className="w-full h-12 text-lg font-medium" disabled={loading}>
              {loading ? 'Saving...' : 'Complete Setup'}
              {!loading && <Settings className="ml-2 h-5 w-5" />}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
