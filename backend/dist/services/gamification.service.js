"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.GamificationService =
  exports.BADGE_THRESHOLDS =
  exports.XP_REWARDS =
    void 0;
const User_1 = __importDefault(require("../models/User"));
exports.XP_REWARDS = {
  DOCUMENT: 50,
  INTERVIEW_EXPERIENCE: 100,
  ROADMAP: 200,
};
exports.BADGE_THRESHOLDS = [
  { name: "First Blood", points: 50 },
  { name: "Contributor", points: 200 },
  { name: "Expert", points: 500 },
  { name: "Master", points: 1000 },
  { name: "Legend", points: 5000 },
];
class GamificationService {
  /**
   * Awards points to a user based on the type of contribution approved.
   */
  static async awardPoints(userId, type) {
    const points = exports.XP_REWARDS[type] || 0;
    if (points === 0) return;
    const user = await User_1.default.findById(userId);
    if (!user) return;
    user.contributionPoints += points;
    // Track stats
    if (type === "DOCUMENT") {
      user.resourcesApproved += 1;
    }
    // Check for new badges
    const earnedBadges = exports.BADGE_THRESHOLDS.filter(
      (badge) =>
        user.contributionPoints >= badge.points &&
        !user.badges.includes(badge.name),
    ).map((badge) => badge.name);
    if (earnedBadges.length > 0) {
      user.badges.push(...earnedBadges);
    }
    await user.save();
  }
}
exports.GamificationService = GamificationService;
