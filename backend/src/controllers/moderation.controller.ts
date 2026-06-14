import { Request, Response } from "express";
import Contribution, { ContributionStatus } from "../models/Contribution";
import Document from "../models/Document";
import InterviewExperience from "../models/InterviewExperience";
import Roadmap from "../models/Roadmap";
import { GamificationService } from "../services/gamification.service";
import { AuthRequest } from "../middlewares/auth";

export const getPendingQueue = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    // Fetch all pending items across the 3 models
    const pendingDocuments = await Contribution.find({
      status: ContributionStatus.PENDING,
    })
      .populate("documentId")
      .populate("userId", "name email");

    const pendingExperiences = await InterviewExperience.find({
      status: ContributionStatus.PENDING,
    }).populate("author", "name email");

    const pendingRoadmaps = await Roadmap.find({
      status: ContributionStatus.PENDING,
    }).populate("author", "name email");

    res.status(200).json({
      documents: pendingDocuments,
      experiences: pendingExperiences,
      roadmaps: pendingRoadmaps,
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
    } else {
      res.status(400).json({ error: "Invalid contribution type" });
      return;
    }

    res.status(200).json({ message: `Successfully ${action}d ${type}` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
