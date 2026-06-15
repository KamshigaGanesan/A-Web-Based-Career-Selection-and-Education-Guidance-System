import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    stream: {
      type: String,
      enum: ["Maths", "Bio", "Commerce", "Arts", "Tech"],
      required: true,
    },
    district: { type: String, required: true, trim: true },
    zScore: { type: Number, required: true },
    year: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Student", studentSchema);
