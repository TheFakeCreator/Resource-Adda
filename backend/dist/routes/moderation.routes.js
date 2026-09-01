"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const moderation_controller_1 = require("../controllers/moderation.controller");
const auth_1 = require("../middlewares/auth");
const User_1 = require("../models/User");
const router = (0, express_1.Router)();
// Public moderation route for all authenticated users
router.use(auth_1.authenticate);
router.post("/report", moderation_controller_1.reportItem);
// All other moderation routes require admin or super_admin privileges
router.use((0, auth_1.authorizeRoles)(User_1.UserRole.ADMIN, User_1.UserRole.SUPER_ADMIN));
router.get("/pending", moderation_controller_1.getPendingQueue);
router.post("/:type/:id/review", moderation_controller_1.reviewContribution);
exports.default = router;
