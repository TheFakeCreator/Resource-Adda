import mongoose, { Schema, Document } from "mongoose";

export interface IBlog extends Document {
  title: string;
  slug: string;
  content: string;
  author: mongoose.Types.ObjectId;
  tags: string[];
  coverImage?: string;
  readTime: number;
  reportCount: number;
  isShadowbanned: boolean;
  reports: { user: mongoose.Types.ObjectId; reason: string; createdAt: Date }[];
  createdAt: Date;
  updatedAt: Date;
}

const BlogSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    tags: [{ type: String }],
    coverImage: { type: String },
    readTime: { type: Number, default: 1 },
    reportCount: { type: Number, default: 0 },
    isShadowbanned: { type: Boolean, default: false },
    reports: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User" },
        reason: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  },
);

export default mongoose.model<IBlog>("Blog", BlogSchema);
