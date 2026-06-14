"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import { useConfigStore } from "@/store/useConfigStore";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Settings, ShieldCheck } from "lucide-react";

export default function AdminSettingsPage() {
  const router = useRouter();
  const { user, token, isAuthenticated, isLoading } = useAuthStore();
  const { taglineLanguage, instituteName, fetchConfig } = useConfigStore();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    instituteName: "",
    allowedEmailPatterns: "",
    taglineLanguage: "hindi",
  });

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || user?.role !== "super_admin") {
        router.push("/admin");
      } else {
        setFormData({
          instituteName: instituteName || "",
          allowedEmailPatterns: "", // To be filled if we fetched the full settings from a private route, but for now they can rewrite it
          taglineLanguage: taglineLanguage || "hindi",
        });
      }
    }
  }, [
    isLoading,
    isAuthenticated,
    user,
    router,
    instituteName,
    taglineLanguage,
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post(
        "/setup/configure",
        {
          instituteName: formData.instituteName,
          allowedEmailPatterns: formData.allowedEmailPatterns
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          taglineLanguage: formData.taglineLanguage,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      await fetchConfig(); // Refresh public global config
      alert("Settings updated successfully!");
    } catch (error: any) {
      console.error(error);
      alert("Failed to update settings.");
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || !user) return <div className="p-8">Loading...</div>;

  return (
    <div className="w-full max-w-6xl space-y-6">
      <Card className="w-full border shadow-sm">
        <CardHeader className="space-y-1 bg-muted/50 rounded-t-xl pb-6 border-b">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <h2 className="text-sm font-semibold tracking-wider text-primary uppercase">
              Super Admin Only
            </h2>
          </div>
        </CardHeader>
        <CardContent className="pt-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="instituteName"
                    className="text-foreground font-bold"
                  >
                    Institute Name
                  </Label>
                  <Input
                    id="instituteName"
                    value={formData.instituteName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        instituteName: e.target.value,
                      })
                    }
                    required
                    className="bg-background focus-visible:ring-primary h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="allowedEmailPatterns"
                    className="text-foreground font-bold"
                  >
                    Allowed Email Domains (Comma separated)
                  </Label>
                  <Input
                    id="allowedEmailPatterns"
                    placeholder="e.g. *@*.nitrr.ac.in"
                    value={formData.allowedEmailPatterns}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        allowedEmailPatterns: e.target.value,
                      })
                    }
                    className="bg-background focus-visible:ring-primary h-12"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Re-enter domains to update them. Empty values will be
                    ignored.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="taglineLanguage"
                    className="text-foreground font-bold"
                  >
                    Hero Tagline Language
                  </Label>
                  <select
                    id="taglineLanguage"
                    value={formData.taglineLanguage}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        taglineLanguage: e.target.value,
                      })
                    }
                    className="w-full h-12 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <option value="hindi">Hindi (Playful default)</option>
                    <option value="english">
                      English (Professional/Alternative)
                    </option>
                  </select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Changes the tagline displayed on the public landing page.
                  </p>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-lg font-medium mt-6"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Configuration"}
              {!loading && <Settings className="ml-2 h-5 w-5" />}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
