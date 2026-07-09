import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { createOTP } from "@/services/otp.service";
import { sendOTPEmail } from "@/services/email.service";
import { success, error } from "@/utils/sendResponse";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { email } = await req.json();

    const otp = await createOTP(email, "EMAIL_VERIFY");

    await sendOTPEmail(email, otp);

    return success("OTP sent");
  } catch (err: any) {
    return error(err.message);
  }
}