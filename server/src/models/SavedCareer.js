import mongoose from "mongoose";

const savedCareerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  careerId: { type: mongoose.Schema.Types.ObjectId, ref: "Career", required: true },
  createdAt: { type: Date, default: Date.now },
});

savedCareerSchema.index({ userId: 1, careerId: 1 }, { unique: true });

const SavedCareer = mongoose.model("SavedCareer", savedCareerSchema);
export default SavedCareer;
