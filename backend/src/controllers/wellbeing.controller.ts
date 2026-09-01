import { Request, Response } from "express";
import WellbeingPost from "../models/WellbeingPost";
import WellbeingComment from "../models/WellbeingComment";
import { AuthRequest } from "../middlewares/auth";
import { uploadToCloudinary } from "../middlewares/upload";

export const getPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category } = req.query;

    const filter: any = { status: "approved" };
    if (category && typeof category === "string") {
      filter.category = category;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const total = await WellbeingPost.countDocuments(filter);

    const posts = await WellbeingPost.find(filter)
      .populate("author", "name avatarUrl branch semester")
      .populate({
        path: "comments",
        populate: {
          path: "author",
          select: "name avatarUrl branch semester",
        },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Handle anonymity
    const sanitizedPosts = posts.map((post) => {
      const doc: any = post.toObject();
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
        doc.comments = doc.comments.map((c: any) => {
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

    res.status(200).json({
      posts: sanitizedPosts,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    console.error("Server error:", error);
    res.status(500).json({ error: "An internal server error occurred" });
  }
};

export const createPost = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    let mediaUrls: string[] = [];
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files as Express.Multer.File[]) {
        const url = await uploadToCloudinary(file.buffer, "wellbeing");
        mediaUrls.push(url);
      }
    }

    let parsedTags: string[] = [];
    if (req.body.tags) {
      if (Array.isArray(req.body.tags)) parsedTags = req.body.tags;
      else if (typeof req.body.tags === "string")
        parsedTags = req.body.tags
          .split(",")
          .map((t: string) => t.trim())
          .filter(Boolean);
    }

    const newPost = new WellbeingPost({
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
        _id: (doc.author as any)._id,
        name: "Anonymous Student",
        branch: "Confidential",
        avatarUrl:
          "https://ui-avatars.com/api/?name=Anonymous&background=random",
        semester: 0,
      } as any;
    }

    res.status(201).json(doc);
  } catch (error: any) {
    console.error("Server error:", error);
    res.status(500).json({ error: "An internal server error occurred" });
  }
};

export const getComments = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    const comments = await WellbeingComment.find({
      post: id,
      status: "approved",
    })
      .populate("author", "name avatarUrl branch semester")
      .sort({ createdAt: 1 });

    const sanitizedComments = comments.map((c) => {
      const doc: any = c.toObject();
      if (doc.isAnonymous && doc.author) {
        doc.author = {
          _id: (doc.author as any)._id,
          name: "Anonymous Student",
          avatarUrl:
            "https://ui-avatars.com/api/?name=Anonymous&background=random",
          branch: "Confidential",
          semester: 0,
        } as any;
      }
      return doc;
    });

    // Build nested tree (Instagram style: 2 levels deep)
    // Map comments by ID
    const commentMap = new Map();
    const rootComments: any[] = [];

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
  } catch (error: any) {
    console.error("Server error:", error);
    res.status(500).json({ error: "An internal server error occurred" });
  }
};

export const addComment = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    const { id } = req.params;
    const { content, isAnonymous, parentComment } = req.body;

    const post = await WellbeingPost.findById(id);
    if (!post) {
      res.status(404).json({ error: "Post not found" });
      return;
    }

    const newComment = new WellbeingComment({
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
        _id: (doc.author as any)._id,
        name: "Anonymous Student",
        avatarUrl:
          "https://ui-avatars.com/api/?name=Anonymous&background=random",
        branch: "Confidential",
        semester: 0,
      } as any;
    }

    res
      .status(201)
      .json({ message: "Comment added successfully", comment: doc });
  } catch (error: any) {
    console.error("Server error:", error);
    res.status(500).json({ error: "An internal server error occurred" });
  }
};

export const toggleReaction = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
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

    const post = await WellbeingPost.findById(id);
    if (!post) {
      res.status(404).json({ error: "Post not found" });
      return;
    }

    if (!post.reactions) post.reactions = [];

    const existingReactionIndex = post.reactions.findIndex(
      (r) => r.user.toString() === req.user!._id.toString(),
    );

    if (existingReactionIndex !== -1) {
      if (post.reactions[existingReactionIndex].type === type) {
        post.reactions.splice(existingReactionIndex, 1); // toggle off
      } else {
        post.reactions[existingReactionIndex].type = type as any; // change
      }
    } else {
      post.reactions.push({ type: type as any, user: req.user._id }); // new
    }

    await post.save();
    res
      .status(200)
      .json({ message: "Reaction updated", reactions: post.reactions });
  } catch (error: any) {
    console.error("Server error:", error);
    res.status(500).json({ error: "An internal server error occurred" });
  }
};
