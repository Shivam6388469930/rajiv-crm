// app/api/auth/reset-password/route.ts
import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import users from "@/models/users";
import { hashPassword } from "@/utils/hash";
import { verifyOTP } from "@/services/otp.service";
import { success, error } from "@/utils/sendResponse";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { email, otp, newPassword } = await req.json();

    if (!email || !otp || !newPassword) {
      return error("Email, OTP, and new password are required");
    }

    if (newPassword.length < 8) {
      return error("Password must be at least 8 characters");
    }

    // Verify the OTP first
    await verifyOTP(email, otp, "PASSWORD_RESET");

    const hashedPassword = await hashPassword(newPassword);

    await users.updateOne({ email }, { password: hashedPassword });

    return success("Password updated successfully");
  } catch (err: any) {
    return error(err.message);
  }
}
