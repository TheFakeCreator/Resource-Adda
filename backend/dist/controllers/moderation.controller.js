"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportItem = exports.reviewContribution = exports.getPendingQueue = void 0;
const Contribution_1 = __importStar(require("../models/Contribution"));
const Document_1 = __importDefault(require("../models/Document"));
const InterviewExperience_1 = __importDefault(require("../models/InterviewExperience"));
const Roadmap_1 = __importDefault(require("../models/Roadmap"));
const WellbeingPost_1 = __importDefault(require("../models/WellbeingPost"));
const WellbeingComment_1 = __importDefault(require("../models/WellbeingComment"));
const Report_1 = __importDefault(require("../models/Report"));
const User_1 = __importDefault(require("../models/User"));
const gamification_service_1 = require("../services/gamification.service");
const getPendingQueue = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        // Fetch all pending items across the 3 models
        const [pendingDocuments, docTotal] = await Promise.all([
            Contribution_1.default.find({ status: Contribution_1.ContributionStatus.PENDING })
                .populate("documentId")
                .populate("userId", "name email")
                .skip(skip)
                .limit(limit),
            Contribution_1.default.countDocuments({ status: Contribution_1.ContributionStatus.PENDING }),
        ]);
        const [pendingExperiences, expTotal] = await Promise.all([
            InterviewExperience_1.default.find({ status: Contribution_1.ContributionStatus.PENDING })
                .populate("author", "name email")
                .skip(skip)
                .limit(limit),
            InterviewExperience_1.default.countDocuments({
                status: Contribution_1.ContributionStatus.PENDING,
            }),
        ]);
        const [pendingRoadmaps, rmTotal] = await Promise.all([
            Roadmap_1.default.find({ status: Contribution_1.ContributionStatus.PENDING })
                .populate("author", "name email")
                .skip(skip)
                .limit(limit),
            Roadmap_1.default.countDocuments({ status: Contribution_1.ContributionStatus.PENDING }),
        ]);
        const [pendingWellbeingPosts, wpTotal] = await Promise.all([
            WellbeingPost_1.default.find({ status: "pending" })
                .populate("author", "name email")
                .skip(skip)
                .limit(limit),
            WellbeingPost_1.default.countDocuments({ status: "pending" }),
        ]);
        const [pendingWellbeingComments, wcTotal] = await Promise.all([
            WellbeingComment_1.default.find({ status: "pending" })
                .populate("author", "name email")
                .skip(skip)
                .limit(limit),
            WellbeingComment_1.default.countDocuments({ status: "pending" }),
        ]);
        res.status(200).json({
            documents: pendingDocuments,
            experiences: pendingExperiences,
            roadmaps: pendingRoadmaps,
            wellbeingPosts: pendingWellbeingPosts,
            wellbeingComments: pendingWellbeingComments,
            pagination: {
                page,
                limit,
                totalDocuments: docTotal,
                totalExperiences: expTotal,
                totalRoadmaps: rmTotal,
                hasMore: skip + limit <
                    Math.max(docTotal, expTotal, rmTotal, wpTotal, wcTotal),
            },
        });
    }
    catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ error: "An internal server error occurred" });
    }
};
exports.getPendingQueue = getPendingQueue;
const reviewContribution = async (req, res) => {
    try {
        const { type, id } = req.params; // type: 'document' | 'experience' | 'roadmap'
        const { action } = req.body; // 'approve' | 'reject'
        if (!["approve", "reject"].includes(action)) {
            res
                .status(400)
                .json({ error: "Invalid action. Must be approve or reject" });
            return;
        }
        const newStatus = action === "approve"
            ? Contribution_1.ContributionStatus.APPROVED
            : Contribution_1.ContributionStatus.REJECTED;
        if (type === "document") {
            const contribution = await Contribution_1.default.findById(id);
            if (!contribution) {
                res.status(404).json({ error: "Not found" });
                return;
            }
            contribution.status = newStatus;
            await contribution.save();
            if (action === "approve") {
                await gamification_service_1.GamificationService.awardPoints(contribution.userId.toString(), "DOCUMENT");
            }
        }
        else if (type === "experience") {
            const experience = await InterviewExperience_1.default.findById(id);
            if (!experience) {
                res.status(404).json({ error: "Not found" });
                return;
            }
            experience.status = newStatus;
            await experience.save();
            if (action === "approve") {
                await gamification_service_1.GamificationService.awardPoints(experience.author.toString(), "INTERVIEW_EXPERIENCE");
            }
        }
        else if (type === "roadmap") {
            const roadmap = await Roadmap_1.default.findById(id);
            if (!roadmap) {
                res.status(404).json({ error: "Not found" });
                return;
            }
            roadmap.status = newStatus;
            await roadmap.save();
            if (action === "approve") {
                await gamification_service_1.GamificationService.awardPoints(roadmap.author.toString(), "ROADMAP");
            }
        }
        else if (type === "wellbeing_post") {
            const post = await WellbeingPost_1.default.findById(id);
            if (!post) {
                res.status(404).json({ error: "Not found" });
                return;
            }
            post.status = action === "approve" ? "approved" : "rejected";
            if (action === "approve")
                post.reportCount = 0; // reset report count
            await post.save();
        }
        else if (type === "wellbeing_comment") {
            const comment = await WellbeingComment_1.default.findById(id);
            if (!comment) {
                res.status(404).json({ error: "Not found" });
                return;
            }
            comment.status = action === "approve" ? "approved" : "rejected";
            if (action === "approve")
                comment.reportCount = 0;
            await comment.save();
        }
        else {
            res.status(400).json({ error: "Invalid contribution type" });
            return;
        }
        res.status(200).json({ message: `Successfully ${action}d ${type}` });
    }
    catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ error: "An internal server error occurred" });
    }
};
exports.reviewContribution = reviewContribution;
const reportItem = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        const { itemId, itemModel, reason } = req.body;
        if (!itemId || !itemModel || !reason) {
            res.status(400).json({ error: "Missing required fields" });
            return;
        }
        // Check if user already reported this item
        const existingReport = await Report_1.default.findOne({
            reportedItemId: itemId,
            reportedBy: req.user._id,
        });
        if (existingReport) {
            res.status(400).json({ error: "You have already reported this item" });
            return;
        }
        // Save report
        const report = new Report_1.default({
            reportedItemId: itemId,
            itemModel,
            reportedBy: req.user._id,
            reason,
        });
        await report.save();
        // Determine the Mongoose model
        let Model;
        switch (itemModel) {
            case "Roadmap":
                Model = Roadmap_1.default;
                break;
            case "InterviewExperience":
                Model = InterviewExperience_1.default;
                break;
            case "Document":
                Model = Document_1.default;
                break;
            case "WellbeingPost":
                Model = WellbeingPost_1.default;
                break;
            case "WellbeingComment":
                Model = WellbeingComment_1.default;
                break;
            default:
                res.status(400).json({ error: "Invalid item model" });
                return;
        }
        // Increment report count
        const updatedItem = await Model.findByIdAndUpdate(itemId, { $inc: { reportCount: 1 } }, { new: true });
        if (!updatedItem) {
            res.status(404).json({ error: "Item not found" });
            return;
        }
        // Check threshold for auto-shadowban
        if (updatedItem.reportCount >= 5 && updatedItem.status !== "pending") {
            updatedItem.status = "pending"; // Valid for ContributionStatus.PENDING and Wellbeing status
            await updatedItem.save();
            // Find author and update shadowbanned count
            const authorId = updatedItem.author || updatedItem.uploadedBy; // Document uses uploadedBy
            if (authorId) {
                const user = await User_1.default.findById(authorId);
                if (user) {
                    user.shadowbannedCount += 1;
                    if (user.shadowbannedCount >= 3) {
                        user.isBanned = true;
                        user.isActive = false;
                        user.banReason =
                            "Automatically suspended due to 3 or more shadowbanned community violations.";
                    }
                    await user.save();
                }
            }
        }
        res.status(200).json({ message: "Report submitted successfully" });
    }
    catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ error: "An internal server error occurred" });
    }
};
exports.reportItem = reportItem;
