"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import {
  LogOut,
  BookOpen,
  UploadCloud,
  User as UserIcon,
  LayoutDashboard,
  FileText,
  Bookmark,
  Settings,
  Award,
  TrendingUp,
  CheckCircle2,
  Clock,
  XCircle,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading, logout, checkAuth } =
    useAuthStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [contributions, setContributions] = useState<any[]>([]);
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Profile Form State
  const getFirstName = (nameStr?: string) =>
    nameStr ? nameStr.split(" ")[0] : "";
  const getLastName = (nameStr?: string) =>
    nameStr ? nameStr.split(" ").slice(1).join(" ") : "";

  const [profileForm, setProfileForm] = useState({
    firstName: getFirstName(user?.name),
    lastName: getLastName(user?.name),
    branch: user?.branch || "",
    semester: user?.semester || 1,
    bio: user?.bio || "",
    rollNumber: user?.rollNumber || "",
    section: user?.section || "",
    graduationYear: user?.graduationYear || new Date().getFullYear() + 4,
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({
        firstName: getFirstName(user.name),
        lastName: getLastName(user.name),
        branch: user.branch || "",
        semester: user.semester || 1,
        bio: user.bio || "",
        rollNumber: user.rollNumber || "",
        section: user.section || "",
        graduationYear: user.graduationYear || new Date().getFullYear() + 4,
      });
    }
  }, [user]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(
        `/login?redirect=${encodeURIComponent(window.location.pathname)}`,
      );
    } else if (isAuthenticated) {
      fetchContributions();
      fetchBookmarks();
    }
  }, [isAuthenticated, isLoading, router]);

  const fetchContributions = async () => {
    setLoadingData(true);
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/users/me/contributions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setContributions([
        ...res.data.resources,
        ...res.data.experiences,
        ...res.data.roadmaps,
      ]);
    } catch (err) {
      console.error("Failed to fetch contributions", err);
    } finally {
      setLoadingData(false);
    }
  };

  const fetchBookmarks = async () => {
    try {
      const res = await api.get("/users/me/bookmarks");
      setBookmarks(res.data);
    } catch (err) {
      console.error("Failed to fetch bookmarks", err);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");

      const payload = {
        name: `${profileForm.firstName.trim()} ${profileForm.lastName.trim()}`.trim(),
        branch: profileForm.branch,
        semester: profileForm.semester,
        bio: profileForm.bio,
        rollNumber: profileForm.rollNumber,
        section: profileForm.section,
        graduationYear: profileForm.graduationYear,
      };

      await api.put("/users/me", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await checkAuth(); // Refresh the user object in the store
    } catch (err) {
      console.error("Failed to update profile", err);
      alert("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  if (!user) return null;

  // Real Gamification Stats
  const userUpvotes = user.contributionPoints || 0;
  const currentLevel = Math.floor(userUpvotes / 100) + 1;
  const xpToNextLevel = 100 - (userUpvotes % 100);
  const progressPercent = userUpvotes % 100;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Approved":
        return (
          <Badge
            variant="outline"
            className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
          >
            <CheckCircle2 className="w-3 h-3 mr-1" /> Approved
          </Badge>
        );
      case "Pending":
        return (
          <Badge
            variant="outline"
            className="bg-amber-500/10 text-amber-600 border-amber-500/20"
          >
            <Clock className="w-3 h-3 mr-1" /> Pending
          </Badge>
        );
      case "Rejected":
        return (
          <Badge
            variant="outline"
            className="bg-rose-500/10 text-rose-600 border-rose-500/20"
          >
            <XCircle className="w-3 h-3 mr-1" /> Rejected
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* 1. Profile Banner */}
      <div className="bg-muted/30 border-b border-border pt-12 pb-24 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[50%] -right-[10%] w-[40%] h-[200%] rounded-full bg-primary/5 blur-3xl" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl relative z-10">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <Avatar className="w-32 h-32 border-4 border-background shadow-xl">
              <AvatarImage
                src={`https://ui-avatars.com/api/?name=${user.name}&background=random&size=128`}
              />
              <AvatarFallback>
                <UserIcon className="w-12 h-12" />
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold tracking-tight">
                  {user.name}
                </h1>
                <Badge
                  variant="outline"
                  className="bg-primary/10 text-primary border-primary/20 capitalize shadow-sm"
                >
                  {user.role.replace("_", " ")}
                </Badge>
                {user.isVerified && (
                  <Badge
                    variant="outline"
                    className="bg-blue-500/10 text-blue-500 border-blue-500/20 shadow-sm"
                  >
                    <ShieldCheck className="w-3 h-3 mr-1" /> Verified
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground mb-1">{user.email}</p>
              <p className="text-sm font-medium text-foreground mb-6">
                Semester {user.semester || "N/A"} •{" "}
                {user.branch || "No branch specified"}
              </p>

              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <Button
                  onClick={() => router.push("/dashboard/upload")}
                  className="shadow-md"
                >
                  <UploadCloud className="mr-2 h-4 w-4" />
                  Upload Resource
                </Button>
                {(user.role === "super_admin" || user.role === "admin") && (
                  <Button
                    variant="outline"
                    onClick={() => router.push("/admin")}
                    className="shadow-sm"
                  >
                    Admin Dashboard
                  </Button>
                )}
                <Button
                  variant="ghost"
                  className="text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                  onClick={logout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>

            {/* Gamification Stats Card */}
            <div className="w-full md:w-80 bg-card border border-border rounded-2xl p-5 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-amber-400 to-orange-500" />
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">
                    Reputation
                  </p>
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-500" />
                    <span className="text-2xl font-black">
                      Level {currentLevel}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">
                    Total XP
                  </p>
                  <span className="text-xl font-bold text-primary">
                    {userUpvotes}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-muted-foreground">
                    {xpToNextLevel} XP to Level {currentLevel + 1}
                  </span>
                  <span className="text-amber-500">{progressPercent}%</span>
                </div>
                <div className="h-2.5 w-full bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-1000"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl -mt-8 relative z-20">
        {!user.isVerified && (
          <div className="mb-8 p-4 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 rounded-xl shadow-md flex items-center">
            <span className="font-bold mr-2">Action Required:</span>
            Your account is currently under review or awaiting email
            verification. You cannot upload resources until verified.
          </div>
        )}

        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[500px]">
          {/* Custom Tabs Sidebar */}
          <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-border bg-muted/10 p-4">
            <nav className="flex md:flex-col space-x-2 md:space-x-0 md:space-y-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
              <button
                onClick={() => setActiveTab("overview")}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === "overview"
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                <LayoutDashboard className="w-4 h-4" /> Overview
              </button>
              <button
                onClick={() => setActiveTab("contributions")}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === "contributions"
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                <UploadCloud className="w-4 h-4" /> My Contributions
              </button>
              <button
                onClick={() => setActiveTab("bookmarks")}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === "bookmarks"
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                <Bookmark className="w-4 h-4" /> Saved & Bookmarks
              </button>
              <button
                onClick={() => setActiveTab("settings")}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === "settings"
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                <Settings className="w-4 h-4" /> Account Settings
              </button>
            </nav>
          </div>

          {/* Tab Content Area */}
          <div className="flex-1 p-6 md:p-10">
            {/* OVERVIEW TAB */}
            {activeTab === "overview" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight mb-1">
                    Welcome back, {user.name?.split(" ")[0] || "User"}!
                  </h2>
                  <p className="text-muted-foreground">
                    Here is what is happening with your account today.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Card className="bg-blue-500/5 border-blue-500/20 shadow-none">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                        <FileText className="w-4 h-4 mr-2 text-blue-500" />{" "}
                        Total Uploads
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-foreground">
                        {contributions.length}
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-amber-500/5 border-amber-500/20 shadow-none">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                        <TrendingUp className="w-4 h-4 mr-2 text-amber-500" />{" "}
                        Upvotes Received
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-foreground">
                        {userUpvotes}
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-purple-500/5 border-purple-500/20 shadow-none">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                        <Bookmark className="w-4 h-4 mr-2 text-purple-500" />{" "}
                        Saved Items
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-foreground">
                        {bookmarks.length}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-8 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                    <UploadCloud className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">
                    Share your knowledge
                  </h3>
                  <p className="text-muted-foreground max-w-md mx-auto mb-6">
                    Help your juniors out! Upload your previous year papers,
                    assignments, and class notes to earn Reputation XP.
                  </p>
                  <Button onClick={() => router.push("/dashboard/upload")}>
                    Upload Now
                  </Button>
                </div>
              </div>
            )}

            {/* CONTRIBUTIONS TAB */}
            {activeTab === "contributions" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight mb-1">
                      My Contributions
                    </h2>
                    <p className="text-muted-foreground">
                      Manage your uploaded study materials.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => router.push("/dashboard/upload")}
                  >
                    <UploadCloud className="w-4 h-4 mr-2" /> New
                  </Button>
                </div>

                <div className="space-y-4">
                  {loadingData ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Loading contributions...
                    </div>
                  ) : contributions.length === 0 ? (
                    <div className="text-center py-8 border border-dashed rounded-xl bg-muted/20 text-muted-foreground">
                      No contributions yet. Start sharing to earn XP!
                    </div>
                  ) : (
                    contributions.map((item) => (
                      <div
                        key={item._id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-border bg-card hover:shadow-md transition-shadow gap-4"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h4 className="font-semibold">
                              {item.title || item.company}
                            </h4>
                            {getStatusBadge(
                              item.status
                                ? item.status.charAt(0).toUpperCase() +
                                    item.status.slice(1)
                                : "Pending",
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center">
                              <FileText className="w-3.5 h-3.5 mr-1" />{" "}
                              {(item as any).type ||
                                (item.company ? "Placement" : "Roadmap")}
                            </span>
                            <span className="flex items-center">
                              <TrendingUp className="w-3.5 h-3.5 mr-1" />{" "}
                              {item.upvotes || 0} upvotes
                            </span>
                            <span className="flex items-center">
                              <Clock className="w-3.5 h-3.5 mr-1" />{" "}
                              {new Date(item.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* BOOKMARKS TAB */}
            {activeTab === "bookmarks" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight mb-1">
                    Saved & Bookmarks
                  </h2>
                  <p className="text-muted-foreground">
                    Quick access to your favorite resources.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {bookmarks.length === 0 ? (
                    <div className="col-span-2 text-center py-8 border border-dashed rounded-xl bg-muted/20 text-muted-foreground">
                      You haven't saved any resources yet.
                    </div>
                  ) : (
                    bookmarks.map((item) => (
                      <Link
                        href={item.link}
                        key={item.id}
                        className="group flex h-full"
                      >
                        <Card className="h-full w-full flex flex-col hover:border-primary/50 hover:shadow-md transition-all">
                          <CardHeader className="pb-3 flex-1">
                            <Badge variant="outline" className="w-max mb-2">
                              {item.type}
                            </Badge>
                            <CardTitle className="text-lg group-hover:text-primary transition-colors">
                              {item.title}
                            </CardTitle>
                          </CardHeader>
                          <CardFooter className="pt-0 mt-auto">
                            <span className="text-sm text-primary font-medium flex items-center">
                              View Details{" "}
                              <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                            </span>
                          </CardFooter>
                        </Card>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* SETTINGS TAB */}
            {activeTab === "settings" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight mb-1">
                    Account Settings
                  </h2>
                  <p className="text-muted-foreground">
                    Update your personal information and preferences.
                  </p>
                </div>

                <Card className="shadow-none">
                  <CardHeader>
                    <CardTitle>Profile Details</CardTitle>
                    <CardDescription>
                      This information will be displayed on your uploads.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={profileForm.firstName}
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              firstName: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={profileForm.lastName}
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              lastName: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Input
                        id="bio"
                        placeholder="Tell us a little about yourself"
                        value={profileForm.bio}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            bio: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="branch">Branch</Label>
                        <Input
                          id="branch"
                          placeholder="e.g. Computer Science"
                          value={profileForm.branch}
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              branch: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="semester">Semester</Label>
                        <Input
                          id="semester"
                          type="number"
                          min="1"
                          max="10"
                          value={profileForm.semester}
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              semester: parseInt(e.target.value) || 1,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="rollNumber">Roll Number</Label>
                        <Input
                          id="rollNumber"
                          value={profileForm.rollNumber}
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              rollNumber: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="section">Section</Label>
                        <Input
                          id="section"
                          placeholder="e.g. A, B, C"
                          value={profileForm.section}
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              section: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="graduationYear">Graduation Year</Label>
                        <Input
                          id="graduationYear"
                          type="number"
                          min="2020"
                          max="2030"
                          value={profileForm.graduationYear}
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              graduationYear:
                                parseInt(e.target.value) ||
                                new Date().getFullYear() + 4,
                            })
                          }
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={handleSaveProfile} disabled={isSaving}>
                      {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                  </CardFooter>
                </Card>

                <Card className="shadow-none border-rose-500/20">
                  <CardHeader>
                    <CardTitle className="text-rose-600">Danger Zone</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Once you delete your account, there is no going back.
                      Please be certain.
                    </p>
                    <Button variant="destructive">Delete Account</Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
