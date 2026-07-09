import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { login } from "@/services/auth.service";
import { createTokens } from "@/services/token.service";
import { success, error } from "@/utils/sendResponse";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { email, password } = await req.json();

    const user = await login(email, password);

    const tokens = createTokens(user._id.toString());

    return success("Login successful", {
      user,
      ...tokens,
    });
  } catch (err: any) {
    return error(err.message, 401);
  }
}