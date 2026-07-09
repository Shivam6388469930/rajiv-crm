import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

import connectDB from "@/lib/db";
import users from "@/models/users";


export async function GET() {
  try {
    await connectDB();

    const existingAdmin = await users.findOne({
      email: process.env.ADMIN_EMAIL,
    });

    if (existingAdmin) {
      return NextResponse.json({
        success: true,
        message: "Admin already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(
      process.env.ADMIN_PASSWORD!,
      10
    );

    const admin = await users.create({
      name: "Super Admin",
      email: process.env.ADMIN_EMAIL,
      password: hashedPassword,
      role: "admin",
      emailVerified: true,
      isActive: true,
    });

    return NextResponse.json({
      success: true,
      message: "Admin created successfully",
      admin,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}