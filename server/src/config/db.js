import dns from "node:dns";
import mongoose from "mongoose";

dns.setDefaultResultOrder("ipv4first");

export async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("MONGO_URI is not set");
  mongoose.set("strictQuery", true);
  try {
    await mongoose.connect(uri);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  }
}
