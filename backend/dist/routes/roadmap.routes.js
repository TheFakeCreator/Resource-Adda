"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const roadmap_controller_1 = require("../controllers/roadmap.controller");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
// Public Routes
router.get("/", roadmap_controller_1.getApprovedRoadmaps);
router.get("/:id", roadmap_controller_1.getRoadmapById);
// Protected Routes
router.post("/", auth_1.authenticate, roadmap_controller_1.submitRoadmap);
router.post("/:id/enroll", auth_1.authenticate, roadmap_controller_1.enrollRoadmap);
router.post("/:id/step", auth_1.authenticate, roadmap_controller_1.completeStep);
exports.default = router;
