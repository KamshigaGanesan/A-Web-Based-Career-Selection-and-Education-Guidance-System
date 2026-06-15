import Career from "../models/Career.js";
import {
  parsePagination,
  buildSearchFilter,
  formatResponse,
} from "../utils/pagination.js";

export async function listCareers(req, res) {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const searchFilter = buildSearchFilter(req.query.search, [
      "title",
      "description",
    ]);
    const filter = { ...searchFilter };

    const [rows, total] = await Promise.all([
      Career.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Career.countDocuments(filter),
    ]);

    res.json(
      formatResponse(rows, { page, limit, total, pages: Math.ceil(total / limit) })
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

export async function getCareer(req, res) {
  try {
    const doc = await Career.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Career not found" });
    res.json(formatResponse(doc));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

export async function createCareer(req, res) {
  try {
    const doc = await Career.create(req.body);
    res.status(201).json(formatResponse(doc, {}, "Career created"));
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res.status(400).json({ message: "Career with this title/slug already exists" });
    }
    res.status(400).json({ message: err.message });
  }
}

export async function updateCareer(req, res) {
  try {
    const doc = await Career.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) return res.status(404).json({ message: "Career not found" });
    res.json(formatResponse(doc, {}, "Career updated"));
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
}

export async function deleteCareer(req, res) {
  try {
    const doc = await Career.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!doc) return res.status(404).json({ message: "Career not found" });
    res.json(formatResponse(doc, {}, "Career deactivated"));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}
