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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.googleAuth = exports.resetPassword = exports.forgotPassword = exports.resendVerification = exports.verifyEmail = exports.getMe = exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const User_1 = __importStar(require("../models/User"));
const SystemSettings_1 = __importDefault(require("../models/SystemSettings"));
const zod_1 = require("zod");
const email_service_1 = require("../services/email.service");
const google_auth_library_1 = require("google-auth-library");
const googleClient = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const registerSchema = zod_1.z.object({
    firstName: zod_1.z
        .string()
        .min(2, "First name must be at least 2 characters")
        .max(50, "First name too long"),
    lastName: zod_1.z
        .string()
        .min(2, "Last name must be at least 2 characters")
        .max(50, "Last name too long"),
    email: zod_1.z.string().email("Invalid email address").max(100, "Email too long"),
    password: zod_1.z
        .string()
        .min(6, "Password must be at least 6 characters")
        .max(100, "Password too long"),
    rollNumber: zod_1.z
        .string()
        .min(5, "Invalid roll number")
        .max(20, "Roll number too long"),
    branch: zod_1.z.string().min(2, "Invalid branch"),
    semester: zod_1.z.number().int().min(1).max(10),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email address").max(100, "Email too long"),
    password: zod_1.z
        .string()
        .min(6, "Password must be at least 6 characters")
        .max(100, "Password too long"),
});
const getJwtSecret = () => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("FATAL: JWT_SECRET environment variable is not set. Server cannot sign tokens.");
    }
    return secret;
};
const generateToken = (userId, tokenVersion) => {
    return jsonwebtoken_1.default.sign({ userId, tokenVersion }, getJwtSecret(), {
        expiresIn: "1d",
    });
};
const register = async (req, res) => {
    try {
        const validatedData = registerSchema.safeParse(req.body);
        if (!validatedData.success) {
            res.status(400).json({ error: validatedData.error.issues[0].message });
            return;
        }
        const { email, password, firstName, lastName, rollNumber, branch, semester, } = validatedData.data;
        const existingUser = await User_1.default.findOne({ email });
        if (existingUser) {
            // Prevent email enumeration: act as if registration succeeded but require verification
            res.status(201).json({
                message: "Registration successful. Please check your email to verify your account.",
                user: { isVerified: false }, // Forces frontend to show verification screen instead of auto-login
            });
            return;
        }
        // Determine Role: First user is SUPER_ADMIN
        const userCount = await User_1.default.countDocuments();
        const role = userCount === 0 ? User_1.UserRole.SUPER_ADMIN : User_1.UserRole.STUDENT;
        // Check Auto-Verification via Email Patterns
        let isVerified = false;
        if (role === User_1.UserRole.SUPER_ADMIN) {
            isVerified = true;
        }
        else {
            const settings = await SystemSettings_1.default.findOne();
            if (settings?.allowedEmailPatterns &&
                settings.allowedEmailPatterns.length > 0) {
                const isAllowed = settings.allowedEmailPatterns.some((pattern) => {
                    // Escape all regex special chars except *, then convert * to .*
                    const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&");
                    const regexStr = escaped.replace(/\*/g, ".*");
                    const regex = new RegExp(`^${regexStr}$`, "i");
                    return regex.test(email);
                });
                if (!isAllowed) {
                    res.status(403).json({
                        error: "Email domain not allowed. Please use your institute email.",
                    });
                    return;
                }
            }
        }
        const password_hash = await bcrypt_1.default.hash(password, 10);
        const name = `${firstName.trim()} ${lastName.trim()}`;
        const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName)}+${encodeURIComponent(lastName)}&background=random`;
        let verificationToken = undefined;
        let verificationTokenExpires = undefined;
        if (!isVerified) {
            verificationToken = crypto_1.default.randomBytes(32).toString("hex");
            verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        }
        const user = new User_1.default({
            email,
            password_hash,
            role,
            name,
            avatarUrl,
            rollNumber,
            branch,
            semester,
            isVerified,
            verificationToken,
            verificationTokenExpires,
        });
        await user.save();
        let emailSent = true;
        if (!isVerified && verificationToken) {
            emailSent = await (0, email_service_1.sendVerificationEmail)(email, verificationToken);
        }
        const token = generateToken(user._id.toString(), user.tokenVersion);
        res.status(201).json({
            message: emailSent
                ? "Registration successful. Please check your email to verify your account."
                : "Account created, but we couldn't send the verification email. Please try the 'Resend Email' button in a few minutes.",
            token,
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                name: user.name,
                avatarUrl: user.avatarUrl,
                isVerified: user.isVerified,
            },
        });
    }
    catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ error: "An internal server error occurred" });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const validatedData = loginSchema.safeParse(req.body);
        if (!validatedData.success) {
            res.status(400).json({ error: validatedData.error.issues[0].message });
            return;
        }
        const { email, password } = validatedData.data;
        const user = await User_1.default.findOne({ email });
        if (!user) {
            res.status(400).json({ error: "Invalid credentials" });
            return;
        }
        if (user.provider === "google" && !user.password_hash) {
            res.status(400).json({ error: "Please continue with Google to log in." });
            return;
        }
        if (!user.password_hash) {
            res.status(400).json({ error: "Invalid credentials" });
            return;
        }
        const isMatch = await bcrypt_1.default.compare(password, user.password_hash);
        if (!isMatch) {
            res.status(400).json({ error: "Invalid credentials" });
            return;
        }
        if (!user.isVerified) {
            res.status(403).json({
                error: "Please verify your email address before logging in.",
                isVerified: false,
                email: user.email,
            });
            return;
        }
        // Update lastLogin tracking
        user.lastLogin = new Date();
        await user.save();
        const token = generateToken(user._id.toString(), user.tokenVersion);
        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                name: user.name,
                avatarUrl: user.avatarUrl,
                isVerified: user.isVerified,
            },
        });
    }
    catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ error: "An internal server error occurred" });
    }
};
exports.login = login;
const getMe = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: "User not found" });
            return;
        }
        // Don't send password hash back
        const user = await User_1.default.findById(req.user._id).select("-password_hash");
        res.status(200).json(user);
    }
    catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ error: "An internal server error occurred" });
    }
};
exports.getMe = getMe;
const verifyEmail = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            res.status(400).json({ error: "Verification token is required" });
            return;
        }
        const user = await User_1.default.findOne({
            verificationToken: token,
            verificationTokenExpires: { $gt: new Date() },
        });
        if (!user) {
            res.status(400).json({ error: "Invalid or expired verification token" });
            return;
        }
        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpires = undefined;
        user.verifiedAt = new Date();
        await user.save();
        res.status(200).json({ message: "Email successfully verified!" });
    }
    catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ error: "An internal server error occurred" });
    }
};
exports.verifyEmail = verifyEmail;
const resendVerification = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            res.status(400).json({ error: "Email is required" });
            return;
        }
        const user = await User_1.default.findOne({ email });
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        if (user.isVerified) {
            res.status(400).json({ error: "Account is already verified" });
            return;
        }
        const verificationToken = crypto_1.default.randomBytes(32).toString("hex");
        user.verificationToken = verificationToken;
        user.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        await user.save();
        const emailSent = await (0, email_service_1.sendVerificationEmail)(email, verificationToken);
        if (!emailSent) {
            res.status(500).json({
                error: "Failed to send verification email. Please try again later.",
            });
            return;
        }
        res.status(200).json({ message: "Verification email sent successfully!" });
    }
    catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ error: "An internal server error occurred" });
    }
};
exports.resendVerification = resendVerification;
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            res.status(400).json({ error: "Email is required" });
            return;
        }
        const user = await User_1.default.findOne({ email });
        if (!user) {
            // Return success even if user doesn't exist to prevent email enumeration
            res.status(200).json({
                message: "If an account exists, a password reset email has been sent.",
            });
            return;
        }
        const resetToken = crypto_1.default.randomBytes(32).toString("hex");
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        await user.save();
        const emailSent = await (0, email_service_1.sendPasswordResetEmail)(user.email, resetToken);
        if (!emailSent) {
            res.status(500).json({
                error: "Failed to send password reset email. Please try again later.",
            });
            return;
        }
        res.status(200).json({
            message: "If an account exists, a password reset email has been sent.",
        });
    }
    catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ error: "An internal server error occurred" });
    }
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword) {
            res.status(400).json({ error: "Token and new password are required" });
            return;
        }
        if (newPassword.length < 6 || newPassword.length > 100) {
            res
                .status(400)
                .json({ error: "Password must be between 6 and 100 characters long" });
            return;
        }
        const user = await User_1.default.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: new Date() },
        });
        if (!user) {
            res
                .status(400)
                .json({ error: "Invalid or expired password reset token" });
            return;
        }
        user.password_hash = await bcrypt_1.default.hash(newPassword, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        user.tokenVersion += 1; // Invalidate all existing sessions on password reset
        await user.save();
        res.status(200).json({ message: "Password has been successfully reset." });
    }
    catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ error: "An internal server error occurred" });
    }
};
exports.resetPassword = resetPassword;
const googleAuth = async (req, res) => {
    try {
        const { credential } = req.body;
        if (!credential) {
            res.status(400).json({ error: "Google credential is required" });
            return;
        }
        if (!process.env.GOOGLE_CLIENT_ID) {
            res
                .status(500)
                .json({ error: "Google OAuth is not configured on the server." });
            return;
        }
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
            res.status(400).json({ error: "Invalid Google token" });
            return;
        }
        const { email, name, picture, sub } = payload;
        let user = await User_1.default.findOne({ email });
        let isSuperAdmin = false;
        if (user) {
            isSuperAdmin = user.role === User_1.UserRole.SUPER_ADMIN;
        }
        else {
            const userCount = await User_1.default.countDocuments();
            if (userCount === 0) {
                isSuperAdmin = true;
            }
        }
        // Check Auto-Verification via Email Patterns
        // Bypass for SUPER_ADMIN
        if (!isSuperAdmin) {
            const settings = await SystemSettings_1.default.findOne();
            if (settings?.allowedEmailPatterns &&
                settings.allowedEmailPatterns.length > 0) {
                const isAllowed = settings.allowedEmailPatterns.some((pattern) => {
                    const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&");
                    const regexStr = escaped.replace(/\*/g, ".*");
                    const regex = new RegExp(`^${regexStr}$`, "i");
                    return regex.test(email);
                });
                if (!isAllowed) {
                    res.status(403).json({
                        error: "Only institute emails are allowed. Please use your institute account.",
                    });
                    return;
                }
            }
        }
        if (user) {
            if (!user.googleId) {
                user.googleId = sub;
                await user.save();
            }
        }
        else {
            const role = isSuperAdmin ? User_1.UserRole.SUPER_ADMIN : User_1.UserRole.STUDENT;
            user = new User_1.default({
                email,
                role,
                name,
                avatarUrl: picture ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "User")}&background=random`,
                isVerified: true, // Google verified the email
                verifiedAt: new Date(),
                provider: "google",
                googleId: sub,
            });
            await user.save();
        }
        user.lastLogin = new Date();
        await user.save();
        const token = generateToken(user._id.toString(), user.tokenVersion);
        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                name: user.name,
                avatarUrl: user.avatarUrl,
                isVerified: user.isVerified,
            },
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.googleAuth = googleAuth;
const logout = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: "Not authenticated" });
            return;
        }
        const user = await User_1.default.findById(req.user._id);
        if (user) {
            user.tokenVersion += 1; // Invalidate current and all other active JWTs
            await user.save();
        }
        res.status(200).json({ message: "Logged out successfully" });
    }
    catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ error: "An internal server error occurred" });
    }
};
exports.logout = logout;
