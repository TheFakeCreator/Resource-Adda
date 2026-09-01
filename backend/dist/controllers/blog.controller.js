"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMedia = exports.reportBlog = exports.createBlog = exports.getBlogBySlug = exports.getBlogs = void 0;
const dompurify_1 = __importDefault(require("dompurify"));
const jsdom_1 = require("jsdom");
const Blog_1 = __importDefault(require("../models/Blog"));
const window = new jsdom_1.JSDOM("").window;
const purify = (0, dompurify_1.default)(window);
const getBlogs = async (req, res) => {
    try {
        const { tag } = req.query;
        const filter = { isShadowbanned: { $ne: true } };
        if (tag) {
            filter.tags = tag;
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const total = await Blog_1.default.countDocuments(filter);
        const blogs = await Blog_1.default.find(filter)
            .populate("author", "name avatarUrl branch semester")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        res.status(200).json({
            blogs,
            total,
            page,
            pages: Math.ceil(total / limit),
        });
    }
    catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ error: "An internal server error occurred" });
    }
};
exports.getBlogs = getBlogs;
const getBlogBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const blog = await Blog_1.default.findOne({
            slug,
            isShadowbanned: { $ne: true },
        }).populate("author", "name avatarUrl branch semester");
        if (!blog) {
            res.status(404).json({ error: "Blog not found" });
            return;
        }
        res.status(200).json(blog);
    }
    catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ error: "An internal server error occurred" });
    }
};
exports.getBlogBySlug = getBlogBySlug;
const createBlog = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: "Not authenticated" });
            return;
        }
        const { title, content, tags, coverImage } = req.body;
        if (!title || title.length > 100) {
            res
                .status(400)
                .json({ error: "Title is required and must be under 100 characters." });
            return;
        }
        if (!content) {
            res.status(400).json({ error: "Content is required." });
            return;
        }
        // Sanitize the content to prevent XSS
        const sanitizedContent = purify.sanitize(content);
        // Generate unique slug
        let baseSlug = title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)+/g, "");
        let slug = baseSlug;
        let counter = 1;
        while (await Blog_1.default.findOne({ slug })) {
            slug = `${baseSlug}-${counter}`;
            counter++;
        }
        // Estimate read time (roughly 200 words per minute)
        const wordCount = sanitizedContent.trim().split(/\s+/).length;
        const readTime = Math.max(1, Math.ceil(wordCount / 200));
        // Parse tags if sent as string
        let parsedTags = [];
        if (tags) {
            try {
                parsedTags = typeof tags === "string" ? JSON.parse(tags) : tags;
            }
            catch (e) {
                parsedTags =
                    typeof tags === "string"
                        ? tags.split(",").map((t) => t.trim())
                        : [];
            }
        }
        const newBlog = new Blog_1.default({
            title,
            slug,
            content: sanitizedContent,
            tags: parsedTags,
            coverImage: req.file ? `/uploads/${req.file.filename}` : coverImage,
            author: req.user._id,
            readTime,
        });
        await newBlog.save();
        // Populate author
        await newBlog.populate("author", "name avatarUrl branch semester");
        res.status(201).json(newBlog);
    }
    catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ error: "An internal server error occurred" });
    }
};
exports.createBlog = createBlog;
const reportBlog = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: "Not authenticated" });
            return;
        }
        const { id } = req.params;
        const { reason } = req.body;
        if (!reason) {
            res.status(400).json({ error: "Reason for reporting is required" });
            return;
        }
        const blog = await Blog_1.default.findById(id);
        if (!blog) {
            res.status(404).json({ error: "Blog not found" });
            return;
        }
        // Check if user already reported
        const hasReported = blog.reports?.some((r) => r.user.toString() === req.user?._id.toString());
        if (hasReported) {
            res.status(400).json({ error: "You have already reported this blog" });
            return;
        }
        if (!blog.reports) {
            blog.reports = [];
        }
        blog.reports.push({
            user: req.user._id,
            reason,
            createdAt: new Date(),
        });
        blog.reportCount = blog.reports.length;
        // Automatic shadowban if report threshold reached
        if (blog.reportCount >= 5) {
            blog.isShadowbanned = true;
        }
        await blog.save();
        res.status(200).json({
            message: "Blog reported successfully",
            reportCount: blog.reportCount,
            isShadowbanned: blog.isShadowbanned,
        });
    }
    catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ error: "An internal server error occurred" });
    }
};
exports.reportBlog = reportBlog;
const uploadMedia = async (req, res) => {
    try {
        if (!req.file) {
            res.status(400).json({ error: "No file uploaded" });
            return;
        }
        // Upload to Cloudinary instead of serving locally
        const { uploadToCloudinary } = await Promise.resolve().then(() => __importStar(require("../middlewares/upload")));
        const url = await uploadToCloudinary(req.file.buffer, "resource_adda/blog_media");
        res.status(200).json({ url });
    }
    catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ error: "An internal server error occurred" });
    }
};
exports.uploadMedia = uploadMedia;
