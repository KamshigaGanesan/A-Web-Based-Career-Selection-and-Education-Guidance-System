import mongoose from "mongoose";

const degreeProgramSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  universityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "University",
    required: true,
  },
  stream: {
    type: String,
    enum: ["Maths", "Bio", "Commerce", "Arts", "Tech"],
    required: true,
  },
  durationYears: { type: Number, required: true },
  degreeType: { type: String, default: "BSc", trim: true },
  careerTags: [{ type: String, trim: true }],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("DegreeProgram", degreeProgramSchema);
