export const validateLogin = (body: any) => {
  const { email, password } = body;

  if (!email || !password) {
    return "Email and password are required";
  }

  if (!/\S+@\S+\.\S+/.test(email)) {
    return "Invalid email";
  }

  return null;
};