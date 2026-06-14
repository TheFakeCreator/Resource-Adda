"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleReaction =
  exports.addComment =
  exports.getComments =
  exports.createPost =
  exports.getPosts =
    void 0;
const WellbeingPost_1 = __importDefault(require("../models/WellbeingPost"));
const WellbeingComment_1 = __importDefault(
  require("../models/WellbeingComment"),
);
const upload_1 = require("../middlewares/upload");
const getPosts = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = {};
    if (category && typeof category === "string") {
      filter.category = category;
    }
    const posts = await WellbeingPost_1.default
      .find(filter)
      .populate("author", "name avatarUrl branch semester")
      .populate({
        path: "comments",
        populate: {
          path: "author",
          select: "name avatarUrl branch semester",
        },
      })
      .sort({ createdAt: -1 });
    // Handle anonymity
    const sanitizedPosts = posts.map((post) => {
      const doc = post.toObject();
      if (doc.isAnonymous && doc.author) {
        doc.author = {
          _id: doc.author._id,
          name: "Anonymous Student",
          branch: "Confidential",
          avatarUrl:
            "https://ui-avatars.com/api/?name=Anonymous&background=random",
          semester: 0,
        };
      }
      if (doc.comments && Array.isArray(doc.comments)) {
        doc.comments = doc.comments.map((c) => {
          if (c.isAnonymous && c.author) {
            c.author = {
              _id: c.author._id,
              name: "Anonymous Student",
              avatarUrl:
                "https://ui-avatars.com/api/?name=Anonymous&background=random",
            };
          }
          return c;
        });
      }
      return doc;
    });
    res.status(200).json(sanitizedPosts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.getPosts = getPosts;
const createPost = async (req, res) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }
    let mediaUrls = [];
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        const url = await (0, upload_1.uploadToCloudinary)(
          file.buffer,
          "wellbeing",
        );
        mediaUrls.push(url);
      }
    }
    let parsedTags = [];
    if (req.body.tags) {
      if (Array.isArray(req.body.tags)) parsedTags = req.body.tags;
      else if (typeof req.body.tags === "string")
        parsedTags = req.body.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);
    }
    const newPost = new WellbeingPost_1.default({
      title: req.body.title,
      content: req.body.content,
      category: req.body.category,
      author: req.user._id,
      isAnonymous:
        req.body.isAnonymous !== "false" && req.body.isAnonymous !== false,
      tags: parsedTags,
      mediaUrls,
      reactions: [],
    });
    await newPost.save();
    // Populate author before returning so frontend doesn't break
    await newPost.populate("author", "name avatarUrl branch semester");
    const doc = newPost.toObject();
    if (doc.isAnonymous && doc.author) {
      doc.author = {
        _id: doc.author._id,
        name: "Anonymous Student",
        branch: "Confidential",
        avatarUrl:
          "https://ui-avatars.com/api/?name=Anonymous&background=random",
        semester: 0,
      };
    }
    res.status(201).json(doc);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.createPost = createPost;
const getComments = async (req, res) => {
  try {
    const { id } = req.params;
    const comments = await WellbeingComment_1.default
      .find({ post: id })
      .populate("author", "name avatarUrl branch semester")
      .sort({ createdAt: 1 });
    const sanitizedComments = comments.map((c) => {
      const doc = c.toObject();
      if (doc.isAnonymous && doc.author) {
        doc.author = {
          _id: doc.author._id,
          name: "Anonymous Student",
          avatarUrl:
            "https://ui-avatars.com/api/?name=Anonymous&background=random",
          branch: "Confidential",
          semester: 0,
        };
      }
      return doc;
    });
    // Build nested tree (Instagram style: 2 levels deep)
    // Map comments by ID
    const commentMap = new Map();
    const rootComments = [];
    sanitizedComments.forEach((c) => {
      c.replies = [];
      commentMap.set(c._id.toString(), c);
    });
    sanitizedComments.forEach((c) => {
      if (c.parentComment) {
        const parentId = c.parentComment.toString();
        const parent = commentMap.get(parentId);
        if (parent) {
          // If parent is already a reply (has parent), append to the root parent (level 2 max depth)
          if (parent.parentComment) {
            const rootParentId = parent.parentComment.toString();
            const rootParent = commentMap.get(rootParentId);
            if (rootParent) {
              rootParent.replies.push(c);
            }
          } else {
            parent.replies.push(c);
          }
        }
      } else {
        rootComments.push(c);
      }
    });
    res.status(200).json(rootComments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.getComments = getComments;
const addComment = async (req, res) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }
    const { id } = req.params;
    const { content, isAnonymous, parentComment } = req.body;
    const post = await WellbeingPost_1.default.findById(id);
    if (!post) {
      res.status(404).json({ error: "Post not found" });
      return;
    }
    const newComment = new WellbeingComment_1.default({
      post: id,
      parentComment: parentComment || null,
      author: req.user._id,
      content,
      isAnonymous: isAnonymous !== false && isAnonymous !== "false",
    });
    await newComment.save();
    await newComment.populate("author", "name avatarUrl branch semester");
    const doc = newComment.toObject();
    if (doc.isAnonymous && doc.author) {
      doc.author = {
        _id: doc.author._id,
        name: "Anonymous Student",
        avatarUrl:
          "https://ui-avatars.com/api/?name=Anonymous&background=random",
        branch: "Confidential",
        semester: 0,
      };
    }
    res
      .status(201)
      .json({ message: "Comment added successfully", comment: doc });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.addComment = addComment;
const toggleReaction = async (req, res) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }
    const { id } = req.params;
    const { type } = req.body; // 'hugs', 'relatable', 'helpful', 'care'
    if (!["hugs", "relatable", "helpful", "care"].includes(type)) {
      res.status(400).json({ error: "Invalid reaction type" });
      return;
    }
    const post = await WellbeingPost_1.default.findById(id);
    if (!post) {
      res.status(404).json({ error: "Post not found" });
      return;
    }
    if (!post.reactions) post.reactions = [];
    const existingReactionIndex = post.reactions.findIndex(
      (r) => r.user.toString() === req.user._id.toString(),
    );
    if (existingReactionIndex !== -1) {
      if (post.reactions[existingReactionIndex].type === type) {
        post.reactions.splice(existingReactionIndex, 1); // toggle off
      } else {
        post.reactions[existingReactionIndex].type = type; // change
      }
    } else {
      post.reactions.push({ type: type, user: req.user._id }); // new
    }
    await post.save();
    res
      .status(200)
      .json({ message: "Reaction updated", reactions: post.reactions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.toggleReaction = toggleReaction;
