import { Request, Response } from "express";
import User from "../models/User";
import Document from "../models/Document";
import Blog from "../models/Blog";
import WellbeingPost from "../models/WellbeingPost";
import InterviewExperience from "../models/InterviewExperience";
import Roadmap from "../models/Roadmap";

export const getOverviewStats = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const [
      totalUsers,
      totalDocuments,
      totalBlogs,
      totalWellbeingPosts,
      totalInterviews,
      totalRoadmaps,
    ] = await Promise.all([
      User.countDocuments(),
      Document.countDocuments(),
      Blog.countDocuments(),
      WellbeingPost.countDocuments(),
      InterviewExperience.countDocuments(),
      Roadmap.countDocuments(),
    ]);

    // Gather some recent activity
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name email avatarUrl branch semester createdAt");

    const recentDocuments = await Document.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("uploadedBy", "name avatarUrl")
      .select("title type branch createdAt uploadedBy");

    // For reports, we could theoretically count if there is a report model,
    // but right now it looks like we don't have a distinct Report model.
    // Shadowbanned content is inferred from the `reportCount` field in Blog / WellbeingPost.
    // Let's count flagged content (e.g., reportCount >= 3)
    const flaggedBlogs = await Blog.countDocuments({
      reportCount: { $gte: 3 },
    });
    const flaggedPosts = await WellbeingPost.countDocuments({
      reportCount: { $gte: 3 },
    });
    const pendingReports = flaggedBlogs + flaggedPosts;

    res.json({
      stats: {
        totalUsers,
        totalResources: totalDocuments + totalRoadmaps + totalInterviews, // aggregated
        totalBlogs,
        totalWellbeingPosts,
        pendingReports,
        detailed: {
          documents: totalDocuments,
          roadmaps: totalRoadmaps,
          interviews: totalInterviews,
        },
      },
      recentUsers,
      recentDocuments,
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Server error fetching admin stats",
      error: error.message,
    });
  }
};
