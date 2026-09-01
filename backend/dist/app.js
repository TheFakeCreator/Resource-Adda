"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const express_mongo_sanitize_1 = __importDefault(require("express-mongo-sanitize"));
const morgan_1 = __importDefault(require("morgan"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const setup_routes_1 = __importDefault(require("./routes/setup.routes"));
const resource_routes_1 = __importDefault(require("./routes/resource.routes"));
const experience_routes_1 = __importDefault(require("./routes/experience.routes"));
const roadmap_routes_1 = __importDefault(require("./routes/roadmap.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const moderation_routes_1 = __importDefault(require("./routes/moderation.routes"));
const interaction_routes_1 = __importDefault(require("./routes/interaction.routes"));
const wellbeing_routes_1 = __importDefault(require("./routes/wellbeing.routes"));
const blog_routes_1 = __importDefault(require("./routes/blog.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const app = (0, express_1.default)();
// 0. Trust Proxy (required for accurate IP logging and rate limiting behind a reverse proxy)
app.set("trust proxy", 1);
// 0.5. HTTPS Enforcement (Production Only)
if (process.env.NODE_ENV === "production") {
    app.use((req, res, next) => {
        if (req.header("x-forwarded-proto") !== "https") {
            res.redirect(`https://${req.header("host")}${req.url}`);
        }
        else {
            next();
        }
    });
}
// 0.6 Request Logging
app.use((0, morgan_1.default)("combined"));
// 1. Security Headers
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: false,
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
}));
// 2. Strict CORS Configuration
const allowedOrigins = process.env.FRONTEND_URLS
    ? process.env.FRONTEND_URLS.split(",")
    : ["http://localhost:3000"];
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        }
        else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
}));
// 3. Rate Limiting (100 requests per 15 minutes per IP)
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    message: { error: "Too many requests from this IP, please try again later." },
    standardHeaders: "draft-7",
    legacyHeaders: false,
});
app.use("/api", limiter);
// 3b. Stricter rate limit for auth endpoints (20 req per 15 min)
const authLimiter = (0, express_rate_limit_1.default)({
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
app.use(express_1.default.json({ limit: "1mb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "1mb" }));
// 5. NoSQL Injection Prevention
// express-mongo-sanitize middleware breaks in Express 5 because req.query is a getter.
// We apply it manually using Object.defineProperty for the query object.
app.use((req, res, next) => {
    if (req.body)
        req.body = express_mongo_sanitize_1.default.sanitize(req.body);
    if (req.params)
        req.params = express_mongo_sanitize_1.default.sanitize(req.params);
    if (req.headers)
        req.headers = express_mongo_sanitize_1.default.sanitize(req.headers);
    if (req.query) {
        const sanitizedQuery = express_mongo_sanitize_1.default.sanitize(req.query);
        Object.defineProperty(req, "query", {
            value: sanitizedQuery,
            configurable: true,
            enumerable: true,
            writable: true,
        });
    }
    next();
});
app.use("/api/auth", auth_routes_1.default);
app.use("/api/setup", setup_routes_1.default);
app.use("/api/resources", resource_routes_1.default);
app.use("/api/placements", experience_routes_1.default);
app.use("/api/roadmaps", roadmap_routes_1.default);
app.use("/api/users", user_routes_1.default);
app.use("/api/moderation", moderation_routes_1.default);
app.use("/api/interactions", interaction_routes_1.default);
app.use("/api/wellbeing", wellbeing_routes_1.default);
app.use("/api/blogs", blog_routes_1.default);
app.use("/api/admin", admin_routes_1.default);
app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok", message: "Server is healthy" });
});
// Global Error Handler — must be after all routes
// Prevents leaking internal error details to clients
app.use((err, req, res, _next) => {
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
exports.default = app;
