import { Course } from "../models/Course.js";
import {
  parsePagination,
  buildSearchFilter,
  formatResponse,
} from "../utils/pagination.js";

export async function listCourses(req, res) {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const searchFilter = buildSearchFilter(req.query.search, [
      "name",
      "category",
    ]);

    const [rows, total] = await Promise.all([
      Course.find(searchFilter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Course.countDocuments(searchFilter),
    ]);

    res.json(
      formatResponse(rows, { page, limit, total, pages: Math.ceil(total / limit) })
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

export async function getCourse(req, res) {
  try {
    const doc = await Course.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Course not found" });
    res.json(formatResponse(doc));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

export async function createCourse(req, res) {
  try {
    const doc = await Course.create(req.body);
    res.status(201).json(formatResponse(doc, {}, "Course created"));
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
}

export async function updateCourse(req, res) {
  try {
    const doc = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) return res.status(404).json({ message: "Course not found" });
    res.json(formatResponse(doc, {}, "Course updated"));
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
}

export async function deleteCourse(req, res) {
  try {
    const doc = await Course.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ message: "Course not found" });
    res.json(formatResponse(doc, {}, "Course deleted"));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}
