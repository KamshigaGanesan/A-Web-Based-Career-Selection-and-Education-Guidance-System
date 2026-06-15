import Student from "../models/Student.js";
import DegreeProgram from "../models/DegreeProgram.js";
import ZScoreTable from "../models/ZScoreTable.js";
import EligibilityCheck from "../models/EligibilityCheck.js";
import University from "../models/University.js";

function calculateProbability(zScore, latestCutoff) {
  const diff = +(zScore - latestCutoff).toFixed(4);

  let probabilityPercent;
  if (diff >= 0.2) probabilityPercent = 95;
  else if (diff >= 0.1) probabilityPercent = 85;
  else if (diff >= 0.0) probabilityPercent = 70;
  else if (diff >= -0.05) probabilityPercent = 55;
  else if (diff >= -0.1) probabilityPercent = 40;
  else if (diff >= -0.2) probabilityPercent = 20;
  else probabilityPercent = 5;

  let probabilityLabel;
  if (probabilityPercent >= 80) probabilityLabel = "High";
  else if (probabilityPercent >= 50) probabilityLabel = "Medium";
  else probabilityLabel = "Low";

  return { probabilityPercent, probabilityLabel, diff };
}

export async function upsertStudent(req, res) {
  try {
    const { userId, fullName, email, stream, district, zScore, year } = req.body;

    if (!userId || !fullName || !email || !stream || !district || zScore == null || !year) {
      return res.status(400).json({ error: "All fields are required." });
    }
    const z = Number(zScore);
    if (Number.isNaN(z) || z < 0 || z > 4) {
      return res.status(400).json({ error: "zScore must be a number between 0.0 and 4.0." });
    }

    const student = await Student.findOneAndUpdate(
      { userId },
      { fullName, email, stream, district, zScore: z, year },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({ success: true, student });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function checkEligibility(req, res) {
  try {
    const { userId, stream, district, zScore, year, filters } = req.body;

    if (!stream || !district || zScore == null || !year) {
      return res.status(400).json({ error: "stream, district, zScore, and year are required." });
    }
    const z = Number(zScore);
    if (Number.isNaN(z) || z < 0 || z > 4) {
      return res.status(400).json({ error: "zScore must be a number between 0.0 and 4.0." });
    }

    const filterStream = filters?.stream || stream;
    const filterDistrict = filters?.district || district;

    const programs = await DegreeProgram.find({
      stream: filterStream,
      isActive: true,
    }).populate("universityId");

    const results = [];

    for (const program of programs) {
      const cutoffs = await ZScoreTable.find({
        degreeProgramId: program._id,
        district: filterDistrict,
        year: { $in: [2021, 2022, 2023] },
      }).sort({ year: 1 });

      if (cutoffs.length === 0) continue;

      const cutoffs3Years = cutoffs.map((c) => ({
        year: c.year,
        cutoffZScore: c.cutoffZScore,
      }));

      const requestYear = Number(year);
      let latestEntry = cutoffs.find((c) => c.year === requestYear);
      if (!latestEntry) latestEntry = cutoffs[cutoffs.length - 1];
      const latestCutoff = latestEntry.cutoffZScore;

      const { probabilityPercent, probabilityLabel, diff } = calculateProbability(z, latestCutoff);

      if (diff >= -0.3) {
        results.push({
          degreeProgramId: program._id,
          universityId: program.universityId._id,
          programName: program.name,
          universityName: program.universityId.name,
          universityCode: program.universityId.code,
          degreeType: program.degreeType,
          durationYears: program.durationYears,
          careerTags: program.careerTags,
          latestCutoff,
          diff: +diff.toFixed(4),
          probabilityPercent,
          probabilityLabel,
          cutoffs3Years,
        });
      }
    }

    results.sort((a, b) => {
      if (b.probabilityPercent !== a.probabilityPercent)
        return b.probabilityPercent - a.probabilityPercent;
      return b.diff - a.diff;
    });

    if (userId) {
      await EligibilityCheck.create({
        userId,
        stream: filterStream,
        district: filterDistrict,
        zScore: z,
        year,
        results: results.map((r) => ({
          degreeProgramId: r.degreeProgramId,
          universityId: r.universityId,
          programName: r.programName,
          universityName: r.universityName,
          latestCutoff: r.latestCutoff,
          diff: r.diff,
          probabilityPercent: r.probabilityPercent,
          probabilityLabel: r.probabilityLabel,
          cutoffs3Years: r.cutoffs3Years,
        })),
      });
    }

    res.json({
      input: { stream: filterStream, district: filterDistrict, zScore: z, year },
      results,
      meta: { count: results.length },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getEligibilityHistory(req, res) {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ error: "userId is required." });

    const history = await EligibilityCheck.find({ userId }).sort({ createdAt: -1 });
    res.json({ history });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getTrendData(req, res) {
  try {
    const { degreeProgramId, district } = req.query;
    if (!degreeProgramId || !district) {
      return res.status(400).json({ error: "degreeProgramId and district are required." });
    }

    const cutoffs = await ZScoreTable.find({
      degreeProgramId,
      district,
      year: { $in: [2021, 2022, 2023] },
    }).sort({ year: 1 });

    const program = await DegreeProgram.findById(degreeProgramId).populate("universityId");

    res.json({
      program: program
        ? { name: program.name, university: program.universityId?.name }
        : null,
      district,
      cutoffs: cutoffs.map((c) => ({ year: c.year, cutoffZScore: c.cutoffZScore })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
