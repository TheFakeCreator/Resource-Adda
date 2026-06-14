"use strict";
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (
          !desc ||
          ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)
        ) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }
    : function (o, v) {
        o["default"] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  (function () {
    var ownKeys = function (o) {
      ownKeys =
        Object.getOwnPropertyNames ||
        function (o) {
          var ar = [];
          for (var k in o)
            if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
          return ar;
        };
      return ownKeys(o);
    };
    return function (mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null)
        for (var k = ownKeys(mod), i = 0; i < k.length; i++)
          if (k[i] !== "default") __createBinding(result, mod, k[i]);
      __setModuleDefault(result, mod);
      return result;
    };
  })();
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewContribution = exports.getPendingQueue = void 0;
const Contribution_1 = __importStar(require("../models/Contribution"));
const InterviewExperience_1 = __importDefault(
  require("../models/InterviewExperience"),
);
const Roadmap_1 = __importDefault(require("../models/Roadmap"));
const gamification_service_1 = require("../services/gamification.service");
const getPendingQueue = async (req, res) => {
  try {
    // Fetch all pending items across the 3 models
    const pendingDocuments = await Contribution_1.default
      .find({ status: Contribution_1.ContributionStatus.PENDING })
      .populate("documentId")
      .populate("userId", "name email");
    const pendingExperiences = await InterviewExperience_1.default
      .find({ status: Contribution_1.ContributionStatus.PENDING })
      .populate("author", "name email");
    const pendingRoadmaps = await Roadmap_1.default
      .find({ status: Contribution_1.ContributionStatus.PENDING })
      .populate("author", "name email");
    res.status(200).json({
      documents: pendingDocuments,
      experiences: pendingExperiences,
      roadmaps: pendingRoadmaps,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.getPendingQueue = getPendingQueue;
const reviewContribution = async (req, res) => {
  try {
    const { type, id } = req.params; // type: 'document' | 'experience' | 'roadmap'
    const { action } = req.body; // 'approve' | 'reject'
    if (!["approve", "reject"].includes(action)) {
      res
        .status(400)
        .json({ error: "Invalid action. Must be approve or reject" });
      return;
    }
    const newStatus =
      action === "approve"
        ? Contribution_1.ContributionStatus.APPROVED
        : Contribution_1.ContributionStatus.REJECTED;
    if (type === "document") {
      const contribution = await Contribution_1.default.findById(id);
      if (!contribution) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      contribution.status = newStatus;
      await contribution.save();
      if (action === "approve") {
        await gamification_service_1.GamificationService.awardPoints(
          contribution.userId.toString(),
          "DOCUMENT",
        );
      }
    } else if (type === "experience") {
      const experience = await InterviewExperience_1.default.findById(id);
      if (!experience) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      experience.status = newStatus;
      await experience.save();
      if (action === "approve") {
        await gamification_service_1.GamificationService.awardPoints(
          experience.author.toString(),
          "INTERVIEW_EXPERIENCE",
        );
      }
    } else if (type === "roadmap") {
      const roadmap = await Roadmap_1.default.findById(id);
      if (!roadmap) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      roadmap.status = newStatus;
      await roadmap.save();
      if (action === "approve") {
        await gamification_service_1.GamificationService.awardPoints(
          roadmap.author.toString(),
          "ROADMAP",
        );
      }
    } else {
      res.status(400).json({ error: "Invalid contribution type" });
      return;
    }
    res.status(200).json({ message: `Successfully ${action}d ${type}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.reviewContribution = reviewContribution;
