import { Request, Response } from "express";
import Contribution, { ContributionStatus } from "../models/Contribution";
import Document from "../models/Document";
import InterviewExperience from "../models/InterviewExperience";
import Roadmap from "../models/Roadmap";
import WellbeingPost from "../models/WellbeingPost";
import WellbeingComment from "../models/WellbeingComment";
import Report from "../models/Report";
import User from "../models/User";
import { GamificationService } from "../services/gamification.service";
import { AuthRequest } from "../middlewares/auth";

export const getPendingQueue = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    // Fetch all pending items across the 3 models
    const [pendingDocuments, docTotal] = await Promise.all([
      Contribution.find({ status: ContributionStatus.PENDING })
        .populate("documentId")
        .populate("userId", "name email")
        .skip(skip)
        .limit(limit),
      Contribution.countDocuments({ status: ContributionStatus.PENDING }),
    ]);

    const [pendingExperiences, expTotal] = await Promise.all([
      InterviewExperience.find({ status: ContributionStatus.PENDING })
        .populate("author", "name email")
        .skip(skip)
        .limit(limit),
      InterviewExperience.countDocuments({
        status: ContributionStatus.PENDING,
      }),
    ]);

    const [pendingRoadmaps, rmTotal] = await Promise.all([
      Roadmap.find({ status: ContributionStatus.PENDING })
        .populate("author", "name email")
        .skip(skip)
        .limit(limit),
      Roadmap.countDocuments({ status: ContributionStatus.PENDING }),
    ]);

    const [pendingWellbeingPosts, wpTotal] = await Promise.all([
      WellbeingPost.find({ status: "pending" })
        .populate("author", "name email")
        .skip(skip)
        .limit(limit),
      WellbeingPost.countDocuments({ status: "pending" }),
    ]);

    const [pendingWellbeingComments, wcTotal] = await Promise.all([
      WellbeingComment.find({ status: "pending" })
        .populate("author", "name email")
        .skip(skip)
        .limit(limit),
      WellbeingComment.countDocuments({ status: "pending" }),
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
        hasMore:
          skip + limit <
          Math.max(docTotal, expTotal, rmTotal, wpTotal, wcTotal),
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const reviewContribution = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { type, id } = req.params; // type: 'document' | 'experience' | 'roadmap'
    const { action } = req.body; // 'approve' | 'reject'

    if (!["approve", "reject"].includes(action)) {
      res
        .status(400)
        .json({ error: "Invalid action. Must be approve or reject" });
      return;
    }

    const newStatus =
      action === "approve"
        ? ContributionStatus.APPROVED
        : ContributionStatus.REJECTED;

    if (type === "document") {
      const contribution = await Contribution.findById(id);
      if (!contribution) {
        res.status(404).json({ error: "Not found" });
        return;
      }

      contribution.status = newStatus;
      await contribution.save();

      if (action === "approve") {
        await GamificationService.awardPoints(
          contribution.userId.toString(),
          "DOCUMENT",
        );
      }
    } else if (type === "experience") {
      const experience = await InterviewExperience.findById(id);
      if (!experience) {
        res.status(404).json({ error: "Not found" });
        return;
      }

      experience.status = newStatus;
      await experience.save();

      if (action === "approve") {
        await GamificationService.awardPoints(
          experience.author.toString(),
          "INTERVIEW_EXPERIENCE",
        );
      }
    } else if (type === "roadmap") {
      const roadmap = await Roadmap.findById(id);
      if (!roadmap) {
        res.status(404).json({ error: "Not found" });
        return;
      }

      roadmap.status = newStatus;
      await roadmap.save();

      if (action === "approve") {
        await GamificationService.awardPoints(
          roadmap.author.toString(),
          "ROADMAP",
        );
      }
    } else if (type === "wellbeing_post") {
      const post = await WellbeingPost.findById(id);
      if (!post) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      post.status = action === "approve" ? "approved" : "rejected";
      if (action === "approve") post.reportCount = 0; // reset report count
      await post.save();
    } else if (type === "wellbeing_comment") {
      const comment = await WellbeingComment.findById(id);
      if (!comment) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      comment.status = action === "approve" ? "approved" : "rejected";
      if (action === "approve") comment.reportCount = 0;
      await comment.save();
    } else {
      res.status(400).json({ error: "Invalid contribution type" });
      return;
    }

    res.status(200).json({ message: `Successfully ${action}d ${type}` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const reportItem = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
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
    const existingReport = await Report.findOne({
      reportedItemId: itemId,
      reportedBy: req.user._id,
    });

    if (existingReport) {
      res.status(400).json({ error: "You have already reported this item" });
      return;
    }

    // Save report
    const report = new Report({
      reportedItemId: itemId,
      itemModel,
      reportedBy: req.user._id,
      reason,
    });
    await report.save();

    // Determine the Mongoose model
    let Model: any;
    switch (itemModel) {
      case "Roadmap":
        Model = Roadmap;
        break;
      case "InterviewExperience":
        Model = InterviewExperience;
        break;
      case "Document":
        Model = Document;
        break;
      case "WellbeingPost":
        Model = WellbeingPost;
        break;
      case "WellbeingComment":
        Model = WellbeingComment;
        break;
      default:
        res.status(400).json({ error: "Invalid item model" });
        return;
    }

    // Increment report count
    const updatedItem = await Model.findByIdAndUpdate(
      itemId,
      { $inc: { reportCount: 1 } },
      { new: true },
    );

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
        const user = await User.findById(authorId);
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
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
