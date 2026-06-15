import mongoose from "mongoose";

const githubNotificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    githubEventId: { type: String, required: true, unique: true },
    type: { type: String, required: true }, // e.g., 'PushEvent', 'PullRequestEvent'
    repoName: { type: String, required: true },
    message: { type: String },
    actor: { type: String },
    isEmailed: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export const GithubNotification = mongoose.model("GithubNotification", githubNotificationSchema);
