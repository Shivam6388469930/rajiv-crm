
import OTP from "@/models/OTP";
import { generateOTP } from "@/utils/generateOTP";

export const createOTP = async (
  email: string,
  type: "EMAIL_VERIFY" | "PASSWORD_RESET"
) => {
  await OTP.deleteMany({ email, type });

  const otp = generateOTP();

  const expiresAt = new Date(
    Date.now() + 10 * 60 * 1000
  );

  await OTP.create({
    email,
    otp,
    type,
    expiresAt,
  });

  return otp;
};

export const verifyOTP = async (
  email: string,
  otp: string,
  type: string
) => {
  const record = await OTP.findOne({
    email,
    otp,
    type,
  });

  if (!record) {
    throw new Error("Invalid OTP");
  }

  if (record.expiresAt < new Date()) {
    throw new Error("OTP Expired");
  }

  await OTP.deleteOne({
    _id: record._id,
  });

  return true;
};