"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const roadmap_controller_1 = require("../controllers/roadmap.controller");
const router = (0, express_1.Router)();
// Public Routes
router.get('/', roadmap_controller_1.getApprovedRoadmaps);
exports.default = router;
