"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app_1 = __importDefault(require("./app"));
const mongoose_1 = __importDefault(require("mongoose"));
const cleanup_1 = require("./jobs/cleanup");
// Production environment validation
if (process.env.NODE_ENV === "production") {
    const required = [
        "JWT_SECRET",
        "MONGO_URI",
        "FRONTEND_URLS",
        "RESEND_API_KEY",
        "CLOUDINARY_CLOUD_NAME",
        "CLOUDINARY_API_KEY",
        "CLOUDINARY_API_SECRET",
    ];
    const missing = required.filter((key) => !process.env[key]);
    if (missing.length > 0) {
        console.error(`FATAL: Missing required environment variables: ${missing.join(", ")}`);
        process.exit(1);
    }
}
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGO_URI || "mongodb://localhost:27017/resource-adda";
mongoose_1.default
    .connect(MONGODB_URI, {
    tls: process.env.NODE_ENV === "production",
})
    .then(() => {
    console.log("Successfully connected to MongoDB");
    (0, cleanup_1.startCleanupJob)();
    app_1.default.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
})
    .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
});
