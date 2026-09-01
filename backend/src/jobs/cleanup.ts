import cron from "node-cron";
import User from "../models/User";
import Document from "../models/Document";
import Contribution from "../models/Contribution";
import InterviewExperience from "../models/InterviewExperience";
import Roadmap from "../models/Roadmap";
import Review from "../models/Review";
import { v2 as cloudinary } from "cloudinary";

// Helper to extract Cloudinary public ID from URL
const extractPublicId = (url: string): string | null => {
  if (!url || !url.includes("cloudinary.com")) return null;
  const parts = url.split("/");
  const uploadIndex = parts.findIndex((p) => p === "upload");
  if (uploadIndex === -1) return null;

  // URL structure: .../upload/v123456789/folder/file.ext
  // We need 'folder/file' (without extension)
  const pathParts = parts.slice(uploadIndex + 2);
  const fullPath = pathParts.join("/");
  const dotIndex = fullPath.lastIndexOf(".");
  return dotIndex !== -1 ? fullPath.substring(0, dotIndex) : fullPath;
};

// Deletes a user's uploaded assets (avatar and documents)
const cleanupUserAssets = async (userId: string) => {
  try {
    const user = await User.findById(userId);
    if (user?.avatarUrl) {
      const publicId = extractPublicId(user.avatarUrl);
      if (publicId) {
        await cloudinary.uploader.destroy(publicId);
      }
    }

    const docs = await Document.find({
      uploadedBy: userId,
      isExternalLink: false,
    });
    for (const doc of docs) {
      if (doc.fileUrl) {
        const publicId = extractPublicId(doc.fileUrl);
        if (publicId) {
          await cloudinary.uploader
            .destroy(publicId, { resource_type: "raw" })
            .catch(() => {});
          await cloudinary.uploader
            .destroy(publicId, { resource_type: "image" })
            .catch(() => {});
        }
      }
    }
  } catch (err) {
    console.error(`Error cleaning up assets for user ${userId}:`, err);
  }
};

// Runs every day at midnight
export const startCleanupJob = () => {
  cron.schedule("0 0 * * *", async () => {
    console.log("Running scheduled account cleanup job...");
    try {
      const now = new Date();
      const usersToDelete = await User.find({
        isDeleted: true,
        scheduledDeletionAt: { $lte: now },
      });

      if (usersToDelete.length === 0) {
        console.log("No accounts scheduled for deletion today.");
        return;
      }

      console.log(`Found ${usersToDelete.length} users to permanently delete.`);

      for (const user of usersToDelete) {
        const userId = user._id;

        // Clean up Cloudinary assets
        await cleanupUserAssets(userId.toString());

        // Delete from all collections
        await Promise.all([
          Document.deleteMany({ uploadedBy: userId }),
          Contribution.deleteMany({ userId }),
          InterviewExperience.deleteMany({ author: userId }),
          Roadmap.deleteMany({ author: userId }),
          Review.deleteMany({ userId }),
        ]);

        // Finally, delete the user document
        await User.findByIdAndDelete(userId);
        console.log(`Permanently deleted user ${userId}`);
      }
    } catch (error) {
      console.error("Error during scheduled account cleanup:", error);
    }
  });

  console.log("Account cleanup cron job scheduled.");
};
