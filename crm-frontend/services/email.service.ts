import { sendMail } from "@/lib/mail";

export const sendOTPEmail = async (
  email: string,
  otp: string
) => {
  await sendMail(
    email,
    "Email Verification",
    `
      <h2>Email Verification</h2>

      <h3>Your OTP is ${otp}</h3>

      <p>This OTP expires in 10 minutes.</p>
    `
  );
};