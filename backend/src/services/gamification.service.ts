import User from "../models/User";

export const XP_REWARDS = {
  DOCUMENT: 50,
  INTERVIEW_EXPERIENCE: 100,
  ROADMAP: 200,
};

export const BADGE_THRESHOLDS = [
  { name: "First Blood", points: 50 },
  { name: "Contributor", points: 200 },
  { name: "Expert", points: 500 },
  { name: "Master", points: 1000 },
  { name: "Legend", points: 5000 },
];

export class GamificationService {
  /**
   * Awards points to a user based on the type of contribution approved.
   */
  static async awardPoints(
    userId: string,
    type: "DOCUMENT" | "INTERVIEW_EXPERIENCE" | "ROADMAP",
  ): Promise<void> {
    const points = XP_REWARDS[type] || 0;
    if (points === 0) return;

    const user = await User.findById(userId);
    if (!user) return;

    user.contributionPoints += points;

    // Track stats
    if (type === "DOCUMENT") {
      user.resourcesApproved += 1;
    }

    // Check for new badges
    const earnedBadges = BADGE_THRESHOLDS.filter(
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
