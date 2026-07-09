export const validateVerifyOtp = (body: any) => {
  const { email, otp } = body;

  if (!email || !otp) {
    return "Email and OTP are required";
  }

  if (otp.length !== 6) {
    return "OTP must be 6 digits";
  }

  return null;
};