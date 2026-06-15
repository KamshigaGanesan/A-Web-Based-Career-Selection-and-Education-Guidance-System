import "dotenv/config";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import morgan from "morgan";
import session from "express-session";
import passport from "passport";

import { connectDB } from "./config/db.js";
import "./config/passport.js";

import authRoutes from "./routes/auth.js";
import courseRoutes from "./routes/courses.js";
import alternativeRoutes from "./routes/alternativeRoutes.js";
import recommendationRoutes from "./routes/recommendationRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";
import eligibilityRoutes from "./routes/eligibilityRoutes.js";
import careerRoutes from "./routes/careerRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import githubRoutes from "./routes/githubRoutes.js";
import { errorHandler, notFound } from "./middleware/errors.js";
import { initCronJobs } from "./services/cronService.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

// DB
await connectDB();
initCronJobs();

// Middleware
app.use(express.json());
app.use(morgan("dev"));

// CORS
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));

// Sessions required for OAuth "state" flow (simple dev setup)
app.use(session({
  secret: process.env.JWT_SECRET || "session_secret",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// Serve uploaded files
app.use("/uploads", express.static(path.resolve(__dirname, "../uploads")));

// Routes
app.get("/", (req, res) => res.json({ ok: true, name: "Career Guidance API" }));
app.use("/auth", authRoutes);
app.use("/courses", courseRoutes);
app.use("/api/alternatives", alternativeRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/eligibility", eligibilityRoutes);
app.use("/api/careers", careerRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/github", githubRoutes);

// 404 & error handlers
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log("Routes: /auth /courses /api/alternatives /api/recommendations /api/quiz /api/eligibility /api/careers /api/jobs /api/admin /api/github");
});
