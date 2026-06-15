import mongoose from "mongoose";

const weightTagSchema = new mongoose.Schema(
  {
    tag: { type: String, required: true },
    value: { type: Number, required: true },
  },
  { _id: false }
);

const optionSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    weightTags: { type: [weightTagSchema], required: true },
  },
  { _id: false }
);

const quizQuestionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: { type: [optionSchema], required: true, validate: v => v.length >= 2 },
  stream: {
    type: String,
    enum: ["Maths", "Bio", "Commerce", "Arts", "Tech", "Common"],
    default: "Common",
  },
  category: { type: String },
  order: { type: Number, required: true },
  isActive: { type: Boolean, default: true },
});

quizQuestionSchema.index({ stream: 1, order: 1 });

export const QuizQuestion = mongoose.model("QuizQuestion", quizQuestionSchema);
