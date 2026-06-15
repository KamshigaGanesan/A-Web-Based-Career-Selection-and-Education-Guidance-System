import mongoose from "mongoose";

const eligibilityResultSchema = new mongoose.Schema(
  {
    degreeProgramId: { type: mongoose.Schema.Types.ObjectId, ref: "DegreeProgram" },
    universityId: { type: mongoose.Schema.Types.ObjectId, ref: "University" },
    programName: String,
    universityName: String,
    latestCutoff: Number,
    diff: Number,
    probabilityPercent: Number,
    probabilityLabel: { type: String, enum: ["High", "Medium", "Low"] },
    cutoffs3Years: [
      {
        year: Number,
        cutoffZScore: Number,
      },
    ],
  },
  { _id: false }
);

const eligibilityCheckSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  stream: { type: String, required: true },
  district: { type: String, required: true },
  zScore: { type: Number, required: true },
  year: { type: Number, required: true },
  results: [eligibilityResultSchema],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("EligibilityCheck", eligibilityCheckSchema);
