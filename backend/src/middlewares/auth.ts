import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/User";

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error(
      "FATAL: JWT_SECRET environment variable is not set. Server cannot verify tokens.",
    );
  }
  return secret;
};

export interface AuthRequest extends Request {
  user?: IUser;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    const token = authHeader.replace("Bearer ", "");
    const decoded = jwt.verify(token, getJwtSecret()) as {
      userId: string;
      tokenVersion?: number;
    };

    const user = await User.findById(decoded.userId);
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
  } catch (error) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

export const authorizeRoles = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res
        .status(403)
        .json({ error: "Access denied: insufficient permissions" });
      return;
    }
    next();
  };
};
