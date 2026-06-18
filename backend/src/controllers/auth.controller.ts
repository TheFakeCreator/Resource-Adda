import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User, { UserRole } from "../models/User";
import SystemSettings from "../models/SystemSettings";
import { AuthRequest } from "../middlewares/auth";
import { z } from "zod";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "../services/email.service";
import { OAuth2Client } from "google-auth-library";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const registerSchema = z.object({
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name too long"),
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name too long"),
  email: z.string().email("Invalid email address").max(100, "Email too long"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password too long"),
  rollNumber: z
    .string()
    .min(5, "Invalid roll number")
    .max(20, "Roll number too long"),
  branch: z.string().min(2, "Invalid branch"),
  semester: z.number().int().min(1).max(10),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address").max(100, "Email too long"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password too long"),
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
        const isAllowed = settings.allowedEmailPatterns.some((pattern) => {
          // Simple regex conversion from wildcard like *@*.nitrr.ac.in
          const regexStr = pattern.replace(/\*/g, ".*");
          const regex = new RegExp(`^${regexStr}$`);
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

    const password_hash = await bcrypt.hash(password, 10);

    const name = `${firstName.trim()} ${lastName.trim()}`;
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName)}+${encodeURIComponent(lastName)}&background=random`;

    let verificationToken = undefined;
    let verificationTokenExpires = undefined;
    if (!isVerified) {
      verificationToken = crypto.randomBytes(32).toString("hex");
      verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    }

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
      verificationToken,
      verificationTokenExpires,
    });

    await user.save();

    let emailSent = true;
    if (!isVerified && verificationToken) {
      emailSent = await sendVerificationEmail(email, verificationToken);
    }

    const token = generateToken(user._id.toString());

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

    if (user.provider === "google" && !user.password_hash) {
      res.status(400).json({ error: "Please continue with Google to log in." });
      return;
    }

    if (!user.password_hash) {
      res.status(400).json({ error: "Invalid credentials" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
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

export const verifyEmail = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { token } = req.body;
    if (!token) {
      res.status(400).json({ error: "Verification token is required" });
      return;
    }

    const user = await User.findOne({
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
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const resendVerification = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ error: "Email is required" });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    if (user.isVerified) {
      res.status(400).json({ error: "Account is already verified" });
      return;
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");
    user.verificationToken = verificationToken;
    user.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await user.save();

    const emailSent = await sendVerificationEmail(email, verificationToken);

    if (!emailSent) {
      res.status(500).json({
        error: "Failed to send verification email. Please try again later.",
      });
      return;
    }

    res.status(200).json({ message: "Verification email sent successfully!" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ error: "Email is required" });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Return success even if user doesn't exist to prevent email enumeration
      res.status(200).json({
        message: "If an account exists, a password reset email has been sent.",
      });
      return;
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await user.save();

    const emailSent = await sendPasswordResetEmail(user.email, resetToken);
    if (!emailSent) {
      res.status(500).json({
        error: "Failed to send password reset email. Please try again later.",
      });
      return;
    }

    res.status(200).json({
      message: "If an account exists, a password reset email has been sent.",
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
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

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      res
        .status(400)
        .json({ error: "Invalid or expired password reset token" });
      return;
    }

    user.password_hash = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({ message: "Password has been successfully reset." });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const googleAuth = async (
  req: Request,
  res: Response,
): Promise<void> => {
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

    let user = await User.findOne({ email });

    let isSuperAdmin = false;
    if (user) {
      isSuperAdmin = user.role === UserRole.SUPER_ADMIN;
    } else {
      const userCount = await User.countDocuments();
      if (userCount === 0) {
        isSuperAdmin = true;
      }
    }

    // Check Auto-Verification via Email Patterns
    // Bypass for SUPER_ADMIN
    if (!isSuperAdmin) {
      const settings = await SystemSettings.findOne();
      if (
        settings?.allowedEmailPatterns &&
        settings.allowedEmailPatterns.length > 0
      ) {
        const isAllowed = settings.allowedEmailPatterns.some((pattern) => {
          const regexStr = pattern.replace(/\*/g, ".*");
          const regex = new RegExp(`^${regexStr}$`);
          return regex.test(email);
        });

        if (!isAllowed) {
          res.status(403).json({
            error:
              "Only institute emails are allowed. Please use your institute account.",
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
    } else {
      const role = isSuperAdmin ? UserRole.SUPER_ADMIN : UserRole.STUDENT;

      user = new User({
        email,
        role,
        name,
        avatarUrl:
          picture ||
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
