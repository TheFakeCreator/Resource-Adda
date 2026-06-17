import { Request, Response } from "express";
import Roadmap from "../models/Roadmap";
import User from "../models/User";
import { ContributionStatus } from "../models/Contribution";
import { AuthRequest } from "../middlewares/auth";

export const getApprovedRoadmaps = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { category, targetAudience } = req.query;

    // Build filter
    const filter: any = { status: ContributionStatus.APPROVED };

    if (category && typeof category === "string" && category !== "all") {
      filter.category = category;
    }

    if (targetAudience && typeof targetAudience === "string") {
      filter.targetAudience = { $regex: targetAudience, $options: "i" };
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const total = await Roadmap.countDocuments(filter);

    const roadmaps = await Roadmap.find(filter)
      .populate("author", "name avatarUrl branch semester")
      .sort({ isOfficial: -1, upvotes: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Handle anonymity
    const sanitizedRoadmaps = roadmaps.map((rmap) => {
      const doc = rmap.toObject();
      if (doc.isAnonymous) {
        doc.author = {
          _id: doc.author._id,
          name: "Anonymous Creator",
          branch: "Confidential",
          avatarUrl:
            "https://ui-avatars.com/api/?name=Anonymous&background=random",
          semester: 0,
        } as any;
      }
      return doc;
    });

    res.status(200).json({
      roadmaps: sanitizedRoadmaps,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getRoadmapById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const roadmap = await Roadmap.findById(id).populate(
      "author",
      "name avatarUrl branch semester role",
    );

    if (!roadmap) {
      res.status(404).json({ error: "Roadmap not found" });
      return;
    }

    const doc = roadmap.toObject();
    if (doc.isAnonymous) {
      doc.author = {
        _id: doc.author._id,
        name: "Anonymous Creator",
        branch: "Confidential",
        avatarUrl:
          "https://ui-avatars.com/api/?name=Anonymous&background=random",
        semester: 0,
        role: "student",
      } as any;
    }

    res.status(200).json(doc);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const submitRoadmap = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    const newRoadmap = new Roadmap({
      ...req.body,
      author: req.user._id,
      status: ContributionStatus.APPROVED,
      isOfficial: req.user.role === "admin" || req.user.role === "super_admin",
      upvotes: 0,
      downvotes: 0,
      upvotedBy: [],
      downvotedBy: [],
      averageRating: 0,
      totalRatings: 0,
    });

    await newRoadmap.save();

    res.status(201).json(newRoadmap);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const enrollRoadmap = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!._id;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const isAlreadyEnrolled = user.activeRoadmaps.some(
      (ar) => ar.roadmapId.toString() === id,
    );
    if (isAlreadyEnrolled) {
      res.status(400).json({ error: "Already enrolled in this roadmap" });
      return;
    }

    user.activeRoadmaps.push({
      roadmapId: id as any,
      completedSteps: [],
      startedAt: new Date(),
      lastAccessedAt: new Date(),
    });

    await user.save();
    res.status(200).json({
      message: "Successfully enrolled",
      activeRoadmaps: user.activeRoadmaps,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const completeStep = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { stepIndex } = req.body;
    const userId = req.user!._id;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const activeRoadmap = user.activeRoadmaps.find(
      (ar) => ar.roadmapId.toString() === id,
    );
    if (!activeRoadmap) {
      res.status(400).json({ error: "Not enrolled in this roadmap" });
      return;
    }

    if (!activeRoadmap.completedSteps.includes(stepIndex)) {
      activeRoadmap.completedSteps.push(stepIndex);
      activeRoadmap.lastAccessedAt = new Date();
      await user.save();
    }

    res
      .status(200)
      .json({ message: "Step completed", activeRoadmaps: user.activeRoadmaps });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
