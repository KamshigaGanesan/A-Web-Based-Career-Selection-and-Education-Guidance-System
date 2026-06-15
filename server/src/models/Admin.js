import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const adminSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  passwordHash: { type: String, required: true },
  role: {
    type: String,
    enum: ["superadmin", "editor"],
    default: "editor",
  },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

adminSchema.pre("save", async function (next) {
  if (!this.isModified("passwordHash")) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  next();
});

adminSchema.methods.comparePassword = async function (plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

const Admin = mongoose.model("Admin", adminSchema);
export default Admin;
