import mongoose, { Document, Schema } from "mongoose";

export interface IWellbeingPost extends Document {
  title: string;
  content: string;
  category: "confession" | "question" | "support";
  author: mongoose.Types.ObjectId;
  isAnonymous: boolean;
  tags: string[];
  mediaUrls: string[];
  reactions: {
    type: "hugs" | "relatable" | "helpful" | "care";
    user: mongoose.Types.ObjectId;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const WellbeingPostSchema: Schema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    category: {
      type: String,
      enum: ["confession", "question", "support"],
      required: true,
    },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isAnonymous: { type: Boolean, default: true }, // Posts are anonymous by default for wellbeing
    tags: [{ type: String }],
    mediaUrls: [{ type: String }],
    reactions: [
      {
        type: {
          type: String,
          enum: ["hugs", "relatable", "helpful", "care"],
          required: true,
        },
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Virtual for fetching comments
WellbeingPostSchema.virtual("comments", {
  ref: "WellbeingComment",
  localField: "_id",
  foreignField: "post",
  options: { sort: { createdAt: -1 }, limit: 3 }, // Only fetch 3 preview comments by default
});

export default mongoose.model<IWellbeingPost>(
  "WellbeingPost",
  WellbeingPostSchema,
);
