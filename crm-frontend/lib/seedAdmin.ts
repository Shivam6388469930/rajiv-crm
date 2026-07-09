import bcrypt from "bcrypt";
import User from "@/models/users";

export default async function seedAdmin() {
  try {
    const admin = await User.findOne({
      email: process.env.ADMIN_EMAIL,
    });

    if (admin) {
      console.log("✅ Admin already exists");
      return;
    }

    const password = await bcrypt.hash(
      process.env.ADMIN_PASSWORD!,
      10
    );

    await User.create({
      name: "Super Admin",
      email: process.env.ADMIN_EMAIL,
      password,
      role: "admin",
      emailVerified: true,
      isActive: true,
    });

    console.log("✅ Admin created successfully");
  } catch (error) {
    console.error("❌ Seed Admin Error:", error);
  }
}