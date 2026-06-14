import mongoose, { Document, Schema } from "mongoose";

export interface IPage extends Document {
  slug: string;
  title: string;
  content: string;
  lastUpdatedBy: mongoose.Types.ObjectId;
}

const PageSchema: Schema = new Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    title: { type: String, required: true },
    content: { type: String, default: "" },
    lastUpdatedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

export default mongoose.model<IPage>("Page", PageSchema);
