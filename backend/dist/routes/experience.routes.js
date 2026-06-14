"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const experience_controller_1 = require("../controllers/experience.controller");
const router = (0, express_1.Router)();
// Public Routes
router.get('/', experience_controller_1.getApprovedExperiences);
exports.default = router;
