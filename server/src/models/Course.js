import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    duration: { type: String, required: true },
    fees: { type: String, required: true },
    category: { type: String, required: true, trim: true },
    image: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export const Course = mongoose.model("Course", courseSchema);
