import { Request, Response } from "express";
import InterviewExperience from "../models/InterviewExperience";
import { ContributionStatus } from "../models/Contribution";
import { AuthRequest } from "../middlewares/auth";

export const getApprovedExperiences = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { company, role, type } = req.query;

    // Build filter
    const filter: any = { status: ContributionStatus.APPROVED };

    if (company && typeof company === "string") {
      filter.company = { $regex: company, $options: "i" };
    }

    if (role && typeof role === "string") {
      filter.role = { $regex: role, $options: "i" };
    }

    if (type && typeof type === "string" && type !== "all") {
      filter.type = type;
    }

    const experiences = await InterviewExperience.find(filter)
      .populate("author", "name avatarUrl branch semester")
      .sort({ createdAt: -1 });

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

    res.status(200).json(sanitizedExperiences);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
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
    res.status(500).json({ error: error.message });
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

    const newExperience = new InterviewExperience({
      ...req.body,
      author: req.user._id,
      status: ContributionStatus.PENDING,
      upvotes: 0,
      downvotes: 0,
      upvotedBy: [],
      downvotedBy: [],
    });

    await newExperience.save();

    res.status(201).json(newExperience);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
