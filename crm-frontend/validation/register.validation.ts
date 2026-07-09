export const validateRegister = (body: any) => {
  const { name, email, password } = body;

  if (!name || !email || !password) {
    return "All fields are required";
  }

  if (!/\S+@\S+\.\S+/.test(email)) {
    return "Invalid email";
  }

  if (password.length < 6) {
    return "Password must be at least 6 characters";
  }

  return null;
};