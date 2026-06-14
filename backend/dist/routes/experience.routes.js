"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const experience_controller_1 = require("../controllers/experience.controller");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
// Public Routes
router.get("/", experience_controller_1.getApprovedExperiences);
router.get("/:id", experience_controller_1.getExperienceById);
// Protected Routes
router.post("/", auth_1.authenticate, experience_controller_1.submitExperience);
exports.default = router;
