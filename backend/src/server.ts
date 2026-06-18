import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import mongoose from "mongoose";

const PORT = process.env.PORT || 5000;
const MONGODB_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/resource-adda";

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("Successfully connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  });
