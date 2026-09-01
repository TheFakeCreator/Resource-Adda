import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/auth";
import { uploadToCloudinary } from "../middlewares/upload";
import Document from "../models/Document";
import Contribution, { ContributionStatus } from "../models/Contribution";
import Review from "../models/Review";

/** Escape special regex characters to prevent ReDoS attacks */
const escapeRegex = (str: string): string =>
  str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const uploadResource = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const {
      title,
      description,
      subject,
      semester,
      branch,
      type,
      externalLink,
      isExternalLink,
    } = req.body;

    if (title && title.length > 150) {
      res.status(400).json({ error: "Title must be less than 150 characters" });
      return;
    }

    if (description && description.length > 2000) {
      res
        .status(400)
        .json({ error: "Description must be less than 2000 characters" });
      return;
    }

    let fileUrl = "";

    if (isExternalLink === "true" || isExternalLink === true) {
      if (!externalLink) {
        res.status(400).json({ error: "External link URL is required" });
        return;
      }
      fileUrl = externalLink;
    } else {
      if (!req.file) {
        res.status(400).json({ error: "No file uploaded" });
        return;
      }
      // Upload to Cloudinary
      const resourceType =
        req.file.mimetype === "application/pdf" ? "raw" : "auto";
      fileUrl = await uploadToCloudinary(
        req.file.buffer,
        "resource_adda/documents",
        resourceType,
      );
    }

    // Create Document
    const document = new Document({
      title,
      description,
      fileUrl,
      isExternalLink: isExternalLink === "true" || isExternalLink === true,
      subject,
      semester: parseInt(semester),
      branch,
      type,
      uploadedBy: req.user?._id,
    });
    await document.save();

    // Create Contribution
    const contribution = new Contribution({
      documentId: document._id,
      userId: req.user?._id,
      status: ContributionStatus.PENDING,
    });
    await contribution.save();

    res.status(201).json({
      message: "Resource uploaded successfully.",
      document,
    });
  } catch (error: any) {
    console.error("Server error:", error);
    res.status(500).json({ error: "An internal server error occurred" });
  }
};

export const getPendingContributions = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [contributions, total] = await Promise.all([
      Contribution.find({
        status: ContributionStatus.PENDING,
      })
        .populate("documentId")
        .populate("userId", "email role branch semester rollNumber")
        .skip(skip)
        .limit(limit),
      Contribution.countDocuments({ status: ContributionStatus.PENDING }),
    ]);

    res.status(200).json({
      contributions,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Server error:", error);
    res.status(500).json({ error: "An internal server error occurred" });
  }
};

export const reviewContribution = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'approved' or 'rejected'

    if (
      ![ContributionStatus.APPROVED, ContributionStatus.REJECTED].includes(
        status,
      )
    ) {
      res.status(400).json({ error: "Invalid status" });
      return;
    }

    const contribution = await Contribution.findById(id);
    if (!contribution) {
      res.status(404).json({ error: "Contribution not found" });
      return;
    }

    contribution.status = status;
    await contribution.save();

    // If rejected, we might want to delete the document or just keep it hidden.
    // For now, we just update the status. Only approved contributions show in public search.

    res.status(200).json({ message: `Contribution ${status}`, contribution });
  } catch (error: any) {
    console.error("Server error:", error);
    res.status(500).json({ error: "An internal server error occurred" });
  }
};

export const getApprovedDocuments = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // We only want documents that have an APPROVED contribution
    const approvedContributions = await Contribution.find({
      status: ContributionStatus.APPROVED,
    });
    const approvedDocIds = approvedContributions.map((c) => c.documentId);

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const skip = (page - 1) * limit;

    const { subject, semester, search, branch, type, minRating } = req.query;
    const filter: any = { _id: { $in: approvedDocIds } };

    if (subject) filter.subject = subject;
    if (semester) filter.semester = parseInt(semester as string);
    if (branch) filter.branch = branch;
    if (type) filter.type = type;
    if (minRating)
      filter.averageRating = { $gte: parseFloat(minRating as string) };
    if (search) {
      filter.title = { $regex: escapeRegex(search as string), $options: "i" };
    }

    const [documents, total] = await Promise.all([
      Document.find(filter)
        .populate("uploadedBy", "name avatarUrl email branch semester")
        .skip(skip)
        .limit(limit),
      Document.countDocuments(filter),
    ]);

    res.status(200).json({
      documents,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Server error:", error);
    res.status(500).json({ error: "An internal server error occurred" });
  }
};

export const getDocumentById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const document = await Document.findById(req.params.id).populate(
      "uploadedBy",
      "name avatarUrl email branch semester",
    );
    if (!document) {
      res.status(404).json({ error: "Document not found" });
      return;
    }
    res.status(200).json(document);
  } catch (error: any) {
    console.error("Server error:", error);
    res.status(500).json({ error: "An internal server error occurred" });
  }
};

export const incrementDownload = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userIp = (req.headers["x-forwarded-for"] ||
      req.ip ||
      "unknown") as string;
    const documentId = req.params.id;

    // Atomically check if IP hasn't downloaded, then push and increment
    const updatedDoc = await Document.findOneAndUpdate(
      { _id: documentId, downloadedBy: { $ne: userIp } },
      {
        $addToSet: { downloadedBy: userIp },
        $inc: { downloadCount: 1 },
      },
      { new: true },
    );

    let finalDoc = updatedDoc;
    if (!updatedDoc) {
      // IP already downloaded or doc doesn't exist
      finalDoc = await Document.findById(documentId);
      if (!finalDoc) {
        res.status(404).json({ error: "Document not found" });
        return;
      }
    }

    if (!finalDoc) {
      res.status(404).json({ error: "Document not found" });
      return;
    }

    res.status(200).json({
      message: "Download recorded",
      downloadCount: finalDoc.downloadCount,
      fileUrl: finalDoc.fileUrl,
    });
  } catch (error: any) {
    console.error("Server error:", error);
    res.status(500).json({ error: "An internal server error occurred" });
  }
};

export const getReviews = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const reviews = await Review.find({ documentId: req.params.id })
      .populate("userId", "name avatarUrl branch semester")
      .sort({ createdAt: -1 });
    res.status(200).json(reviews);
  } catch (error: any) {
    console.error("Server error:", error);
    res.status(500).json({ error: "An internal server error occurred" });
  }
};

export const addReview = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { rating, comment } = req.body;
    const documentId = req.params.id;
    const userId = req.user?._id;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    if (!rating || rating < 1 || rating > 5) {
      res.status(400).json({ error: "Rating must be between 1 and 5" });
      return;
    }

    let review = await Review.findOne({ documentId, userId });

    if (review) {
      // Update existing review
      review.rating = rating;
      review.comment = comment;
      await review.save();
    } else {
      // Create new review
      review = new Review({ documentId, userId, rating, comment });
      await review.save();
    }

    // Recalculate average rating
    const allReviews = await Review.find({ documentId });
    const totalRatings = allReviews.length;
    const averageRating =
      allReviews.reduce((acc, curr) => acc + curr.rating, 0) / totalRatings;

    await Document.findByIdAndUpdate(documentId, {
      averageRating: parseFloat(averageRating.toFixed(1)),
      totalRatings,
    });

    res.status(200).json({ message: "Review added successfully", review });
  } catch (error: any) {
    console.error("Server error:", error);
    res.status(500).json({ error: "An internal server error occurred" });
  }
};

export const voteReview = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { reviewId } = req.params;
    const { voteType } = req.body; // 'upvote' or 'downvote'
    const userId = req.user?._id;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      res.status(404).json({ error: "Review not found" });
      return;
    }

    // Use an aggregation pipeline update to atomically toggle votes and sync counts
    await Review.updateOne({ _id: review._id }, [
      {
        $set: {
          upvotedBy: {
            $cond: [
              { $eq: [voteType, "upvote"] },
              { $setUnion: [{ $ifNull: ["$upvotedBy", []] }, [userId]] },
              { $setDifference: [{ $ifNull: ["$upvotedBy", []] }, [userId]] },
            ],
          },
          downvotedBy: {
            $cond: [
              { $eq: [voteType, "downvote"] },
              { $setUnion: [{ $ifNull: ["$downvotedBy", []] }, [userId]] },
              { $setDifference: [{ $ifNull: ["$downvotedBy", []] }, [userId]] },
            ],
          },
        },
      },
      {
        $set: {
          upvotes: { $size: "$upvotedBy" },
          downvotes: { $size: "$downvotedBy" },
        },
      },
    ]);

    const updatedReview = await Review.findById(reviewId);
    res.status(200).json({ message: "Vote recorded", review: updatedReview });
  } catch (error: any) {
    console.error("Server error:", error);
    res.status(500).json({ error: "An internal server error occurred" });
  }
};

export const getFeaturedDocuments = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // We only want to show documents that have been approved
    // First, find approved contributions
    const approvedContributions = await Contribution.find({
      status: ContributionStatus.APPROVED,
    });
    const approvedDocIds = approvedContributions.map((c) => c.documentId);

    const baseFilter = { _id: { $in: approvedDocIds } };

    const [adminPicks, topRated, trending] = await Promise.all([
      Document.find({ ...baseFilter, isFeatured: true })
        .populate("uploadedBy", "name avatarUrl branch semester")
        .sort({ createdAt: -1 })
        .limit(10),
      Document.find(baseFilter)
        .populate("uploadedBy", "name avatarUrl branch semester")
        .sort({ averageRating: -1, totalRatings: -1 })
        .limit(10),
      Document.find(baseFilter)
        .populate("uploadedBy", "name avatarUrl branch semester")
        .sort({ downloadCount: -1 })
        .limit(10),
    ]);

    res.status(200).json({
      adminPicks,
      topRated,
      trending,
    });
  } catch (error: any) {
    console.error("Server error:", error);
    res.status(500).json({ error: "An internal server error occurred" });
  }
};
