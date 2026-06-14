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
exports.getMe = exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importStar(require("../models/User"));
const SystemSettings_1 = __importDefault(require("../models/SystemSettings"));
const zod_1 = require("zod");
const registerSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(2, 'First name must be at least 2 characters'),
    lastName: zod_1.z.string().min(2, 'Last name must be at least 2 characters'),
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
    rollNumber: zod_1.z.string().min(5, 'Invalid roll number'),
    branch: zod_1.z.string().min(2, 'Invalid branch'),
    semester: zod_1.z.number().int().min(1).max(10),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
});
const generateToken = (userId) => {
    return jsonwebtoken_1.default.sign({ userId }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '7d' });
};
const register = async (req, res) => {
    try {
        const validatedData = registerSchema.safeParse(req.body);
        if (!validatedData.success) {
            res.status(400).json({ error: validatedData.error.issues[0].message });
            return;
        }
        const { email, password, firstName, lastName, rollNumber, branch, semester } = validatedData.data;
        const existingUser = await User_1.default.findOne({ email });
        if (existingUser) {
            res.status(400).json({ error: 'Email already exists' });
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
            if (settings?.allowedEmailPatterns && settings.allowedEmailPatterns.length > 0) {
                isVerified = settings.allowedEmailPatterns.some(pattern => {
                    // Simple regex conversion from wildcard like *@*.nitrr.ac.in
                    const regexStr = pattern.replace(/\*/g, '.*');
                    const regex = new RegExp(`^${regexStr}$`);
                    return regex.test(email);
                });
            }
        }
        const password_hash = await bcrypt_1.default.hash(password, 10);
        const name = `${firstName.trim()} ${lastName.trim()}`;
        const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName)}+${encodeURIComponent(lastName)}&background=random`;
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
        });
        await user.save();
        const token = generateToken(user._id.toString());
        res.status(201).json({
            message: 'Registration successful',
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
            res.status(400).json({ error: 'Invalid credentials' });
            return;
        }
        const isMatch = await bcrypt_1.default.compare(password, user.password_hash);
        if (!isMatch) {
            res.status(400).json({ error: 'Invalid credentials' });
            return;
        }
        // Update lastLogin tracking
        user.lastLogin = new Date();
        await user.save();
        const token = generateToken(user._id.toString());
        res.status(200).json({
            message: 'Login successful',
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
exports.login = login;
const getMe = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'User not found' });
            return;
        }
        // Don't send password hash back
        const user = await User_1.default.findById(req.user._id).select('-password_hash');
        res.status(200).json(user);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getMe = getMe;
