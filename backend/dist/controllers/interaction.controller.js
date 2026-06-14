"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitReview = exports.toggleUpvote = void 0;
const InterviewExperience_1 = __importDefault(
  require("../models/InterviewExperience"),
);
const Roadmap_1 = __importDefault(require("../models/Roadmap"));
const Review_1 = __importDefault(require("../models/Review"));
const Document_1 = __importDefault(require("../models/Document"));
const toggleUpvote = async (req, res) => {
  try {
    const { type, id } = req.params; // type: 'experience' | 'roadmap'
    const userId = req.user._id;
    let Model;
    if (type === "experience") Model = InterviewExperience_1.default;
    else if (type === "roadmap") Model = Roadmap_1.default;
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
        (id) => id.toString() !== userId.toString(),
      );
      item.downvotes -= 1;
    }
    if (hasUpvoted) {
      // Remove upvote
      item.upvotedBy = item.upvotedBy.filter(
        (id) => id.toString() !== userId.toString(),
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
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.toggleUpvote = toggleUpvote;
const submitReview = async (req, res) => {
  try {
    const { id } = req.params; // documentId
    const { rating, comment } = req.body;
    const userId = req.user._id;
    if (!rating || rating < 1 || rating > 5) {
      res
        .status(400)
        .json({ error: "Valid rating between 1 and 5 is required" });
      return;
    }
    const document = await Document_1.default.findById(id);
    if (!document) {
      res.status(404).json({ error: "Document not found" });
      return;
    }
    // Check if review exists
    let review = await Review_1.default.findOne({ documentId: id, userId });
    let isNewReview = false;
    if (review) {
      review.rating = rating;
      review.comment = comment;
    } else {
      review = new Review_1.default({
        documentId: id,
        userId,
        rating,
        comment,
      });
      isNewReview = true;
    }
    await review.save();
    // Recalculate Document Average Rating
    const allReviews = await Review_1.default.find({ documentId: id });
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
  } catch (error) {
    if (error.code === 11000) {
      res
        .status(400)
        .json({ error: "You have already reviewed this resource." });
      return;
    }
    res.status(500).json({ error: error.message });
  }
};
exports.submitReview = submitReview;
