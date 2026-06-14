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
exports.getLeaderboard =
  exports.removeBookmark =
  exports.addBookmark =
  exports.getBookmarks =
  exports.getUserContributions =
  exports.updateProfile =
  exports.getProfile =
    void 0;
const User_1 = __importStar(require("../models/User"));
const Document_1 = __importDefault(require("../models/Document"));
const InterviewExperience_1 = __importDefault(
  require("../models/InterviewExperience"),
);
const Roadmap_1 = __importDefault(require("../models/Roadmap"));
const getProfile = async (req, res) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }
    // Refresh user to get latest points/stats
    const user = await User_1.default
      .findById(req.user._id)
      .select("-password_hash");
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.getProfile = getProfile;
const updateProfile = async (req, res) => {
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
    const user = await User_1.default
      .findByIdAndUpdate(
        req.user._id,
        { $set: updates },
        { new: true, runValidators: true },
      )
      .select("-password_hash");
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.updateProfile = updateProfile;
const getUserContributions = async (req, res) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }
    const userId = req.user._id;
    const [resources, experiences, roadmaps] = await Promise.all([
      Document_1.default.find({ uploadedBy: userId }).sort({ createdAt: -1 }),
      InterviewExperience_1.default
        .find({ author: userId })
        .sort({ createdAt: -1 }),
      Roadmap_1.default.find({ author: userId }).sort({ createdAt: -1 }),
    ]);
    res.status(200).json({
      resources,
      experiences,
      roadmaps,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.getUserContributions = getUserContributions;
// --- Bookmarks Endpoints ---
const getBookmarks = async (req, res) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }
    const user = await User_1.default
      .findById(req.user._id)
      .populate("bookmarkedResources");
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    // Convert document bookmarks to standard format for frontend
    const formattedBookmarks = user.bookmarkedResources.map((doc) => ({
      id: doc._id,
      title: doc.title,
      type: doc.type || "Study Resource",
      link: `/resources/${doc._id}`,
    }));
    res.status(200).json(formattedBookmarks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.getBookmarks = getBookmarks;
const addBookmark = async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }
    const user = await User_1.default.findById(req.user._id);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    if (!user.bookmarkedResources.includes(id)) {
      user.bookmarkedResources.push(id);
      await user.save();
    }
    res.status(200).json({
      message: "Bookmark added successfully",
      bookmarkedResources: user.bookmarkedResources,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.addBookmark = addBookmark;
const removeBookmark = async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }
    const user = await User_1.default.findById(req.user._id);
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
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.removeBookmark = removeBookmark;
const getLeaderboard = async (req, res) => {
  try {
    const topUsers = await User_1.default
      .find({ role: { $ne: User_1.UserRole.SUPER_ADMIN } })
      .sort({ contributionPoints: -1 })
      .limit(10)
      .select("name branch semester contributionPoints badges avatarUrl");
    res.status(200).json(topUsers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.getLeaderboard = getLeaderboard;
