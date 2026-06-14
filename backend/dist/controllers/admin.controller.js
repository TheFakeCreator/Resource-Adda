"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOverviewStats = void 0;
const User_1 = __importDefault(require("../models/User"));
const Document_1 = __importDefault(require("../models/Document"));
const Blog_1 = __importDefault(require("../models/Blog"));
const WellbeingPost_1 = __importDefault(require("../models/WellbeingPost"));
const InterviewExperience_1 = __importDefault(
  require("../models/InterviewExperience"),
);
const Roadmap_1 = __importDefault(require("../models/Roadmap"));
const getOverviewStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalDocuments,
      totalBlogs,
      totalWellbeingPosts,
      totalInterviews,
      totalRoadmaps,
    ] = await Promise.all([
      User_1.default.countDocuments(),
      Document_1.default.countDocuments(),
      Blog_1.default.countDocuments(),
      WellbeingPost_1.default.countDocuments(),
      InterviewExperience_1.default.countDocuments(),
      Roadmap_1.default.countDocuments(),
    ]);
    // Gather some recent activity
    const recentUsers = await User_1.default
      .find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name email avatarUrl branch semester createdAt");
    const recentDocuments = await Document_1.default
      .find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("uploadedBy", "name avatarUrl")
      .select("title type branch createdAt uploadedBy");
    // For reports, we could theoretically count if there is a report model,
    // but right now it looks like we don't have a distinct Report model.
    // Shadowbanned content is inferred from the `reportCount` field in Blog / WellbeingPost.
    // Let's count flagged content (e.g., reportCount >= 3)
    const flaggedBlogs = await Blog_1.default.countDocuments({
      reportCount: { $gte: 3 },
    });
    const flaggedPosts = await WellbeingPost_1.default.countDocuments({
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
  } catch (error) {
    res.status(500).json({
      message: "Server error fetching admin stats",
      error: error.message,
    });
  }
};
exports.getOverviewStats = getOverviewStats;
