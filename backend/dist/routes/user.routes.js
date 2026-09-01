"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const auth_1 = require("../middlewares/auth");
const upload_1 = require("../middlewares/upload");
const router = (0, express_1.Router)();
// Public routes
router.get("/leaderboard", user_controller_1.getLeaderboard);
// All other user routes require authentication
router.use(auth_1.authenticate);
router.get("/me", user_controller_1.getProfile);
router.put("/me", user_controller_1.updateProfile);
router.put("/me/avatar", upload_1.upload.single("avatar"), user_controller_1.updateAvatar);
router.get("/me/contributions", user_controller_1.getUserContributions);
router.get("/me/bookmarks", user_controller_1.getBookmarks);
router.post("/me/bookmarks/:id", user_controller_1.addBookmark);
router.delete("/me/bookmarks/:id", user_controller_1.removeBookmark);
router.delete("/me/account", user_controller_1.deleteAccount);
exports.default = router;
