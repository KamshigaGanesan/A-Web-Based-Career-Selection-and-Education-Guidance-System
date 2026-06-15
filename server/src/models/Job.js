import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  company: { type: String, required: true, trim: true },
  type: {
    type: String,
    enum: ["internship", "job"],
    default: "internship",
  },
  location: { type: String, trim: true },
  workMode: {
    type: String,
    enum: ["onsite", "remote", "hybrid"],
    default: "onsite",
  },
  salary: { type: String },
  description: { type: String, required: true },
  applyLink: { type: String, trim: true },
  deadline: { type: Date },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

jobSchema.index({ title: "text", company: "text", description: "text" });
jobSchema.index({ type: 1 });
jobSchema.index({ isActive: 1 });

const Job = mongoose.model("Job", jobSchema);
export default Job;
