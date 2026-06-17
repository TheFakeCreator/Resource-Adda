import express, { Express, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/auth.routes";
import setupRoutes from "./routes/setup.routes";
import resourceRoutes from "./routes/resource.routes";
import experienceRoutes from "./routes/experience.routes";
import roadmapRoutes from "./routes/roadmap.routes";
import userRoutes from "./routes/user.routes";
import moderationRoutes from "./routes/moderation.routes";
import interactionRoutes from "./routes/interaction.routes";
import wellbeingRoutes from "./routes/wellbeing.routes";
import blogRoutes from "./routes/blog.routes";
import adminRoutes from "./routes/admin.routes";

const app: Express = express();

// 1. Security Headers
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  }),
);

// 2. Strict CORS Configuration
const allowedOrigins = process.env.FRONTEND_URLS
  ? process.env.FRONTEND_URLS.split(",")
  : ["http://localhost:3000"];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

// 3. Rate Limiting (100 requests per 15 minutes per IP)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  message: { error: "Too many requests from this IP, please try again later." },
  standardHeaders: "draft-7",
  legacyHeaders: false,
});
app.use("/api", limiter);

// 4. Body Parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/setup", setupRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/placements", experienceRoutes);
app.use("/api/roadmaps", roadmapRoutes);
app.use("/api/users", userRoutes);
app.use("/api/moderation", moderationRoutes);
app.use("/api/interactions", interactionRoutes);
app.use("/api/wellbeing", wellbeingRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/admin", adminRoutes);

app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "ok", message: "Server is healthy" });
});

export default app;
// Trigger nodemon restart
