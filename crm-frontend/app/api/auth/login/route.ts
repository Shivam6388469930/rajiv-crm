import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { login } from "@/services/auth.service";
import { createTokens } from "@/services/token.service";
import { success, error } from "@/utils/sendResponse";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { email, password } = await req.json();

    if (!email || !password) {
      return error("Email and password are required", 400);
    }

    const user = await login(email, password);

    const tokens = createTokens(user._id.toString());

    const userObj = user.toObject ? user.toObject() : { ...user };
    delete userObj.password;

    const res = success("Login successful", {
      user: userObj,
      ...tokens,
    });

    // Set authorization cookies for SSR/Middleware & Client
    res.cookies.set("token", tokens.accessToken, {
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "lax",
    });
    res.cookies.set("isLoggedIn", "1", {
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "lax",
    });
    res.cookies.set("userRole", user.role || "customer", {
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "lax",
    });

    return res;
  } catch (err: any) {
    return error(err.message || "Invalid email or password", 401);
  }
}
