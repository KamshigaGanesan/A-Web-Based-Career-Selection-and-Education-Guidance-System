import mongoose from "mongoose";

const githubAnalysisSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    username: { type: String, required: true },
    profileData: { type: Object, required: true },
    stats: { type: Object, required: true },
    aiInsights: { type: Object, required: true },
    repoQuality: { type: Array, required: true },
    languageStats: { type: Array, required: true },
    chartData: { type: Object }
  },
  { timestamps: true }
);

export const GithubAnalysis = mongoose.model("GithubAnalysis", githubAnalysisSchema);
