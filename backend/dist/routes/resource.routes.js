"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middlewares/auth");
const upload_1 = require("../middlewares/upload");
const resource_controller_1 = require("../controllers/resource.controller");
const User_1 = require("../models/User");
const router = (0, express_1.Router)();
// Public / Student Routes
router.get("/featured", resource_controller_1.getFeaturedDocuments);
router.get("/documents", resource_controller_1.getApprovedDocuments);
router.get("/documents/:id", resource_controller_1.getDocumentById);
router.post("/documents/:id/download", resource_controller_1.incrementDownload);
router.get("/documents/:id/reviews", resource_controller_1.getReviews);
// Protected routes
router.post(
  "/documents/:id/reviews",
  auth_1.authenticate,
  resource_controller_1.addReview,
);
router.post(
  "/reviews/:reviewId/vote",
  auth_1.authenticate,
  resource_controller_1.voteReview,
);
router.post(
  "/upload",
  auth_1.authenticate,
  (0, auth_1.authorizeRoles)(
    User_1.UserRole.STUDENT,
    User_1.UserRole.ADMIN,
    User_1.UserRole.SUPER_ADMIN,
  ),
  upload_1.upload.single("file"),
  resource_controller_1.uploadResource,
);
// Admin Routes
router.get(
  "/contributions/pending",
  auth_1.authenticate,
  (0, auth_1.authorizeRoles)(
    User_1.UserRole.ADMIN,
    User_1.UserRole.SUPER_ADMIN,
  ),
  resource_controller_1.getPendingContributions,
);
router.put(
  "/contributions/:id/review",
  auth_1.authenticate,
  (0, auth_1.authorizeRoles)(
    User_1.UserRole.ADMIN,
    User_1.UserRole.SUPER_ADMIN,
  ),
  resource_controller_1.reviewContribution,
);
exports.default = router;
