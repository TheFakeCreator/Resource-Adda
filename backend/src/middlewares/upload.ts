import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { Request } from "express";

// Multer configured to store files in memory
const storage = multer.memoryStorage();

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  const allowedMimeTypes = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/jpg",
  ];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only PDF, PNG, and JPEG files are allowed.",
      ),
    );
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter,
});

// Helper function to upload buffer to Cloudinary
export const uploadToCloudinary = async (
  fileBuffer: Buffer,
  folder: string,
  resourceType: "auto" | "image" | "video" | "raw" = "auto",
): Promise<string> => {
  // Ensure Cloudinary is configured with env vars
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType },
      (error, result) => {
        if (error) return reject(error);
        if (result) return resolve(result.secure_url);
        reject(new Error("Unknown Cloudinary Error"));
      },
    );
    uploadStream.end(fileBuffer);
  });
};
