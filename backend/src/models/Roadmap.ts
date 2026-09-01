import mongoose, { Document as MongooseDocument, Schema } from "mongoose";
import { ContributionStatus } from "./Contribution";

export interface IRoadmapStep {
  title: string;
  description: string;
  prerequisites: string[];
  resources: {
    title: string;
    url: string;
    type: string;
  }[];
}

export interface IRoadmap extends MongooseDocument {
  title: string;
  description: string;
  category: string; // e.g., Academic, Placement, Skill, Interview
  difficulty: string; // e.g., Beginner, Intermediate, Advanced
  estimatedTime: string; // e.g., 4 Weeks
  targetAudience: string;

  introNotes: string; // Markdown supported intro
  globalPrerequisites: string[];
  steps: IRoadmapStep[];

  author: mongoose.Types.ObjectId;
  isAnonymous: boolean;
  status: ContributionStatus;
  isOfficial: boolean;

  tags: string[];
  reportCount: number;
  upvotes: number;
  downvotes: number;
  upvotedBy: mongoose.Types.ObjectId[];
  downvotedBy: mongoose.Types.ObjectId[];

  averageRating: number;
  totalRatings: number;

  createdAt: Date;
  updatedAt: Date;
}

const RoadmapStepSchema: Schema = new Schema({
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

const RoadmapSchema: Schema = new Schema(
  {
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

    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isAnonymous: { type: Boolean, default: false },
    status: {
      type: String,
      enum: Object.values(ContributionStatus),
      default: ContributionStatus.PENDING,
    },
    isOfficial: { type: Boolean, default: false },

    tags: [{ type: String }],
    reportCount: { type: Number, default: 0 },
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    upvotedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
    downvotedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],

    averageRating: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export default mongoose.model<IRoadmap>("Roadmap", RoadmapSchema);
