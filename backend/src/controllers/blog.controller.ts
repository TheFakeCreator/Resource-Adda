import { Request, Response } from "express";
import Blog from "../models/Blog";
import { AuthRequest } from "../middlewares/auth";

export const getBlogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tag } = req.query;
    const filter: any = { isShadowbanned: { $ne: true } };
    if (tag) {
      filter.tags = tag;
    }

    const blogs = await Blog.find(filter)
      .populate("author", "name avatarUrl branch semester")
      .sort({ createdAt: -1 });

    res.status(200).json(blogs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getBlogBySlug = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { slug } = req.params;
    const blog = await Blog.findOne({
      slug,
      isShadowbanned: { $ne: true },
    }).populate("author", "name avatarUrl branch semester");
    if (!blog) {
      res.status(404).json({ error: "Blog not found" });
      return;
    }
    res.status(200).json(blog);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createBlog = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
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
    while (await Blog.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Estimate read time (roughly 200 words per minute)
    const wordCount = content.trim().split(/\s+/).length;
    const readTime = Math.max(1, Math.ceil(wordCount / 200));

    // Parse tags if sent as string
    let parsedTags: string[] = [];
    if (tags) {
      try {
        parsedTags = typeof tags === "string" ? JSON.parse(tags) : tags;
      } catch (e) {
        parsedTags =
          typeof tags === "string"
            ? tags.split(",").map((t: string) => t.trim())
            : [];
      }
    }

    const newBlog = new Blog({
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
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const reportBlog = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
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

    const blog = await Blog.findById(id);

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
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const uploadMedia = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }

    // Return the URL that can be embedded in Markdown
    const url = `http://localhost:5000/uploads/${req.file.filename}`;
    res.status(200).json({ url });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
