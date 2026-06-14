"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitExperience =
  exports.getExperienceById =
  exports.getApprovedExperiences =
    void 0;
const InterviewExperience_1 = __importDefault(
  require("../models/InterviewExperience"),
);
const Contribution_1 = require("../models/Contribution");
const getApprovedExperiences = async (req, res) => {
  try {
    const { company, role, type } = req.query;
    // Build filter
    const filter = { status: Contribution_1.ContributionStatus.APPROVED };
    if (company && typeof company === "string") {
      filter.company = { $regex: company, $options: "i" };
    }
    if (role && typeof role === "string") {
      filter.role = { $regex: role, $options: "i" };
    }
    if (type && typeof type === "string" && type !== "all") {
      filter.type = type;
    }
    const experiences = await InterviewExperience_1.default
      .find(filter)
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
        };
      }
      return doc;
    });
    res.status(200).json(sanitizedExperiences);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.getApprovedExperiences = getApprovedExperiences;
const getExperienceById = async (req, res) => {
  try {
    const { id } = req.params;
    const experience = await InterviewExperience_1.default
      .findById(id)
      .populate("author", "name avatarUrl branch semester role");
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
      };
    }
    res.status(200).json(doc);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.getExperienceById = getExperienceById;
const submitExperience = async (req, res) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }
    const newExperience = new InterviewExperience_1.default({
      ...req.body,
      author: req.user._id,
      status: Contribution_1.ContributionStatus.PENDING,
      upvotes: 0,
      downvotes: 0,
      upvotedBy: [],
      downvotedBy: [],
    });
    await newExperience.save();
    res.status(201).json(newExperience);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.submitExperience = submitExperience;
