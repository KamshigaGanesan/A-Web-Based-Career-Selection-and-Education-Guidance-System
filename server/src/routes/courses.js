import { Router } from "express";
import { Course } from "../models/Course.js";
import { requireAuth } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = Router();

// Create a course (authenticated)
router.post("/", requireAuth, upload.single("image"), async (req, res, next) => {
  try {
    const { name, description, duration, fees, category } = req.body;

    if (!name || !description || !duration || !fees || !category) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const course = await Course.create({
      name,
      description,
      duration,
      fees,
      category,
      image: req.file ? `/uploads/${req.file.filename}` : null,
      createdBy: req.user.sub,
    });

    res.status(201).json(course);
  } catch (err) {
    next(err);
  }
});

// List all courses
router.get("/", async (_req, res, next) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 }).lean();
    res.json(courses);
  } catch (err) {
    next(err);
  }
});

// Get single course
router.get("/:id", async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id).lean();
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.json(course);
  } catch (err) {
    next(err);
  }
});

export default router;
