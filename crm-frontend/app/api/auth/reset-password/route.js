import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { hashPassword } from "@/utils/hash";
import { success } from "@/utils/sendResponse";

export async function POST(req: NextRequest) {
  await connectDB();

  const { email, password } = await req.json();

  const hashedPassword = await hashPassword(password);

  await User.updateOne(
    { email },
    {
      password: hashedPassword,
    }
  );

  return success("Password updated");
}