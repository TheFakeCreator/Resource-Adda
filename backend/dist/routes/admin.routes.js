"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middlewares/auth");
const admin_controller_1 = require("../controllers/admin.controller");
const router = (0, express_1.Router)();
// Protect all admin routes
router.use(auth_1.authenticate);
router.use((0, auth_1.authorizeRoles)("admin", "super_admin"));
// GET /api/admin/stats
router.get("/stats", admin_controller_1.getOverviewStats);
exports.default = router;
