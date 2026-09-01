"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRoles = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const getJwtSecret = () => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("FATAL: JWT_SECRET environment variable is not set. Server cannot verify tokens.");
    }
    return secret;
};
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.header("Authorization");
        if (!authHeader?.startsWith("Bearer ")) {
            res.status(401).json({ error: "Authentication required" });
            return;
        }
        const token = authHeader.replace("Bearer ", "");
        const decoded = jsonwebtoken_1.default.verify(token, getJwtSecret());
        const user = await User_1.default.findById(decoded.userId);
        if (!user) {
            throw new Error();
        }
        // Check token version to invalidate tokens after logout or password reset
        // Default to 0 if not present in old tokens
        const tokenVersion = decoded.tokenVersion || 0;
        if (tokenVersion !== user.tokenVersion) {
            throw new Error("Token version mismatch");
        }
        if (user.isDeleted) {
            res.status(401).json({ error: "Account is scheduled for deletion." });
            return;
        }
        req.user = user;
        next();
    }
    catch (error) {
        res.status(401).json({ error: "Invalid or expired token" });
    }
};
exports.authenticate = authenticate;
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            res
                .status(403)
                .json({ error: "Access denied: insufficient permissions" });
            return;
        }
        next();
    };
};
exports.authorizeRoles = authorizeRoles;
