"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const interaction_controller_1 = require("../controllers/interaction.controller");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
// All interaction routes require authentication
router.use(auth_1.authenticate);
router.post("/:type/:id/upvote", interaction_controller_1.toggleUpvote);
router.post("/resources/:id/review", interaction_controller_1.submitReview);
exports.default = router;
