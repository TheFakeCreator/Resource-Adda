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
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const Contribution_1 = require("./Contribution");
const RoadmapStepSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    prerequisites: [{ type: String }],
    resources: [
        {
            title: { type: String, required: true },
            url: { type: String, required: true },
            type: { type: String, required: true },
        },
    ],
});
const RoadmapSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    difficulty: {
        type: String,
        required: true,
        enum: ["Beginner", "Intermediate", "Advanced"],
        default: "Beginner",
    },
    estimatedTime: { type: String, required: true },
    targetAudience: { type: String },
    introNotes: { type: String },
    globalPrerequisites: [{ type: String }],
    steps: [RoadmapStepSchema],
    author: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    isAnonymous: { type: Boolean, default: false },
    status: {
        type: String,
        enum: Object.values(Contribution_1.ContributionStatus),
        default: Contribution_1.ContributionStatus.PENDING,
    },
    isOfficial: { type: Boolean, default: false },
    tags: [{ type: String }],
    reportCount: { type: Number, default: 0 },
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    upvotedBy: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User" }],
    downvotedBy: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User" }],
    averageRating: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 },
}, { timestamps: true });
exports.default = mongoose_1.default.model("Roadmap", RoadmapSchema);
