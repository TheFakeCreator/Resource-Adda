"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.completeStep = exports.enrollRoadmap = exports.submitRoadmap = exports.getRoadmapById = exports.getApprovedRoadmaps = void 0;
const Roadmap_1 = __importDefault(require("../models/Roadmap"));
const User_1 = __importDefault(require("../models/User"));
const Contribution_1 = require("../models/Contribution");
/** Escape special regex characters to prevent ReDoS attacks */
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const getApprovedRoadmaps = async (req, res) => {
    try {
        const { category, targetAudience } = req.query;
        // Build filter
        const filter = { status: Contribution_1.ContributionStatus.APPROVED };
        if (category && typeof category === "string" && category !== "all") {
            filter.category = category;
        }
        if (targetAudience && typeof targetAudience === "string") {
            filter.targetAudience = {
                $regex: escapeRegex(targetAudience),
                $options: "i",
            };
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const total = await Roadmap_1.default.countDocuments(filter);
        const roadmaps = await Roadmap_1.default.find(filter)
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
                    avatarUrl: "https://ui-avatars.com/api/?name=Anonymous&background=random",
                    semester: 0,
                };
            }
            return doc;
        });
        res.status(200).json({
            roadmaps: sanitizedRoadmaps,
            total,
            page,
            pages: Math.ceil(total / limit),
        });
    }
    catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ error: "An internal server error occurred" });
    }
};
exports.getApprovedRoadmaps = getApprovedRoadmaps;
const getRoadmapById = async (req, res) => {
    try {
        const { id } = req.params;
        const roadmap = await Roadmap_1.default.findById(id).populate("author", "name avatarUrl branch semester role");
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
                avatarUrl: "https://ui-avatars.com/api/?name=Anonymous&background=random",
                semester: 0,
                role: "student",
            };
        }
        res.status(200).json(doc);
    }
    catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ error: "An internal server error occurred" });
    }
};
exports.getRoadmapById = getRoadmapById;
const submitRoadmap = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: "Not authenticated" });
            return;
        }
        const { title, description, category, difficulty, estimatedTime, targetAudience, introNotes, globalPrerequisites, steps, isAnonymous, tags, } = req.body;
        const newRoadmap = new Roadmap_1.default({
            title,
            description,
            category,
            difficulty,
            estimatedTime,
            targetAudience,
            introNotes,
            globalPrerequisites,
            steps,
            isAnonymous,
            tags,
            author: req.user._id,
            status: Contribution_1.ContributionStatus.APPROVED,
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
    }
    catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ error: "An internal server error occurred" });
    }
};
exports.submitRoadmap = submitRoadmap;
const enrollRoadmap = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const user = await User_1.default.findById(userId);
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        const isAlreadyEnrolled = user.activeRoadmaps.some((ar) => ar.roadmapId.toString() === id);
        if (isAlreadyEnrolled) {
            res.status(400).json({ error: "Already enrolled in this roadmap" });
            return;
        }
        user.activeRoadmaps.push({
            roadmapId: id,
            completedSteps: [],
            startedAt: new Date(),
            lastAccessedAt: new Date(),
        });
        await user.save();
        res.status(200).json({
            message: "Successfully enrolled",
            activeRoadmaps: user.activeRoadmaps,
        });
    }
    catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ error: "An internal server error occurred" });
    }
};
exports.enrollRoadmap = enrollRoadmap;
const completeStep = async (req, res) => {
    try {
        const { id } = req.params;
        const { stepIndex } = req.body;
        const userId = req.user._id;
        const user = await User_1.default.findById(userId);
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        const activeRoadmap = user.activeRoadmaps.find((ar) => ar.roadmapId.toString() === id);
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
    }
    catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ error: "An internal server error occurred" });
    }
};
exports.completeStep = completeStep;
