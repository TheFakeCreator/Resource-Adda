"use strict";
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (
          !desc ||
          ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)
        ) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }
    : function (o, v) {
        o["default"] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  (function () {
    var ownKeys = function (o) {
      ownKeys =
        Object.getOwnPropertyNames ||
        function (o) {
          var ar = [];
          for (var k in o)
            if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
          return ar;
        };
      return ownKeys(o);
    };
    return function (mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null)
        for (var k = ownKeys(mod), i = 0; i < k.length; i++)
          if (k[i] !== "default") __createBinding(result, mod, k[i]);
      __setModuleDefault(result, mod);
      return result;
    };
  })();
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPublicSettings =
  exports.configureSystem =
  exports.getSetupStatus =
    void 0;
const SystemSettings_1 = __importDefault(require("../models/SystemSettings"));
const User_1 = __importStar(require("../models/User"));
const getSetupStatus = async (req, res) => {
  try {
    const settings = await SystemSettings_1.default.findOne();
    const userCount = await User_1.default.countDocuments();
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
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.getSetupStatus = getSetupStatus;
const configureSystem = async (req, res) => {
  try {
    const { instituteName, allowedEmailPatterns, taglineLanguage } = req.body;
    if (!req.user || req.user.role !== User_1.UserRole.SUPER_ADMIN) {
      res.status(403).json({ error: "Access denied: Super Admin only" });
      return;
    }
    let settings = await SystemSettings_1.default.findOne();
    if (!settings) {
      settings = new SystemSettings_1.default();
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
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.configureSystem = configureSystem;
const getPublicSettings = async (req, res) => {
  try {
    const settings = await SystemSettings_1.default.findOne();
    if (!settings) {
      res.status(200).json({
        taglineLanguage: "hindi",
        instituteName: "Resource-Adda",
        allowedEmailPatterns: [],
      });
      return;
    }
    res.status(200).json({
      taglineLanguage: settings.taglineLanguage,
      instituteName: settings.instituteName,
      allowedEmailPatterns: settings.allowedEmailPatterns,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.getPublicSettings = getPublicSettings;
