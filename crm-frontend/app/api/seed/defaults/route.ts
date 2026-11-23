// app/api/seed/defaults/route.ts
import { NextRequest } from "next/server";
import { seedDefaultData } from "@/lib/seedDefaults";
import { success, error } from "@/utils/sendResponse";

export async function POST(req: NextRequest) {
  try {
    const results = await seedDefaultData();
    return success("Default master data seeded successfully", results);
  } catch (err: any) {
    return error(err.message || "Failed to seed default data", 500);
  }
}

export async function GET(req: NextRequest) {
  try {
    const results = await seedDefaultData();
    return success("Default master data seeded successfully", results);
  } catch (err: any) {
    return error(err.message || "Failed to seed default data", 500);
  }
}
