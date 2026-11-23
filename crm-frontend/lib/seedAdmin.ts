import bcrypt from "bcrypt";
import User from "@/models/users";

export default async function seedAdmin() {
  try {
    const adminEmail = (process.env.ADMIN_EMAIL || "admin@gmail.com").trim().toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || "Admin@123";

    let admin = await User.findOne({
      $or: [
        { email: adminEmail },
        { email: { $regex: `^${adminEmail}$`, $options: "i" } },
      ],
    });

    if (admin) {
      // Ensure password in database is in sync with ADMIN_PASSWORD from .env
      const matches = await bcrypt.compare(adminPassword, admin.password);
      if (!matches) {
        admin.password = await bcrypt.hash(adminPassword, 10);
        admin.isActive = true;
        admin.emailVerified = true;
        admin.role = "admin";
        await admin.save();
        console.log("✅ Admin password synced with ADMIN_PASSWORD in .env");
      } else {
        console.log("✅ Admin verified and ready");
      }
      return;
    }

    const password = await bcrypt.hash(adminPassword, 10);

    await User.create({
      name: "Super Admin",
      email: adminEmail,
      password,
      role: "admin",
      emailVerified: true,
      isActive: true,
    });

    console.log("✅ Admin created successfully:", adminEmail);
  } catch (error) {
    console.error("❌ Seed Admin Error:", error);
  }
}
