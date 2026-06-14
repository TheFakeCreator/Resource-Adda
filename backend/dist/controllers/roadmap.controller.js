"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getApprovedRoadmaps = void 0;
const Roadmap_1 = __importDefault(require("../models/Roadmap"));
const Contribution_1 = require("../models/Contribution");
const getApprovedRoadmaps = async (req, res) => {
    try {
        const { category, targetAudience } = req.query;
        // Build filter
        const filter = { status: Contribution_1.ContributionStatus.APPROVED };
        if (category && typeof category === 'string' && category !== 'all') {
            filter.category = category;
        }
        if (targetAudience && typeof targetAudience === 'string') {
            filter.targetAudience = { $regex: targetAudience, $options: 'i' };
        }
        const roadmaps = await Roadmap_1.default.find(filter)
            .populate('author', 'name avatarUrl branch semester')
            .sort({ isOfficial: -1, upvotes: -1, createdAt: -1 }); // Official first, then highly upvoted
        // Handle anonymity
        const sanitizedRoadmaps = roadmaps.map(rmap => {
            const doc = rmap.toObject();
            if (doc.isAnonymous) {
                doc.author = {
                    _id: doc.author._id,
                    name: 'Anonymous Creator',
                    branch: 'Confidential',
                    avatarUrl: 'https://ui-avatars.com/api/?name=Anonymous&background=random',
                    semester: 0
                };
            }
            return doc;
        });
        res.status(200).json(sanitizedRoadmaps);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getApprovedRoadmaps = getApprovedRoadmaps;
