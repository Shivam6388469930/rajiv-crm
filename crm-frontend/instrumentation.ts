import connectDB from "@/lib/db";

export async function register() {
  console.log("Starting App...");

  await connectDB();
}