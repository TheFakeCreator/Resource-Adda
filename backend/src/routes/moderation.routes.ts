import { Router } from "express";
import {
  getPendingQueue,
  reviewContribution,
  reportItem,
} from "../controllers/moderation.controller";
import { authenticate, authorizeRoles } from "../middlewares/auth";
import { UserRole } from "../models/User";

const router = Router();

// Public moderation route for all authenticated users
router.use(authenticate);
router.post("/report", reportItem);

// All other moderation routes require admin or super_admin privileges
router.use(authorizeRoles(UserRole.ADMIN, UserRole.SUPER_ADMIN));

router.get("/pending", getPendingQueue);
router.post("/:type/:id/review", reviewContribution);

export default router;
