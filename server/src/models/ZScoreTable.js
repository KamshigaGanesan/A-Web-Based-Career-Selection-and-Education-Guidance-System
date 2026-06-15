import mongoose from "mongoose";

const zScoreTableSchema = new mongoose.Schema({
  degreeProgramId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DegreeProgram",
    required: true,
  },
  universityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "University",
    required: true,
  },
  year: {
    type: Number,
    enum: [2021, 2022, 2023, 2024, 2025],
    required: true,
  },
  district: { type: String, required: true, trim: true },
  cutoffZScore: { type: Number, required: true },
});

zScoreTableSchema.index(
  { degreeProgramId: 1, year: 1, district: 1 },
  { unique: true }
);

export default mongoose.model("ZScoreTable", zScoreTableSchema);
