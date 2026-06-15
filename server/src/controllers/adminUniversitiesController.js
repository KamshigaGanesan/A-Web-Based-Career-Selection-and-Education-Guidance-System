import University from "../models/University.js";
import DegreeProgram from "../models/DegreeProgram.js";
import {
  parsePagination,
  buildSearchFilter,
  formatResponse,
} from "../utils/pagination.js";

// ── Universities ──

export async function listUniversities(req, res) {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const searchFilter = buildSearchFilter(req.query.search, ["name", "code"]);
    const filter = { ...searchFilter };

    const [rows, total] = await Promise.all([
      University.find(filter).sort({ name: 1 }).skip(skip).limit(limit),
      University.countDocuments(filter),
    ]);

    res.json(
      formatResponse(rows, { page, limit, total, pages: Math.ceil(total / limit) })
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

export async function createUniversity(req, res) {
  try {
    const doc = await University.create(req.body);
    res.status(201).json(formatResponse(doc, {}, "University created"));
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res.status(400).json({ message: "University name or code already exists" });
    }
    res.status(400).json({ message: err.message });
  }
}

export async function updateUniversity(req, res) {
  try {
    const doc = await University.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) return res.status(404).json({ message: "University not found" });
    res.json(formatResponse(doc, {}, "University updated"));
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
}

export async function deleteUniversity(req, res) {
  try {
    const doc = await University.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ message: "University not found" });
    res.json(formatResponse(doc, {}, "University deleted"));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

// ── Degree Programs ──

export async function listPrograms(req, res) {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const searchFilter = buildSearchFilter(req.query.search, ["name", "code"]);
    const filter = { ...searchFilter };
    if (req.query.universityId) filter.universityId = req.query.universityId;
    if (req.query.stream) filter.stream = req.query.stream;

    const [rows, total] = await Promise.all([
      DegreeProgram.find(filter)
        .populate("universityId", "name code")
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit),
      DegreeProgram.countDocuments(filter),
    ]);

    res.json(
      formatResponse(rows, { page, limit, total, pages: Math.ceil(total / limit) })
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

export async function createProgram(req, res) {
  try {
    const doc = await DegreeProgram.create(req.body);
    res.status(201).json(formatResponse(doc, {}, "Program created"));
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res.status(400).json({ message: "Program code already exists" });
    }
    res.status(400).json({ message: err.message });
  }
}

export async function updateProgram(req, res) {
  try {
    const doc = await DegreeProgram.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) return res.status(404).json({ message: "Program not found" });
    res.json(formatResponse(doc, {}, "Program updated"));
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
}

export async function deleteProgram(req, res) {
  try {
    const doc = await DegreeProgram.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ message: "Program not found" });
    res.json(formatResponse(doc, {}, "Program deleted"));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}
