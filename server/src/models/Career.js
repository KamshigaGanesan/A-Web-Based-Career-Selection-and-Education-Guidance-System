import mongoose from "mongoose";

const careerSchema = new mongoose.Schema({
  title: { type: String, required: true, unique: true, trim: true },
  slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
  description: { type: String, required: true },
  streamTags: {
    type: [String],
    required: true,
    validate: [arr => arr.length > 0, "At least one stream tag is required"],
  },
  salaryMinLKR: { type: Number, required: true, min: 0 },
  salaryMaxLKR: { type: Number, required: true, min: 0 },
  demandLevel: { type: String, enum: ["High", "Medium", "Low"], required: true },
  requiredSkills: {
    type: [String],
    required: true,
    validate: [arr => arr.length > 0, "At least one skill is required"],
  },
  educationPaths: [String],
  workEnvironment: String,
  imageUrl: { type: String, default: "" },
  relatedCareerIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Career" }],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

careerSchema.index({ title: "text", description: "text", requiredSkills: "text" });
careerSchema.index({ demandLevel: 1 });
careerSchema.index({ salaryMinLKR: 1, salaryMaxLKR: 1 });
careerSchema.index({ streamTags: 1 });

const Career = mongoose.model("Career", careerSchema);
export default Career;
