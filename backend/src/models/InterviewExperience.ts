import mongoose, { Document as MongooseDocument, Schema } from 'mongoose';
import { ContributionStatus } from './Contribution';

export interface IInterviewRound {
  title: string;
  duration: string;
  topics: string[];
  description: string;
}

export interface IInterviewExperience extends MongooseDocument {
  title: string;
  company: string;
  role: string;
  type: string; // e.g., On-Campus, Off-Campus, Internship
  offerStatus: string; // e.g., Accepted, Rejected, Pending, No Offer
  
  difficulty: string; // Easy, Medium, Hard
  ctc?: string;
  preparationStrategy?: string;
  adviceForJuniors?: string;
  
  rounds: IInterviewRound[];

  author: mongoose.Types.ObjectId;
  isAnonymous: boolean;
  status: ContributionStatus;
  tags: string[];
  upvotes: number;
  downvotes: number;
  upvotedBy: mongoose.Types.ObjectId[];
  downvotedBy: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const InterviewRoundSchema: Schema = new Schema({
  title: { type: String, required: true },
  duration: { type: String },
  topics: [{ type: String }],
  description: { type: String, required: true }
});

const InterviewExperienceSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    company: { type: String, required: true },
    role: { type: String, required: true },
    type: { type: String, required: true },
    offerStatus: { type: String, required: true },
    
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
    ctc: { type: String },
    preparationStrategy: { type: String },
    adviceForJuniors: { type: String },
    
    rounds: [InterviewRoundSchema],

    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isAnonymous: { type: Boolean, default: false },
    status: { type: String, enum: Object.values(ContributionStatus), default: ContributionStatus.PENDING },
    tags: [{ type: String }],
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    upvotedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    downvotedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

export default mongoose.model<IInterviewExperience>('InterviewExperience', InterviewExperienceSchema);
