import mongoose from "mongoose";

const answerSchema = new mongoose.Schema(
  {
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: "QuizQuestion", required: true },
    selectedOptionIndex: { type: Number, required: true },
  },
  { _id: false }
);

const topCareerSchema = new mongoose.Schema(
  {
    careerTag: { type: String, required: true },
    score: { type: Number, required: true },
  },
  { _id: false }
);

const quizResultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  answers: { type: [answerSchema], required: true },
  scoreBreakdown: { type: Map, of: Number, default: {} },
  topCareers: { type: [topCareerSchema], default: [] },
  stream: { type: String },
  totalQuestions: { type: Number },
  createdAt: { type: Date, default: Date.now },
});

quizResultSchema.index({ userId: 1, createdAt: -1 });

export const QuizResult = mongoose.model("QuizResult", quizResultSchema);
