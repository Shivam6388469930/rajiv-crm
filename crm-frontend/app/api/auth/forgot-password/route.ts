import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { createOTP } from "@/services/otp.service";
import { sendOTPEmail } from "@/services/email.service";
import { success } from "@/utils/sendResponse";

export async function POST(req: NextRequest) {
  await connectDB();

  const { email } = await req.json();

  const otp = await createOTP(email, "PASSWORD_RESET");

  await sendOTPEmail(email, otp);

  return success("Password reset OTP sent");
}