"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
// Public routes
router.get("/leaderboard", user_controller_1.getLeaderboard);
// All other user routes require authentication
router.use(auth_1.authenticate);
router.get("/me", user_controller_1.getProfile);
router.put("/me", user_controller_1.updateProfile);
router.get("/me/contributions", user_controller_1.getUserContributions);
router.get("/me/bookmarks", user_controller_1.getBookmarks);
router.post("/me/bookmarks/:id", user_controller_1.addBookmark);
router.delete("/me/bookmarks/:id", user_controller_1.removeBookmark);
exports.default = router;
