import { Request, Response } from "express";
import InterviewExperience from "../models/InterviewExperience";
import { ContributionStatus } from "../models/Contribution";
import { AuthRequest } from "../middlewares/auth";

/** Escape special regex characters to prevent ReDoS attacks */
const escapeRegex = (str: string): string =>
  str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const getApprovedExperiences = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { company, role, type } = req.query;

    // Build filter
    const filter: any = { status: ContributionStatus.APPROVED };

    if (company && typeof company === "string") {
      filter.company = { $regex: escapeRegex(company), $options: "i" };
    }

    if (role && typeof role === "string") {
      filter.role = { $regex: escapeRegex(role), $options: "i" };
    }

    if (type && typeof type === "string" && type !== "all") {
      filter.type = type;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const total = await InterviewExperience.countDocuments(filter);

    const experiences = await InterviewExperience.find(filter)
      .populate("author", "name avatarUrl branch semester")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Handle anonymity
    const sanitizedExperiences = experiences.map((exp) => {
      const doc = exp.toObject();
      if (doc.isAnonymous) {
        doc.author = {
          _id: doc.author._id,
          name: "Anonymous Student",
          branch: "Confidential",
          avatarUrl:
            "https://ui-avatars.com/api/?name=Anonymous&background=random",
          semester: 0,
        } as any;
      }
      return doc;
    });

    res.status(200).json({
      experiences: sanitizedExperiences,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    console.error("Server error:", error);
    res.status(500).json({ error: "An internal server error occurred" });
  }
};

export const getExperienceById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const experience = await InterviewExperience.findById(id).populate(
      "author",
      "name avatarUrl branch semester role",
    );

    if (!experience) {
      res.status(404).json({ error: "Interview experience not found" });
      return;
    }

    const doc = experience.toObject();
    if (doc.isAnonymous) {
      doc.author = {
        _id: doc.author._id,
        name: "Anonymous Student",
        branch: "Confidential",
        avatarUrl:
          "https://ui-avatars.com/api/?name=Anonymous&background=random",
        semester: 0,
        role: "student",
      } as any;
    }

    res.status(200).json(doc);
  } catch (error: any) {
    console.error("Server error:", error);
    res.status(500).json({ error: "An internal server error occurred" });
  }
};

export const submitExperience = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    const {
      title,
      company,
      role,
      type,
      offerStatus,
      difficulty,
      ctc,
      preparationStrategy,
      adviceForJuniors,
      rounds,
      isAnonymous,
      tags,
    } = req.body;

    const newExperience = new InterviewExperience({
      title,
      company,
      role,
      type,
      offerStatus,
      difficulty,
      ctc,
      preparationStrategy,
      adviceForJuniors,
      rounds,
      isAnonymous,
      tags,
      author: req.user._id,
      status: ContributionStatus.APPROVED,
      upvotes: 0,
      downvotes: 0,
      upvotedBy: [],
      downvotedBy: [],
    });

    await newExperience.save();

    res.status(201).json(newExperience);
  } catch (error: any) {
    console.error("Server error:", error);
    res.status(500).json({ error: "An internal server error occurred" });
  }
};
