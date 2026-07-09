import mongoose from "mongoose";
import seedAdmin from "./seedAdmin";

const MONGODB_URI = process.env.MONGODB_URI!;

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = {
    conn: null,
    promise: null,
  };
}

export default async function connectDB() {
  if (cached.conn) return cached.conn;

  cached.promise = mongoose.connect(MONGODB_URI);

  cached.conn = await cached.promise;

  await seedAdmin(); // Runs only after a successful DB connection

  return cached.conn;
}