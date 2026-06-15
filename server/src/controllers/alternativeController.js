import { AlternativePath } from "../models/AlternativePath.js";

export async function getAlternatives(req, res, next) {
  try {
    const {
      type,
      minFee,
      maxFee,
      minDuration,
      maxDuration,
      stream,
      district,
      search,
      page = 1,
      limit = 12,
    } = req.query;

    const filter = {};

    if (type) filter.type = type;

    if (minFee || maxFee) {
      filter.feesLKR = {};
      if (minFee) filter.feesLKR.$gte = Number(minFee);
      if (maxFee) filter.feesLKR.$lte = Number(maxFee);
    }

    if (minDuration || maxDuration) {
      filter.durationMonths = {};
      if (minDuration) filter.durationMonths.$gte = Number(minDuration);
      if (maxDuration) filter.durationMonths.$lte = Number(maxDuration);
    }

    if (stream) filter.streamTags = { $in: stream.split(",") };
    if (district) filter.districtAvailability = { $in: [district] };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { provider: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { careerTags: { $regex: search, $options: "i" } },
      ];
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(50, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [paths, total] = await Promise.all([
      AlternativePath.find(filter)
        .sort({ ratingAvg: -1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      AlternativePath.countDocuments(filter),
    ]);

    res.json({
      paths,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    next(err);
  }
}

export async function getAlternativeById(req, res, next) {
  try {
    const path = await AlternativePath.findById(req.params.id).lean();
    if (!path) return res.status(404).json({ message: "Alternative path not found" });
    res.json(path);
  } catch (err) {
    next(err);
  }
}

export async function getAlternativesByType(req, res, next) {
  try {
    const { type } = req.params;
    const validTypes = ["private", "diploma", "vocational", "foreign", "foundation"];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ message: `Invalid type. Must be one of: ${validTypes.join(", ")}` });
    }
    const paths = await AlternativePath.find({ type }).sort({ ratingAvg: -1 }).lean();
    res.json(paths);
  } catch (err) {
    next(err);
  }
}

export async function addReview(req, res, next) {
  try {
    const { userId, name, rating, comment } = req.body;

    if (!name || !rating) {
      return res.status(400).json({ message: "name and rating are required" });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "rating must be between 1 and 5" });
    }

    const altPath = await AlternativePath.findById(req.params.id);
    if (!altPath) return res.status(404).json({ message: "Alternative path not found" });

    altPath.reviews.push({ userId, name, rating, comment, createdAt: new Date() });

    const totalRating = altPath.reviews.reduce((sum, r) => sum + r.rating, 0);
    altPath.ratingCount = altPath.reviews.length;
    altPath.ratingAvg = Math.round((totalRating / altPath.ratingCount) * 10) / 10;

    await altPath.save();

    res.status(201).json({
      message: "Review added",
      ratingAvg: altPath.ratingAvg,
      ratingCount: altPath.ratingCount,
      review: altPath.reviews[altPath.reviews.length - 1],
    });
  } catch (err) {
    next(err);
  }
}
