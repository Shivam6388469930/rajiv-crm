
import { hashPassword } from "@/utils/hash";
import { comparePassword } from "@/utils/compare";
import users from "@/models/users";

export const register = async (data: any) => {
  const exists = await users.findOne({
    email: data.email,
  });

  if (exists) {
    throw new Error("User already exists");
  }

  const password = await hashPassword(
    data.password
  );

  const user = await users.create({
    ...data,
    password,
  });

  return user;
};

export const login = async (
  email: string,
  password: string
) => {
  const normalizedEmail = (email || "").trim().toLowerCase();
  const rawInput = (email || "").trim();

  // Try finding by normalized email, raw email, or name
  let user = await users.findOne({
    $or: [
      { email: normalizedEmail },
      { email: rawInput },
      { name: { $regex: `^${rawInput}$`, $options: "i" } },
    ],
  });

  const envAdminEmail = (process.env.ADMIN_EMAIL || "admin@gmail.com").trim().toLowerCase();
  const envAdminPassword = process.env.ADMIN_PASSWORD || "Admin@123";

  // If user doesn't exist, check if logging in with .env admin credentials
  if (!user) {
    if (
      (normalizedEmail === envAdminEmail || rawInput.toLowerCase() === "admin") &&
      password === envAdminPassword
    ) {
      const hashedPassword = await hashPassword(envAdminPassword);
      user = await users.create({
        name: "Super Admin",
        email: envAdminEmail,
        password: hashedPassword,
        role: "admin",
        emailVerified: true,
        isActive: true,
      });
      return user;
    }
    throw new Error("Invalid email or password");
  }

  // If this is the admin user and password matches .env ADMIN_PASSWORD, sync it
  if (
    user.email === envAdminEmail &&
    password === envAdminPassword
  ) {
    const isCurrentMatch = await comparePassword(password, user.password);
    if (!isCurrentMatch) {
      user.password = await hashPassword(envAdminPassword);
      user.isActive = true;
      user.emailVerified = true;
      await user.save();
    }
    return user;
  }

  const matched = await comparePassword(
    password,
    user.password
  );

  if (!matched) {
    throw new Error("Invalid email or password");
  }

  if (user.isActive === false) {
    throw new Error("Account has been deactivated. Please contact administrator.");
  }

  return user;
};