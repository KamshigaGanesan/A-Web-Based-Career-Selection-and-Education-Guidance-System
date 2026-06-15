import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String }, // only for local accounts
    authProvider: { type: String, enum: ["local", "google", "github"], default: "local" },
    googleId: { type: String },
    githubId: { type: String },
    githubUsername: { type: String },
    githubAccessToken: { type: String },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    githubNotificationEnabled: { type: Boolean, default: false },
    githubNotificationTime: { type: String, default: "09:00" } // HH:mm format
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
