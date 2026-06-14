"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const wellbeing_controller_1 = require("../controllers/wellbeing.controller");
const auth_1 = require("../middlewares/auth");
const upload_1 = require("../middlewares/upload");
const router = (0, express_1.Router)();
// Public routes
router.get("/", wellbeing_controller_1.getPosts);
router.get("/:id/comments", wellbeing_controller_1.getComments);
// Protected Routes
router.post(
  "/",
  auth_1.authenticate,
  upload_1.upload.array("media", 4),
  wellbeing_controller_1.createPost,
);
router.post(
  "/:id/comments",
  auth_1.authenticate,
  wellbeing_controller_1.addComment,
);
router.post(
  "/:id/react",
  auth_1.authenticate,
  wellbeing_controller_1.toggleReaction,
);
exports.default = router;
