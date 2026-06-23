"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import api from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Upload,
  Link as LinkIcon,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { INSTITUTE_BRANCHES, SEMESTERS } from "@/lib/constants";

export default function UploadResourcePage() {
  const router = useRouter();
  const { token, user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    subject: "",
    semester: "1",
    branch: (user as any)?.branch || "CSE",
    type: "Notes",
    isExternalLink: false,
    externalLink: "",
  });

  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("subject", formData.subject);
      data.append("semester", formData.semester);
      data.append("branch", formData.branch);
      data.append("type", formData.type);
      data.append("isExternalLink", formData.isExternalLink.toString());

      if (formData.isExternalLink) {
        if (!formData.externalLink)
          throw new Error("Please provide an external link");
        data.append("externalLink", formData.externalLink);
      } else {
        if (!file) throw new Error("Please select a file to upload");
        data.append("file", file);
      }

      await api.post("/resources/upload", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccess(true);
      setTimeout(() => {
        router.push("/explore");
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || "Failed to upload");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-6 mt-8">
        <Card className="border-green-500/30 shadow-md">
          <CardHeader className="text-center space-y-4 pt-8">
            <div className="mx-auto bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 p-4 rounded-full w-20 h-20 flex items-center justify-center ring-8 ring-green-50 dark:ring-green-500/10">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <CardTitle className="text-3xl font-bold text-green-700 dark:text-green-400">
              Upload Successful!
            </CardTitle>
            <CardDescription className="text-base md:text-lg max-w-md mx-auto">
              Your resource has been submitted and is currently{" "}
              <strong className="text-foreground">
                Pending Admin Approval
              </strong>
              . Once an admin verifies it, it will be available in the public
              library.
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center pb-8 pt-4 flex-col sm:flex-row gap-4">
            <Button
              onClick={() => router.push("/explore")}
              variant="outline"
              className="w-full sm:w-auto"
            >
              Go to Explore
            </Button>
            <Button onClick={() => router.back()} className="w-full sm:w-auto">
              Go Back
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Upload Resource</h1>
          <p className="text-muted-foreground mt-2">
            Share your notes, PYQs, and assignments with the community.
          </p>
        </div>
      </div>

      <Card className="overflow-hidden w-full">
        <form onSubmit={handleSubmit} className="w-full">
          <CardContent className="space-y-6 pt-6 w-full">
            {error && (
              <div className="p-3 bg-red-100 text-red-600 border border-red-300 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  required
                  placeholder="e.g. Data Structures Unit 1 Notes"
                  value={formData.title}
                  maxLength={150}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Resource Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(val: string | null) =>
                    val && setFormData({ ...formData, type: val })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder="Select type"
                      className="truncate"
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Notes">Notes</SelectItem>
                    <SelectItem value="PYQ">
                      Previous Year Questions (PYQ)
                    </SelectItem>
                    <SelectItem value="Assignment">
                      Assignment Solution
                    </SelectItem>
                    <SelectItem value="Textbook">
                      Textbook / Reference
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  required
                  placeholder="e.g. DBMS"
                  value={formData.subject}
                  maxLength={100}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="branch">Branch *</Label>
                <Select
                  value={formData.branch}
                  onValueChange={(val: string | null) =>
                    val && setFormData({ ...formData, branch: val })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder="Select branch"
                      className="truncate"
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {INSTITUTE_BRANCHES.map((b) => (
                      <SelectItem key={b} value={b}>
                        {b}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="semester">Semester *</Label>
                <Select
                  value={formData.semester}
                  onValueChange={(val: string | null) =>
                    val && setFormData({ ...formData, semester: val })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder="Select semester"
                      className="truncate"
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {SEMESTERS.map((sem) => (
                      <SelectItem key={sem} value={sem}>
                        Semester {sem}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Optional details about this resource..."
                className="resize-none"
                value={formData.description}
                maxLength={2000}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div className="border-t pt-6 mt-6">
              <div className="flex gap-4 mb-6">
                <Button
                  type="button"
                  variant={!formData.isExternalLink ? "default" : "outline"}
                  className="flex-1"
                  onClick={() =>
                    setFormData({ ...formData, isExternalLink: false })
                  }
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Upload File
                </Button>
                <Button
                  type="button"
                  variant={formData.isExternalLink ? "default" : "outline"}
                  className="flex-1"
                  onClick={() =>
                    setFormData({ ...formData, isExternalLink: true })
                  }
                >
                  <LinkIcon className="mr-2 h-4 w-4" />
                  External Link
                </Button>
              </div>

              {formData.isExternalLink ? (
                <div className="space-y-2 p-4 bg-muted/50 rounded-xl border border-border">
                  <Label htmlFor="externalLink">Resource URL *</Label>
                  <Input
                    id="externalLink"
                    placeholder="e.g. https://drive.google.com/..."
                    type="url"
                    value={formData.externalLink}
                    onChange={(e) =>
                      setFormData({ ...formData, externalLink: e.target.value })
                    }
                    required={formData.isExternalLink}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Provide a link to Google Drive, Dropbox, or any other public
                    resource.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 p-4 bg-muted/50 rounded-xl border border-border">
                  <Label htmlFor="file">Select File (PDF or Image) *</Label>
                  <Input
                    id="file"
                    type="file"
                    accept=".pdf,image/png,image/jpeg,image/jpg"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    required={!formData.isExternalLink}
                    className="cursor-pointer bg-background"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Max file size: 10MB. Allowed types: PDF, PNG, JPG.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="bg-muted/30 pt-6">
            <Button
              type="submit"
              className="w-full font-bold h-12"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-5 w-5" />
                  Submit for Review
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
