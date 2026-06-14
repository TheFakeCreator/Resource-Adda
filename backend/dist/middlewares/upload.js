"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadToCloudinary = exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const cloudinary_1 = require("cloudinary");
// Multer configured to store files in memory
const storage = multer_1.default.memoryStorage();
exports.upload = (0, multer_1.default)({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});
// Helper function to upload buffer to Cloudinary
const uploadToCloudinary = async (fileBuffer, folder) => {
  // Ensure Cloudinary is configured with env vars
  cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary_1.v2.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error);
        if (result) return resolve(result.secure_url);
        reject(new Error("Unknown Cloudinary Error"));
      },
    );
    uploadStream.end(fileBuffer);
  });
};
exports.uploadToCloudinary = uploadToCloudinary;
