import { User } from "../models/User.js";
import {
  parsePagination,
  buildSearchFilter,
  formatResponse,
} from "../utils/pagination.js";

export async function listUsers(req, res) {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const searchFilter = buildSearchFilter(req.query.search, ["name", "email"]);
    const filter = { ...searchFilter };

    const [rows, total] = await Promise.all([
      User.find(filter)
        .select("-passwordHash")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter),
    ]);

    res.json(
      formatResponse(rows, { page, limit, total, pages: Math.ceil(total / limit) })
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

export async function getUser(req, res) {
  try {
    const doc = await User.findById(req.params.id).select("-passwordHash");
    if (!doc) return res.status(404).json({ message: "User not found" });
    res.json(formatResponse(doc));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

export async function updateUser(req, res) {
  try {
    const allowed = {};
    if (req.body.name !== undefined) allowed.name = req.body.name;
    if (req.body.isActive !== undefined) allowed.isActive = req.body.isActive;

    const doc = await User.findByIdAndUpdate(req.params.id, allowed, {
      new: true,
      runValidators: true,
    }).select("-passwordHash");
    if (!doc) return res.status(404).json({ message: "User not found" });
    res.json(formatResponse(doc, {}, "User updated"));
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
}

export async function deleteUser(req, res) {
  try {
    const doc = await User.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ message: "User not found" });
    res.json(formatResponse(null, {}, "User deleted"));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}
