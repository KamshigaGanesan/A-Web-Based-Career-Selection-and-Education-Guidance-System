import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const alternativePathSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    provider: { type: String, required: true, trim: true },
    type: {
      type: String,
      required: true,
      enum: ["private", "diploma", "vocational", "foreign", "foundation"],
    },
    streamTags: [{ type: String, trim: true }],
    districtAvailability: [{ type: String, trim: true }],
    durationMonths: { type: Number, required: true },
    feesLKR: { type: Number, required: true },
    entryRequirements: { type: String },
    description: { type: String },
    pros: [{ type: String }],
    cons: [{ type: String }],
    applyLink: { type: String },
    careerTags: [{ type: String, trim: true }],
    careerIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Career" }],
    ratingAvg: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    reviews: [reviewSchema],
  },
  { timestamps: true }
);

alternativePathSchema.index({ type: 1 });
alternativePathSchema.index({ streamTags: 1 });
alternativePathSchema.index({ careerTags: 1 });
alternativePathSchema.index({ feesLKR: 1 });

export const AlternativePath = mongoose.model("AlternativePath", alternativePathSchema);
