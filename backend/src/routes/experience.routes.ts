import { Router } from "express";
import {
  getApprovedExperiences,
  getExperienceById,
  submitExperience,
} from "../controllers/experience.controller";
import { authenticate } from "../middlewares/auth";

const router = Router();

// Public Routes
router.get("/", getApprovedExperiences);
router.get("/:id", getExperienceById);

// Protected Routes
router.post("/", authenticate, submitExperience);

export default router;
