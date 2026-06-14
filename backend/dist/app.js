"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const setup_routes_1 = __importDefault(require("./routes/setup.routes"));
const resource_routes_1 = __importDefault(require("./routes/resource.routes"));
const experience_routes_1 = __importDefault(
  require("./routes/experience.routes"),
);
const roadmap_routes_1 = __importDefault(require("./routes/roadmap.routes"));
const page_routes_1 = __importDefault(require("./routes/page.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const moderation_routes_1 = __importDefault(
  require("./routes/moderation.routes"),
);
const interaction_routes_1 = __importDefault(
  require("./routes/interaction.routes"),
);
const wellbeing_routes_1 = __importDefault(
  require("./routes/wellbeing.routes"),
);
const blog_routes_1 = __importDefault(require("./routes/blog.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use("/api/auth", auth_routes_1.default);
app.use("/api/setup", setup_routes_1.default);
app.use("/api/resources", resource_routes_1.default);
app.use("/api/placements", experience_routes_1.default);
app.use("/api/roadmaps", roadmap_routes_1.default);
app.use("/api/pages", page_routes_1.default);
app.use("/api/users", user_routes_1.default);
app.use("/api/moderation", moderation_routes_1.default);
app.use("/api/interactions", interaction_routes_1.default);
app.use("/api/wellbeing", wellbeing_routes_1.default);
app.use("/api/blogs", blog_routes_1.default);
app.use("/api/admin", admin_routes_1.default);
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is healthy" });
});
exports.default = app;
// Trigger nodemon restart
