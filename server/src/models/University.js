import mongoose from "mongoose";

const universitySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  district: { type: String, required: true, trim: true },
  province: { type: String, trim: true },
  website: { type: String, trim: true },
  logoUrl: { type: String, trim: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("University", universitySchema);
