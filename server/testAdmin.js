import dotenv from "dotenv";
import mongoose from "mongoose";
import Admin from "./src/models/Admin.js";

dotenv.config();

const testUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");

    const email = "vipooshan9@gmail.com";
    const password = "vipoo";

    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) {
      console.log("Admin not found in DB!");
      process.exit(0);
    }
    
    console.log("Admin found:", { email: admin.email, isActive: admin.isActive, role: admin.role, passwordHash: admin.passwordHash });
    
    const match = await admin.comparePassword(password);
    console.log("Password match:", match);
    
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
};

testUser();
