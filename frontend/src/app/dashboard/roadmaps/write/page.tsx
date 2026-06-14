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
import { ArrowLeft, Send, Plus, Trash2, Link as LinkIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function WriteRoadmapPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Skill",
    difficulty: "Beginner",
    estimatedTime: "",
    targetAudience: "",
    introNotes: "",
    globalPrerequisites: "",
    isAnonymous: false,
  });

  const [steps, setSteps] = useState([
    {
      title: "",
      description: "",
      prerequisites: "",
      resources: [{ title: "", url: "", type: "Article" }],
    },
  ]);

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to create a roadmap.");
      router.push("/login?redirect=/dashboard/roadmaps/write");
    }
  }, [router]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleStepChange = (index: number, field: string, value: any) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setSteps(newSteps);
  };

  const handleResourceChange = (
    stepIndex: number,
    resourceIndex: number,
    field: string,
    value: string,
  ) => {
    const newSteps = [...steps];
    newSteps[stepIndex].resources[resourceIndex] = {
      ...newSteps[stepIndex].resources[resourceIndex],
      [field]: value,
    };
    setSteps(newSteps);
  };

  const addStep = () => {
    setSteps([
      ...steps,
      { title: "", description: "", prerequisites: "", resources: [] },
    ]);
  };

  const removeStep = (index: number) => {
    const newSteps = steps.filter((_, i) => i !== index);
    setSteps(newSteps);
  };

  const addResource = (stepIndex: number) => {
    const newSteps = [...steps];
    newSteps[stepIndex].resources.push({ title: "", url: "", type: "Article" });
    setSteps(newSteps);
  };

  const removeResource = (stepIndex: number, resourceIndex: number) => {
    const newSteps = [...steps];
    newSteps[stepIndex].resources = newSteps[stepIndex].resources.filter(
      (_, i) => i !== resourceIndex,
    );
    setSteps(newSteps);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      alert("Please fill in at least the Title and Description.");
      return;
    }

    setSubmitting(true);
    try {
      const processedGlobalPrerequisites = formData.globalPrerequisites
        .split("\n")
        .map((p) => p.trim())
        .filter((p) => p.length > 0);

      const processedSteps = steps.map((s) => ({
        ...s,
        prerequisites: s.prerequisites
          ? s.prerequisites
              .split(",")
              .map((p) => p.trim())
              .filter((p) => p.length > 0)
          : [],
        resources: s.resources.filter((r) => r.title && r.url), // Filter out empty resources
      }));

      const payload = {
        ...formData,
        globalPrerequisites: processedGlobalPrerequisites,
        steps: processedSteps,
      };

      const res = await api.post("/roadmaps", payload);

      const data = res.data;
      router.push(`/roadmaps/${data._id}`);
    } catch (err) {
      console.error(err);
      alert("Error submitting roadmap. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/roadmaps"
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-lg font-semibold leading-tight">
              Create Roadmap
            </h1>
            <p className="text-xs text-muted-foreground">
              Guide others on their learning journey
            </p>
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={submitting}
          className="gap-2 bg-primary hover:bg-primary/90"
        >
          {submitting ? (
            "Publishing..."
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
            <CardTitle>Roadmap Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="e.g. Complete MERN Stack 2024"
                className="bg-muted/50"
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="A brief overview of what this roadmap covers."
                className="bg-muted/50"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(v) => handleInputChange("category", v)}
                >
                  <SelectTrigger className="bg-muted/50">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Skill">Skill</SelectItem>
                    <SelectItem value="Career">Career</SelectItem>
                    <SelectItem value="Technology">Technology</SelectItem>
                    <SelectItem value="Interview">Interview</SelectItem>
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
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Estimated Time</Label>
                <Input
                  value={formData.estimatedTime}
                  onChange={(e) =>
                    handleInputChange("estimatedTime", e.target.value)
                  }
                  placeholder="e.g. 12 Weeks"
                  className="bg-muted/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Target Audience</Label>
              <Input
                value={formData.targetAudience}
                onChange={(e) =>
                  handleInputChange("targetAudience", e.target.value)
                }
                placeholder="e.g. Absolute Beginners, 3rd Year Students"
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
                Publish Anonymously
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Prerequisites & Notes */}
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle>Preparation & Prerequisites</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Author's Intro Notes (Optional)</Label>
              <Textarea
                value={formData.introNotes}
                onChange={(e) =>
                  handleInputChange("introNotes", e.target.value)
                }
                placeholder="Any personal advice or context before they start?"
                className="min-h-[100px] bg-muted/50"
              />
            </div>
            <div className="space-y-2">
              <Label>Global Prerequisites (One per line)</Label>
              <Textarea
                value={formData.globalPrerequisites}
                onChange={(e) =>
                  handleInputChange("globalPrerequisites", e.target.value)
                }
                placeholder="What should they know before starting this roadmap?"
                className="min-h-[100px] bg-muted/50"
              />
            </div>
          </CardContent>
        </Card>

        {/* Steps */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Roadmap Steps</h2>
            <Button
              type="button"
              variant="outline"
              onClick={addStep}
              className="gap-2"
            >
              <Plus className="w-4 h-4" /> Add Step
            </Button>
          </div>

          {steps.map((step, index) => (
            <Card
              key={index}
              className="border-border shadow-sm relative group"
            >
              <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
                {steps.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                    onClick={() => removeStep(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <CardHeader>
                <CardTitle className="text-lg">Step {index + 1}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Step Title</Label>
                  <Input
                    value={step.title}
                    onChange={(e) =>
                      handleStepChange(index, "title", e.target.value)
                    }
                    placeholder="e.g. Advanced JavaScript Concepts"
                    className="bg-muted/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={step.description}
                    onChange={(e) =>
                      handleStepChange(index, "description", e.target.value)
                    }
                    placeholder="What will they learn in this step?"
                    className="bg-muted/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Prerequisites for this step (comma separated)</Label>
                  <Input
                    value={step.prerequisites}
                    onChange={(e) =>
                      handleStepChange(index, "prerequisites", e.target.value)
                    }
                    placeholder="e.g. Basic HTML, CSS"
                    className="bg-muted/50"
                  />
                </div>

                {/* Resources */}
                <div className="pt-4 border-t border-border">
                  <div className="flex items-center justify-between mb-4">
                    <Label className="text-base font-semibold">
                      Resources for Step {index + 1}
                    </Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => addResource(index)}
                      className="gap-1 h-8 text-primary"
                    >
                      <Plus className="w-3 h-3" /> Add Resource
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {step.resources.map((resource, resIdx) => (
                      <div
                        key={resIdx}
                        className="flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-muted/20 p-3 rounded-lg border border-border"
                      >
                        <Input
                          placeholder="Resource Title"
                          value={resource.title}
                          onChange={(e) =>
                            handleResourceChange(
                              index,
                              resIdx,
                              "title",
                              e.target.value,
                            )
                          }
                          className="flex-1 bg-background"
                        />
                        <div className="flex w-full sm:w-auto gap-3">
                          <Input
                            placeholder="URL"
                            value={resource.url}
                            onChange={(e) =>
                              handleResourceChange(
                                index,
                                resIdx,
                                "url",
                                e.target.value,
                              )
                            }
                            className="flex-1 sm:w-[200px] bg-background"
                          />
                          <Select
                            value={resource.type}
                            onValueChange={(v) =>
                              handleResourceChange(
                                index,
                                resIdx,
                                "type",
                                v || "",
                              )
                            }
                          >
                            <SelectTrigger className="w-[120px] bg-background">
                              <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Article">Article</SelectItem>
                              <SelectItem value="Video">Video</SelectItem>
                              <SelectItem value="Course">Course</SelectItem>
                              <SelectItem value="Book">Book</SelectItem>
                              <SelectItem value="Tool">Tool</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-rose-500 shrink-0"
                            onClick={() => removeResource(index, resIdx)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {step.resources.length === 0 && (
                      <p className="text-sm text-muted-foreground italic">
                        No resources added. Click "Add Resource" to include
                        links.
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
