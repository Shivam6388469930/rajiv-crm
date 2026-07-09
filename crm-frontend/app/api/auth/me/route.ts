import { NextRequest } from "next/server";
import connectDB from "@/lib/db";

import { verifyToken } from "@/lib/jwt";
import { success, error } from "@/utils/sendResponse";
import users from "@/models/users";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const authHeader = req.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return error("Unauthorized", 401);
    }

    const token = authHeader.split(" ")[1];

    const payload: any = verifyToken(token);

    const user = await users.findById(payload.id).select("-password");

    if (!user) {
      return error("User not found", 404);
    }

    return success("Profile fetched", user);
  } catch {
    return error("Unauthorized", 401);
  }
}