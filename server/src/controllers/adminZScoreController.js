import { Readable } from "node:stream";
import ZScoreTable from "../models/ZScoreTable.js";
import University from "../models/University.js";
import DegreeProgram from "../models/DegreeProgram.js";
import {
  parsePagination,
  formatResponse,
} from "../utils/pagination.js";

export async function listZScores(req, res) {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const filter = {};
    if (req.query.year) filter.year = Number(req.query.year);
    if (req.query.district) filter.district = new RegExp(req.query.district, "i");
    if (req.query.programId) filter.degreeProgramId = req.query.programId;

    const [rows, total] = await Promise.all([
      ZScoreTable.find(filter)
        .populate("degreeProgramId", "name code stream")
        .populate("universityId", "name code")
        .sort({ year: -1, district: 1 })
        .skip(skip)
        .limit(limit),
      ZScoreTable.countDocuments(filter),
    ]);

    res.json(
      formatResponse(rows, { page, limit, total, pages: Math.ceil(total / limit) })
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

export async function createZScore(req, res) {
  try {
    const doc = await ZScoreTable.create(req.body);
    res.status(201).json(formatResponse(doc, {}, "Z-Score entry created"));
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res.status(400).json({ message: "Duplicate entry for program/year/district" });
    }
    res.status(400).json({ message: err.message });
  }
}

export async function updateZScore(req, res) {
  try {
    const doc = await ZScoreTable.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) return res.status(404).json({ message: "Z-Score entry not found" });
    res.json(formatResponse(doc, {}, "Z-Score entry updated"));
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
}

export async function deleteZScore(req, res) {
  try {
    const doc = await ZScoreTable.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ message: "Z-Score entry not found" });
    res.json(formatResponse(doc, {}, "Z-Score entry deleted"));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

export async function uploadCSV(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No CSV file uploaded" });
    }

    const { parse } = await import("csv-parse/sync");
    const records = parse(req.file.buffer.toString("utf-8"), {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    const universityCache = {};
    const programCache = {};
    const summary = { inserted: 0, updated: 0, failed: 0, errors: [] };

    for (let i = 0; i < records.length; i++) {
      const row = records[i];
      const rowNum = i + 2; // +2 for header + 0-index
      try {
        const { year, district, universityCode, programCode, cutoffZScore } = row;
        if (!year || !district || !universityCode || !programCode || !cutoffZScore) {
          summary.failed++;
          summary.errors.push(`Row ${rowNum}: missing required fields`);
          continue;
        }

        // Resolve university
        if (!universityCache[universityCode]) {
          universityCache[universityCode] = await University.findOne({
            code: universityCode.toUpperCase(),
          });
        }
        const uni = universityCache[universityCode];
        if (!uni) {
          summary.failed++;
          summary.errors.push(`Row ${rowNum}: university '${universityCode}' not found`);
          continue;
        }

        // Resolve program
        if (!programCache[programCode]) {
          programCache[programCode] = await DegreeProgram.findOne({
            code: programCode.toUpperCase(),
          });
        }
        const prog = programCache[programCode];
        if (!prog) {
          summary.failed++;
          summary.errors.push(`Row ${rowNum}: program '${programCode}' not found`);
          continue;
        }

        const result = await ZScoreTable.findOneAndUpdate(
          {
            degreeProgramId: prog._id,
            year: Number(year),
            district: district.trim(),
          },
          {
            degreeProgramId: prog._id,
            universityId: uni._id,
            year: Number(year),
            district: district.trim(),
            cutoffZScore: Number(cutoffZScore),
          },
          { upsert: true, new: true, rawResult: true }
        );

        if (result.lastErrorObject?.updatedExisting) {
          summary.updated++;
        } else {
          summary.inserted++;
        }
      } catch (rowErr) {
        summary.failed++;
        summary.errors.push(`Row ${rowNum}: ${rowErr.message}`);
      }
    }

    res.json(formatResponse(summary, {}, "CSV processed"));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "CSV processing error" });
  }
}
