import mongoose, { Document as MongooseDocument, Schema } from "mongoose";

export enum ContributionStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

export interface IContribution extends MongooseDocument {
  documentId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  status: ContributionStatus;
}

const ContributionSchema: Schema = new Schema(
  {
    documentId: {
      type: Schema.Types.ObjectId,
      ref: "Document",
      required: true,
    },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: Object.values(ContributionStatus),
      default: ContributionStatus.APPROVED,
    },
  },
  { timestamps: true },
);

export default mongoose.model<IContribution>(
  "Contribution",
  ContributionSchema,
);
