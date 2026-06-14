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
exports.getFeaturedDocuments = exports.voteReview = exports.addReview = exports.getReviews = exports.incrementDownload = exports.getDocumentById = exports.getApprovedDocuments = exports.reviewContribution = exports.getPendingContributions = exports.uploadResource = void 0;
const upload_1 = require("../middlewares/upload");
const Document_1 = __importDefault(require("../models/Document"));
const Contribution_1 = __importStar(require("../models/Contribution"));
const Review_1 = __importDefault(require("../models/Review"));
const uploadResource = async (req, res) => {
    try {
        const { title, description, subject, semester, branch, type, externalLink, isExternalLink } = req.body;
        let fileUrl = '';
        if (isExternalLink === 'true' || isExternalLink === true) {
            if (!externalLink) {
                res.status(400).json({ error: 'External link URL is required' });
                return;
            }
            fileUrl = externalLink;
        }
        else {
            if (!req.file) {
                res.status(400).json({ error: 'No file uploaded' });
                return;
            }
            // Upload to Cloudinary
            fileUrl = await (0, upload_1.uploadToCloudinary)(req.file.buffer, 'resource_adda/documents');
        }
        // Create Document
        const document = new Document_1.default({
            title,
            description,
            fileUrl,
            isExternalLink: isExternalLink === 'true' || isExternalLink === true,
            subject,
            semester: parseInt(semester),
            branch,
            type,
            uploadedBy: req.user?._id,
        });
        await document.save();
        // Create Contribution
        const contribution = new Contribution_1.default({
            documentId: document._id,
            userId: req.user?._id,
            status: Contribution_1.ContributionStatus.PENDING,
        });
        await contribution.save();
        res.status(201).json({ message: 'Resource uploaded successfully. Awaiting admin approval.', document });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.uploadResource = uploadResource;
const getPendingContributions = async (req, res) => {
    try {
        const contributions = await Contribution_1.default.find({ status: Contribution_1.ContributionStatus.PENDING })
            .populate('documentId')
            .populate('userId', 'email role branch semester rollNumber');
        res.status(200).json(contributions);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getPendingContributions = getPendingContributions;
const reviewContribution = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'approved' or 'rejected'
        if (![Contribution_1.ContributionStatus.APPROVED, Contribution_1.ContributionStatus.REJECTED].includes(status)) {
            res.status(400).json({ error: 'Invalid status' });
            return;
        }
        const contribution = await Contribution_1.default.findById(id);
        if (!contribution) {
            res.status(404).json({ error: 'Contribution not found' });
            return;
        }
        contribution.status = status;
        await contribution.save();
        // If rejected, we might want to delete the document or just keep it hidden. 
        // For now, we just update the status. Only approved contributions show in public search.
        res.status(200).json({ message: `Contribution ${status}`, contribution });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.reviewContribution = reviewContribution;
const getApprovedDocuments = async (req, res) => {
    try {
        // We only want documents that have an APPROVED contribution
        const approvedContributions = await Contribution_1.default.find({ status: Contribution_1.ContributionStatus.APPROVED });
        const approvedDocIds = approvedContributions.map(c => c.documentId);
        // Build query filters based on req.query
        const { subject, semester, search, branch, type, minRating } = req.query;
        const filter = { _id: { $in: approvedDocIds } };
        if (subject)
            filter.subject = subject;
        if (semester)
            filter.semester = parseInt(semester);
        if (branch)
            filter.branch = branch;
        if (type)
            filter.type = type;
        if (minRating)
            filter.averageRating = { $gte: parseFloat(minRating) };
        if (search) {
            filter.title = { $regex: search, $options: 'i' };
        }
        const documents = await Document_1.default.find(filter).populate('uploadedBy', 'name avatarUrl email branch semester');
        res.status(200).json(documents);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getApprovedDocuments = getApprovedDocuments;
const getDocumentById = async (req, res) => {
    try {
        const document = await Document_1.default.findById(req.params.id).populate('uploadedBy', 'name avatarUrl email branch semester');
        if (!document) {
            res.status(404).json({ error: 'Document not found' });
            return;
        }
        res.status(200).json(document);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getDocumentById = getDocumentById;
const incrementDownload = async (req, res) => {
    try {
        const document = await Document_1.default.findByIdAndUpdate(req.params.id, { $inc: { downloadCount: 1 } }, { new: true });
        if (!document) {
            res.status(404).json({ error: 'Document not found' });
            return;
        }
        res.status(200).json({ message: 'Download count incremented', downloadCount: document.downloadCount, fileUrl: document.fileUrl });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.incrementDownload = incrementDownload;
const getReviews = async (req, res) => {
    try {
        const reviews = await Review_1.default.find({ documentId: req.params.id })
            .populate('userId', 'name avatarUrl branch semester')
            .sort({ createdAt: -1 });
        res.status(200).json(reviews);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getReviews = getReviews;
const addReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const documentId = req.params.id;
        const userId = req.user?._id;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        if (!rating || rating < 1 || rating > 5) {
            res.status(400).json({ error: 'Rating must be between 1 and 5' });
            return;
        }
        let review = await Review_1.default.findOne({ documentId, userId });
        if (review) {
            // Update existing review
            review.rating = rating;
            review.comment = comment;
            await review.save();
        }
        else {
            // Create new review
            review = new Review_1.default({ documentId, userId, rating, comment });
            await review.save();
        }
        // Recalculate average rating
        const allReviews = await Review_1.default.find({ documentId });
        const totalRatings = allReviews.length;
        const averageRating = allReviews.reduce((acc, curr) => acc + curr.rating, 0) / totalRatings;
        await Document_1.default.findByIdAndUpdate(documentId, {
            averageRating: parseFloat(averageRating.toFixed(1)),
            totalRatings
        });
        res.status(200).json({ message: 'Review added successfully', review });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.addReview = addReview;
const voteReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { voteType } = req.body; // 'upvote' or 'downvote'
        const userId = req.user?._id;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const review = await Review_1.default.findById(reviewId);
        if (!review) {
            res.status(404).json({ error: 'Review not found' });
            return;
        }
        // Remove user from both arrays first to reset their vote
        review.upvotedBy = review.upvotedBy.filter(id => id.toString() !== userId?.toString());
        review.downvotedBy = review.downvotedBy.filter(id => id.toString() !== userId?.toString());
        if (voteType === 'upvote') {
            review.upvotedBy.push(userId);
        }
        else if (voteType === 'downvote') {
            review.downvotedBy.push(userId);
        }
        review.upvotes = review.upvotedBy.length;
        review.downvotes = review.downvotedBy.length;
        await review.save();
        res.status(200).json({ message: 'Vote recorded', review });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.voteReview = voteReview;
const getFeaturedDocuments = async (req, res) => {
    try {
        // We only want to show documents that have been approved
        // First, find approved contributions
        const approvedContributions = await Contribution_1.default.find({ status: Contribution_1.ContributionStatus.APPROVED });
        const approvedDocIds = approvedContributions.map(c => c.documentId);
        const baseFilter = { _id: { $in: approvedDocIds } };
        const [adminPicks, topRated, trending] = await Promise.all([
            Document_1.default.find({ ...baseFilter, isFeatured: true })
                .populate('uploadedBy', 'name avatarUrl branch semester')
                .sort({ createdAt: -1 })
                .limit(10),
            Document_1.default.find(baseFilter)
                .populate('uploadedBy', 'name avatarUrl branch semester')
                .sort({ averageRating: -1, totalRatings: -1 })
                .limit(10),
            Document_1.default.find(baseFilter)
                .populate('uploadedBy', 'name avatarUrl branch semester')
                .sort({ downloadCount: -1 })
                .limit(10)
        ]);
        res.status(200).json({
            adminPicks,
            topRated,
            trending
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getFeaturedDocuments = getFeaturedDocuments;
