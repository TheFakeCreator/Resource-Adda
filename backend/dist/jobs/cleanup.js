"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startCleanupJob = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const User_1 = __importDefault(require("../models/User"));
const Document_1 = __importDefault(require("../models/Document"));
const Contribution_1 = __importDefault(require("../models/Contribution"));
const InterviewExperience_1 = __importDefault(require("../models/InterviewExperience"));
const Roadmap_1 = __importDefault(require("../models/Roadmap"));
const Review_1 = __importDefault(require("../models/Review"));
const cloudinary_1 = require("cloudinary");
// Helper to extract Cloudinary public ID from URL
const extractPublicId = (url) => {
    if (!url || !url.includes("cloudinary.com"))
        return null;
    const parts = url.split("/");
    const uploadIndex = parts.findIndex((p) => p === "upload");
    if (uploadIndex === -1)
        return null;
    // URL structure: .../upload/v123456789/folder/file.ext
    // We need 'folder/file' (without extension)
    const pathParts = parts.slice(uploadIndex + 2);
    const fullPath = pathParts.join("/");
    const dotIndex = fullPath.lastIndexOf(".");
    return dotIndex !== -1 ? fullPath.substring(0, dotIndex) : fullPath;
};
// Deletes a user's uploaded assets (avatar and documents)
const cleanupUserAssets = async (userId) => {
    try {
        const user = await User_1.default.findById(userId);
        if (user?.avatarUrl) {
            const publicId = extractPublicId(user.avatarUrl);
            if (publicId) {
                await cloudinary_1.v2.uploader.destroy(publicId);
            }
        }
        const docs = await Document_1.default.find({
            uploadedBy: userId,
            isExternalLink: false,
        });
        for (const doc of docs) {
            if (doc.fileUrl) {
                const publicId = extractPublicId(doc.fileUrl);
                if (publicId) {
                    await cloudinary_1.v2.uploader
                        .destroy(publicId, { resource_type: "raw" })
                        .catch(() => { });
                    await cloudinary_1.v2.uploader
                        .destroy(publicId, { resource_type: "image" })
                        .catch(() => { });
                }
            }
        }
    }
    catch (err) {
        console.error(`Error cleaning up assets for user ${userId}:`, err);
    }
};
// Runs every day at midnight
const startCleanupJob = () => {
    node_cron_1.default.schedule("0 0 * * *", async () => {
        console.log("Running scheduled account cleanup job...");
        try {
            const now = new Date();
            const usersToDelete = await User_1.default.find({
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
                    Document_1.default.deleteMany({ uploadedBy: userId }),
                    Contribution_1.default.deleteMany({ userId }),
                    InterviewExperience_1.default.deleteMany({ author: userId }),
                    Roadmap_1.default.deleteMany({ author: userId }),
                    Review_1.default.deleteMany({ userId }),
                ]);
                // Finally, delete the user document
                await User_1.default.findByIdAndDelete(userId);
                console.log(`Permanently deleted user ${userId}`);
            }
        }
        catch (error) {
            console.error("Error during scheduled account cleanup:", error);
        }
    });
    console.log("Account cleanup cron job scheduled.");
};
exports.startCleanupJob = startCleanupJob;
