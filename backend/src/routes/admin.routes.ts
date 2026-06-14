import { Router } from "express";
import { authenticate, authorizeRoles } from "../middlewares/auth";
import { getOverviewStats } from "../controllers/admin.controller";

const router = Router();

// Protect all admin routes
router.use(authenticate);
router.use(authorizeRoles("admin", "super_admin"));

// GET /api/admin/stats
router.get("/stats", getOverviewStats);

export default router;
