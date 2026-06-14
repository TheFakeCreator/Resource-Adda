import { Router } from "express";
import {
  getBlogs,
  getBlogBySlug,
  createBlog,
  reportBlog,
  uploadMedia,
} from "../controllers/blog.controller";
import { authenticate } from "../middlewares/auth";
import { upload } from "../middlewares/upload";

const router = Router();

// Public routes
router.get("/", getBlogs);
router.get("/:slug", getBlogBySlug);

// Protected Routes
router.post("/", authenticate, upload.single("coverImage"), createBlog);
router.post("/:id/report", authenticate, reportBlog);

// Utility route for markdown image uploads
router.post("/upload", authenticate, upload.single("media"), uploadMedia);

export default router;
