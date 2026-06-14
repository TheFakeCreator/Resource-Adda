import { Router } from "express";
import {
  getApprovedRoadmaps,
  getRoadmapById,
  submitRoadmap,
  enrollRoadmap,
  completeStep,
} from "../controllers/roadmap.controller";
import { authenticate } from "../middlewares/auth";

const router = Router();

// Public Routes
router.get("/", getApprovedRoadmaps);
router.get("/:id", getRoadmapById);

// Protected Routes
router.post("/", authenticate, submitRoadmap);
router.post("/:id/enroll", authenticate, enrollRoadmap);
router.post("/:id/step", authenticate, completeStep);

export default router;
