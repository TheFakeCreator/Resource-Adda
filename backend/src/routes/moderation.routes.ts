import { Router } from "express";
import {
  getPendingQueue,
  reviewContribution,
} from "../controllers/moderation.controller";
import { authenticate, authorizeRoles } from "../middlewares/auth";
import { UserRole } from "../models/User";

const router = Router();

// All moderation routes require admin or super_admin privileges
router.use(authenticate);
router.use(authorizeRoles(UserRole.ADMIN, UserRole.SUPER_ADMIN));

router.get("/pending", getPendingQueue);
router.post("/:type/:id/review", reviewContribution);

export default router;
