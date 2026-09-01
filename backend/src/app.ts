import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import morgan from "morgan";
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

// 0. Trust Proxy (required for accurate IP logging and rate limiting behind a reverse proxy)
app.set("trust proxy", 1);

// 0.5. HTTPS Enforcement (Production Only)
if (process.env.NODE_ENV === "production") {
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.header("x-forwarded-proto") !== "https") {
      res.redirect(`https://${req.header("host")}${req.url}`);
    } else {
      next();
    }
  });
}

// 0.6 Request Logging
app.use(morgan("combined"));

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

// 3b. Stricter rate limit for auth endpoints (20 req per 15 min)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  message: {
    error: "Too many authentication attempts. Please try again later.",
  },
  standardHeaders: "draft-7",
  legacyHeaders: false,
});
app.use("/api/auth", authLimiter);

// 4. Body Parsing (with size limits)
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// 5. NoSQL Injection Prevention
// express-mongo-sanitize middleware breaks in Express 5 because req.query is a getter.
// We apply it manually using Object.defineProperty for the query object.
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.body) req.body = mongoSanitize.sanitize(req.body);
  if (req.params) req.params = mongoSanitize.sanitize(req.params);
  if (req.headers) req.headers = mongoSanitize.sanitize(req.headers) as any;
  if (req.query) {
    const sanitizedQuery = mongoSanitize.sanitize(req.query);
    Object.defineProperty(req, "query", {
      value: sanitizedQuery,
      configurable: true,
      enumerable: true,
      writable: true,
    });
  }
  next();
});

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

// Global Error Handler — must be after all routes
// Prevents leaking internal error details to clients
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled error:", err.message);

  // CORS errors from the cors middleware
  if (err.message === "Not allowed by CORS") {
    res.status(403).json({ error: "CORS: Origin not allowed" });
    return;
  }

  // Multer file size/type errors
  if (err.message?.includes("File too large")) {
    res.status(413).json({ error: "File too large. Maximum size is 10MB." });
    return;
  }

  if (err.message?.includes("Invalid file type")) {
    res.status(400).json({ error: err.message });
    return;
  }

  // Generic error — hide internals in production
  res.status(500).json({ error: "An internal server error occurred" });
});

export default app;
