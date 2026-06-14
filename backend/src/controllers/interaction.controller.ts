import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/auth";
import InterviewExperience from "../models/InterviewExperience";
import Roadmap from "../models/Roadmap";
import Review from "../models/Review";
import Document from "../models/Document";

export const toggleUpvote = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { type, id } = req.params; // type: 'experience' | 'roadmap'
    const userId = req.user!._id;

    let Model: any;
    if (type === "experience") Model = InterviewExperience;
    else if (type === "roadmap") Model = Roadmap;
    else {
      res.status(400).json({ error: "Invalid contribution type for upvoting" });
      return;
    }

    const item = await Model.findById(id);
    if (!item) {
      res.status(404).json({ error: "Item not found" });
      return;
    }

    const hasUpvoted = item.upvotedBy.includes(userId);
    const hasDownvoted = item.downvotedBy.includes(userId);

    // Remove downvote if exists
    if (hasDownvoted) {
      item.downvotedBy = item.downvotedBy.filter(
        (id: any) => id.toString() !== userId.toString(),
      );
      item.downvotes -= 1;
    }

    if (hasUpvoted) {
      // Remove upvote
      item.upvotedBy = item.upvotedBy.filter(
        (id: any) => id.toString() !== userId.toString(),
      );
      item.upvotes -= 1;
    } else {
      // Add upvote
      item.upvotedBy.push(userId);
      item.upvotes += 1;
    }

    await item.save();
    res.status(200).json({
      upvotes: item.upvotes,
      downvotes: item.downvotes,
      hasUpvoted: !hasUpvoted,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const submitReview = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params; // documentId
    const { rating, comment } = req.body;
    const userId = req.user!._id;

    if (!rating || rating < 1 || rating > 5) {
      res
        .status(400)
        .json({ error: "Valid rating between 1 and 5 is required" });
      return;
    }

    const document = await Document.findById(id);
    if (!document) {
      res.status(404).json({ error: "Document not found" });
      return;
    }

    // Check if review exists
    let review = await Review.findOne({ documentId: id, userId });
    let isNewReview = false;

    if (review) {
      review.rating = rating;
      review.comment = comment;
    } else {
      review = new Review({ documentId: id, userId, rating, comment });
      isNewReview = true;
    }

    await review.save();

    // Recalculate Document Average Rating
    const allReviews = await Review.find({ documentId: id });
    const totalRatings = allReviews.length;
    const averageRating =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / totalRatings;

    document.totalRatings = totalRatings;
    document.averageRating = averageRating;
    await document.save();

    res.status(200).json({
      message: "Review submitted successfully",
      review,
      averageRating,
    });
  } catch (error: any) {
    if (error.code === 11000) {
      res
        .status(400)
        .json({ error: "You have already reviewed this resource." });
      return;
    }
    res.status(500).json({ error: error.message });
  }
};
