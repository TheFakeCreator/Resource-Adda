import { Request, Response } from "express";
import SystemSettings from "../models/SystemSettings";
import User, { UserRole } from "../models/User";
import { AuthRequest } from "../middlewares/auth";

export const getSetupStatus = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const settings = await SystemSettings.findOne();
    const userCount = await User.countDocuments();

    if (userCount === 0) {
      res.status(200).json({
        isSetupComplete: false,
        message: "Super admin registration pending",
      });
      return;
    }

    if (!settings || !settings.isSetupComplete) {
      res.status(200).json({
        isSetupComplete: false,
        message: "System configuration pending",
      });
      return;
    }

    res.status(200).json({ isSetupComplete: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const configureSystem = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { instituteName, allowedEmailPatterns, taglineLanguage } = req.body;

    if (!req.user || req.user.role !== UserRole.SUPER_ADMIN) {
      res.status(403).json({ error: "Access denied: Super Admin only" });
      return;
    }

    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = new SystemSettings();
    }

    settings.instituteName = instituteName;
    settings.allowedEmailPatterns = allowedEmailPatterns;
    if (taglineLanguage) {
      settings.taglineLanguage = taglineLanguage;
    }
    settings.isSetupComplete = true;

    await settings.save();

    res
      .status(200)
      .json({ message: "System configuration saved successfully", settings });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getPublicSettings = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const settings = await SystemSettings.findOne();
    const userCount = await User.countDocuments();
    const isSetupComplete = userCount > 0 && settings?.isSetupComplete === true;

    if (!settings) {
      res.status(200).json({
        taglineLanguage: "hindi",
        instituteName: "Resource-Adda",
        allowedEmailPatterns: [],
        isSetupComplete,
      });
      return;
    }
    res.status(200).json({
      taglineLanguage: settings.taglineLanguage,
      instituteName: settings.instituteName,
      allowedEmailPatterns: settings.allowedEmailPatterns,
      isSetupComplete,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
