import mongoose from 'mongoose';
import 'dotenv/config';
const MONGODB_URI = process.env.M as string;

if (!MONGODB_URI) throw new Error("MONGODB_URI not found in env");

export const connectDB = async () => {
  if (mongoose.connections.length > 0 && mongoose.connections[0].readyState) return;

  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected to MongoDB");
};
