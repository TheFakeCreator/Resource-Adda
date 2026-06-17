import mongoose, { Document, Schema } from "mongoose";

export interface IReport extends Document {
  reportedItemId: mongoose.Types.ObjectId;
  itemModel:
    | "Roadmap"
    | "InterviewExperience"
    | "Document"
    | "WellbeingPost"
    | "WellbeingComment";
  reportedBy: mongoose.Types.ObjectId;
  reason: string;
  status: "pending" | "resolved";
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema: Schema = new Schema(
  {
    reportedItemId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    itemModel: {
      type: String,
      enum: [
        "Roadmap",
        "InterviewExperience",
        "Document",
        "WellbeingPost",
        "WellbeingComment",
      ],
      required: true,
    },
    reportedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    reason: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "resolved"],
      default: "pending",
    },
  },
  { timestamps: true },
);

// Prevent users from reporting the same item multiple times
ReportSchema.index({ reportedItemId: 1, reportedBy: 1 }, { unique: true });

export default mongoose.model<IReport>("Report", ReportSchema);
