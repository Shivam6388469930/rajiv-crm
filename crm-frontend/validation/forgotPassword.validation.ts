export const validateForgotPassword = (body: any) => {
  const { email } = body;

  if (!email) {
    return "Email is required";
  }

  if (!/\S+@\S+\.\S+/.test(email)) {
    return "Invalid email";
  }

  return null;
};