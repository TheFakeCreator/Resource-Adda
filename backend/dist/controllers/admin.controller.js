"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOverviewStats = void 0;
const User_1 = __importDefault(require("../models/User"));
const Document_1 = __importDefault(require("../models/Document"));
const Blog_1 = __importDefault(require("../models/Blog"));
const WellbeingPost_1 = __importDefault(require("../models/WellbeingPost"));
const InterviewExperience_1 = __importDefault(require("../models/InterviewExperience"));
const Roadmap_1 = __importDefault(require("../models/Roadmap"));
const WellbeingComment_1 = __importDefault(require("../models/WellbeingComment"));
const Contribution_1 = require("../models/Contribution");
const getOverviewStats = async (req, res) => {
    try {
        const [totalUsers, totalDocuments, totalBlogs, totalWellbeingPosts, totalInterviews, totalRoadmaps,] = await Promise.all([
            User_1.default.countDocuments(),
            Document_1.default.countDocuments(),
            Blog_1.default.countDocuments(),
            WellbeingPost_1.default.countDocuments(),
            InterviewExperience_1.default.countDocuments(),
            Roadmap_1.default.countDocuments(),
        ]);
        // Gather some recent activity
        const recentUsers = await User_1.default.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select("name email avatarUrl branch semester createdAt");
        const recentDocuments = await Document_1.default.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate("uploadedBy", "name avatarUrl")
            .select("title type branch createdAt uploadedBy");
        // Shadowbanned content is inferred from the `status` field
        // Documents, Experiences, and Roadmaps use ContributionStatus.PENDING when shadowbanned
        const flaggedDocuments = await Document_1.default.countDocuments({
            status: Contribution_1.ContributionStatus.PENDING,
        });
        const flaggedInterviews = await InterviewExperience_1.default.countDocuments({
            status: Contribution_1.ContributionStatus.PENDING,
        });
        const flaggedRoadmaps = await Roadmap_1.default.countDocuments({
            status: Contribution_1.ContributionStatus.PENDING,
        });
        // Wellbeing uses a string status
        const flaggedPosts = await WellbeingPost_1.default.countDocuments({
            status: "pending",
        });
        const flaggedComments = await WellbeingComment_1.default.countDocuments({
            status: "pending",
        });
        // Fallback for blogs
        const flaggedBlogs = await Blog_1.default.countDocuments({
            reportCount: { $gte: 5 },
        });
        const pendingReports = flaggedDocuments +
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
    }
    catch (error) {
        console.error("Server error:", error);
        res.status(500).json({
            message: "Server error fetching admin stats",
            error: "An internal server error occurred",
        });
    }
};
exports.getOverviewStats = getOverviewStats;
