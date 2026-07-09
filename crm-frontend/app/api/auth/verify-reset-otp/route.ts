import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { verifyOTP } from "@/services/otp.service";
import { success, error } from "@/utils/sendResponse";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { email, otp } = await req.json();

    await verifyOTP(email, otp, "PASSWORD_RESET");

    return success("OTP verified");
  } catch (err: any) {
    return error(err.message);
  }
}