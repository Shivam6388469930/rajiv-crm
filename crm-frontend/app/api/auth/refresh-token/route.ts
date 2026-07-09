import { NextRequest } from "next/server";
import { verifyToken, generateToken } from "@/lib/jwt";
import { success, error } from "@/utils/sendResponse";

export async function POST(req: NextRequest) {
  try {
    const { refreshToken } = await req.json();

    const payload: any = verifyToken(refreshToken);

    const accessToken = generateToken({
      id: payload.id,
    });

    return success("Token refreshed", {
      accessToken,
    });
  } catch {
    return error("Invalid refresh token", 401);
  }
}