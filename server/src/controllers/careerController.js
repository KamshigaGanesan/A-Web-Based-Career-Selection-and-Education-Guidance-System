import Career from "../models/Career.js";
import SavedCareer from "../models/SavedCareer.js";
import mongoose from "mongoose";

// GET /api/careers
export async function getCareers(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter = { isActive: true };

    if (req.query.stream) {
      filter.streamTags = req.query.stream;
    }
    if (req.query.demand) {
      filter.demandLevel = req.query.demand;
    }
    if (req.query.minSalary || req.query.maxSalary) {
      const min = parseInt(req.query.minSalary) || 0;
      const max = parseInt(req.query.maxSalary) || Number.MAX_SAFE_INTEGER;
      filter.salaryMaxLKR = { $gte: min };
      filter.salaryMinLKR = { $lte: max };
    }

    let sortObj = { createdAt: -1 };
    switch (req.query.sort) {
      case "salaryAsc":
        sortObj = { salaryMinLKR: 1 };
        break;
      case "salaryDesc":
        sortObj = { salaryMaxLKR: -1 };
        break;
      case "demand":
        sortObj = { demandLevel: 1 };
        break;
      case "title":
        sortObj = { title: 1 };
        break;
    }

    const [data, total] = await Promise.all([
      Career.find(filter).sort(sortObj).skip(skip).limit(limit).lean(),
      Career.countDocuments(filter),
    ]);

    res.json({
      data,
      meta: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("getCareers error:", err);
    res.status(500).json({ message: "Server error fetching careers" });
  }
}

// GET /api/careers/search/:query
export async function searchCareers(req, res) {
  try {
    const query = req.params.query?.trim();
    if (!query) return res.status(400).json({ message: "Search query is required" });

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    let filter = { isActive: true };
    let sortObj = { score: { $meta: "textScore" } };

    try {
      filter.$text = { $search: query };
      const testCount = await Career.countDocuments(filter);
      if (testCount === 0) throw new Error("no text results");
    } catch {
      delete filter.$text;
      const regex = new RegExp(query, "i");
      filter.$or = [
        { title: regex },
        { description: regex },
        { requiredSkills: regex },
      ];
      sortObj = { title: 1 };
    }

    const [data, total] = await Promise.all([
      filter.$text
        ? Career.find(filter, { score: { $meta: "textScore" } }).sort(sortObj).skip(skip).limit(limit).lean()
        : Career.find(filter).sort(sortObj).skip(skip).limit(limit).lean(),
      Career.countDocuments(filter),
    ]);

    res.json({
      data,
      meta: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("searchCareers error:", err);
    res.status(500).json({ message: "Server error searching careers" });
  }
}

// GET /api/careers/:id
export async function getCareerById(req, res) {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid career ID" });
    }

    const career = await Career.findOne({ _id: req.params.id, isActive: true }).lean();
    if (!career) return res.status(404).json({ message: "Career not found" });

    res.json(career);
  } catch (err) {
    console.error("getCareerById error:", err);
    res.status(500).json({ message: "Server error fetching career" });
  }
}

// GET /api/careers/:id/related
export async function getRelatedCareers(req, res) {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid career ID" });
    }

    const career = await Career.findOne({ _id: req.params.id, isActive: true }).lean();
    if (!career) return res.status(404).json({ message: "Career not found" });

    if (career.relatedCareerIds?.length) {
      const related = await Career.find({
        _id: { $in: career.relatedCareerIds },
        isActive: true,
      })
        .limit(6)
        .lean();
      return res.json(related);
    }

    const related = await Career.aggregate([
      { $match: { _id: { $ne: career._id }, isActive: true } },
      {
        $addFields: {
          relevance: {
            $add: [
              { $size: { $setIntersection: ["$streamTags", career.streamTags] } },
              { $size: { $setIntersection: ["$requiredSkills", career.requiredSkills] } },
              { $cond: [{ $eq: ["$demandLevel", career.demandLevel] }, 2, 0] },
            ],
          },
        },
      },
      { $sort: { relevance: -1 } },
      { $limit: 6 },
      { $project: { relevance: 0 } },
    ]);

    res.json(related);
  } catch (err) {
    console.error("getRelatedCareers error:", err);
    res.status(500).json({ message: "Server error fetching related careers" });
  }
}

// POST /api/careers/compare
export async function compareCareers(req, res) {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length < 2 || ids.length > 3) {
      return res.status(400).json({ message: "Provide 2 or 3 career IDs to compare" });
    }

    const valid = ids.every((id) => mongoose.Types.ObjectId.isValid(id));
    if (!valid) return res.status(400).json({ message: "One or more invalid career IDs" });

    const careers = await Career.find({ _id: { $in: ids }, isActive: true }).lean();
    if (careers.length !== ids.length) {
      return res.status(404).json({ message: "One or more careers not found" });
    }

    res.json(careers);
  } catch (err) {
    console.error("compareCareers error:", err);
    res.status(500).json({ message: "Server error comparing careers" });
  }
}

// POST /api/careers/:id/save
export async function saveCareer(req, res) {
  try {
    const { userId } = req.body;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Valid userId is required" });
    }
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid career ID" });
    }

    const career = await Career.findOne({ _id: req.params.id, isActive: true });
    if (!career) return res.status(404).json({ message: "Career not found" });

    const existing = await SavedCareer.findOne({ userId, careerId: req.params.id });
    if (existing) return res.status(409).json({ message: "Career already saved" });

    const saved = await SavedCareer.create({ userId, careerId: req.params.id });
    res.status(201).json(saved);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "Career already saved" });
    }
    console.error("saveCareer error:", err);
    res.status(500).json({ message: "Server error saving career" });
  }
}

// DELETE /api/careers/:id/save?userId=...
export async function unsaveCareer(req, res) {
  try {
    const userId = req.query.userId;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Valid userId query param is required" });
    }
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid career ID" });
    }

    const result = await SavedCareer.findOneAndDelete({ userId, careerId: req.params.id });
    if (!result) return res.status(404).json({ message: "Saved career not found" });

    res.json({ message: "Career unsaved" });
  } catch (err) {
    console.error("unsaveCareer error:", err);
    res.status(500).json({ message: "Server error unsaving career" });
  }
}

// GET /api/careers/saved/:userId
export async function getSavedCareers(req, res) {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    const saved = await SavedCareer.find({ userId })
      .populate({ path: "careerId", match: { isActive: true } })
      .sort({ createdAt: -1 })
      .lean();

    const careers = saved.filter((s) => s.careerId).map((s) => s.careerId);
    res.json(careers);
  } catch (err) {
    console.error("getSavedCareers error:", err);
    res.status(500).json({ message: "Server error fetching saved careers" });
  }
}
