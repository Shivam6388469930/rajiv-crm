export const validateResetPassword = (body: any) => {
  const { email, otp, password } = body;

  if (!email || !otp || !password) {
    return "All fields are required";
  }

  if (password.length < 6) {
    return "Password must be at least 6 characters";
  }

  return null;
};