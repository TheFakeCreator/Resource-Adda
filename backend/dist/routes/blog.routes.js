"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const blog_controller_1 = require("../controllers/blog.controller");
const auth_1 = require("../middlewares/auth");
const upload_1 = require("../middlewares/upload");
const router = (0, express_1.Router)();
// Public routes
router.get("/", blog_controller_1.getBlogs);
router.get("/:slug", blog_controller_1.getBlogBySlug);
// Protected Routes
router.post("/", auth_1.authenticate, upload_1.upload.single("coverImage"), blog_controller_1.createBlog);
router.post("/:id/report", auth_1.authenticate, blog_controller_1.reportBlog);
// Utility route for markdown image uploads
router.post("/upload", auth_1.authenticate, upload_1.upload.single("media"), blog_controller_1.uploadMedia);
exports.default = router;
