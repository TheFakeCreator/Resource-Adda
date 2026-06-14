import mongoose, { Document, Schema } from "mongoose";

export interface IReview extends Document {
  documentId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  rating: number; // 1 to 5
  comment?: string;
  upvotes: number;
  downvotes: number;
  upvotedBy: mongoose.Types.ObjectId[];
  downvotedBy: mongoose.Types.ObjectId[];
}

const ReviewSchema: Schema = new Schema(
  {
    documentId: {
      type: Schema.Types.ObjectId,
      ref: "Document",
      required: true,
    },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true },
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    upvotedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
    downvotedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true },
);

// A user can only review a document once
ReviewSchema.index({ documentId: 1, userId: 1 }, { unique: true });

export default mongoose.model<IReview>("Review", ReviewSchema);
