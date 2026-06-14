import express, { Express, Request, Response } from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import setupRoutes from "./routes/setup.routes";
import resourceRoutes from "./routes/resource.routes";
import experienceRoutes from "./routes/experience.routes";
import roadmapRoutes from "./routes/roadmap.routes";
import pageRoutes from "./routes/page.routes";
import userRoutes from "./routes/user.routes";
import moderationRoutes from "./routes/moderation.routes";
import interactionRoutes from "./routes/interaction.routes";
import wellbeingRoutes from "./routes/wellbeing.routes";
import blogRoutes from "./routes/blog.routes";
import adminRoutes from "./routes/admin.routes";

const app: Express = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/setup", setupRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/placements", experienceRoutes);
app.use("/api/roadmaps", roadmapRoutes);
app.use("/api/pages", pageRoutes);
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
