import { Router } from "express";
import Job from "../models/Job.js";
import {
  parsePagination,
  buildSearchFilter,
  formatResponse,
} from "../utils/pagination.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const searchFilter = buildSearchFilter(req.query.search, [
      "title",
      "company",
      "description",
    ]);
    const filter = { isActive: true, ...searchFilter };
    if (req.query.type) filter.type = req.query.type;
    if (req.query.workMode) filter.workMode = req.query.workMode;

    const [rows, total] = await Promise.all([
      Job.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Job.countDocuments(filter),
    ]);

    res.json(
      formatResponse(rows, {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      })
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const doc = await Job.findOne({ _id: req.params.id, isActive: true });
    if (!doc) return res.status(404).json({ message: "Job not found" });
    res.json(formatResponse(doc));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
