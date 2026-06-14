import { Router } from "express";
import {
  getPosts,
  createPost,
  addComment,
  getComments,
  toggleReaction,
} from "../controllers/wellbeing.controller";
import { authenticate } from "../middlewares/auth";
import { upload } from "../middlewares/upload";

const router = Router();

// Public routes
router.get("/", getPosts);
router.get("/:id/comments", getComments);

// Protected Routes
router.post("/", authenticate, upload.array("media", 4), createPost);
router.post("/:id/comments", authenticate, addComment);
router.post("/:id/react", authenticate, toggleReaction);

export default router;
