import { Router } from "express";
import {
  getProfile,
  updateProfile,
  updateAvatar,
  getUserContributions,
  getLeaderboard,
  getBookmarks,
  addBookmark,
  removeBookmark,
  deleteAccount,
} from "../controllers/user.controller";
import { authenticate } from "../middlewares/auth";
import { upload } from "../middlewares/upload";

const router = Router();

// Public routes
router.get("/leaderboard", getLeaderboard);

// All other user routes require authentication
router.use(authenticate);

router.get("/me", getProfile);
router.put("/me", updateProfile);
router.put("/me/avatar", upload.single("avatar"), updateAvatar);
router.get("/me/contributions", getUserContributions);
router.get("/me/bookmarks", getBookmarks);
router.post("/me/bookmarks/:id", addBookmark);
router.delete("/me/bookmarks/:id", removeBookmark);
router.delete("/me/account", deleteAccount);

export default router;
