import mongoose from "mongoose";

const dbUri = process.env.MONGODB_URI as string;


export async function register() {
  console.log("Connecting to database:", dbUri);
  await mongoose.connect(dbUri);
}