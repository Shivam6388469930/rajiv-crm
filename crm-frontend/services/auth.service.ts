
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
  const user = await users.findOne({
    email,
  });

  if (!user) {
    throw new Error("Invalid Credentials");
  }

  const matched = await comparePassword(
    password,
    user.password
  );

  if (!matched) {
    throw new Error("Invalid Credentials");
  }

  return user;
};