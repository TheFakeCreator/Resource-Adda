import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User, { UserRole } from "../models/User";
import SystemSettings from "../models/SystemSettings";
import { AuthRequest } from "../middlewares/auth";
import { z } from "zod";

const registerSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rollNumber: z.string().min(5, "Invalid roll number"),
  branch: z.string().min(2, "Invalid branch"),
  semester: z.number().int().min(1).max(10),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const generateToken = (userId: string) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || "fallback_secret", {
    expiresIn: "7d",
  });
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = registerSchema.safeParse(req.body);
    if (!validatedData.success) {
      res.status(400).json({ error: validatedData.error.issues[0].message });
      return;
    }

    const {
      email,
      password,
      firstName,
      lastName,
      rollNumber,
      branch,
      semester,
    } = validatedData.data;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ error: "Email already exists" });
      return;
    }

    // Determine Role: First user is SUPER_ADMIN
    const userCount = await User.countDocuments();
    const role = userCount === 0 ? UserRole.SUPER_ADMIN : UserRole.STUDENT;

    // Check Auto-Verification via Email Patterns
    let isVerified = false;
    if (role === UserRole.SUPER_ADMIN) {
      isVerified = true;
    } else {
      const settings = await SystemSettings.findOne();
      if (
        settings?.allowedEmailPatterns &&
        settings.allowedEmailPatterns.length > 0
      ) {
        isVerified = settings.allowedEmailPatterns.some((pattern) => {
          // Simple regex conversion from wildcard like *@*.nitrr.ac.in
          const regexStr = pattern.replace(/\*/g, ".*");
          const regex = new RegExp(`^${regexStr}$`);
          return regex.test(email);
        });
      }
    }

    const password_hash = await bcrypt.hash(password, 10);

    const name = `${firstName.trim()} ${lastName.trim()}`;
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName)}+${encodeURIComponent(lastName)}&background=random`;

    const user = new User({
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
      message: "Registration successful",
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
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = loginSchema.safeParse(req.body);
    if (!validatedData.success) {
      res.status(400).json({ error: validatedData.error.issues[0].message });
      return;
    }

    const { email, password } = validatedData.data;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ error: "Invalid credentials" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      res.status(400).json({ error: "Invalid credentials" });
      return;
    }

    // Update lastLogin tracking
    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id.toString());

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
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "User not found" });
      return;
    }

    // Don't send password hash back
    const user = await User.findById(req.user._id).select("-password_hash");
    res.status(200).json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
