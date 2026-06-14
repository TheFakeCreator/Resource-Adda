"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMedia =
  exports.reportBlog =
  exports.createBlog =
  exports.getBlogBySlug =
  exports.getBlogs =
    void 0;
const Blog_1 = __importDefault(require("../models/Blog"));
const getBlogs = async (req, res) => {
  try {
    const { tag } = req.query;
    const filter = { isShadowbanned: { $ne: true } };
    if (tag) {
      filter.tags = tag;
    }
    const blogs = await Blog_1.default
      .find(filter)
      .populate("author", "name avatarUrl branch semester")
      .sort({ createdAt: -1 });
    res.status(200).json(blogs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.getBlogs = getBlogs;
const getBlogBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const blog = await Blog_1.default
      .findOne({ slug, isShadowbanned: { $ne: true } })
      .populate("author", "name avatarUrl branch semester");
    if (!blog) {
      res.status(404).json({ error: "Blog not found" });
      return;
    }
    res.status(200).json(blog);
  } catch (error) {
    res.status(500).json({ error: error.message });
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
    const wordCount = content.trim().split(/\s+/).length;
    const readTime = Math.max(1, Math.ceil(wordCount / 200));
    // Parse tags if sent as string
    let parsedTags = [];
    if (tags) {
      try {
        parsedTags = typeof tags === "string" ? JSON.parse(tags) : tags;
      } catch (e) {
        parsedTags =
          typeof tags === "string" ? tags.split(",").map((t) => t.trim()) : [];
      }
    }
    const newBlog = new Blog_1.default({
      title,
      slug,
      content,
      tags: parsedTags,
      coverImage: req.file ? `/uploads/${req.file.filename}` : coverImage,
      author: req.user._id,
      readTime,
    });
    await newBlog.save();
    // Populate author
    await newBlog.populate("author", "name avatarUrl branch semester");
    res.status(201).json(newBlog);
  } catch (error) {
    res.status(500).json({ error: error.message });
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
    const hasReported = blog.reports?.some(
      (r) => r.user.toString() === req.user?._id.toString(),
    );
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
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.reportBlog = reportBlog;
const uploadMedia = async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }
    // Return the URL that can be embedded in Markdown
    const url = `http://localhost:5000/uploads/${req.file.filename}`;
    res.status(200).json({ url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.uploadMedia = uploadMedia;
