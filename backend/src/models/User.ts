import mongoose, { Document, Schema } from 'mongoose';

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  STUDENT = 'student',
}

export interface IUser extends Document {
  email: string;
  password_hash: string;
  role: UserRole;

  // Profile
  name?: string;
  avatarUrl?: string;
  bio?: string;

  // Academic
  rollNumber?: string;
  branch?: string;
  semester?: number;
  section?: string;
  graduationYear?: number;

  // Verification
  isVerified: boolean;
  idCardUrl?: string;
  verifiedAt?: Date;

  // Contribution System
  contributionPoints: number;
  resourcesUploaded: number;
  resourcesApproved: number;

  // Gamification
  badges: string[];

  // Social
  followers: mongoose.Types.ObjectId[];
  following: mongoose.Types.ObjectId[];

  // Saved Content
  bookmarkedResources: mongoose.Types.ObjectId[];
  
  // Roadmap Progress
  activeRoadmaps: {
    roadmapId: mongoose.Types.ObjectId;
    completedSteps: number[]; // Array of step indices
    startedAt: Date;
    lastAccessedAt: Date;
  }[];

  // Preferences
  preferredSubjects: string[];
  preferredCompanies: string[];

  // Activity
  lastLogin?: Date;
  loginStreak: number;

  // Account Status
  isActive: boolean;
  isBanned: boolean;
  banReason?: string;
}

const UserSchema: Schema = new Schema(
  {
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password_hash: { type: String, required: true },
    role: { type: String, enum: Object.values(UserRole), default: UserRole.STUDENT },
    
    // Profile
    name: { type: String },
    avatarUrl: { type: String },
    bio: { type: String },

    // Academic
    rollNumber: { type: String },
    branch: { type: String },
    semester: { type: Number },
    section: { type: String },
    graduationYear: { type: Number },

    // Verification
    isVerified: { type: Boolean, default: false },
    idCardUrl: { type: String },
    verifiedAt: { type: Date },

    // Contribution System
    contributionPoints: { type: Number, default: 0 },
    resourcesUploaded: { type: Number, default: 0 },
    resourcesApproved: { type: Number, default: 0 },

    // Gamification
    badges: [{ type: String }],

    // Social
    followers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: Schema.Types.ObjectId, ref: 'User' }],

    // Saved Content
    bookmarkedResources: [{ type: Schema.Types.ObjectId, ref: 'Document' }],

    // Roadmap Progress
    activeRoadmaps: [{
      roadmapId: { type: Schema.Types.ObjectId, ref: 'Roadmap' },
      completedSteps: [{ type: Number }],
      startedAt: { type: Date, default: Date.now },
      lastAccessedAt: { type: Date, default: Date.now }
    }],

    // Preferences
    preferredSubjects: [{ type: String }],
    preferredCompanies: [{ type: String }],

    // Activity
    lastLogin: { type: Date },
    loginStreak: { type: Number, default: 0 },

    // Account Status
    isActive: { type: Boolean, default: true },
    isBanned: { type: Boolean, default: false },
    banReason: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>('User', UserSchema);
