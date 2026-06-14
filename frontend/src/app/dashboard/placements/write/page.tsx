"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
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
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Send, Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function WritePlacementPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: "",
    company: "",
    role: "",
    type: "On-Campus",
    offerStatus: "Accepted",
    difficulty: "Medium",
    ctc: "",
    preparationStrategy: "",
    adviceForJuniors: "",
    isAnonymous: false,
  });

  const [rounds, setRounds] = useState([
    { title: "", duration: "", topics: "", description: "" },
  ]);

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to share an experience.");
      router.push("/login?redirect=/dashboard/placements/write");
    }
  }, [router]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRoundChange = (index: number, field: string, value: string) => {
    const newRounds = [...rounds];
    newRounds[index] = { ...newRounds[index], [field]: value };
    setRounds(newRounds);
  };

  const addRound = () => {
    setRounds([
      ...rounds,
      { title: "", duration: "", topics: "", description: "" },
    ]);
  };

  const removeRound = (index: number) => {
    const newRounds = rounds.filter((_, i) => i !== index);
    setRounds(newRounds);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.company || !formData.role) {
      alert("Please fill in at least the Title, Company, and Role.");
      return;
    }

    setSubmitting(true);
    try {
      // Process rounds to convert comma-separated topics into arrays
      const processedRounds = rounds.map((r) => ({
        ...r,
        topics: r.topics
          ? r.topics
              .split(",")
              .map((t) => t.trim())
              .filter((t) => t.length > 0)
          : [],
      }));

      const payload = {
        ...formData,
        rounds: processedRounds,
      };

      const res = await api.post("/placements", payload);

      const data = res.data;
      router.push(`/placements/${data._id}`);
    } catch (err) {
      console.error(err);
      alert("Error submitting experience. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/placements"
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-lg font-semibold leading-tight">
              Share Interview Experience
            </h1>
            <p className="text-xs text-muted-foreground">
              Help your juniors prepare
            </p>
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={submitting}
          className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          {submitting ? (
            "Submitting..."
          ) : (
            <>
              Publish <Send className="h-4 w-4" />
            </>
          )}
        </Button>
      </header>

      <div className="container max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* General Info */}
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle>General Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Title (e.g., Amazon SDE Intern Experience 2024)</Label>
              <Input
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Enter a descriptive title"
                className="bg-muted/50"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Company</Label>
                <Input
                  value={formData.company}
                  onChange={(e) => handleInputChange("company", e.target.value)}
                  placeholder="e.g. Google, Amazon, Oracle"
                  className="bg-muted/50"
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Input
                  value={formData.role}
                  onChange={(e) => handleInputChange("role", e.target.value)}
                  placeholder="e.g. SDE Intern, Business Analyst"
                  className="bg-muted/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(v) => handleInputChange("type", v)}
                >
                  <SelectTrigger className="bg-muted/50">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="On-Campus">On-Campus</SelectItem>
                    <SelectItem value="Off-Campus">Off-Campus</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Offer Status</Label>
                <Select
                  value={formData.offerStatus}
                  onValueChange={(v) => handleInputChange("offerStatus", v)}
                >
                  <SelectTrigger className="bg-muted/50">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Accepted">Accepted</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Difficulty</Label>
                <Select
                  value={formData.difficulty}
                  onValueChange={(v) => handleInputChange("difficulty", v)}
                >
                  <SelectTrigger className="bg-muted/50">
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Easy">Easy</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>CTC / Stipend (Optional)</Label>
              <Input
                value={formData.ctc}
                onChange={(e) => handleInputChange("ctc", e.target.value)}
                placeholder="e.g. 15 LPA or 1.1L/month"
                className="bg-muted/50"
              />
            </div>

            <div className="flex items-center space-x-2 pt-2 border-t border-border mt-6">
              <Switch
                id="anonymous"
                checked={formData.isAnonymous}
                onCheckedChange={(c: boolean) =>
                  handleInputChange("isAnonymous", c)
                }
              />
              <Label htmlFor="anonymous" className="cursor-pointer">
                Post Anonymously
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Strategies */}
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle>Preparation & Advice</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Preparation Strategy</Label>
              <Textarea
                value={formData.preparationStrategy}
                onChange={(e) =>
                  handleInputChange("preparationStrategy", e.target.value)
                }
                placeholder="How did you prepare? What resources did you use?"
                className="min-h-[120px] bg-muted/50"
              />
            </div>
            <div className="space-y-2">
              <Label>Advice for Juniors</Label>
              <Textarea
                value={formData.adviceForJuniors}
                onChange={(e) =>
                  handleInputChange("adviceForJuniors", e.target.value)
                }
                placeholder="Any tips or things to avoid?"
                className="min-h-[120px] bg-muted/50"
              />
            </div>
          </CardContent>
        </Card>

        {/* Rounds */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Interview Rounds</h2>
            <Button
              type="button"
              variant="outline"
              onClick={addRound}
              className="gap-2"
            >
              <Plus className="w-4 h-4" /> Add Round
            </Button>
          </div>

          {rounds.map((round, index) => (
            <Card
              key={index}
              className="border-border shadow-sm relative group"
            >
              <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
                {rounds.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                    onClick={() => removeRound(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <CardHeader>
                <CardTitle className="text-lg">Round {index + 1}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Round Title</Label>
                    <Input
                      value={round.title}
                      onChange={(e) =>
                        handleRoundChange(index, "title", e.target.value)
                      }
                      placeholder="e.g. Online Assessment, Technical Round 1"
                      className="bg-muted/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Duration</Label>
                    <Input
                      value={round.duration}
                      onChange={(e) =>
                        handleRoundChange(index, "duration", e.target.value)
                      }
                      placeholder="e.g. 90 Minutes"
                      className="bg-muted/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Topics Covered (comma separated)</Label>
                  <Input
                    value={round.topics}
                    onChange={(e) =>
                      handleRoundChange(index, "topics", e.target.value)
                    }
                    placeholder="e.g. Arrays, Graph, OS, OOPS"
                    className="bg-muted/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description / Questions Asked</Label>
                  <Textarea
                    value={round.description}
                    onChange={(e) =>
                      handleRoundChange(index, "description", e.target.value)
                    }
                    placeholder="Describe the round, questions asked, and your approach."
                    className="min-h-[120px] bg-muted/50"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
