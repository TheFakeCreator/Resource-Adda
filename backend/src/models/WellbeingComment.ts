import mongoose, { Document, Schema } from "mongoose";

export interface IWellbeingComment extends Document {
  post: mongoose.Types.ObjectId;
  parentComment: mongoose.Types.ObjectId | null;
  author: mongoose.Types.ObjectId;
  content: string;
  isAnonymous: boolean;
  status: "approved" | "pending" | "rejected";
  reportCount: number;
  upvotes: number;
  upvotedBy: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const WellbeingCommentSchema: Schema = new Schema(
  {
    post: {
      type: Schema.Types.ObjectId,
      ref: "WellbeingPost",
      required: true,
      index: true,
    },
    parentComment: {
      type: Schema.Types.ObjectId,
      ref: "WellbeingComment",
      default: null,
      index: true,
    },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    isAnonymous: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ["approved", "pending", "rejected"],
      default: "approved",
    },
    reportCount: { type: Number, default: 0 },
    upvotes: { type: Number, default: 0 },
    upvotedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true },
);

export default mongoose.model<IWellbeingComment>(
  "WellbeingComment",
  WellbeingCommentSchema,
);
