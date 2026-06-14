"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePage = exports.getAllPages = exports.getPageBySlug = void 0;
const Page_1 = __importDefault(require("../models/Page"));
const User_1 = require("../models/User");
const RESTRICTED_SLUGS = [
  "login",
  "register",
  "dashboard",
  "admin",
  "api",
  "setup",
  "documents",
  "unauthorized",
  "resources",
];
const getPageBySlug = async (req, res) => {
  try {
    const slug = req.params.slug;
    const page = await Page_1.default.findOne({ slug: slug.toLowerCase() });
    if (!page) {
      res.status(404).json({ error: "Page not found" });
      return;
    }
    res.status(200).json(page);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.getPageBySlug = getPageBySlug;
const getAllPages = async (req, res) => {
  try {
    // Only return metadata, not the full markdown content to save bandwidth
    const pages = await Page_1.default
      .find({}, "slug title updatedAt")
      .sort({ title: 1 });
    res.status(200).json(pages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.getAllPages = getAllPages;
const updatePage = async (req, res) => {
  try {
    if (!req.user || req.user.role !== User_1.UserRole.SUPER_ADMIN) {
      res.status(403).json({ error: "Access denied" });
      return;
    }
    const slug = req.params.slug;
    const { title, content } = req.body;
    const normalizedSlug = slug.toLowerCase().trim();
    if (RESTRICTED_SLUGS.includes(normalizedSlug)) {
      res.status(400).json({ error: "Cannot use a restricted system slug." });
      return;
    }
    let page = await Page_1.default.findOne({ slug: normalizedSlug });
    if (page) {
      page.title = title || page.title;
      page.content = content !== undefined ? content : page.content;
      page.lastUpdatedBy = req.user._id;
    } else {
      if (!title) {
        res.status(400).json({ error: "Title is required for a new page" });
        return;
      }
      page = new Page_1.default({
        slug: normalizedSlug,
        title,
        content: content || "",
        lastUpdatedBy: req.user._id,
      });
    }
    await page.save();
    res.status(200).json({ message: "Page saved successfully", page });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.updatePage = updatePage;
