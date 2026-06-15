import { Router } from "express";
import multer from "multer";
import { requireAdmin, requireRole } from "../middleware/adminAuth.js";
import { upload } from "../middleware/upload.js";
import { login, seedSuperadmin } from "../controllers/adminAuthController.js";
import { getStats } from "../controllers/adminDashboardController.js";
import * as careers from "../controllers/adminCareersController.js";
import * as courses from "../controllers/adminCoursesController.js";
import * as quiz from "../controllers/adminQuizController.js";
import * as jobs from "../controllers/adminJobsController.js";
import * as unis from "../controllers/adminUniversitiesController.js";
import * as zscore from "../controllers/adminZScoreController.js";
import * as users from "../controllers/adminUsersController.js";

const router = Router();
const csvUpload = multer({ storage: multer.memoryStorage() });

// ── Public ──
router.post("/login", login);
router.post("/seed-superadmin", seedSuperadmin);

// ── All routes below require admin auth ──
router.use(requireAdmin);

// Image upload (reusable)
router.post("/upload-image", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No image file provided" });
  const url = `/uploads/${req.file.filename}`;
  res.json({ data: { url, filename: req.file.filename }, message: "Image uploaded" });
});

// Dashboard
router.get("/stats", getStats);

// Careers
router.get("/careers", careers.listCareers);
router.post("/careers", careers.createCareer);
router.get("/careers/:id", careers.getCareer);
router.put("/careers/:id", careers.updateCareer);
router.delete("/careers/:id", careers.deleteCareer);

// Courses
router.get("/courses", courses.listCourses);
router.post("/courses", courses.createCourse);
router.get("/courses/:id", courses.getCourse);
router.put("/courses/:id", courses.updateCourse);
router.delete("/courses/:id", courses.deleteCourse);

// Quiz Questions
router.get("/quizzes/questions", quiz.listQuestions);
router.post("/quizzes/questions", quiz.createQuestion);
router.put("/quizzes/questions/:id", quiz.updateQuestion);
router.delete("/quizzes/questions/:id", quiz.deleteQuestion);

// Jobs
router.get("/jobs", jobs.listJobs);
router.post("/jobs", jobs.createJob);
router.get("/jobs/:id", jobs.getJob);
router.put("/jobs/:id", jobs.updateJob);
router.delete("/jobs/:id", jobs.deleteJob);

// Universities
router.get("/universities", unis.listUniversities);
router.post("/universities", unis.createUniversity);
router.put("/universities/:id", unis.updateUniversity);
router.delete("/universities/:id", unis.deleteUniversity);

// Degree Programs
router.get("/programs", unis.listPrograms);
router.post("/programs", unis.createProgram);
router.put("/programs/:id", unis.updateProgram);
router.delete("/programs/:id", unis.deleteProgram);

// Z-Score
router.get("/zscore", zscore.listZScores);
router.post("/zscore", zscore.createZScore);
router.put("/zscore/:id", zscore.updateZScore);
router.delete("/zscore/:id", zscore.deleteZScore);
router.post("/zscore/upload", csvUpload.single("file"), zscore.uploadCSV);

// Users
router.get("/users", users.listUsers);
router.get("/users/:id", users.getUser);
router.put("/users/:id", users.updateUser);
router.delete("/users/:id", users.deleteUser);

export default router;
