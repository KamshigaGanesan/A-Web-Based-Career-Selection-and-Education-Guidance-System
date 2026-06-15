import Job from "../models/Job.js";
import {
  parsePagination,
  buildSearchFilter,
  formatResponse,
} from "../utils/pagination.js";

export async function listJobs(req, res) {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const searchFilter = buildSearchFilter(req.query.search, [
      "title",
      "company",
    ]);
    const filter = { ...searchFilter };
    if (req.query.type) filter.type = req.query.type;

    const [rows, total] = await Promise.all([
      Job.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Job.countDocuments(filter),
    ]);

    res.json(
      formatResponse(rows, { page, limit, total, pages: Math.ceil(total / limit) })
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

export async function getJob(req, res) {
  try {
    const doc = await Job.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Job not found" });
    res.json(formatResponse(doc));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

export async function createJob(req, res) {
  try {
    const doc = await Job.create(req.body);
    res.status(201).json(formatResponse(doc, {}, "Job created"));
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
}

export async function updateJob(req, res) {
  try {
    const doc = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) return res.status(404).json({ message: "Job not found" });
    res.json(formatResponse(doc, {}, "Job updated"));
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
}

export async function deleteJob(req, res) {
  try {
    const doc = await Job.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!doc) return res.status(404).json({ message: "Job not found" });
    res.json(formatResponse(doc, {}, "Job deactivated"));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}
