import { Request, Response } from "express";
import User from "../models/User";
import Document from "../models/Document";
import Blog from "../models/Blog";
import WellbeingPost from "../models/WellbeingPost";
import InterviewExperience from "../models/InterviewExperience";
import Roadmap from "../models/Roadmap";
import WellbeingComment from "../models/WellbeingComment";
import { ContributionStatus } from "../models/Contribution";

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

    // Shadowbanned content is inferred from the `status` field
    // Documents, Experiences, and Roadmaps use ContributionStatus.PENDING when shadowbanned
    const flaggedDocuments = await Document.countDocuments({
      status: ContributionStatus.PENDING,
    });
    const flaggedInterviews = await InterviewExperience.countDocuments({
      status: ContributionStatus.PENDING,
    });
    const flaggedRoadmaps = await Roadmap.countDocuments({
      status: ContributionStatus.PENDING,
    });

    // Wellbeing uses a string status
    const flaggedPosts = await WellbeingPost.countDocuments({
      status: "pending",
    });
    const flaggedComments = await WellbeingComment.countDocuments({
      status: "pending",
    });

    // Fallback for blogs
    const flaggedBlogs = await Blog.countDocuments({
      reportCount: { $gte: 5 },
    });

    const pendingReports =
      flaggedDocuments +
      flaggedInterviews +
      flaggedRoadmaps +
      flaggedPosts +
      flaggedComments +
      flaggedBlogs;

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
