import { QuizQuestion } from "../models/QuizQuestion.js";
import {
  parsePagination,
  buildSearchFilter,
  formatResponse,
} from "../utils/pagination.js";

export async function listQuestions(req, res) {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const searchFilter = buildSearchFilter(req.query.search, ["questionText"]);
    const filter = { ...searchFilter };
    if (req.query.stream) filter.stream = req.query.stream;

    const [rows, total] = await Promise.all([
      QuizQuestion.find(filter).sort({ stream: 1, order: 1 }).skip(skip).limit(limit),
      QuizQuestion.countDocuments(filter),
    ]);

    res.json(
      formatResponse(rows, { page, limit, total, pages: Math.ceil(total / limit) })
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

export async function createQuestion(req, res) {
  try {
    const doc = await QuizQuestion.create(req.body);
    res.status(201).json(formatResponse(doc, {}, "Question created"));
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
}

export async function updateQuestion(req, res) {
  try {
    const doc = await QuizQuestion.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) return res.status(404).json({ message: "Question not found" });
    res.json(formatResponse(doc, {}, "Question updated"));
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
}

export async function deleteQuestion(req, res) {
  try {
    const doc = await QuizQuestion.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!doc) return res.status(404).json({ message: "Question not found" });
    res.json(formatResponse(doc, {}, "Question deactivated"));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}
