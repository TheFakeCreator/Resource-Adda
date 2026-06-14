"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRole = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var UserRole;
(function (UserRole) {
    UserRole["SUPER_ADMIN"] = "super_admin";
    UserRole["ADMIN"] = "admin";
    UserRole["STUDENT"] = "student";
})(UserRole || (exports.UserRole = UserRole = {}));
const UserSchema = new mongoose_1.Schema({
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
    followers: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }],
    // Saved Content
    bookmarkedResources: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Document' }],
    // Roadmap Progress
    activeRoadmaps: [{
            roadmapId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Roadmap' },
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
}, { timestamps: true });
exports.default = mongoose_1.default.model('User', UserSchema);
