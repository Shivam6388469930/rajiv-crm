import { NextRequest } from "next/server";
import connectDB from "@/lib/db";

import { verifyOTP } from "@/services/otp.service";
import { success, error } from "@/utils/sendResponse";
import users from "@/models/users";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { email, otp } = await req.json();

    await verifyOTP(email, otp, "EMAIL_VERIFY");

    await users.updateOne(
      { email },
      {
        emailVerified: true,
      }
    );

    return success("Email verified");
  } catch (err: any) {
    return error(err.message);
  }
}