import { Request, Response } from "express";
import User, { UserRole } from "../models/User";
import Document from "../models/Document";
import InterviewExperience from "../models/InterviewExperience";
import Roadmap from "../models/Roadmap";
import Contribution from "../models/Contribution";
import { AuthRequest } from "../middlewares/auth";
import { uploadToCloudinary } from "../middlewares/upload";
import sharp from "sharp";

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
    console.error("Server error:", error);
    res.status(500).json({ error: "An internal server error occurred" });
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

    // Allow-list: only these fields can be updated via profile edit
    const ALLOWED_FIELDS = [
      "name",
      "bio",
      "avatarUrl",
      "rollNumber",
      "branch",
      "semester",
      "section",
      "graduationYear",
      "preferredSubjects",
      "preferredCompanies",
    ];

    const updates: Record<string, any> = {};
    for (const key of ALLOWED_FIELDS) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true },
    ).select("-password_hash");

    res.status(200).json(user);
  } catch (error: any) {
    console.error("Server error:", error);
    res.status(500).json({ error: "An internal server error occurred" });
  }
};

export const updateAvatar = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    if (!req.file) {
      res.status(400).json({ error: "No image provided" });
      return;
    }

    // Process image with sharp
    const optimizedBuffer = await sharp(req.file.buffer)
      .resize(256, 256, { fit: "cover", position: "center" })
      .webp({ quality: 80 })
      .toBuffer();

    // Upload to Cloudinary
    const avatarUrl = await uploadToCloudinary(
      optimizedBuffer,
      `avatars/${req.user._id}`,
      "image",
    );

    // Update user
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { avatarUrl } },
      { new: true, runValidators: true },
    ).select("-password_hash");

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.status(200).json(user);
  } catch (error: any) {
    console.error("Avatar upload error:", error);
    res.status(500).json({ error: "Failed to upload avatar" });
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

    const [docs, experiences, roadmaps, contributions] = await Promise.all([
      Document.find({ uploadedBy: userId }).sort({ createdAt: -1 }).lean(),
      InterviewExperience.find({ author: userId }).sort({ createdAt: -1 }),
      Roadmap.find({ author: userId }).sort({ createdAt: -1 }),
      Contribution.find({ userId }).lean(),
    ]);

    const resources = docs.map((doc) => {
      const contrib = contributions.find(
        (c) => c.documentId.toString() === doc._id.toString(),
      );
      return { ...doc, status: contrib ? contrib.status : "pending" };
    });

    res.status(200).json({
      resources,
      experiences,
      roadmaps,
    });
  } catch (error: any) {
    console.error("Server error:", error);
    res.status(500).json({ error: "An internal server error occurred" });
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
    console.error("Server error:", error);
    res.status(500).json({ error: "An internal server error occurred" });
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
    console.error("Server error:", error);
    res.status(500).json({ error: "An internal server error occurred" });
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
    console.error("Server error:", error);
    res.status(500).json({ error: "An internal server error occurred" });
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
    console.error("Server error:", error);
    res.status(500).json({ error: "An internal server error occurred" });
  }
};

export const deleteAccount = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    const userId = req.user._id;

    // Schedule deletion 30 days from now
    const scheduledDeletionAt = new Date();
    scheduledDeletionAt.setDate(scheduledDeletionAt.getDate() + 30);

    const user = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          isDeleted: true,
          scheduledDeletionAt,
        },
        $inc: { tokenVersion: 1 }, // Invalidate all existing tokens
      },
      { new: true },
    );

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.status(200).json({
      message:
        "Account scheduled for deletion. It will be permanently deleted in 30 days.",
    });
  } catch (error: any) {
    console.error("Account deletion error:", error);
    res.status(500).json({ error: "An internal server error occurred" });
  }
};
