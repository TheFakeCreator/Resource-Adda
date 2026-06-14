import { Router } from "express";
import {
  getProfile,
  updateProfile,
  getUserContributions,
  getLeaderboard,
  getBookmarks,
  addBookmark,
  removeBookmark,
} from "../controllers/user.controller";
import { authenticate } from "../middlewares/auth";

const router = Router();

// Public routes
router.get("/leaderboard", getLeaderboard);

// All other user routes require authentication
router.use(authenticate);

router.get("/me", getProfile);
router.put("/me", updateProfile);
router.get("/me/contributions", getUserContributions);
router.get("/me/bookmarks", getBookmarks);
router.post("/me/bookmarks/:id", addBookmark);
router.delete("/me/bookmarks/:id", removeBookmark);

export default router;
