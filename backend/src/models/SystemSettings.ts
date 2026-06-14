import mongoose, { Document, Schema } from "mongoose";

export interface ISystemSettings extends Document {
  instituteName: string;
  allowedEmailPatterns: string[];
  isSetupComplete: boolean;
  taglineLanguage: "hindi" | "english";
}

const SystemSettingsSchema: Schema = new Schema(
  {
    instituteName: { type: String, required: true },
    allowedEmailPatterns: { type: [String], required: true },
    isSetupComplete: { type: Boolean, default: false },
    taglineLanguage: {
      type: String,
      enum: ["hindi", "english"],
      default: "hindi",
    },
  },
  { timestamps: true },
);

export default mongoose.model<ISystemSettings>(
  "SystemSettings",
  SystemSettingsSchema,
);
