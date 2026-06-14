import mongoose, { Document as MongooseDocument, Schema } from 'mongoose';

export interface IDocument extends MongooseDocument {
  title: string;
  description?: string;
  fileUrl: string;
  isExternalLink: boolean;
  subject: string;
  semester: number;
  branch: string;
  type: string;
  uploadedBy: mongoose.Types.ObjectId;
  downloadCount: number;
  averageRating: number;
  totalRatings: number;
  isFeatured: boolean;
}

const DocumentSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    fileUrl: { type: String, required: true },
    isExternalLink: { type: Boolean, default: false },
    subject: { type: String, required: true },
    semester: { type: Number, required: true },
    branch: { type: String, required: true },
    type: { type: String, required: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    downloadCount: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<IDocument>('Document', DocumentSchema);
