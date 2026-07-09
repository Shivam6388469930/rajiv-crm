import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { register } from "@/services/auth.service";
import { success, error } from "@/utils/sendResponse";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();

    const user = await register(body);

    return success("Registration successful", user, 201);
  } catch (err: any) {
    return error(err.message);
  }
}