import { Request, Response } from "express";
import User, { UserRole } from "../models/User";
import Document from "../models/Document";
import InterviewExperience from "../models/InterviewExperience";
import Roadmap from "../models/Roadmap";
import { AuthRequest } from "../middlewares/auth";

export const getProfile = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    // Refresh user to get latest points/stats
    const user = await User.findById(req.user._id).select("-password_hash");
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.status(200).json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProfile = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    const updates = req.body;

    // Prevent sensitive fields from being updated directly via this endpoint
    delete updates.password_hash;
    delete updates.role;
    delete updates.isVerified;
    delete updates.contributionPoints;
    delete updates.resourcesUploaded;
    delete updates.resourcesApproved;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true },
    ).select("-password_hash");

    res.status(200).json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getUserContributions = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    const userId = req.user._id;

    const [resources, experiences, roadmaps] = await Promise.all([
      Document.find({ uploadedBy: userId }).sort({ createdAt: -1 }),
      InterviewExperience.find({ author: userId }).sort({ createdAt: -1 }),
      Roadmap.find({ author: userId }).sort({ createdAt: -1 }),
    ]);

    res.status(200).json({
      resources,
      experiences,
      roadmaps,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// --- Bookmarks Endpoints ---

export const getBookmarks = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }
    const user = await User.findById(req.user._id).populate(
      "bookmarkedResources",
    );
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Convert document bookmarks to standard format for frontend
    const formattedBookmarks = user.bookmarkedResources.map((doc: any) => ({
      id: doc._id,
      title: doc.title,
      type: doc.type || "Study Resource",
      link: `/resources/${doc._id}`,
    }));

    res.status(200).json(formattedBookmarks);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const addBookmark = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    if (!user.bookmarkedResources.includes(id as any)) {
      user.bookmarkedResources.push(id as any);
      await user.save();
    }

    res.status(200).json({
      message: "Bookmark added successfully",
      bookmarkedResources: user.bookmarkedResources,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const removeBookmark = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    user.bookmarkedResources = user.bookmarkedResources.filter(
      (bookmarkId) => bookmarkId.toString() !== id,
    );
    await user.save();

    res.status(200).json({
      message: "Bookmark removed successfully",
      bookmarkedResources: user.bookmarkedResources,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getLeaderboard = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const topUsers = await User.find({ role: { $ne: UserRole.SUPER_ADMIN } })
      .sort({ contributionPoints: -1 })
      .limit(10)
      .select("name branch semester contributionPoints badges avatarUrl");

    res.status(200).json(topUsers);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
